import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { RATE_LIMITS, RESUME, SERVICES, ACTIVE_MODELS } from "@/lib/config";
import { RoastResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const rl = await checkRateLimit(ip, "roast", RATE_LIMITS.roast.limit, RATE_LIMITS.roast.windowSecs);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many roasts. Slow down and try again in an hour." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const resumeText: unknown = body?.resumeText;

    if (typeof resumeText !== "string" || resumeText.trim().length < RESUME.minChars) {
      return NextResponse.json(
        { error: "Resume text is too short to roast." },
        { status: 400 }
      );
    }
    if (resumeText.length > RESUME.maxChars) {
      return NextResponse.json(
        { error: "Resume text is too long. Please trim it below 50,000 characters." },
        { status: 400 }
      );
    }

    const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);

    const prompt = `You are a brutally honest senior hiring manager who has reviewed 10,000+ resumes. You are reviewing the specific resume below.

SCORING RUBRIC — use this to assign overallScore (1–10):
1–2: Disqualified on sight. Vague, no metrics, generic filler throughout.
3–4: Below average. A few specific points but mostly weak bullets, no impact.
5–6: Average. Passes ATS but won't stand out. Some metrics, but inconsistent.
7–8: Above average. Clear impact, good structure, minor gaps.
9–10: Excellent. Every bullet is specific, quantified, and compelling.

RULES — you MUST follow these or the output is wrong:
1. Read the resume carefully. Every critique must reference SPECIFIC content from THIS resume — quote a weak bullet, call out a missing metric, name the actual section that is weak.
2. Do NOT write generic advice like "use action verbs" unless you quote an actual bullet from the resume that lacks them and show how to fix it.
3. The overallScore must accurately reflect the quality of THIS resume — not a default 4 or 5. A strong resume should score 7–9. A weak one 2–4. Score what you actually see.
4. Critique 6 distinct issues — do NOT repeat the same theme twice (e.g., don't have two critiques about "no metrics").
5. Each fix must be CONCRETE and specific to this resume — e.g. "Change 'Worked on backend' to 'Engineered REST API handling 50K req/day'".
6. The critique and fix fields must feel personal to this candidate, not copy-paste advice.

Provide exactly 6 critique points and an overall score.
Each critique point must have:
- emoji: a single emoji that matches the issue
- title: a short punchy title (max 6 words)
- critique: 2–3 sentences that quote or reference something SPECIFIC from this resume
- fix: one concrete sentence showing the exact change to make

Return ONLY valid JSON — no markdown, no extra text:
{
  "roast": [
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" },
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" },
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" },
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" },
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" },
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" }
  ],
  "overallScore": <number between 1 and 10>
}

Resume to roast:
<resume>
${resumeForAI}
</resume>`;

    const content = await callAI({
      model: ACTIVE_MODELS.roast,
      systemPrompt: "You are the Resume Roaster AI. You only speak in JSON.",
      userPrompt: prompt,
      maxTokens: SERVICES.roast.maxTokens,
    });

    // Strip markdown code fences if the model wraps response in ```json ... ```
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const raw = (fenceMatch ? fenceMatch[1] : content).trim();

    let roastData: RoastResponse;
    try {
      roastData = JSON.parse(raw);
    } catch {
      console.error("Roast API: AI returned invalid JSON:", raw);
      return NextResponse.json(
        { error: "The roaster returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(roastData, {
      headers: rateLimitHeaders(rl),
    });
  } catch (error) {
    console.error("Roast API Error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `The roaster had a meltdown: ${message}` },
      { status: 500 }
    );
  }
}
