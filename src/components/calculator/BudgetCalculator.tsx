import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import {
  LINES,
  evaluateAllocation,
  redistributeLocked,
  recommendedAmounts,
  compareScenarios,
  type LineKey,
  type LineEval,
  type CustomLine,
} from "~/lib/affordability";
import { futureValue } from "~/lib/finance";
import AllocationRow from "./AllocationRow";
import { StageGlow } from "./fields";

// Bar/row colors — the app's calculator palette (BudgetCalculatorScreen), so
// the web tool and the app screenshots read as one product. Exported for the
// benchmark table on the page (CalculatorPage.astro).
export const LINE_COLORS: Record<LineKey, string> = {
  housing: "#7C8CFF",
  utilities: "#64B5F6",
  transport: "#4FC3F7",
  food: "#81C784",
  savings: "#34D399",
  debt: "#FF8A80",
  other: "#B0A8C9",
};

// good stays quiet; amber warns; over/under alarm — mirrors the app.
const STATUS_COLORS: Record<LineEval["status"], string> = {
  good: "#64646F",
  amber: "#FFB547",
  over: "#FF3B87",
  under: "#FF3B87",
};

const LABEL_KEYS: Record<LineKey, string> = {
  housing: "bc.line.housing",
  utilities: "bc.line.utilities",
  transport: "bc.line.transport",
  food: "bc.line.food",
  savings: "bc.line.savings",
  debt: "bc.line.debt",
  other: "bc.line.other",
};

const DEFAULT_INCOME = 1500;
const DEFAULT_YEARS = 10;
const DEFAULT_RETURN = 7;
const MAX_CUSTOM = 8;
const STORE_KEY = "taupi:bc:v1";

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

type Amounts = Record<LineKey, number>;
type Scenario = { amounts: Amounts; custom: CustomLine[] };
type CalcMode = "now" | "whatIf";

const isAmounts = (v: unknown): v is Amounts =>
  !!v && typeof v === "object" && LINES.every((k) => typeof (v as Amounts)[k] === "number");

const isCustomLines = (v: unknown): v is CustomLine[] =>
  Array.isArray(v) &&
  v.every(
    (c) =>
      c &&
      typeof c.id === "string" &&
      typeof c.name === "string" &&
      typeof c.amount === "number",
  );

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const customTotal = (c: CustomLine[]) => c.reduce((s, l) => s + l.amount, 0);

export default function BudgetCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const fmt = (key: string, vars: Record<string, string | number>) =>
    (t[key] ?? "").replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "lv" ? "lv-LV" : "en-GB", { maximumFractionDigits: 0 }),
    [locale],
  );
  const money = (n: number) => `${n < 0 ? "−" : ""}€${nf.format(Math.abs(Math.round(n)))}`;

  // The tool opens showing the recommended split at a realistic net income —
  // a full, healthy example beats an empty form.
  const [income, setIncome] = useState<number>(DEFAULT_INCOME);
  const [incomeText, setIncomeText] = useState<string>(String(DEFAULT_INCOME));
  const [amounts, setAmounts] = useState<Amounts>(() => recommendedAmounts(DEFAULT_INCOME, 0));
  // "Manas rindas" — user-defined lines. They roll into the "Citi" threshold
  // and are never touched by the lock-to-income redistribution (they're
  // deliberate commitments, not a buffer to scale).
  const [custom, setCustom] = useState<CustomLine[]>([]);
  const [locked, setLocked] = useState(false);
  const [mode, setMode] = useState<CalcMode>("now");
  // "Ko ja?" scenario — null until first opened. Edits there never leak into
  // the real "Tagad" numbers.
  const [whatIf, setWhatIf] = useState<Scenario | null>(null);
  // While showing the recommended split, holds the user's own amounts so a
  // second tap restores them. null = sliders show the user's values.
  const [savedAmounts, setSavedAmounts] = useState<Amounts | null>(null);
  const showingRecommended = savedAmounts !== null;
  // Investment mini-projection: what the monthly free amount could become.
  const [investYears, setInvestYears] = useState(DEFAULT_YEARS);
  const [investPct, setInvestPct] = useState(DEFAULT_RETURN);

  // ── localStorage persistence (silent autosave — no Save button on web) ──
  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.income === "number" && s.income > 0 && isAmounts(s.amounts)) {
          setIncome(s.income);
          setIncomeText(String(Math.round(s.income)));
          setAmounts(s.amounts);
          setLocked(!!s.locked);
          setCustom(isCustomLines(s.custom) ? s.custom : []);
          // whatIf was a flat Amounts record before custom lines existed —
          // migrate the old shape instead of dropping the saved scenario.
          if (isAmounts(s.whatIf)) {
            setWhatIf({ amounts: s.whatIf, custom: [] });
          } else if (s.whatIf && isAmounts(s.whatIf.amounts)) {
            setWhatIf({
              amounts: s.whatIf.amounts,
              custom: isCustomLines(s.whatIf.custom) ? s.whatIf.custom : [],
            });
          }
          if (typeof s.invest?.years === "number" && typeof s.invest?.pct === "number") {
            setInvestYears(Math.min(40, Math.max(1, Math.round(s.invest.years))));
            setInvestPct(Math.min(15, Math.max(0, s.invest.pct)));
          }
        }
      }
    } catch {
      // Corrupt store — keep defaults.
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          income,
          amounts,
          custom,
          locked,
          whatIf,
          invest: { years: investYears, pct: investPct },
        }),
      );
    } catch {
      // Storage full/blocked — the tool still works, it just won't remember.
    }
  }, [income, amounts, custom, locked, whatIf, investYears, investPct]);

  // ── Scenario plumbing (functional updaters, as in the app) ──
  const whatIfActive = mode === "whatIf" && whatIf !== null;
  const activeAmounts = whatIfActive ? whatIf!.amounts : amounts;
  const activeCustom = whatIfActive ? whatIf!.custom : custom;
  const activeCustomTotal = customTotal(activeCustom);

  type AmountsArg = Amounts | ((prev: Amounts) => Amounts);
  const setActiveAmounts = (next: AmountsArg) => {
    if (mode === "whatIf") {
      setWhatIf((w) => {
        const prev = w ?? { amounts, custom: custom.map((c) => ({ ...c })) };
        return {
          amounts: typeof next === "function" ? next(prev.amounts) : next,
          custom: prev.custom,
        };
      });
    } else {
      setAmounts((prev) => (typeof next === "function" ? next(prev) : next));
    }
  };

  type CustomArg = CustomLine[] | ((prev: CustomLine[]) => CustomLine[]);
  const setActiveCustom = (next: CustomArg) => {
    if (mode === "whatIf") {
      setWhatIf((w) => {
        const prev = w ?? { amounts: { ...amounts }, custom };
        return {
          amounts: prev.amounts,
          custom: typeof next === "function" ? next(prev.custom) : next,
        };
      });
    } else {
      setCustom((prev) => (typeof next === "function" ? next(prev) : next));
    }
  };

  const switchMode = (m: CalcMode) => {
    // The "showing recommended" snapshot is scenario-specific — switching
    // modes with it armed would restore the WRONG scenario's amounts.
    setSavedAmounts(null);
    if (m === "whatIf" && !whatIf) {
      setWhatIf({ amounts: { ...amounts }, custom: custom.map((c) => ({ ...c })) });
    }
    setMode(m);
  };

  const resetWhatIf = () => {
    setSavedAmounts(null);
    setWhatIf({ amounts: { ...amounts }, custom: custom.map((c) => ({ ...c })) });
  };

  const handleChange = (key: LineKey, value: number) => {
    // Dragging takes over from the recommended preset.
    setSavedAmounts(null);
    // Lock-to-income rescales the 7 standard lines only — custom lines are
    // deliberate commitments and stay put.
    setActiveAmounts((prev) =>
      locked ? redistributeLocked(prev, key, value, income) : { ...prev, [key]: value },
    );
  };

  const addCustomLine = () =>
    setActiveCustom((prev) =>
      prev.length >= MAX_CUSTOM ? prev : [...prev, { id: newId(), name: "", amount: 0 }],
    );
  const updateCustomLine = (id: string, patch: Partial<CustomLine>) =>
    setActiveCustom((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCustomLine = (id: string) =>
    setActiveCustom((prev) => prev.filter((c) => c.id !== id));

  const toggleRecommended = () => {
    if (showingRecommended) {
      setActiveAmounts(savedAmounts!);
      setSavedAmounts(null);
    } else {
      setSavedAmounts(activeAmounts);
      setActiveAmounts((prev) => recommendedAmounts(income, prev.debt));
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {}
    setIncome(DEFAULT_INCOME);
    setIncomeText(String(DEFAULT_INCOME));
    setAmounts(recommendedAmounts(DEFAULT_INCOME, 0));
    setCustom([]);
    setLocked(false);
    setSavedAmounts(null);
    setWhatIf(null);
    setMode("now");
    setInvestYears(DEFAULT_YEARS);
    setInvestPct(DEFAULT_RETURN);
  };

  const commitIncome = () => {
    const parsed = Number.parseFloat(incomeText.replace(",", "."));
    setIncome(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
  };

  const evald = evaluateAllocation(income, activeAmounts, activeCustomTotal);
  const compare = whatIfActive
    ? compareScenarios(income, { amounts, custom }, whatIf!)
    : null;
  // "Tagad" evaluation for the comparison bar (only needed in "Ko ja?").
  const baseEvald = whatIfActive
    ? evaluateAllocation(income, amounts, customTotal(custom))
    : null;

  const buildHint = (line: LineEval): string | undefined => {
    if (line.status === "good") return undefined;
    return fmt(line.targetKind === "min" ? "bc.hint.under" : "bc.hint.over", {
      pct: line.pct.toFixed(0),
      target: line.targetPct,
    });
  };

  // "Ko ja?" only: a quiet "↑ no €500" on a line that differs from "Tagad".
  const buildChangeNote = (key: LineKey): string | undefined => {
    if (!whatIfActive) return undefined;
    const base = amounts[key];
    if (Math.abs(whatIf!.amounts[key] - base) < 0.5) return undefined;
    return fmt(whatIf!.amounts[key] > base ? "bc.change.up" : "bc.change.down", {
      amount: money(base),
    });
  };

  const freePct = income > 0 ? Math.round((Math.abs(evald.free) / income) * 100) : 0;
  const freeColor = evald.overAllocated ? "#FF3B87" : "#2DD4A7";

  // Rounded (not raw) diff — matches what money() displays, so a sub-€1
  // float wobble never paints a color over "no change".
  const freeDiff = compare ? Math.round(compare.freeAfter) - Math.round(compare.freeBefore) : 0;
  let deltaColor = "#F5F5F7";
  if (freeDiff < 0) deltaColor = "#FF3B87";
  else if (freeDiff > 0) deltaColor = "#2DD4A7";

  // One readable sentence instead of before→after number rows: what you'd
  // have left, how that compares to "Tagad", and what it means per year.
  const buildDeltaSentence = (): string => {
    if (!compare) return "";
    if (freeDiff === 0) return fmt("bc.delta.equal", { free: money(compare.freeAfter) });
    const overAfter = Math.round(compare.freeAfter) < 0;
    const vars = {
      free: money(Math.abs(compare.freeAfter)),
      diff: money(Math.abs(freeDiff)),
      annual: money(Math.abs(freeDiff * 12)),
    };
    if (overAfter) return fmt(freeDiff > 0 ? "bc.delta.moreOver" : "bc.delta.lessOver", vars);
    return fmt(freeDiff > 0 ? "bc.delta.more" : "bc.delta.less", vars);
  };
  const deltaSentence = buildDeltaSentence();

  // Secondary note only when a benchmark actually changed bands — "nothing
  // changed" is already the sentence's job.
  const buildDeltaNote = (): string => {
    if (!compare) return "";
    const worse = compare.worsened.length;
    const better = compare.improved.length;
    if (worse === 1) return t["bc.delta.worse.one"];
    if (worse > 1) return fmt("bc.delta.worse", { n: worse });
    if (better === 1) return t["bc.delta.better.one"];
    if (better > 1) return fmt("bc.delta.better", { n: better });
    return "";
  };
  const deltaNote = buildDeltaNote();

  // Bar segments from evaluated lines — "other" then includes the custom-
  // line total, matching what the rows display.
  const segments = (lines: LineEval[]) =>
    lines
      .filter((l) => l.amount > 0)
      .map((l) => (
        <div
          key={l.key}
          className="bc-anim h-full"
          style={{
            width: `${Math.min(100, (l.amount / income) * 100)}%`,
            background: LINE_COLORS[l.key],
          }}
        />
      ));

  // ── Investment mini-projection (futureValue is the app's formula) ──
  const monthlyFree = Math.max(0, evald.free);
  const fv = futureValue(0, monthlyFree, investPct, investYears * 12);
  // Latvian counts "1, 21, 31 gada" but "2–20, 22–30 gadiem".
  const yearsKey =
    (locale === "lv" ? investYears % 10 === 1 && investYears % 100 !== 11 : investYears === 1)
      ? "bc.invest.after.one"
      : "bc.invest.after";

  // The sandbox gets its own accent ring so it never reads as the real budget.
  const panelStyle = whatIfActive
    ? { ...glass, border: "1px solid rgba(56,189,248,0.35)" }
    : glass;

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-12 items-start">
      <StageGlow color={whatIfActive ? "rgba(56,189,248,0.08)" : "rgba(90,107,255,0.09)"} />
      {/* ── Summary panel — sticky on desktop so the verdict follows the sliders ── */}
      <aside className="lg:sticky lg:top-28 rounded-3xl p-6 md:p-8" style={panelStyle}>
        {/* Mode switch */}
        <div
          className="flex rounded-full p-1"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          {(["now", "whatIf"] as CalcMode[]).map((m) => {
            const active = mode === m;
            // "Tagad" owns brand indigo; the "Ko ja?" sandbox owns accent
            // cyan — the color split carries through the ring and bar labels.
            let chipClass = "text-dim hover:text-ink";
            if (active) chipClass = m === "whatIf" ? "bg-accent text-bg" : "bg-brand text-white";
            return (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                aria-pressed={active}
                className={`flex-1 rounded-full py-2 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${chipClass}`}
              >
                {t[m === "now" ? "bc.mode.now" : "bc.mode.whatIf"]}
              </button>
            );
          })}
        </div>
        {mode === "whatIf" && (
          <p className="mt-3 text-[12.5px] text-dim" style={{ lineHeight: 1.5 }}>
            {t["bc.whatIf.hint"]}
          </p>
        )}

        {/* Income */}
        <p className="eyebrow mt-7 mb-1.5">{t["bc.income"]}</p>
        <div className="flex items-baseline gap-1.5 border-b border-white/15 focus-within:border-accent transition-colors pb-1.5">
          <span className="font-body text-[26px] text-dim">€</span>
          {mode === "whatIf" ? (
            // Income is shared between the two scenarios (one income, both
            // sides of the delta) — read-only here, as in the app.
            <span className="flex-1 font-display font-extrabold text-[34px] text-dim tracking-tight tabular-nums">
              {incomeText}
            </span>
          ) : (
            <input
              value={incomeText}
              onChange={(e) => setIncomeText(e.target.value)}
              onBlur={commitIncome}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              inputMode="decimal"
              aria-label={t["bc.income"]}
              className="flex-1 min-w-0 bg-transparent font-display font-extrabold text-[34px] text-ink tracking-tight outline-none tabular-nums"
            />
          )}
        </div>
        <p className="mt-2 text-[12px] text-muted">{t["bc.income.hint"]}</p>

        {income > 0 && (
          <>
            {/* Signature: one slim bar carving income into category segments.
                In "Ko ja?" the real budget stays visible above the scenario
                bar, so the comparison is something you SEE, not decode. */}
            {baseEvald ? (
              <div aria-hidden className="mt-7">
                <p className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-muted mb-1.5">
                  {t["bc.mode.now"]}
                </p>
                <div
                  className="flex h-2 rounded-full overflow-hidden opacity-50"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  {segments(baseEvald.lines)}
                </div>
                <p
                  className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase mt-3.5 mb-1.5"
                  style={{ color: "#38BDF8" }}
                >
                  {t["bc.mode.whatIf"]}
                </p>
                <div
                  className="flex h-3.5 rounded-full overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    outline: evald.overAllocated ? "1px solid rgba(255,59,135,0.55)" : "none",
                    outlineOffset: 2,
                  }}
                >
                  {segments(evald.lines)}
                </div>
              </div>
            ) : (
              <div
                aria-hidden
                className="mt-8 flex h-3.5 rounded-full overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  outline: evald.overAllocated ? "1px solid rgba(255,59,135,0.55)" : "none",
                  outlineOffset: 2,
                }}
              >
                {segments(evald.lines)}
              </div>
            )}

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-dim">
                {evald.overAllocated ? t["bc.over"] : t["bc.free"]}
              </span>
              <span
                className="font-display font-extrabold text-[42px] tracking-tight tabular-nums"
                style={{ color: freeColor }}
              >
                {evald.free < 0 ? "−" : ""}€{nf.format(Math.abs(Math.round(evald.free)))}
                <span className="ml-2 font-mono font-normal text-[13px] text-muted">{freePct}%</span>
              </span>
            </div>

            {/* What-if verdict — one readable sentence, colored by outcome */}
            {compare && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p
                  className="pl-3 text-[13.5px] text-ink"
                  style={{ borderLeft: `2px solid ${deltaColor}`, lineHeight: 1.6 }}
                  aria-live="polite"
                >
                  {deltaSentence}
                </p>
                {deltaNote && (
                  <p className="mt-3 text-[12px] font-mono text-muted">{deltaNote}</p>
                )}
                <button
                  type="button"
                  onClick={resetWhatIf}
                  className="mt-4 text-[12px] text-muted underline underline-offset-2 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  {t["bc.whatIf.reset"]}
                </button>
              </div>
            )}

            {/* ── Invest the free money — compound projection (app formula).
                In "Ko ja?" it uses the scenario's free amount, so experiments
                immediately show their long-term upside. ── */}
            {Math.round(monthlyFree) > 0 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="eyebrow mb-4">{t["bc.invest.eyebrow"]}</p>

                <div className="flex items-baseline justify-between">
                  <span className="text-[12.5px] text-dim">{t["bc.invest.years"]}</span>
                  <span className="font-mono text-[13px] text-ink tabular-nums">{investYears}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={investYears}
                  onChange={(e) => setInvestYears(Number(e.target.value))}
                  aria-label={t["bc.invest.years"]}
                  aria-valuetext={String(investYears)}
                  className="bc-range mt-1"
                  style={{
                    "--bc-fill": "#2DD4A7",
                    "--bc-pct": `${((investYears - 1) / 39) * 100}%`,
                  } as CSSProperties}
                />

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[12.5px] text-dim">{t["bc.invest.return"]}</span>
                  <span className="font-mono text-[13px] text-ink tabular-nums">
                    {investPct.toLocaleString(locale === "lv" ? "lv-LV" : "en-GB")}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={investPct}
                  onChange={(e) => setInvestPct(Number(e.target.value))}
                  aria-label={t["bc.invest.return"]}
                  aria-valuetext={`${investPct}%`}
                  className="bc-range mt-1"
                  style={{
                    "--bc-fill": "#2DD4A7",
                    "--bc-pct": `${(investPct / 15) * 100}%`,
                  } as CSSProperties}
                />

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-dim">
                    {fmt(yearsKey, { years: investYears })}
                  </span>
                  <span
                    className="font-display font-extrabold text-[24px] tracking-tight tabular-nums"
                    style={{ color: "#2DD4A7" }}
                  >
                    ~{money(fv.future)}
                  </span>
                </div>
                <p className="mt-1 text-[12px] font-mono text-muted text-right tabular-nums">
                  {fmt("bc.invest.contrib", { amount: money(fv.contributed) })} ·{" "}
                  {fmt("bc.invest.growth", { amount: money(fv.growth) })}
                </p>
                <p className="mt-3 text-[11px] text-muted" style={{ lineHeight: 1.5 }}>
                  {t["bc.invest.note"]}
                </p>
              </div>
            )}
          </>
        )}
      </aside>

      {/* ── Allocation rows ── */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">{t["bc.allocation"]}</p>
          {income > 0 && (
            <button
              type="button"
              onClick={toggleRecommended}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                showingRecommended ? "text-ink" : "text-brand-light hover:text-ink"
              }`}
              style={{ border: "1px solid rgba(255,255,255,0.14)" }}
            >
              {showingRecommended ? t["bc.restoreMine"] : `✦ ${t["bc.recommended"]}`}
            </button>
          )}
        </div>

        {income <= 0 ? (
          <p className="mt-10 text-dim text-[15px]">{t["bc.enterIncome"]}</p>
        ) : (
          <>
            <div className="mt-2">
              {evald.lines.map((line) => (
                <AllocationRow
                  key={line.key}
                  label={t[LABEL_KEYS[line.key]]}
                  color={LINE_COLORS[line.key]}
                  statusColor={STATUS_COLORS[line.status]}
                  amount={line.amount}
                  income={income}
                  pct={line.pct}
                  hint={buildHint(line)}
                  changeNote={buildChangeNote(line.key)}
                  // The "other" row displays base + custom total; convert back
                  // to the base amount before storing, or the custom total
                  // ratchets into amounts.other on every edit.
                  onChange={(v) =>
                    handleChange(
                      line.key,
                      line.key === "other" ? Math.max(0, v - activeCustomTotal) : v,
                    )
                  }
                  money={money}
                />
              ))}
            </div>

            {/* ── "Manas rindas" — user-defined lines, rolled into "Citi" ── */}
            <div className="mt-8 flex items-center justify-between gap-4">
              <p className="eyebrow">{t["bc.custom.header"]}</p>
              {activeCustom.length < MAX_CUSTOM && (
                <button
                  type="button"
                  onClick={addCustomLine}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium text-brand-light hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path
                      d="M5.5 1v9M1 5.5h9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {t["bc.custom.add"]}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[12px] text-muted">{t["bc.custom.hint"]}</p>

            {activeCustom.length > 0 && (
              <div className="mt-1">
                {activeCustom.map((line) => (
                  <AllocationRow
                    key={line.id}
                    label={line.name}
                    labelPlaceholder={t["bc.custom.placeholder"]}
                    color="#A8A8B3"
                    statusColor="#64646F"
                    amount={line.amount}
                    income={income}
                    pct={income > 0 ? (line.amount / income) * 100 : 0}
                    onChange={(v) => updateCustomLine(line.id, { amount: v })}
                    onLabelChange={(v) => updateCustomLine(line.id, { name: v })}
                    onRemove={() => removeCustomLine(line.id)}
                    removeLabel={t["bc.custom.remove"]}
                    money={money}
                  />
                ))}
              </div>
            )}

            {/* Lock-to-income toggle */}
            <label className="mt-6 flex items-start gap-2.5 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
                className="sr-only"
              />
              <span
                aria-hidden
                className="mt-0.5 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 transition-colors"
                style={{
                  border: `1px solid ${locked ? "#5A6BFF" : "rgba(255,255,255,0.25)"}`,
                  background: locked ? "#5A6BFF" : "rgba(255,255,255,0.04)",
                }}
              >
                {locked && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                    <path
                      d="M2.2 5.8l2.2 2.2 4.4-4.9"
                      stroke="#fff"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span>
                <span className={`block text-[13.5px] ${locked ? "text-ink font-medium" : "text-dim"}`}>
                  {t["bc.lock"]}
                </span>
                <span className="block mt-0.5 text-[12px] text-muted" style={{ lineHeight: 1.5 }}>
                  {t["bc.lock.hint"]}
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={handleReset}
              className="mt-8 text-[12.5px] text-muted underline underline-offset-2 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            >
              {t["bc.reset"]}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
