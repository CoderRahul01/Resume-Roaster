import { getAnthropicClient } from "@/lib/anthropic";
import { AI_MODEL, SERVICES, RESUME } from "@/lib/config";
import { RewriteResponse } from "@/types";
import { REWRITE_SYSTEM_PROMPT, rewriteUserPrompt } from "./prompts";
import { safeJsonParse } from "./parse";

export async function generateRewrite(resumeText: string): Promise<RewriteResponse> {
  const resumeForAI = resumeText.slice(0, RESUME.aiMaxChars);
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: SERVICES.rewrite.maxTokens,
    system: REWRITE_SYSTEM_PROMPT,
    messages: [{ role: "user", content: rewriteUserPrompt(resumeForAI) }],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";
  return safeJsonParse<RewriteResponse>(content, "Rewrite API");
}
