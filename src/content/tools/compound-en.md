---
tool: "compound"
locale: "en"
sources:
  - label: "European Central Bank — Two per cent inflation target"
    href: "https://www.ecb.europa.eu/mopo/strategy/pricestab/html/index.en.html"
  - label: "European Commission — Deposit guarantee schemes"
    href: "https://finance.ec.europa.eu/banking/banking-regulation/deposit-guarantee-schemes_en"
---

## A compound interest calculator in euros

Most compound interest calculators are built for US savers: dollars, 401(k) assumptions, US tax notes. This one works in euros and assumes nothing about where you live — you enter a starting amount, a monthly contribution, a yearly return and a number of years, and it shows what the pot grows into with monthly compounding.

The result is split into two numbers, and the ratio between them is the whole point: **what you paid in** and **what the interest earned**.

With the default values — €150 a month, 6% a year, 20 years:

| | Amount |
|---|---|
| You paid in | €36,000 |
| Interest earned | €33,306 |
| **Total after 20 years** | **€69,306** |

Almost half of the final amount is not money you put there. And that half grows unevenly: in the early years interest is barely visible, then at some point it starts earning more per month than you contribute. The chart marks that crossover — at €150 a month and 6% it arrives in year 13.

## Time matters more than the amount

The same €150 a month at 6%, over four different periods:

| Period | You paid in | Interest earned | Total |
|---|---|---|---|
| 10 years | €18,000 | €6,582 | €24,582 |
| 20 years | €36,000 | €33,306 | €69,306 |
| 30 years | €54,000 | €96,677 | €150,677 |
| 40 years | €72,000 | €226,724 | €298,724 |

Going from 20 to 40 years **doubles what you pay in and more than quadruples the result.** After 10 years interest is a rounding error; after 40 it is three quarters of the pot.

That is also the cost of waiting. Someone who starts at 25 and someone who starts at 35, both saving €150 a month until 65, end up with €298,724 and €150,677. The ten-year delay costs €148,047, while the difference in contributions is only €18,000.

The practical conclusion is not "save more". It is: **start now with an amount that is realistic today.**

## The formula

For a starting amount *P*, a monthly contribution *M*, a yearly rate *r* and *n* months, with interest added monthly:

**Future value = P × (1 + r/12)ⁿ + M × ((1 + r/12)ⁿ − 1) ÷ (r/12)**

The first half is the starting amount growing on its own; the second half is the stream of monthly contributions, each one compounding for the months it has left. Contributions are counted at the end of each month.

A useful shortcut is the **rule of 72**: divide 72 by the yearly return to get the approximate number of years it takes money to double. At 6% that is about 12 years; at 3% it is 24; at 8% it is 9. A single €10,000 deposit at 6% becomes roughly €18,194 after 10 years, €33,102 after 20 and €60,226 after 30.

## Which return should you enter?

The calculator assumes one constant yearly return. Real life never delivers that, so the number you choose decides how seriously to take the result.

| Where the money is | Rough return | Note |
|---|---|---|
| Current account | ~0% | Loses purchasing power every year |
| Savings account or term deposit | Low but fixed | Bank deposits in the EU are guaranteed up to €100,000 |
| Broad stock index funds | Historically around 5–8% a year over long periods | Fluctuates; some years will be sharply negative |

Run it twice — once with a cautious figure such as 4%, once with an optimistic one such as 8% — and treat the gap as the honest range. For €150 a month over 20 years that range is €55,016 to €88,353.

Two caveats. The long-run average is not what you receive each year, and past returns do not guarantee future ones. And the shorter the period, the less the average means: money you need in three years does not belong in the stock market, because it may be down exactly when you need it.

## Inflation: €69,306 in 20 years is not €69,306 today

The calculator shows a **nominal** amount — the number of euros in the account. What those euros will buy depends on inflation. The European Central Bank aims for 2% inflation over the medium term, so a sensible way to see the result in today's money is to subtract about two percentage points from the return you enter.

At 6% nominal and 2% inflation, the real return is roughly 4%, and the same €150 a month for 20 years is worth about **€55,000 in today's purchasing power** rather than €69,306. The money is the same; it simply buys less.

## Fees compound too

A fund that charges 1% a year does not cost you 1% of the result. It lowers the return every single year, and that loss compounds exactly like the gains do. €150 a month for 30 years grows to €150,677 at 6% and to €124,839 at 5% — the one-point difference costs **€25,838**, more than 17% of the final pot. When you compare funds or pension plans, the yearly fee is one of the few variables you fully control.

## Things this calculator leaves out

- **Tax.** How investment gains and interest are taxed differs in every country, and some countries offer tax-advantaged accounts or pension relief. Check the rules where you are tax resident.
- **Currency.** If you earn and spend in euros but hold assets priced in another currency, exchange-rate moves add or subtract from the return.
- **Changing contributions.** Most people raise their monthly amount as income grows. Re-run the numbers when yours changes.

This page is an educational tool, not investment advice.
