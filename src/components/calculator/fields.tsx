import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { Locale } from "~/i18n/strings";

/**
 * Shared input controls + tiny helpers for the calculator islands.
 * Same visual idiom as the budget calculator: dim labels, underlined
 * inputs, .bc-range sliders with mono value readouts.
 */

export const glass = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

export function useMoney(locale: Locale) {
  const nf = useMemo(
    () => new Intl.NumberFormat(locale === "lv" ? "lv-LV" : "en-GB", { maximumFractionDigits: 0 }),
    [locale],
  );
  return (n: number) => `${n < 0 ? "−" : ""}€${nf.format(Math.abs(Math.round(n)))}`;
}

export const interpolate = (template: string, vars: Record<string, string | number>) =>
  (template ?? "").replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** Latvian counts "1, 21, 31 gada/mēneša" but "2–20, 22–30 gadiem/mēnešiem". */
export const pluralKey = (locale: Locale, n: number, key: string) =>
  (locale === "lv" ? n % 10 === 1 && n % 100 !== 11 : n === 1) ? `${key}.one` : key;

/** A future calendar month, n months from now, e.g. "2027. gada marts". */
export function futureMonth(locale: Locale, monthsAhead: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "lv" ? "lv-LV" : "en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** Money/number text field: dim label, unit prefix, underlined input.
 *  Commits on blur/Enter so typing never fights external updates. */
export function MoneyField({
  label,
  value,
  onChange,
  unit = "€",
  hint,
  max = 10_000_000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  hint?: string;
  max?: number;
}) {
  const rounded = Math.round(value * 100) / 100;
  const [text, setText] = useState(String(rounded));
  useEffect(() => {
    setText(String(rounded));
  }, [rounded]);

  const commit = () => {
    const parsed = Number.parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(0, parsed)));
    else setText(String(rounded));
  };

  return (
    <div className="mb-5">
      <p className="text-[12.5px] text-dim mb-1">{label}</p>
      <div className="flex items-baseline gap-1 border-b border-white/15 focus-within:border-accent transition-colors pb-1">
        <span className="text-dim text-[15px]">{unit}</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          aria-label={label}
          className="flex-1 min-w-0 bg-transparent font-mono text-[17px] text-ink outline-none tabular-nums"
        />
      </div>
      {hint && (
        <p className="mt-1.5 text-[12px] text-muted" style={{ lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** Slider row: label left, mono value right, colored .bc-range below. */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  display,
  fill = "#2DD4A7",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  display: string;
  fill?: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] text-dim">{label}</span>
        <span className="font-mono text-[13px] text-ink tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={display}
        className="bc-range mt-1"
        style={{
          "--bc-fill": fill,
          "--bc-pct": `${((value - min) / (max - min)) * 100}%`,
        } as CSSProperties}
      />
    </div>
  );
}
