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

/** Instrument-panel cell: mono uppercase label, a BIG editable value and a
 *  slider beneath — the tool pages' primary control. Typing past the slider
 *  range is allowed (the slider just pegs); commit on blur/Enter. */
export function ControlCell({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "€",
  suffix,
  hint,
  fill = "#5A6BFF",
  editable = true,
  hardClamp = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Rendered after the value (e.g. "%", "mēn.") instead of a prefix unit. */
  suffix?: string;
  hint?: string;
  fill?: string;
  editable?: boolean;
  /** Clamp typed values to [min,max] too (sliders always clamp). */
  hardClamp?: boolean;
}) {
  const rounded = Math.round(value * 100) / 100;
  const [text, setText] = useState(String(rounded));
  useEffect(() => {
    setText(String(rounded));
  }, [rounded]);

  const commit = () => {
    const parsed = Number.parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) {
      const v = Math.max(hardClamp ? min : 0, parsed);
      onChange(hardClamp ? Math.min(max, v) : v);
    } else {
      setText(String(rounded));
    }
  };

  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div>
      <p className="font-mono text-[10.5px] font-medium tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        {!suffix && <span className="text-dim text-[17px]">{unit}</span>}
        {editable ? (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            inputMode="decimal"
            aria-label={label}
            className="w-full min-w-0 bg-transparent font-display font-bold text-[26px] text-ink tracking-tight outline-none tabular-nums border-b border-transparent focus:border-accent transition-colors"
          />
        ) : (
          <span className="font-display font-bold text-[26px] text-ink tracking-tight tabular-nums">
            {text}
          </span>
        )}
        {suffix && <span className="text-dim text-[15px] shrink-0">{suffix}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${value}${suffix ?? ""}`}
        className="bc-range mt-1.5"
        style={{ "--bc-fill": fill, "--bc-pct": `${pct}%` } as CSSProperties}
      />
      {hint && (
        <p className="mt-1.5 text-[11.5px] text-muted" style={{ lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** Soft radial glow behind a result stage — the landing hero's atmosphere. */
export function StageGlow({ color = "rgba(90,107,255,0.13)" }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ background: `radial-gradient(55% 65% at 70% 35%, ${color}, transparent 70%)` }}
    />
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
