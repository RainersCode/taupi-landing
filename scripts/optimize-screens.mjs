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
const HERO_SRC = "public/images/screens2/WhatsApp Image 2026-07-23 at 16.07.01.jpeg";
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

// Feature crops (regions in original 1206×2622 coordinates)
const crops = [
  // Financial-health ring card from IMG_0632
  ["IMG_0632.PNG", "crop-veseliba", { left: 60, top: 700, width: 1086, height: 1150 }],
  // Receipt rows (Maxima 21 items…) from IMG_0630
  ["IMG_0630.PNG", "crop-ceks", { left: 0, top: 880, width: 1206, height: 800 }],
  // Category bar + month total from IMG_0630
  ["IMG_0630.PNG", "crop-kategorijas", { left: 0, top: 360, width: 1206, height: 300 }],
];
for (const [file, name, region] of crops) {
  await sharp(`${SRC}/${file}`)
    .extract(region)
    .webp({ quality: 90 })
    .toFile(`${OUT}/${name}.webp`);
}
console.log("done");
