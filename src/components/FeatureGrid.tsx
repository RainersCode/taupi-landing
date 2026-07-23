import { motion } from "motion/react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Full-width feature curtain. Six tall lifestyle panels share one row;
 * hovering a panel lets it breathe open (flex-grow transition) while the
 * others narrow, and the title + description fade in over a deepening
 * scrim. Collapsed panels show only a vertical label. Mobile gets a
 * vertical stack with text always visible — no hover required.
 */
export default function FeatureGrid({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  const items = [
    { key: "budget", img: "budzets" },
    { key: "scan", img: "skenesana" },
    { key: "insights", img: "ieskati" },
    { key: "goals", img: "merki" },
    { key: "invest", img: "invest" },
    { key: "challenges", img: "izaicinajumi" },
  ].map((it, i) => ({
    ...it,
    idx: String(i + 1).padStart(2, "0"),
    title: t[`features.${it.key}.title`],
    body: t[`features.${it.key}.body`],
  }));

  return (
    <section
      id="features"
      className="relative py-20 md:py-0 border-t border-white/5 md:h-screen md:flex md:flex-col"
    >
      {/* Section heading — stays on the content grid; clears the fixed nav */}
      <div className="mx-auto max-w-content w-full px-4 md:px-10 md:pt-28 md:shrink-0">
        <div className="flex items-baseline gap-6 mb-12 md:mb-10">
          <span className="eyebrow">{t["features.eyebrow"]}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      {/* ── Desktop curtain — fills the rest of the viewport ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="hidden md:flex w-full gap-1.5 md:flex-1 md:min-h-0"
      >
        {items.map((item) => (
          <article
            key={item.key}
            className="group relative overflow-hidden flex-1 hover:flex-[3.2] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer"
          >
            <img
              src={`/images/tiles/${item.img}.webp`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />

            {/* Navy tint — heavy when collapsed so the row reads as one
                calm strip; lifts on hover to let the photo breathe */}
            <div
              aria-hidden
              className="absolute inset-0 transition-opacity duration-700 opacity-70 group-hover:opacity-0"
              style={{ background: "rgba(13,17,40,0.55)" }}
            />
            {/* Bottom scrim — always present so text stays legible */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(13,17,40,0.35) 0%, rgba(13,17,40,0) 30%, rgba(13,17,40,0) 55%, rgba(13,17,40,0.88) 100%)",
              }}
            />

            {/* Index — top-left, always visible */}
            <span className="absolute top-5 left-5 eyebrow text-white/70">/ {item.idx}</span>

            {/* Collapsed label — vertical, fades away on hover */}
            <span
              className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display font-bold text-ink whitespace-nowrap transition-opacity duration-300 group-hover:opacity-0"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg) translateX(50%)",
                fontSize: "clamp(26px, 2.4vw, 34px)",
                letterSpacing: "0.01em",
                textShadow: "0 2px 16px rgba(0,0,0,0.55)",
              }}
            >
              {item.title}
            </span>

            {/* Expanded content — fixed width so text doesn't reflow while
                the panel is animating open */}
            <div className="absolute bottom-0 left-0 p-8 w-[420px] max-w-full opacity-0 translate-y-3 transition-all duration-500 delay-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
              <h3
                className="font-display font-bold text-ink"
                style={{ fontSize: "clamp(24px, 2vw, 30px)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
              >
                {item.title}
              </h3>
              <p className="mt-3 text-ink/80 leading-relaxed" style={{ fontSize: 15, maxWidth: "38ch" }}>
                {item.body}
              </p>
            </div>
          </article>
        ))}
      </motion.div>

      {/* ── Mobile stack — text always visible ── */}
      <div className="md:hidden flex flex-col gap-2 px-4">
        {items.map((item, i) => (
          <motion.article
            key={item.key}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative overflow-hidden h-56"
          >
            <img
              src={`/images/tiles/${item.img}.webp`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "50% 30%" }}
              loading="lazy"
              draggable={false}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(13,17,40,0.30) 0%, rgba(13,17,40,0.10) 40%, rgba(13,17,40,0.92) 100%)",
              }}
            />
            <span className="absolute top-4 left-4 eyebrow text-white/70">/ {item.idx}</span>
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3
                className="font-display font-bold text-ink"
                style={{ fontSize: 20, letterSpacing: "-0.02em" }}
              >
                {item.title}
              </h3>
              <p className="mt-1.5 text-ink/80 leading-relaxed" style={{ fontSize: 13.5 }}>
                {item.body}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
