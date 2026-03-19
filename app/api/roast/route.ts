import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { RoastResponse } from "@/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
    // Rate limit: 5 roasts per IP per hour
    const rl = await checkRateLimit(ip, "roast", 5, 3600);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many roasts. Slow down and try again in an hour." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const { resumeText } = await req.json();

    if (!resumeText || resumeText.length < 100) {
      return NextResponse.json(
        { error: "Resume text is too short to roast." },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();
    
    const prompt = `You are a brutal, honest, and high-standard resume reviewer. You are part of the 'Resume Roaster' service. 
Your goal is to provide a 'roast' of the user's resume.
Be sharp, witty, and slightly mean, but provide actionable (though painful) truth.
Your tone should be like a Senior Engineering Manager who has seen 10,000 generic resumes and is sick of them.

Provide exactly 6 critique points and an overall score out of 10.
Each critique point must have:
- An emoji
- A short, punchy title
- A 2-3 sentence explanation of the failure (the critique).

Return ONLY a JSON response in the following format:
{
  "roast": [
    { "emoji": "string", "title": "string", "critique": "string" },
    ...
  ],
  "overallScore": number
}

Here is the resume text:
---
${resumeText}
---`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1500,
      system: "You are the Resume Roaster AI. You only speak in JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    // Handle case where content might be an array or string
    const content = message.content[0].type === "text" ? message.content[0].text : "";
    const roastData: RoastResponse = JSON.parse(content);

    return NextResponse.json(roastData, {
      headers: rateLimitHeaders(rl),
    });
  } catch (error) {
    console.error("Roast API Error:", error);
    return NextResponse.json(
      { error: "The roaster had a meltdown. Please try again." },
      { status: 500 }
    );
  }
}
