import { useState } from "react";
import type { FormEvent } from "react";
import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";

/**
 * Shared waitlist capture — lives in the Hero and the #waitlist section.
 * One fused pill (input + button), Stripe/Linear manner. Posts to the
 * Vercel function at /api/waitlist; honeypot field filters naive bots.
 */
export default function WaitlistForm({
  locale,
  size = "md",
}: {
  locale: Locale;
  size?: "lg" | "md";
}) {
  const t = getDict(locale);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [email, setEmail] = useState("");
  const [tester, setTester] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, tester, website: "" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2.5 text-[15px] text-success" role="status">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5.5 9.5l2.3 2.3L12.5 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t["waitlist.done"]}
      </p>
    );
  }

  const tall = size === "lg";
  return (
    <form onSubmit={submit} className="w-full max-w-[440px]" noValidate={false}>
      <div
        className={`flex items-center rounded-full pl-5 pr-1.5 ${tall ? "py-1.5" : "py-1"}`}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t["waitlist.placeholder"]}
          aria-label={t["waitlist.placeholder"]}
          className="flex-1 min-w-0 bg-transparent text-ink placeholder:text-muted text-[15px] outline-none"
        />
        {/* Honeypot — hidden from humans, bots fill it */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className={`shrink-0 rounded-full bg-brand text-white font-medium text-[14px] px-5 ${
            tall ? "py-3" : "py-2.5"
          } hover:bg-brand-light transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
          {state === "busy" ? "…" : t["waitlist.cta"]}
        </button>
      </div>
      {/* Tester opt-in — the pre-launch perk: 6 months free for testers */}
      <label className="mt-3.5 flex items-center gap-2.5 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          checked={tester}
          onChange={(e) => setTester(e.target.checked)}
          className="sr-only"
        />
        <span
          aria-hidden
          className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 transition-colors"
          style={{
            border: `1px solid ${tester ? "#5A6BFF" : "rgba(255,255,255,0.25)"}`,
            background: tester ? "#5A6BFF" : "rgba(255,255,255,0.04)",
          }}
        >
          {tester && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path
                d="M2.2 5.8l2.2 2.2 4.4-4.9"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-[13px] text-dim">
          {t["waitlist.tester"]}
          <span aria-hidden className="mx-1.5" style={{ color: "rgba(255,255,255,0.18)" }}>
            —
          </span>
          <span style={{ color: "#38BDF8" }}>{t["waitlist.tester.perk"]}</span>
        </span>
      </label>

      <p className="mt-3 text-[12.5px]" style={{ color: state === "error" ? "#FF3B87" : "#64646F" }}>
        {state === "error" ? t["waitlist.error"] : t["waitlist.note"]}
      </p>
    </form>
  );
}
