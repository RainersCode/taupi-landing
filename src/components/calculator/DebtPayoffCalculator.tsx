import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { debtPayoff, type DebtPayoffResult } from "~/lib/finance";
import { debtPayoffSeries } from "~/lib/finance-web";
import { ControlCell, StageGlow, glass, useMoney, interpolate, futureMonthShort } from "./fields";

const STORE_KEY = "taupi:dp:v1";
const MAX_DEBTS = 6;
// Line color encodes the verdict: the winning strategy is always success
// green (same green as the giant saving figure and the ✓), the other one a
// quiet indigo. On a tie both keep their neutral identities.
const WIN_COLOR = "#2DD4A7";
const LOSE_COLOR = "#7C8CFF";
const TIE_SNOW = "#7C8CFF";
const TIE_AVAL = "#38BDF8";

// Chart geometry (viewBox units — scales responsively)
const W = 640;
const H = 330;
const PAD = { t: 20, r: 14, b: 30, l: 14 };

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

/** Compact debt-card input: mono label, display-weight value, unit prefix. */
function DebtInput({
  label,
  value,
  onChange,
  unit = "€",
  max = 10_000_000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  max?: number;
}) {
  const rounded = Math.round(value * 100) / 100;
  const [text, setText] = useState(String(rounded));
  useEffect(() => {
    setText(String(rounded));
  }, [rounded]);
  const commit = () => {
    const parsed = Number.parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(0, parsed)));
    else setText(String(rounded));
  };
  return (
    <div>
      {/* Reserve two label lines and bottom-align the text, so a wrapping
          label ("Min. maksājums") never pushes its input out of row. */}
      <p className="font-mono text-[10px] font-medium tracking-[0.14em] uppercase text-muted mb-1.5 min-h-[27px] flex items-end">
        {label}
      </p>
      <div className="flex items-baseline gap-1 border-b border-white/12 focus-within:border-accent transition-colors pb-1">
        <span className="text-dim text-[13px]">{unit}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          aria-label={label}
          className="w-full min-w-0 bg-transparent font-display font-bold text-[19px] text-ink tracking-tight outline-none tabular-nums"
        />
      </div>
    </div>
  );
}

/**
 * Debt payoff calculator. The hero is a race: two balance curves falling to
 * zero, the winner in green, with the saving as a giant figure and a small
 * leaderboard instead of text chips. Debts are edited as cards below.
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
  const snowColor = gap === 0 ? TIE_SNOW : gap < 0 ? WIN_COLOR : LOSE_COLOR;
  const avalColor = gap === 0 ? TIE_AVAL : gap > 0 ? WIN_COLOR : LOSE_COLOR;

  // ── Chart ──
  const maxMonths = Math.max(snowSeries?.length ?? 0, avalSeries?.length ?? 0) - 1;
  const startBalance = Math.max(snowSeries?.[0] ?? 0, avalSeries?.[0] ?? 0, 1);
  const x = (m: number) => PAD.l + (m / Math.max(1, maxMonths)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / startBalance) * (H - PAD.t - PAD.b);
  const baseline = y(0);
  const linePath = (series: number[]) =>
    series.map((v, m) => `${m === 0 ? "M" : "L"}${x(m).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const areaPath = (series: number[]) =>
    `${linePath(series)} L${x(series.length - 1).toFixed(1)} ${baseline.toFixed(1)} L${x(0).toFixed(1)} ${baseline.toFixed(1)} Z`;
  const yearStep = maxMonths > 96 ? 24 : 12;
  const yearTicks: number[] = [];
  for (let m = yearStep; m <= maxMonths; m += yearStep) yearTicks.push(m);

  // ── Leaderboard rows (replaces the old wrapping text chips) ──
  const leaderRow = (
    nameKey: "dp.snowball" | "dp.avalanche",
    result: DebtPayoffResult,
    color: string,
    cheapest: boolean,
  ) => (
    <div
      className="grid items-center gap-x-3 px-4 py-3.5"
      style={{
        gridTemplateColumns: "minmax(0,1.5fr) minmax(0,0.9fr) minmax(0,1.1fr) minmax(0,0.9fr)",
        background: cheapest ? "rgba(45,212,167,0.07)" : "transparent",
      }}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span aria-hidden className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-ink truncate">
          {t[nameKey]}
        </span>
        {cheapest && (
          <span aria-hidden className="shrink-0 text-[12px]" style={{ color: WIN_COLOR }}>
            ✓
          </span>
        )}
      </span>
      <span className="font-display font-bold text-[17px] text-ink tabular-nums whitespace-nowrap">
        {result.months}
        <span className="ml-1 font-body font-normal text-[11.5px] text-muted">{t["ef.monthsShort"]}</span>
      </span>
      <span className="hidden sm:block font-mono text-[12px] text-dim tabular-nums whitespace-nowrap">
        {futureMonthShort(locale, result.months)}
      </span>
      <span
        className="font-mono text-[13.5px] tabular-nums text-right whitespace-nowrap"
        style={{ color: cheapest ? WIN_COLOR : "#F5F5F7" }}
      >
        {money(result.totalInterest)}
      </span>
    </div>
  );

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
          <StageGlow color="rgba(45,212,167,0.08)" />

          {/* The answer */}
          <div>
            <p className="eyebrow mb-3">
              {gap === 0 ? t["dp.tie.label"] : interpolate(t["dp.saves.label"], { name: t[winnerKey] })}
            </p>
            <p
              className="font-display font-extrabold tracking-tightest tabular-nums"
              style={{
                fontSize: "clamp(52px, 6vw, 92px)",
                color: gap === 0 ? "#F5F5F7" : WIN_COLOR,
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

            {/* Leaderboard */}
            <div
              className="mt-8 rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}
              aria-live="polite"
            >
              <div
                className="grid gap-x-3 px-4 pt-3 pb-2"
                style={{ gridTemplateColumns: "minmax(0,1.5fr) minmax(0,0.9fr) minmax(0,1.1fr) minmax(0,0.9fr)" }}
              >
                <span />
                <span className="font-mono text-[9.5px] font-medium tracking-[0.16em] uppercase text-muted">
                  {t["dp.col.free"]}
                </span>
                <span className="hidden sm:block font-mono text-[9.5px] font-medium tracking-[0.16em] uppercase text-muted">
                  {t["dp.col.date"]}
                </span>
                <span className="font-mono text-[9.5px] font-medium tracking-[0.16em] uppercase text-muted text-right">
                  {t["dp.col.interest"]}
                </span>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {leaderRow("dp.snowball", snow, snowColor, gap < 0)}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {leaderRow("dp.avalanche", aval, avalColor, gap > 0)}
              </div>
            </div>

            <div className="mt-3 space-y-0.5">
              <p className="text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
                <span className="text-dim">{t["dp.snowball"]}:</span> {t["dp.snowball.desc"]}
              </p>
              <p className="text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
                <span className="text-dim">{t["dp.avalanche"]}:</span> {t["dp.avalanche.desc"]}
              </p>
            </div>
          </div>

          {/* The race to zero */}
          <div>
            <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-2">
              {t["dp.chart"]}
            </p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t["dp.chart"]}>
              <defs>
                <linearGradient id="dp-snow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={snowColor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={snowColor} stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="dp-aval" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={avalColor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={avalColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>

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

              {/* loser drawn first so the winner sits on top */}
              {gap > 0 ? (
                <>
                  <path d={areaPath(snowSeries)} fill="url(#dp-snow)" />
                  <path d={linePath(snowSeries)} fill="none" stroke={snowColor} strokeWidth="2" opacity="0.8" />
                  <path d={areaPath(avalSeries)} fill="url(#dp-aval)" />
                  <path d={linePath(avalSeries)} fill="none" stroke={avalColor} strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d={areaPath(avalSeries)} fill="url(#dp-aval)" />
                  <path d={linePath(avalSeries)} fill="none" stroke={avalColor} strokeWidth="2" opacity={gap < 0 ? 0.8 : 1} />
                  <path d={areaPath(snowSeries)} fill="url(#dp-snow)" />
                  <path
                    d={linePath(snowSeries)}
                    fill="none"
                    stroke={snowColor}
                    strokeWidth={gap < 0 ? 3 : 2}
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* touchdown dots + staggered month labels */}
              <circle cx={x(snowSeries.length - 1)} cy={baseline} r="4.5" fill={snowColor} />
              <circle cx={x(avalSeries.length - 1)} cy={baseline} r="4.5" fill={avalColor} />
              <text
                x={x(snowSeries.length - 1) - 10}
                y={baseline - (gap < 0 ? 32 : 14)}
                textAnchor="end"
                fill={snowColor}
                style={{ font: "500 11px 'JetBrains Mono', monospace" }}
              >
                {snow.months} {t["ef.monthsShort"]}
              </text>
              <text
                x={x(avalSeries.length - 1) - 10}
                y={baseline - (gap > 0 ? 32 : 14)}
                textAnchor="end"
                fill={avalColor}
                style={{ font: "500 11px 'JetBrains Mono', monospace" }}
              >
                {aval.months} {t["ef.monthsShort"]}
              </text>

              <text
                x={PAD.l}
                y={y(startBalance) + 4}
                textAnchor="start"
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

      {/* Instrument strip: debt cards + the extra amount */}
      <div className="mt-12 rounded-3xl p-6 md:p-8" style={glass}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-10">
          <div>
            <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-5">
              {t["dp.debts"]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rows.map((row, i) => (
                <div
                  key={row.id}
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between mb-3">
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
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <DebtInput label={t["dp.balance"]} value={row.balance} onChange={(v) => update(row.id, { balance: v })} />
                    <DebtInput label={t["dp.apr"]} value={row.apr} onChange={(v) => update(row.id, { apr: v })} unit="%" max={100} />
                    <DebtInput label={t["dp.min"]} value={row.min} onChange={(v) => update(row.id, { min: v })} />
                  </div>
                </div>
              ))}
              {rows.length < MAX_DEBTS && (
                <button
                  type="button"
                  onClick={addRow}
                  className="rounded-2xl min-h-[108px] flex items-center justify-center gap-2 text-[13.5px] font-medium text-brand-light hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{ border: "1px dashed rgba(255,255,255,0.18)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 11 11" fill="none" aria-hidden="true">
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
              fill="#2DD4A7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
