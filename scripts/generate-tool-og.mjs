// Generates branded 1200x630 OG images for the calculator pages (lv + en)
// and the /kalkulatori/ hub, embedding each tool's real product screenshot
// (public/tools/*.jpg — regenerate those first with capture-tool-previews).
//   node scripts/generate-tool-og.mjs
// Headless Chrome renders an HTML card at 2x, sharp downscales to 1200x630.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const CHROME = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = "public/og";

const font = (p) => pathToFileURL(resolve("node_modules/@fontsource", p)).href;
const shot = (name) => pathToFileURL(resolve("public/tools", `${name}.jpg`)).href;

const CARDS = [
  {
    out: "budget",
    img: "budget",
    accent: "#7C8CFF",
    lv: { eyebrow: "Bezmaksas rīks", title: "Budžeta kalkulators", desc: "Sadali ienākumus pa kategorijām un redzi, cik paliek pāri." },
    en: { eyebrow: "Free tool", title: "Budget calculator", desc: "Split your income across categories and see what stays free." },
  },
  {
    out: "compound",
    img: "compound",
    accent: "#2DD4A7",
    lv: { eyebrow: "Bezmaksas rīks", title: "Salikto procentu kalkulators", desc: "Cik izaug regulāras iemaksas gadu gaitā." },
    en: { eyebrow: "Free tool", title: "Compound interest calculator", desc: "What regular contributions grow into over the years." },
  },
  {
    out: "emergency",
    img: "emergency",
    accent: "#38BDF8",
    lv: { eyebrow: "Bezmaksas rīks", title: "Drošības spilvena kalkulators", desc: "Cik lielai jābūt tavai rezervei un kad to sasniegsi." },
    en: { eyebrow: "Free tool", title: "Emergency fund calculator", desc: "How big your safety net should be and when you'll reach it." },
  },
  {
    out: "debt",
    img: "debt",
    accent: "#FF8A80",
    lv: { eyebrow: "Bezmaksas rīks", title: "Kredītu atmaksas kalkulators", desc: "Sniega bumba vai lavīna — kura stratēģija ātrāk atbrīvo no parādiem." },
    en: { eyebrow: "Free tool", title: "Debt payoff calculator", desc: "Snowball or avalanche — which strategy frees you from debt sooner." },
  },
  {
    out: "tools",
    img: "compound",
    accent: "#38BDF8",
    lv: { eyebrow: "Bezmaksas rīki", title: "Finanšu kalkulatori", desc: "Budžets, uzkrājumi, drošības spilvens un kredīti — bez reģistrācijas." },
    en: { eyebrow: "Free tools", title: "Financial calculators", desc: "Budgeting, savings, emergency fund and debt — no sign-up." },
  },
];

const html = (c, loc) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="${font("sora/800.css")}">
<link rel="stylesheet" href="${font("dm-sans/400.css")}">
<link rel="stylesheet" href="${font("jetbrains-mono/500.css")}">
<style>
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background:
      radial-gradient(55% 45% at 8% 0%, rgba(128,147,255,0.16), transparent 62%),
      radial-gradient(50% 60% at 96% 90%, ${c.accent}26, transparent 65%),
      #0D1128;
    font-family: "DM Sans", sans-serif; color: #F5F5F7;
  }
  .eyebrow {
    position: absolute; left: 72px; top: 76px;
    font: 500 21px "JetBrains Mono", monospace; letter-spacing: 0.22em;
    text-transform: uppercase; color: ${c.accent};
  }
  .title {
    position: absolute; left: 72px; top: 130px; width: 520px;
    font: 800 62px Sora, sans-serif; letter-spacing: -0.03em; line-height: 1.04;
  }
  .desc {
    position: absolute; left: 72px; top: 356px; width: 470px;
    font-size: 24px; line-height: 1.5; color: #A8A8B3;
  }
  .brand {
    position: absolute; left: 72px; bottom: 64px;
    font: 800 46px Sora, sans-serif; letter-spacing: -0.04em;
  }
  .brand .dot { color: #38BDF8; }
  .url {
    position: absolute; left: 250px; bottom: 78px;
    font: 500 19px "JetBrains Mono", monospace; letter-spacing: 0.08em; color: #64646F;
  }
  .shot {
    position: absolute; right: -70px; top: 96px; width: 660px;
    border-radius: 24px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow: 0 40px 90px rgba(0,0,0,0.55), 0 0 80px ${c.accent}2e;
    background: #0D1128;
  }
  .shot img { display: block; width: 100%; }
</style></head>
<body>
  <div class="eyebrow">${loc.eyebrow}</div>
  <div class="title">${loc.title}</div>
  <div class="desc">${loc.desc}</div>
  <div class="brand">taupi<span class="dot">.</span></div>
  <div class="url">taupi.eu</div>
  <div class="shot"><img src="${shot(c.img)}"></div>
</body></html>`;

mkdirSync(OUT_DIR, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "taupi-og-"));

for (const card of CARDS) {
  for (const locale of ["lv", "en"]) {
    const page = join(work, `${card.out}-${locale}.html`);
    writeFileSync(page, html(card, card[locale]), "utf8");
    const raw = join(work, `${card.out}-${locale}.png`);
    execFileSync(CHROME, [
      "--headless=new",
      `--user-data-dir=${join(work, `profile-${card.out}-${locale}`)}`,
      "--allow-file-access-from-files",
      "--window-size=1200,630",
      "--force-device-scale-factor=2",
      "--hide-scrollbars",
      "--virtual-time-budget=8000",
      `--screenshot=${raw}`,
      pathToFileURL(page).href,
    ], { stdio: "ignore" });

    const suffix = locale === "en" ? "-en" : "";
    await sharp(raw).resize(1200, 630).jpeg({ quality: 86 }).toFile(join(OUT_DIR, `${card.out}${suffix}.jpg`));
    console.log(`✓ ${card.out}${suffix}.jpg`);
  }
}

rmSync(work, { recursive: true, force: true });
