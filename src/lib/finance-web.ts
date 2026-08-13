import type { Debt } from "./finance";

/**
 * Web-only companions to lib/finance.ts — the charts need full
 * trajectories, not just totals. debtPayoffSeries replicates the app's
 * debtPayoff month loop exactly (same EPS, cap, ordering) but records
 * the month-end total balance. If debtPayoff changes in the app, this
 * must change with it.
 */
export function debtPayoffSeries(
  debts: Debt[],
  extra: number,
  strategy: "snowball" | "avalanche",
): number[] | null {
  const active = debts
    .filter((d) => d.balance > 0 && d.minPayment > 0)
    .map((d) => ({ balance: d.balance, apr: d.aprPct, min: d.minPayment }));
  if (active.length === 0) return null;

  const budget = active.reduce((s, d) => s + d.min, 0) + (extra > 0 ? extra : 0);
  const EPS = 0.005;
  const cap = 1200;
  const total = () => active.reduce((s, d) => s + d.balance, 0);

  const series: number[] = [total()];
  let months = 0;

  while (total() > EPS) {
    if (months >= cap) return null;
    const prev = total();
    months++;

    for (const d of active) {
      if (d.balance > EPS) {
        d.balance += d.balance * (d.apr / 100 / 12);
      }
    }

    let pool = budget;
    for (const d of active) {
      if (d.balance > EPS) {
        const pay = Math.min(d.min, d.balance);
        d.balance -= pay;
        pool -= pay;
      }
    }

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

    if (total() >= prev - EPS) return null; // not amortizing
    series.push(Math.max(0, total()));
  }

  return series;
}
