# Rafiki (رفيقي) — your companion for Abu Dhabi

> **One-liner:** WhatsApp is how you talk to it, but what you're really joining is a
> community that makes the city easier for the next person.

Built for the **OpenAI × Hub71 one-day hackathon, Abu Dhabi**.
Theme: *make it easier to move to, settle in, and build a future in Abu Dhabi.*

Owner: Meriem · Build date: **2026-10-02** · Status: pre-build spec

---

## 1. What it is

**Rafiki** is an AI companion for people new to Abu Dhabi. You talk to it on **WhatsApp**
(where everyone in the UAE already is). Behind the chat, every tip people share feeds a
**living community map** — real rents per area, reported scam numbers, good landlords,
the nearest clinic or typing centre. It's built *by* newcomers, *for* the next newcomer.

### Hackathon scope (what we actually build in ~6.5h)
1. **WhatsApp front door** — Rafiki receives a message, Claude extracts a structured report.
2. **Living community map** — the report pops up live on a web map.

That's it. Everything below is **"what's next" in the pitch — not code for the day:**
- **Skill swap** — neighbours trade favours (CV→Arabic, how TAMM works, first licence).
- **Interest circles** — founders, runners, parents-of-toddlers, Arabic learners.
- **Bot-planned events** — when enough people in a circle are free, it proposes a meetup.
- **Employers / HR as partners** — companies pay to onboard relocating staff. **← business model.**

### The winning demo moment
On stage: text the WhatsApp number → a scam/rent report **pins itself on the projected map live.**
~30 seconds. That's the whole demo.

### Pitch arc (2 min)
one-liner → live demo → **"and here's the business" (HR/B2B, fits my background)** → one breath of "what's next".

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) on Vercel** | one repo, one deploy, instant public URL (also the webhook URL) |
| Brain | **OpenAI (default) + Claude (fallback)**, tool calling — switch via `LLM_PROVIDER` | structured extraction of reports; OpenAI for the OpenAI-hosted event, Claude reuses the funded Upfleet key |
| WhatsApp | **WHAPI** (`gate.whapi.cloud`) | no Meta Business verification; reuse existing paired account (see §4) |
| Store + realtime | **Supabase** | DB + realtime subscription = the "pin appears live" wow moment |
| Map | **Leaflet + OpenStreetMap** | free, no API key, no billing |
| UI | **Tailwind, black-on-white** | clean, non-"AI-slop" look; Arabic "رفيقي" accent |

Fallback if a piece fights us: Supabase realtime → poll a JSON endpoint every 2s (looks identical to the audience); WhatsApp → a chat box on the page simulates the input.

---

## 3. Architecture / data flow

```
You (WhatsApp)  ──▶  WHAPI  ──▶  POST /api/webhooks/whapi  (Next.js on Vercel)
                                        │  verify HMAC-SHA256 (WHAPI_WEBHOOK_SECRET)
                                        ▼
                                 Claude tool-call: extract
                                 { type: scam|rent|landlord|clinic, area, detail, lat, lng }
                                        ▼
                                 insert row  ──▶  Supabase
                                        │
                        realtime subscription ▼
                                 Map page (Leaflet)  ──▶  pin appears live
```

Send a reply back to the user with `POST https://gate.whapi.cloud/messages/text` using `WHAPI_API_TOKEN`.

---

## 4. Phone number — reuse + usage log  ⚠️

We are **reusing the existing Upfleet WHAPI account** (no new pairing needed).

- **WhatsApp line / approved test recipient:** `+971585726739`
- **Reuse via:** `WHAPI_API_TOKEN` + `WHAPI_WEBHOOK_SECRET` (copy from `demo-platform/backend/.env`)
- **Base URL:** `https://gate.whapi.cloud` · send: `POST /messages/text`

**Usage log for this number:**
- Previously used by **Upfleet demo agents** — VAPI voice calls, WHAPI sales/ops auto-reply
  (now disabled), `credit-watch`, and scheduled crons.
- **2026-10-02 onward:** borrowed for **Rafiki**, built with **Claude Code**, running on **Claude** (`claude-opus-4-8`, reusing the Upfleet `ANTHROPIC_API_KEY` — no OpenAI key existed).
- Keep test messages to yourself and `+971585726739` only (per Upfleet's rule: messaging
  strangers can get the line rate-limited/banned).
- Give **Jordy** a heads-up that the line is borrowed for the hackathon day.

---

## 5. ISOLATION — do not trigger any Upfleet agent  ⚠️⚠️

Decision: **reuse the number, but take Upfleet fully OFFLINE for the day.**

The Upfleet backend sends messages on the shared line via **cron jobs** (independent of any
webhook), several landing right in the hackathon window:

| Time | Job | Risk |
|---|---|---|
| 8:00 AM | morning briefing | WhatsApp send |
| 8:30 AM | daily outreach | **messages customers** |
| every hour | follow-ups | WhatsApp/email |
| every 30 min | reply reminders | WhatsApp |
| 6:00 PM | daily summary | WhatsApp |

(Inbound auto-reply is already disabled in `whapi.ts`, so incoming texts are safe. The crons are the risk.)

### Pre-hackathon checklist (do the night before)
- [ ] **Pause the Upfleet backend on Railway** (the deploy that runs `initializeCrons()`).
      Confirm it is **not** running — no 8:00/8:30 AM sends.
- [ ] Confirm **no local** Upfleet backend is running (`pkill -f "demo-platform"` / check terminals).
- [ ] In the **whapi.cloud dashboard**, repoint the **webhook URL** → Rafiki's Vercel URL
      (`https://<rafiki>.vercel.app/api/webhooks/whapi`). Only one webhook per channel, so this
      also stops the old backend from receiving inbound.
- [ ] Send yourself one test message → confirm Rafiki (not Upfleet) handles it.

### After the hackathon (restore Upfleet)
- [ ] Repoint the whapi.cloud webhook back to the Upfleet backend URL.
- [ ] Un-pause / redeploy the Upfleet backend on Railway.

---

## 6. Environment variables

Copy values from `demo-platform/backend/.env` where noted. See `.env.example`.

```
# WhatsApp (reuse Upfleet WHAPI account — copy from demo-platform/backend/.env)
WHAPI_API_TOKEN=
WHAPI_WEBHOOK_SECRET=
WHAPI_BASE_URL=https://gate.whapi.cloud

# Claude / Anthropic (reuse the key from demo-platform/.env)
ANTHROPIC_API_KEY=
# optional: default claude-opus-4-8; set claude-haiku-4-5 for faster replies
# ANTHROPIC_MODEL=claude-opus-4-8

# Supabase (new project for Rafiki — do NOT reuse Upfleet's)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> Use a **fresh Supabase project** for Rafiki — never point at Upfleet's DB.

---

## 7. Build timeline (~5.75 real hours)

| Time | Do |
|---|---|
| 9:15–9:45 | scaffold + **deploy "hello world" to Vercel immediately** (prove deploy early) |
| 9:45–10:45 | WHAPI receiving + echoing a message — **risk gate** |
| 10:45–11:30 | Claude extracts structured report → write to Supabase |
| 11:30–12:00 / 12:45–1:30 | map reads store + drops pins |
| 1:30–2:15 | realtime live-update wiring (the wow moment) |
| 2:15–3:00 | seed demo data, black-on-white polish, "رفيقي" accent |
| 3:00–3:45 | **stop coding — rehearse the 2-min demo + pitch** |

**Abort criteria:** if WHAPI isn't receiving by ~10:45, flip to web-first — a chat box on the
page simulates the WhatsApp input, same map, same demo. Never end with nothing to show.

---

## 8. Demo script (2 min)

1. "This is Rafiki — رفيقي, your companion. New to Abu Dhabi? You just text it." *(show WhatsApp)*
2. Text: *"Scam number +9715... pretending to be the bank, in Al Reem."*
3. *(map on screen)* "Every report the community shares pins itself here, live." → **pin appears**
4. "Rent people actually paid, trusted landlords, nearest clinic — built by newcomers, for the next one."
5. **Business:** "Consumers free. Companies pay to onboard relocating staff — HR sees who's stuck where. That's the model, and it's my B2B background."
6. "Today it's a map. Next: skill-swap, interest circles, bot-planned meetups."

---

## 9. Shareable for judges (test on their end)

This repo is **standalone** (not under any Upfleet repo) so judges can run it independently.
- `README.md` — clone → `npm install` → add `.env` → `npm run dev` / deploy to Vercel.
- `.env.example` — every var they need (no secrets committed).
- `.gitignore` — keeps `.env*` out of git.
- Live URL + the WhatsApp number so they can try it from their own phone.
