import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { createHmac } from "crypto";
import { RATE_LIMITS, RESUME, SERVICES, ACTIVE_MODELS } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const rl = await checkRateLimit(ip, "coverLetter", RATE_LIMITS.coverLetter.limit, RATE_LIMITS.coverLetter.windowSecs);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};
    const resumeText: unknown = body?.resumeText;
    const jobDescription: unknown = body?.jobDescription;

    if (typeof resumeText !== "string" || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }
    if (typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
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
    const jdForAI = jobDescription.slice(0, 3000);

    const prompt = `You are an expert cover letter writer. Write a professional, compelling cover letter based on the resume and job description below.

Rules:
1. Open with a strong hook that shows genuine enthusiasm for the specific role.
2. Highlight 2–3 of the candidate's strongest achievements from the resume that are most relevant to the job.
3. Show knowledge of what the company/role requires by reflecting language from the job description.
4. Keep it to 3–4 paragraphs, under 350 words.
5. End with a confident call to action.
6. Use a professional but warm tone — not robotic, not overly casual.
7. Do NOT use generic filler phrases like "I am writing to apply for..." or "I believe I am a strong candidate".
8. Return ONLY the cover letter text. No subject line, no date, no address headers.

<resume>
${resumeForAI}
</resume>

<job_description>
${jdForAI}
</job_description>`;

    const coverLetter = await callAI({
      model: ACTIVE_MODELS.coverLetter,
      systemPrompt: "You are an expert cover letter writer. You write concise, impactful cover letters that get interviews.",
      userPrompt: prompt,
      maxTokens: SERVICES.coverLetter.maxTokens,
    });

    return NextResponse.json(
      { coverLetter: coverLetter.trim() },
      { headers: rateLimitHeaders(rl) }
    );
  } catch (error) {
    console.error("Cover Letter API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Cover letter generation failed: ${message}` },
      { status: 500 }
    );
  }
}
