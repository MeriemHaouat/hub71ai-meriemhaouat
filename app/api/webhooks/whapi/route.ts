import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/reports";
import { parseInbound, sendWhatsApp, verifyWhapiSignature } from "@/lib/whapi";
import { transcribeVoice } from "@/lib/transcribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Setup/verification ping (and a quick manual health check).
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("challenge");
  if (challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ ok: true, service: "rafiki whapi webhook" });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  const signature =
    req.headers.get("x-whapi-signature") ||
    req.headers.get("x-hub-signature-256") ||
    req.headers.get("x-signature");

  if (!verifyWhapiSignature(raw, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const inbound = parseInbound(payload);

  // Process sequentially; reply to each sender. Keep errors from killing the
  // whole batch — webhooks should return 200 so WHAPI doesn't retry-storm.
  for (const msg of inbound) {
    try {
      let text = msg.text;
      if (!text && msg.audio) {
        try {
          text = await transcribeVoice(msg.audio);
        } catch (e) {
          console.error("[whapi] transcription failed:", e);
          await sendWhatsApp(
            msg.chatId,
            "Sorry, I couldn't quite catch that voice note — could you resend it or type it out? 🙏",
          ).catch(() => {});
          continue;
        }
      }
      if (!text) continue;
      const { reply } = await handleMessage(text, "whatsapp", msg.chatId);
      await sendWhatsApp(msg.chatId, reply);
    } catch (err) {
      console.error("[whapi] failed to process message:", err);
      await sendWhatsApp(
        msg.chatId,
        "Sorry — Rafiki had a hiccup saving that. Try again in a moment. 🙏",
      ).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, processed: inbound.length });
}
