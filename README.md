# Rafiki (رفيقي) — your friend in Abu Dhabi

Rafiki is a **WhatsApp-first AI companion** that helps people move to, settle in, and build
a future in Abu Dhabi. You message Rafiki like a friend — by **text or voice note** — and he:

- **Guides you through the official steps** to settle in (Emirates ID, Tawtheeq tenancy,
  bank account, SIM, driving licence), grounded in official UAE / Abu Dhabi sources.
- **Connects you to a real community** of people with apartments, offices, cars and
  services to offer — by name and phone.
- **Lets you post your own offer** in seconds; it appears live on a community map.
- **Acts as your community manager**: he curates what's shared, keeps spam out with an AI
  quality gate, surfaces what's happening (events and interest circles), and introduces the
  right people to each other.
- **Replies in your language** (Arabic, English, Hindi, Urdu) and **remembers the
  conversation**.

Everything the community shares builds a living map and dataset that makes the city easier
for the next person who arrives.

## Live

- **Website:** https://rafiki-sage.vercel.app
- **WhatsApp:** message **+971 58 594 6739** (or scan the QR on the site) — text or voice note

## How it works

- **WhatsApp (WHAPI)** ⇄ a **Next.js** webhook on **Vercel**
- **OpenAI** — GPT for understanding, intent routing and tool-calling; **Whisper** for voice notes
- **Supabase** (Postgres + realtime) for the community data and conversation memory
- **Leaflet + OpenStreetMap** for the live map (bounded to the UAE)

## What makes it different

- **Not a chat box** — a WhatsApp concierge + a live community map + offers + interest communities.
- A **unique, community-built dataset** of real offers and tips, with contacts.
- **AI does real work**: intent routing, grounded answers, a quality/spam gate, matching
  people to offers, and voice transcription.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys (see .env.example)
npm run dev
```

Built solo by **Meriem Haouat** for the **OpenAI × Hub71 hackathon, Abu Dhabi**.
