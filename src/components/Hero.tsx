import { motion, useReducedMotion } from "motion/react";
import PhoneFrame from "./PhoneFrame";
import WaitlistForm from "./WaitlistForm";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

export default function Hero({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const reduce = useReducedMotion();

  // Staggered reveal for the headline words — the load-in moment.
  // With reduced motion the words simply fade, no vertical travel.
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  };
  const word = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.4 } },
      }
    : {
        hidden: { y: "110%", opacity: 0 },
        show: {
          y: "0%",
          opacity: 1,
          transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] },
        },
      };

  return (
    // Always fills the 100vh sticky wrapper. `flex items-center` so the
    // text content is vertically centered — on mobile the phone is hidden
    // and the text-only Hero needs proper vertical balance.
    <section
      className="relative pt-24 md:pt-40 pb-12 md:pb-16 px-4 md:px-10 overflow-hidden w-full h-full flex items-center"
      style={{ background: "#0D1128" }}
    >
      {/* One soft brand glow behind the phone column — the only decoration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 40% at 72% 45%, rgba(90,107,255,0.16), transparent 65%)",
        }}
      />

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
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-10 max-w-[46ch] text-lg text-dim leading-relaxed"
          >
            {t["hero.sub"]}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="mt-10"
          >
            <WaitlistForm locale={locale} size="lg" />
          </motion.div>
        </div>

        {/* ─── Right: phone (DESKTOP ONLY) — real app screenshot ─── */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="hidden md:flex md:col-span-5 relative justify-center md:justify-end"
        >
          <div className="relative scale-90 md:scale-100 origin-top">
            <PhoneFrame
              h={640}
              screenshot="/images/screens/sakums.webp"
              alt={locale === "lv" ? "Taupi sākuma ekrāns — dienas budžets" : "Taupi home screen — daily budget"}
            />

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

            {/* Single floating chip — saved this month, matches the screenshot */}
            <motion.div
              initial={{ opacity: 0, x: reduce ? 0 : 20, y: reduce ? 0 : 10 }}
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
                {locale === "lv" ? "Šomēnes ietaupīts" : "Saved this month"}
              </p>
              <p
                className="mt-0.5 text-[18px] font-extrabold text-white"
                style={{ letterSpacing: "-0.025em" }}
              >
                +€69.29
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
