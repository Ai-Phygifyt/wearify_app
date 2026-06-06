import { execSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

const SHOTS = "/home/abhigna/Desktop/kiosk-ui/screenshots/admin";
const TMP = "/tmp/admin-titled";
const OUT_PDF = `${SHOTS}/Admin-Screens.pdf`;

// file (without .png) → human-readable title, in capture order
const PAGES = [
  ["00-login", "Login — Mission Control"],
  ["01-dashboard", "Dashboard / Platform Intelligence"],
  ["02-command-center", "Command Center"],
  ["03-stores", "Stores"],
  ["04-store-detail", "Store Detail (ST-001)"],
  ["05-store-onboard", "Store Onboarding"],
  ["06-devices", "Devices / Fleet"],
  ["07-agents", "AI Agents"],
  ["08-models", "AI Models"],
  ["09-revenue", "Revenue"],
  ["10-billing", "Billing & Tax"],
  ["11-network", "Network Intel"],
  ["12-support", "Support"],
  ["13-tailors", "Tailors"],
  ["14-vendors", "Vendors"],
  ["15-releases", "OTA & Releases"],
  ["16-resilience", "DR & Resilience"],
  ["17-security", "Security"],
  ["18-data-governance", "Data Governance"],
  ["19-legal", "Legal"],
  ["20-audit", "Audit Trail"],
  ["21-settings", "Settings"],
];

const W = 2880; // screenshot width (1440 * 2)
const BAND = 150;

async function main() {
  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });

  const titled = [];
  PAGES.forEach(([file, title], i) => {
    const idx = `${String(i + 1).padStart(2, "0")} / ${PAGES.length}`;
    const band = `${TMP}/${file}-band.png`;
    const out = `${TMP}/${file}.png`;
    execSync(
      `magick -size ${W}x${BAND} xc:'#FDF8F2' ` +
        `-fill '#C9941A' -pointsize 34 -gravity NorthWest -annotate +60+34 '${idx}' ` +
        `-fill '#7B1D1D' -pointsize 52 -gravity West -annotate +60+6 ${JSON.stringify(title)} ` +
        `-fill '#9a8678' -pointsize 26 -gravity East -annotate +60+0 'WEARIFY · ADMIN (DESKTOP)' ` +
        `-fill '#E7D8C6' -gravity South -draw 'rectangle 0,${BAND - 3} ${W},${BAND}' ` +
        `${band}`,
    );
    execSync(`magick ${band} ${SHOTS}/${file}.png -append ${out}`);
    titled.push(out);
  });

  execSync(`magick ${titled.join(" ")} -density 150 ${OUT_PDF}`, { stdio: "inherit" });
  console.log(`PDF written → ${OUT_PDF}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
