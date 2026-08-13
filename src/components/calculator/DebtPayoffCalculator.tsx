import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { debtPayoff, type DebtPayoffResult } from "~/lib/finance";
import { MoneyField, glass, useMoney, interpolate, pluralKey, futureMonth } from "./fields";

const STORE_KEY = "taupi:dp:v1";
const MAX_DEBTS = 6;

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
 * Debt payoff calculator — the app's month-by-month debtPayoff simulation,
 * presented as two strategy cards (snowball vs avalanche) with a verdict
 * sentence naming the cheaper one.
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

  const maxInterest = Math.max(snow?.totalInterest ?? 0, aval?.totalInterest ?? 0);
  // Rounded like the displayed values, so a sub-€1 gap never names a winner.
  const gap = snow && aval ? Math.round(snow.totalInterest) - Math.round(aval.totalInterest) : 0;
  let verdict = "";
  if (snow && aval) {
    verdict =
      gap === 0
        ? t["dp.same"]
        : interpolate(t["dp.diff"], {
            name: t[gap > 0 ? "dp.avalanche" : "dp.snowball"],
            amount: money(Math.abs(gap)),
          });
  }

  const card = (
    nameKey: "dp.snowball" | "dp.avalanche",
    result: DebtPayoffResult | null,
    cheapest: boolean,
  ) => (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${cheapest && gap !== 0 ? "rgba(45,212,167,0.45)" : "rgba(255,255,255,0.10)"}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase text-dim">
          {t[nameKey]}
        </p>
        {cheapest && gap !== 0 && (
          <span
            className="rounded-full px-2.5 py-1 text-[10.5px] font-mono font-medium tracking-[0.1em] uppercase"
            style={{ background: "rgba(45,212,167,0.12)", color: "#2DD4A7" }}
          >
            ✓ {t["dp.cheapest"]}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] text-muted" style={{ lineHeight: 1.5 }}>
        {t[`${nameKey}.desc`]}
      </p>
      {result ? (
        <>
          <p className="mt-4 text-[14px] font-medium text-ink tabular-nums" style={{ lineHeight: 1.5 }}>
            {interpolate(t[pluralKey(locale, result.months, "dp.free")], {
              n: result.months,
              date: futureMonth(locale, result.months),
            })}
          </p>
          <p className="mt-1 text-[13px] text-dim tabular-nums">
            {interpolate(t["dp.interest"], { amount: money(result.totalInterest) })}
          </p>
          <div
            aria-hidden
            className="mt-3 h-2 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="bc-anim h-full rounded-full"
              style={{
                width: `${maxInterest > 0 ? (result.totalInterest / maxInterest) * 100 : 0}%`,
                background: cheapest && gap !== 0 ? "#2DD4A7" : "#7C8CFF",
              }}
            />
          </div>
        </>
      ) : (
        <p className="mt-4 text-[13px]" style={{ color: "#FF3B87", lineHeight: 1.5 }}>
          {t["dp.never"]}
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 lg:gap-14 items-start">
      {/* Inputs */}
      <div className="rounded-3xl p-6 md:p-8" style={glass}>
        <p className="eyebrow mb-4">{t["dp.debts"]}</p>
        {rows.map((row, i) => (
          <div key={row.id} className="mb-5 pb-1 border-b border-white/[0.07] last:border-0">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-muted">
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

        <div className="mt-7 pt-5 border-t border-white/10">
          <MoneyField label={t["dp.extra"]} value={extra} onChange={setExtra} hint={t["dp.extra.hint"]} />
        </div>
      </div>

      {/* Results */}
      <div className="lg:sticky lg:top-28">
        {debts.length === 0 ? (
          <p className="text-dim text-[15px]">{t["dp.enter"]}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {card("dp.snowball", snow, gap < 0)}
              {card("dp.avalanche", aval, gap > 0)}
            </div>
            {verdict && snow && aval && (
              <p
                className="mt-6 pl-3 text-[14px] text-ink"
                style={{ borderLeft: "2px solid #2DD4A7", lineHeight: 1.6 }}
                aria-live="polite"
              >
                {verdict}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
