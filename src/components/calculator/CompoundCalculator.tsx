import { useEffect, useRef, useState } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { futureValue } from "~/lib/finance";
import { MoneyField, SliderField, glass, useMoney, interpolate, pluralKey } from "./fields";

const STORE_KEY = "taupi:cc:v1";
const CONTRIB_COLOR = "#5A6BFF"; // brand — the money you put in
const GROWTH_COLOR = "#2DD4A7"; // success — the money interest earned

/**
 * Compound interest calculator — the app's futureValue formula with the
 * signature split bar: contributions vs growth, so the "interest on
 * interest" effect is something you see grow as you drag the years.
 */
export default function CompoundCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const money = useMoney(locale);

  const [start, setStart] = useState(0);
  const [monthly, setMonthly] = useState(150);
  const [ret, setRet] = useState(6);
  const [years, setYears] = useState(20);

  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.start === "number") setStart(Math.max(0, s.start));
        if (typeof s.monthly === "number") setMonthly(Math.max(0, s.monthly));
        if (typeof s.ret === "number") setRet(Math.min(15, Math.max(0, s.ret)));
        if (typeof s.years === "number") setYears(Math.min(40, Math.max(1, Math.round(s.years))));
      }
    } catch {}
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ start, monthly, ret, years }));
    } catch {}
  }, [start, monthly, ret, years]);

  const valid = (monthly > 0 || start > 0) && years > 0;
  const r = futureValue(start, monthly, ret, years * 12);
  const contribPct = r.future > 0 ? Math.max(0, (r.contributed / r.future) * 100) : 0;

  const sentence = valid
    ? interpolate(t[pluralKey(locale, years, "cc.sentence")], {
        years,
        future: money(r.future),
        growth: money(Math.max(0, r.growth)),
      })
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 lg:gap-14 items-start">
      {/* Inputs */}
      <div className="rounded-3xl p-6 md:p-8" style={glass}>
        <MoneyField label={t["cc.start"]} value={start} onChange={setStart} />
        <MoneyField label={t["cc.monthly"]} value={monthly} onChange={setMonthly} />
        <SliderField
          label={t["bc.invest.return"]}
          value={ret}
          onChange={setRet}
          min={0}
          max={15}
          step={0.5}
          display={`${ret.toLocaleString(locale === "lv" ? "lv-LV" : "en-GB")}%`}
        />
        <SliderField
          label={t["bc.invest.years"]}
          value={years}
          onChange={setYears}
          min={1}
          max={40}
          display={String(years)}
        />
      </div>

      {/* Result */}
      <div className="lg:sticky lg:top-28">
        {valid ? (
          <>
            <p className="eyebrow mb-2">{t["cc.result"]}</p>
            <p
              className="font-display font-extrabold tracking-tight tabular-nums"
              style={{ fontSize: "clamp(40px, 4.5vw, 64px)", color: GROWTH_COLOR, lineHeight: 1 }}
            >
              ~{money(r.future)}
            </p>

            {/* Signature: the pot split into what you paid in vs what interest earned */}
            <div
              aria-hidden
              className="mt-7 flex h-3.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div className="bc-anim h-full" style={{ width: `${contribPct}%`, background: CONTRIB_COLOR }} />
              <div className="bc-anim h-full" style={{ width: `${100 - contribPct}%`, background: GROWTH_COLOR }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2">
              <span className="flex items-center gap-2 text-[13px] text-dim">
                <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: CONTRIB_COLOR }} />
                {t["cc.contrib"]}
                <span className="font-mono text-ink tabular-nums">{money(r.contributed)}</span>
              </span>
              <span className="flex items-center gap-2 text-[13px] text-dim">
                <span aria-hidden className="w-2.5 h-2.5 rounded-full" style={{ background: GROWTH_COLOR }} />
                {t["cc.growth"]}
                <span className="font-mono text-ink tabular-nums">+{money(Math.max(0, r.growth))}</span>
              </span>
            </div>

            <p
              className="mt-7 pl-3 text-[14px] text-ink"
              style={{ borderLeft: `2px solid ${GROWTH_COLOR}`, lineHeight: 1.6 }}
              aria-live="polite"
            >
              {sentence}
            </p>
            <p className="mt-4 text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
              {t["bc.invest.note"]}
            </p>
          </>
        ) : (
          <p className="text-dim text-[15px]">{t["cc.enter"]}</p>
        )}
      </div>
    </div>
  );
}
