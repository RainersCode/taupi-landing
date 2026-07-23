# Taupi Landing Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline — per Rainera standing preference, no subagent fan-out). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh taupi-landing to current brand + real app screenshots + waitlist capture, at Stripe/Revolut-level polish.

**Architecture:** Keep the existing Astro 5 + React islands + Tailwind + motion stack and the signature animations (headline stagger, sticky scroll-takeover). Replace hand-coded phone mocks with optimized real screenshots, strip decorative noise, swap store-button CTA for a shared WaitlistForm posting to a Vercel serverless function that writes to Supabase.

**Tech Stack:** Astro 5, React 18, Tailwind 3, motion/react, sharp (dev-only), Vercel serverless (`api/`), Supabase REST.

## Global Constraints

- Verification is visual: Rainers watches http://localhost:4321 — pause after each task for approval; no push to remote until he says so.
- LV is canonical copy; EN mirrors it. Latvian grammar: gender/number/case agreement.
- Accent color changes `#4FD1FF` → `#38BDF8` everywhere (tailwind token + inline rgba(79,209,255,…) → rgba(56,189,248,…)).
- Brand indigo stays `#5A6BFF` / `#3A4AE0`.
- `prefers-reduced-motion` must be respected by motion animations.
- Bulk file edits ONLY via Edit tool (PowerShell mojibake trap).
- `npm run build` must pass before each commit.

---

### Task 1: Screenshot pipeline

**Files:**
- Create: `scripts/optimize-screens.mjs`
- Create (generated): `public/images/screens/{sakums,darijumi,budzets,ieskati,kopskats}.webp` + `public/images/screens/crop-{veseliba,ceks,kategorijas}.webp`
- Modify: `package.json` (devDependency sharp)

**Interfaces:**
- Produces: five 800px-wide phone screenshots, top 130px (status bar) cropped off, WebP q82; three feature crops for Task 5.

- [ ] **Step 1:** `npm i -D sharp` in taupi-landing.
- [ ] **Step 2:** Write `scripts/optimize-screens.mjs`:

```js
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "C:/Users/raine/OneDrive/Dators/expenses/assets/store/ekranuznemumi";
const OUT = "public/images/screens";
mkdirSync(OUT, { recursive: true });

// Full-screen shots: crop the native status bar (top ~130px of 1206×2622)
// so PhoneFrame's own chrome (9:41 clock + island) is the only status bar.
const screens = [
  ["IMG_0629.PNG", "sakums"],
  ["IMG_0630.PNG", "darijumi"],
  ["IMG_0631.PNG", "budzets"],
  ["IMG_0632.PNG", "ieskati"],
  ["IMG_0633.PNG", "kopskats"],
];
for (const [file, name] of screens) {
  await sharp(`${SRC}/${file}`)
    .extract({ left: 0, top: 130, width: 1206, height: 2622 - 130 })
    .resize({ width: 800 })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${name}.webp`);
}

// Feature crops (regions in original 1206×2622 coordinates)
const crops = [
  // Financial-health ring card from IMG_0632
  ["IMG_0632.PNG", "crop-veseliba", { left: 60, top: 700, width: 1086, height: 1150 }],
  // Receipt rows (Maxima 21 items…) from IMG_0630
  ["IMG_0630.PNG", "crop-ceks", { left: 0, top: 880, width: 1206, height: 800 }],
  // Category bar + month total from IMG_0630
  ["IMG_0630.PNG", "crop-kategorijas", { left: 0, top: 360, width: 1206, height: 300 }],
];
for (const [file, name, region] of crops) {
  await sharp(`${SRC}/${file}`)
    .extract(region)
    .resize({ width: 900 })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${name}.webp`);
}
console.log("done");
```

- [ ] **Step 3:** Run `node scripts/optimize-screens.mjs`; verify 8 webp files exist and each full screen is < 150 KB.
- [ ] **Step 4:** Visually inspect (Read tool) sakums.webp + crop files; adjust crop regions if content clipped.
- [ ] **Step 5:** Commit `feat: real app screenshots, optimized to webp`.

### Task 2: PhoneFrame screenshot prop

**Files:**
- Modify: `src/components/PhoneFrame.tsx`

**Interfaces:**
- Produces: `<PhoneFrame h={640} screenshot="/images/screens/sakums.webp" alt="…">` — renders img instead of children; children path still works.

- [ ] **Step 1:** Add to Props: `screenshot?: string; alt?: string;`. In the screen-content slot replace `{children}` with:

```tsx
{screenshot ? (
  <img
    src={screenshot}
    alt={alt ?? ""}
    className="absolute inset-0 w-full h-full object-cover"
    draggable={false}
    loading="lazy"
  />
) : (
  children
)}
```

  Make `children` optional (`children?: ReactNode`).
- [ ] **Step 2:** Temporarily point Hero's PhoneFrame at the screenshot to eyeball fit (object-cover vs top-alignment; screenshots are 9:20.7 after crop vs frame 9:19.5 — `object-cover object-top` if bottom tab bar clips badly).
- [ ] **Step 3:** Rainers checks localhost. Commit `feat(phone): screenshot prop`.

### Task 3: Hero cleanup + waitlist input + accent color

**Files:**
- Modify: `tailwind.config.mjs` (accent → `#38BDF8`)
- Modify: `src/components/Hero.tsx`
- Create: `src/components/WaitlistForm.tsx`
- Modify: `src/i18n/strings.ts` (waitlist keys, hero cta keys)

**Interfaces:**
- Produces: `<WaitlistForm locale={locale} size="lg"|"md" />` — self-contained fetch to `/api/waitlist`; used by Hero (Task 3) and WaitlistCTA (Task 6).

- [ ] **Step 1:** tailwind accent → `#38BDF8`; grep for `4FD1FF` / `79, 209, 255` / `79,209,255` across `src/` and replace with `38BDF8` / `56, 189, 248` equivalents (Edit tool, per file).
- [ ] **Step 2:** Write `WaitlistForm.tsx`:

```tsx
import { useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

export default function WaitlistForm({ locale, size = "md" }: { locale: Locale; size?: "lg" | "md" }) {
  const t = getDict(locale);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [email, setEmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, website: "" }), // website = honeypot
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-[15px] text-success" role="status">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 9.5l2.3 2.3L12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t["waitlist.done"]}
      </p>
    );
  }

  const tall = size === "lg";
  return (
    <form onSubmit={submit} className="w-full max-w-[440px]">
      <div
        className={`flex items-center rounded-full pl-5 pr-1.5 ${tall ? "py-1.5" : "py-1"}`}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t["waitlist.placeholder"]}
          aria-label={t["waitlist.placeholder"]}
          className="flex-1 min-w-0 bg-transparent text-ink placeholder:text-muted text-[15px] outline-none"
        />
        {/* Honeypot — visually hidden, bots fill it */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={state === "busy"}
          className={`shrink-0 rounded-full bg-brand text-white font-medium text-[14px] px-5 ${tall ? "py-3" : "py-2.5"} hover:bg-brand-light transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
          {state === "busy" ? "…" : t["waitlist.cta"]}
        </button>
      </div>
      <p className="mt-3 text-[12.5px] text-muted">
        {state === "error" ? t["waitlist.error"] : t["waitlist.note"]}
      </p>
    </form>
  );
}
```

- [ ] **Step 3:** strings.ts — add both locales:

```ts
// lv
"waitlist.placeholder": "Tavs e-pasts",
"waitlist.cta": "Pieteikties",
"waitlist.done": "Esi sarakstā! Dosim ziņu, tiklīdz Taupi būs pieejams.",
"waitlist.error": "Neizdevās pieteikties. Pamēģini vēlreiz pēc brīža.",
"waitlist.note": "Bez surogātpasta — tikai viens e-pasts, kad lietotne būs klajā.",
"hero.eyebrow": "Drīzumā App Store un Google Play",
// en
"waitlist.placeholder": "Your email",
"waitlist.cta": "Join waitlist",
"waitlist.done": "You're on the list! We'll email you the moment Taupi launches.",
"waitlist.error": "Couldn't sign you up. Please try again in a moment.",
"waitlist.note": "No spam — a single email when the app goes live.",
"hero.eyebrow": "Coming soon to the App Store and Google Play",
```

- [ ] **Step 4:** Hero.tsx cleanup:
  - Delete: backdrop `<img>` + its two overlay divs, dotted-grid div, giant "t." wordmark div, badge #1 (🛒 pill), "v1.0 · live" caption block.
  - Keep: three-radial atmospheric layer but reduce to ONE radial glow centred behind the phone column: `radial-gradient(45% 40% at 72% 45%, rgba(90,107,255,0.16), transparent 65%)`.
  - Replace CTA row (both `<a>`s) with `<WaitlistForm locale={locale} size="lg" />` inside the same motion.div (keep delays).
  - PhoneFrame → `<PhoneFrame h={640} screenshot="/images/screens/sakums.webp" alt={t["reveal.screens.dashboard.desc"]} />`.
  - Keep badge #2 but update copy: eyebrow `Šomēnes ietaupīts` / `Saved this month`, title `+€69.29` (matches screenshot).
  - Wrap stagger variants: `const reduce = useReducedMotion();` from motion/react — if true, use `{hidden:{opacity:0},show:{opacity:1}}` variants.
- [ ] **Step 5:** Build + Rainers checks localhost (LV + /en). Commit `feat(hero): real screenshot, waitlist form, restraint pass`.

### Task 4: ProductReveal + LifestylePanel screenshots

**Files:**
- Modify: `src/components/ProductReveal.tsx`
- Modify: `src/components/LifestylePanel.tsx` (only if it embeds a mock — check imports)
- Modify: `src/i18n/strings.ts` (reveal labels/descs)
- Delete: `src/components/mocks/*` (after nothing imports them)

**Interfaces:**
- Consumes: `PhoneFrame.screenshot` (Task 2), `public/images/screens/*.webp` (Task 1).

- [ ] **Step 1:** strings.ts reveal keys → match the four screenshots:

```ts
// lv
"reveal.screens.dashboard.label": "Darījumi",
"reveal.screens.dashboard.desc": "Katrs pirkums savā vietā — ar čeka pozīcijām.",
"reveal.screens.budget.label": "Budžets",
"reveal.screens.budget.desc": "Alga, fiksētie, brīvie — viens skaidrs plāns.",
"reveal.screens.insights.label": "Ieskati",
"reveal.screens.insights.desc": "Finansiālā veselība un prognoze gadam.",
"reveal.screens.goals.label": "Kopskats",
"reveal.screens.goals.desc": "Neto vērtība, konti un investīcijas vienuviet.",
// en
"reveal.screens.dashboard.label": "Transactions",
"reveal.screens.dashboard.desc": "Every purchase in its place — receipt items included.",
"reveal.screens.budget.label": "Budget",
"reveal.screens.budget.desc": "Salary, fixed costs, free money — one clear plan.",
"reveal.screens.insights.label": "Insights",
"reveal.screens.insights.desc": "Financial health and a year-ahead projection.",
"reveal.screens.goals.label": "Overview",
"reveal.screens.goals.desc": "Net worth, accounts and investments in one place.",
```

- [ ] **Step 2:** ProductReveal.tsx — section data: drop `Mock` field, add `screenshot`: darijumi/budzets/ieskati/kopskats.webp; pass to PhoneFrame. Badge diet: keep at most one badge per section, update values to match screens (e.g. budget: `+€2 373` eyebrow `Ienākumi`; insights: `70` eyebrow `Veselības skors`); delete the rest. Remove mock imports.
- [ ] **Step 3:** Check LifestylePanel imports — if it uses a mock, same treatment (screenshot `sakums.webp`).
- [ ] **Step 4:** Delete `src/components/mocks/` (4 files). `npx tsc --noEmit` (via astro check or tsc) + build passes.
- [ ] **Step 5:** Rainers checks scroll-through. Commit `feat(reveal): real screenshots, badge diet, drop coded mocks`.

### Task 5: FeatureGrid refresh

**Files:**
- Modify: `src/components/FeatureGrid.tsx`
- Modify: `src/i18n/strings.ts` (feature copy)
- Delete: `public/images/feature-{insights,scan,trend}.png` (replaced by crops)

- [ ] **Step 1:** Read FeatureGrid.tsx; swap card images to `crop-veseliba.webp` (AI ieskati), `crop-ceks.webp` (skenēšana), `crop-kategorijas.webp` (analīze) keeping its existing card layout.
- [ ] **Step 2:** Copy updates:

```ts
// lv
"features.ai.body": "Taupi seko taviem paradumiem un rāda finansiālās veselības skoru — ar prognozi, cik gadā uzkrāsi.",
"features.scan.body": "Nofotografē čeku — AI izlasa preces un saliek tās pa 23 kategorijām.",
"features.trend.body": "Dienas, nedēļas un mēneša ritms, lielākie tēriņi un tendences — vienā pieskārienā.",
// en mirrors
"features.ai.body": "Taupi follows your habits and shows a financial health score — with a projection of what you'll save in a year.",
"features.scan.body": "Photograph a receipt — AI reads the items and sorts them into 23 categories.",
"features.trend.body": "Daily, weekly and monthly rhythm, biggest expenses and trends — in one tap.",
```

- [ ] **Step 3:** Delete old feature PNGs once unreferenced. Build passes.
- [ ] **Step 4:** Rainers checks. Commit `feat(features): real UI crops + current copy`.

### Task 6: Gredzens logo — Nav, Footer, favicon

**Files:**
- Create: `public/gredzens.svg` (ring mark, derived from `expenses/assets/logo/taupi-app-icon.svg` — read it first, extract the ring paths, recolor for dark bg)
- Modify: `public/favicon.svg` (ring mark version)
- Modify: `src/components/Nav.astro`, `src/components/Footer.astro`

- [ ] **Step 1:** Read `expenses/assets/logo/taupi-app-icon.svg` + `taupi-adaptive-foreground.svg`; produce `public/gredzens.svg` (standalone ring, currentColor or brand gradient) and new `favicon.svg`.
- [ ] **Step 2:** Nav.astro wordmark block →

```html
<a href={locale === "lv" ? "/" : "/en/"} class="group flex items-center gap-2.5">
  <img src="/gredzens.svg" alt="" width="26" height="26" />
  <span class="font-display font-extrabold text-xl md:text-2xl text-ink" style="letter-spacing: -0.04em;">
    taupi<span class="text-brand">.</span>
  </span>
</a>
```

  Nav download button → `href="#waitlist"`, label `t["nav.join"]` (lv `Pieteikties`, en `Join`), add key to strings.
- [ ] **Step 3:** Footer — same mark at smaller size next to wordmark.
- [ ] **Step 4:** Check Base.astro favicon link type; hard-refresh check. Commit `feat(brand): Gredzens mark in nav, footer, favicon`.

### Task 7: Waitlist backend + CTA section

**Files:**
- Create: `api/waitlist.ts` (Vercel serverless, repo root)
- Modify: `src/components/DownloadCTA.astro` → waitlist section (id="waitlist")
- Modify: `src/pages/index.astro` + `src/pages/en/index.astro` (component rename if any)
- Supabase (expenses project): `waitlist` table migration via MCP

- [ ] **Step 1:** Supabase migration (MCP apply_migration):

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'lv',
  source text not null default 'landing',
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
-- no policies: only service role reads/writes
```

- [ ] **Step 2:** `api/waitlist.ts`:

```ts
export const config = { runtime: "edge" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  let body: { email?: string; locale?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }
  // Honeypot filled → pretend success
  if (body.website) return json({ ok: true });
  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ ok: false }, 400);
  const locale = body.locale === "en" ? "en" : "lv";

  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates", // duplicate email → idempotent 201/409-free
    },
    body: JSON.stringify({ email, locale, source: "landing" }),
  });
  if (!res.ok && res.status !== 409) return json({ ok: false }, 502);
  return json({ ok: true });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
```

- [ ] **Step 3:** DownloadCTA.astro → rename mentally to waitlist section: `id="waitlist"`, drop both store buttons + their `<style>`, keep halo + big wordmark backdrop, headline `cta.title` → lv `Esi pirmais.` / en `Be first.`, sub → lv `Taupi drīzumā nonāks veikalos. Pieteikšanās aizņem piecas sekundes.` / en `Taupi is coming to the stores soon. Signing up takes five seconds.` Insert `<WaitlistForm client:visible locale={locale} size="lg" />` centered.
- [ ] **Step 4:** Env vars: `vercel env add SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (Rainers approves; values from expenses backend). For local test: `.env` + `vercel dev`, or temporarily point form to preview deploy. Minimum local check: POST via curl → table row appears (MCP execute_sql select).
- [ ] **Step 5:** Commit `feat(waitlist): email capture via Vercel fn + Supabase`.

### Task 8: Final pass

- [ ] **Step 1:** Grep leftovers: `4FD1FF`, `mocks/`, `#download`, unused strings keys (`cta.ios`, `cta.android`, `nav.download`, old feature bodies) — clean.
- [ ] **Step 2:** `npm run build` clean; check both locales + legal pages render.
- [ ] **Step 3:** Mobile pass at 390px width (dev tools): hero form fits, reveal readable, no horizontal scroll.
- [ ] **Step 4:** Lighthouse quick run (optional). Commit `chore: refresh cleanup`.
- [ ] **Step 5:** Rainers final review → only then push + Vercel production deploy.

### Task 9 (optional, if Rainers wants): OG/social image

- Generate a 1200×630 OG image (nano-banana-pro skill or brand-page Playwright render): dark navy, Gredzens mark, `taupi.` wordmark, LV tagline. Wire `<meta property="og:image">` in Base.astro.
