import OpenAI from "openai";
import { REPORT_TYPES, type Extracted, type ReportType } from "./types";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
  const res = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: message },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "save_report",
          description: "Save a community tip/report to the Abu Dhabi map and reply to the user.",
          parameters: {
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
            additionalProperties: false,
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "save_report" } },
  });

  const call = res.choices[0]?.message?.tool_calls?.[0];
  if (!call || call.type !== "function") {
    throw new Error("OpenAI did not return a save_report tool call");
  }
  const args = JSON.parse(call.function.arguments) as Partial<Extracted>;

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
