import type { Locale } from "~/i18n/strings";

export default function InsightsMock({ locale = "lv" as Locale }: { locale?: Locale }) {
  const copy =
    locale === "lv"
      ? {
          header: "AI ieskati",
          sub: "TIKKO",
          featured: {
            eyebrow: "✦ NEDĒĻAS IESKATS",
            title: "Kafija — €18 šonedēļ",
            body: "Trešdienās tu tērē 2× vairāk nekā pirmdienās.",
            bars: ["P", "O", "T", "C", "P", "S", "Sv"],
          },
          cards: [
            {
              eyebrow: "TAUPĪJUMS",
              title: "Pārtikā — €42 mazāk nekā vidēji",
              color: "#2DD4A7",
              bg: "rgba(45, 212, 167, 0.12)",
              icon: "↑",
            },
            {
              eyebrow: "BRĪDINĀJUMS",
              title: "Abonementi pieaug: +€18 šomēnes",
              color: "#FFB547",
              bg: "rgba(255, 181, 71, 0.12)",
              icon: "!",
            },
          ],
        }
      : {
          header: "Insights",
          sub: "JUST NOW",
          featured: {
            eyebrow: "✦ INSIGHT OF THE WEEK",
            title: "Coffee — €18 this week",
            body: "On Wednesdays you spend 2× what you do on Mondays.",
            bars: ["M", "T", "W", "T", "F", "S", "S"],
          },
          cards: [
            {
              eyebrow: "SAVING",
              title: "Groceries — €42 below average",
              color: "#2DD4A7",
              bg: "rgba(45, 212, 167, 0.12)",
              icon: "↑",
            },
            {
              eyebrow: "WARNING",
              title: "Subscriptions up: +€18 this month",
              color: "#FFB547",
              bg: "rgba(255, 181, 71, 0.12)",
              icon: "!",
            },
          ],
        };

  // Simulated weekday spending — Wed peak for the "2× Mondays" story
  const bars = [18, 14, 52, 22, 48, 34, 26];
  const maxBar = Math.max(...bars);
  const peakIndex = bars.indexOf(maxBar);

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

      <div className="flex items-baseline justify-between mt-3">
        <p className="text-[22px] font-bold text-white" style={{ letterSpacing: "-0.025em" }}>
          {copy.header}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: "#2DD4A7", boxShadow: "0 0 8px rgba(45,212,167,0.6)" }}
          />
          <p
            className="text-[9px] uppercase"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#2DD4A7" }}
          >
            {copy.sub}
          </p>
        </div>
      </div>

      {/* ── Featured insight — full-bleed card ─────── */}
      <div
        className="relative mt-3 rounded-[22px] p-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(90,107,255,0.22) 0%, rgba(58,74,224,0.14) 60%, rgba(22,27,54,0.85) 100%)",
          border: "1px solid rgba(128,147,255,0.25)",
          boxShadow: "0 18px 40px -18px rgba(58,74,224,0.35)",
        }}
      >
        <p
          className="text-[9px] uppercase"
          style={{
            fontFamily: "JetBrains Mono",
            letterSpacing: "0.22em",
            color: "#8093FF",
          }}
        >
          {copy.featured.eyebrow}
        </p>

        <p
          className="mt-2 text-[15px] font-bold text-white leading-tight"
          style={{ letterSpacing: "-0.015em" }}
        >
          {copy.featured.title}
        </p>

        <p className="mt-1 text-[11px] text-dim leading-snug">
          {copy.featured.body}
        </p>

        {/* Weekday chart — bars and labels kept in separate rows to avoid
            the prior overlap. Bar heights are normalized as percentages of
            the row's fixed height so nothing exceeds the container. */}
        <div className="mt-3">
          <div className="flex items-end gap-[6px]" style={{ height: 40 }}>
            {bars.map((v, i) => {
              const isPeak = i === peakIndex;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${(v / maxBar) * 100}%`,
                    background: isPeak
                      ? "linear-gradient(180deg, #FF3B87, #D12668)"
                      : "rgba(255,255,255,0.22)",
                    boxShadow: isPeak ? "0 0 10px rgba(255,59,135,0.35)" : "none",
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-[6px]">
            {copy.featured.bars.map((label, i) => {
              const isPeak = i === peakIndex;
              return (
                <span
                  key={i}
                  className="flex-1 text-center text-[8px]"
                  style={{
                    fontFamily: "JetBrains Mono",
                    color: isPeak ? "#FF3B87" : "#64646F",
                    letterSpacing: "0.12em",
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Compact insight cards ─────────── */}
      <div className="mt-3 space-y-2">
        {copy.cards.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: "#161B36", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[13px] font-bold shrink-0"
              style={{ background: c.bg, color: c.color }}
            >
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[8.5px] uppercase"
                style={{
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.22em",
                  color: c.color,
                }}
              >
                {c.eyebrow}
              </p>
              <p className="mt-0.5 text-[12px] font-semibold text-white leading-tight">
                {c.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
