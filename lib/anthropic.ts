import Anthropic from "@anthropic-ai/sdk";
import { REPORT_TYPES, type Extracted, type ReportType } from "./types";

// Default to Opus 4.8. For faster / cheaper WhatsApp replies on the day,
// set ANTHROPIC_MODEL=claude-haiku-4-5 in the environment.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    // Reads ANTHROPIC_API_KEY from the environment.
    client = new Anthropic();
  }
  return client;
}

const SYSTEM = `You are Rafiki (رفيقي), a warm, concise companion for people new to Abu Dhabi.
People message you tips, questions, and reports. For every incoming message, call the
save_report tool exactly once.

- Classify the message into one type: scam, rent, landlord, clinic, or other.
- "area" = the Abu Dhabi neighbourhood it refers to (e.g. "Al Reem Island", "Khalifa City").
  If none is given, use "Abu Dhabi".
- "detail" = a short, clean one-sentence summary of the useful info (strip filler).
- If you know approximate coordinates for the area, set lat/lng; otherwise omit them.
- "reply" = a friendly WhatsApp reply (1-2 sentences) confirming you've added it to the
  community map and, if helpful, a quick tip. Reply in the SAME language the user wrote in
  (Arabic, English, Hindi, Urdu...).`;

export async function extractReport(message: string): Promise<Extracted> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    tools: [
      {
        name: "save_report",
        description: "Save a community tip/report to the Abu Dhabi map and reply to the user.",
        input_schema: {
          type: "object",
          properties: {
            type: { type: "string", enum: REPORT_TYPES },
            area: { type: "string", description: "Abu Dhabi neighbourhood" },
            detail: { type: "string", description: "Short one-sentence summary" },
            lat: { type: "number", description: "Approx latitude, optional" },
            lng: { type: "number", description: "Approx longitude, optional" },
            reply: { type: "string", description: "Friendly reply to send on WhatsApp" },
          },
          required: ["type", "area", "detail", "reply"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "save_report" },
    messages: [{ role: "user", content: message }],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") {
    throw new Error("Claude did not return a save_report tool call");
  }
  const args = block.input as Partial<Extracted>;

  const type: ReportType = REPORT_TYPES.includes(args.type as ReportType)
    ? (args.type as ReportType)
    : "other";

  return {
    type,
    area: args.area?.trim() || "Abu Dhabi",
    detail: args.detail?.trim() || message.trim(),
    lat: typeof args.lat === "number" ? args.lat : undefined,
    lng: typeof args.lng === "number" ? args.lng : undefined,
    reply: args.reply?.trim() || "Thanks — I've added that to the community map. 🙏",
  };
}
