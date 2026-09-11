import { useId } from "react";
import { motion } from "motion/react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Produkta vitrīna — foto aizkaru vietā (2026-09-11). Sešas bento kartes,
 * katrā CSS/SVG būvēts mini-skats no paša produkta: skaitļi, čipi, līknes.
 * Finanšu platformai uzticību rada produkts, ne stock foto ar maizi —
 * vitrīna rāda to, ko lietotājs reāli redzēs lietotnē.
 *
 * Bez klienta stāvokļa: vienīgais JS ir motion ieplūšana. Vinjetes ir
 * statisks HTML/SVG — ātras, asas uz katra ekrāna, bez attēlu ielādes.
 */

/* Check ikona punktiem — navy čips ar ciāna→indigo gredzenu (mantots no
   iepriekšējās versijas; vienīgais koplietotais gabals). */
function CheckChip({ size = 17 }: { size?: number }) {
  const grad = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
      <defs>
        <linearGradient id={grad} x1="2" y1="2" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#5A6BFF" />
        </linearGradient>
      </defs>
      <rect x="0.75" y="0.75" width="16.5" height="16.5" rx="5.5" fill="rgba(13,17,40,0.85)" stroke={`url(#${grad})`} strokeWidth="1.2" strokeOpacity="0.75" />
      <path d="M5.4 9.4l2.3 2.3 4.9-5.2" stroke={`url(#${grad})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Vinješu palīgi ────────────────────────────────────────────────── */

/** "Lietotnes kartes" virsma vinjetes iekšpusē. */
function AppCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-white/10 ${className}`}
      style={{ background: "linear-gradient(145deg, rgba(30,38,80,0.75) 0%, rgba(16,21,48,0.9) 100%)" }}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "dim" }: { children: React.ReactNode; tone?: "dim" | "accent" | "up" }) {
  const styles =
    tone === "accent"
      ? "text-[#38BDF8] border-[#38BDF8]/30 bg-[#38BDF8]/10"
      : tone === "up"
        ? "text-[#4ADE80] border-[#4ADE80]/30 bg-[#4ADE80]/10"
        : "text-dim border-white/10 bg-white/5";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${styles}`}>
      {children}
    </span>
  );
}

const num = "font-display font-bold text-ink tabular-nums";

/* 01 — Dienas budžets: lielais skaitlis + progress + divas mini kolonnas. */
function VignetteBudget() {
  return (
    <AppCard className="p-5 w-full max-w-[300px]">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-dim" style={{ fontSize: 10 }}>Šodien vari tērēt</span>
        <Pill>Vēl 18 dienas</Pill>
      </div>
      <div className={num} style={{ fontSize: 42, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 8 }}>
        €12.46
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg,#38BDF8,#5A6BFF)" }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Atlikums</div>
          <div className={num} style={{ fontSize: 16 }}>€231</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Iztērēts</div>
          <div className={num} style={{ fontSize: 16 }}>€89</div>
        </div>
      </div>
    </AppCard>
  );
}

/* 02 — Čeku skenēšana: čeka rindas ar kategoriju punktiem + kopsumma. */
function VignetteScan() {
  const rows = [
    { name: "Piens 2,5% 1L", price: "1,09", dot: "#38BDF8" },
    { name: "Rudzu maize", price: "1,45", dot: "#F59E0B" },
    { name: "Siers Gouda 300g", price: "3,20", dot: "#38BDF8" },
    { name: "Zobu pasta", price: "2,15", dot: "#A78BFA" },
  ];
  return (
    <AppCard className="p-5 w-full max-w-[300px]">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-dim" style={{ fontSize: 10 }}>Maxima · skenēts</span>
        <Pill tone="accent">AI ✓</Pill>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: r.dot }} />
            <span className="text-[13px] text-dim flex-1 truncate">{r.name}</span>
            <span className={num} style={{ fontSize: 13 }}>€{r.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-dashed border-white/15 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-muted">Kopā</span>
        <span className={num} style={{ fontSize: 16 }}>€7.89</span>
      </div>
    </AppCard>
  );
}

/* 03 — AI ieskati: ieskatu burbulis ar dzirksti. */
function VignetteInsights() {
  return (
    <div className="w-full max-w-[280px] space-y-2.5">
      <AppCard className="p-4">
        <div className="flex items-start gap-2.5">
          <span
            className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-lg shrink-0 text-[13px]"
            style={{ background: "linear-gradient(135deg,#38BDF8,#5A6BFF)" }}
          >
            ✦
          </span>
          <p className="text-[13px] text-dim" style={{ lineHeight: 1.55 }}>
            Kafejnīcām šomēnes <span className="text-ink font-semibold">−23%</span> pret augustu — temps ļauj mērķim
            pielikt <span className="text-ink font-semibold">€15</span>.
          </p>
        </div>
      </AppCard>
      <AppCard className="p-3.5 opacity-70">
        <p className="text-[12px] text-dim truncate">Piektdienās tērē vidēji €49 — divreiz vairāk nekā svētdienās.</p>
      </AppCard>
    </div>
  );
}

/* 04 — Mērķi: mērķa rinda ar progresu. */
function VignetteGoals() {
  return (
    <AppCard className="p-5 w-full max-w-[280px]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">Drošības spilvens</span>
        <Pill tone="accent">64%</Pill>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: "64%", background: "linear-gradient(90deg,#38BDF8,#5A6BFF)" }} />
      </div>
      <div className="mt-2.5 flex items-baseline justify-between">
        <span className={num} style={{ fontSize: 15 }}>€1 280</span>
        <span className="text-[12px] text-muted">no €2 000</span>
      </div>
      <div className="mt-3 pt-3 border-t border-white/8 text-[12px] text-dim flex items-center gap-1.5">
        <span>
          Šomēnes atlikts <span className="text-ink font-semibold">€120</span>
        </span>
        <Pill tone="up">+€40</Pill>
      </div>
    </AppCard>
  );
}

/* 05 — Neto vērtība: SVG līkne augšup + vērtība. */
function VignetteInvest() {
  return (
    <AppCard className="p-5 w-full max-w-[280px]">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-dim" style={{ fontSize: 10 }}>Neto vērtība</span>
        <Pill tone="up">+3,2%</Pill>
      </div>
      <div className={num} style={{ fontSize: 26, marginTop: 6 }}>€4 520</div>
      <svg viewBox="0 0 220 64" className="mt-2 w-full" aria-hidden="true">
        <defs>
          <linearGradient id="nwfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38BDF8" stopOpacity="0.35" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 50 C 30 46, 45 52, 70 42 S 120 30, 145 26 S 195 16, 220 10 L 220 64 L 0 64 Z" fill="url(#nwfill)" />
        <path d="M0 50 C 30 46, 45 52, 70 42 S 120 30, 145 26 S 195 16, 220 10" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="220" cy="10" r="3" fill="#38BDF8" />
      </svg>
    </AppCard>
  );
}

/* 06 — Izaicinājumi: sērija + šodienas izaicinājums (platā kartei). */
function VignetteChallenges() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[460px]">
      <AppCard className="p-4 flex items-center gap-3 flex-1">
        <span className="text-[22px]" aria-hidden="true">🔥</span>
        <div>
          <div className={num} style={{ fontSize: 18 }}>12 dienas</div>
          <div className="text-[11px] uppercase tracking-widest text-muted">pēc kārtas budžetā</div>
        </div>
      </AppCard>
      <AppCard className="p-4 flex-1">
        <div className="text-[11px] uppercase tracking-widest text-muted">Šodienas izaicinājums</div>
        <div className="text-[13px] text-dim mt-1.5" style={{ lineHeight: 1.5 }}>
          Šodien bez pirkumiem zem €3 — <span className="text-ink font-semibold">+1 sērijai</span>
        </div>
      </AppCard>
    </div>
  );
}

/* ── Sekcija ───────────────────────────────────────────────────────── */

const VIGNETTES: Record<string, () => JSX.Element> = {
  budget: VignetteBudget,
  scan: VignetteScan,
  insights: VignetteInsights,
  goals: VignetteGoals,
  invest: VignetteInvest,
  challenges: VignetteChallenges,
};

export default function FeatureGrid({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  const items = ["budget", "scan", "insights", "goals", "invest", "challenges"].map((key, i) => ({
    key,
    idx: String(i + 1).padStart(2, "0"),
    title: t[`features.${key}.title`],
    body: t[`features.${key}.body`],
    points: [1, 2, 3].map((n) => t[`features.${key}.p${n}`]),
  }));

  // Bento: divas platās augšā, trīs standarta vidū, izaicinājumi kā
  // horizontāls noslēgums pa visu platumu.
  const span = (key: string) =>
    key === "budget" || key === "scan"
      ? "md:col-span-3"
      : key === "challenges"
        ? "md:col-span-6"
        : "md:col-span-2";

  return (
    <section id="features" className="relative border-t border-white/5 py-24 md:py-32">
      <div className="mx-auto max-w-content w-full px-6 md:px-10">
        {/* Galvene */}
        <div className="flex items-baseline gap-6">
          <span className="eyebrow">{t["features.eyebrow"]}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <h2
          className="mt-8 font-display font-extrabold text-ink max-w-[24ch]"
          style={{ fontSize: "clamp(30px, 4vw, 52px)", letterSpacing: "-0.03em", lineHeight: 1.08 }}
        >
          {t["features.title"]}
        </h2>
        <p className="mt-5 text-dim max-w-[52ch] text-lg" style={{ lineHeight: 1.65 }}>
          {t["features.sub"]}
        </p>

        {/* Bento režģis */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-6 gap-4">
          {items.map((item, i) => {
            const Vignette = VIGNETTES[item.key];
            const wide = item.key === "challenges";
            return (
              <motion.article
                key={item.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                className={`${span(item.key)} rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden flex flex-col ${wide ? "md:flex-row md:items-center" : ""}`}
              >
                {/* Vinjete — produkta mini-skats uz klusa rastra */}
                <div
                  className={`relative flex items-center justify-center p-6 md:p-8 ${wide ? "md:order-2 md:flex-1" : ""}`}
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(90,107,255,0.10) 0%, rgba(13,17,40,0) 60%)",
                  }}
                >
                  {/* smalks punktu rasteris */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                      backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
                      backgroundSize: "18px 18px",
                    }}
                  />
                  <div className="relative">
                    <Vignette />
                  </div>
                </div>

                {/* Teksts */}
                <div className={`px-6 pb-7 md:px-8 md:pb-8 ${wide ? "md:order-1 md:flex-1 md:py-8" : ""}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[12px] text-muted">/ {item.idx}</span>
                    <h3 className="font-display font-bold text-ink" style={{ fontSize: 21, letterSpacing: "-0.02em" }}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-dim text-[15px]" style={{ lineHeight: 1.6 }}>
                    {item.body}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-dim">
                        <CheckChip />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
