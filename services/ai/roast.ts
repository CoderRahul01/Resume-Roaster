import { getAnthropicClient } from "@/lib/anthropic";
import { AI_MODEL, SERVICES, RESUME } from "@/lib/config";
import { RoastResponse } from "@/types";
import { ROAST_SYSTEM_PROMPT, roastUserPrompt } from "./prompts";
import { safeJsonParse } from "./parse";

export async function generateRoast(resumeText: string): Promise<RoastResponse> {
  const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: SERVICES.roast.maxTokens,
    system: ROAST_SYSTEM_PROMPT,
    messages: [{ role: "user", content: roastUserPrompt(resumeForAI) }],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";
  return safeJsonParse<RoastResponse>(content, "Roast API");
}
