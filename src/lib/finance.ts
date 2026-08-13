/**
 * Personal-finance math, ported verbatim from the Taupi app
 * (expenses/src/utils/finance.ts — the slices the web tools use:
 * futureValue, monthsToGoal, emergencyFund, debtPayoff). Rates are
 * PERCENT numbers (9 => 9%). Keep in sync with the app when the
 * formulas change.
 */

export interface FutureValue {
  future: number;
  contributed: number;
  growth: number;
}

export function futureValue(
  start: number,
  monthly: number,
  annualReturnPct: number,
  months: number,
): FutureValue {
  const s = start > 0 ? start : 0;
  const m = monthly > 0 ? monthly : 0;
  const n = months > 0 ? months : 0;
  const i = annualReturnPct / 100 / 12;
  let future: number;
  if (i === 0) {
    future = s + m * n;
  } else {
    const pow = Math.pow(1 + i, n);
    future = s * pow + m * ((pow - 1) / i);
  }
  const contributed = s + m * n;
  return { future, contributed, growth: future - contributed };
}

export function monthsToGoal(
  start: number,
  monthly: number,
  target: number,
  annualReturnPct: number,
): number | null {
  if (target <= 0) return 0;
  const s = start > 0 ? start : 0;
  if (s >= target) return 0;
  const m = monthly > 0 ? monthly : 0;
  const i = annualReturnPct / 100 / 12;

  if (m <= 0 && i <= 0) return null; // static, never grows
  if (m <= 0 && i > 0) {
    if (s <= 0) return null; // nothing to grow
    const n = Math.log(target / s) / Math.log(1 + i);
    return Number.isFinite(n) && n >= 0 ? Math.ceil(n) : null;
  }
  if (i === 0) {
    return Math.ceil((target - s) / m);
  }
  // s*(1+i)^n + m*((1+i)^n - 1)/i = target
  //   => (1+i)^n = (target + m/i) / (s + m/i)
  const ratio = (target + m / i) / (s + m / i);
  if (ratio <= 0) return null;
  const n = Math.log(ratio) / Math.log(1 + i);
  return Number.isFinite(n) && n >= 0 ? Math.ceil(n) : null;
}

export interface EmergencyFund {
  target: number;    // monthlyExpenses * months
  shortfall: number; // max(0, target - currentSaved)
  pct: number;       // clamped 0-100
}

export function emergencyFund(
  monthlyExpenses: number,
  months: number,
  currentSaved: number,
): EmergencyFund {
  const exp = monthlyExpenses > 0 ? monthlyExpenses : 0;
  const m = months > 0 ? months : 0;
  const saved = currentSaved > 0 ? currentSaved : 0;
  const target = exp * m;
  const shortfall = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  return { target, shortfall, pct };
}

export interface Debt {
  balance: number;
  aprPct: number;
  minPayment: number;
}

export interface DebtPayoffResult {
  months: number;
  totalInterest: number;
}

// Month-by-month debt simulation on a constant monthly budget = sum(minPayments) + extra.
// Each month: accrue interest on every unpaid debt, pay each its minimum, then throw the
// remaining budget (extra + freed-up minimums) at the priority debt — snowball = lowest
// balance first, avalanche = highest aprPct first. Returns null if the set never amortizes
// (a stalled month where total balance does not fall) or there are no valid debts.
export function debtPayoff(
  debts: Debt[],
  extra: number,
  strategy: "snowball" | "avalanche",
): DebtPayoffResult | null {
  const active = debts
    .filter((d) => d.balance > 0 && d.minPayment > 0)
    .map((d) => ({ balance: d.balance, apr: d.aprPct, min: d.minPayment }));
  if (active.length === 0) return null;

  const budget = active.reduce((s, d) => s + d.min, 0) + (extra > 0 ? extra : 0);
  const EPS = 0.005;
  const cap = 1200;
  const total = () => active.reduce((s, d) => s + d.balance, 0);

  let totalInterest = 0;
  let months = 0;

  while (total() > EPS) {
    if (months >= cap) return null;
    const prev = total();
    months++;

    for (const d of active) {
      if (d.balance > EPS) {
        const i = d.balance * (d.apr / 100 / 12);
        d.balance += i;
        totalInterest += i;
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
  }

  return { months, totalInterest };
}
