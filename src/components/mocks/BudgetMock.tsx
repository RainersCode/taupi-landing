import type { Locale } from "~/i18n/strings";

/**
 * Budget screen — income and outflow as a clear top-down money flow.
 * Kept in sync with src/theme.ts from the RN app.
 */
export default function BudgetMock({ locale = "lv" as Locale }: { locale?: Locale }) {
  const t =
    locale === "lv"
      ? {
          header: "Budžets",
          available: "Pieejams",
          dailyAllow: "DIENĀ",
          income: "IENĀKUMI",
          expenses: "IZDEVUMI",
          rows: [
            { icon: "💼", label: "Alga", amount: "+1 800", color: "#2DD4A7", type: "in" as const },
            { icon: "🏠", label: "Īre + komunālie", amount: "−280", color: "#FF3B87", type: "out" as const },
            { icon: "📱", label: "Abonementi", amount: "−40", color: "#FF3B87", type: "out" as const },
            { icon: "📅", label: "Plānotie", amount: "−125", color: "#FFB547", type: "out" as const },
            { icon: "📈", label: "Ieguldījumi", amount: "−108", color: "#FFB547", type: "out" as const },
          ],
        }
      : {
          header: "Budget",
          available: "Available",
          dailyAllow: "/ DAY",
          income: "INCOME",
          expenses: "OUTFLOW",
          rows: [
            { icon: "💼", label: "Salary", amount: "+1,800", color: "#2DD4A7", type: "in" as const },
            { icon: "🏠", label: "Rent + utilities", amount: "−280", color: "#FF3B87", type: "out" as const },
            { icon: "📱", label: "Subscriptions", amount: "−40", color: "#FF3B87", type: "out" as const },
            { icon: "📅", label: "Planned", amount: "−125", color: "#FFB547", type: "out" as const },
            { icon: "📈", label: "Investing", amount: "−108", color: "#FFB547", type: "out" as const },
          ],
        };

  return (
    <div className="absolute inset-0 pt-14 px-4 text-ink overflow-hidden">
      <div className="mt-2 flex items-baseline justify-between">
        <p
          className="text-[9px] uppercase"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
        >
          15. FEB — 14. MAR
        </p>
        <p
          className="text-[9px] uppercase"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
        >
          08 / 28
        </p>
      </div>

      <p className="mt-3 text-[22px] font-bold text-white" style={{ letterSpacing: "-0.025em" }}>
        {t.header}
      </p>

      {/* ── Hero "available" card — success gradient (money you keep) ─── */}
      <div
        className="relative mt-3 rounded-[22px] p-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1AA682 0%, #0E7E62 55%, #0A5E49 100%)",
          boxShadow: "0 18px 40px -18px rgba(45,212,167,0.5)",
        }}
      >
        <div
          aria-hidden
          className="absolute -top-12 -right-8 w-36 h-36 rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        />
        <p
          className="text-[9px] uppercase"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "rgba(255,255,255,0.75)" }}
        >
          {t.available}
        </p>

        <div className="mt-1 flex items-baseline gap-1">
          <span
            className="font-extrabold text-white"
            style={{ fontSize: 38, letterSpacing: "-0.035em", lineHeight: 1 }}
          >
            €1 247
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-white/85">
          <span
            className="text-[10px]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            €44.50
          </span>
          <span
            className="text-[9px] uppercase"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "rgba(255,255,255,0.6)" }}
          >
            {t.dailyAllow}
          </span>
        </div>

        {/* Allocation split bar */}
        <div className="mt-3 h-[6px] flex gap-[2px] rounded-full overflow-hidden">
          <div style={{ flex: 1800, background: "rgba(255,255,255,0.85)" }} />
          <div style={{ flex: 320, background: "rgba(255,59,135,0.85)" }} />
          <div style={{ flex: 40, background: "rgba(255,59,135,0.6)" }} />
          <div style={{ flex: 125, background: "rgba(255,181,71,0.8)" }} />
          <div style={{ flex: 108, background: "rgba(255,181,71,0.55)" }} />
        </div>
      </div>

      {/* ── Flow rows ─────────────────────────── */}
      <p
        className="mt-3 text-[9px] uppercase"
        style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
      >
        {t.income}
      </p>

      <div className="mt-1.5 space-y-1.5">
        {t.rows.filter((r) => r.type === "in").map((r, i) => (
          <FlowRow key={i} {...r} />
        ))}
      </div>

      <p
        className="mt-3 text-[9px] uppercase"
        style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
      >
        {t.expenses}
      </p>

      <div className="mt-1.5 space-y-1.5">
        {t.rows.filter((r) => r.type === "out").map((r, i) => (
          <FlowRow key={i} {...r} />
        ))}
      </div>
    </div>
  );
}

function FlowRow({
  icon,
  label,
  amount,
  color,
}: {
  icon: string;
  label: string;
  amount: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5"
      style={{ background: "#161B36" }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0"
        style={{ background: "#1F2445" }}
      >
        {icon}
      </div>
      <span
        className="flex-1 text-[11.5px] font-semibold text-white truncate"
        style={{ letterSpacing: "-0.005em" }}
      >
        {label}
      </span>
      <span
        className="text-[12px] font-bold"
        style={{ color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
      >
        €{amount}
      </span>
    </div>
  );
}
