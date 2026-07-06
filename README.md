# VoiceGuard — Frontend

Real-time scam-call and AI-voice-spoofing detector. Animated dark marketing/live
surfaces + a light in-app preview inside a phone mockup, bilingual (TH|EN), all
running on a mocked data layer behind a real service interface.

## Stack

React + TypeScript (Vite) · Tailwind CSS · React Router · TanStack Query ·
react-hook-form · Framer Motion · Lenis · Recharts

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## LIVE vs PREVIEW

Every surface visibly distinguishes what's real (Web App detector + API) from
what's simulated (the phone app), via a persistent `StatusBadge`/PREVIEW marker.

## Docs

See `product.md`, `design.md`, `frontend-feature.md`, and `voiceguard-spec.md`
for the full product/visual/behavior specs.
