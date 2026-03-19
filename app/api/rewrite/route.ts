import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { createHmac } from "crypto";
import { RATE_LIMITS, RESUME, SERVICES, AI_MODEL } from "@/lib/config";
import { RewriteResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const rl = await checkRateLimit(ip, "rewrite", RATE_LIMITS.rewrite.limit, RATE_LIMITS.rewrite.windowSecs);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many rewrite requests. Please try again in an hour." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};
    const resumeText: unknown = body?.resumeText;

    if (
      typeof resumeText !== "string" ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Incomplete payment data." },
        { status: 400 }
      );
    }
    if (resumeText.length > RESUME.maxChars) {
      return NextResponse.json(
        { error: "Resume text is too long." },
        { status: 400 }
      );
    }

    // Verify Razorpay HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not set");

    const generated_signature = createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. If this is an error, contact support." },
        { status: 403 }
      );
    }

    // Truncate before sending to AI to control token spend
    const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);

    const anthropic = getAnthropicClient();

    const prompt = `You are a professional resume writer and ATS optimization expert.
Your goal is to rewrite the provided resume to make it professional, high-impact, and ATS-friendly.

Guidelines:
1. Preserve the original section structure (Summary, Experience, Skills, etc.).
2. Use strong action verbs (e.g., "Spearheaded", "Engineered", "Optimized").
3. Quantify achievements where possible (e.g., "Reduced latency by 40%", "Increased sales by ₹2M").
4. Ensure keyword density for a modern IT/Tech job market.
5. Keep the tone professional, confident, and concise.
6. Return only the rewritten text, formatted clearly with Markdown-style headings if appropriate, but keeping it as a plain text block that can be copied.

Return ONLY a JSON response in the following format:
{
  "rewrittenResume": "string"
}

Here is the original resume text:
---
${resumeForAI}
---`;

    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: SERVICES.rewrite.maxTokens,
      system: "You are the Resume Roaster AI. You only speak in JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    // Strip markdown code fences if Claude wraps response in ```json ... ```
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const raw = (fenceMatch ? fenceMatch[1] : content).trim();

    let rewriteData: RewriteResponse;
    try {
      rewriteData = JSON.parse(raw);
    } catch {
      console.error("Rewrite API: Claude returned invalid JSON:", raw);
      return NextResponse.json(
        { error: "The rewriter returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(rewriteData);
  } catch (error) {
    console.error("Rewrite API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `The rewriter had a meltdown: ${message}` },
      { status: 500 }
    );
  }
}
