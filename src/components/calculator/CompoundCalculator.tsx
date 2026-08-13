import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { futureValue } from "~/lib/finance";
import { ControlCell, StageGlow, glass, useMoney, interpolate, pluralKey } from "./fields";

const STORE_KEY = "taupi:cc:v1";
const CONTRIB_COLOR = "#5A6BFF"; // brand — the money you put in
const GROWTH_COLOR = "#2DD4A7"; // success — the money interest earned

// Chart geometry (viewBox units — the SVG scales responsively)
const W = 640;
const H = 320;
const PAD = { t: 16, r: 14, b: 30, l: 14 };

const shortMoney = (n: number) =>
  n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${Math.round(n)}`;

/**
 * Compound interest calculator. The hero is the growth curve itself: a
 * stacked SVG area chart — contributions layer with the interest layer
 * rising on top of it, and a marker for the year interest starts earning
 * more than you deposit. Controls sit below as one instrument strip.
 */
export default function CompoundCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const money = useMoney(locale);

  const [start, setStart] = useState(0);
  const [monthly, setMonthly] = useState(150);
  const [ret, setRet] = useState(6);
  const [years, setYears] = useState(20);

  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.start === "number") setStart(Math.max(0, s.start));
        if (typeof s.monthly === "number") setMonthly(Math.max(0, s.monthly));
        if (typeof s.ret === "number") setRet(Math.min(15, Math.max(0, s.ret)));
        if (typeof s.years === "number") setYears(Math.min(40, Math.max(1, Math.round(s.years))));
      }
    } catch {}
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ start, monthly, ret, years }));
    } catch {}
  }, [start, monthly, ret, years]);

  const valid = (monthly > 0 || start > 0) && years > 0;
  const r = futureValue(start, monthly, ret, years * 12);

  // Yearly samples for the chart + the first year the interest layer
  // out-earns that year's deposits (growth delta > contribution delta).
  const samples = Array.from({ length: years + 1 }, (_, i) => {
    const v = futureValue(start, monthly, ret, i * 12);
    return { year: i, contributed: v.contributed, future: v.future };
  });
  let crossoverYear: number | null = null;
  for (let i = 1; i <= years; i++) {
    const growthDelta =
      samples[i].future - samples[i].contributed - (samples[i - 1].future - samples[i - 1].contributed);
    const contribDelta = samples[i].contributed - samples[i - 1].contributed;
    if (growthDelta > contribDelta && contribDelta > 0) {
      crossoverYear = i;
      break;
    }
  }

  const maxV = Math.max(1, samples[years].future);
  const x = (year: number) => PAD.l + (year / years) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / maxV) * (H - PAD.t - PAD.b);
  const baseline = y(0);

  const linePath = (key: "contributed" | "future") =>
    samples.map((s, i) => `${i === 0 ? "M" : "L"}${x(s.year).toFixed(1)} ${y(s[key]).toFixed(1)}`).join(" ");
  const contribArea = `${linePath("contributed")} L${x(years).toFixed(1)} ${baseline} L${x(0).toFixed(1)} ${baseline} Z`;
  const growthArea = `${linePath("future")} ${samples
    .slice()
    .reverse()
    .map((s) => `L${x(s.year).toFixed(1)} ${y(s.contributed).toFixed(1)}`)
    .join(" ")} Z`;

  const yearTicks = years >= 10 ? [0, Math.round(years / 2), years] : [0, years];

  const sentence = valid
    ? interpolate(t[pluralKey(locale, years, "cc.sentence")], {
        years,
        future: money(r.future),
        growth: money(Math.max(0, r.growth)),
      })
    : "";

  return (
    <div>
      {valid ? (
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
          <StageGlow color="rgba(45,212,167,0.10)" />

          {/* The answer */}
          <div>
            <p className="eyebrow mb-3">{t["cc.result"]}</p>
            <p
              className="font-display font-extrabold tracking-tightest tabular-nums"
              style={{ fontSize: "clamp(52px, 6vw, 92px)", color: GROWTH_COLOR, lineHeight: 0.95 }}
            >
              ~{money(r.future)}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span
                className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] text-dim"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: CONTRIB_COLOR }} />
                {t["cc.contrib"]}
                <span className="font-mono text-ink tabular-nums">{money(r.contributed)}</span>
              </span>
              <span
                className="flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] text-dim"
                style={{ background: "rgba(45,212,167,0.08)", border: "1px solid rgba(45,212,167,0.25)" }}
              >
                <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: GROWTH_COLOR }} />
                {t["cc.growth"]}
                <span className="font-mono text-ink tabular-nums">+{money(Math.max(0, r.growth))}</span>
              </span>
            </div>

            <p
              className="mt-7 pl-3 text-[14.5px] text-ink max-w-[46ch]"
              style={{ borderLeft: `2px solid ${GROWTH_COLOR}`, lineHeight: 1.6 }}
              aria-live="polite"
            >
              {sentence}
            </p>
          </div>

          {/* The curve */}
          <div>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
              role="img"
              aria-label={sentence}
            >
              <defs>
                <linearGradient id="cc-growth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GROWTH_COLOR} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={GROWTH_COLOR} stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="cc-contrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CONTRIB_COLOR} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={CONTRIB_COLOR} stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* hairline grid */}
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y(maxV * f)}
                  y2={y(maxV * f)}
                  stroke="rgba(255,255,255,0.06)"
                />
              ))}
              <line x1={PAD.l} x2={W - PAD.r} y1={baseline} y2={baseline} stroke="rgba(255,255,255,0.14)" />

              <path d={growthArea} fill="url(#cc-growth)" />
              <path d={contribArea} fill="url(#cc-contrib)" />
              <path d={linePath("contributed")} fill="none" stroke={CONTRIB_COLOR} strokeWidth="2" />
              <path d={linePath("future")} fill="none" stroke={GROWTH_COLOR} strokeWidth="2.5" strokeLinecap="round" />

              {/* end dot on the total */}
              <circle cx={x(years)} cy={y(r.future)} r="4.5" fill={GROWTH_COLOR} />

              {/* crossover: the year interest out-earns your deposits */}
              {crossoverYear !== null && crossoverYear < years && (
                <g>
                  <line
                    x1={x(crossoverYear)}
                    x2={x(crossoverYear)}
                    y1={PAD.t + 14}
                    y2={baseline}
                    stroke="rgba(245,245,247,0.35)"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={x(crossoverYear)}
                    y={PAD.t + 6}
                    textAnchor="middle"
                    fill="#A8A8B3"
                    style={{ font: "500 10.5px 'JetBrains Mono', monospace", letterSpacing: "0.08em" }}
                  >
                    {t["cc.crossover"]} · {crossoverYear}
                  </text>
                </g>
              )}

              {/* axis labels */}
              {yearTicks.map((yr) => (
                <text
                  key={yr}
                  x={x(yr)}
                  y={H - 8}
                  textAnchor={yr === 0 ? "start" : yr === years ? "end" : "middle"}
                  fill="#64646F"
                  style={{ font: "500 11px 'JetBrains Mono', monospace" }}
                >
                  {yr}
                </text>
              ))}
              <text
                x={PAD.l}
                y={y(maxV) + 4}
                textAnchor="start"
                fill="#64646F"
                style={{ font: "500 11px 'JetBrains Mono', monospace" }}
              >
                {shortMoney(maxV)}
              </text>
            </svg>
            <p className="mt-1 text-right font-mono text-[10.5px] tracking-[0.14em] uppercase text-muted">
              {t["cc.chart.years"]}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-dim text-[15px]">{t["cc.enter"]}</p>
      )}

      {/* Instrument strip */}
      <div
        className="mt-12 rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-7"
        style={glass}
      >
        <ControlCell label={t["cc.start"]} value={start} onChange={setStart} min={0} max={20000} step={100} />
        <ControlCell label={t["cc.monthly"]} value={monthly} onChange={setMonthly} min={0} max={1000} step={10} />
        <ControlCell
          label={t["bc.invest.return"]}
          value={ret}
          onChange={setRet}
          min={0}
          max={15}
          step={0.5}
          suffix="%"
          hardClamp
          fill="#2DD4A7"
        />
        <ControlCell
          label={t["bc.invest.years"]}
          value={years}
          onChange={setYears}
          min={1}
          max={40}
          suffix={locale === "lv" ? "g." : "y"}
          hardClamp
          fill="#2DD4A7"
        />
      </div>

      <p className="mt-4 text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
        {t["bc.invest.note"]}
      </p>
    </div>
  );
}
