import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "C:/Users/raine/OneDrive/Dators/expenses/assets/store/ekranuznemumi";
const OUT = "public/images/screens";
mkdirSync(OUT, { recursive: true });

// Full-screen shots: native status bar + island stay real — PhoneFrame hides
// its fake chrome when a screenshot is supplied.
// CRITICAL: pre-resize close to the rendered size (~283 CSS px wide → 2x
// headroom = 620px) with sharp's Lanczos. Serving the raw 1206px file makes
// Chrome downscale 4× on a composited GPU layer with a cheap filter —
// that's what made the phone look blurry.
const HERO_SRC = "assets-src/sakums-2026-07-23.jpeg";
const screens = [
  [HERO_SRC, "sakums"],
  [`${SRC}/IMG_0630.PNG`, "darijumi"],
  [`${SRC}/IMG_0631.PNG`, "budzets"],
  [`${SRC}/IMG_0632.PNG`, "ieskati"],
  [`${SRC}/IMG_0633.PNG`, "kopskats"],
];
for (const [file, name] of screens) {
  await sharp(file)
    .resize({ width: 620, kernel: "lanczos3" })
    .webp({ quality: 92 })
    .toFile(`${OUT}/${name}.webp`);
}

// Feature-curtain lifestyle photos (nano-banana pro, 1536×2752 PNG → webp).
// Expanded panel shows ~900 CSS px wide — 1200px webp keeps it crisp on 1.5x.
const TILES_SRC = "assets-src/tiles";
const TILES_OUT = "public/images/tiles";
mkdirSync(TILES_OUT, { recursive: true });
const tiles = ["budzets", "skenesana", "ieskati", "merki", "invest", "izaicinajumi"];
for (const name of tiles) {
  await sharp(`${TILES_SRC}/life-${name}.png`)
    .resize({ width: 1200 })
    .webp({ quality: 85 })
    .toFile(`${TILES_OUT}/${name}.webp`);
}
console.log("done");
