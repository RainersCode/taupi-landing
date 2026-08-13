/**
 * Budget-allocation logic, ported verbatim from the Taupi app
 * (expenses/src/utils/affordability.ts). Pure functions only — the app's
 * seedLines() stayed behind because it reads real account data; the web
 * calculator starts from the recommended split instead.
 * Keep the two files in sync when benchmarks change.
 */

export type LineKey =
  | "housing" | "utilities" | "transport" | "food" | "savings" | "debt" | "other";

export const LINES: LineKey[] = [
  "housing", "utilities", "transport", "food", "savings", "debt", "other",
];

export type LineStatus = "good" | "amber" | "over" | "under";

export interface LineEval {
  key: LineKey;
  amount: number;
  pct: number;
  status: LineStatus;
  targetKind: "max" | "min";
  targetPct: number;
}

// Healthy-spending guidelines as % of income (take-home). `higherBetter` lines
// (savings) want pct ABOVE the thresholds; all others want it BELOW.
// Sources: Ramsey (≤25% housing, 50/30/20), NerdWallet & WalletHub (10–15%
// transport/food), PocketGuard (category breakdowns).
interface Benchmark {
  higherBetter: boolean;
  good: number;  // lower-better: ≤good is good; higher-better: ≥good is good
  amber: number; // lower-better: ≤amber is amber; higher-better: ≥amber is amber
}

export const BENCHMARKS: Record<LineKey, Benchmark> = {
  housing:   { higherBetter: false, good: 25, amber: 30 },
  utilities: { higherBetter: false, good: 10, amber: 15 },
  transport: { higherBetter: false, good: 15, amber: 20 },
  food:      { higherBetter: false, good: 15, amber: 20 },
  savings:   { higherBetter: true,  good: 20, amber: 10 },
  debt:      { higherBetter: false, good: 15, amber: 25 },
  other:     { higherBetter: false, good: 30, amber: 40 },
};

export function evaluateLine(
  key: LineKey,
  amount: number,
  income: number,
): { pct: number; status: LineStatus; targetKind: "max" | "min"; targetPct: number } {
  const b = BENCHMARKS[key];
  const pct = income > 0 ? (amount / income) * 100 : 0;
  const status: LineStatus = b.higherBetter
    ? (pct >= b.good ? "good" : pct >= b.amber ? "amber" : "under")
    : (pct <= b.good ? "good" : pct <= b.amber ? "amber" : "over");
  return {
    pct,
    status,
    targetKind: b.higherBetter ? "min" : "max",
    targetPct: b.good,
  };
}

export function evaluateAllocation(
  income: number,
  amounts: Record<LineKey, number>,
): { lines: LineEval[]; allocated: number; free: number; overAllocated: boolean } {
  const lines: LineEval[] = LINES.map((key) => {
    const amount = amounts[key];
    const { pct, status, targetKind, targetPct } = evaluateLine(key, amount, income);
    return { key, amount, pct, status, targetKind, targetPct };
  });
  const allocated = LINES.reduce((s, k) => s + amounts[k], 0);
  const free = income - allocated;
  return { lines, allocated, free, overAllocated: free < 0 };
}

export function redistributeLocked(
  amounts: Record<LineKey, number>,
  changedKey: LineKey,
  newValue: number,
  income: number,
): Record<LineKey, number> {
  const clamped = Math.min(income, Math.max(0, newValue));
  const others = LINES.filter((k) => k !== changedKey);
  const othersTotal = others.reduce((s, k) => s + amounts[k], 0);
  const remaining = income - clamped; // ≥ 0 because clamped ≤ income
  const next = { ...amounts, [changedKey]: clamped };
  if (othersTotal <= 0) {
    // Nothing to scale — dump the remainder into a fallback line.
    const fallback: LineKey = changedKey === "other" ? "housing" : "other";
    for (const k of others) next[k] = 0;
    next[fallback] = remaining;
    return next;
  }
  const scale = remaining / othersTotal;
  for (const k of others) next[k] = amounts[k] * scale;
  return next;
}

// ── Recommended "best practice" split ────────────────────────────────────────
// Best-practice shares of the NON-debt income (sum to 1). Debt is treated as a
// real obligation: `recommendedAmounts` keeps the user's current debt and
// distributes whatever income is left by these weights, so a debt-free user
// gets the full ideal and an indebted user gets the same ideal shaped around
// their debt.
export const RECOMMENDED_WEIGHTS: Record<Exclude<LineKey, "debt">, number> = {
  housing: 0.25, utilities: 0.07, transport: 0.10, food: 0.13, savings: 0.20, other: 0.25,
};

export function recommendedAmounts(income: number, currentDebt: number): Record<LineKey, number> {
  const debt = Math.min(Math.max(0, currentDebt), Math.max(0, income));
  const remaining = Math.max(0, income - debt);
  const out: Record<LineKey, number> = {
    housing: 0, utilities: 0, transport: 0, food: 0, savings: 0, debt, other: 0,
  };
  (Object.keys(RECOMMENDED_WEIGHTS) as Array<Exclude<LineKey, "debt">>).forEach((k) => {
    out[k] = RECOMMENDED_WEIGHTS[k] * remaining;
  });
  return out;
}

// ── Scenario comparison (before/after, for the what-if delta panel) ──────────

// Status severity: higher is worse. "under" (savings below threshold) and
// "over" (spending above it) are the same level of problem, opposite signs.
const STATUS_RANK: Record<LineStatus, number> = { good: 0, amber: 1, over: 2, under: 2 };

export interface ScenarioDelta {
  key: LineKey;
  fromPct: number;
  toPct: number;
  fromStatus: LineStatus;
  toStatus: LineStatus;
}

export function compareScenarios(
  income: number,
  base: Record<LineKey, number>,
  next: Record<LineKey, number>,
): {
  freeBefore: number; freeAfter: number;
  annualBefore: number; annualAfter: number;
  worsened: ScenarioDelta[]; improved: ScenarioDelta[];
} {
  const a = evaluateAllocation(income, base);
  const b = evaluateAllocation(income, next);
  const worsened: ScenarioDelta[] = [];
  const improved: ScenarioDelta[] = [];
  for (const key of LINES) {
    const la = a.lines.find((l) => l.key === key)!;
    const lb = b.lines.find((l) => l.key === key)!;
    const row: ScenarioDelta = { key, fromPct: la.pct, toPct: lb.pct, fromStatus: la.status, toStatus: lb.status };
    // Only a REAL status change counts — % movement inside a band is not news.
    if (STATUS_RANK[lb.status] > STATUS_RANK[la.status]) worsened.push(row);
    else if (STATUS_RANK[lb.status] < STATUS_RANK[la.status]) improved.push(row);
  }
  return {
    freeBefore: a.free, freeAfter: b.free,
    annualBefore: a.free * 12, annualAfter: b.free * 12,
    worsened, improved,
  };
}
