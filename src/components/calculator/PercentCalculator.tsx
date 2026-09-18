import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import NumberFlow from "@number-flow/react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { StageGlow, glass, interpolate } from "./fields";

const STORE_KEY = "taupi:pc:v1";

/** This tool's signature color — the four existing calculators already own
 *  indigo, mint, sky and coral (see ToolsHubPage). */
const GOLD = "#FFB547";

/**
 * Plain percentage calculator — the four everyday questions that the
 * compound-interest page was wrongly absorbing. Search Console shows
 * "procentu kalkulators" at position 9 with 42 impressions and zero clicks:
 * people asking "what is 15% of 200" were being offered a 40-year savings
 * projection. This page answers the question they actually asked.
 *
 * Unlike the other calculators, money here is NOT rounded to whole euros —
 * "21% of 47.50" is meaningless without the cents.
 */
type Mode = "part" | "share" | "change" | "vat";

const MODES: Mode[] = ["part", "share", "change", "vat"];

/** Latvia's VAT rates (PVN likums 41. pants): 21% standard, 12% reduced
 *  (medicines, heating, press), 5% (fresh Latvian-grown produce). */
const VAT_RATES = [21, 12, 5];

/** Up to 2 decimals, trailing zeros trimmed: 30 → "30", 30.5 → "30,5". */
function useFormat(locale: Locale) {
  const tag = locale === "lv" ? "lv-LV" : "en-GB";
  return (n: number) =>
    new Intl.NumberFormat(tag, { maximumFractionDigits: 2 }).format(
      Number.isFinite(n) ? n : 0,
    );
}

/** Animated readout with the same odometer feel as the other tools, but
 *  keeping cents. `sign` stays outside so it can be colored separately. */
function Flow({
  value,
  locale,
  prefix,
  suffix,
}: {
  value: number;
  locale: Locale;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <NumberFlow
      value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
      prefix={prefix}
      suffix={suffix}
      locales={locale === "lv" ? "lv-LV" : "en-GB"}
      format={{ maximumFractionDigits: 2 }}
    />
  );
}

/** Plain number field — underlined, commits on blur/Enter. The sliders the
 *  other tools use make no sense here: nobody drags to "47.50". */
function Field({
  label,
  value,
  onChange,
  unit,
  suffix,
  hint,
  allowNegative = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  suffix?: string;
  hint?: string;
  allowNegative?: boolean;
}) {
  const rounded = Math.round(value * 100) / 100;
  const [text, setText] = useState(String(rounded));
  useEffect(() => {
    setText(String(rounded));
  }, [rounded]);

  const commit = () => {
    const parsed = Number.parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) onChange(allowNegative ? parsed : Math.max(0, parsed));
    else setText(String(rounded));
  };

  return (
    <div>
      <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 border-b border-frost/15 focus-within:border-[#FFB547] transition-colors pb-1">
        {unit && <span className="text-dim text-[17px] shrink-0">{unit}</span>}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          aria-label={label}
          className="w-full min-w-0 bg-transparent font-display font-bold text-[26px] text-ink tracking-tight outline-none tabular-nums"
        />
        {suffix && <span className="text-dim text-[17px] shrink-0">{suffix}</span>}
      </div>
      {hint && (
        <p className="mt-1.5 text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** Proportion bar — the one visual that reads correctly in all four modes:
 *  a filled share of a track, optionally with a second overflow segment
 *  (a percentage above 100, or the VAT sitting on top of the net amount). */
function ProportionBar({
  fill,
  overflow = 0,
  labelFill,
  labelOverflow,
}: {
  /** 0–100, the primary segment. */
  fill: number;
  /** 0–100, a second segment drawn after the first. */
  overflow?: number;
  labelFill?: string;
  labelOverflow?: string;
}) {
  const a = Math.max(0, Math.min(100, fill));
  const b = Math.max(0, Math.min(100 - a, overflow));
  return (
    <div>
      <div
        className="relative h-4 w-full rounded-full overflow-hidden"
        style={{ background: "rgb(var(--frost-rgb) / 0.07)" }}
        aria-hidden
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${a}%`,
            background: "linear-gradient(90deg, #FFB547, #FF9A3C)",
            transition: "width 400ms cubic-bezier(0.22, 0.8, 0.2, 1)",
          }}
        />
        <div
          className="absolute inset-y-0"
          style={{
            left: `${a}%`,
            width: `${b}%`,
            background: "rgba(255,181,71,0.28)",
            transition: "left 400ms cubic-bezier(0.22, 0.8, 0.2, 1), width 400ms cubic-bezier(0.22, 0.8, 0.2, 1)",
          }}
        />
      </div>
      {(labelFill || labelOverflow) && (
        <div className="mt-2.5 flex items-center gap-5 flex-wrap">
          {labelFill && (
            <span className="flex items-center gap-2 font-mono text-[11px] text-dim tabular-nums">
              <span className="h-2 w-2 rounded-full" style={{ background: GOLD }} />
              {labelFill}
            </span>
          )}
          {labelOverflow && (
            <span className="flex items-center gap-2 font-mono text-[11px] text-dim tabular-nums">
              <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,181,71,0.45)" }} />
              {labelOverflow}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function PercentCalculator({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const f = useFormat(locale);
  const eur = (n: number) => `€${f(n)}`;

  const [mode, setMode] = useState<Mode>("part");

  // Each mode keeps its own pair of numbers, so switching tabs never
  // silently reinterprets "200" as something else.
  const [pctRate, setPctRate] = useState(15);
  const [pctBase, setPctBase] = useState(200);
  const [sharePart, setSharePart] = useState(30);
  const [shareWhole, setShareWhole] = useState(200);
  const [changeFrom, setChangeFrom] = useState(200);
  const [changeTo, setChangeTo] = useState(230);
  const [vatAmount, setVatAmount] = useState(100);
  const [vatRate, setVatRate] = useState(21);
  const [vatIncludes, setVatIncludes] = useState(false);

  const hydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (MODES.includes(s.mode)) setMode(s.mode);
        const num = (v: unknown, set: (n: number) => void) => {
          if (typeof v === "number" && Number.isFinite(v)) set(v);
        };
        num(s.pctRate, setPctRate);
        num(s.pctBase, setPctBase);
        num(s.sharePart, setSharePart);
        num(s.shareWhole, setShareWhole);
        num(s.changeFrom, setChangeFrom);
        num(s.changeTo, setChangeTo);
        num(s.vatAmount, setVatAmount);
        if (VAT_RATES.includes(s.vatRate)) setVatRate(s.vatRate);
        if (typeof s.vatIncludes === "boolean") setVatIncludes(s.vatIncludes);
      }
    } catch {}
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          mode,
          pctRate,
          pctBase,
          sharePart,
          shareWhole,
          changeFrom,
          changeTo,
          vatAmount,
          vatRate,
          vatIncludes,
        }),
      );
    } catch {}
  }, [
    mode,
    pctRate,
    pctBase,
    sharePart,
    shareWhole,
    changeFrom,
    changeTo,
    vatAmount,
    vatRate,
    vatIncludes,
  ]);

  // ── The four answers ──────────────────────────────────────────────────
  const partResult = (pctBase * pctRate) / 100;

  const shareValid = shareWhole > 0;
  const sharePct = shareValid ? (sharePart / shareWhole) * 100 : 0;

  const changeValid = changeFrom > 0;
  const changeDiff = changeTo - changeFrom;
  const changePct = changeValid ? (changeDiff / changeFrom) * 100 : 0;

  const vatNet = vatIncludes ? vatAmount / (1 + vatRate / 100) : vatAmount;
  const vatTax = vatNet * (vatRate / 100);
  const vatGross = vatNet + vatTax;

  // ── Presentation per mode ─────────────────────────────────────────────
  let answer: React.ReactNode;
  let answerLabel: string;
  let sentence: string;
  let bar: React.ReactNode = null;
  let invalid: string | null = null;

  if (mode === "part") {
    answerLabel = t["pc.part.answer"];
    answer = <Flow value={partResult} locale={locale} prefix="€" />;
    sentence = interpolate(t["pc.part.sentence"], {
      rate: f(pctRate),
      base: eur(pctBase),
      result: eur(partResult),
    });
    bar = (
      <ProportionBar
        fill={Math.min(100, pctRate)}
        overflow={pctRate > 100 ? 100 : 0}
        labelFill={interpolate(t["pc.part.bar"], { rate: f(Math.min(pctRate, 100)), result: eur(partResult) })}
        labelOverflow={pctRate > 100 ? t["pc.part.over"] : undefined}
      />
    );
  } else if (mode === "share") {
    answerLabel = t["pc.share.answer"];
    answer = <Flow value={sharePct} locale={locale} suffix="%" />;
    sentence = interpolate(t["pc.share.sentence"], {
      part: eur(sharePart),
      whole: eur(shareWhole),
      pct: f(sharePct),
    });
    invalid = shareValid ? null : t["pc.share.invalid"];
    bar = (
      <ProportionBar
        fill={Math.min(100, sharePct)}
        labelFill={interpolate(t["pc.share.bar"], { part: eur(sharePart), whole: eur(shareWhole) })}
      />
    );
  } else if (mode === "change") {
    const up = changeDiff >= 0;
    answerLabel = t["pc.change.answer"];
    answer = (
      <>
        <span aria-hidden>{up ? "+" : "−"}</span>
        <Flow value={Math.abs(changePct)} locale={locale} suffix="%" />
      </>
    );
    sentence = interpolate(
      t[up ? "pc.change.sentence.up" : "pc.change.sentence.down"],
      {
        from: eur(changeFrom),
        to: eur(changeTo),
        diff: eur(Math.abs(changeDiff)),
        pct: f(Math.abs(changePct)),
      },
    );
    invalid = changeValid ? null : t["pc.change.invalid"];
    // Both bars share one scale, so the visual length ratio IS the change.
    const peak = Math.max(changeFrom, changeTo, 1);
    bar = (
      <div className="space-y-3">
        <ProportionBar fill={(changeFrom / peak) * 100} labelFill={`${t["pc.change.from"]} ${eur(changeFrom)}`} />
        <ProportionBar fill={(changeTo / peak) * 100} labelFill={`${t["pc.change.to"]} ${eur(changeTo)}`} />
      </div>
    );
  } else {
    answerLabel = vatIncludes ? t["pc.vat.answer.net"] : t["pc.vat.answer.gross"];
    answer = <Flow value={vatIncludes ? vatNet : vatGross} locale={locale} prefix="€" />;
    sentence = interpolate(t[vatIncludes ? "pc.vat.sentence.out" : "pc.vat.sentence.in"], {
      amount: eur(vatAmount),
      rate: f(vatRate),
      net: eur(vatNet),
      tax: eur(vatTax),
      gross: eur(vatGross),
    });
    const netShare = vatGross > 0 ? (vatNet / vatGross) * 100 : 0;
    bar = (
      <ProportionBar
        fill={netShare}
        overflow={100 - netShare}
        labelFill={`${t["pc.vat.net"]} ${eur(vatNet)}`}
        labelOverflow={`${t["pc.vat.tax"]} ${eur(vatTax)}`}
      />
    );
  }

  const tabStyle = (active: boolean): CSSProperties =>
    active
      ? { background: "rgba(255,181,71,0.14)", borderColor: "rgba(255,181,71,0.45)", color: GOLD }
      : { background: "rgb(var(--frost-rgb) / 0.04)", borderColor: "rgb(var(--frost-rgb) / 0.10)" };

  return (
    <div>
      {/* Mode picker — a real tablist so the four questions are one control,
          not four pages. */}
      <div role="tablist" aria-label={t["pc.modes"]} className="flex flex-wrap gap-2.5 mb-10">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className="rounded-full border px-4 py-2 text-[13.5px] font-medium text-dim transition-colors hover:text-ink"
            style={tabStyle(mode === m)}
          >
            {t[`pc.mode.${m}`]}
          </button>
        ))}
      </div>

      {/* The answer */}
      <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] gap-10 lg:gap-14 items-center">
        <StageGlow color="rgba(255,181,71,0.10)" />

        <div>
          <p className="eyebrow mb-3">{answerLabel}</p>
          <p
            className="font-display font-extrabold tracking-tightest tabular-nums"
            style={{ fontSize: "clamp(46px, 5.5vw, 84px)", color: GOLD, lineHeight: 0.95 }}
          >
            {invalid ? "—" : answer}
          </p>
          <p
            className="mt-5 text-[15px] text-dim max-w-[42ch]"
            style={{ lineHeight: 1.6 }}
            aria-live="polite"
          >
            {invalid ?? sentence}
          </p>
        </div>

        {/* The bar needs a frame: on its own in a half-empty column it reads
            as a stray progress indicator rather than the answer's anatomy. */}
        {!invalid && (
          <div className="rounded-3xl p-6 md:p-7" style={glass}>
            <p className="eyebrow mb-5">{t["pc.breakdown"]}</p>
            {bar}
          </div>
        )}
      </div>

      {/* Inputs */}
      <div
        className="mt-12 rounded-3xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7"
        style={glass}
      >
        {mode === "part" && (
          <>
            <Field label={t["pc.f.rate"]} value={pctRate} onChange={setPctRate} suffix="%" />
            <Field label={t["pc.f.base"]} value={pctBase} onChange={setPctBase} unit="€" />
          </>
        )}
        {mode === "share" && (
          <>
            <Field label={t["pc.f.part"]} value={sharePart} onChange={setSharePart} unit="€" />
            <Field label={t["pc.f.whole"]} value={shareWhole} onChange={setShareWhole} unit="€" />
          </>
        )}
        {mode === "change" && (
          <>
            <Field label={t["pc.f.from"]} value={changeFrom} onChange={setChangeFrom} unit="€" />
            <Field
              label={t["pc.f.to"]}
              value={changeTo}
              onChange={setChangeTo}
              unit="€"
              hint={t["pc.f.to.hint"]}
            />
          </>
        )}
        {mode === "vat" && (
          <>
            <Field
              label={vatIncludes ? t["pc.f.amount.gross"] : t["pc.f.amount.net"]}
              value={vatAmount}
              onChange={setVatAmount}
              unit="€"
            />
            <div>
              <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-2">
                {t["pc.f.vatrate"]}
              </p>
              <div className="flex flex-wrap gap-2">
                {VAT_RATES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={vatRate === r}
                    onClick={() => setVatRate(r)}
                    className="rounded-full border px-3.5 py-1.5 font-mono text-[13px] text-dim tabular-nums transition-colors hover:text-ink"
                    style={tabStyle(vatRate === r)}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
                {t[`pc.vat.rate.${vatRate}`]}
              </p>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2 border-t border-frost/10 pt-6">
              <button
                type="button"
                aria-pressed={!vatIncludes}
                onClick={() => setVatIncludes(false)}
                className="rounded-full border px-4 py-2 text-[13.5px] font-medium text-dim transition-colors hover:text-ink"
                style={tabStyle(!vatIncludes)}
              >
                {t["pc.vat.dir.add"]}
              </button>
              <button
                type="button"
                aria-pressed={vatIncludes}
                onClick={() => setVatIncludes(true)}
                className="rounded-full border px-4 py-2 text-[13.5px] font-medium text-dim transition-colors hover:text-ink"
                style={tabStyle(vatIncludes)}
              >
                {t["pc.vat.dir.remove"]}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
