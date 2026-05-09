import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, "../public/icons/source.svg");
const outDir = resolve(__dirname, "../public/icons");

const svg = await readFile(srcPath);
await mkdir(outDir, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(resolve(outDir, name));
  console.log(`wrote ${name} (${size}x${size})`);
}

// Maskable icon: render the source onto a larger canvas with padding
// so the safe zone (inner 80%) is fully inside Android's circular mask.
const maskableSize = 512;
const innerSize = Math.round(maskableSize * 0.8); // 80% safe zone
const inner = await sharp(svg).resize(innerSize, innerSize).png().toBuffer();
await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 4,
    background: { r: 123, g: 29, b: 29, alpha: 1 }, // #7B1D1D maroon
  },
})
  .composite([{ input: inner, gravity: "center" }])
  .png()
  .toFile(resolve(outDir, "icon-maskable-512.png"));
console.log("wrote icon-maskable-512.png (512x512, maskable)");

// Apple splash: 2048x2732 (iPad Pro 12.9"), works as a scaled fallback for all iOS sizes.
const splashIconSize = 460;
const splashIcon = await sharp(svg).resize(splashIconSize, splashIconSize).png().toBuffer();
await sharp({
  create: {
    width: 2048,
    height: 2732,
    channels: 4,
    background: { r: 253, g: 248, b: 242, alpha: 1 }, // #FDF8F2 ivory
  },
})
  .composite([{ input: splashIcon, gravity: "center" }])
  .png()
  .toFile(resolve(outDir, "apple-splash-2048x2732.png"));
console.log("wrote apple-splash-2048x2732.png");
