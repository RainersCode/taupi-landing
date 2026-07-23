import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "C:/Users/raine/OneDrive/Dators/expenses/assets/store/ekranuznemumi";
const OUT = "public/images/screens";
mkdirSync(OUT, { recursive: true });

// Full-screen shots: crop the native status bar (top ~130px of 1206×2622)
// so PhoneFrame's own chrome (9:41 clock + island) is the only status bar.
const screens = [
  ["IMG_0629.PNG", "sakums"],
  ["IMG_0630.PNG", "darijumi"],
  ["IMG_0631.PNG", "budzets"],
  ["IMG_0632.PNG", "ieskati"],
  ["IMG_0633.PNG", "kopskats"],
];
for (const [file, name] of screens) {
  await sharp(`${SRC}/${file}`)
    .extract({ left: 0, top: 130, width: 1206, height: 2622 - 130 })
    .resize({ width: 800 })
    .webp({ quality: 82 })
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
    .resize({ width: 900 })
    .webp({ quality: 82 })
    .toFile(`${OUT}/${name}.webp`);
}
console.log("done");
