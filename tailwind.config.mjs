/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Mirror src/theme.ts from the mobile app
        bg: "#0D1128",
        surface: "#161B36",
        "surface-e": "#1F2445",
        "surface-h": "#2A2F55",
        ink: "#F5F5F7",
        dim: "#A8A8B3",
        muted: "#64646F",
        brand: "#5A6BFF",
        "brand-light": "#8093FF",
        "brand-deep": "#3A4AE0",
        accent: "#38BDF8",
        success: "#2DD4A7",
        danger: "#FF3B87",
        warning: "#FFB547",
        "long-term": "#7580E0",
      },
      fontFamily: {
        // Mirrors src/theme.ts from the RN app
        display: ['"Sora"', "system-ui", "sans-serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.05em",
        "very-tight": "-0.035em",
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};
