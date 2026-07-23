import { useState } from "react";
import type { CSSProperties } from "react";
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
// Navy "highlighter" sticker behind text — same treatment as the
// LifestylePanel pull-quote, cloned per line for a marker-like pass.
const sticker: CSSProperties = {
  background: "rgba(13, 17, 40, 0.78)",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
  padding: "0.08em 0.28em",
  borderRadius: 3,
};

export default function FeatureGrid({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  // Mobile accordion — index of the open panel, or null when all collapsed
  const [open, setOpen] = useState<number | null>(null);

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
    points: [1, 2, 3].map((n) => t[`features.${it.key}.p${n}`]),
  }));

  return (
    <section
      id="features"
      className="relative py-20 md:py-0 border-t border-white/5 md:h-screen"
    >
      {/* Section heading — overlaid on the curtain, clears the fixed nav */}
      <div className="mx-auto max-w-content w-full px-4 md:px-10 md:absolute md:inset-x-0 md:top-24 md:z-10 md:pointer-events-none">
        <div className="flex items-baseline gap-6 mb-12 md:mb-0">
          <span className="eyebrow">{t["features.eyebrow"]}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      {/* ── Desktop curtain — the panels ARE the viewport ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="hidden md:flex w-full gap-1.5 md:h-full"
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
                  "linear-gradient(180deg, rgba(13,17,40,0.35) 0%, rgba(13,17,40,0) 30%, rgba(13,17,40,0) 55%, rgba(13,17,40,0.30) 75%, rgba(13,17,40,0.60) 100%)",
              }}
            />

            {/* Index — below the overlaid heading band */}
            <span className="absolute top-36 left-5 eyebrow text-white/70">/ {item.idx}</span>

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
            {/* Quick fade-out (no delay) when leaving; delayed fade-in on hover
                so the text arrives after the panel has opened */}
            <div className="absolute bottom-0 left-0 p-8 w-[480px] max-w-full opacity-0 translate-y-3 transition-all duration-200 delay-0 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:duration-500 group-hover:delay-200 pointer-events-none">
              <h3
                className="font-display font-bold text-ink"
                style={{ fontSize: "clamp(26px, 2.2vw, 34px)", letterSpacing: "-0.02em", lineHeight: 1.25 }}
              >
                <span style={sticker}>{item.title}</span>
              </h3>
              <p className="mt-3 text-ink/90" style={{ fontSize: 15, maxWidth: "44ch", lineHeight: 1.6 }}>
                <span style={sticker}>{item.body}</span>
              </p>
              <ul className="mt-5 space-y-2.5">
                {item.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    >
                      <circle cx="8" cy="8" r="7.25" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />
                      <path
                        d="M5 8.2l2 2L11 6.4"
                        stroke="#38BDF8"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-ink/90" style={{ ...sticker, fontSize: 14, lineHeight: 1.45 }}>
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </motion.div>

      {/* ── Mobile accordion — collapsed strips open vertically on tap ── */}
      <div className="md:hidden flex flex-col gap-1.5">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.article
              key={item.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: i * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ height: isOpen ? 460 : 92 }}
              onClick={() => setOpen(isOpen ? null : i)}
              role="button"
              aria-expanded={isOpen}
            >
              <img
                src={`/images/tiles/${item.img}.webp`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: "50% 25%" }}
                loading="lazy"
                draggable={false}
              />
              {/* Navy tint — lifts when open, like the desktop hover */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-700"
                style={{ background: "rgba(13,17,40,0.55)", opacity: isOpen ? 0 : 0.7 }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(13,17,40,0.30) 0%, rgba(13,17,40,0.05) 40%, rgba(13,17,40,0.30) 70%, rgba(13,17,40,0.60) 100%)",
                }}
              />
              <span className="absolute top-4 right-4 eyebrow text-white/70">/ {item.idx}</span>

              {/* Title — pinned to the strip's bottom-left in both states */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className="font-display font-bold text-ink"
                    style={{ fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.3 }}
                  >
                    <span style={sticker}>{item.title}</span>
                  </h3>
                  {/* Chevron — flips when open */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-500"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                  >
                    <path
                      d="M4 7l5 5 5-5"
                      stroke="#F5F5F7"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  </svg>
                </div>

                {/* Expanded content — fades in below the title */}
                <div
                  className="transition-all duration-500 overflow-hidden"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    maxHeight: isOpen ? 360 : 0,
                    transform: isOpen ? "none" : "translateY(8px)",
                    pointerEvents: "none",
                  }}
                >
                  <p className="mt-2 text-ink/90" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    <span style={sticker}>{item.body}</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                          className="mt-0.5 shrink-0"
                        >
                          <circle cx="8" cy="8" r="7.25" stroke="#38BDF8" strokeWidth="1.2" opacity="0.6" />
                          <path
                            d="M5 8.2l2 2L11 6.4"
                            stroke="#38BDF8"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-ink/90" style={{ ...sticker, fontSize: 13.5, lineHeight: 1.45 }}>
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
