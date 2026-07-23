import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  /** visual size — height in CSS px, width derived 9:19.5 */
  h?: number;
  className?: string;
  /** battery-indicator accent color at top-right */
  clockTint?: string;
  /** localized clock label (default 9:41 — Apple's keynote time) */
  clock?: string;
  /** real app screenshot (status bar pre-cropped) — replaces children */
  screenshot?: string;
  alt?: string;
}

/**
 * Refined iPhone-style shell. Thin titanium bezel, subtle side buttons,
 * dynamic island, status bar, home indicator at the bottom. Two-layer
 * shadow (tight key + soft ambient) grounds the phone without feeling
 * cartoonish. Keep the chrome premium so the screen content can stay calm.
 */
export default function PhoneFrame({
  children,
  h = 640,
  className = "",
  clockTint = "#F5F5F7",
  clock = "9:41",
  screenshot,
  alt,
}: Props) {
  const w = Math.round((h * 9) / 19.5);

  return (
    <div className={`relative ${className}`} style={{ width: w, height: h }}>
      {/* ── Side buttons — volume up / volume down / power / mute ── */}
      {/* Volume up */}
      <div
        aria-hidden
        className="absolute left-[-3px] rounded-l-sm"
        style={{ top: "19%", width: 3, height: "7.5%", background: "linear-gradient(90deg, #1a1e3a, #0b0f24)" }}
      />
      {/* Volume down */}
      <div
        aria-hidden
        className="absolute left-[-3px] rounded-l-sm"
        style={{ top: "28%", width: 3, height: "7.5%", background: "linear-gradient(90deg, #1a1e3a, #0b0f24)" }}
      />
      {/* Mute switch */}
      <div
        aria-hidden
        className="absolute left-[-3px] rounded-l-sm"
        style={{ top: "13%", width: 3, height: "4%", background: "linear-gradient(90deg, #1a1e3a, #0b0f24)" }}
      />
      {/* Power button (right) */}
      <div
        aria-hidden
        className="absolute right-[-3px] rounded-r-sm"
        style={{ top: "22%", width: 3, height: "11%", background: "linear-gradient(270deg, #1a1e3a, #0b0f24)" }}
      />

      {/* ── Bezel frame with layered shadow ── */}
      <div
        className="absolute inset-0 rounded-[52px]"
        style={{
          background:
            // Titanium-like specular gradient — brightest at top-left bevel
            "linear-gradient(135deg, #3a3f60 0%, #1a1e3a 25%, #0b0f24 55%, #1a1e3a 85%, #2a2f55 100%)",
          padding: 5,
          boxShadow: [
            // Tight contact shadow
            "0 2px 6px rgba(0,0,0,0.5)",
            // Ambient drop shadow
            "0 60px 120px -30px rgba(0,0,0,0.85)",
            // Inner top highlight (simulating bezel bevel light)
            "inset 0 1px 0 rgba(255,255,255,0.12)",
            // Inner bottom shadow (simulating bezel underside)
            "inset 0 -1px 0 rgba(0,0,0,0.5)",
            // Thin outer rim
            "0 0 0 1px rgba(255,255,255,0.04)",
          ].join(", "),
        }}
      >
        {/* Inner screen — 2px black gap between bezel and screen (matches real iPhone) */}
        <div
          className="relative w-full h-full rounded-[48px] overflow-hidden"
          style={{ background: "#000", padding: 1 }}
        >
          <div className="relative w-full h-full rounded-[47px] overflow-hidden" style={{ background: "#0D1128" }}>
            {/* ── Fake chrome (island + status bar) — only for coded content.
                 Real screenshots bring their own status bar and island. ── */}
            {!screenshot && (
            <>
            {/* ── Dynamic Island ── */}
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full z-20 flex items-center justify-center"
              style={{
                background: "#000",
                width: "32%",
                height: 26,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            >
              {/* Camera / sensor dots inside the island */}
              <div className="flex items-center gap-1.5">
                <div
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: "#1a1e28", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
                />
                <div
                  className="rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    background: "radial-gradient(circle at 30% 30%, #2a2f55, #050711 70%)",
                    boxShadow: "inset 0 0 0 1px rgba(56,189,248,0.05)",
                  }}
                />
              </div>
            </div>

            {/* ── Status bar (clock + signal + battery) ── */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-[14px] pointer-events-none">
              <span
                className="text-[13px] font-semibold"
                style={{ color: clockTint, letterSpacing: "-0.01em" }}
              >
                {clock}
              </span>
              <div className="flex items-center gap-1.5">
                {/* Signal bars */}
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <rect x="0" y="7" width="2.5" height="3" rx="0.5" fill={clockTint} />
                  <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" fill={clockTint} />
                  <rect x="7" y="3" width="2.5" height="7" rx="0.5" fill={clockTint} />
                  <rect x="10.5" y="0" width="2.5" height="10" rx="0.5" fill={clockTint} />
                </svg>
                {/* Wi-Fi */}
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 3.2a10 10 0 0 1 12 0" stroke={clockTint} strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M3 5.4a7 7 0 0 1 8 0" stroke={clockTint} strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <path d="M5 7.6a4 4 0 0 1 4 0" stroke={clockTint} strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  <circle cx="7" cy="9" r="0.8" fill={clockTint} />
                </svg>
                {/* Battery */}
                <div className="flex items-center gap-[1px]">
                  <div
                    className="relative rounded-[3px]"
                    style={{ width: 22, height: 11, border: `1px solid ${clockTint}`, opacity: 0.9 }}
                  >
                    <div
                      className="absolute inset-[1.5px] rounded-[2px]"
                      style={{ background: clockTint, width: "calc(100% - 3px)" }}
                    />
                  </div>
                  <div
                    className="rounded-r-sm"
                    style={{ width: 1.5, height: 4, background: clockTint, opacity: 0.9 }}
                  />
                </div>
              </div>
            </div>
            </>
            )}

            {/* ── Screen content ── */}
            {screenshot ? (
              <img
                src={screenshot}
                alt={alt ?? ""}
                className="absolute inset-0 w-full h-full object-cover object-top"
                draggable={false}
                loading="lazy"
              />
            ) : (
              children
            )}

            {/* ── Home indicator at the bottom ── */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full z-20"
              style={{
                width: "34%",
                height: 4,
                background: "rgba(245,245,247,0.4)",
              }}
            />

            {/* ── Subtle screen-top specular reflection ── */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 pointer-events-none"
              style={{
                height: "14%",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
