import { motion } from "motion/react";
import PhoneFrame from "./PhoneFrame";
import DashboardMock from "./mocks/DashboardMock";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

export default function Hero({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  // Staggered reveal for the headline words — the load-in moment.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  };
  const word = {
    hidden: { y: "110%", opacity: 0 },
    show: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
    },
  };

  return (
    // On desktop `md:h-full` fills the 100vh sticky wrapper; on mobile the
    // height is content-driven so the phone + badges aren't clipped.
    <section
      className="relative pt-24 md:pt-40 pb-12 md:pb-16 px-4 md:px-10 overflow-hidden w-full md:h-full"
      style={{ background: "#0D1128" }}
    >
      {/* ── Photographic backdrop ─────────────────────────────────
          A defocused interior bokeh — dark navy on the left bleeding into
          warm amber window-light on the right. Layered at low opacity with
          a dark gradient overlay so the text stays readable while the phone
          (right-side) appears to sit "at the window". */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src="/images/hero-backdrop.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.45 }}
          draggable={false}
        />
        {/* Left-weighted darkening so the headline reads over any crop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,17,40,0.92) 0%, rgba(13,17,40,0.72) 40%, rgba(13,17,40,0.38) 70%, rgba(13,17,40,0.22) 100%)",
          }}
        />
        {/* Top and bottom feathering so the image melts into surrounding sections */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,17,40,0.55) 0%, transparent 22%, transparent 78%, rgba(13,17,40,0.65) 100%)",
          }}
        />
      </div>

      {/* ── Atmospheric gradient layers on top of the image ──────
          Three stacked radial gradients + a subtle horizontal sweep — kept
          on top of the photo to preserve the existing brand-colored glow
          that ties to the navy+cyan palette.                               */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            // Deep blue-violet key light from top-left
            "radial-gradient(55% 45% at 15% 8%, rgba(128,147,255,0.20), transparent 55%)",
            // Warm amber fill from bottom-right (complementary temperature)
            "radial-gradient(40% 35% at 92% 95%, rgba(255,181,71,0.09), transparent 60%)",
            // Cyan accent high above the phone
            "radial-gradient(30% 25% at 80% 20%, rgba(79,209,255,0.12), transparent 60%)",
            // Horizontal sweep to imply a horizon line
            "linear-gradient(180deg, transparent 0%, rgba(13,17,40,0.4) 55%, transparent 85%)",
          ].join(", "),
        }}
      />

      {/* Fine dotted grid texture behind the content — barely-there */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.05) 0.8px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(70% 60% at 50% 40%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(70% 60% at 50% 40%, black, transparent 75%)",
        }}
      />

      {/* Massive decorative wordmark — smaller scale on mobile so it doesn't
          dominate the already-tight viewport, still large enough to bleed
          off-screen on desktop for the signature scale trick. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 md:-top-10 right-[-8%] md:right-[-4%] font-display font-black select-none"
        style={{
          fontSize: "clamp(180px, 40vw, 620px)",
          lineHeight: 0.8,
          color: "rgba(255,255,255,0.025)",
          letterSpacing: "-0.06em",
        }}
      >
        t<span style={{ color: "rgba(79, 209, 255, 0.06)" }}>.</span>
      </div>

      <div className="mx-auto max-w-content grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-center relative">
        {/* ─── Left: copy ─── */}
        <div className="md:col-span-7 md:pr-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="eyebrow mb-8"
          >
            {t["hero.eyebrow"]}
          </motion.p>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="display-xxl"
          >
            <span className="block overflow-hidden">
              <motion.span variants={word} className="inline-block">
                {t["hero.title"]}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={word} className="inline-block display-accent">
                {t["hero.title.italic"]}
              </motion.span>{" "}
              <motion.span variants={word} className="inline-block">
                {t["hero.title.rest"]}
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-10 max-w-[46ch] text-lg text-dim leading-relaxed"
          >
            {t["hero.sub"]}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-10 flex items-center gap-5 flex-wrap"
          >
            <a
              href="#download"
              className="group relative inline-flex items-center gap-2 rounded-full bg-ink text-bg px-7 py-4 text-[15px] font-medium hover:bg-accent transition-colors"
            >
              {t["hero.cta.primary"]}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#reveal"
              className="eyebrow text-dim hover:text-ink transition-colors underline decoration-dim/40 hover:decoration-ink underline-offset-4"
            >
              {t["hero.cta.secondary"]}
            </a>
          </motion.div>
        </div>

        {/* ─── Right: phone ─── */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="md:col-span-5 relative flex justify-center md:justify-end"
        >
          <div className="relative scale-90 md:scale-100 origin-top">
            {/* Two-layer halo — pre-blurred, no CSS filter. Outer indigo lift,
                inner cyan highlight where the phone's screen catches light. */}
            <div
              aria-hidden
              className="absolute -inset-14 -z-10 opacity-80 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 50% at 50% 40%, rgba(90,107,255,0.35), rgba(90,107,255,0.08) 45%, transparent 65%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 opacity-90 pointer-events-none"
              style={{
                background:
                  "radial-gradient(40% 30% at 50% 35%, rgba(79,209,255,0.18), transparent 60%)",
              }}
            />

            <PhoneFrame h={640}>
              <DashboardMock locale={locale} />
            </PhoneFrame>

            {/* Ground-plane reflection pool — soft ellipse the phone sits on */}
            <div
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                bottom: -28,
                width: "115%",
                height: 56,
                background:
                  "radial-gradient(50% 80% at 50% 0%, rgba(90,107,255,0.22), transparent 70%)",
                filter: "blur(12px)",
              }}
            />

            {/* ── Floating badge #1: "+€24.18 Rimi" pill, top-left ── */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute -left-8 top-20 hidden md:flex items-center gap-2 rounded-full py-2 pl-2 pr-4"
              style={{
                background: "rgba(22, 27, 54, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 32px -12px rgba(0,0,0,0.6)",
                transform: "rotate(3deg)",
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                style={{ background: "#1F2445" }}
              >
                🛒
              </span>
              <div className="text-left leading-tight">
                <p
                  className="text-[8.5px] uppercase"
                  style={{
                    fontFamily: "JetBrains Mono",
                    letterSpacing: "0.2em",
                    color: "#64646F",
                  }}
                >
                  {locale === "lv" ? "Tikko" : "Just now"}
                </p>
                <p
                  className="text-[12px] font-bold text-white"
                  style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
                >
                  −€24.18
                </p>
              </div>
            </motion.div>

            {/* ── Floating badge #2: "saved this month" chip, bottom-right ── */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, delay: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute -right-6 bottom-24 hidden md:flex flex-col rounded-2xl px-4 py-3"
              style={{
                background: "rgba(22, 27, 54, 0.92)",
                border: "1px solid rgba(45,212,167,0.2)",
                boxShadow: "0 12px 32px -12px rgba(0,0,0,0.6)",
                transform: "rotate(-4deg)",
              }}
            >
              <p
                className="text-[8.5px] uppercase"
                style={{
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.22em",
                  color: "#2DD4A7",
                }}
              >
                {locale === "lv" ? "Šomēnes" : "This month"}
              </p>
              <p
                className="mt-0.5 text-[18px] font-extrabold text-white"
                style={{ letterSpacing: "-0.025em" }}
              >
                +€214
              </p>
            </motion.div>

            {/* Status caption — lives under the phone's ground-reflection pool,
                horizontal. Small "live" indicator dot gives the phone a
                pulse-of-life beat without being animated. */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 eyebrow whitespace-nowrap pointer-events-none"
              style={{ bottom: -56 }}
            >
              <span className="text-muted">v1.0</span>
              <span className="text-muted/50">·</span>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#4FD1FF",
                  boxShadow: "0 0 10px rgba(79, 209, 255, 0.7)",
                }}
              />
              <span className="text-accent">live</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
