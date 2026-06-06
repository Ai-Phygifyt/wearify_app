import { execSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

const SHOTS = "/tmp/store-shots";
const TMP = "/tmp/store-titled";
const OUT_DIR = "/home/abhigna/Desktop/kiosk-ui/screenshots/store";
const OUT_PDF = `${OUT_DIR}/Store-Screens.pdf`;

const PAGES = [
  ["01-login", "Login — Retailer Portal"],
  ["02-dashboard", "Dashboard / Home"],
  ["03-analytics", "Analytics"],
  ["04-inventory", "Inventory / Catalogue"],
  ["05-inventory-add", "Add Saree"],
  ["06-inventory-detail", "Saree Detail / Edit"],
  ["07-orders", "Orders"],
  ["08-customers", "Customers"],
  ["09-customer-detail", "Customer Detail"],
  ["10-campaigns", "Campaigns"],
  ["11-staff", "Staff"],
  ["12-settings", "Settings"],
  ["13-settings-profile", "Settings · Store Profile"],
  ["14-settings-kiosks", "Settings · Kiosks / Devices"],
  ["15-settings-billing", "Settings · Billing"],
  ["16-settings-notifications", "Settings · Notifications"],
];

const W = 1170; // screenshot width (390 * 3)
const BAND = 150;

async function main() {
  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  const titled = [];
  PAGES.forEach(([file, title], i) => {
    const idx = `${String(i + 1).padStart(2, "0")} / ${PAGES.length}`;
    const band = `${TMP}/${file}-band.png`;
    const out = `${TMP}/${file}.png`;
    // Title band: ivory background, maroon title, gold index, brand tag.
    execSync(
      `magick -size ${W}x${BAND} xc:'#FDF8F2' ` +
        `-fill '#C9941A' -pointsize 30 -gravity NorthWest -annotate +44+34 '${idx}' ` +
        `-fill '#7B1D1D' -pointsize 46 -gravity West -annotate +44+6 ${JSON.stringify(title)} ` +
        `-fill '#9a8678' -pointsize 24 -gravity East -annotate +44+0 'WEARIFY · STORE (MOBILE)' ` +
        `-fill '#E7D8C6' -gravity South -draw 'rectangle 0,${BAND - 3} ${W},${BAND}' ` +
        `${band}`,
    );
    execSync(`magick ${band} ${SHOTS}/${file}.png -append ${out}`);
    titled.push(out);
  });

  // One image per page, each page sized to its image → full fidelity.
  execSync(`magick ${titled.join(" ")} -density 150 ${OUT_PDF}`, { stdio: "inherit" });
  console.log(`PDF written → ${OUT_PDF}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
