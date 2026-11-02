# Who Knows You Better?

A mobile-first friendship quiz. A creator makes a quiz about themselves, shares a link, friends answer, everyone gets a score. The whole product is built around one loop:

```
creator makes quiz → shares → friend plays → friend sees score
      ↑                                             ↓
      └──── friend creates own quiz ← friend shares result
```

No accounts, no emails, no phone numbers, no real names. Friends' answers are deleted after 7 days.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui conventions · Lucide · Framer Motion (LazyMotion, quiz player only) · Zod 4 · React Hook Form · Supabase Postgres · Upstash Redis · Cloudflare Turnstile · GA4 + Consent Mode v2 · Vercel Analytics/Speed Insights · AdSense (feature-flagged off).

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local      # fill in at least SUPABASE_URL + SUPABASE_SECRET_KEY
npm run dev                     # http://localhost:3000
```

Without Supabase configured, content pages work and the API returns `503 Service not configured`.

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

---

## Folder structure

```
src/
  app/                      routes (Server Components by default)
    page.tsx                homepage (static, ISR hourly)
    create/                 create flow (static shell, client flow)
    quiz/[slug]/            friend quiz player (ISR 5 min, noindex, NO ads) + opengraph-image
    result/[id]/            result page (dynamic, answer review gated by httpOnly cookie) + opengraph-image
    dashboard/[token]/      creator's private dashboard (no-store, no-referrer, noindex)
    me/                     "My quizzes on this device" + play history
    admin/                  analytics + moderation queue (password login)
    blog/, blog/[slug]/     12 original articles (SSG)
    packs/, packs/[pack]/   question-pack landing pages (SSG)
    about, how-it-works, privacy, terms, contact, offline
    api/
      quizzes/              POST create (rate limit + Turnstile + RPC)
      quizzes/[slug]/       GET public payload (edge-cached, no answers)
      attempts/             POST submit (idempotent, server-scored in one RPC)
      reports/              POST report (auto-hides at 5 open reports)
      track/                POST first-party aggregate counters
      dashboard/            POST delete / expiry (token-authorised)
      story/                GET 1080x1920 Instagram Story image
      admin/{login,logout,moderate}
    manifest.ts, robots.ts, sitemap.ts, ads.txt/, pwa-icon/[size]/, icon.svg, apple-icon.tsx
  components/
    ui/                     Button, Card, Input, Badge, Skeleton, Progress (shadcn-style, cva)
    layout/                 header, footer, theme toggle, logo, content/article renderers
    homepage/               hero, sections, daily question
    create/                 create flow, avatar picker, Turnstile
    quiz/                   quiz player, report dialog
    results/                score reveal, share kit, result actions
    dashboard/              dashboard widgets, my-quizzes
    ads/                    <AdSlot/> server gate, client slot, AdSense loader
    analytics/              GA4, consent banner, consent-mode script, Vercel analytics
    admin/                  SVG charts, login, moderation actions
    motion/                 LazyMotion provider (features code-split)
    pwa/                    service worker registration
  config/ads.ts             ← ONE file for ad placements / A/B tests
  content/                  blog articles (typed blocks)
  data/question-bank.ts     97 questions, 7 packs, 7 templates
  data/avatars.ts           60 inline-SVG avatars (10 animals × 6 colours)
  lib/
    supabase/server.ts      service-role client (server-only)
    validations.ts          all Zod schemas
    security/               tokens, profanity/contact filter, Turnstile, admin auth, request guards
    scoring.ts              tiers, emoji grid, percentile text (display only)
    rate-limit.ts           Upstash sliding windows (+ dev fallback)
    analytics/              client track() + server counters
    quiz-data.ts            data access (public payload never includes answers)
    consent.ts, share.ts, local-store.ts, haptics.ts, og.tsx, admin-stats.ts
  proxy.ts                  sets non-identifying region cookie (eu/row) for consent
supabase/
  migrations/               schema, indexes, RLS, RPC functions, retention + pg_cron
  seed.sql                  demo quiz (dev only)
public/sw.js                service worker (offline fallback, static asset cache)
```

---

## The 8 build phases

| # | Phase | What was built |
|---|-------|----------------|
| 1 | Foundation | Next 16 + TS + Tailwind v4 tokens (#7047EB / #3984F7 / #F4F1FF / #171525), light/dark/system theme with no flash, fonts via `next/font`, security headers, PWA manifest + icons + service worker. |
| 2 | Database | Tables `quizzes`, `questions`, `attempts`, `responses`, `reports`, `daily_stats` (+ `ref_code` / `referred_by` columns for referral tracking). Indexes on every hot path. RLS on, zero policies, privileges revoked from `anon`/`authenticated`. |
| 3 | Core loop | Create flow (template → one tap per answer → nickname/avatar → publish), friend player (Start → answer → score in ≤ 2 taps), server-side scoring RPC, result page, dashboard. |
| 4 | Viral loop | Share Kit (WhatsApp, Instagram Story image, Telegram, copy, QR, Web Share), result tiers + confetti + "you beat X%", priority-ordered result CTAs, Challenge back / Make your own (prefilled fresh set), dynamic OG images, dashboard reshare nudges, `?ref=` attribution. |
| 5 | Security & abuse | 32-byte creator tokens (hash only stored), httpOnly per-attempt review keys, Zod everywhere, profanity + contact-info filter, Upstash rate limits, Turnstile, idempotent submissions, same-origin checks, Report button + auto-hide + admin queue. |
| 6 | Content & SEO | 12 original articles, 7 pack landing pages, About/How it works/Contact/Privacy/Terms, sitemap, robots, JSON-LD, canonical URLs, noindex on UGC. |
| 7 | Monetisation & analytics | Consent Mode v2 + consent banner (or Google's certified CMP), `<AdSlot/>` with config file and policy guards, ads.txt, GA4 events, first-party daily counters, admin dashboard. |
| 8 | Hardening | Lighthouse/bundle passes, SQL tests against real Postgres, headless click-through of the create flow, retention job. See "Verification" below. |

---

## Production setup

### 1. Supabase

1. Create a project (pick the region closest to your users; set the same region for Vercel functions).
2. Run the migrations in order, either with the CLI (`supabase link` then `supabase db push`) or by pasting each file from `supabase/migrations/` into the SQL editor.
3. The last migration enables **pg_cron** and schedules `run_retention_cleanup()` hourly. If your plan requires it, enable pg_cron under *Database → Extensions* first, then re-run that file.
4. Copy the **Project URL** and a **secret key** (`sb_secret_...`, under Project Settings → API Keys) into `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. The legacy `service_role` JWT also works as `SUPABASE_SERVICE_ROLE_KEY`. The publishable/anon key is not used anywhere.
5. Do **not** run `seed.sql` in production. Its dashboard token is public.

Connection pooling: the app talks to Supabase only through supabase-js (PostgREST over HTTPS), which Supabase pools. No raw Postgres connections are opened from serverless functions.

### 2. Upstash Redis (rate limiting)

Create a free Redis database and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Without it, an in-memory limiter is used, which does **not** work across serverless instances. Limits live in `src/lib/rate-limit.ts`:

| Rule | Limit |
|---|---|
| Create quiz | 8/min and 30/hour per IP |
| Submit attempt | 120/hour per IP per quiz, 400/hour per IP |
| Report | 5/hour per IP |
| Track | 240/min per IP |
| Admin login | 5 per 15 min per IP |

IPs are SHA-256 hashed before they reach Redis and are never stored in the database.

### 3. Cloudflare Turnstile

Create a widget (Managed or Invisible mode) for your domain and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`. It renders "interaction-only" on the final create step, so most people never see it.

### 4. Admin

Set `ADMIN_PASSWORD` (16+ chars) and `ADMIN_SESSION_SECRET` (32+ chars). Generate them with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`/admin` then shows a login form. Sessions are signed httpOnly cookies valid for 12 hours.

### 5. Vercel + GitHub

1. Push to GitHub, import the repo in Vercel, and add all env vars from `.env.example`.
2. Add a **custom domain** (AdSense generally does not approve `*.vercel.app`) and set `NEXT_PUBLIC_SITE_URL` to it.
3. Enable **Web Analytics** and **Speed Insights** in the Vercel project. They only load on Vercel (`process.env.VERCEL`). URLs are redacted before sending (`/dashboard/[token]`, `/result/[id]`).

### 6. Google Analytics 4

1. Create a GA4 property and a Web data stream, then set `NEXT_PUBLIC_GA_ID=G-XXXX`.
2. In the stream's **Enhanced measurement** settings, turn **off** "Page changes based on browser history events". The app sends `page_view` itself with dashboard tokens stripped; leaving it on would double-count and leak tokens.
3. Mark `quiz_published`, `quiz_completed`, `create_from_result` and `result_shared` as key events.

Custom events sent: `page_view`, `quiz_create_started`, `quiz_published`, `share_clicked` (with `channel`), `quiz_opened`, `quiz_started`, `question_answered`, `quiz_completed`, `result_shared` (with `channel`), `create_from_result`, `report_submitted`, `ad_slot_viewed` (with placement), `dashboard_opened`, `daily_question_answered`.

### 7. Google Search Console

1. Add a **Domain** property for your custom domain and verify via DNS TXT (preferred). Alternatively, use the HTML-tag method: put the token in `GOOGLE_SITE_VERIFICATION`.
2. Submit `https://YOUR_DOMAIN/sitemap.xml`.
3. Check *Pages*: `/quiz/*`, `/result/*`, `/dashboard/*` are intentionally excluded (noindex or disallowed).

### 8. Ads (Adsterra by default; AdSense optional)

Ads are **OFF** until you set `NEXT_PUBLIC_ADS_ENABLED=true`. While off, no ad code ships at all.

**Adsterra setup**
1. In Adsterra: *Websites → Add website* with your live domain, and wait for the site to be approved.
2. *Get code → Banner 300x250*. From the code they show, copy the **key** (32 chars, inside `atOptions`) into `NEXT_PUBLIC_ADSTERRA_BANNER_KEY`, and the full `<script src="...">` URL (e.g. `https://bicea.org/22/<key>`) into `NEXT_PUBLIC_ADSTERRA_BANNER_SRC`.
3. Optional: *Native Banner* → paste the full script URL into `NEXT_PUBLIC_ADSTERRA_NATIVE_SRC` (used for the 2nd in-article slot; falls back to a banner without it).
4. Adsterra *Websites → your site → ads.txt*: paste the line(s) into `ADS_TXT_LINES` (separate several with `;`). Check `https://YOUR_DOMAIN/ads.txt`.
5. Set `NEXT_PUBLIC_ADS_ENABLED=true` and redeploy (Vercel only applies new variables on a new deploy).

**How it is built (and why)**
- Each slot is an `<iframe src="/ad-frame?kind=banner">`. `/ad-frame` has its own permissive CSP (Adsterra uses many rotating domains), so the main site keeps its strict CSP.
- Adsterra's banner only renders with `allow-same-origin` (verified: without it the slot is blank). Since `/ad-frame` is on our own origin, the ad script is **not** isolated from the site. Mitigations: the private dashboard tokens ("My quizzes on this device") are stored in an httpOnly cookie via `/api/mine` (scripts cannot read it; old localStorage entries are migrated automatically), and ads never run on `/quiz`, `/create`, `/dashboard`, `/me` or `/admin`. For full isolation, serve `/ad-frame` from a separate domain.
- Only **Banner** and **Native Banner** are used. **Popunder, Social Bar and Direct Link are intentionally not used**: they open tabs or overlay the page.
- Max 3 per page: home (2), articles (after paragraph 2, after paragraph 5, end), result page (1, below score, share buttons and answer review), content pages (1). Never on `/quiz`, `/create`, `/dashboard`, `/admin`, `/me`, `/offline`.
- Every slot reserves its height (no layout shift), is labelled "Advertisement", loads lazily near the viewport, and renders only after the visitor accepts cookies in regions that require consent.
- All positions live in `src/config/ads.ts`.
- Adsterra approval and payouts are decided by Adsterra; nothing in code can guarantee them.

**Google AdSense (optional later):** set `NEXT_PUBLIC_AD_PROVIDER=adsense`, fill `NEXT_PUBLIC_ADSENSE_CLIENT` and the `NEXT_PUBLIC_AD_SLOT_*` ids, turn Auto ads OFF in AdSense, and use Google's CMP for EEA/UK/CH (`NEXT_PUBLIC_GOOGLE_CMP_ENABLED=true`). Note that AdSense and Adsterra should not be shown on the same page.

---
## How the important parts work

### Scoring and secrecy
- `questions.correct_index` is never selected for any public response. `getPublicQuiz()` uses an explicit column list.
- `submit_attempt()` validates, scores, inserts the attempt and **all responses in one batch**, updates aggregates and daily stats, all inside one Postgres function (one transaction).
- Idempotency: the client sends a random UUID per play. `(quiz_id, idempotency_key)` is unique, so double taps and retries return the original result without re-scoring.
- The answer review on `/result/[id]` is shown only to the device that played, via an httpOnly cookie scoped to that path. People who open a shared result link see the score plus "Take the quiz" CTAs, not the answers.
- "You beat X%" comes from a 16-bucket score histogram on the quiz row. It is aggregate only and survives the 7-day cleanup.

### Creator access
- `newCreatorToken()` = 32 random bytes (base64url). Only `sha256(token)` is stored.
- The dashboard URL carries the token, so `/dashboard/*` sends `Referrer-Policy: no-referrer`, `Cache-Control: no-store` and noindex, and is disallowed in robots.txt. GA and Vercel analytics redact it.
- The token is also saved in localStorage ("My quizzes on this device"). The publish screen and dashboard push creators to save the link.

### Caching and scale
- Quiz pages are ISR (`revalidate = 300`), served from the CDN. A viral quiz costs about one DB read per 5 minutes per region. Deleting or disabling a quiz calls `revalidatePath()`.
- `/api/quizzes/[slug]` sends `s-maxage=300, stale-while-revalidate=86400`.
- Content pages are fully static. The homepage regenerates hourly (question of the day).
- Analytics are counters (`daily_stats`, upserted), not event rows. Attempts are deleted after 7 days in batches by pg_cron.

### Retention

| Data | Kept for |
|---|---|
| Attempts + responses (nicknames, answers) | 7 days (hourly job) |
| Quizzes | until creator deletes; optional 30-day auto-expiry |
| Reports | 90 days after resolution, max 180 days |
| `daily_stats` counters | 2 years |

### Viral coefficient
`/admin` shows two numbers for the selected window:
- **K (CTA)** = quizzes created from result/challenge CTAs ÷ completed attempts.
- **Referral K** = quizzes whose creator arrived via any `?ref=` link ÷ completed attempts.

Plus visitors (one per device per day, counted without identifiers), quizzes created, attempts, completion rate, start rate, share rates by channel, top categories, score distribution, ad views per placement, a 5-step funnel, daily charts, weekly totals, and the moderation queue with Disable / Re-enable / Delete / Dismiss.

---

## Verification performed

- `npm run typecheck`, `npm run lint`, `npm run build` pass with no errors or warnings.
- **SQL**: all migrations applied to real Postgres (PGlite). Tested: perfect/zero/partial scores, idempotent replay, percentile math, histogram, batch responses, answer-count and out-of-range rejection, missing/disabled quiz rejection, `create_quiz` atomicity (no partial rows on failure), duplicate-slug error, all counters, retention cleanup with cascades, and that `anon` is denied on tables and RPCs.
- **Validation**: Zod schemas accept a real template quiz and reject size mismatches, contact info, unknown avatars, duplicate options, bad indices and abusive nicknames. All 97 bank questions pass the abuse filter. A false positive was found and fixed: "night" had been flagged.
- **Browser (360×740, headless Chrome)**: template → 10 one-tap answers → profile; nickname filter; title auto-fill; graceful publish error; `?template=` prefill lands on question 1; swap; custom editor; daily question; theme persistence; every tap target in `<main>` ≥ 44px; zero console errors.
- **Lighthouse (mobile, local production build)**:

  | Page | Perf | A11y | Best practices | SEO | LCP | CLS |
  |---|---|---|---|---|---|---|
  | `/` | 96 | 100 | 100 | 100 | 1.2 s | 0 |
  | `/blog/…` | 96 | 100 | 100 | 100 | 0.9 s | 0 |
  | `/create` | 93 | 100 | 100 | 100 | 0.8 s | 0 |
  | `/packs/food` | 96 | 100 | 100 | 100 | 0.9 s | 0 |

### Not verified / known gaps (please read)
- **Homepage JS budget**: initial JS is **~127 KB brotli / ~148 KB gzip**, so the 120 KB gzip target is **not met**. About 110 KB (brotli) of that is the Next.js 16 + React 19 runtime alone (webpack builds are the same size). App code on the homepage is ~17 KB. The only way to reach 120 KB gzip would be leaving Next.js/React.
- **Not run against a hosted Supabase.** The SQL was tested on PGlite, but the API routes were not exercised end-to-end through PostgREST locally (the PostgREST Windows binary would not start on this machine). Before launch: run the migrations on Supabase and do one full create → play → result → dashboard pass on a preview deployment.
- The quiz player and result page were not browser-tested (they need data). The create flow was.
- Lighthouse ran against `localhost`. Re-run on the deployed domain, where GA/AdSense/Turnstile scripts add some weight.
- Legal pages are thorough but are **not legal advice**. Fill the placeholders and have them reviewed (GDPR, UK GDPR, India DPDP, and COPPA if you get US teen traffic).
- The profanity filter is a first line of defence (English + common Hindi terms). Moderation via reports is the backstop.

---

## Extension hooks (cheap next steps)
- **More languages:** all copy is inline English; extract to a dictionary when needed.
- **Question bank:** add entries to `QUESTION_BANK` (ids `pack-NN`). Packs and templates pick them up automatically.
- **New share channel:** add it to `SHARE_CHANNELS` in `validations.ts` and a button in `share-kit.tsx`. Stats and admin charts adapt automatically.
- **Ad layout tests:** toggle/move entries in `src/config/ads.ts`; compare `ad_slot_viewed` per placement in `/admin`.
