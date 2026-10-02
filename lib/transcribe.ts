import OpenAI, { toFile } from "openai";

const WHAPI_BASE = process.env.WHAPI_BASE_URL || "https://gate.whapi.cloud";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function extFor(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "m4a";
  if (m.includes("wav")) return "wav";
  if (m.includes("webm")) return "webm";
  return "ogg"; // WhatsApp voice notes are ogg/opus
}

/**
 * Download a WhatsApp voice/audio note from WHAPI and transcribe it with Whisper.
 * Returns the transcript text.
 */
export async function transcribeVoice(a: {
  id?: string;
  link?: string;
  mime?: string;
}): Promise<string> {
  const token = process.env.WHAPI_API_TOKEN;
  const url = a.link || `${WHAPI_BASE}/media/${a.id}`;
  const resp = await fetch(url, {
    headers: a.link ? {} : { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error(`media fetch failed ${resp.status}`);

  const buf = Buffer.from(await resp.arrayBuffer());
  const mime = (a.mime || "audio/ogg").split(";")[0].trim();
  const file = await toFile(buf, `voice.${extFor(mime)}`, { type: mime });

  const tr = await getClient().audio.transcriptions.create({
    file,
    model: "whisper-1",
  });
  return (tr.text || "").trim();
}
