import { useEffect, useMemo, useRef, useState } from "react";
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
} from "~/lib/affordability";
import AllocationRow from "./AllocationRow";

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
const STORE_KEY = "taupi:bc:v1";

const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

type Amounts = Record<LineKey, number>;
type CalcMode = "now" | "whatIf";

const isAmounts = (v: unknown): v is Amounts =>
  !!v && typeof v === "object" && LINES.every((k) => typeof (v as Amounts)[k] === "number");

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
  const [locked, setLocked] = useState(false);
  const [mode, setMode] = useState<CalcMode>("now");
  // "Ko ja?" scenario — null until first opened. Edits there never leak into
  // the real "Tagad" numbers.
  const [whatIf, setWhatIf] = useState<Amounts | null>(null);
  // While showing the recommended split, holds the user's own amounts so a
  // second tap restores them. null = sliders show the user's values.
  const [savedAmounts, setSavedAmounts] = useState<Amounts | null>(null);
  const showingRecommended = savedAmounts !== null;

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
          if (isAmounts(s.whatIf)) setWhatIf(s.whatIf);
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
      localStorage.setItem(STORE_KEY, JSON.stringify({ income, amounts, locked, whatIf }));
    } catch {
      // Storage full/blocked — the tool still works, it just won't remember.
    }
  }, [income, amounts, locked, whatIf]);

  // ── Scenario plumbing (functional updaters, as in the app) ──
  const activeAmounts = mode === "whatIf" && whatIf ? whatIf : amounts;
  type AmountsArg = Amounts | ((prev: Amounts) => Amounts);
  const setActiveAmounts = (next: AmountsArg) => {
    if (mode === "whatIf") {
      setWhatIf((w) => {
        const prev = w ?? amounts;
        return typeof next === "function" ? next(prev) : next;
      });
    } else {
      setAmounts((prev) => (typeof next === "function" ? next(prev) : next));
    }
  };

  const switchMode = (m: CalcMode) => {
    // The "showing recommended" snapshot is scenario-specific — switching
    // modes with it armed would restore the WRONG scenario's amounts.
    setSavedAmounts(null);
    if (m === "whatIf" && !whatIf) setWhatIf({ ...amounts });
    setMode(m);
  };

  const resetWhatIf = () => {
    setSavedAmounts(null);
    setWhatIf({ ...amounts });
  };

  const handleChange = (key: LineKey, value: number) => {
    // Dragging takes over from the recommended preset.
    setSavedAmounts(null);
    setActiveAmounts((prev) =>
      locked ? redistributeLocked(prev, key, value, income) : { ...prev, [key]: value },
    );
  };

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
    setLocked(false);
    setSavedAmounts(null);
    setWhatIf(null);
    setMode("now");
  };

  const commitIncome = () => {
    const parsed = Number.parseFloat(incomeText.replace(",", "."));
    setIncome(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
  };

  const evald = evaluateAllocation(income, activeAmounts);
  const compare = mode === "whatIf" && whatIf ? compareScenarios(income, amounts, whatIf) : null;

  const buildHint = (line: LineEval): string | undefined => {
    if (line.status === "good") return undefined;
    return fmt(line.targetKind === "min" ? "bc.hint.under" : "bc.hint.over", {
      pct: line.pct.toFixed(0),
      target: line.targetPct,
    });
  };

  // "Ko ja?" only: a quiet "↑ no €500" on a line that differs from "Tagad".
  const buildChangeNote = (key: LineKey): string | undefined => {
    if (mode !== "whatIf" || !whatIf) return undefined;
    const base = amounts[key];
    if (Math.abs(whatIf[key] - base) < 0.5) return undefined;
    return fmt(whatIf[key] > base ? "bc.change.up" : "bc.change.down", { amount: money(base) });
  };

  const freePct = income > 0 ? Math.round((Math.abs(evald.free) / income) * 100) : 0;
  const freeColor = evald.overAllocated ? "#FF3B87" : "#2DD4A7";

  // Rounded (not raw) diff — matches what money() displays, so a sub-€1
  // float wobble never paints a color over "no change".
  const freeDiff = compare ? Math.round(compare.freeAfter) - Math.round(compare.freeBefore) : 0;
  let deltaColor = "#F5F5F7";
  if (freeDiff < 0) deltaColor = "#FF3B87";
  else if (freeDiff > 0) deltaColor = "#2DD4A7";

  const buildDeltaNote = (): string => {
    if (!compare) return "";
    const worse = compare.worsened.length;
    const better = compare.improved.length;
    if (worse === 1) return t["bc.delta.worse.one"];
    if (worse > 1) return fmt("bc.delta.worse", { n: worse });
    if (better === 1) return t["bc.delta.better.one"];
    if (better > 1) return fmt("bc.delta.better", { n: better });
    return t["bc.delta.same"];
  };
  const deltaNote = buildDeltaNote();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-12 items-start">
      {/* ── Summary panel — sticky on desktop so the verdict follows the sliders ── */}
      <aside className="lg:sticky lg:top-28 rounded-3xl p-6 md:p-8" style={glass}>
        {/* Mode switch */}
        <div
          className="flex rounded-full p-1"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
        >
          {(["now", "whatIf"] as CalcMode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                aria-pressed={active}
                className={`flex-1 rounded-full py-2 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? "bg-brand text-white" : "text-dim hover:text-ink"
                }`}
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
            {/* Signature: one slim bar carving income into category segments */}
            <div
              aria-hidden
              className="mt-8 flex h-3.5 rounded-full overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.07)",
                outline: evald.overAllocated ? "1px solid rgba(255,59,135,0.55)" : "none",
                outlineOffset: 2,
              }}
            >
              {evald.lines
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
                ))}
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-dim">
                {evald.overAllocated ? t["bc.over"] : t["bc.free"]}
              </span>
              <span
                className="font-display font-extrabold text-[36px] tracking-tight tabular-nums"
                style={{ color: freeColor }}
              >
                {evald.free < 0 ? "−" : ""}€{nf.format(Math.abs(Math.round(evald.free)))}
                <span className="ml-2 font-mono font-normal text-[13px] text-muted">{freePct}%</span>
              </span>
            </div>

            {/* What-if delta — before → after, monthly and yearly */}
            {compare && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12.5px] font-medium text-dim">{t["bc.delta.free"]}</span>
                  <span className="font-mono text-[14px] text-ink tabular-nums">
                    {money(compare.freeBefore)} →{" "}
                    <span style={{ color: deltaColor, fontWeight: 700 }}>{money(compare.freeAfter)}</span>
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[12.5px] font-medium text-dim">{t["bc.delta.annual"]}</span>
                  <span className="font-mono text-[14px] text-ink tabular-nums">
                    {money(compare.annualBefore)} →{" "}
                    <span style={{ color: deltaColor, fontWeight: 700 }}>{money(compare.annualAfter)}</span>
                  </span>
                </div>
                <p className="mt-3 text-[12px] font-mono text-muted text-center" aria-live="polite">
                  {deltaNote}
                </p>
                <button
                  type="button"
                  onClick={resetWhatIf}
                  className="mt-3 block mx-auto text-[12px] text-muted underline underline-offset-2 hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  {t["bc.whatIf.reset"]}
                </button>
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
                showingRecommended
                  ? "text-ink"
                  : "text-brand-light hover:text-ink"
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
                  onChange={(v) => handleChange(line.key, v)}
                  money={money}
                />
              ))}
            </div>

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
