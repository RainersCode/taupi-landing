// Captures each calculator's live stage as a card-preview image for the
// /kalkulatori/ hub. Run with the preview server up (npm run preview):
//   node scripts/capture-tool-previews.mjs
// Headless Chrome renders the LV pages with a clean profile (default demo
// values, nobody's real data), sharp crops the tool stage and writes
// public/tools/*.jpg. Re-run whenever a calculator's look changes.
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const CHROME = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:4321";
const OUT_DIR = "public/tools";

// Window is CSS 1440px wide at 1.5 dpr → screenshot pixels = css * 1.5.
const DPR = 1.5;
const WINDOW = "1440,1500";

// Crop rects in CSS px, tuned per page (content column is x 144..1296).
const SHOTS = [
  { slug: "budzeta-kalkulators", out: "budget", crop: { left: 144, top: 450, width: 1152, height: 620 } },
  { slug: "salikto-procentu-kalkulators", out: "compound", crop: { left: 144, top: 535, width: 1152, height: 470 } },
  { slug: "drosibas-spilvena-kalkulators", out: "emergency", crop: { left: 144, top: 505, width: 1152, height: 470 } },
  { slug: "kreditu-atmaksas-kalkulators", out: "debt", crop: { left: 144, top: 535, width: 1152, height: 500 } },
];

mkdirSync(OUT_DIR, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "taupi-shots-"));

for (const shot of SHOTS) {
  const raw = join(work, `${shot.out}.png`);
  const profile = join(work, `profile-${shot.out}`);
  execFileSync(CHROME, [
    "--headless=new",
    `--user-data-dir=${profile}`,
    `--window-size=${WINDOW}`,
    `--force-device-scale-factor=${DPR}`,
    "--hide-scrollbars",
    "--virtual-time-budget=9000",
    `--screenshot=${raw}`,
    `${BASE}/${shot.slug}/`,
  ], { stdio: "ignore" });

  const px = (n) => Math.round(n * DPR);
  await sharp(raw)
    .extract({
      left: px(shot.crop.left),
      top: px(shot.crop.top),
      width: px(shot.crop.width),
      height: px(shot.crop.height),
    })
    .resize(920)
    .jpeg({ quality: 84 })
    .toFile(join(OUT_DIR, `${shot.out}.jpg`));
  console.log(`✓ ${shot.out}.jpg`);
}

rmSync(work, { recursive: true, force: true });
