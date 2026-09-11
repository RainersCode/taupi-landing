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
 * Adding a page: add it here first, then reference `routes.<key>` everywhere
 * instead of hard-coding the string. Old paths that were ever public need a
 * 301 in vercel.json.
 */

export type RouteKey =
  | "home"
  | "tools"
  | "budget"
  | "compound"
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
}

export const routes: Record<RouteKey, RoutePair> = {
  home: { lv: "/", en: "/en/" },
  tools: { lv: "/kalkulatori/", en: "/en/calculators/" },
  budget: { lv: "/budzeta-kalkulators/", en: "/en/budget-calculator/" },
  compound: { lv: "/salikto-procentu-kalkulators/", en: "/en/compound-interest-calculator/" },
  emergency: { lv: "/drosibas-spilvena-kalkulators/", en: "/en/emergency-fund-calculator/" },
  debt: { lv: "/kreditu-atmaksas-kalkulators/", en: "/en/debt-payoff-calculator/" },
  about: { lv: "/par-taupi/", en: "/en/about/" },
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
