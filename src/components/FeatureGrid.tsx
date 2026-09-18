import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Iespēju karuselis — Wise atsauksmju sekcijas izkārtojums (2026-09-18):
 * galvene un navigācijas bultiņas pa kreisi, horizontāli ritināmas kartes
 * pa labi, kas apzināti iziet pāri labajai malai (rāda, ka ir vēl).
 *
 * Kartes mijas divos toņos — brand pildījums un klusā virsma — tāpat kā
 * Wise mija gaišo un tumšo zaļo. Katrā kartē: ikonas aplis, nosaukums,
 * viens teikums un trīs fakti.
 *
 * Ritināšana ir native scroll-snap (darbojas ar pirkstu un trackpad); pogas
 * tikai pagrūž to par vienu karti, tāpēc bez JS karuselis paliek lietojams.
 */

/* Ikonas — 24px kontūras, viena katrai iespējai. */
const ICONS: Record<string, JSX.Element> = {
  budget: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 1 8.5 8.5" />
      <path d="M12 12l3.5-3.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  scan: (
    <>
      <path d="M6 3.5h12v15.2l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z" />
      <path d="M9 8h6M9 11.5h6" />
    </>
  ),
  insights: (
    <path d="M12 3.5c.7 3.9 2.6 5.8 6.5 6.5-3.9.7-5.8 2.6-6.5 6.5-.7-3.9-2.6-5.8-6.5-6.5 3.9-.7 5.8-2.6 6.5-6.5zM18.5 16.5c.3 1.6 1 2.3 2.5 2.5-1.5.2-2.2.9-2.5 2.5-.3-1.6-1-2.3-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z" />
  ),
  goals: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  invest: (
    <>
      <path d="M3.5 17.5l5-5 3.5 3 8-8.5" />
      <path d="M15.5 7h4.5v4.5" />
    </>
  ),
  challenges: (
    <path d="M12 4c.4 2.8-.9 4.3-2.3 5.7C8.2 11.2 7 12.7 7 14.7a5 5 0 0 0 10 0c0-1.5-.5-2.7-1.4-3.8-.4 1-1 1.7-1.9 2.1.5-2.6-.3-5.3-1.7-9z" />
  ),
};

const KEYS = ["budget", "scan", "insights", "goals", "invest", "challenges"];

export default function FeatureGrid({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = KEYS.map((key) => ({
    key,
    title: t[`features.${key}.title`],
    body: t[`features.${key}.body`],
    points: [1, 2, 3].map((n) => t[`features.${key}.p${n}`]),
  }));

  const syncEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, [syncEdges]);

  // Solis = vienas kartes platums + atstarpe, nolasīts no DOM, lai
  // responsīvie izmēri nav jādublē JS pusē.
  //
  // Animācija ir pašu rakstīta (rAF + ease-out-cubic), nevis native
  // `behavior: "smooth"`: ar scroll-snap-mandatory pārlūks native gadījumā
  // pārtver kustību un pārlec uz snap punktu bez pārejas. Snap uz laiku
  // izslēdzam un atliekam atpakaļ, kad animācija beigusies.
  const animating = useRef(false);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el || animating.current) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;

    const from = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    const to = Math.max(0, Math.min(max, from + dir * step));
    if (Math.abs(to - from) < 1) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollLeft = to;
      syncEdges();
      return;
    }

    animating.current = true;
    el.style.scrollSnapType = "none";
    const start = performance.now();
    const dur = 520;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.scrollLeft = from + (to - from) * eased;
      syncEdges();
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.style.scrollSnapType = "";
        animating.current = false;
      }
    };
    requestAnimationFrame(tick);
  };

  const arrow =
    "flex h-14 w-14 items-center justify-center rounded-full transition-colors disabled:opacity-35 disabled:cursor-default";

  return (
    // z-20: ProductReveal sticky slāņi virs šīs sekcijas nes z-index 10..13,
    // un pārejas brīdī pēdējais no tiem uzkrāsojās pāri karšu virsrakstam
    // (mobilajā "Dienas" izskatījās tumšs). Sekcija tagad vienmēr virsū.
    <section id="features" className="relative z-20 border-t border-frost/5 py-24 md:py-32 overflow-hidden">
      {/* Full-bleed: kartes turpinās līdz paša ekrāna malai (Wise raksts),
          tāpēc sekcija NAV max-w-content konteinerā. Kreisā mala tā vietā
          rēķināta tā, lai galvene stāv precīzi zem pārējās lapas satura:
          konteinera nobīde + tā paša 40px paddinga; mobilajā fiksēti 24px. */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] gap-12 lg:gap-14 items-center"
        style={{ paddingLeft: "max(1.5rem, calc((100vw - 1440px) / 2 + 2.5rem))" }}
      >
          {/* Kreisā puse — galvene un navigācija */}
          <div className="pr-6 md:pr-10 lg:pr-0">
            <p className="eyebrow mb-6">{t["features.eyebrow"]}</p>
            <h2
              className="font-display font-extrabold text-ink"
              style={{ fontSize: "clamp(32px, 4.2vw, 60px)", letterSpacing: "-0.035em", lineHeight: 1.04 }}
            >
              {t["features.title"]}
            </h2>
            <p className="mt-6 text-dim max-w-[44ch]" style={{ lineHeight: 1.65 }}>
              {t["features.sub"]}
            </p>

            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={() => page(-1)}
                disabled={atStart}
                aria-label={locale === "lv" ? "Iepriekšējā" : "Previous"}
                className={`${arrow} bg-frost/[0.07] text-ink hover:bg-frost/[0.12]`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M11 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => page(1)}
                disabled={atEnd}
                aria-label={locale === "lv" ? "Nākamā" : "Next"}
                className={`${arrow} bg-brand hover:bg-brand-deep`}
                style={{ color: "#fff" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Labā puse — ritināmās kartes; skrien līdz ekrāna labajai malai.
              Kreisā atstarpe nāk no vecāka paddinga, tāpēc te tās nav (un
              līdz ar to arī nav scroll-snap/padding konflikta). */}
          <div
            ref={scroller}
            onScroll={syncEdges}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 pr-6"
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((item, i) => {
              // Mija kā Wise gaišajam/tumšajam zaļajam: brand pildījums pret
              // kluso virsmu. Tekstu krāsas attiecīgi uz brand vai uz lapas.
              const filled = i % 2 === 0;
              return (
                <article
                  key={item.key}
                  className={`snap-start shrink-0 w-[290px] sm:w-[320px] min-h-[430px] rounded-3xl p-7 flex flex-col ${
                    filled ? "" : "border border-frost/[0.08]"
                  }`}
                  style={
                    filled
                      ? { background: "rgb(var(--brand-rgb))" }
                      : { background: "rgb(var(--surface-rgb))" }
                  }
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={
                      filled
                        ? { background: "rgba(255,255,255,0.16)", color: "#fff" }
                        : { background: "rgb(var(--brand-rgb) / 0.12)", color: "rgb(var(--brand-rgb))" }
                    }
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {ICONS[item.key]}
                    </svg>
                  </span>

                  <h3
                    className="mt-7 font-display font-bold"
                    style={{
                      fontSize: 22,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      color: filled ? "#fff" : "rgb(var(--ink-rgb))",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-3 text-[14.5px]"
                    style={{
                      lineHeight: 1.6,
                      color: filled ? "rgba(255,255,255,0.82)" : "rgb(var(--dim-rgb))",
                    }}
                  >
                    {item.body}
                  </p>

                  <ul
                    className="mt-auto pt-6 space-y-2.5 text-[13px]"
                    style={{
                      borderTop: filled
                        ? "1px solid rgba(255,255,255,0.18)"
                        : "1px solid rgb(var(--frost-rgb) / 0.09)",
                      color: filled ? "rgba(255,255,255,0.88)" : "rgb(var(--dim-rgb))",
                    }}
                  >
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="mt-[3px] shrink-0"
                          style={{ color: filled ? "#fff" : "rgb(var(--brand-rgb))" }}
                        >
                          <path d="M4 12.5l5 5L20 6.5" />
                        </svg>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
      </div>
    </section>
  );
}
