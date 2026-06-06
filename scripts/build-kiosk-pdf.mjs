import { chromium } from "playwright-core";
import { readFile, mkdir } from "node:fs/promises";

const SHOTS = "/tmp/kiosk-shots";
const OUT_DIR = "/home/abhigna/Desktop/kiosk-ui/screenshots/kiosk";
const OUT_PDF = `${OUT_DIR}/Kiosk-Screens.pdf`;

// file → human-readable title + short note
const PAGES = [
  ["01-setup", "Kiosk Pairing / Setup", "Technician pairs the device with a 6-digit code"],
  ["02-idle", "Idle / Attract Screen", "Default standby — customer taps to start"],
  ["03-lang", "Language Selection", "Choose from 9 Indian languages"],
  ["04-modeSelect", "Mode Select", "Store code entry vs. customer phone login"],
  ["05-codeEntry", "Store Code Entry", "6-digit trial-room code from the sales tablet"],
  ["06-phoneAuth", "Phone Login", "Customer enters phone number"],
  ["07-otp", "OTP Verification", "Enter the one-time passcode"],
  ["08-newCustomer", "New Customer Registration", "Minimal profile capture (name + DOB)"],
  ["09-consent", "Camera Consent", "Privacy consent before the body scan"],
  ["10-scanChoice", "Scan Choice", "Reuse a previous scan or capture a new one"],
  ["11-bodyScan", "Body Scan", "Live camera capture for AI try-on sizing"],
  ["12-aiProcessing", "AI Processing", "Generating the virtual try-on looks"],
  ["13-home", "Home / Browse", "Favourites, Trending, and New Arrivals rails"],
  ["14-productDetail", "Product Detail", "Saree details, colours, similar items"],
  ["15-trialRoom", "Trial Room", "Selected sarees + AI draped preview"],
  ["16-wardrobe", "Wardrobe", "Saved looks for the session"],
  ["17-order", "Cart / Order", "Review items and checkout"],
  ["18-tailors", "Find a Tailor", "Local blouse-stitching partners"],
  ["19-tailorDetail", "Tailor Detail", "Tailor profile, portfolio, and connect"],
  ["20-order-feedback", "Session Feedback", "Rate the try-on experience"],
  ["21-order-dataSave", "Save Data Prompt", "Save or delete session data on logout"],
  ["22-sessionEnd", "Session End", "Thank-you / reset to idle"],
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const items = [];
  for (const [file, title, note] of PAGES) {
    const buf = await readFile(`${SHOTS}/${file}.png`);
    items.push({ title, note, data: buf.toString("base64") });
  }

  const pagesHtml = items
    .map(
      (it, i) => `
    <section class="page">
      <header>
        <div class="idx">${String(i + 1).padStart(2, "0")} / ${items.length}</div>
        <div class="meta">
          <h1>${it.title}</h1>
          <p>${it.note}</p>
        </div>
        <div class="brand">Wearify · Kiosk / Smart Mirror</div>
      </header>
      <div class="shot"><img src="data:image/png;base64,${it.data}" /></div>
    </section>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: 1480px 1180px; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #2a1a14; }
    .page { width: 1480px; height: 1180px; padding: 34px 44px 40px; background: #FDF8F2;
            display: flex; flex-direction: column; page-break-after: always; }
    header { display: flex; align-items: center; gap: 22px; border-bottom: 2px solid #E7D8C6;
             padding-bottom: 16px; margin-bottom: 18px; }
    .idx { font-variant-numeric: tabular-nums; font-weight: 700; font-size: 20px; color: #C9941A;
           background: #fff; border: 1px solid #E7D8C6; border-radius: 10px; padding: 10px 14px; }
    .meta { flex: 1; }
    .meta h1 { margin: 0; font-size: 30px; color: #7B1D1D; letter-spacing: -0.01em; }
    .meta p { margin: 4px 0 0; font-size: 16px; color: #6b574c; }
    .brand { font-size: 13px; color: #9a8678; text-align: right; text-transform: uppercase; letter-spacing: 0.08em; }
    .shot { flex: 1; display: flex; align-items: center; justify-content: center;
            background: #fff; border: 1px solid #E7D8C6; border-radius: 14px; overflow: hidden; }
    .shot img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    .page:last-child { page-break-after: auto; }
  </style></head><body>${pagesHtml}</body></html>`;

  const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({ path: OUT_PDF, width: "1480px", height: "1180px", printBackground: true });
  await browser.close();
  console.log(`PDF written → ${OUT_PDF}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
