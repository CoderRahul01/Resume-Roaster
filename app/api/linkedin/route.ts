import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { createHmac } from "crypto";
import { RATE_LIMITS, RESUME, SERVICES, ACTIVE_MODELS } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const rl = await checkRateLimit(ip, "linkedin", RATE_LIMITS.linkedin.limit, RATE_LIMITS.linkedin.windowSecs);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};
    const resumeText: unknown = body?.resumeText;

    if (typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }
    if (resumeText.length > RESUME.maxChars) {
      return NextResponse.json({ error: "Resume text is too long." }, { status: 400 });
    }

    // Verify Razorpay HMAC-SHA256 signature
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Incomplete payment data." }, { status: 400 });
    }

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

    const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);

    const prompt = `You are a LinkedIn profile optimization expert. Based on the resume below, rewrite the key LinkedIn profile sections to maximize profile views, recruiter reach, and connection requests.

LinkedIn is NOT a resume. It is a professional networking profile. The tone should be first-person, conversational, and keyword-rich for LinkedIn's search algorithm.

Return ONLY a JSON object in this exact schema:
{
  "headline": "A punchy 120-char LinkedIn headline with title | specialty | impact",
  "summary": "A 3-paragraph About section in first person. Para 1: who you are and what you do. Para 2: 2-3 top achievements with metrics. Para 3: what you're looking for / open to. Under 300 words total.",
  "experienceBullets": [
    {
      "company": "Company Name (from most recent job)",
      "role": "Job Title",
      "bullets": [
        "LinkedIn-style bullet: achievement-first, metric-backed, under 160 chars",
        "Second bullet",
        "Third bullet"
      ]
    }
  ]
}

Rules:
1. Headline must be under 120 characters and contain the job title + 1-2 specializations.
2. Summary must be in first person ("I", "My", not "He/She/They").
3. Experience bullets must start with a strong past-tense action verb.
4. Use keywords that recruiters search for in this candidate's field.
5. Keep bullets under 160 characters each for LinkedIn's mobile preview.
6. Return ONLY the JSON — no extra text or markdown fences.

<resume>
${resumeForAI}
</resume>`;

    const content = await callAI({
      model: ACTIVE_MODELS.linkedinOptimizer,
      systemPrompt: "You are a LinkedIn profile optimization expert. You only speak in JSON.",
      userPrompt: prompt,
      maxTokens: SERVICES.linkedinOptimizer.maxTokens,
    });

    // Strip markdown fences if present
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const raw = (fenceMatch ? fenceMatch[1] : content).trim();

    let parsed: { headline: string; summary: string; experienceBullets: { company: string; role: string; bullets: string[] }[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("LinkedIn API: AI returned invalid JSON:", raw);
      return NextResponse.json(
        { error: "The optimizer returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { linkedin: parsed },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("LinkedIn API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `LinkedIn optimization failed: ${message}` },
      { status: 500 }
    );
  }
}
