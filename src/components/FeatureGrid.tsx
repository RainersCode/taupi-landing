import { motion } from "motion/react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Editorial 3-column feature grid. Each tile is an image + eyebrow + title +
 * body. Stagger-fades in on scroll-into-view. Image zooms subtly on hover —
 * the kind of detail Apple uses to tell you "this card is alive."
 */
export default function FeatureGrid({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  const items = [
    {
      key: "ai",
      idx: "01",
      img: "/images/feature-insights.png",
      alt: "",
      title: t["features.ai.title"],
      body: t["features.ai.body"],
    },
    {
      key: "scan",
      idx: "02",
      img: "/images/feature-scan.png",
      alt: "",
      title: t["features.scan.title"],
      body: t["features.scan.body"],
    },
    {
      key: "trend",
      idx: "03",
      img: "/images/feature-trend.png",
      alt: "",
      title: t["features.trend.title"],
      body: t["features.trend.body"],
    },
  ];

  return (
    <section id="features" className="relative py-20 md:py-32 px-4 md:px-10 border-t border-white/5">
      <div className="mx-auto max-w-content">
        {/* Section heading */}
        <div className="flex items-baseline gap-6 mb-16">
          <span className="eyebrow">{t["features.eyebrow"]}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {items.map((item, i) => (
            <motion.article
              key={item.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{
                duration: 0.9,
                delay: i * 0.1,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="group"
            >
              {/* Image with hover zoom */}
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-square bg-surface">
                <img
                  src={item.img}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                  draggable={false}
                />
                {/* Tile number tag — mono, top-left corner */}
                <span
                  className="absolute top-4 left-4 eyebrow text-white/80"
                  style={{
                    textShadow: "0 1px 8px rgba(0,0,0,0.35)",
                  }}
                >
                  / {item.idx}
                </span>
              </div>

              {/* Title */}
              <h3
                className="font-display font-bold text-ink"
                style={{
                  fontSize: "clamp(22px, 2.1vw, 30px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </h3>

              {/* Body */}
              <p className="mt-3 text-dim leading-relaxed" style={{ fontSize: "15px" }}>
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
