/**
 * Single source of truth for URL paths per locale.
 *
 * Until now EN pages reused the LV slug (`/en/budzeta-kalkulators/`) so that
 * Seo.astro could derive the hreflang pair mechanically as `/en` + path. That
 * shortcut cost us the English keyword in the URL, which is a ranking signal
 * on the very queries the EN pages exist for. Slugs are now real English and
 * the lv↔en pairing is looked up here instead of being derived.
 *
 * `en: null` marks a page that exists in Latvian only (blog, guides) — those
 * pages must NOT emit hreflang, or Google follows a link to a 404.
 *
 * `enNoindex: true` marks an English page that exists and stays reachable,
 * but is deliberately kept out of the index — see the note on `routes` below.
 *
 * Adding a page: add it here first, then reference `routes.<key>` everywhere
 * instead of hard-coding the string. Old paths that were ever public need a
 * 301 in vercel.json.
 */

export type RouteKey =
  | "home"
  | "tools"
  | "budget"
  | "compound"
  | "percent"
  | "emergency"
  | "debt"
  | "about"
  | "privacy"
  | "terms"
  | "blog"
  | "gids"
  | "jaunumi";

export interface RoutePair {
  lv: string;
  /** null = no English counterpart; suppresses hreflang for this page. */
  en: string | null;
  /**
   * Keep the English page out of the index (robots noindex,follow), drop it
   * from the sitemap and suppress the lv↔en hreflang pair on both sides.
   * The page still renders and stays linked, so anyone who lands on it is
   * served — it just stops competing in search.
   */
  enNoindex?: boolean;
}

/**
 * Search Console 23.07.–13.09.2026: the English pages produced 72% of all
 * impressions and 17% of all clicks. They rank in random countries against
 * global incumbents (NerdWallet, Investor.gov, moneychimp) on queries our
 * ~650-word English bodies cannot win, while the Latvian pages — the same
 * tools with ~2 800 words behind them — convert at 18.5% CTR.
 *
 * So the thin English pages are demoted rather than deleted: `enNoindex`
 * stops them diluting the site's aggregate quality signals. `/en/` and the
 * compound-interest page stay indexed — those are the only two earning
 * clicks. Reverse by deleting the flag once a real English body exists in
 * src/content/tools/<tool>-en.md.
 */
export const routes: Record<RouteKey, RoutePair> = {
  home: { lv: "/", en: "/en/" },
  tools: { lv: "/kalkulatori/", en: "/en/calculators/" },
  budget: { lv: "/budzeta-kalkulators/", en: "/en/budget-calculator/", enNoindex: true },
  compound: { lv: "/salikto-procentu-kalkulators/", en: "/en/compound-interest-calculator/" },
  percent: { lv: "/procentu-kalkulators/", en: null },
  emergency: {
    lv: "/drosibas-spilvena-kalkulators/",
    en: "/en/emergency-fund-calculator/",
    enNoindex: true,
  },
  debt: { lv: "/kreditu-atmaksas-kalkulators/", en: "/en/debt-payoff-calculator/", enNoindex: true },
  about: { lv: "/par-taupi/", en: "/en/about/", enNoindex: true },
  privacy: { lv: "/privacy-policy/", en: "/en/privacy-policy/" },
  terms: { lv: "/terms-of-service/", en: "/en/terms-of-service/" },
  blog: { lv: "/padomi/", en: null },
  jaunumi: { lv: "/jaunumi/", en: null },
  gids: { lv: "/gids/", en: null },
};

/** Path for one route in one locale; falls back to LV where EN is absent. */
export function path(key: RouteKey, locale: "lv" | "en"): string {
  const pair = routes[key];
  return (locale === "en" ? pair.en : pair.lv) ?? pair.lv;
}

/** Trailing slash on, query/hash off — the shape every path in `routes` has. */
function normalize(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0];
  return clean.endsWith("/") ? clean : `${clean}/`;
}

/**
 * Reverse lookup: which route pair does this URL belong to?
 * Returns undefined for pages outside the map (individual blog posts and
 * guides) — callers treat that as "single-language, no hreflang".
 */
export function pairForPath(pathname: string): RoutePair | undefined {
  const p = normalize(pathname);
  return Object.values(routes).find((r) => r.lv === p || r.en === p);
}

/**
 * Is this URL one of the deliberately de-indexed English pages? Drives both
 * the robots meta (Seo.astro) and the sitemap filter (astro.config.mjs), so
 * the two can never disagree.
 */
export function isDemotedPath(pathname: string): boolean {
  const p = normalize(pathname);
  return Object.values(routes).some((r) => r.enNoindex && r.en === p);
}
