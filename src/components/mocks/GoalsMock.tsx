import type { Locale } from "~/i18n/strings";

export default function GoalsMock({ locale = "lv" as Locale }: { locale?: Locale }) {
  const copy =
    locale === "lv"
      ? {
          header: "Mērķi",
          ongoing: "AKTĪVI",
          featured: {
            eyebrow: "ILGTERMIŅA",
            title: "Pirmā iemaksa",
            saved: "€3 240",
            of: "no €10 000",
            pct: 32.4,
            paceLabel: "+€120 priekšā",
            paceDays: "189 dienas",
          },
          goals: [
            { title: "Zem €200 kafijā", sub: "€87 / €200", pct: 43.5, color: "#2DD4A7", icon: "☕" },
            { title: "Dienas bez tēriņiem", sub: "9 / 15", pct: 60, color: "#4FD1FF", icon: "🌙" },
          ],
          add: "Jauns mērķis",
        }
      : {
          header: "Goals",
          ongoing: "ACTIVE",
          featured: {
            eyebrow: "LONG-TERM",
            title: "House deposit",
            saved: "€3,240",
            of: "of €10,000",
            pct: 32.4,
            paceLabel: "+€120 ahead",
            paceDays: "189 days",
          },
          goals: [
            { title: "Under €200 on coffee", sub: "€87 / €200", pct: 43.5, color: "#2DD4A7", icon: "☕" },
            { title: "No-spend days", sub: "9 / 15", pct: 60, color: "#4FD1FF", icon: "🌙" },
          ],
          add: "New goal",
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
        {copy.header}
      </p>

      {/* ── Featured long-term goal ─────────────── */}
      <div
        className="relative mt-3 rounded-[22px] p-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(117,128,224,0.28) 0%, rgba(117,128,224,0.12) 60%, rgba(22,27,54,0.85) 100%)",
          border: "1px solid rgba(117,128,224,0.3)",
          boxShadow: "0 18px 40px -18px rgba(117,128,224,0.4)",
        }}
      >
        <div className="flex items-baseline justify-between">
          <p
            className="text-[9px] uppercase"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#7580E0" }}
          >
            {copy.featured.eyebrow}
          </p>
          <span className="text-[10px]" style={{ fontFamily: "JetBrains Mono", color: "#2DD4A7" }}>
            ↑ {copy.featured.pct}%
          </span>
        </div>

        <p className="mt-2 text-[15px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>
          {copy.featured.title}
        </p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className="text-[26px] font-extrabold text-white"
            style={{ letterSpacing: "-0.035em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
          >
            {copy.featured.saved}
          </span>
          <span className="text-[11px] text-dim">{copy.featured.of}</span>
        </div>

        {/* Featured progress bar */}
        <div className="mt-3 h-[10px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${copy.featured.pct}%`,
              background: "linear-gradient(90deg, #7580E0 0%, #8093FF 100%)",
              boxShadow: "0 0 12px rgba(128,147,255,0.5)",
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p
            className="text-[9px]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.15em", color: "#2DD4A7" }}
          >
            {copy.featured.paceLabel}
          </p>
          <p
            className="text-[9px]"
            style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.15em", color: "#64646F" }}
          >
            {copy.featured.paceDays}
          </p>
        </div>
      </div>

      {/* ── Compact goals ─────────────── */}
      <p
        className="mt-4 text-[9px] uppercase"
        style={{ fontFamily: "JetBrains Mono", letterSpacing: "0.22em", color: "#64646F" }}
      >
        / {copy.ongoing}
      </p>

      <div className="mt-2 space-y-2">
        {copy.goals.map((g, i) => (
          <div
            key={i}
            className="rounded-2xl p-3"
            style={{ background: "#161B36", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0"
                style={{ background: "#1F2445" }}
              >
                {g.icon}
              </div>
              <p className="flex-1 text-[12px] font-semibold text-white">{g.title}</p>
              <p
                className="text-[10px] text-dim"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {g.sub}
              </p>
            </div>
            <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${g.pct}%`,
                  background: `linear-gradient(90deg, ${g.color}cc, ${g.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div
        className="mt-3 rounded-xl py-2.5 flex items-center justify-center gap-2 text-[12px] font-medium"
        style={{
          background: "rgba(90,107,255,0.08)",
          border: "1px dashed rgba(90,107,255,0.35)",
          color: "#8093FF",
        }}
      >
        + {copy.add}
      </div>
    </div>
  );
}
