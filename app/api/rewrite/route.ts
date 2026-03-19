import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { AI_MODEL, RATE_LIMITS, RESUME, SERVICES } from "@/lib/config";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const schema = z.object({
  razorpay_payment_id: z.string().min(1, "Missing payment ID"),
  razorpay_order_id: z.string().startsWith("order_", "Invalid order ID"),
  razorpay_signature: z.string().length(64, "Invalid payment signature"),
  resumeText: z
    .string({ required_error: "Resume text is required" })
    .min(RESUME.minChars, "Resume is too short.")
    .max(RESUME.maxChars, "Resume is too long."),
});

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(getIP(req), "rewrite", RATE_LIMITS.rewrite.limit, RATE_LIMITS.rewrite.windowSecs);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, resumeText } = parsed.data;

  // Verify Razorpay payment signature
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET is not set");

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const message = await getAnthropicClient().messages.create({
    model: AI_MODEL,
    max_tokens: SERVICES.rewrite.maxTokens,
    system:
      "You are an expert resume writer who has helped candidates land jobs at Google, Apple, and top startups. You write resumes that are ATS-optimized, achievement-focused, and compelling.",
    messages: [
      {
        role: "user",
        content: `Completely rewrite this resume. Rules:
- Use strong action verbs throughout
- Quantify achievements where possible (add reasonable estimates if numbers are missing)
- Remove filler words and weak language like "responsible for" or "helped with"
- Optimize for ATS keyword scanning
- Improve every section: Summary, Experience, Skills, Education
- Keep the same work history but dramatically improve how it's presented

Return ONLY the rewritten resume text. No explanations, no commentary.

Original resume:
<resume>
${resumeText.slice(0, RESUME.aiMaxChars)}
</resume>`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
  }

  return NextResponse.json(
    { rewrittenResume: content.text },
    { headers: rateLimitHeaders(rl) }
  );
}
