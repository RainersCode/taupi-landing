import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { debtPayoff, type DebtPayoffResult } from "~/lib/finance";
import {
  debtPayoffSeries,
  debtPayoffPerDebtSeries,
  annuityPayment,
  monthsForPayment,
} from "~/lib/finance-web";
import { ControlCell, FlowMoney, StageGlow, glass, interpolate, futureMonthShort, useMoney } from "./fields";

const STORE_KEY = "taupi:dp:v1";
const MAX_DEBTS = 6;
// Verdict colors. These now live ONLY in the leaderboard and the hero figure:
// the chart itself colors by debt identity, so green here always means "the
// cheaper strategy" and never "a debt".
const WIN_COLOR = "#2DD4A7";
const LOSE_COLOR = "#7C8CFF";
const TIE_SNOW = "#7C8CFF";
const TIE_AVAL = "#38BDF8";

type Strategy = "snowball" | "avalanche";

// Debt identity palette, one slot per debt (MAX_DEBTS = 6). Hues are anchored
// on the brand and stepped into the dark-mode lightness band for this page's
// surface; success green is deliberately absent so a debt can never be mistaken
// for the winning strategy. Validated with the dataviz palette checker against
// #0D1128: worst ADJACENT pair ΔE 11.0 (deuteranopia) / 20.3 (normal vision).
//
// Slots are assigned by stack POSITION and never skip, because only adjacent
// pairs were validated — the full six do NOT survive an all-pairs test, and a
// stacked area only ever puts consecutive slots against each other.
const DEBT_COLORS = ["#5A6BFF", "#00919D", "#D93F61", "#058BBD", "#CA5A03", "#B250C2"];
// Painted between stacked bands to keep a 2px gap, so touching fills stay
// legible instead of blending into one mass.
const SURFACE = "#0D1128";
const GHOST_COLOR = "#8E8E9C"; // the "without the extra" trajectory

// Chart geometry (viewBox units — scales responsively)
const W = 640;
const H = 350;
// Top padding leaves the peak-balance label its own line: the stack starts at
// full height on the left edge, so a label inside the plot lands on the fill.
const PAD = { t: 34, r: 14, b: 56, l: 14 };
// Beyond this the no-extra run is clipped: a 40-year ghost next to a 3-year
// stack would squash the stack into an unreadable sliver.
const MAX_GHOST_RATIO = 3;

const shortMoney = (n: number) =>
  n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${Math.round(n)}`;

/**
 * A debt is described by its balance, its rate, and EITHER its monthly payment
 * or its remaining term — never both, because balance + rate + payment + term
 * is over-determined and inconsistent entries would have no obvious winner.
 * `mode` says which of the two the reader typed; the other is derived.
 */
type DebtMode = "payment" | "term";
type Row = { id: string; balance: number; apr: number; min: number; mode?: DebtMode; term?: number };

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

// mode/term are optional so rows stored before the term switch existed still load.
const isRows = (v: unknown): v is Row[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (r) =>
      r &&
      typeof r.id === "string" &&
      typeof r.balance === "number" &&
      typeof r.apr === "number" &&
      typeof r.min === "number" &&
      (r.mode === undefined || r.mode === "payment" || r.mode === "term") &&
      (r.term === undefined || typeof r.term === "number"),
  );

/** The monthly payment the simulation should use, whichever way it was entered. */
const rowPayment = (r: Row): number => {
  if (r.mode !== "term") return r.min;
  const months = Math.round(r.term ?? 0);
  return months > 0 ? annuityPayment(r.balance, r.apr, months) : 0;
};

/** Compact debt-card input: mono label, display-weight value, unit prefix. */
function DebtInput({
  label,
  value,
  onChange,
  unit = "€",
  suffix,
  max = 10_000_000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  suffix?: string;
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
        {unit && <span className="text-dim text-[13px]">{unit}</span>}
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
        {suffix && <span className="text-dim text-[12px] shrink-0">{suffix}</span>}
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

  /** "93 mēn. (7 g. 9 mēn.)" — months, plus years once that reads better. */
  const durationLabel = (n: number) => {
    const base = `${n} ${t["ef.monthsShort"]}`;
    if (n < 12) return base;
    const yy = Math.floor(n / 12);
    const mm = n % 12;
    const years =
      mm === 0
        ? interpolate(t["dp.sooner.years.round"], { y: yy })
        : interpolate(t["dp.sooner.years"], { y: yy, m: mm });
    return `${base} (${years})`;
  };

  // Switching seeds the target field from the value it replaces, so the plan
  // does not jump when the reader only wanted to describe the debt differently.
  const setMode = (row: Row, mode: DebtMode) => {
    if ((row.mode ?? "payment") === mode) return;
    if (mode === "term") {
      const n = monthsForPayment(row.balance, row.apr, row.min);
      update(row.id, { mode, term: n && n > 0 ? n : 60 });
    } else {
      const months = Math.round(row.term ?? 0);
      // Whole months lose the fraction (a €220 payment clears in 31.1 months,
      // shown as 32), so recomputing would hand back €214.39 for a number the
      // reader typed themselves. Keep their payment while it still implies
      // exactly the term on screen; only derive it once the term really moved.
      if (months > 0 && monthsForPayment(row.balance, row.apr, row.min) === months) {
        update(row.id, { mode });
        return;
      }
      const pay = months > 0 ? annuityPayment(row.balance, row.apr, months) : row.min;
      update(row.id, { mode, min: Math.round(pay * 100) / 100 });
    }
  };

  /** The third field's label doubles as the payment/term switch. */
  const modeSwitch = (row: Row): ReactNode => {
    const mode = row.mode ?? "payment";
    const opt = (m: DebtMode, label: string) => (
      <button
        type="button"
        onClick={() => setMode(row, m)}
        aria-pressed={mode === m}
        className="font-mono text-[10px] font-medium tracking-[0.12em] uppercase rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        style={{ color: mode === m ? "#F5F5F7" : "#55555F" }}
      >
        {label}
      </button>
    );
    return (
      <div className="flex items-center gap-1.5">
        {opt("payment", t["dp.mode.payment"])}
        <span aria-hidden style={{ color: "#3A3A45" }} className="text-[10px]">
          /
        </span>
        {opt("term", t["dp.mode.term"])}
      </div>
    );
  };

  /** Shows whichever of payment/term the reader did NOT type. */
  const derivedNote = (row: Row): string => {
    if (!(row.balance > 0)) return "";
    if ((row.mode ?? "payment") === "term") {
      const months = Math.round(row.term ?? 0);
      if (months <= 0) return "";
      const pay = annuityPayment(row.balance, row.apr, months);
      // A term long enough that the payment barely beats the interest is one
      // the chart refuses to draw — say so instead of quoting the payment.
      if (monthsForPayment(row.balance, row.apr, pay) === null) return t["dp.derived.never"];
      return interpolate(t["dp.derived.payment"], { amount: money(pay) });
    }
    if (!(row.min > 0)) return "";
    const n = monthsForPayment(row.balance, row.apr, row.min);
    if (n === null) return t["dp.derived.never"];
    return interpolate(t["dp.derived.term"], { d: durationLabel(n) });
  };

  // Keep the originating row alongside each debt so the chart legend can name
  // and number the bands the same way the cards below are numbered.
  const active = rows
    .map((r, i) => ({ row: r, n: i + 1, pay: rowPayment(r) }))
    .filter(({ row, pay }) => row.balance > 0 && pay > 0);
  const debts = active.map(({ row, pay }) => ({
    balance: row.balance,
    aprPct: row.apr,
    minPayment: pay,
  }));

  const snow = debts.length ? debtPayoff(debts, extra, "snowball") : null;
  const aval = debts.length ? debtPayoff(debts, extra, "avalanche") : null;

  // Rounded like the displayed values, so a sub-€1 gap never names a winner.
  const gap = snow && aval ? Math.round(snow.totalInterest) - Math.round(aval.totalInterest) : 0;
  const winnerKey = gap > 0 ? "dp.avalanche" : "dp.snowball";
  const snowColor = gap === 0 ? TIE_SNOW : gap < 0 ? WIN_COLOR : LOSE_COLOR;
  const avalColor = gap === 0 ? TIE_AVAL : gap > 0 ? WIN_COLOR : LOSE_COLOR;

  // The chart draws ONE strategy. It follows the cheaper one until the reader
  // picks a side, so the default view is always the recommended plan.
  const [picked, setPicked] = useState<Strategy | null>(null);
  const shown: Strategy = picked ?? (gap > 0 ? "avalanche" : "snowball");
  const shownResult = shown === "avalanche" ? aval : snow;

  const perDebtSnow = debts.length ? debtPayoffPerDebtSeries(debts, extra, "snowball") : null;
  const perDebtAval = debts.length ? debtPayoffPerDebtSeries(debts, extra, "avalanche") : null;
  const perDebt = shown === "snowball" ? perDebtSnow : perDebtAval;

  /** Month each debt hits zero — the payoff ORDER, which is what the chart shows. */
  const clearedMonths = (p: number[][] | null) =>
    p?.map((d) => {
      const m = d.findIndex((v) => v <= 0.005);
      return m < 0 ? d.length - 1 : m;
    }) ?? null;
  const snowCleared = clearedMonths(perDebtSnow);
  const avalCleared = clearedMonths(perDebtAval);
  // When the smallest balance is also the highest-rate debt, both strategies
  // pick the same target every month and the chart is literally identical.
  // Offering a toggle there reads as a broken control, so we say so instead.
  const samePlan =
    !!snowCleared &&
    !!avalCleared &&
    snowCleared.length === avalCleared.length &&
    snowCleared.every((m, i) => m === avalCleared[i]);

  // The same plan on the minimums alone — the thing the extra is measured
  // against. Null here means the debts never close without the extra at all.
  const baseResult = debts.length && extra > 0 ? debtPayoff(debts, 0, shown) : null;
  const baseSeries = debts.length && extra > 0 ? debtPayoffSeries(debts, 0, shown) : null;
  const baselineNever = debts.length > 0 && extra > 0 && baseResult === null;
  const monthsSooner =
    baseResult && shownResult ? baseResult.months - shownResult.months : null;
  const showSooner = monthsSooner !== null && monthsSooner > 0;
  // Two figures have to share the column the single one used to own.
  const heroSize = showSooner ? "clamp(34px, 3.6vw, 52px)" : "clamp(52px, 6vw, 92px)";
  const soonerYears = (() => {
    if (!showSooner || monthsSooner === null || monthsSooner < 12) return null;
    const yy = Math.floor(monthsSooner / 12);
    const mm = monthsSooner % 12;
    if (mm === 0) return interpolate(t["dp.sooner.years.round"], { y: yy });
    return interpolate(t["dp.sooner.years"], { y: yy, m: mm });
  })();

  // ── Chart ──
  const curMonths = perDebt ? perDebt[0].length - 1 : 0;
  const baseMonths = baseSeries ? baseSeries.length - 1 : 0;
  // Clip a runaway no-extra run rather than letting it crush the stack.
  const xMax = Math.max(
    1,
    Math.min(Math.max(curMonths, baseMonths), Math.max(curMonths * MAX_GHOST_RATIO, curMonths + 12)),
  );
  const ghostClipped = baseMonths > xMax;
  const startBalance = Math.max(perDebt?.reduce((s, d) => s + d[0], 0) ?? 0, 1);
  const x = (m: number) => PAD.l + (Math.min(m, xMax) / xMax) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / startBalance) * (H - PAD.t - PAD.b);
  const baseline = y(0);

  // Running totals: band j spans cum[j-1] .. cum[j], so the stack's outline is
  // the same total-balance curve the chart used to draw on its own.
  const cum: number[][] = [];
  if (perDebt) {
    perDebt.forEach((d, j) => {
      cum.push(d.map((v, m) => v + (j === 0 ? 0 : cum[j - 1][m])));
    });
  }
  const edgePath = (vals: number[]) =>
    vals.map((v, m) => `${m === 0 ? "M" : "L"}${x(m).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const bandPath = (j: number) => {
    const top = cum[j];
    const bottom = j === 0 ? top.map(() => 0) : cum[j - 1];
    const back = bottom
      .map((v, m) => ({ v, m }))
      .reverse()
      .map(({ v, m }) => `L${x(m).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(" ");
    return `${edgePath(top)} ${back} Z`;
  };
  const clearedAt = clearedMonths(perDebt) ?? [];

  // Label as many payoff months as fit: rightmost first (that one is the
  // debt-free date and always earns its label), then any whose box still
  // clears. Comparing real extents rather than centre distance matters because
  // the last label is end-anchored while the rest are centred.
  const labelText = (m: number) => `${m} ${t["ef.monthsShort"]}`;
  const CHAR_W = 6.6; // JetBrains Mono 11px, in viewBox units
  const labelBox = (m: number): [number, number] => {
    const w = labelText(m).length * CHAR_W;
    const cx = x(m);
    return m === curMonths ? [cx - w, cx] : [cx - w / 2, cx + w / 2];
  };
  const clearedLabels = clearedAt
    .map((m, j) => ({ j, m }))
    .sort((a, b) => b.m - a.m)
    .reduce<{ j: number; m: number }[]>((keep, item) => {
      const [l, r] = labelBox(item.m);
      const clashes = keep.some(({ m }) => {
        const [kl, kr] = labelBox(m);
        return l < kr + 6 && r + 6 > kl;
      });
      if (!clashes) keep.push(item);
      return keep;
    }, []);

  const yearStep = xMax > 96 ? 24 : 12;
  const yearTicks: number[] = [];
  for (let m = yearStep; m <= xMax; m += yearStep) yearTicks.push(m);

  const chartLabel = shownResult
    ? interpolate("{chart} — {name}, {n} {unit}", {
        chart: t["dp.chart"],
        name: t[shown === "snowball" ? "dp.snowball" : "dp.avalanche"],
        n: shownResult.months,
        unit: t["ef.monthsShort"],
      })
    : t["dp.chart"];

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
        <FlowMoney value={result.months} locale={locale} prefix="" />
        <span className="ml-1 font-body font-normal text-[11.5px] text-muted">{t["ef.monthsShort"]}</span>
      </span>
      <span className="hidden sm:block font-mono text-[12px] text-dim tabular-nums whitespace-nowrap">
        {futureMonthShort(locale, result.months)}
      </span>
      <span
        className="font-mono text-[13.5px] tabular-nums text-right whitespace-nowrap"
        style={{ color: cheapest ? WIN_COLOR : "#F5F5F7" }}
      >
        <FlowMoney value={result.totalInterest} locale={locale} />
      </span>
    </div>
  );

  return (
    <div>
      {debts.length === 0 ? (
        <p className="text-dim text-[15px]">{t["dp.enter"]}</p>
      ) : !snow || !aval || !perDebt || !shownResult ? (
        <p className="text-[15px] max-w-[52ch]" style={{ color: "#FF3B87", lineHeight: 1.6 }}>
          {t["dp.never"]}
        </p>
      ) : (
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
          <StageGlow color="rgba(45,212,167,0.08)" />

          {/* The answer */}
          <div>
            <div className={showSooner ? "grid grid-cols-2 gap-x-6 gap-y-4" : undefined}>
              <div>
                <p className="eyebrow mb-3">
                  {gap === 0 ? t["dp.tie.label"] : interpolate(t["dp.saves.label"], { name: t[winnerKey] })}
                </p>
                <p
                  className="font-display font-extrabold tracking-tightest tabular-nums whitespace-nowrap"
                  style={{
                    fontSize: heroSize,
                    color: gap === 0 ? "#F5F5F7" : WIN_COLOR,
                    lineHeight: 0.95,
                  }}
                >
                  <FlowMoney value={gap === 0 ? aval.totalInterest : Math.abs(gap)} locale={locale} />
                </p>
              </div>

              {showSooner && (
                <div>
                  <p className="eyebrow mb-3">{t["dp.sooner.label"]}</p>
                  <p
                    className="font-display font-extrabold tracking-tightest tabular-nums whitespace-nowrap flex items-baseline"
                    style={{ fontSize: heroSize, color: "#F5F5F7", lineHeight: 0.95 }}
                  >
                    <FlowMoney value={monthsSooner as number} locale={locale} prefix="" />
                    <span className="ml-1.5 font-body font-normal text-dim" style={{ fontSize: "0.32em" }}>
                      {t["dp.sooner.unit"]}
                    </span>
                  </p>
                  {soonerYears && (
                    <p className="mt-1.5 font-mono text-[11.5px] text-muted">{soonerYears}</p>
                  )}
                </div>
              )}
            </div>

            {gap === 0 && (
              <p className="mt-4 text-[13.5px] text-dim max-w-[44ch]" style={{ lineHeight: 1.6 }}>
                {t["dp.same"]}
              </p>
            )}
            {baselineNever && (
              <p
                className="mt-5 pl-3 text-[13.5px] text-ink max-w-[46ch]"
                style={{ borderLeft: `2px solid ${WIN_COLOR}`, lineHeight: 1.6 }}
              >
                {t["dp.sooner.never"]}
              </p>
            )}
            {extra > 0 && !baselineNever && monthsSooner === 0 && (
              <p className="mt-5 text-[13px] text-muted max-w-[46ch]" style={{ lineHeight: 1.6 }}>
                {t["dp.sooner.none"]}
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

          {/* Debt by debt, down to zero */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted">
                {t["dp.chart"]}
              </p>
              {debts.length > 1 && samePlan && (
                <p className="font-mono text-[10px] tracking-[0.10em] uppercase text-muted">
                  {t["dp.sameplan"]}
                </p>
              )}
              {debts.length > 1 && !samePlan && (
                <div
                  className="flex rounded-full p-0.5"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
                  role="group"
                  aria-label={t["dp.chart.strategy"]}
                >
                  {(["snowball", "avalanche"] as Strategy[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPicked(s)}
                      aria-pressed={shown === s}
                      className="rounded-full px-3 py-1.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      style={
                        shown === s
                          ? { background: "rgba(255,255,255,0.12)", color: "#F5F5F7" }
                          : { color: "#64646F" }
                      }
                    >
                      {t[s === "snowball" ? "dp.snowball" : "dp.avalanche"]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={chartLabel}>
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

              {/* One band per debt, stacked in input order */}
              {perDebt.map((_, j) => (
                <path key={active[j].row.id} d={bandPath(j)} fill={DEBT_COLORS[j % DEBT_COLORS.length]} />
              ))}
              {/* 2px surface gap on every internal boundary, so touching bands
                  stay separate shapes rather than one block of colour */}
              {perDebt.slice(0, -1).map((_, j) => (
                <path
                  key={`edge-${active[j].row.id}`}
                  d={edgePath(cum[j])}
                  fill="none"
                  stroke={SURFACE}
                  strokeWidth="1.5"
                />
              ))}

              {/* What the same plan looks like on the minimums alone */}
              {baseSeries && monthsSooner !== null && monthsSooner > 0 && (
                <>
                  <path
                    d={edgePath(baseSeries.slice(0, xMax + 1))}
                    fill="none"
                    stroke={GHOST_COLOR}
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />
                  <text
                    x={W - PAD.r}
                    y={PAD.t + 10}
                    textAnchor="end"
                    fill={GHOST_COLOR}
                    style={{ font: "500 10.5px 'JetBrains Mono', monospace" }}
                  >
                    {t["dp.baseline"]}
                    {ghostClipped ? " →" : ""}
                  </text>

                  {/* The gap between the two finish lines, measured */}
                  <g>
                    <line
                      x1={x(curMonths)}
                      x2={x(baseMonths)}
                      y1={baseline + 14}
                      y2={baseline + 14}
                      stroke={GHOST_COLOR}
                      strokeWidth="1.5"
                    />
                    <line
                      x1={x(curMonths)}
                      x2={x(curMonths)}
                      y1={baseline + 9}
                      y2={baseline + 19}
                      stroke={GHOST_COLOR}
                      strokeWidth="1.5"
                    />
                    {/* A chevron, not a tick, when the axis was truncated — the
                        span really runs past the right edge */}
                    {ghostClipped ? (
                      <path
                        d={`M${x(baseMonths) - 5} ${baseline + 9} L${x(baseMonths)} ${baseline + 14} L${x(baseMonths) - 5} ${baseline + 19}`}
                        fill="none"
                        stroke={GHOST_COLOR}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <line
                        x1={x(baseMonths)}
                        x2={x(baseMonths)}
                        y1={baseline + 9}
                        y2={baseline + 19}
                        stroke={GHOST_COLOR}
                        strokeWidth="1.5"
                      />
                    )}
                    <text
                      x={(x(curMonths) + x(baseMonths)) / 2}
                      y={baseline + 33}
                      textAnchor="middle"
                      fill="#F5F5F7"
                      style={{ font: "500 11.5px 'JetBrains Mono', monospace" }}
                    >
                      {monthsSooner} {t["dp.sooner.unit"]}
                    </text>
                  </g>
                </>
              )}

              {/* A dot where each debt hits zero — the payoff ORDER is the part
                  the two strategies actually disagree on */}
              {clearedAt.map((m, j) => (
                <circle
                  key={`dot-${active[j].row.id}`}
                  cx={x(m)}
                  cy={baseline}
                  r="4"
                  fill={DEBT_COLORS[j % DEBT_COLORS.length]}
                  stroke={SURFACE}
                  strokeWidth="1.5"
                />
              ))}
              {/* Haloed, because these sit on top of whichever band is still
                  unpaid at that month */}
              {clearedLabels.map(({ j, m }) => (
                <text
                  key={`lbl-${active[j].row.id}`}
                  x={x(m)}
                  y={baseline - 10}
                  textAnchor={m === curMonths ? "end" : "middle"}
                  fill={DEBT_COLORS[j % DEBT_COLORS.length]}
                  stroke={SURFACE}
                  strokeWidth="3"
                  paintOrder="stroke"
                  style={{ font: "700 11px 'JetBrains Mono', monospace" }}
                >
                  {m} {t["ef.monthsShort"]}
                </text>
              ))}

              <text
                x={PAD.l}
                y={PAD.t - 11}
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
                    y={H - 6}
                    textAnchor="middle"
                    fill="#64646F"
                    style={{ font: "500 11px 'JetBrains Mono', monospace" }}
                  >
                    {m / 12}{locale === "lv" ? " g." : "y"}
                  </text>
                </g>
              ))}
            </svg>

            {/* Legend — identity is never carried by colour alone */}
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {active.map(({ row, n }, j) => (
                <li key={row.id} className="flex items-center gap-2 text-[11.5px]">
                  <span
                    aria-hidden
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: DEBT_COLORS[j % DEBT_COLORS.length] }}
                  />
                  <span className="text-dim">{interpolate(t["dp.debt.n"], { n })}</span>
                  <span className="font-mono text-muted tabular-nums">
                    {money(row.balance)} · {interpolate(t["dp.legend.rate"], { apr: row.apr })}
                  </span>
                </li>
              ))}
            </ul>
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
                  {/* The payment/term switch lives here, not on the field's own
                      label: a third of the card is too narrow for two words and
                      the second one spilled out of the card. */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-dim truncate">
                      {interpolate(t["dp.debt.n"], { n: i + 1 })}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {modeSwitch(row)}
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
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <DebtInput label={t["dp.balance"]} value={row.balance} onChange={(v) => update(row.id, { balance: v })} />
                    <DebtInput label={t["dp.apr"]} value={row.apr} onChange={(v) => update(row.id, { apr: v })} unit="%" max={100} />
                    {(row.mode ?? "payment") === "term" ? (
                      <DebtInput
                        label={t["dp.mode.term"]}
                        value={row.term ?? 0}
                        onChange={(v) => update(row.id, { term: Math.round(v) })}
                        unit=""
                        suffix={t["ef.monthsShort"]}
                        max={480}
                      />
                    ) : (
                      <DebtInput
                        label={t["dp.mode.payment"]}
                        value={row.min}
                        onChange={(v) => update(row.id, { min: v })}
                      />
                    )}
                  </div>
                  {/* Whichever value the reader did not type, shown so the two
                      are never silently out of step with the loan agreement */}
                  <p className="mt-3 font-mono text-[11px] text-muted tabular-nums">{derivedNote(row)}</p>
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
