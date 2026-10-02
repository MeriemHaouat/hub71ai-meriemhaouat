import type { BrainResult, Turn } from "./types";
import { runBrain as runOpenAI } from "./openai";
import { runBrain as runClaude } from "./anthropic";

// Which model powers Rafiki. Default: OpenAI (it's an OpenAI-hosted hackathon).
// Set LLM_PROVIDER=claude in the environment to switch to Claude instantly.
const PROVIDER = (process.env.LLM_PROVIDER || "openai").toLowerCase();

export const activeProvider =
  PROVIDER === "claude" || PROVIDER === "anthropic" ? "claude" : "openai";

export async function runBrain(
  message: string,
  history: Turn[] = [],
  extraContext = "",
): Promise<BrainResult> {
  return activeProvider === "claude"
    ? runClaude(message, history, extraContext)
    : runOpenAI(message, history, extraContext);
}
