import type { Locale } from "~/i18n/strings";
import { getDict } from "~/i18n/strings";
import { launch } from "~/config";

/**
 * App Store / Google Play download buttons — rendered only when
 * `launch.live` is true (see src/config.ts). Stateless, so Astro can render
 * it statically inside .astro files; in Hero it ships with the island.
 */
export default function StoreBadges({ locale }: { locale: Locale }) {
  const t = getDict(locale);

  const badge =
    "flex items-center gap-3 rounded-2xl pl-4 pr-5 py-3 transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
  const badgeStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={launch.appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={badge}
        style={badgeStyle}
      >
        {/* Apple mark */}
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true">
          <path
            d="M18.3 13.8c0-3 2.5-4.5 2.6-4.6-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.7 1.1-4.6 1.1-1 0-2.4-1.1-4-1-2 0-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.4 2.2 3.1 3.8 3 1.5-.1 2.1-1 4-1s2.4 1 4 1c1.7 0 2.7-1.5 3.7-2.9 1.2-1.7 1.7-3.3 1.7-3.4-.1 0-3.3-1.3-3.3-4.9zM15.2 4.8c.8-1 1.4-2.4 1.2-3.8-1.2 0-2.7.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.7 1.4.1 2.8-.7 3.6-1.7z"
            fill="#F5F5F7"
          />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10.5px] text-dim">{t["store.on.apple"]}</span>
          <span className="block text-[16px] font-bold text-ink" style={{ letterSpacing: "-0.01em" }}>
            App Store
          </span>
        </span>
      </a>

      <a
        href={launch.playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={badge}
        style={badgeStyle}
      >
        {/* Play mark */}
        <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden="true">
          <path d="M1.5 1.2C1.2 1.5 1 2 1 2.6v18.8c0 .6.2 1.1.5 1.4l.1.1 10.5-10.5v-.2L1.6 1.1l-.1.1z" fill="#38BDF8" />
          <path d="M15.6 15.9l-3.5-3.5v-.2l3.5-3.5.1.1 4.2 2.4c1.2.7 1.2 1.8 0 2.5l-4.2 2.3-.1-.1z" fill="#FFB547" />
          <path d="M15.7 15.8l-3.6-3.6L1.5 22.8c.4.4 1 .4 1.8 0l12.4-7z" fill="#FF3B87" />
          <path d="M15.7 8.6l-12.4-7c-.8-.5-1.4-.4-1.8 0l10.6 10.6 3.6-3.6z" fill="#2DD4A7" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[10.5px] text-dim">{t["store.on.play"]}</span>
          <span className="block text-[16px] font-bold text-ink" style={{ letterSpacing: "-0.01em" }}>
            Google Play
          </span>
        </span>
      </a>
    </div>
  );
}
