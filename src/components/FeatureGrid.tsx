import { useId, useState } from "react";
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

/* Check icon for feature points — a mini navy "sticker" chip with a
   cyan→indigo gradient ring + check, echoing the highlighter treatment
   on the text. useId keeps gradient defs unique per instance. */
function CheckChip({ size = 17 }: { size?: number }) {
  const grad = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0"
      style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <linearGradient id={grad} x1="2" y1="2" x2="16" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#5A6BFF" />
        </linearGradient>
      </defs>
      <rect
        x="0.75"
        y="0.75"
        width="16.5"
        height="16.5"
        rx="5.5"
        fill="rgba(13,17,40,0.85)"
        stroke={`url(#${grad})`}
        strokeWidth="1.2"
        strokeOpacity="0.75"
      />
      <path
        d="M5.4 9.4l2.3 2.3 4.9-5.2"
        stroke={`url(#${grad})`}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
            className="group relative overflow-hidden flex-1 hover:flex-[3.2] transition-[flex-grow] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer"
          >
            {/* Fixed-size, center-anchored image: sized to the fully-expanded
                panel so it never rescales while flex-grow animates — the
                panel just clips more/less of a static compositor layer.
                Re-cropping six 1200×2150 bitmaps per frame was janking
                low-end machines. max-w-none beats preflight's max-width. */}
            <img
              src={`/images/tiles/${item.img}.webp`}
              srcSet={`/images/tiles/${item.img}-640.webp 640w, /images/tiles/${item.img}.webp 1200w`}
              sizes="(min-width: 768px) 42vw, 100vw"
              alt=""
              className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[42vw] max-w-none object-cover will-change-transform"
              loading="lazy"
              decoding="async"
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
            <div className="absolute bottom-0 left-0 p-8 w-[480px] max-w-full opacity-0 translate-y-3 transition-[opacity,transform] duration-200 delay-0 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:duration-500 group-hover:delay-200 pointer-events-none">
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
                    <CheckChip size={17} />
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
              className="relative overflow-hidden cursor-pointer transition-[height] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ height: isOpen ? 460 : 92 }}
              onClick={() => setOpen(isOpen ? null : i)}
              role="button"
              aria-expanded={isOpen}
            >
              {/* Fixed-height image (open-state size) — same trick as the
                  desktop curtain: the strip clips a static layer instead of
                  re-cropping the bitmap on every frame of the height anim. */}
              <img
                src={`/images/tiles/${item.img}.webp`}
                srcSet={`/images/tiles/${item.img}-640.webp 640w, /images/tiles/${item.img}.webp 1200w`}
                sizes="(min-width: 768px) 42vw, 100vw"
                alt=""
                className="absolute top-0 left-0 w-full h-[460px] max-w-none object-cover will-change-transform"
                style={{ objectPosition: "50% 25%" }}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              {/* Navy tint — lifts when open, like the desktop hover.
                  Same duration + curve as the height animation so the
                  darkening glides in step with the strip closing. */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{ background: "rgba(13,17,40,0.55)", opacity: isOpen ? 0 : 0.7 }}
              />
              {/* Bottom scrim — fixed 460px height pinned to the bottom edge,
                  so the gradient travels with the (bottom-anchored) title
                  instead of its % stops squashing every frame while the
                  strip height animates. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[460px]"
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
                    {/* Sticker bg only when open — closed strips already sit
                        under the heavy navy tint, so the title reads fine
                        bare. Padding stays constant → no layout shift; only
                        the background color cross-fades with the strip. */}
                    <span
                      style={{
                        ...sticker,
                        background: isOpen
                          ? "rgba(13, 17, 40, 0.78)"
                          : "rgba(13, 17, 40, 0)",
                        transition: "background-color 700ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                      }}
                    >
                      {item.title}
                    </span>
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

                {/* Expanded content — 0fr→1fr grid-rows animates to the exact
                    content height with the SAME duration + curve as the strip,
                    so the title glides instead of jumping (the old max-height
                    was 500ms/default-ease vs the strip's 700ms custom curve).
                    Text itself fades in late on open, instantly out on close. */}
                <div
                  className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    pointerEvents: "none",
                  }}
                >
                  <div className="overflow-hidden">
                    <div
                      className="transition-[opacity,transform] ease-out"
                      style={{
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? "none" : "translateY(8px)",
                        transitionDuration: isOpen ? "500ms" : "180ms",
                        transitionDelay: isOpen ? "200ms" : "0ms",
                      }}
                    >
                  <p className="mt-2 text-ink/90" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    <span style={sticker}>{item.body}</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <CheckChip size={16} />
                        <span className="text-ink/90" style={{ ...sticker, fontSize: 13.5, lineHeight: 1.45 }}>
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
