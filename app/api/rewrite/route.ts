import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient } from "@/lib/stripe";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const schema = z.object({
  sessionId: z
    .string({ required_error: "Session ID is required" })
    .startsWith("cs_", "Invalid session ID format"),
});

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(getIP(req), "rewrite", 20, 3600);
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

  const { sessionId } = parsed.data;

  // Verify Stripe payment
  const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  // Reconstruct resume from chunked metadata
  const numChunks = parseInt(session.metadata?.resume_chunks ?? "0");
  if (numChunks === 0 || numChunks > 48) {
    return NextResponse.json(
      { error: "Resume data not found in session" },
      { status: 400 }
    );
  }

  let base64Resume = "";
  for (let i = 0; i < numChunks; i++) {
    base64Resume += session.metadata?.[`resume_${i}`] ?? "";
  }
  const resumeText = Buffer.from(base64Resume, "base64").toString("utf-8");

  const message = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
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
${resumeText}
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
