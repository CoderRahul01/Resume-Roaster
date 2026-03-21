/**
 * Unified AI client — routes to NVIDIA NIM (free) or Anthropic Claude based on AI_PROVIDER in config.
 * To switch providers, change the ONE line in lib/config.ts:
 *   export const AI_PROVIDER: "nvidia" | "claude" = "nvidia";
 */

import { AI_PROVIDER } from "./config";

export interface AICallParams {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
}

/**
 * Call the active AI provider and return the raw text response.
 * Throws if the API key is missing or the request fails.
 */
export async function callAI(params: AICallParams): Promise<string> {
  if (AI_PROVIDER === "nvidia") {
    return callNvidiaNim(params);
  }
  return callClaude(params);
}

// ── NVIDIA NIM (OpenAI-compatible) ───────────────────────────────────────────

async function callNvidiaNim({
  model,
  systemPrompt,
  userPrompt,
  maxTokens,
}: AICallParams): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY is not set");

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`NVIDIA NIM API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ── Anthropic Claude ─────────────────────────────────────────────────────────

async function callClaude({
  model,
  systemPrompt,
  userPrompt,
  maxTokens,
}: AICallParams): Promise<string> {
  const { getAnthropicClient } = await import("./anthropic");
  const anthropic = getAnthropicClient();

  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return message.content[0]?.type === "text" ? message.content[0].text : "";
}
