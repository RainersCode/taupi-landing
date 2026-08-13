/**
 * Investment math, ported verbatim from the Taupi app
 * (expenses/src/utils/finance.ts — the futureValue slice). Monthly
 * compounding of a starting pot plus fixed monthly contributions.
 * Keep in sync with the app when the formula changes.
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
