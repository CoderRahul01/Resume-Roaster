import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/ratelimit";
import { AI_MODEL, RATE_LIMITS, RESUME } from "@/lib/config";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const schema = z.object({
  resumeText: z
    .string({ required_error: "Resume text is required" })
    .min(RESUME.minChars, "Resume is too short. Paste at least a few sentences.")
    .max(RESUME.maxChars, "Resume is too long."),
});

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(getIP(req), "roast", RATE_LIMITS.roast.limit, RATE_LIMITS.roast.windowSecs);
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
  const truncated = resumeText.slice(0, RESUME.aiMaxChars);

  const message = await getAnthropicClient().messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system:
      "You are a brutally honest senior hiring manager at a Fortune 500 company with 20 years of experience. You've seen thousands of bad resumes. Be direct, specific, and harsh but constructive. Never sugarcoat.",
    messages: [
      {
        role: "user",
        content: `Roast this resume. Give exactly 6 criticisms. Format each as JSON. Return ONLY valid JSON — no markdown fences, no explanation text.

Format:
{
  "roast": [
    { "emoji": "🔥", "title": "Short punchy title", "critique": "2-3 sentence brutal critique" }
  ],
  "overallScore": 3
}

overallScore is 1-10 where 1 = complete disaster, 10 = perfect. Most resumes score 3-6.

Resume:
<resume>
${truncated}
</resume>`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected AI response" }, { status: 500 });
  }

  const cleaned = content.text.replace(/```json\n?|\n?```/g, "").trim();

  try {
    const result = JSON.parse(cleaned);
    return NextResponse.json(result, { headers: rateLimitHeaders(rl) });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response. Please try again." },
      { status: 500 }
    );
  }
}
