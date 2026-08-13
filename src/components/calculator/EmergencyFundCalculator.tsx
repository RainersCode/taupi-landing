import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { emergencyFund, monthsToGoal } from "~/lib/finance";
import { MoneyField, SliderField, glass, useMoney, interpolate, pluralKey, futureMonth } from "./fields";

const STORE_KEY = "taupi:ef:v1";
const RING_SIZE = 200;
const RING_STROKE = 13;

/**
 * Emergency fund calculator — target = expenses × months (the app's
 * emergencyFund), plus a savings plan line (monthsToGoal at 0% — cash).
 * Signature: the progress ring, brand→accent while filling, success
 * when funded.
 */
export default function EmergencyFundCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const money = useMoney(locale);

  const [expenses, setExpenses] = useState(800);
  const [months, setMonths] = useState(6);
  const [customMonths, setCustomMonths] = useState(false);
  const [saved, setSaved] = useState(0);
  const [monthlySave, setMonthlySave] = useState(150);

  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.expenses === "number") setExpenses(Math.max(0, s.expenses));
        if (typeof s.months === "number") {
          const m = Math.min(24, Math.max(1, Math.round(s.months)));
          setMonths(m);
          if (m !== 3 && m !== 6) setCustomMonths(true);
        }
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

  // Plan: whole months at monthlySave to reach the target (cash → 0% return).
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
      ? interpolate(t["ef.summary.done"], { target: money(r.target) })
      : interpolate(t["ef.summary"], { target: money(r.target), short: money(r.shortfall) })
    : "";

  // Ring geometry
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = valid ? r.pct / 100 : 0;

  const monthChips = [
    { value: 3, desc: t["ef.months3"] },
    { value: 6, desc: t["ef.months6"] },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 lg:gap-14 items-start">
      {/* Inputs */}
      <div className="rounded-3xl p-6 md:p-8" style={glass}>
        <MoneyField
          label={t["ef.expenses"]}
          value={expenses}
          onChange={setExpenses}
          hint={t["ef.expenses.hint"]}
        />

        <p className="text-[12.5px] text-dim mb-2">{t["ef.months"]}</p>
        <div className="flex gap-2 mb-3">
          {monthChips.map((c) => {
            const on = !customMonths && months === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => {
                  setCustomMonths(false);
                  setMonths(c.value);
                }}
                aria-pressed={on}
                className={`flex-1 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  on ? "border-brand" : "border-white/10 hover:border-white/25"
                }`}
                style={{
                  border: `1px solid ${on ? "#5A6BFF" : "rgba(255,255,255,0.12)"}`,
                  background: on ? "rgba(90,107,255,0.12)" : "rgba(255,255,255,0.04)",
                }}
              >
                <span className={`block text-[14px] font-medium ${on ? "text-ink" : "text-dim"}`}>
                  {c.value} {t["ef.monthsShort"]}
                </span>
                <span className="block mt-0.5 text-[11.5px] text-muted" style={{ lineHeight: 1.4 }}>
                  {c.desc}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCustomMonths(true)}
            aria-pressed={customMonths}
            className="rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            style={{
              border: `1px solid ${customMonths ? "#5A6BFF" : "rgba(255,255,255,0.12)"}`,
              background: customMonths ? "rgba(90,107,255,0.12)" : "rgba(255,255,255,0.04)",
              color: customMonths ? "#F5F5F7" : "#A8A8B3",
            }}
          >
            {t["ef.custom"]}
          </button>
        </div>
        {customMonths && (
          <SliderField
            label={t["ef.months"]}
            value={months}
            onChange={setMonths}
            min={1}
            max={24}
            display={`${months} ${t["ef.monthsShort"]}`}
            fill="#5A6BFF"
          />
        )}

        <div className="mt-5">
          <MoneyField label={t["ef.saved"]} value={saved} onChange={setSaved} />
          <MoneyField label={t["ef.monthly"]} value={monthlySave} onChange={setMonthlySave} />
        </div>
      </div>

      {/* Result */}
      <div className="lg:sticky lg:top-28">
        {valid ? (
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Progress ring */}
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                role="img"
                aria-label={`${r.pct}%`}
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
                  stroke="rgba(255,255,255,0.08)"
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
                  style={{ transition: "stroke-dashoffset 400ms cubic-bezier(0.22, 0.8, 0.2, 1)" }}
                />
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  fill={funded ? "#2DD4A7" : "#F5F5F7"}
                  style={{ font: "800 34px Sora, system-ui, sans-serif", letterSpacing: "-0.02em" }}
                >
                  {funded ? "100%" : `${r.pct}%`}
                </text>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  fill="#A8A8B3"
                  style={{ font: "500 14px 'JetBrains Mono', monospace" }}
                >
                  {money(saved)}
                </text>
              </svg>

              <div>
                <p className="eyebrow mb-2">{t["ef.target"]}</p>
                <p
                  className="font-display font-extrabold tracking-tight tabular-nums"
                  style={{ fontSize: "clamp(36px, 4vw, 52px)", color: funded ? "#2DD4A7" : "#F5F5F7", lineHeight: 1 }}
                >
                  {money(r.target)}
                </p>
                <p className="mt-3 text-[14px] text-dim tabular-nums" style={{ lineHeight: 1.6 }} aria-live="polite">
                  {funded ? t["ef.funded"] : summary}
                </p>
              </div>
            </div>

            {planLine && (
              <p
                className="mt-8 pl-3 text-[14px] text-ink self-stretch"
                style={{ borderLeft: "2px solid #38BDF8", lineHeight: 1.6 }}
              >
                {planLine}
              </p>
            )}
          </div>
        ) : (
          <p className="text-dim text-[15px]">{t["ef.enter"]}</p>
        )}
      </div>
    </div>
  );
}
