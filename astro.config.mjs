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
    sitemap(),
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
