import type { Extracted } from "./types";
import { extractReport as extractOpenAI } from "./openai";
import { extractReport as extractClaude } from "./anthropic";

// Which model powers Rafiki. Default: OpenAI (it's an OpenAI-hosted hackathon).
// Set LLM_PROVIDER=claude in the environment to switch to Claude instantly.
const PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();

export const activeProvider =
  PROVIDER === "claude" || PROVIDER === "anthropic" ? "claude" : "openai";

export async function extractReport(message: string): Promise<Extracted> {
  return activeProvider === "claude"
    ? extractClaude(message)
    : extractOpenAI(message);
}
