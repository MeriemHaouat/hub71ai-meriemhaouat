import OpenAI from "openai";
import {
  SYSTEM,
  ANSWER_PARAMS,
  LISTING_PARAMS,
  ANSWER_DESC,
  LISTING_DESC,
  normalizeListing,
} from "./brain";
import type { BrainResult, Turn } from "./types";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function runBrain(message: string, history: Turn[] = []): Promise<BrainResult> {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ],
    tools: [
      { type: "function", function: { name: "answer", description: ANSWER_DESC, parameters: ANSWER_PARAMS as any } },
      { type: "function", function: { name: "save_listing", description: LISTING_DESC, parameters: LISTING_PARAMS as any } },
    ],
    tool_choice: "auto",
  });

  const msg = res.choices[0]?.message;
  const call = msg?.tool_calls?.find((c) => c.type === "function");
  if (call && call.type === "function") {
    const args = JSON.parse(call.function.arguments || "{}");
    if (call.function.name === "save_listing") {
      const listing = normalizeListing(args, message);
      return { kind: "listing", reply: listing.reply, listing };
    }
    return { kind: "answer", reply: (args.reply || "").trim() || defaultReply() };
  }
  return { kind: "answer", reply: (msg?.content || "").trim() || defaultReply() };
}

function defaultReply(): string {
  return "I'm Rafiki — ask me anything about settling in Abu Dhabi, or share a tip for the community. 🙂";
}
