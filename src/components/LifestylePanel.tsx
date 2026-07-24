import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Full-bleed lifestyle panel — the emotional counterpoint to the product-y Hero.
 * Image drifts from scale 1.1 → 1.0 as you scroll through, classic Apple move.
 * Dark gradient from the left keeps overlay copy legible against any image crop.
 */
export default function LifestylePanel({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const ref = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax: as the section travels through the viewport, the
  // image zooms out slightly (0..1 progress → 1.1..1.0 scale + small y drift).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.0]);
  const yDrift = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    // Fills the 100vh sticky wrapper on all viewports so the image + quote
    // take the full screen on mobile too.
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-white/5 w-full h-full"
    >
      {/* Image + overlay — fills the entire 100vh section */}
      <div className="relative w-full h-full overflow-hidden">
        <motion.img
          src="/images/hero-lifestyle-1920.webp"
          srcSet="/images/hero-lifestyle-960.webp 960w, /images/hero-lifestyle-1920.webp 1920w"
          sizes="100vw"
          alt=""
          aria-hidden="true"
          style={{ scale, y: yDrift }}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
        />

        {/* Dark gradient from left so the quote stays readable regardless of crop */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(13,17,40,0.88) 0%, rgba(13,17,40,0.55) 35%, rgba(13,17,40,0.1) 65%, rgba(13,17,40,0) 100%)",
          }}
        />

        {/* Pull-quote */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-content w-full px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              className="max-w-[28ch]"
            >
              <blockquote
                className="font-display font-bold text-ink"
                style={{
                  fontSize: "clamp(22px, 2.8vw, 44px)",
                  lineHeight: 1.35,
                  letterSpacing: "-0.02em",
                }}
              >
                <span className="text-accent">&ldquo;</span>
                {/* Highlighter effect in the site's page background color
                    (#0D1128) — text reads on a dark navy "sticker" over the
                    photo, matching the rest of the site. box-decoration-break
                    clones per line for a marker-like pass. */}
                <span
                  style={{
                    background: "rgba(13, 17, 40, 0.78)",
                    boxDecorationBreak: "clone",
                    WebkitBoxDecorationBreak: "clone",
                    padding: "0.04em 0.22em",
                    borderRadius: "3px",
                  }}
                >
                  {t["lifestyle.quote"]}
                </span>
                <span className="text-accent">&rdquo;</span>
              </blockquote>
              <p className="mt-6 eyebrow text-dim">{t["lifestyle.attribution"]}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
