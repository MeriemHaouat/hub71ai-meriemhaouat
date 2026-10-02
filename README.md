# Rafiki (رفيقي)

Your companion for moving to, settling in, and building a future in Abu Dhabi.
You talk to it on **WhatsApp**; every tip the community shares feeds a **living map** of
real rents, reported scams, trusted landlords, and the nearest clinic — built by newcomers,
for the next newcomer.

Built for the **OpenAI × Hub71 hackathon, Abu Dhabi** (2026-10-02).
Full spec, build plan, and demo script: **[`rafiki.md`](./rafiki.md)**.

## Try it
- **WhatsApp:** message `+971585726739`
- **Live map:** `https://<rafiki>.vercel.app` *(fill in after deploy)*

## Run it yourself
```bash
git clone <this-repo>
cd rafiki
npm install
cp .env.example .env.local   # then fill in the values (see .env.example)
npm run dev
```
Deploy: push to GitHub → import into **Vercel** → add the same env vars → set the
WHAPI webhook to `https://<your-deploy>.vercel.app/api/webhooks/whapi`.

## Stack
Next.js (Vercel) · Claude (Anthropic, tool calling) · WHAPI (WhatsApp) · Supabase (store + realtime) · Leaflet + OpenStreetMap.

## Status
Pre-build scaffold. Hackathon scope = WhatsApp report → live community map pin.
"What's next": skill-swap, interest circles, bot-planned events, and an HR/B2B onboarding model.
