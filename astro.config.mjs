import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://taupi.eu",
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // Emit xhtml:link hreflang alternates in the sitemap — mirrors the
      // <link rel="alternate"> pairs in Seo.astro.
      i18n: {
        defaultLocale: "lv",
        locales: { lv: "lv", en: "en" },
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
