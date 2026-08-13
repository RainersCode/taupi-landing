import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/**
 * One budget line: color key, label, editable € amount, status-colored %
 * readout, and a slider whose track fills in the line's color. The web
 * counterpart of the app's gesture-driven AllocationRow — a native range
 * input carries the interaction (keyboard arrows included) and the text
 * input covers precise entry.
 */
export default function AllocationRow({
  label,
  color,
  statusColor,
  amount,
  income,
  pct,
  hint,
  changeNote,
  onChange,
  money,
}: {
  label: string;
  color: string;
  statusColor: string;
  amount: number;
  income: number;
  pct: number;
  hint?: string;
  changeNote?: string;
  onChange: (value: number) => void;
  money: (n: number) => string;
}) {
  const rounded = Math.round(amount);
  const [text, setText] = useState(String(rounded));

  // External changes (slider drag, recommended split, lock redistribution,
  // reset) re-sync the text field; local typing commits on blur/Enter only,
  // so the two never fight mid-edit.
  useEffect(() => {
    setText(String(rounded));
  }, [rounded]);

  const commit = () => {
    const parsed = Number.parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) {
      onChange(Math.min(income, Math.max(0, parsed)));
    } else {
      setText(String(rounded));
    }
  };

  const fillPct = income > 0 ? Math.min(100, (amount / income) * 100) : 0;

  return (
    <div className="py-4 border-b border-white/[0.07] last:border-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="w-2.5 h-2.5 rounded-[4px] shrink-0"
          style={{ background: color }}
        />
        <span className="text-[15px] text-ink font-medium">{label}</span>
        <span className="ml-auto flex items-baseline gap-3">
          <span
            className="font-mono text-[12px] tabular-nums"
            style={{ color: statusColor }}
          >
            {Math.round(pct)}%
          </span>
          <span className="flex items-baseline">
            <span className="text-dim text-[13px] mr-0.5">€</span>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              inputMode="numeric"
              aria-label={`${label} — €`}
              className="w-[58px] bg-transparent text-right font-mono text-[15px] text-ink outline-none border-b border-white/15 focus:border-accent transition-colors tabular-nums"
            />
          </span>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(1, Math.round(income))}
        step={5}
        value={rounded}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuetext={`${money(amount)} · ${Math.round(pct)}%`}
        className="bc-range mt-2"
        style={{ "--bc-fill": color, "--bc-pct": `${fillPct}%` } as CSSProperties}
      />

      {hint && (
        <p className="mt-1 text-[12px] font-mono" style={{ color: statusColor }}>
          {hint}
        </p>
      )}
      {changeNote && (
        <p className="mt-1 text-[12px] font-mono text-muted">{changeNote}</p>
      )}
    </div>
  );
}
