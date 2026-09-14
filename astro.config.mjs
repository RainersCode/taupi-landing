import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { pairForPath, isDemotedPath } from "./src/i18n/routes.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://taupi.eu",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // `i18n` stays on only to make @astrojs/sitemap declare the xhtml
      // namespace. Its own pairing matches locales by identical path, which
      // no longer holds now that EN has real English slugs — so `serialize`
      // below overrides `links` from the same route map Seo.astro uses.
      i18n: {
        defaultLocale: "lv",
        locales: { lv: "lv", en: "en" },
      },
      // The de-indexed EN pages (routes.<key>.enNoindex) must not appear here
      // at all — a sitemap entry for a noindex URL is a self-contradiction,
      // and it is what keeps Google re-crawling the very pages we demoted.
      filter: (url) => !isDemotedPath(new URL(url).pathname),
      serialize(item) {
        const pair = pairForPath(new URL(item.url).pathname);
        // Only pages with a real, indexable counterpart get alternates.
        // lv-only pages (blog posts) and demoted EN pages must carry none
        // rather than point at a 404 or at a noindexed page.
        item.links =
          pair && pair.en && !pair.enNoindex
            ? [
                { lang: "lv", url: new URL(pair.lv, "https://taupi.eu").href },
                { lang: "en", url: new URL(pair.en, "https://taupi.eu").href },
              ]
            : undefined;
        return item;
      },
    }),
  ],
  i18n: {
    defaultLocale: "lv",
    locales: ["lv", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  prefetch: true,
});
