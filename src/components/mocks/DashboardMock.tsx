import type { Locale } from "~/i18n/strings";

/**
 * Faithful recreation of Taupi's Dashboard — kept in sync with the app's
 * theme tokens (src/theme.ts in the RN project). Every color / radius /
 * letter-spacing matches so the site and product read as one brand.
 */
export default function DashboardMock({ locale = "lv" as Locale }: { locale?: Locale }) {
  const t =
    locale === "lv"
      ? {
          period: "15. FEB — 14. MAR",
          day: "DIENA",
          safe: "Droši tērēt šodien",
          left: "atlicis",
          today: "Šodien",
          saved: "IETAUPĪTS",
          streak: "SĒRIJA",
          seeAll: "Visi",
          days: "dienas",
          tx: [
            { icon: "🛒", label: "Rimi", cat: "Pārtika", time: "14:32", amount: "24.18" },
            { icon: "☕", label: "Kafijas Draugs", cat: "Kafija", time: "09:12", amount: "4.50" },
            { icon: "🚇", label: "Rīgas satiksme", cat: "Transports", time: "08:04", amount: "1.15" },
          ],
        }
      : {
          period: "FEB 15 — MAR 14",
          day: "DAY",
          safe: "Safe to spend today",
          left: "left",
          today: "Today",
          saved: "SAVED",
          streak: "STREAK",
          seeAll: "See all",
          days: "days",
          tx: [
            { icon: "🛒", label: "Rimi", cat: "Groceries", time: "2:32 pm", amount: "24.18" },
            { icon: "☕", label: "Kafijas Draugs", cat: "Coffee", time: "9:12 am", amount: "4.50" },
            { icon: "🚇", label: "Rīgas satiksme", cat: "Transport", time: "8:04 am", amount: "1.15" },
          ],
        };

  return (
    <div className="absolute inset-0 pt-14 px-4 text-ink overflow-hidden">
      {/* ── Period strip at top ─────────────────────── */}
      <div className="mt-2 flex items-baseline justify-between">
        <p
          className="text-[9px] uppercase"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
        >
          {t.period}
        </p>
        <p
          className="text-[9px] uppercase"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
        >
          {t.day} 08 / 28
        </p>
      </div>

      {/* Thin period progress bar */}
      <div className="mt-2 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: "28%", background: "linear-gradient(90deg, #5A6BFF, #8093FF)" }}
        />
      </div>

      {/* ── Hero card — safe to spend ─────────────── */}
      <div
        className="relative mt-3 rounded-[22px] p-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #5A6BFF 0%, #3A4AE0 55%, #2635B8 100%)",
          boxShadow: "0 18px 40px -18px rgba(58,74,224,0.65)",
        }}
      >
        {/* Decorative rings */}
        <div
          aria-hidden
          className="absolute -top-16 -right-10 w-44 h-44 rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-16 w-56 h-56 rounded-full"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        />

        <p
          className="text-[9px] uppercase"
          style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "rgba(255,255,255,0.75)" }}
        >
          {t.safe}
        </p>

        <div className="mt-1 flex items-baseline gap-1">
          <span
            className="font-extrabold text-white"
            style={{ fontSize: 38, letterSpacing: "-0.035em", lineHeight: 1 }}
          >
            €41
          </span>
          <span
            className="text-white/90"
            style={{ fontSize: 22, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}
          >
            .23
          </span>
        </div>

        <p className="mt-0.5 text-[10px] text-white/65">
          €389.45 {t.left} · €1 247
        </p>

        {/* 21-day spark — today's bar glows */}
        <div className="mt-3 flex items-end gap-[2px]" style={{ height: 28 }}>
          {[32, 18, 52, 22, 68, 40, 12, 55, 28, 44, 16, 58, 25, 38, 46, 30, 50, 20, 34, 60, 42].map((v, i) => {
            const isToday = i === 20;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${v}%`,
                  background: "rgba(255,255,255,0.82)",
                  opacity: isToday ? 1 : 0.4,
                  boxShadow: isToday ? "0 0 8px rgba(255,255,255,0.4)" : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Stats row — saved + streak ───────────── */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div
          className="rounded-2xl p-2.5 relative overflow-hidden"
          style={{ background: "#161B36", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-[8px] uppercase"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
          >
            {t.saved}
          </p>
          <p
            className="mt-1 text-[15px] font-bold"
            style={{ color: "#2DD4A7", letterSpacing: "-0.02em" }}
          >
            €214
          </p>
        </div>
        <div
          className="rounded-2xl p-2.5 relative overflow-hidden"
          style={{ background: "#161B36", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-[8px] uppercase"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
          >
            {t.streak}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[15px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>7</span>
            <span className="text-[10px] text-dim">{t.days}</span>
            <span className="ml-auto text-[12px]">🔥</span>
          </div>
        </div>
      </div>

      {/* ── Today heading + see all ────────────── */}
      <div className="mt-3 flex items-baseline justify-between px-0.5">
        <p className="text-[14px] font-bold text-white" style={{ letterSpacing: "-0.01em" }}>
          {t.today}
        </p>
        <p className="text-[10px]" style={{ color: "#8093FF" }}>
          {t.seeAll} →
        </p>
      </div>

      {/* ── Transaction rows ─────────────────── */}
      <div className="mt-2 space-y-1.5">
        {t.tx.map((tx, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5"
            style={{ background: "#161B36" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ background: "#1F2445" }}
            >
              {tx.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[11.5px] font-semibold text-white truncate"
                style={{ letterSpacing: "-0.005em" }}
              >
                {tx.label}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-[9px]" style={{ color: "#64646F" }}>{tx.cat}</p>
                <span
                  className="inline-block w-[2px] h-[2px] rounded-full"
                  style={{ background: "#64646F" }}
                />
                <p className="text-[9px]" style={{ color: "#64646F" }}>{tx.time}</p>
              </div>
            </div>
            <span
              className="text-[12px] font-bold text-white"
              style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}
            >
              €{tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
