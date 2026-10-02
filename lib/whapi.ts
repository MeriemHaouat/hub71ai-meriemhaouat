import crypto from "crypto";

const BASE_URL = process.env.WHAPI_BASE_URL || "https://gate.whapi.cloud";
const TOKEN = process.env.WHAPI_API_TOKEN;

export const whapiConfigured = Boolean(TOKEN);

/** Send a WhatsApp text reply via WHAPI. `to` is a chat_id or phone number. */
export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!TOKEN) {
    console.warn("[whapi] WHAPI_API_TOKEN not set — skipping send");
    return;
  }
  // Show a natural "typing…" indicator before the reply (scaled to reply length, 2-5s).
  const typing_time = Math.min(5, Math.max(2, Math.round(body.length / 60)));
  const res = await fetch(`${BASE_URL}/messages/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ to, body, typing_time }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[whapi] send failed ${res.status}: ${text}`);
  }
}

/**
 * Best-effort webhook signature check. WHAPI can be configured to sign payloads
 * with the webhook secret. If no secret or no signature header is present we
 * proceed (same posture as the Upfleet backend) so the demo never gets blocked.
 */
export function verifyWhapiSignature(rawBody: string, signature?: string | null): boolean {
  const secret = process.env.WHAPI_WEBHOOK_SECRET;
  if (!secret || !signature) return true; // nothing to verify against
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // accept with or without a "sha256=" prefix
  const got = signature.replace(/^sha256=/, "");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got));
  } catch {
    return false;
  }
}

/** Pull text + reply target out of a WHAPI webhook payload. */
export interface InboundMessage {
  chatId: string;
  text?: string;
  audio?: { id?: string; link?: string; mime?: string };
}

export function parseInbound(payload: any): InboundMessage[] {
  const messages: any[] = Array.isArray(payload?.messages) ? payload.messages : [];
  const out: InboundMessage[] = [];
  for (const m of messages) {
    if (m?.from_me) continue; // ignore our own outgoing echoes
    const chatId: string | undefined = m?.chat_id ?? m?.from;
    if (!chatId) continue;

    const text: string | undefined = m?.text?.body ?? m?.body;
    const media = m?.voice ?? m?.audio; // WhatsApp voice notes / audio
    if (text) {
      out.push({ chatId, text: text.trim() });
    } else if (media) {
      out.push({
        chatId,
        audio: { id: media.id, link: media.link, mime: media.mime_type ?? media.mime },
      });
    }
  }
  return out;
}
