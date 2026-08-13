import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { debtPayoff, type DebtPayoffResult } from "~/lib/finance";
import { debtPayoffSeries } from "~/lib/finance-web";
import { ControlCell, MoneyField, StageGlow, glass, useMoney, interpolate, pluralKey, futureMonth } from "./fields";

const STORE_KEY = "taupi:dp:v1";
const MAX_DEBTS = 6;
const SNOW_COLOR = "#7C8CFF";
const AVAL_COLOR = "#38BDF8";

// Chart geometry (viewBox units — scales responsively)
const W = 640;
const H = 320;
const PAD = { t: 16, r: 14, b: 30, l: 14 };

const shortMoney = (n: number) =>
  n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${Math.round(n)}`;

type Row = { id: string; balance: number; apr: number; min: number };

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Defaults where snowball and avalanche differ (the big debt is the high-APR
// one), so the tool's whole point is visible on first open — same as the app.
const DEFAULT_ROWS: () => Row[] = () => [
  { id: newId(), balance: 2000, apr: 9, min: 50 },
  { id: newId(), balance: 8000, apr: 22, min: 150 },
];

const isRows = (v: unknown): v is Row[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (r) =>
      r &&
      typeof r.id === "string" &&
      typeof r.balance === "number" &&
      typeof r.apr === "number" &&
      typeof r.min === "number",
  );

/**
 * Debt payoff calculator. The hero is a race: two balance lines falling to
 * zero (snowball vs avalanche) with the saving as a giant figure. Debts are
 * edited in the instrument strip below.
 */
export default function DebtPayoffCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const money = useMoney(locale);

  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);
  const [extra, setExtra] = useState(150);

  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (isRows(s.rows)) setRows(s.rows);
        if (typeof s.extra === "number") setExtra(Math.max(0, s.extra));
      }
    } catch {}
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ rows, extra }));
    } catch {}
  }, [rows, extra]);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((prev) => (prev.length >= MAX_DEBTS ? prev : [...prev, { id: newId(), balance: 0, apr: 0, min: 0 }]));
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const debts = rows
    .map((r) => ({ balance: r.balance, aprPct: r.apr, minPayment: r.min }))
    .filter((d) => d.balance > 0 && d.minPayment > 0);

  const snow = debts.length ? debtPayoff(debts, extra, "snowball") : null;
  const aval = debts.length ? debtPayoff(debts, extra, "avalanche") : null;
  const snowSeries = debts.length ? debtPayoffSeries(debts, extra, "snowball") : null;
  const avalSeries = debts.length ? debtPayoffSeries(debts, extra, "avalanche") : null;

  // Rounded like the displayed values, so a sub-€1 gap never names a winner.
  const gap = snow && aval ? Math.round(snow.totalInterest) - Math.round(aval.totalInterest) : 0;
  const winnerKey = gap > 0 ? "dp.avalanche" : "dp.snowball";

  // ── Chart ──
  const maxMonths = Math.max(snowSeries?.length ?? 0, avalSeries?.length ?? 0) - 1;
  const startBalance = Math.max(snowSeries?.[0] ?? 0, avalSeries?.[0] ?? 0, 1);
  const x = (m: number) => PAD.l + (m / Math.max(1, maxMonths)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / startBalance) * (H - PAD.t - PAD.b);
  const baseline = y(0);
  const linePath = (series: number[]) =>
    series.map((v, m) => `${m === 0 ? "M" : "L"}${x(m).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  // Year ticks every 12 months, thinned so labels never collide.
  const yearStep = maxMonths > 96 ? 24 : 12;
  const yearTicks: number[] = [];
  for (let m = yearStep; m <= maxMonths; m += yearStep) yearTicks.push(m);

  const chip = (nameKey: "dp.snowball" | "dp.avalanche", result: DebtPayoffResult | null, color: string) => {
    const cheapest = gap !== 0 && ((nameKey === "dp.avalanche") === gap > 0);
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${cheapest ? "rgba(45,212,167,0.45)" : "rgba(255,255,255,0.10)"}`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-dim">
            <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {t[nameKey]}
          </span>
          {cheapest && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-mono font-medium tracking-[0.08em] uppercase"
              style={{ background: "rgba(45,212,167,0.12)", color: "#2DD4A7" }}
            >
              ✓ {t["dp.cheapest"]}
            </span>
          )}
        </div>
        {result && (
          <>
            <p className="mt-3 text-[13.5px] font-medium text-ink tabular-nums" style={{ lineHeight: 1.45 }}>
              {interpolate(t[pluralKey(locale, result.months, "dp.free")], {
                n: result.months,
                date: futureMonth(locale, result.months),
              })}
            </p>
            <p className="mt-1 text-[12.5px] text-dim tabular-nums">
              {interpolate(t["dp.interest"], { amount: money(result.totalInterest) })}
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      {debts.length === 0 ? (
        <p className="text-dim text-[15px]">{t["dp.enter"]}</p>
      ) : !snow || !aval || !snowSeries || !avalSeries ? (
        <p className="text-[15px] max-w-[52ch]" style={{ color: "#FF3B87", lineHeight: 1.6 }}>
          {t["dp.never"]}
        </p>
      ) : (
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
          <StageGlow color="rgba(56,189,248,0.09)" />

          {/* The answer */}
          <div>
            <p className="eyebrow mb-3">
              {gap === 0 ? t["dp.tie.label"] : interpolate(t["dp.saves.label"], { name: t[winnerKey] })}
            </p>
            <p
              className="font-display font-extrabold tracking-tightest tabular-nums"
              style={{
                fontSize: "clamp(52px, 6vw, 92px)",
                color: gap === 0 ? "#F5F5F7" : "#2DD4A7",
                lineHeight: 0.95,
              }}
            >
              {money(gap === 0 ? aval.totalInterest : Math.abs(gap))}
            </p>
            {gap === 0 && (
              <p className="mt-4 text-[13.5px] text-dim max-w-[44ch]" style={{ lineHeight: 1.6 }}>
                {t["dp.same"]}
              </p>
            )}

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3" aria-live="polite">
              {chip("dp.snowball", snow, SNOW_COLOR)}
              {chip("dp.avalanche", aval, AVAL_COLOR)}
            </div>
          </div>

          {/* The race to zero */}
          <div>
            <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-2">
              {t["dp.chart"]}
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t["dp.chart"]}>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y(startBalance * f)}
                  y2={y(startBalance * f)}
                  stroke="rgba(255,255,255,0.06)"
                />
              ))}
              <line x1={PAD.l} x2={W - PAD.r} y1={baseline} y2={baseline} stroke="rgba(255,255,255,0.14)" />

              <path
                d={linePath(snowSeries)}
                fill="none"
                stroke={SNOW_COLOR}
                strokeWidth={gap < 0 ? 3 : 2}
                strokeLinecap="round"
                opacity={gap > 0 ? 0.75 : 1}
              />
              <path
                d={linePath(avalSeries)}
                fill="none"
                stroke={AVAL_COLOR}
                strokeWidth={gap > 0 ? 3 : 2}
                strokeLinecap="round"
                opacity={gap < 0 ? 0.75 : 1}
              />

              {/* touchdown dots — the debt-free moments */}
              <circle cx={x(snowSeries.length - 1)} cy={baseline} r="4.5" fill={SNOW_COLOR} />
              <circle cx={x(avalSeries.length - 1)} cy={baseline} r="4.5" fill={AVAL_COLOR} />

              <text
                x={W - PAD.r}
                y={y(startBalance) + 4}
                textAnchor="end"
                fill="#64646F"
                style={{ font: "500 11px 'JetBrains Mono', monospace" }}
              >
                {shortMoney(startBalance)}
              </text>
              {yearTicks.map((m) => (
                <g key={m}>
                  <line x1={x(m)} x2={x(m)} y1={baseline} y2={baseline + 4} stroke="rgba(255,255,255,0.25)" />
                  <text
                    x={x(m)}
                    y={H - 8}
                    textAnchor="middle"
                    fill="#64646F"
                    style={{ font: "500 11px 'JetBrains Mono', monospace" }}
                  >
                    {m / 12}{locale === "lv" ? " g." : "y"}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Instrument strip: the debts + the extra amount */}
      <div className="mt-12 rounded-3xl p-6 md:p-8" style={glass}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-10">
          <div>
            <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-5">
              {t["dp.debts"]}
            </p>
            <div className="flex flex-wrap items-start gap-x-10 gap-y-6">
              {rows.map((row, i) => (
                <div key={row.id} className="w-full sm:w-[300px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-dim">
                      {interpolate(t["dp.debt.n"], { n: i + 1 })}
                    </p>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        aria-label={t["dp.remove"]}
                        title={t["dp.remove"]}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                          <path d="M2 2l7 7M9 2L2 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <MoneyField label={t["dp.balance"]} value={row.balance} onChange={(v) => update(row.id, { balance: v })} />
                    <MoneyField label={t["dp.apr"]} value={row.apr} onChange={(v) => update(row.id, { apr: v })} unit="%" max={100} />
                    <MoneyField label={t["dp.min"]} value={row.min} onChange={(v) => update(row.id, { min: v })} />
                  </div>
                </div>
              ))}
              {rows.length < MAX_DEBTS && (
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-brand-light hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {t["dp.add"]}
                </button>
              )}
            </div>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-10">
            <ControlCell
              label={t["dp.extra"]}
              value={extra}
              onChange={setExtra}
              min={0}
              max={1000}
              step={10}
              hint={t["dp.extra.hint"]}
              fill="#38BDF8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
