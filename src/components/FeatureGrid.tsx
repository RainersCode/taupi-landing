import { motion } from "motion/react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Six equal feature tiles, 3 columns on desktop. Each tile is a generated
 * abstract background in brand colors with the title always visible; on
 * hover the image eases in closer, the scrim deepens and the description
 * reveals. Touch/mobile gets the description statically — hover is a
 * desktop luxury, not a requirement.
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
    <section id="features" className="relative py-20 md:py-32 px-4 md:px-10 border-t border-white/5">
      <div className="mx-auto max-w-content">
        {/* Section heading */}
        <div className="flex items-baseline gap-6 mb-16">
          <span className="eyebrow">{t["features.eyebrow"]}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Equal-tile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, i) => (
            <motion.article
              key={item.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.9,
                delay: (i % 3) * 0.1,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-surface"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Generated background — eases closer on hover */}
              <img
                src={`/images/tiles/${item.img}.webp`}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                loading="lazy"
                draggable={false}
              />

              {/* Scrim — always grounds the title, deepens on hover for the body */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500 opacity-80 md:opacity-60 md:group-hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(13,17,40,0.25) 0%, rgba(13,17,40,0) 35%, rgba(13,17,40,0.55) 70%, rgba(13,17,40,0.92) 100%)",
                }}
              />

              {/* Index — top-left */}
              <span className="absolute top-5 left-5 eyebrow text-white/60">/ {item.idx}</span>

              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <h3
                  className="font-display font-bold text-ink transition-transform duration-500 ease-out md:group-hover:-translate-y-1"
                  style={{
                    fontSize: "clamp(20px, 1.8vw, 26px)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {item.title}
                </h3>
                {/* Description — static on mobile, hover-revealed on desktop */}
                <p
                  className="mt-2 text-dim leading-relaxed transition-all duration-500 ease-out md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0"
                  style={{ fontSize: "14px" }}
                >
                  {item.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
