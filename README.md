# Taupi — mājaslapa

**[taupi.eu](https://taupi.eu)** · Latviešu budžeta lietotne iPhone un Android telefoniem.

Taupi parāda vienu skaitli — cik šodien drīksti iztērēt, lai mēnesis izietu bez
pārsteigumiem. Izdevumu uzskaite, čeku skenēšana, mērķi, parādi, kopīgs budžets
pārim un dienas jautājums ar mēneša tabulu.

**Lejupielādēt:** [taupi.eu/get](https://taupi.eu/get) — saite pati aizved uz
pareizo veikalu ([App Store](https://apps.apple.com/lv/app/taupi-budget/id6763491623) ·
[Google Play](https://play.google.com/store/apps/details?id=com.rainerslovkins.taupi)).

Šajā repozitorijā dzīvo **mājaslapa**, nevis pati lietotne: sākumlapa, pieci
finanšu kalkulatori, [lietošanas gidi](https://taupi.eu/gids/) un
[padomu raksti](https://taupi.eu/padomi/) — latviski un angliski.

Sadarbībai un jautājumiem: **info@taupi.eu**

---

## Par kodu

Marketing site for Taupi — deployed at `taupi.eu`.

## Stack

- **Astro 5** with React islands
- **Tailwind CSS** for layout utilities; design tokens in `src/styles/global.css`
- **Motion** (Framer Motion's successor) for component animations
- **Lenis** for smooth scroll
- **GSAP + ScrollTrigger** for scroll-pinned / scrubbed sections (used in v2 product reveal)

## Design tokens

Mirrors the mobile app's `src/theme.ts` — same brand colors (`#5A6BFF`, `#4FD1FF`, `#0D1128`) so the site feels like the app, not a different brand.

Typography (matches the app's `src/theme.ts` for brand consistency):
- Display / headings / numbers: **Sora** (400/600/700/800)
- Body: **DM Sans** (400/500/700)
- Mono: **JetBrains Mono** (400/500) — used sparingly for metadata/eyebrow labels as a signature web detail

The distinctive landing-page feel comes from **scale, composition, weight, and negative tracking** — not from choosing different typefaces than the product. Sora 800 at 140px with -4.5% tracking looks nothing like Sora 700 at 22px in the app UI.

## Dev

```bash
npm install
npm run dev
```

Then open http://localhost:4321 (LV) or http://localhost:4321/en/ (EN).

## Deploy (Vercel)

**First-time setup**

1. Push the `taupi-landing/` folder to a GitHub repo (can be its own repo, or a subfolder of the main Taupi monorepo — Vercel supports both).
2. In the [Vercel dashboard](https://vercel.com/new), click **Import Git Repository** and pick the repo.
3. Vercel auto-detects Astro:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
   - (If the project is a subfolder, set **Root Directory** to `taupi-landing`.)
4. No environment variables needed.
5. Click **Deploy** — first build takes ~1 min.

**Custom domain — `taupi.eu`**

1. In the deployed project: **Settings → Domains → Add** → enter `taupi.eu` and `www.taupi.eu`.
2. Vercel shows the DNS records you need. At your domain registrar (where you bought `taupi.eu`), add:
   - Either Vercel's nameservers (simpler, gives Vercel full DNS control), OR
   - An `A` record for `@` pointing at Vercel's IP (`76.76.21.21`) + a `CNAME` for `www` pointing at `cname.vercel-dns.com`
3. Wait 5–30 minutes for DNS to propagate. Vercel issues a Let's Encrypt TLS cert automatically once DNS resolves.
4. Set `taupi.eu` as the primary domain (so `www.*` redirects to bare).

**Ongoing deploys**

Push to the main branch → Vercel builds + deploys automatically. Preview deploys are generated for every PR.

**`vercel.json` in this repo** adds:
- Security headers (`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`)
- Aggressive caching for `/_astro/` hashed assets and `/fonts/` (1 year, immutable)
- Moderate caching for `/images/` (1 week)
- Convenience redirects: `/privacy` → `/privacy-policy/`, `/terms` → `/terms-of-service/`

## Structure

```
src/
  layouts/Base.astro       — shared html shell + fonts + smooth scroll
  pages/
    index.astro            — LV landing (default locale)
    en/index.astro         — EN landing
  components/
    Nav.astro              — fixed top nav with LV/EN toggle
    Hero.tsx               — animated hero, phone mockup
    PhoneFrame.tsx         — iPhone bezel primitive
    DashboardMock.tsx      — faithful recreation of app Dashboard
    Placeholder.astro      — stub section (replaced in v2)
    Footer.astro           — links + copyright
    SmoothScroll.tsx       — Lenis wrapper (mounted once in Base)
  i18n/strings.ts          — bilingual copy, keyed by section
  styles/global.css        — design tokens, grain overlay, eyebrow/display classes
```

## v1 scope (done)

- Scaffold, fonts, tokens
- Hero (animated headline + phone mockup with live Dashboard recreation)
- Nav with LV/EN toggle
- Footer
- Placeholders for reveal / features / privacy / download

## v2 next

- Scroll-pinned "product reveal" section (GSAP ScrollTrigger) cycling Dashboard → Budget → Insights → Goals
- Editorial 3-col feature grid with lifestyle photography (nano-banana-pro)
- Lifestyle full-bleed section (person-with-phone image)
- Trust/privacy panel with badges
- Real App Store / Play Store CTA block
- OG image + meta finalization
