import type { Debt } from "./finance";

// The simulation's two give-up rules, named once so the closed-form helpers
// below can agree with it exactly rather than approximately.
const SIM_EPS = 0.005;
const SIM_MONTH_CAP = 1200;

/**
 * Web-only companions to lib/finance.ts — the charts need full trajectories,
 * not just totals. debtPayoffPerDebtSeries replicates the app's debtPayoff
 * month loop exactly (same EPS, cap, ordering) but records every debt's
 * month-end balance; debtPayoffSeries is just its column sum. Keeping ONE
 * simulation here means the stacked chart and the total line can never drift
 * apart. If debtPayoff changes in the app, this must change with it.
 */

/**
 * The contractual annuity payment that clears `balance` in exactly `months` at
 * `aprPct`. Lets a debt be described by its term (what the loan agreement
 * states, and what people actually remember) instead of its monthly payment.
 *
 * The result is always strictly greater than one month's interest, so a debt
 * entered by term can never fail to amortize.
 */
export function annuityPayment(balance: number, aprPct: number, months: number): number {
  const p = Math.max(0, balance);
  const n = Math.max(0, months);
  if (p === 0 || n === 0) return 0;
  const i = aprPct / 100 / 12;
  if (i <= 0) return p / n;
  return (p * i) / (1 - Math.pow(1 + i, -n));
}

/**
 * Months needed to clear `balance` at `aprPct` paying `payment` each month, or
 * null when that never realistically happens. "Never" is deliberately defined
 * the same way the simulation defines it — including its 1200-month ceiling —
 * so a debt card can never claim a payoff the chart refuses to draw.
 */
export function monthsForPayment(balance: number, aprPct: number, payment: number): number | null {
  const p = Math.max(0, balance);
  if (p === 0) return 0;
  if (payment <= 0) return null;
  const i = aprPct / 100 / 12;
  // Nudge before rounding up: the exact term of an annuity payment lands a
  // hair above the whole month in floating point, and a bare Math.ceil would
  // turn a 60-month loan into 61 — and creep another month on every
  // payment <-> term switch.
  const whole = (n: number) => {
    const m = Math.max(1, Math.ceil(n - 1e-7));
    return m > SIM_MONTH_CAP ? null : m;
  };
  if (i <= 0) return whole(p / payment);
  if (payment <= p * i) return null; // payment never covers the interest
  // A payment that clears less than the simulation's rounding epsilon per month
  // stalls there, so treat it as never here too.
  if (payment - p * i < SIM_EPS) return null;
  const n = -Math.log(1 - (p * i) / payment) / Math.log(1 + i);
  return Number.isFinite(n) ? whole(n) : null;
}

/**
 * One balance trajectory per input debt, in INPUT ORDER, so a caller can hold a
 * stable colour per debt across a strategy switch. Every trajectory has the
 * same length (months + 1); a cleared debt stays at 0 for the rest of the run.
 * Returns null if the debts never amortize, exactly like debtPayoff.
 */
export function debtPayoffPerDebtSeries(
  debts: Debt[],
  extra: number,
  strategy: "snowball" | "avalanche",
): number[][] | null {
  const active = debts
    .filter((d) => d.balance > 0 && d.minPayment > 0)
    .map((d) => ({ balance: d.balance, apr: d.aprPct, min: d.minPayment }));
  if (active.length === 0) return null;

  const budget = active.reduce((s, d) => s + d.min, 0) + Math.max(0, extra);
  const EPS = SIM_EPS;
  const cap = SIM_MONTH_CAP;
  const total = () => active.reduce((s, d) => s + d.balance, 0);

  const perDebt: number[][] = active.map((d) => [d.balance]);
  let months = 0;

  while (total() > EPS) {
    if (months >= cap) return null;
    const prev = total();
    months++;

    accrueInterest(active, EPS);
    const pool = payMinimums(active, budget, EPS);
    attackPriority(active, pool, EPS, strategy);

    if (total() >= prev - EPS) return null; // not amortizing
    active.forEach((d, i) => perDebt[i].push(Math.max(0, d.balance)));
  }

  return perDebt;
}

/** Month-end TOTAL balance, i.e. the per-debt trajectories summed. */
export function debtPayoffSeries(
  debts: Debt[],
  extra: number,
  strategy: "snowball" | "avalanche",
): number[] | null {
  const perDebt = debtPayoffPerDebtSeries(debts, extra, strategy);
  if (!perDebt) return null;
  return perDebt[0].map((_, m) => perDebt.reduce((s, d) => s + d[m], 0));
}

// ── the three steps of one month, split out so the loop above stays readable ──

type Live = { balance: number; apr: number; min: number };

function accrueInterest(active: Live[], EPS: number): void {
  for (const d of active) {
    if (d.balance > EPS) d.balance += d.balance * (d.apr / 100 / 12);
  }
}

/** Pays every debt its minimum; returns what's left of the monthly budget. */
function payMinimums(active: Live[], budget: number, EPS: number): number {
  let pool = budget;
  for (const d of active) {
    if (d.balance > EPS) {
      const pay = Math.min(d.min, d.balance);
      d.balance -= pay;
      pool -= pay;
    }
  }
  return pool;
}

/** Throws everything left at the priority debt, rolling over as debts clear. */
function attackPriority(
  active: Live[],
  startPool: number,
  EPS: number,
  strategy: "snowball" | "avalanche",
): void {
  let pool = startPool;
  while (pool > EPS) {
    const remaining = active.filter((d) => d.balance > EPS);
    if (remaining.length === 0) break;
    remaining.sort((a, b) =>
      strategy === "snowball" ? a.balance - b.balance : b.apr - a.apr,
    );
    const target = remaining[0];
    const pay = Math.min(pool, target.balance);
    target.balance -= pay;
    pool -= pay;
  }
}
