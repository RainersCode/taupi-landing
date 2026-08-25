import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { pairForPath } from "./src/i18n/routes.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://taupi.eu",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // /gids/ is noindexed until the app launches (see Guide.astro), and a
      // sitemap that submits noindexed URLs is a contradictory signal — it
      // spends crawl budget asking Google to fetch pages we tell it to drop.
      filter: (page) => !new URL(page).pathname.startsWith("/gids"),
      // `i18n` stays on only to make @astrojs/sitemap declare the xhtml
      // namespace. Its own pairing matches locales by identical path, which
      // no longer holds now that EN has real English slugs — so `serialize`
      // below overrides `links` from the same route map Seo.astro uses.
      i18n: {
        defaultLocale: "lv",
        locales: { lv: "lv", en: "en" },
      },
      serialize(item) {
        const pair = pairForPath(new URL(item.url).pathname);
        // Only pages with a real counterpart get alternates. lv-only pages
        // (blog posts) must carry none rather than point at a 404.
        item.links =
          pair && pair.en
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
