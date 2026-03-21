import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { RATE_LIMITS, RESUME, SERVICES, ACTIVE_MODELS } from "@/lib/config";
import { safeErrorMessage } from "@/lib/api-error";
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

    // Truncate before sending to AI to control token spend
    const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);

    const prompt = `You are a brutal, honest, and high-standard resume reviewer. You are part of the 'Resume Roaster' service.
Your goal is to provide a 'roast' of the user's resume.
Be sharp, witty, and slightly mean, but provide actionable (though painful) truth.
Your tone should be like a Senior Engineering Manager who has seen 10,000 generic resumes and is sick of them.

Provide exactly 6 critique points and an overall score out of 10.
Each critique point must have:
- An emoji
- A short, punchy title
- A 2-3 sentence explanation of the failure (the critique)
- A one-line actionable fix (the "fix") — a specific, concrete change they can make right now

Return ONLY a JSON response in the following format:
{
  "roast": [
    { "emoji": "string", "title": "string", "critique": "string", "fix": "string" },
    ...
  ],
  "overallScore": number
}

Here is the resume text:
---
${resumeForAI}
---`;

    const content = await callAI({
      model: ACTIVE_MODELS.roast,
      systemPrompt: "You are the Resume Roaster AI. You only speak in JSON.",
      userPrompt: prompt,
      maxTokens: SERVICES.roast.maxTokens,
    });

    // Strip markdown code fences if the model wraps the response
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
    return NextResponse.json(
      { error: safeErrorMessage(error, "The roaster had a meltdown. Please try again.") },
      { status: 500 }
    );
  }
}
