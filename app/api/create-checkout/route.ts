import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient } from "@/lib/stripe";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const schema = z.object({
  resumeText: z
    .string({ required_error: "Resume text is required" })
    .min(100, "Resume is too short.")
    .max(50000, "Resume is too long."),
});

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(getIP(req), "checkout", 10, 3600);
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

  const { resumeText } = parsed.data;

  // Stripe metadata values are capped at 500 chars each, 50 keys max.
  // Encode resume as base64 and chunk across multiple metadata keys.
  const base64Resume = Buffer.from(resumeText).toString("base64");
  const chunkSize = 490;
  const chunks: Record<string, string> = {};

  for (let i = 0; i * chunkSize < base64Resume.length; i++) {
    chunks[`resume_${i}`] = base64Resume.slice(i * chunkSize, (i + 1) * chunkSize);
  }
  const numChunks = Math.ceil(base64Resume.length / chunkSize);
  chunks["resume_chunks"] = String(numChunks);

  // 50 keys max = ~24KB base64 = ~18KB plain text, covers all practical resumes
  if (numChunks > 48) {
    return NextResponse.json(
      { error: "Resume is too long. Please trim it down." },
      { status: 400 }
    );
  }

  const session = await getStripeClient().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "AI Resume Rewrite",
            description: "Professional, ATS-optimized rewrite of your resume by Claude AI",
          },
          unit_amount: 499,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/results`,
    metadata: chunks,
  });

  return NextResponse.json({ url: session.url }, { headers: rateLimitHeaders(rl) });
}
