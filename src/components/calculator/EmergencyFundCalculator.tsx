import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { emergencyFund, monthsToGoal } from "~/lib/finance";
import { ControlCell, FlowMoney, StageGlow, glass, useMoney, interpolate, pluralKey, futureMonth } from "./fields";

const STORE_KEY = "taupi:ef:v1";
const RING_SIZE = 280;
const RING_STROKE = 18;

/**
 * Emergency fund calculator. The hero pairs the giant target figure with
 * a large glowing progress ring — brand→accent while filling, success
 * when funded. Controls sit below as one instrument strip.
 */
export default function EmergencyFundCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const money = useMoney(locale);

  const [expenses, setExpenses] = useState(800);
  const [months, setMonths] = useState(6);
  const [saved, setSaved] = useState(0);
  const [monthlySave, setMonthlySave] = useState(150);

  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.expenses === "number") setExpenses(Math.max(0, s.expenses));
        if (typeof s.months === "number") setMonths(Math.min(24, Math.max(1, Math.round(s.months))));
        if (typeof s.saved === "number") setSaved(Math.max(0, s.saved));
        if (typeof s.monthlySave === "number") setMonthlySave(Math.max(0, s.monthlySave));
      }
    } catch {}
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ expenses, months, saved, monthlySave }));
    } catch {}
  }, [expenses, months, saved, monthlySave]);

  const valid = expenses > 0 && months > 0;
  const r = emergencyFund(expenses, months, saved);
  const funded = valid && r.shortfall <= 0;
  const accent = funded ? "#2DD4A7" : "#38BDF8";

  const planMonths = valid ? monthsToGoal(saved, monthlySave, r.target, 0) : null;
  const planLine =
    !valid || funded
      ? ""
      : planMonths === null || planMonths <= 0
        ? t["ef.plan.enter"]
        : interpolate(t[pluralKey(locale, planMonths, "ef.plan")], {
            monthly: money(monthlySave),
            n: planMonths,
            date: futureMonth(locale, planMonths),
          });

  const summary = valid
    ? funded
      ? t["ef.funded"]
      : interpolate(t["ef.summary"], { target: money(r.target), short: money(r.shortfall) })
    : "";

  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = valid ? r.pct / 100 : 0;

  return (
    <div>
      {valid ? (
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 lg:gap-14 items-center">
          <StageGlow color={funded ? "rgba(45,212,167,0.10)" : "rgba(56,189,248,0.10)"} />

          {/* The answer */}
          <div>
            <p className="eyebrow mb-3">{t["ef.target"]}</p>
            <p
              className="font-display font-extrabold tracking-tightest tabular-nums"
              style={{ fontSize: "clamp(52px, 6vw, 92px)", color: accent, lineHeight: 0.95 }}
            >
              <FlowMoney value={r.target} locale={locale} />
            </p>
            <p className="mt-5 text-[15px] text-dim tabular-nums" style={{ lineHeight: 1.6 }} aria-live="polite">
              {summary}
            </p>

            {planLine && (
              <p
                className="mt-7 pl-3 text-[14.5px] text-ink max-w-[46ch]"
                style={{ borderLeft: "2px solid #38BDF8", lineHeight: 1.6 }}
              >
                {planLine}
              </p>
            )}
          </div>

          {/* The ring — center content is an HTML overlay (flex-centered),
              not SVG <text>: baseline math never reads optically centered. */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="relative"
              style={{ width: RING_SIZE, height: RING_SIZE }}
              role="img"
              aria-label={`${r.pct}% — ${money(saved)}`}
            >
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ef-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5A6BFF" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth={RING_STROKE}
                />
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke={funded ? "#2DD4A7" : "url(#ef-grad)"}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress)}
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  style={{
                    transition: "stroke-dashoffset 400ms cubic-bezier(0.22, 0.8, 0.2, 1)",
                    filter: `drop-shadow(0 0 14px ${funded ? "rgba(45,212,167,0.35)" : "rgba(56,189,248,0.3)"})`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className="font-display font-extrabold tabular-nums"
                  style={{
                    fontSize: 54,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    color: funded ? "#2DD4A7" : "#F5F5F7",
                  }}
                >
                  <FlowMoney value={funded ? 100 : r.pct} locale={locale} prefix="" />
                  <span style={{ fontSize: 30, fontWeight: 700, color: "#64646F" }}>%</span>
                </span>
                <span className="mt-2 font-mono text-[15px] text-dim tabular-nums">
                  <FlowMoney value={saved} locale={locale} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-dim text-[15px]">{t["ef.enter"]}</p>
      )}

      {/* Instrument strip */}
      <div
        className="mt-12 rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-7"
        style={glass}
      >
        <ControlCell
          label={t["ef.expenses"]}
          value={expenses}
          onChange={setExpenses}
          min={0}
          max={3000}
          step={25}
          hint={t["ef.expenses.hint"]}
        />
        <ControlCell
          label={t["ef.months"]}
          value={months}
          onChange={setMonths}
          min={1}
          max={24}
          suffix={t["ef.monthsShort"]}
          hardClamp
          fill="#38BDF8"
          hint={t["ef.months.hint"]}
        />
        <ControlCell label={t["ef.saved"]} value={saved} onChange={setSaved} min={0} max={20000} step={100} />
        <ControlCell
          label={t["ef.monthly"]}
          value={monthlySave}
          onChange={setMonthlySave}
          min={0}
          max={1000}
          step={10}
        />
      </div>
    </div>
  );
}
