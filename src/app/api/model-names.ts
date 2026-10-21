// ABOUTME: Identifiers for the LLMs the API routes can use.
// ABOUTME: ModelName values are mapped to provider models in models.ts.
export const ModelName = {
  CLAUDE_3_5_HAIKU: "claude-3-5-haiku",
  CLAUDE_3_7_SONNET: "claude-3-7-sonnet",
  CLAUDE_4_SONNET: "claude-4-sonnet",
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
  GEMINI_2_5_PRO: "gemini-2.5-pro",
  GPT_4_1: "gpt-4.1"
} as const;

export type ModelNameType = (typeof ModelName)[keyof typeof ModelName];
