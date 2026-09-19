import { motion } from "motion/react";
import PhoneFrame from "./PhoneFrame";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { OK, GOLD, INDIGO, BRAND } from "./calculator/palette";

/**
 * Full-section scroll takeover.
 *
 * Parent is 400vh tall. Each child is `sticky top-0 h-screen` with an
 * ascending z-index. As you scroll, the next section slides up from below
 * (normal flow), then pins at the top and — because it has higher z-index —
 * covers the previous section completely. Pure CSS; zero scroll-linked
 * animation.
 *
 * Each section gets its own set of floating badges around the phone. Counts
 * and positions are intentionally asymmetric across sections (2, 1, 3, 2)
 * so the reveal doesn't feel like four repetitions of the same template.
 */
export default function ProductReveal({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  const sections: SectionData[] = [
    {
      key: "dashboard",
      label: t["reveal.screens.dashboard.label"],
      desc: t["reveal.screens.dashboard.desc"],
      screenshot: "/images/screens/darijumi-light.webp",
      cardColor: "rgb(var(--brand-rgb))",
      pattern: "zigzag" as const,
      tint: "rgba(90, 107, 255, 0.18)",
      bg: "#0D1128",
      // Background wordmark — echoes Hero's "t." treatment
      displayWord: t["reveal.screens.dashboard.label"],
      displayDot: "rgba(90, 107, 255, 0.09)",
      displayAnchor: { top: "52%", right: "-4%" },
      badges: [
        {
          position: "left-middle",
          rotation: 3,
          eyebrow: locale === "lv" ? "Maxima · 21 prece" : "Maxima · 21 items",
          title: "−€25.02",
        },
      ],
    },
    {
      key: "budget",
      label: t["reveal.screens.budget.label"],
      desc: t["reveal.screens.budget.desc"],
      screenshot: "/images/screens/budzets-light.webp",
      cardColor: "rgb(var(--brand-rgb))",
      pattern: "arcs" as const,
      tint: "rgba(45, 212, 167, 0.16)",
      bg: "#0B1428",
      displayWord: t["reveal.screens.budget.label"],
      displayDot: "rgba(45, 212, 167, 0.1)",
      // Mirror to the bottom-left on the 2nd section so the decorative word
      // rhythm alternates — breaks the four-sections-same-layout monotony.
      displayAnchor: { bottom: "-8%", left: "-6%" },
      badges: [
        {
          position: "right-middle",
          rotation: 4,
          eyebrow: locale === "lv" ? "Ienākumi" : "Income",
          title: "+€2 373",
          accent: "success",
        },
      ],
    },
    {
      key: "insights",
      label: t["reveal.screens.insights.label"],
      desc: t["reveal.screens.insights.desc"],
      screenshot: "/images/screens/ieskati-light.webp",
      cardColor: "rgb(var(--brand-rgb))",
      pattern: "dots" as const,
      tint: "rgba(117, 128, 224, 0.18)",
      bg: "#10132A",
      // Shorter word for section 3 so the decorative treatment reads
      // differently — full word visible instead of bleeding off-edge.
      displayWord: "Ieskati",
      displayDot: "rgba(117, 128, 224, 0.11)",
      displayAnchor: { top: "-10%", right: "-5%" },
      badges: [
        {
          position: "left-middle",
          rotation: -4,
          eyebrow: locale === "lv" ? "Veselības skors" : "Health score",
          title: "70 / 100",
          accent: "brand",
        },
      ],
    },
    {
      key: "goals",
      label: t["reveal.screens.goals.label"],
      desc: t["reveal.screens.goals.desc"],
      screenshot: "/images/screens/kopskats-light.webp",
      cardColor: "rgb(var(--brand-rgb))",
      pattern: "stripes" as const,
      tint: "rgba(56, 189, 248, 0.18)",
      bg: "#0D1530",
      displayWord: t["reveal.screens.goals.label"],
      displayDot: "rgba(56, 189, 248, 0.12)",
      displayAnchor: { bottom: "-12%", right: "-3%" },
      badges: [
        {
          position: "bottom-left",
          rotation: -3,
          eyebrow: locale === "lv" ? "Neto vērtība" : "Net worth",
          title: "€4 824",
          accent: "longterm",
        },
      ],
    },
  ];

  return (
    <section
      id="reveal"
      className="relative h-[400vh]"
    >
      {sections.map((s, i) => (
        <SectionLayer
          key={s.key}
          index={i}
          total={sections.length}
          section={s}
          locale={locale}
          sectionTitle={t["reveal.title"]}
          eyebrow={t["reveal.eyebrow"]}
        />
      ))}
    </section>
  );
}

// ─── Types ──────────────────────────────────────────────────────────

type BadgeAccent = "default" | "success" | "brand" | "warning" | "longterm";

type BadgePosition =
  | "top-left"
  | "top-right"
  | "left-middle"
  | "right-middle"
  | "bottom-left"
  | "bottom-right";

type PlacedBadge = {
  position: BadgePosition;
  rotation: number;
  eyebrow: string;
  title: string;
  icon?: string;
  accent?: BadgeAccent;
  size?: "compact" | "full";
};

type DisplayAnchor = Partial<
  Record<"top" | "right" | "bottom" | "left", string>
>;

type SectionData = {
  key: string;
  label: string;
  desc: string;
  screenshot: string;
  /** Kartes vienlaidu akcenta krāsa (tēmas tokens). */
  cardColor: string;
  /** Grafiskais raksts uz kartes — katrai sekcijai savs. */
  pattern: PatternKind;
  tint: string;
  bg: string;
  badges: PlacedBadge[];
  // Massive decorative wordmark — the "t." background treatment. The `.`
  // glyph is rendered separately and tinted with the section accent color.
  displayWord: string;
  displayDot: string;
  displayAnchor: DisplayAnchor;
};

// ─── One layered full-viewport section ──────────────────────────────

function SectionLayer({
  index,
  total,
  section,
  locale,
  sectionTitle,
  eyebrow,
}: {
  index: number;
  total: number;
  section: SectionData;
  locale: Locale;
  sectionTitle: string;
  eyebrow: string;
}) {
  const isFirst = index === 0;

  return (
    <div
      className="relative w-full h-screen sticky top-0 overflow-hidden border-t border-frost/5"
      style={{
        zIndex: 10 + index,
        background: "var(--reveal-bg, " + section.bg + ")",
      }}
    >
      {/* Per-section tint glow — puse no agrākās intensitātes un garāka
          izdzišana (75%+), lai ovāliem nav redzamu malu (2026-09-18). */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(60% 50% at 80% 20%, ${section.tint}, transparent 78%),
                       radial-gradient(50% 40% at 10% 90%, ${section.tint}, transparent 80%)`,
        }}
      />

      {/* Mobile decorative wordmark — centered subtle watermark that fits
          the viewport instead of bleeding off-screen. Slightly higher
          opacity because the smaller size needs it to read. */}
      <div
        aria-hidden
        className="md:hidden pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display font-black select-none"
        style={{
          fontSize: "clamp(60px, 19vw, 120px)",
          lineHeight: 0.82,
          letterSpacing: "-0.05em",
          color: "rgb(var(--frost-rgb) / 0.05)",
          zIndex: 0,
        }}
      >
        {section.displayWord}
        <span style={{ color: section.displayDot }}>.</span>
      </div>

      {/* Desktop decorative wordmark — dramatic bleed-off from the anchor */}
      <div
        aria-hidden
        className="hidden md:block pointer-events-none absolute whitespace-nowrap font-display font-black select-none"
        style={{
          ...section.displayAnchor,
          fontSize: "clamp(220px, 32vw, 480px)",
          lineHeight: 0.82,
          letterSpacing: "-0.06em",
          color: "rgb(var(--frost-rgb) / 0.028)",
          zIndex: 0,
        }}
      >
        {section.displayWord}
        <span style={{ color: section.displayDot }}>.</span>
      </div>

      <div className="relative h-full w-full" style={{ zIndex: 1 }}>
        {/* Flex-column layout so the top eyebrow band and the main stage
            never overlap — eyebrow takes its natural height, main stage
            fills remaining space with flex-1 and centers its content. */}
        <div className="h-full flex flex-col">
          {/* Top eyebrow band */}
          <div className="shrink-0 px-4 md:px-10 pt-20 md:pt-28">
            <div className="mx-auto max-w-content">
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="eyebrow">{eyebrow}</span>
                <span className="h-px flex-1 bg-frost/10" />
                <span className="eyebrow text-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
              {isFirst && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                  className="mt-4 md:mt-8 font-display font-extrabold text-ink"
                  style={{
                    fontSize: "clamp(22px, 4.2vw, 56px)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    maxWidth: "18ch",
                  }}
                >
                  {sectionTitle}
                </motion.h2>
              )}
            </div>
          </div>

          {/* Main stage: text + phone. `items-start` on mobile so content
              pins to the top of the flex-1 container (clipping only at the
              bottom) — with items-center the tall content was bleeding
              upward and the big "Sākums" label overlapped the eyebrow
              band's sectionTitle above it. Desktop centers as before. */}
          <div className="flex-1 flex items-start md:items-center min-h-0 overflow-hidden">
            <div className="mx-auto max-w-content w-full px-4 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-center pt-6 md:pt-0 pb-6 md:pb-0">
            {/* Text */}
            <motion.div
              key={`text-${section.key}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className={`md:col-span-6 ${index % 2 === 1 ? "md:order-2" : ""}`}
            >
              {/* "/ 03" skaitītājs izmests pavisam (2026-09-18): augšjoslas
                  "03 / 04" jau pasaka pozīciju, divi skaitītāji vienā ekrānā
                  lasījās kā dublēšanās arī desktopā. */}
              <h3
                className="font-display font-extrabold text-ink"
                style={{
                  fontSize: "clamp(52px, 9vw, 110px)",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.96,
                }}
              >
                {section.label}
              </h3>
              <p
                className="mt-5 md:mt-8 text-dim max-w-[42ch]"
                style={{ fontSize: "clamp(15px, 1.4vw, 20px)", lineHeight: 1.5 }}
              >
                {section.desc}
              </p>
            </motion.div>

            {/* Phone + floating badges */}
            <motion.div
              key={`phone-${section.key}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className={`md:col-span-6 flex justify-center relative ${
                index % 2 === 1 ? "md:order-1 md:justify-start" : "md:justify-end"
              }`}
            >
              {/* Telefons Wise-stila kartē: vienlaidu akcenta krāsa + grafisks
                  raksts lapas fona krāsā (izgriezuma efekts, Wise gliemežnīcu
                  analogs). Katrai sekcijai savs raksts. Badges peld pāri malām. */}
              <div className="relative reveal-phone">
                <div
                  className="overflow-hidden rounded-[36px] border border-frost/10 relative px-10 py-10 md:px-20 md:py-12"
                  style={{ background: section.cardColor }}
                >
                  <CardPattern kind={section.pattern} />
                  <div className="relative">
                    <PhoneFrame h={600} screenshot={section.screenshot} alt={section.desc} />
                  </div>
                </div>

                {/* Badges ĀRPUS overflow-hidden — tiem jāpeld pāri kartes malām. */}
                {section.badges.map((badge, bi) => (
                  <FloatingBadge
                    key={`${section.key}-badge-${bi}`}
                    badge={badge}
                    delay={0.55 + bi * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        </div>

        {/* Bottom scroll hint — first section only */}
        {isFirst && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="eyebrow text-muted">
              {locale === "lv" ? "Ritini" : "Scroll"}
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-10 bg-gradient-to-b from-accent to-transparent"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Kartes raksts ──────────────────────────────────────────────────

/**
 * Kartes grafika — ATVASINĀTA NO ZĪMOLA ZĪMES, nevis izdomātas formas.
 *
 * public/gredzens.svg ir atvērts gredzens ar noapaļotiem galiem (dasharray
 * atstāj ~23% pārrāvumu) un punkts pašā pārrāvumā. Tā pati ģeometrija
 * mērogota līdz plakāta izmēram ir šo karšu viss vizuālais vārdu krājums:
 * viens milzīgs gredzens, kas iziet pāri divām malām, viens vidējs un
 * pāris punktu. Tieši tā, kā Wise atvasina savus rakstus no zīmola —
 * izdomātas zigzaga/svītru formas izskatījās pēc klipārta (2026-09-18).
 *
 * Kompozīcijas likumi (vienādi visām četrām, tāpēc tās ir viena ģimene):
 *  - dramatiska mēroga starpība: milzīgais ~3x lielāks par vidējo;
 *  - lielākā forma vienmēr nogriezta vismaz divās malās (rada spriedzi);
 *  - asimetrija: masa vienā stūrī, pretējais stūris tukšs telpai;
 *  - divi caurspīdīguma līmeņi dod dziļumu vienā krāsā.
 */
type PatternKind = "zigzag" | "arcs" | "dots" | "stripes";

/** Gredzens ar zīmola proporcijām: 77% loks, 23% pārrāvums, apaļi gali. */
function Ring({
  cx,
  cy,
  r,
  w,
  rotate = 0,
  opacity = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  w: number;
  rotate?: number;
  opacity?: number;
}) {
  const c = 2 * Math.PI * r;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="currentColor"
      strokeWidth={w}
      strokeLinecap="round"
      strokeDasharray={`${(c * 0.772).toFixed(1)} ${(c * 0.228).toFixed(1)}`}
      transform={`rotate(${rotate} ${cx} ${cy})`}
      opacity={opacity}
    />
  );
}

/**
 * Kompozīcijas likumi (vienādi visām četrām, tāpēc tās ir viena ģimene):
 *  - dramatiska mēroga starpība: milzīgais ~3x lielāks par vidējo;
 *  - lielākā forma vienmēr nogriezta vismaz divās malās (rada spriedzi);
 *  - asimetrija: masa vienā stūrī, pretējais stūris tukšs telpai;
 *  - divi caurspīdīguma līmeņi dod dziļumu vienā krāsā.
 */
const SHAPES: Record<PatternKind, JSX.Element> = {
  // Darījumi — masa augšējā kreisajā, punkts gredzena pārrāvumā (kā zīmē).
  zigzag: (
    <g>
      <Ring cx={-30} cy={-10} r={310} w={54} rotate={-18} opacity={0.9} />
      <Ring cx={368} cy={598} r={104} w={30} rotate={128} opacity={0.6} />
      <circle cx="286" cy="214" r="26" fill="currentColor" opacity="0.75" />
    </g>
  ),
  // Budžets — masa apakšējā kreisajā, otrs gredzens augšā pa labi.
  arcs: (
    <g>
      <Ring cx={-50} cy={742} r={330} w={58} rotate={52} opacity={0.9} />
      <Ring cx={392} cy={96} r={118} w={32} rotate={-64} opacity={0.6} />
      <circle cx="322" cy="300" r="19" fill="currentColor" opacity="0.7" />
      <circle cx="86" cy="196" r="34" fill="currentColor" opacity="0.5" />
    </g>
  ),
  // Ieskati — gredzens ienāk no labās, mazāks augšējā kreisajā stūrī.
  dots: (
    <g>
      <Ring cx={470} cy={356} r={322} w={56} rotate={96} opacity={0.88} />
      <Ring cx={34} cy={82} r={126} w={34} rotate={16} opacity={0.62} />
      <circle cx="122" cy="646" r="40" fill="currentColor" opacity="0.6" />
      <circle cx="246" cy="560" r="15" fill="currentColor" opacity="0.8" />
    </g>
  ),
  // Kopskats — masa augšējā labajā, vidējais gredzens apakšā pa kreisi.
  stripes: (
    <g>
      <Ring cx={452} cy={-44} r={300} w={52} rotate={140} opacity={0.9} />
      <Ring cx={16} cy={604} r={132} w={36} rotate={-30} opacity={0.6} />
      <circle cx="330" cy="470" r="23" fill="currentColor" opacity="0.72" />
    </g>
  ),
};

function CardPattern({ kind }: { kind: PatternKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 720"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ color: "var(--bg)", opacity: 0.2 }}
    >
      {SHAPES[kind]}
    </svg>
  );
}

// ─── Floating badge ─────────────────────────────────────────────────

const positionClass: Record<BadgePosition, string> = {
  "top-left": "-left-8 top-16",
  "top-right": "-right-8 top-14",
  "left-middle": "-left-10 top-1/2 -translate-y-1/2",
  "right-middle": "-right-10 top-1/2 -translate-y-1/2",
  "bottom-left": "-left-8 bottom-24",
  "bottom-right": "-right-6 bottom-20",
};

// Offscreen entry direction derived from anchor — feels natural as it "floats in"
function entryOffset(pos: BadgePosition): { x: number; y: number } {
  switch (pos) {
    case "top-left":
    case "left-middle":
    case "bottom-left":
      return { x: -20, y: 0 };
    case "top-right":
    case "right-middle":
    case "bottom-right":
      return { x: 20, y: 0 };
  }
}

function FloatingBadge({
  badge,
  delay,
}: {
  badge: PlacedBadge;
  delay: number;
}) {
  const accents: Record<BadgeAccent, { border: string; eyebrow: string }> = {
    default: { border: "rgb(var(--frost-rgb) / 0.08)", eyebrow: "#64646F" },
    success: { border: "rgba(0,121,74,0.30)", eyebrow: OK },
    brand: { border: "rgba(122,69,214,0.30)", eyebrow: BRAND },
    warning: { border: "rgba(150,86,10,0.30)", eyebrow: GOLD },
    longterm: { border: "rgba(76,79,209,0.30)", eyebrow: INDIGO },
  };
  const a = accents[badge.accent ?? "default"];
  const compact = badge.size === "compact";
  const offset = entryOffset(badge.position);

  // Compose transform: preserve `-translate-y-1/2` for middle positions AND
  // apply the per-badge tilt rotation by stacking them.
  const isMiddle =
    badge.position === "left-middle" || badge.position === "right-middle";
  const transform = `${isMiddle ? "translateY(-50%) " : ""}rotate(${badge.rotation}deg)`;

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={`absolute hidden md:flex items-center gap-2.5 rounded-2xl ${
        compact ? "pl-2 pr-3 py-2" : "pl-2 pr-4 py-2.5"
      } ${positionClass[badge.position]}`}
      style={{
        background: "rgba(22, 27, 54, 0.94)",
        border: `1px solid ${a.border}`,
        boxShadow: "0 14px 36px -14px rgba(0,0,0,0.65)",
        transform,
      }}
    >
      {badge.icon && (
        <span
          className={`${compact ? "w-7 h-7 text-[12px]" : "w-8 h-8 text-[13px]"} rounded-xl flex items-center justify-center shrink-0`}
          style={{ background: "rgb(var(--frost-rgb) / 0.05)" }}
        >
          {badge.icon}
        </span>
      )}
      <div className="text-left leading-tight">
        <p
          className={`${compact ? "text-[8px]" : "text-[8.5px]"} uppercase`}
          style={{
            fontFamily: "JetBrains Mono",
            letterSpacing: "0.22em",
            color: a.eyebrow,
          }}
        >
          {badge.eyebrow}
        </p>
        <p
          className={`mt-0.5 ${compact ? "text-[12px]" : "text-[13px]"} font-bold text-white`}
          style={{
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.01em",
          }}
        >
          {badge.title}
        </p>
      </div>
    </motion.div>
  );
}
