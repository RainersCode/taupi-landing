import { motion } from "motion/react";
import PhoneFrame from "./PhoneFrame";
import DashboardMock from "./mocks/DashboardMock";
import BudgetMock from "./mocks/BudgetMock";
import InsightsMock from "./mocks/InsightsMock";
import GoalsMock from "./mocks/GoalsMock";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

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
      Mock: DashboardMock,
      tint: "rgba(90, 107, 255, 0.18)",
      bg: "#0D1128",
      // Background wordmark — echoes Hero's "t." treatment
      displayWord: t["reveal.screens.dashboard.label"],
      displayDot: "rgba(90, 107, 255, 0.09)",
      displayAnchor: { top: "52%", right: "-4%" },
      // 2 badges — live transaction + monthly savings
      badges: [
        {
          position: "top-left",
          rotation: 3,
          eyebrow: locale === "lv" ? "Tikko" : "Just now",
          title: "−€24.18",
          icon: "🛒",
        },
        {
          position: "bottom-right",
          rotation: -4,
          eyebrow: locale === "lv" ? "Šomēnes" : "This month",
          title: "+€214",
          accent: "success",
        },
      ],
    },
    {
      key: "budget",
      label: t["reveal.screens.budget.label"],
      desc: t["reveal.screens.budget.desc"],
      Mock: BudgetMock,
      tint: "rgba(45, 212, 167, 0.16)",
      bg: "#0B1428",
      displayWord: t["reveal.screens.budget.label"],
      displayDot: "rgba(45, 212, 167, 0.1)",
      // Mirror to the bottom-left on the 2nd section so the decorative word
      // rhythm alternates — breaks the four-sections-same-layout monotony.
      displayAnchor: { bottom: "-8%", left: "-6%" },
      // 1 badge — single clean "salary in" notification, no counterpart
      badges: [
        {
          position: "right-middle",
          rotation: 4,
          eyebrow: locale === "lv" ? "Ienāk" : "Incoming",
          title: "+€1 800",
          icon: "💼",
          accent: "success",
        },
      ],
    },
    {
      key: "insights",
      label: t["reveal.screens.insights.label"],
      desc: t["reveal.screens.insights.desc"],
      Mock: InsightsMock,
      tint: "rgba(117, 128, 224, 0.18)",
      bg: "#10132A",
      // Shorter word for section 3 so the decorative treatment reads
      // differently — full word visible instead of bleeding off-edge.
      displayWord: "Ieskati",
      displayDot: "rgba(117, 128, 224, 0.11)",
      displayAnchor: { top: "-10%", right: "-5%" },
      // 3 badges — matches the "many insights at once" feel
      badges: [
        {
          position: "top-right",
          rotation: -3,
          eyebrow: locale === "lv" ? "Jauns ieskats" : "New insight",
          title: locale === "lv" ? "Kafijas paradums" : "Coffee pattern",
          icon: "✦",
          accent: "brand",
        },
        {
          position: "left-middle",
          rotation: 5,
          eyebrow: locale === "lv" ? "Pret pag. ned." : "Vs last wk",
          title: "+12%",
          icon: "↑",
          accent: "warning",
          size: "compact",
        },
        {
          position: "bottom-right",
          rotation: -5,
          eyebrow: locale === "lv" ? "Ietaupīts" : "Saved",
          title: "€42",
          accent: "success",
          size: "compact",
        },
      ],
    },
    {
      key: "goals",
      label: t["reveal.screens.goals.label"],
      desc: t["reveal.screens.goals.desc"],
      Mock: GoalsMock,
      tint: "rgba(79, 209, 255, 0.18)",
      bg: "#0D1530",
      displayWord: t["reveal.screens.goals.label"],
      displayDot: "rgba(79, 209, 255, 0.12)",
      displayAnchor: { bottom: "-12%", right: "-3%" },
      // 2 badges — placed opposite to Dashboard to break the pattern
      badges: [
        {
          position: "top-right",
          rotation: 5,
          eyebrow: locale === "lv" ? "Progress" : "Progress",
          title: "43%",
          icon: "🎯",
          accent: "longterm",
        },
        {
          position: "bottom-left",
          rotation: -3,
          eyebrow: locale === "lv" ? "Priekšā grafikam" : "Ahead of plan",
          title: "+€120",
          icon: "↑",
          accent: "success",
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
  Mock: React.ComponentType<{ locale: Locale }>;
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
      className="relative w-full h-screen sticky top-0 overflow-hidden border-t border-white/5"
      style={{
        zIndex: 10 + index,
        background: section.bg,
      }}
    >
      {/* Per-section tint glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(60% 50% at 80% 20%, ${section.tint}, transparent 60%),
                       radial-gradient(50% 40% at 10% 90%, ${section.tint}, transparent 65%)`,
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
          color: "rgba(255, 255, 255, 0.05)",
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
          color: "rgba(255, 255, 255, 0.028)",
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
                <span className="h-px flex-1 bg-white/10" />
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

          {/* Main stage: text + phone, centered in remaining space */}
          <div className="flex-1 flex items-center min-h-0 overflow-hidden">
            <div className="mx-auto max-w-content w-full px-4 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-center py-6 md:py-0">
            {/* Text */}
            <motion.div
              key={`text-${section.key}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className="md:col-span-6"
            >
              <p
                className="eyebrow text-accent mb-6"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                / {String(index + 1).padStart(2, "0")}
              </p>
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
              className="md:col-span-6 flex justify-center md:justify-end relative"
            >
              <div className="relative scale-90 md:scale-100 origin-top">
                <div
                  aria-hidden
                  className="absolute -inset-8 -z-10 opacity-70 pointer-events-none"
                  style={{
                    background: `radial-gradient(55% 45% at 50% 50%, ${section.tint}, transparent 65%)`,
                  }}
                />
                <PhoneFrame h={600}>
                  <section.Mock locale={locale} />
                </PhoneFrame>

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
    default: { border: "rgba(255,255,255,0.08)", eyebrow: "#64646F" },
    success: { border: "rgba(45,212,167,0.25)", eyebrow: "#2DD4A7" },
    brand: { border: "rgba(128,147,255,0.3)", eyebrow: "#8093FF" },
    warning: { border: "rgba(255,181,71,0.25)", eyebrow: "#FFB547" },
    longterm: { border: "rgba(117,128,224,0.3)", eyebrow: "#7580E0" },
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
          style={{ background: "rgba(255,255,255,0.05)" }}
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
