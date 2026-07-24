import sharp from "sharp";

// One-off web-perf pass (run: node scripts/optimize-web.mjs)
//
// 1. hero-lifestyle: 2.7MB 2752×1536 PNG was shipped raw to every visitor as
//    a full-screen background. → webp at 1920w (desktop) + 960w (mobile),
//    wired up via srcset in LifestylePanel.
// 2. og.jpg: 1200×630 social/search preview card from the brand backdrop.
//    JPEG — the safest format across link-preview scrapers.
// 3. tiles: 640w variants for the mobile accordion (~400 CSS px slots were
//    pulling the 1200w desktop files).

await sharp("public/images/hero-lifestyle.png")
  .resize({ width: 1920 })
  .webp({ quality: 78 })
  .toFile("public/images/hero-lifestyle-1920.webp");

await sharp("public/images/hero-lifestyle.png")
  .resize({ width: 960 })
  .webp({ quality: 78 })
  .toFile("public/images/hero-lifestyle-960.webp");

await sharp("public/images/hero-backdrop.png")
  .resize({ width: 1200, height: 630, fit: "cover" })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/og.jpg");

const tiles = ["budzets", "skenesana", "ieskati", "merki", "invest", "izaicinajumi"];
for (const name of tiles) {
  await sharp(`public/images/tiles/${name}.webp`)
    .resize({ width: 640 })
    .webp({ quality: 82 })
    .toFile(`public/images/tiles/${name}-640.webp`);
}

console.log("done");
