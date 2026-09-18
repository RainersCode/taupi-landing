/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // Tokeni dzīvo global.css :root / [data-theme="light"] — šeit tikai
        // kartējums uz mainīgajiem, lai klases (arī /10 alfa modifikatori)
        // seko tēmai. Mirror src/theme.ts from the mobile app.
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-e": "rgb(var(--surface-e-rgb) / <alpha-value>)",
        "surface-h": "#2A2F55",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        dim: "rgb(var(--dim-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        brand: "rgb(var(--brand-rgb) / <alpha-value>)",
        "brand-light": "rgb(var(--brand-light-rgb) / <alpha-value>)",
        "brand-deep": "rgb(var(--brand-deep-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-surface": "rgb(var(--accent-surface-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        warning: "rgb(var(--warning-rgb) / <alpha-value>)",
        "long-term": "#7580E0",
        // Pārklāju bāze: balts sarms tumšajā ↔ tintes skalojums gaišajā.
        frost: "rgb(var(--frost-rgb) / <alpha-value>)",
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
