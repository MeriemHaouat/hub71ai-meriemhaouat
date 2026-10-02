import Anthropic from "@anthropic-ai/sdk";
import {
  SYSTEM,
  ANSWER_PARAMS,
  LISTING_PARAMS,
  ANSWER_DESC,
  LISTING_DESC,
  normalizeListing,
} from "./brain";
import type { BrainResult, Turn } from "./types";

// Default to Opus 4.8. Set ANTHROPIC_MODEL=claude-haiku-4-5 for faster replies.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export async function runBrain(message: string, history: Turn[] = []): Promise<BrainResult> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    tools: [
      { name: "answer", description: ANSWER_DESC, input_schema: ANSWER_PARAMS as any },
      { name: "save_listing", description: LISTING_DESC, input_schema: LISTING_PARAMS as any },
    ],
    tool_choice: { type: "auto" },
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (block && block.type === "tool_use") {
    const args = block.input as any;
    if (block.name === "save_listing") {
      const listing = normalizeListing(args, message);
      return { kind: "listing", reply: listing.reply, listing };
    }
    return { kind: "answer", reply: (args?.reply || "").trim() || defaultReply() };
  }

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as any).text)
    .join(" ")
    .trim();
  return { kind: "answer", reply: text || defaultReply() };
}

function defaultReply(): string {
  return "I'm Rafiki — ask me anything about settling in Abu Dhabi, or share a tip for the community. 🙂";
}
