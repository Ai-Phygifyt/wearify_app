import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const T = {
  bg: "#FBF8F3", pn: "#FFFFFF", cd: "#F5F0E8", bd: "#E8E0D4",
  tx: "#1A1A1A", sb: "#6B5B4F", mt: "#9A8D82",
  cy: "#2D8544", cyB: "#2D854410",
  am: "#D4A843", amB: "#D4A84310",
  rd: "#C0392B", rdB: "#C0392B10",
  bl: "#2C5F7C", blB: "#2C5F7C10",
  pr: "#71221D", prB: "#71221D10",
};

const STORES = [
  { id: "ST-001", n: "MAUVE Sarees", ci: "Mumbai", st: "active", pl: "Smart", mr: 15000, hp: 94, cv: 42, ss: 23, cr: 12, fs: 78, cu: 92, ag: "signed", dc: "Early Adopter 40%", ob: 5 },
  { id: "ST-002", n: "Silk Heritage", ci: "Delhi", st: "active", pl: "Smart", mr: 15000, hp: 88, cv: 38, ss: 18, cr: 22, fs: 65, cu: 85, ag: "signed", dc: "Annual 25%", ob: 5 },
  { id: "ST-003", n: "Kanchi Collections", ci: "Chennai", st: "active", pl: "Digital", mr: 10000, hp: 96, cv: 45, ss: 31, cr: 5, fs: 88, cu: 95, ag: "signed", dc: null, ob: 5 },
  { id: "ST-004", n: "Banarasi House", ci: "Varanasi", st: "trial", pl: "Trial", mr: 0, hp: 72, cv: 22, ss: 8, cr: 45, fs: 42, cu: 60, ag: "pending", dc: "Trial", ob: 3 },
  { id: "ST-005", n: "Patola Palace", ci: "Surat", st: "active", pl: "Smart", mr: 15000, hp: 91, cv: 40, ss: 26, cr: 15, fs: 72, cu: 88, ag: "signed", dc: null, ob: 5 },
  { id: "ST-006", n: "Tant Bangla", ci: "Kolkata", st: "active", pl: "Digital", mr: 10000, hp: 85, cv: 35, ss: 14, cr: 18, fs: 58, cu: 78, ag: "signed", dc: "Association 30%", ob: 4 },
  { id: "ST-007", n: "Mysore Silks", ci: "Bangalore", st: "churned", pl: "---", mr: 0, hp: 0, cv: 0, ss: 0, cr: 100, fs: 0, cu: 0, ag: "terminated", dc: null, ob: 0 },
  { id: "ST-008", n: "Royal Weaves", ci: "Jaipur", st: "trial", pl: "Trial", mr: 0, hp: 68, cv: 18, ss: 5, cr: 55, fs: 35, cu: 45, ag: "pending", dc: "Trial", ob: 2 },
];
const DEVS = [
  { id: "MR-001", tp: "Mirror", sr: "MAUVE Sarees", si: "ST-001", st: "online", lc: "ACTIVE", up: 99.8, gp: 45, cp: 42, gt: 58, mm: 4.2, fp: 28, ls: "2m", ce: "Dec 2026", qq: 0, note: "Top performer" },
  { id: "MR-002", tp: "Mirror", sr: "Silk Heritage", si: "ST-002", st: "online", lc: "ACTIVE", up: 99.2, gp: 52, cp: 38, gt: 55, mm: 3.8, fp: 30, ls: "5m", ce: "Dec 2026", qq: 0, note: "Healthy" },
  { id: "MR-003", tp: "Mirror", sr: "Kanchi Collections", si: "ST-003", st: "online", lc: "ACTIVE", up: 99.9, gp: 41, cp: 35, gt: 52, mm: 3.5, fp: 30, ls: "1m", ce: "Nov 2026", qq: 0, note: "Lowest latency" },
  { id: "TB-001", tp: "Tablet", sr: "MAUVE Sarees", si: "ST-001", st: "online", lc: "ACTIVE", up: 98.5, gp: 0, cp: 22, gt: 0, mm: 1.8, fp: 0, ls: "8m", ce: "Dec 2026", qq: 0, note: "Android tablet" },
  { id: "MR-004", tp: "Mirror", sr: "Banarasi House", si: "ST-004", st: "offline", lc: "OFFLINE", up: 87.3, gp: 0, cp: 0, gt: 82, mm: 0, fp: 0, ls: "3h", ce: "Dec 2026", qq: 1842, note: "GPU thermal 82C" },
  { id: "TB-002", tp: "Tablet", sr: "Patola Palace", si: "ST-005", st: "online", lc: "ACTIVE", up: 99.1, gp: 0, cp: 18, gt: 0, mm: 1.5, fp: 0, ls: "12m", ce: "Jan 2027", qq: 0, note: "Healthy" },
];
const AGTS = [
  { id: "AGT-01", nm: "Inventory Optimiser", ph: 1, md: "supervised", st: "running", ac: 12, ax: 94.2, cs: 85, sr: 6, cy: "14m", rs: "Detected 12 slow-moving silks at Silk Heritage. Generated 3 discount bundles + 1 reorder draft (12 items, Rs 45,200). Confidence: 0.91.", hu: "Agent recommended liquidation discount on 5 items. Owner chose to bundle 3 instead. Agent accuracy: 78% match with owner decisions." },
  { id: "AGT-02", nm: "Campaign Orchestrator", ph: 1, md: "supervised", st: "running", ac: 4, ax: 91.5, cs: 120, sr: 6, cy: "2h", rs: "Scheduled Diwali early-bird for 3 stores. Audience: 842 opted-in. Predicted open rate: 62%.", hu: "Agent suggested re-engagement for 15 dormant customers. Owner approved 12, rejected 3 (known personal circumstances). 80% alignment." },
  { id: "AGT-03", nm: "Store Health Monitor", ph: 1, md: "autonomous", st: "running", ac: 8, ax: 97.1, cs: 45, sr: 8, cy: "58m", rs: "Revenue down 18% at Silk Heritage. Root cause: conversion dropped 25%, 12 top silks out of stock. Forwarded reorder to AGT-01.", hu: "Agent flagged 3 stores as concerning. Human verified 3/3 correct. 100% detection accuracy." },
  { id: "AGT-04", nm: "Customer Intelligence", ph: 2, md: "shadow", st: "running", ac: 0, ax: 88.4, cs: 95, sr: 3, cy: "6h", rs: "Shadow mode. 15 VIP churn risk flagged. Recommended personalised re-engagement. Confidence: 0.84.", hu: "Shadow: logging only. Will compare against actual churn in 30 days." },
  { id: "AGT-05", nm: "Pricing Strategist", ph: 2, md: "shadow", st: "paused", ac: 0, ax: 85.2, cs: 0, sr: 0, cy: "1d", rs: "Paused. Last: 15% discount on Chanderi would yield Rs 12K incremental. Margin floor: cost+10%.", hu: "Paused - no comparison data yet." },
  { id: "AGT-06", nm: "Staff Coach", ph: 2, md: "shadow", st: "running", ac: 0, ax: 82.6, cs: 60, sr: 3, cy: "12h", rs: "Coaching tip for Ravi (MAUVE): upsell rate 12% below avg.", hu: "Shadow: tips generated but not yet delivered to staff." },
  { id: "AGT-07", nm: "Network Intelligence", ph: 3, md: "off", st: "planned", ac: 0, ax: 0, cs: 0, sr: 0, cy: "---", rs: "Phase 3. Requires 50+ stores.", hu: "Not deployed." },
  { id: "AGT-08", nm: "Manufacturer Insights", ph: 3, md: "off", st: "planned", ac: 0, ax: 0, cs: 0, sr: 0, cy: "---", rs: "Phase 3. Revenue Stream 3.", hu: "Not deployed." },
];
const TOOLS = [
  { id: "T-01", nm: "InventoryUpdate", desc: "Update saree status/tags", agents: "AGT-01", approval: "Auto", used: 8, limit: "unlimited" },
  { id: "T-02", nm: "DiscountRecommend", desc: "Create discount recommendation", agents: "AGT-01, AGT-05", approval: "Owner", used: 2, limit: "10/day" },
  { id: "T-03", nm: "BundleCreate", desc: "Create product bundle", agents: "AGT-01, AGT-05", approval: "Owner", used: 1, limit: "5/day" },
  { id: "T-04", nm: "ReorderGenerate", desc: "Generate purchase order draft", agents: "AGT-01", approval: "Owner", used: 1, limit: "3/day" },
  { id: "T-05", nm: "CatalogPromote", desc: "Feature items in catalog", agents: "AGT-01, AGT-03", approval: "Auto", used: 4, limit: "10/day" },
  { id: "T-06", nm: "CampaignDraft", desc: "Draft WhatsApp campaign", agents: "AGT-02", approval: "Owner", used: 3, limit: "4/week" },
  { id: "T-07", nm: "MessageSend", desc: "Send approved campaign", agents: "AGT-02", approval: "System", used: 1, limit: "1/week/store" },
  { id: "T-08", nm: "InsightPush", desc: "Push insight to dashboard", agents: "ALL", approval: "Auto", used: 6, limit: "unlimited" },
  { id: "T-09", nm: "AlertSend", desc: "Send alert to owner", agents: "AGT-03", approval: "Auto", used: 2, limit: "5/day" },
  { id: "T-10", nm: "HealthScoreUpdate", desc: "Update store health score", agents: "AGT-03", approval: "Auto", used: 5, limit: "hourly" },
  { id: "T-11", nm: "CoachingTipGen", desc: "Generate micro-coaching tip", agents: "AGT-06", approval: "Manager", used: 3, limit: "1/staff/day" },
  { id: "T-12", nm: "ForecastQuery", desc: "Query demand forecast model", agents: "AGT-01, AGT-05", approval: "Auto", used: 4, limit: "unlimited" },
  { id: "T-13", nm: "CustomerScore", desc: "Compute customer health score", agents: "AGT-04", approval: "Auto", used: 15, limit: "unlimited" },
  { id: "T-14", nm: "SegmentUpdate", desc: "Update customer micro-segments", agents: "AGT-04", approval: "Auto", used: 1, limit: "weekly" },
  { id: "T-15", nm: "NetworkAggregate", desc: "Compute anonymised trends", agents: "AGT-07", approval: "Auto", used: 0, limit: "weekly" },
];
const CONFLICTS = [
  { a: "AGT-01", b: "AGT-02", res: "Saree S-442 (Chanderi)", issue: "AGT-01 marked for liquidation; AGT-02 included in new arrival campaign", fix: "Inventory status is source of truth. Campaign adjusted to exclude liquidation items.", st: "resolved", time: "2h ago" },
  { a: "AGT-05", b: "AGT-01", res: "Silk category (Kanchi)", issue: "Pricing agent recommends 20% discount; Inventory agent recommends bundle", fix: "First-approved action wins. Pricing locked item. Bundle adjusted to exclude.", st: "resolved", time: "1d ago" },
];
const TAILORS = [
  { id: "TL-001", nm: "Stitchwell Tailors", ci: "Mumbai", st: "verified", referrals: 42, rev: 4200, rating: 4.6, spec: "Blouse + Petticoat" },
  { id: "TL-002", nm: "Rupa Designers", ci: "Delhi", st: "verified", referrals: 28, rev: 2800, rating: 4.3, spec: "Blouse specialist" },
  { id: "TL-003", nm: "Kamala Tailoring", ci: "Chennai", st: "pending", referrals: 0, rev: 0, rating: 0, spec: "All ethnic wear" },
  { id: "TL-004", nm: "Sai Stitching", ci: "Surat", st: "verified", referrals: 35, rev: 3500, rating: 4.8, spec: "Premium blouse" },
];
const MDLS = [
  { id: "M-01", nm: "PoseNet-Saree", vr: "v2.3", ty: "Pose", lt: 18, ac: 96.8, dr: 0.2, sr: 6, dp: [{ w: 1, v: 96.2 }, { w: 2, v: 96.5 }, { w: 3, v: 96.8 }, { w: 4, v: 96.7 }, { w: 5, v: 96.9 }, { w: 6, v: 96.8 }] },
  { id: "M-02", nm: "SareeDrape-VTON", vr: "v2.3", ty: "VTON", lt: 420, ac: 93.4, dr: 0.8, sr: 6, dp: [{ w: 1, v: 94.0 }, { w: 2, v: 93.8 }, { w: 3, v: 93.6 }, { w: 4, v: 93.5 }, { w: 5, v: 93.4 }, { w: 6, v: 93.4 }] },
  { id: "M-03", nm: "SkinTone-Analyzer", vr: "v1.8", ty: "Skin", lt: 140, ac: 91.2, dr: 1.1, sr: 6, dp: [{ w: 1, v: 92.1 }, { w: 2, v: 91.9 }, { w: 3, v: 91.5 }, { w: 4, v: 91.3 }, { w: 5, v: 91.2 }, { w: 6, v: 91.2 }] },
  { id: "M-07", nm: "VisualSearch-CNN", vr: "v1.5", ty: "Search", lt: 85, ac: 89.7, dr: 1.5, sr: 4, dp: [{ w: 1, v: 91.0 }, { w: 2, v: 90.5 }, { w: 3, v: 90.0 }, { w: 4, v: 89.8 }, { w: 5, v: 89.7 }, { w: 6, v: 89.7 }] },
  { id: "M-08", nm: "DemandForecaster", vr: "v1.2", ty: "Forecast", lt: 2100, ac: 87.3, dr: 2.0, sr: 6, dp: [{ w: 1, v: 89.0 }, { w: 2, v: 88.5 }, { w: 3, v: 88.0 }, { w: 4, v: 87.5 }, { w: 5, v: 87.3 }, { w: 6, v: 87.3 }] },
  { id: "LLM", nm: "Claude Sonnet 4.5", vr: "4.5", ty: "LLM", lt: 1200, ac: 98.8, dr: 0.1, sr: 6, dp: [{ w: 1, v: 98.7 }, { w: 2, v: 98.8 }, { w: 3, v: 98.8 }, { w: 4, v: 98.9 }, { w: 5, v: 98.8 }, { w: 6, v: 98.8 }] },
];
const REV = [{ m: "Oct", a: 42, f: 38 }, { m: "Nov", a: 68, f: 72 }, { m: "Dec", a: 95, f: 90 }, { m: "Jan", a: 125, f: 130 }, { m: "Feb", a: 158, f: 155 }, { m: "Mar", a: 182, f: 190 }, { m: "Apr", a: 0, f: 215 }, { m: "May", a: 0, f: 245 }];
const RADAR = [{ d: "Usage", v: 85 }, { d: "DataQual", v: 92 }, { d: "Revenue", v: 78 }, { d: "Engage", v: 88 }, { d: "TechHP", v: 95 }, { d: "Staff", v: 72 }];
const TIKS = [
  { id: "TK-101", sr: "Banarasi House", sj: "Mirror not detecting body", pr: "P1", st: "open", sl: "1h 42m", ai: "GPU thermal 82C -> FPS dropped to 8 -> PoseNet failing. Restart + thermal audit. Conf: 0.93." },
  { id: "TK-098", sr: "MAUVE Sarees", sj: "WhatsApp share delay >5s", pr: "P2", st: "progress", sl: "---", ai: "Gupshup API spike (p95: 4.2s). External. SMS fallback activated. Conf: 0.96." },
  { id: "TK-095", sr: "Silk Heritage", sj: "Catalog .webp upload fails", pr: "P3", st: "resolved", sl: "---", ai: "Added .webp support in v2.3.1. 0 recurrence. Conf: 1.00." },
];
const VNDS = [
  { nm: "AWS", tp: "Cloud", dp: "Signed", rk: "Low", sp: 52000 },
  { nm: "Gupshup", tp: "WhatsApp", dp: "Signed", rk: "Low", sp: 8500 },
  { nm: "Razorpay", tp: "Payments", dp: "Signed", rk: "Low", sp: 3200 },
  { nm: "Anthropic", tp: "LLM", dp: "Signed", rk: "Medium", sp: 12000 },
  { nm: "MSG91", tp: "SMS", dp: "Signed", rk: "Low", sp: 1800 },
  { nm: "Pinecone", tp: "Vector DB", dp: "Pending", rk: "Medium", sp: 4500 },
];
const BKPS = [
  { s: "RDS PostgreSQL", m: "Snapshot+PITR", rp: "5min", rt: "30min", l: "Today 02:00", ok: true },
  { s: "S3 Images", m: "Cross-region", rp: "~0", rt: "5min", l: "Continuous", ok: true },
  { s: "ElastiCache", m: "RDB Snapshot", rp: "24h", rt: "15min", l: "Today 03:00", ok: true },
  { s: "Edge SQLite", m: "Cloud re-sync", rp: "Sync", rt: "2h", l: "Per device", ok: true },
  { s: "Terraform", m: "S3 Versioning", rp: "Apply", rt: "2h", l: "Yesterday", ok: true },
  { s: "Secrets Mgr", m: "Versioning", rp: "~0", rt: "5min", l: "3d ago", ok: true },
];
const RVST = [
  { nm: "SaaS Subscription", cur: "65K/mo", tg: "1.4Cr/yr", pc: 65, cl: T.cy },
  { nm: "Blouse Referrals", cur: "2.4K/mo", tg: "22.5L/mo", pc: 15, cl: T.am },
  { nm: "Marketplace", cur: "800/mo", tg: "8L/mo", pc: 8, cl: T.bl },
  { nm: "Manufacturer Intel", cur: "0", tg: "30L/yr", pc: 0, cl: T.pr },
  { nm: "Promoted Placement", cur: "0", tg: "5L/mo", pc: 0, cl: "#FF6B6B" },
  { nm: "White-Label", cur: "0", tg: "1.2Cr/yr", pc: 0, cl: "#4ECDC4" },
  { nm: "Training", cur: "0", tg: "Brand", pc: 0, cl: "#FFE66D" },
];
const INVOICES = [
  { id: "INV-001", store: "MAUVE Sarees", amt: 15000, gst: 2700, total: 17700, dt: "Mar 1", st: "paid", due: "Mar 8" },
  { id: "INV-002", store: "Silk Heritage", amt: 15000, gst: 2700, total: 17700, dt: "Mar 1", st: "paid", due: "Mar 8" },
  { id: "INV-003", store: "Kanchi Collections", amt: 10000, gst: 1800, total: 11800, dt: "Mar 1", st: "paid", due: "Mar 8" },
  { id: "INV-004", store: "Patola Palace", amt: 15000, gst: 2700, total: 17700, dt: "Mar 1", st: "paid", due: "Mar 8" },
  { id: "INV-005", store: "Tant Bangla", amt: 10000, gst: 1800, total: 11800, dt: "Mar 1", st: "paid", due: "Mar 8" },
  { id: "INV-006", store: "Royal Weaves", amt: 0, gst: 0, total: 0, dt: "---", st: "trial", due: "---" },
];
const AUDT = [
  { t: "10:42", a: "Emergency stop MR-004 (Banarasi House)", u: "admin@phygifyt.com" },
  { t: "09:15", a: "Onboarding approved: Tant Bangla", u: "admin@phygifyt.com" },
  { t: "08:30", a: "Model v2.3 staged rollout (6 stores)", u: "admin@phygifyt.com" },
  { t: "Yest", a: "Feature flag: tailor_marketplace ON", u: "admin@phygifyt.com" },
  { t: "2d", a: "DPDP erasure: customer C-4421", u: "admin@phygifyt.com" },
  { t: "2d", a: "AGT-01 mode: shadow to supervised", u: "admin@phygifyt.com" },
  { t: "3d", a: "API key rotated: svc-whatsapp", u: "admin@phygifyt.com" },
  { t: "3d", a: "Service credit Rs 750 for ST-002", u: "admin@phygifyt.com" },
  { t: "4d", a: "DR drill: RDS restore passed (28 min)", u: "admin@phygifyt.com" },
];

const SESSIONS = [
  { id: "S-2841", store: "MAUVE Sarees", staff: "Deepa", mirror: "MR-001", dur: "12m", sarees: 6, status: "active" },
  { id: "S-2840", store: "Kanchi Collections", staff: "Ravi", mirror: "MR-003", dur: "8m", sarees: 4, status: "active" },
  { id: "S-2839", store: "Patola Palace", staff: "Meena", mirror: "MR-002", dur: "22m", sarees: 9, status: "completed" },
];
const INCIDENTS = [
  { id: "INC-012", sev: "P2", title: "Gupshup API degradation", start: "Mar 14 08:20", end: "Mar 14 09:45", dur: "85min", stores: 6, root: "External provider outage", status: "resolved" },
  { id: "INC-011", sev: "P3", title: "RDS connection pool exhaustion", start: "Mar 10 14:00", end: "Mar 10 14:28", dur: "28min", stores: 8, root: "Idle connection leak in campaign service", status: "resolved" },
];
const KB_ARTICLES = [
  { id: "KB-01", title: "Mirror not detecting body poses", views: 42, helpful: 89, cat: "Troubleshoot" },
  { id: "KB-02", title: "How to upload sarees using photo booth", views: 128, helpful: 95, cat: "Guide" },
  { id: "KB-03", title: "WhatsApp campaign best practices", views: 85, helpful: 91, cat: "Guide" },
  { id: "KB-04", title: "Understanding your Store Health Score", views: 64, helpful: 87, cat: "Analytics" },
];
const DR_DRILLS = [
  { test: "RDS Restore", freq: "Quarterly", last: "Feb 15, 2026", result: "Pass (28min)", next: "May 15, 2026" },
  { test: "S3 Cross-Region", freq: "Semi-annual", last: "Jan 10, 2026", result: "Pass", next: "Jul 10, 2026" },
  { test: "Region Failover (tabletop)", freq: "Annual", last: "Dec 2025", result: "Pass", next: "Dec 2026" },
  { test: "Edge Recovery", freq: "Quarterly", last: "Feb 15, 2026", result: "Pass", next: "May 15, 2026" },
  { test: "Terraform Re-create", freq: "Annual", last: "Jan 2026", result: "Pass", next: "Jan 2027" },
  { test: "CERT-In Drill", freq: "Semi-annual", last: "Feb 15, 2026", result: "Pass (4h response)", next: "Aug 2026" },
];
const CHANGELOG = [
  { ver: "v2.3.1", date: "Mar 12", type: "Patch", notes: "Added .webp support, performance fixes" },
  { ver: "v2.3.0", date: "Mar 10", type: "Minor", notes: "Model v2.3 rollout, skin tone improvements" },
  { ver: "v2.2.0", date: "Feb 28", type: "Minor", notes: "SkinTone v1.8, campaign analytics" },
  { ver: "v2.1.0", date: "Feb 14", type: "Minor", notes: "Kanjivaram support, WhatsApp share v2" },
  { ver: "v2.0.0", date: "Jan 15", type: "Major", notes: "Platform launch, 5 pilot stores" },
];
const FESTIVALS = [
  { name: "Navratri", start: "Oct 2", end: "Oct 12", freeze: true, campaign: "AGT-02 scheduled" },
  { name: "Diwali", start: "Oct 20", end: "Nov 1", freeze: true, campaign: "Peak revenue period" },
  { name: "Wedding Season", start: "Nov 1", end: "Feb 28", freeze: false, campaign: "High demand sustained" },
  { name: "Pongal", start: "Jan 14", end: "Jan 17", freeze: true, campaign: "Tamil Nadu focus" },
  { name: "Ugadi", start: "Mar 30", end: "Apr 1", freeze: true, campaign: "Telugu/Kannada focus" },
];

const NAV = [
  { k: "dash", l: "AI Dashboard" }, { k: "cmd", l: "Command Center" }, { k: "str", l: "Stores" },
  { k: "dev", l: "Devices" }, { k: "agt", l: "AI Agents" }, { k: "mdl", l: "AI Models" },
  { k: "rev", l: "Revenue" }, { k: "bil", l: "Billing & Tax" }, { k: "net", l: "Network Intel" },
  { k: "sup", l: "Support" }, { k: "leg", l: "Legal" }, { k: "sec", l: "Security" },
  { k: "dgv", l: "Data Governance" }, { k: "vnd", l: "Vendors" }, { k: "aud", l: "Audit Trail" },
  { k: "ota", l: "OTA & Releases" }, { k: "drc", l: "DR & Resilience" }, { k: "cfg", l: "Settings" },
];

const TTP = { contentStyle: { background: T.cd, border: `1px solid ${T.bd}`, borderRadius: 4, fontSize: 10, color: T.tx } };

function Badge({ s, children }) {
  const colors = { active: T.cy, online: T.cy, running: T.cy, signed: T.cy, open: T.rd, P1: T.rd, offline: T.rd, churned: T.rd, terminated: T.rd, trial: T.am, pending: T.am, progress: T.bl, P2: T.am, P3: T.bl, shadow: T.pr, supervised: T.cy, autonomous: T.cy, paused: T.am, planned: T.mt, resolved: T.cy, review: T.am, ok: T.cy, verified: T.cy, paid: T.cy };
  const c = colors[s] || T.mt;
  return (<span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 9, fontWeight: 600, color: c, background: c + "18" }}>{children || s}</span>);
}
function KPI({ l, v, s, c, ai }) {
  return (
    <div style={{ background: T.cd, borderRadius: 6, padding: "12px 14px", border: `1px solid ${T.bd}`, flex: 1, minWidth: 0 }}>
      {ai && <div style={{ fontSize: 7, color: T.pr, fontWeight: 700, float: "right" }}>AI</div>}
      <div style={{ fontSize: 9, color: T.sb, marginBottom: 2 }}>{l}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.tx, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
      {s && <div style={{ fontSize: 9, fontWeight: 600, color: c || T.pr, marginTop: 1 }}>{s}</div>}
    </div>
  );
}
function Card({ t, action, children }) {
  return (
    <div style={{ background: T.cd, borderRadius: 6, border: `1px solid ${T.bd}`, overflow: "hidden", marginBottom: 10 }}>
      {(t || action) && <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.bd}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 700, color: T.tx }}>{t}</span>{action}</div>}
      <div style={{ padding: "10px 14px" }}>{children}</div>
    </div>
  );
}
function Row({ children, onClick }) {
  return (<div onClick={onClick} style={{ display: "flex", padding: "7px 0", borderBottom: `1px solid ${T.bd}`, alignItems: "center", gap: 6, fontSize: 11, color: T.tx, cursor: onClick ? "pointer" : "default" }}>{children}</div>);
}
function Btn({ children, primary, danger, small, onClick }) {
  return (<button onClick={onClick} style={{ padding: small ? "3px 10px" : "7px 16px", borderRadius: 20, border: primary || danger ? "none" : `1.5px solid ${T.pr}`, background: danger ? T.rd : primary ? T.pr : "transparent", color: danger ? "#FBF8F3" : primary ? "#FBF8F3" : T.pr, fontSize: small ? 9 : 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>{children}</button>);
}
function Metric({ l, v, mx, c }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 1 }}><span style={{ color: T.sb }}>{l}</span><span style={{ fontWeight: 600, fontFamily: "monospace" }}>{v}</span></div>
      <div style={{ height: 3, borderRadius: 2, background: T.bd }}><div style={{ height: "100%", borderRadius: 2, background: c || T.pr, width: `${Math.min((parseFloat(v) / (mx || 100)) * 100, 100)}%` }} /></div>
    </div>
  );
}
function Toggle({ on, onToggle }) {
  return (<div onClick={onToggle} style={{ width: 34, height: 17, borderRadius: 9, background: on ? T.cy : T.bd, cursor: "pointer", position: "relative", flexShrink: 0 }}><div style={{ width: 13, height: 13, borderRadius: "50%", background: "#FFFFFF", position: "absolute", top: 2, left: on ? 19 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} /></div>);
}
function Tabs({ items, active, onChange }) {
  return (<div style={{ display: "flex", gap: 2, marginBottom: 10, flexWrap: "wrap" }}>{items.map(i => (<button key={i} onClick={() => onChange(i)} style={{ padding: "4px 12px", borderRadius: 4, border: "none", background: active === i ? T.prB : "transparent", color: active === i ? T.pr : T.mt, fontSize: 9, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{i}</button>))}</div>);
}
function Inp({ label, value, onChange, placeholder, type, required, disabled, half }) {
  return (
    <div style={{ marginBottom: 8, width: half ? "48%" : "100%", display: "inline-block", verticalAlign: "top", marginRight: half ? "2%" : 0 }}>
      <label style={{ fontSize: 9, fontWeight: 600, color: T.sb, display: "block", marginBottom: 3 }}>{label}{required && <span style={{ color: T.rd }}> *</span>}</label>
      <input type={type || "text"} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} disabled={disabled} style={{ width: "100%", padding: "7px 10px", borderRadius: 4, border: `1px solid ${T.bd}`, background: disabled ? T.bg : T.cd, color: disabled ? T.mt : T.tx, fontSize: 11, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
function Sel({ label, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 9, fontWeight: 600, color: T.sb, display: "block", marginBottom: 3 }}>{label}{required && <span style={{ color: T.rd }}> *</span>}</label>
      <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 4, border: `1px solid ${T.bd}`, background: T.cd, color: T.tx, fontSize: 11, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}>
        {options.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
      </select>
    </div>
  );
}
function FileUp({ label, file, onUpload, accept, required }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ fontSize: 9, fontWeight: 600, color: T.sb, display: "block", marginBottom: 3 }}>{label}{required && <span style={{ color: T.rd }}> *</span>}</label>
      <div onClick={() => onUpload(label + "_uploaded.pdf")} style={{ padding: "10px 14px", borderRadius: 4, border: `1px dashed ${file ? T.cy : T.bd}`, background: file ? T.cyB : T.bg, cursor: "pointer", textAlign: "center" }}>
        {file ? (<div><span style={{ fontSize: 10, color: T.cy, fontWeight: 600 }}>✓ {file}</span><div style={{ fontSize: 8, color: T.mt, marginTop: 2 }}>Click to replace</div></div>) : (<div><span style={{ fontSize: 10, color: T.mt }}>Click to upload</span><div style={{ fontSize: 8, color: T.mt, marginTop: 2 }}>{accept || "PDF, JPG, PNG (max 5MB)"}</div></div>)}
      </div>
    </div>
  );
}
function Chk({ label, checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", cursor: "pointer" }}>
      <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${checked ? T.cy : T.bd}`, background: checked ? T.cy : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{checked && <span style={{ color: T.bg, fontSize: 10, fontWeight: 700 }}>✓</span>}</div>
      <span style={{ fontSize: 9, color: T.tx, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

export default function WearifyAdmin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pg, setPg] = useState("dash");
  const [sub, setSub] = useState(null);
  const [sel, setSel] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [flags, setFlags] = useState({ tailor_marketplace: true, ai_stylist_v2: true, demand_forecast: false, voice_search: true, skin_tone: true, model_ab_test: false, network_trends: true, promoted_placement: false, saree_care_sub: false });
  const [tm, setTm] = useState(new Date());
  const [tabs, setTabs] = useState({});
  const gt = (k) => tabs[k] || null;
  const st = (k, v) => setTabs({ ...tabs, [k]: v });
  // Mutable data state for CRUD
  const [cfgItems, setCfgItems] = useState([["Platform","Wearify"],["Entity","Phygify Technoservices Pvt. Ltd."],["Region","ap-south-1 (Mumbai)"],["DR","ap-south-2 (Hyderabad)"],["OTA Window","2-5 AM IST"],["Session Timeout","1h admin / 7d owner"],["Max Discount","40% MRP"],["LLM","Claude Sonnet 4.5"],["Data Residency","India only"],["DPIIT","Active"]]);
  const [waTpls, setWaTpls] = useState([{id:"WT-01",nm:"new_arrival_festival",st:"Approved",agent:"AGT-02",body:"New arrival! {saree_name} just landed at {store_name}. Tap to explore."},{id:"WT-02",nm:"thank_you_visit",st:"Approved",agent:"System",body:"Thank you for visiting {store_name}! Your try-on images are ready."},{id:"WT-03",nm:"re_engagement_30d",st:"Approved",agent:"AGT-04",body:"We miss you at {store_name}! Come discover our latest collection."},{id:"WT-04",nm:"clearance_sale",st:"Pending",agent:"AGT-02",body:"Last chance! Clearance sale at {store_name} — up to 40% off."},{id:"WT-05",nm:"birthday_wish",st:"Approved",agent:"System",body:"Happy Birthday! Enjoy a special discount at {store_name} this week."},{id:"WT-06",nm:"referral_nudge",st:"Approved",agent:"System",body:"Love Wearify? Refer a friend and earn 1 month free!"}]);
  const [notifRules, setNotifRules] = useState([{id:"NR-01",nm:"Payment Reminder Day 15",trigger:"invoice_overdue_15d",target:"store_owner",ch:"whatsapp",active:true},{id:"NR-02",nm:"Onboarding Checkpoint",trigger:"onboarding_step_complete",target:"admin",ch:"dashboard",active:true},{id:"NR-03",nm:"Device Offline Alert",trigger:"device_offline_15min",target:"admin+store",ch:"all",active:true},{id:"NR-04",nm:"Agent Action Approval",trigger:"agent_tool_approval_needed",target:"store_owner",ch:"dashboard",active:true},{id:"NR-05",nm:"DPDP Audit Monthly",trigger:"monthly_1st",target:"dpo",ch:"email",active:true}]);
  const [festivalList, setFestivalList] = useState(FESTIVALS.map((f,i)=>({...f,id:`FE-00${i+1}`})));
  const [changelogList, setChangelogList] = useState(CHANGELOG);
  const [onCallList, setOnCallList] = useState([{id:"OC-01",role:"P0/P1 Primary",name:"Jaideep Choudhary",title:"Lead Architect",week:"Mar 10-16",status:"Active now",phone:"+91 98XXXXXXXX"},{id:"OC-02",role:"P0/P1 Secondary",name:"Mohan Srivastav",title:"AI/CV Lead",week:"Mar 10-16",status:"Backup",phone:"+91 97XXXXXXXX"},{id:"OC-03",role:"P2/P3 Primary",name:"Kshitij Singh",title:"CV Engineer",week:"Mar 10-16",status:"Active",phone:"+91 96XXXXXXXX"},{id:"OC-04",role:"Weekend Override",name:"Ashwin Kumar",title:"COO",week:"Sat-Sun",status:"Escalation only",phone:"+91 95XXXXXXXX"}]);
  const [tailorList, setTailorList] = useState(TAILORS);
  const [kbList, setKbList] = useState(KB_ARTICLES);
  const [vendorList, setVendorList] = useState(VNDS);
  const [langContent, setLangContent] = useState([{id:"LC-01",lang:"English",code:"en",status:"Complete",pct:100,translator:"Internal",lastUpdated:"Mar 1"},{id:"LC-02",lang:"Hindi",code:"hi",status:"Complete",pct:100,translator:"Internal",lastUpdated:"Mar 1"},{id:"LC-03",lang:"Kannada",code:"kn",status:"Complete",pct:100,translator:"External - Ananya",lastUpdated:"Feb 28"},{id:"LC-04",lang:"Marathi",code:"mr",status:"Complete",pct:100,translator:"External - Priya",lastUpdated:"Feb 28"},{id:"LC-05",lang:"Tamil",code:"ta",status:"In Progress",pct:40,translator:"External - Ravi",lastUpdated:"Mar 5"},{id:"LC-06",lang:"Telugu",code:"te",status:"In Progress",pct:35,translator:"External - Sai",lastUpdated:"Mar 3"},{id:"LC-07",lang:"Bengali",code:"bn",status:"In Progress",pct:30,translator:"Planned",lastUpdated:"Feb 20"},{id:"LC-08",lang:"Malayalam",code:"ml",status:"Not Started",pct:0,translator:"---",lastUpdated:"---"}]);
  const [placements, setPlacements] = useState([{id:"PP-01",store:"MAUVE Sarees",position:"Top Carousel Slot 1",saree:"Banarasi Silk S-442",rate:"Rs 2,000/week",start:"Mar 10",end:"Mar 17",status:"active",impressions:1840,clicks:312},{id:"PP-02",store:"Kanchi Collections",position:"Featured Banner",saree:"Kanjivaram S-118",rate:"Rs 1,500/week",start:"Mar 12",end:"Mar 19",status:"active",impressions:1200,clicks:198}]);
  const [whiteLabels, setWhiteLabels] = useState([{id:"WL-01",client:"Lakshmi Silks Chain",stores:12,domain:"mirror.lakshmisilks.com",branding:"Custom logo + colors",plan:"Enterprise Rs 8K/store",status:"proposal",contact:"CEO Srinivasan"},{id:"WL-02",client:"Nalli Group",stores:28,domain:"Pending",branding:"Full white-label",plan:"Enterprise Rs 7K/store",status:"discussion",contact:"Head of Innovation"}]);
  const [subscriptions, setSubscriptions] = useState([{id:"SS-01",store:"MAUVE Sarees",customer:"C-1021 Priya",plan:"Quarterly - Rs 499",items:"2 sarees care bundle",status:"active",nextBilling:"Apr 1",renewals:3},{id:"SS-02",store:"Kanchi Collections",customer:"C-2054 Asha",plan:"Monthly - Rs 199",items:"1 saree care",status:"active",nextBilling:"Mar 20",renewals:5}]);
  const [trainings, setTrainings] = useState([{id:"TR-01",name:"Mirror Basics Certification",type:"Mandatory",duration:"2h",format:"Video + Quiz",completionRate:85,certified:5,total:6},{id:"TR-02",name:"DPDP Customer Consent",type:"Mandatory",duration:"1h",format:"Online",completionRate:92,certified:11,total:12},{id:"TR-03",name:"Sales Excellence: AI Assist",type:"Optional",duration:"3h",format:"Live Workshop",completionRate:42,certified:5,total:12},{id:"TR-04",name:"WhatsApp Campaign Mastery",type:"Optional",duration:"1.5h",format:"Video",completionRate:67,certified:8,total:12}]);
  const [commissions, setCommissions] = useState([{id:"CM-01",category:"Blouse Referral",rate:"Rs 100/referral",model:"Fixed",payoutFreq:"Monthly",cap:"No cap",totalPaid:"Rs 10,500",lastPayout:"Mar 1"},{id:"CM-02",category:"Marketplace Transaction",rate:"8% of sale",model:"Percentage",payoutFreq:"Weekly",cap:"Rs 5,000/transaction",totalPaid:"Rs 2,400",lastPayout:"Mar 8"},{id:"CM-03",category:"Tailor Commission",rate:"10% of blouse stitching",model:"Percentage",payoutFreq:"Monthly",cap:"No cap",totalPaid:"Rs 3,200",lastPayout:"Mar 1"}]);
  const [retentionPolicies, setRetentionPolicies] = useState([{id:"RP-01",category:"Customer PII (Tier 1)",retention:"Consent period",deletion:"Hard-delete 72h",law:"DPDP Act 2023"},{id:"RP-02",category:"Consent Records",retention:"INDEFINITE",deletion:"Never deleted",law:"DPDP Act 2023"},{id:"RP-03",category:"Transactions",retention:"7 years (tax)",deletion:"Anonymize after",law:"Companies Act"},{id:"RP-04",category:"Session Logs",retention:"12 months",deletion:"Anonymize + archive",law:"Internal policy"},{id:"RP-05",category:"Try-On Images",retention:"30 days",deletion:"S3 auto-delete",law:"DPDP + Zero-storage"},{id:"RP-06",category:"API Logs",retention:"90d hot + 1yr",deletion:"Auto lifecycle",law:"Internal policy"}]);
  const [roleEvents, setRoleEvents] = useState([{id:"RE-001",user:"Deepa (MAUVE)",from:"Salesperson",to:"Manager",reason:"Promotion",by:"Store Owner",date:"Mar 10",approved:true},{id:"RE-002",user:"Amit (Field)",from:"Support",to:"L2 Engineering",reason:"Team restructure",by:"COO",date:"Mar 5",approved:true},{id:"RE-003",user:"New User",from:"---",to:"R05 Salesperson",reason:"New hire onboarding",by:"Store Owner (ST-003)",date:"Mar 12",approved:true},{id:"RE-004",user:"Kiran (Royal Weaves)",from:"Manager",to:"Salesperson",reason:"Role adjustment during trial",by:"Admin",date:"Feb 28",approved:true}]);
  const [wz, setWz] = useState(0);
  const [wf, setWf] = useState({
    storeName: "", ownerName: "", phone: "", email: "", address: "", city: "", state: "", pin: "", area: "", hours: "10:00 AM - 9:00 PM", gstin: "", pan: "", shopLicense: "", logo: null,
    aadhaarFile: null, aadhaarVerified: false, panFile: null, panVerified: false, gstCertFile: null, shopLicenseFile: null, bankAccount: "", bankIfsc: "", bankName: "", storePhotoExt: null, storePhotoInt: null,
    msaAccepted: false, dpaAccepted: false, aupAccepted: false, hwAccepted: false, slaAccepted: false, signerName: "", signDate: "", signConsent: false,
    plan: "smart", billing: "monthly", discountCode: "", paymentMethod: "upi",
    mirrors: [{ serial: "", iotId: "", source: "spare" }], tablets: [{ serial: "", source: "spare" }], photoBooth: true, wifiRouter: true, shipAddress: "", installDate: "", fieldTech: "",
    staff: [{ name: "", phone: "", pin: "", role: "R05" }],
    whatsappNumber: "", whatsappVerified: false, testSent: false,
  });
  const [svc, setSvc] = useState({
    virtual_tryon: true, ai_search: true, skin_tone: true, whatsapp_share: true, crm: true, campaign_manager: true, demand_forecast: false, staff_analytics: false, voice_search: false, appointment_booking: false, aging_alerts: true, blouse_referral: true,
  });
  const uwf = (k, v) => setWf({ ...wf, [k]: v });
  const addMirror = () => setWf({ ...wf, mirrors: [...wf.mirrors, { serial: "", iotId: "", source: "spare" }] });
  const addTablet = () => setWf({ ...wf, tablets: [...wf.tablets, { serial: "", source: "spare" }] });
  const addStaff = () => setWf({ ...wf, staff: [...wf.staff, { name: "", phone: "", pin: "", role: "R05" }] });
  const rmMirror = (i) => setWf({ ...wf, mirrors: wf.mirrors.filter((_, j) => j !== i) });
  const rmTablet = (i) => setWf({ ...wf, tablets: wf.tablets.filter((_, j) => j !== i) });
  const rmStaff = (i) => setWf({ ...wf, staff: wf.staff.filter((_, j) => j !== i) });
  const updMirror = (i, k, v) => { const m = [...wf.mirrors]; m[i] = { ...m[i], [k]: v }; setWf({ ...wf, mirrors: m }); };
  const updTablet = (i, k, v) => { const t = [...wf.tablets]; t[i] = { ...t[i], [k]: v }; setWf({ ...wf, tablets: t }); };
  const updStaff = (i, k, v) => { const s = [...wf.staff]; s[i] = { ...s[i], [k]: v }; setWf({ ...wf, staff: s }); };
  const [modal, setModal] = useState(null);
  const [mf, setMf] = useState({});
  const openModal = (type, data) => { setMf(data || {}); setModal(type); };
  const closeModal = () => { setModal(null); setMf({}); };
  const umf = (k, v) => setMf({ ...mf, [k]: v });
  const [legalDocs, setLegalDocs] = useState([
    { id: "LD-001", name: "Master Subscription Agreement (MSA)", type: "retailer", ver: "v3.1", status: "active", uploaded: "Feb 1, 2026", effective: "Feb 1, 2026", file: "MSA_v3.1_Final.pdf", acceptedBy: 5, desc: "Core subscription terms, payment, SLA, liability, termination" },
    { id: "LD-002", name: "Data Processing Agreement (DPA)", type: "retailer", ver: "v2.0", status: "active", uploaded: "Feb 1, 2026", effective: "Feb 1, 2026", file: "DPA_v2.0_DPDP.pdf", acceptedBy: 5, desc: "DPDP Act 2023 compliance: processing purpose, retention, deletion rights" },
    { id: "LD-003", name: "Acceptable Use Policy (AUP)", type: "retailer", ver: "v1.5", status: "active", uploaded: "Jan 15, 2026", effective: "Jan 15, 2026", file: "AUP_v1.5.pdf", acceptedBy: 5, desc: "Prohibited uses: counterfeit, spam, reverse-engineering, data abuse" },
    { id: "LD-004", name: "Hardware Rental Addendum", type: "retailer", ver: "v1.2", status: "active", uploaded: "Jan 15, 2026", effective: "Jan 15, 2026", file: "HW_Addendum_v1.2.pdf", acceptedBy: 5, desc: "Mirror/Tablet remain company property. Care obligations, replacement" },
    { id: "LD-005", name: "SLA Schedule", type: "retailer", ver: "v1.0", status: "active", uploaded: "Jan 15, 2026", effective: "Jan 15, 2026", file: "SLA_Schedule_v1.0.pdf", acceptedBy: 5, desc: "99.5% uptime, credit formula, escalation matrix, exclusions" },
    { id: "LD-006", name: "Mirror Terms of Use", type: "customer", ver: "v2.0", status: "active", uploaded: "Feb 10, 2026", effective: "Feb 10, 2026", file: "Mirror_ToU_v2.0.pdf", acceptedBy: 0, desc: "Shown on Mirror screen. Customer agrees before try-on session starts." },
    { id: "LD-007", name: "Camera & AI Consent Notice", type: "customer", ver: "v2.0", status: "active", uploaded: "Feb 10, 2026", effective: "Feb 10, 2026", file: "Camera_Consent_v2.0.pdf", acceptedBy: 0, desc: "DPDP consent for camera processing. Explains zero-storage policy." },
    { id: "LD-008", name: "WhatsApp Opt-in Terms", type: "customer", ver: "v1.1", status: "active", uploaded: "Feb 10, 2026", effective: "Feb 10, 2026", file: "WhatsApp_Optin_v1.1.pdf", acceptedBy: 0, desc: "Marketing consent for WhatsApp campaigns. Opt-out instructions." },
    { id: "LD-009", name: "Privacy Policy (Public)", type: "customer", ver: "v1.0", status: "active", uploaded: "Jan 10, 2026", effective: "Jan 10, 2026", file: "Privacy_Policy_v1.0.pdf", acceptedBy: 0, desc: "Public-facing privacy policy. Linked on website + app." },
    { id: "LD-010", name: "Data Deletion Request Form", type: "customer", ver: "v1.0", status: "active", uploaded: "Jan 10, 2026", effective: "Jan 10, 2026", file: "Deletion_Request_v1.0.pdf", acceptedBy: 0, desc: "DPDP right to erasure. Customer-facing form template." },
    { id: "LD-011", name: "MSA v3.0 (Previous)", type: "retailer", ver: "v3.0", status: "archived", uploaded: "Nov 1, 2025", effective: "Nov 1, 2025", file: "MSA_v3.0.pdf", acceptedBy: 2, desc: "Previous version. Replaced by v3.1 with updated liability caps." },
  ]);

  useEffect(() => { const i = setInterval(() => setTm(new Date()), 30000); return () => clearInterval(i); }, []);
  const go = (p, s, d) => { setPg(p); setSub(s || null); setSel(d || null); };

  if (!loggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');`}</style>
        <div style={{ background: T.pn, borderRadius: 12, padding: "36px 32px", width: 360, textAlign: "center", border: `1px solid ${T.bd}` }}>
          <div style={{ fontSize: 9, color: T.pr, letterSpacing: 4, fontWeight: 700 }}>WEARIFY</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.tx, marginTop: 4 }}>Mission Control</div>
          <div style={{ fontSize: 9, color: T.mt, marginBottom: 24 }}>Platform Admin v4.0 - 225 Features</div>
          {["Email", "Password", "TOTP"].map((l, i) => (<div key={l} style={{ textAlign: "left", marginBottom: 10 }}><label style={{ fontSize: 9, fontWeight: 600, color: T.sb, display: "block", marginBottom: 3 }}>{l}</label><input type={i === 1 ? "password" : "text"} defaultValue={i === 0 ? "admin@phygifyt.com" : i === 1 ? "password" : ""} placeholder={i === 2 ? "6-digit" : ""} style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: `1px solid ${T.bd}`, background: T.cd, color: T.tx, fontSize: 11, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} /></div>))}
          <button onClick={() => setLoggedIn(true)} style={{ width: "100%", padding: 10, borderRadius: 20, background: T.pr, color: "#FBF8F3", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Sign In to Mission Control &rarr;</button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    const WZ_STEPS = ["Store Profile", "KYC & Documents", "Agreements", "Plan & Billing", "Hardware", "Staff Setup", "WhatsApp", "Review & Activate"];
    const wzValid = [
      wf.storeName && wf.ownerName && wf.phone && wf.city && wf.gstin,
      wf.aadhaarFile && wf.panFile,
      wf.msaAccepted && wf.dpaAccepted && wf.aupAccepted && wf.hwAccepted && wf.signerName,
      wf.plan,
      wf.mirrors.length > 0 && wf.mirrors[0].serial,
      wf.staff.length > 0 && wf.staff[0].name,
      true,
      true,
    ];
    switch (pg) {

      case "dash": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 4px" }}>AI-Powered Platform Intelligence</h1>
          <p style={{ fontSize: 10, color: T.sb, marginBottom: 12 }}>Live - {STORES.filter(s => s.st !== "churned").length} stores - {tm.toLocaleTimeString()}</p>
          <Tabs items={["Overview", "System Health", "Cost Monitor", "API Gateway", "Analytics"]} active={gt("dash") || "Overview"} onChange={(v) => st("dash", v)} />
          {(gt("dash") || "Overview") === "Overview" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}><KPI l="Stores" v="8" s="+2 this mo" /><KPI l="MRR" v="Rs 65K" s="+15% MoM" /><KPI l="Uptime" v="99.8%" s="SLO 99.9%" /><KPI l="Tickets" v="2" s="1 P1" c={T.rd} /><KPI l="Agents" v="5/8" s="Rs 405/d" c={T.am} /><KPI l="Churn" v="2" s="at risk" c={T.am} ai /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 8, marginBottom: 8 }}>
              <Card t="Revenue: Actual vs AI Forecast"><ResponsiveContainer width="100%" height={150}><AreaChart data={REV}><CartesianGrid strokeDasharray="3 3" stroke={T.bd} /><XAxis dataKey="m" tick={{ fontSize: 8, fill: T.mt }} /><YAxis tick={{ fontSize: 8, fill: T.mt }} tickFormatter={v => `${v}K`} /><Tooltip {...TTP} /><Area type="monotone" dataKey="a" stroke={T.pr} fill={T.cyB} strokeWidth={2} name="Actual" /><Area type="monotone" dataKey="f" stroke={T.am} fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Forecast" /></AreaChart></ResponsiveContainer></Card>
              <Card t="Health Radar"><ResponsiveContainer width="100%" height={150}><RadarChart data={RADAR}><PolarGrid stroke={T.bd} /><PolarAngleAxis dataKey="d" tick={{ fontSize: 7, fill: T.sb }} /><PolarRadiusAxis domain={[0, 100]} tick={false} /><Radar dataKey="v" stroke={T.pr} fill={T.prB} strokeWidth={2} /></RadarChart></ResponsiveContainer></Card>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <Card t="Error Budget (SLO 99.9%)"><div style={{ fontSize: 24, fontWeight: 800, color: T.pr, fontFamily: "monospace" }}>72%</div><div style={{ fontSize: 9, color: T.sb }}>31min of 43min used - GREEN</div><div style={{ height: 5, borderRadius: 3, background: T.bd, marginTop: 6 }}><div style={{ height: "100%", borderRadius: 3, background: T.cy, width: "28%" }} /></div></Card>
              <Card t="Unit Economics">{[["ARPU", "Rs 12,143"], ["Payback", "7 months"], ["LTV", "Rs 2.43L"], ["LTV/CAC", "8.1x"], ["Margin", "72%"]].map(([l, v]) => (<div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 9 }}><span style={{ color: T.sb }}>{l}</span><span style={{ fontWeight: 600, fontFamily: "monospace" }}>{v}</span></div>))}</Card>
              <Card t="AI Predictions">{[["Churn Risk", "2 stores", T.am], ["Revenue", "Rs 2.15L", T.cy], ["Trial Conv", "60%", T.cy], ["Agent ROI", "3.2x", T.cy], ["NPS", "74", T.cy]].map(([l, v, c]) => (<div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 9 }}><span style={{ color: T.sb }}>{l}</span><span style={{ fontWeight: 600, color: c }}>{v}</span></div>))}</Card>
            </div>
          </div>)}
          {gt("dash") === "System Health" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="API p95" v="280ms" s="Target <1s" /><KPI l="API p99" v="820ms" s="Target <3s" /><KPI l="Error Rate" v="0.02%" /><KPI l="Active Conn" v="48" /><KPI l="VTON" v="420ms" s="Target <500ms" /></div>
            <Card t="System Health (24h)"><ResponsiveContainer width="100%" height={120}><LineChart data={[{ t: "00", v: 99.9 }, { t: "04", v: 99.8 }, { t: "08", v: 99.7 }, { t: "12", v: 98.5 }, { t: "16", v: 99.9 }, { t: "20", v: 99.8 }, { t: "Now", v: 99.9 }]}><CartesianGrid strokeDasharray="3 3" stroke={T.bd} /><XAxis dataKey="t" tick={{ fontSize: 8, fill: T.mt }} /><YAxis domain={[98, 100]} tick={{ fontSize: 8, fill: T.mt }} /><Tooltip {...TTP} /><Line type="monotone" dataKey="v" stroke={T.pr} strokeWidth={2} /></LineChart></ResponsiveContainer></Card>
            <Card t="Service Status" action={<Btn small primary onClick={() => setConfirm("Add service to health monitor?")}>+ Add Service</Btn>}>{[["API Gateway", "Healthy", "280ms p95"], ["RDS PostgreSQL", "Healthy", "12ms avg"], ["ElastiCache Redis", "Healthy", "0.8ms avg"], ["IoT Core MQTT", "Healthy", "42ms avg"], ["S3/CloudFront", "Healthy", "15ms avg"], ["Gupshup WhatsApp", "Degraded", "4.2s p95"], ["Razorpay", "Healthy", "320ms avg"]].map(([s, st, l]) => (<Row key={s}><span style={{ flex: 1, fontSize: 10 }}>{s}</span><Badge s={st === "Healthy" ? "active" : "review"}>{st}</Badge><span style={{ fontSize: 8, fontFamily: "monospace", color: T.mt }}>{l}</span><Btn small onClick={() => setConfirm(`Edit SLA targets for ${s}?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Remove ${s} from monitoring?`)}>Del</Btn></Row>))}</Card>
          </div>)}
          {gt("dash") === "Cost Monitor" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Total AWS" v="Rs 52K/mo" /><KPI l="Per Store" v="Rs 1,840" s="Target <Rs 3K" /><KPI l="LLM Cost" v="Rs 12K/mo" /><KPI l="Total Vendor" v="Rs 82K/mo" /></div>
            <Card t="AWS Cost by Service" action={<Btn small primary onClick={() => setConfirm("Add budget alert rule?")}>+ Add Alert</Btn>}><ResponsiveContainer width="100%" height={140}><BarChart data={[{ s: "ECS", v: 18 }, { s: "RDS", v: 12 }, { s: "S3", v: 6 }, { s: "IoT", v: 4 }, { s: "Lambda", v: 3 }, { s: "API GW", v: 2 }, { s: "Other", v: 7 }]}><XAxis dataKey="s" tick={{ fontSize: 8, fill: T.mt }} /><YAxis tick={{ fontSize: 8, fill: T.mt }} tickFormatter={v => `${v}K`} /><Tooltip {...TTP} /><Bar dataKey="v" fill={T.pr} radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></Card>
            <Card t="Cost Optimization" action={<Btn small onClick={() => setConfirm("Edit cost optimization targets?")}>Edit Targets</Btn>}>{[["Reserved Instances", "Not yet (evaluate at 50 stores)", T.am], ["S3 Lifecycle", "Active - old images to Glacier", T.cy], ["Lambda right-sizing", "Completed - 128MB optimal", T.cy], ["Cache hit ratio", "94% - minimal DB load", T.cy]].map(([l, d, c]) => (<Row key={l}><span style={{ flex: 1, fontSize: 9 }}>{l}</span><span style={{ fontSize: 8, color: c }}>{d}</span><Btn small onClick={() => setConfirm(`Edit optimization: ${l}?`)}>Edit</Btn></Row>))}</Card>
          </div>)}
          {gt("dash") === "API Gateway" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Requests/min" v="342" /><KPI l="p95 Latency" v="280ms" s="<1s target" /><KPI l="p99 Latency" v="820ms" s="<3s target" /><KPI l="Error Rate" v="0.02%" /><KPI l="Throttled" v="0" /></div>
            <Card t="Endpoint Performance (Top 10)">{[["GET /api/v1/catalog/search", "142/min", "180ms", "0%"], ["POST /api/v1/session/start", "38/min", "95ms", "0%"], ["GET /api/v1/analytics/revenue", "25/min", "420ms", "0%"], ["POST /api/v1/tryon/process", "22/min", "450ms", "0.1%"], ["GET /api/v1/analytics/health-score", "18/min", "85ms", "0%"], ["POST /api/v1/campaign/send", "8/min", "1.2s", "0.3%"], ["GET /api/v1/inventory/aging", "12/min", "310ms", "0%"], ["POST /api/v1/customer/consent", "6/min", "120ms", "0%"]].map(([ep, rq, lt, er]) => (<Row key={ep}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{ep}</span><span style={{ fontSize: 8, color: T.sb }}>{rq}</span><span style={{ fontSize: 8, fontFamily: "monospace", color: parseInt(lt) > 500 ? T.am : T.cy }}>{lt}</span><span style={{ fontSize: 8, color: er === "0%" ? T.cy : T.am }}>{er}</span></Row>))}</Card>
            <Card t="Rate Limits by Role" action={<Btn small primary onClick={() => setConfirm("Add new rate limit rule?")}>+ Add Rule</Btn>}>{[["Store Device (R05)", "100 req/min", "42% utilized"], ["Dashboard (R03/R04)", "60 req/min", "38% utilized"], ["WhatsApp Webhook", "50 req/min/store", "22% utilized"], ["Admin (R01)", "200 req/min", "8% utilized"]].map(([r, l, u]) => (<Row key={r}><span style={{ flex: 1, fontSize: 9 }}>{r}</span><span style={{ fontSize: 8, fontFamily: "monospace" }}>{l}</span><span style={{ fontSize: 8, color: T.mt }}>{u}</span><Btn small onClick={() => setConfirm(`Edit rate limit for ${r}?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Delete rate limit for ${r}?`)}>Del</Btn></Row>))}</Card>
          </div>)}
          {gt("dash") === "Analytics" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Daily Active" v="5/6" s="83% of paying" ai /><KPI l="Sessions/Store" v="18.4" s="Target 5-10" /><KPI l="Try-to-Buy" v="38%" s="Target >30%" /><KPI l="Feature Adopt" v="63/100" ai /></div>
            <Card t="Engagement Cohorts (by Onboarding Month)">{[["Jan 2026 cohort (3 stores)", "Month 1: 85%", "Month 2: 82%", "Month 3: 80%", "Healthy"], ["Feb 2026 cohort (2 stores)", "Month 1: 90%", "Month 2: 87%", "---", "Strong"], ["Mar 2026 cohort (2 stores)", "Month 1: 72%", "---", "---", "Early"]].map(([c, m1, m2, m3, s]) => (<div key={c} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ fontSize: 10, fontWeight: 600 }}>{c}</div><div style={{ display: "flex", gap: 8, marginTop: 2, fontSize: 8, color: T.sb }}><span>{m1}</span><span>{m2}</span><span>{m3}</span><span style={{ color: s === "Healthy" ? T.cy : s === "Strong" ? T.cy : T.am }}>{s}</span></div></div>))}</Card>
            <Card t="Feature Adoption Heatmap">{[["AI Search", "92%", T.cy], ["Virtual Try-On", "88%", T.cy], ["WhatsApp Share", "75%", T.am], ["CRM", "68%", T.am], ["Campaign Mgr", "52%", T.am], ["Demand Forecast", "35%", T.rd], ["Staff Analytics", "45%", T.am], ["Aging Alerts", "82%", T.cy]].map(([f, a, c]) => (<Row key={f}><span style={{ flex: 1, fontSize: 9 }}>{f}</span><span style={{ fontSize: 9, fontWeight: 600, color: c }}>{a}</span><div style={{ width: 60 }}><div style={{ height: 3, borderRadius: 2, background: T.bd }}><div style={{ height: "100%", borderRadius: 2, background: c, width: a }} /></div></div></Row>))}</Card>
          </div>)}
        </div>
      );

      case "cmd": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 12px" }}>Emergency Command Center</h1>
          <Tabs items={["Emergency Actions", "Incident Log", "Escalation"]} active={gt("cmd") || "Emergency Actions"} onChange={(v) => st("cmd", v)} />
          {(gt("cmd") || "Emergency Actions") === "Emergency Actions" && (<div>
          <div style={{ background: T.rdB, borderRadius: 6, padding: "10px 14px", marginBottom: 12, border: `1px solid ${T.rd}22`, display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14 }}>🔴</span><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: T.rd }}>Active: MR-004 offline (Banarasi House)</div><div style={{ fontSize: 9, color: T.rd, opacity: 0.7 }}>3h+ - AI: GPU thermal 82C</div></div><Btn small danger onClick={() => setConfirm("EMERGENCY STOP MR-004?")}>Stop</Btn><Btn small onClick={() => setConfirm("Restart MR-004?")}>Restart</Btn></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>{[["Stop Device", "Single halt"], ["Lockdown Store", "All devices+API"], ["Agent Halt", "ALL agents (CTO)"], ["Remote Wipe", "Factory reset"]].map(([t, d]) => (<div key={t} onClick={() => setConfirm(`${t}: ${d}. Confirm?`)} style={{ background: T.cd, borderRadius: 6, padding: 14, textAlign: "center", border: `1px solid ${T.bd}`, cursor: "pointer" }}><div style={{ fontSize: 11, fontWeight: 700, color: T.tx }}>{t}</div><div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{d}</div></div>))}</div>
          <Card t="Fleet Quick Actions">{DEVS.map(d => (<Row key={d.id}><span style={{ width: 55, fontFamily: "monospace", fontSize: 9, color: T.mt }}>{d.id}</span><span style={{ width: 45, fontSize: 9 }}>{d.tp}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{d.sr}</span><Badge s={d.st} /><Badge s={d.lc}>{d.lc}</Badge><div style={{ display: "flex", gap: 3 }}><Btn small onClick={() => setConfirm(`Restart ${d.id}?`)}>↻</Btn><Btn small danger onClick={() => setConfirm(`STOP ${d.id}?`)}>■</Btn><Btn small onClick={() => setConfirm(`Logs ${d.id}`)}>📋</Btn></div></Row>))}</Card>
          </div>)}
          {gt("cmd") === "Incident Log" && (<Card t="Active & Recent Incidents" action={<Btn small primary onClick={() => setConfirm("Log a new incident manually?")}>+ Log Incident</Btn>}>{[["INC-001", "MR-004 GPU thermal shutdown", "Critical", "Open", "3h ago", "Kshitij"], ["INC-002", "WhatsApp API rate limit hit", "High", "Resolved", "1d ago", "Mohan"], ["INC-003", "Staging DB connection pool exhausted", "Medium", "Resolved", "3d ago", "Jaideep"]].map(([id, desc, sev, st, when, who]) => (<Row key={id}><span style={{ width: 55, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{id}</span><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{desc}</span><Badge s={sev === "Critical" ? "P1" : sev === "High" ? "P2" : "P3"}>{sev}</Badge><Badge s={st === "Open" ? "open" : "resolved"}>{st}</Badge><span style={{ fontSize: 8, color: T.mt }}>{when}</span><span style={{ fontSize: 8, color: T.sb }}>{who}</span><Btn small onClick={() => setConfirm(`Edit incident ${id}?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Close incident ${id}?`)}>Close</Btn></Row>))}</Card>)}
          {gt("cmd") === "Escalation" && (<Card t="Escalation Matrix" action={<Btn small primary onClick={() => setConfirm("Add escalation rule?")}>+ Add Rule</Btn>}>{[["P1 - Critical", "CTO + AI Lead", "15 min", "Phone + Slack"], ["P2 - High", "Support Lead", "1 hour", "Slack + Email"], ["P3 - Medium", "On-Call Engineer", "4 hours", "Dashboard"], ["P4 - Low", "L1 Support Queue", "24 hours", "Dashboard"]].map(([sev, who, sla, ch]) => (<Row key={sev}><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{sev}</span><span style={{ fontSize: 9, color: T.sb }}>{who}</span><span style={{ fontSize: 9, fontFamily: "monospace" }}>{sla}</span><span style={{ fontSize: 8, color: T.mt }}>{ch}</span><Btn small onClick={() => setConfirm(`Edit escalation for ${sev}?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Delete escalation rule for ${sev}?`)}>Del</Btn></Row>))}</Card>)}
        </div>
      );

      case "str": return (
        sub === "wizard" ? (
          <div>
            <Btn onClick={() => go("str")}>Cancel Onboarding</Btn>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "10px 0 12px" }}>New Store Onboarding</h2>
            <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
              {WZ_STEPS.map((s, i) => (
                <div key={s} onClick={() => setWz(i)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 4, background: wz === i ? T.prB : i < wz ? T.cy + "08" : T.bg, cursor: "pointer", border: `1px solid ${wz === i ? T.pr : i < wz ? T.cy + "33" : T.bd}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: i < wz ? T.cy : wz === i ? T.cyB : T.bd, border: `2px solid ${i <= wz ? T.pr : T.bd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: i < wz ? "#FBF8F3" : T.pr, fontWeight: 700 }}>{i < wz ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 8, fontWeight: 600, color: wz === i ? T.pr : i < wz ? T.pr : T.mt }}>{s}</span>
                </div>
              ))}
            </div>

            {wz === 0 && (<Card t="Step 1: Store Profile & Business Details">
              <Inp label="Store Name" value={wf.storeName} onChange={v => uwf("storeName", v)} placeholder="e.g. MAUVE Sarees" required half />
              <Inp label="Owner Full Name" value={wf.ownerName} onChange={v => uwf("ownerName", v)} placeholder="e.g. Smita Kabra" required half />
              <Inp label="Owner Phone" value={wf.phone} onChange={v => uwf("phone", v)} placeholder="+91 98XXXXXXXX" required half type="tel" />
              <Inp label="Owner Email" value={wf.email} onChange={v => uwf("email", v)} placeholder="owner@store.com" required half type="email" />
              <Inp label="Store Address" value={wf.address} onChange={v => uwf("address", v)} placeholder="Full street address" required />
              <Inp label="City" value={wf.city} onChange={v => uwf("city", v)} placeholder="e.g. Mumbai" required half />
              <Inp label="State" value={wf.state} onChange={v => uwf("state", v)} placeholder="e.g. Maharashtra" required half />
              <Inp label="PIN Code" value={wf.pin} onChange={v => uwf("pin", v)} placeholder="e.g. 400005" required half />
              <Inp label="Store Area (sq ft)" value={wf.area} onChange={v => uwf("area", v)} placeholder="e.g. 800" half />
              <Inp label="Operating Hours" value={wf.hours} onChange={v => uwf("hours", v)} placeholder="10:00 AM - 9:00 PM" half />
              <Inp label="GSTIN" value={wf.gstin} onChange={v => uwf("gstin", v)} placeholder="22AAAAA0000A1Z5" required half />
              <Inp label="PAN Number" value={wf.pan} onChange={v => uwf("pan", v)} placeholder="AAAAA9999A" required half />
              <Inp label="Shop & Est. License #" value={wf.shopLicense} onChange={v => uwf("shopLicense", v)} placeholder="License number" half />
              <FileUp label="Store Logo" file={wf.logo} onUpload={v => uwf("logo", v)} accept="PNG, JPG (max 2MB)" />
            </Card>)}

            {wz === 1 && (<Card t="Step 2: KYC & Compliance Documents">
              <div style={{ fontSize: 9, color: T.sb, marginBottom: 10, lineHeight: 1.4 }}>All documents will be verified within 24 hours. Store activation depends on successful KYC.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <FileUp label="Owner Aadhaar Card" file={wf.aadhaarFile} onUpload={v => uwf("aadhaarFile", v)} required accept="PDF, JPG (max 5MB)" />
                  {wf.aadhaarFile && <Chk label="Aadhaar verified (DigiLocker API)" checked={wf.aadhaarVerified} onChange={v => uwf("aadhaarVerified", v)} />}
                </div>
                <div>
                  <FileUp label="Owner PAN Card" file={wf.panFile} onUpload={v => uwf("panFile", v)} required accept="PDF, JPG (max 5MB)" />
                  {wf.panFile && <Chk label="PAN verified (NSDL API)" checked={wf.panVerified} onChange={v => uwf("panVerified", v)} />}
                </div>
                <FileUp label="GST Registration Certificate" file={wf.gstCertFile} onUpload={v => uwf("gstCertFile", v)} required accept="PDF (max 5MB)" />
                <FileUp label="Shop & Est. License Copy" file={wf.shopLicenseFile} onUpload={v => uwf("shopLicenseFile", v)} accept="PDF (max 5MB)" />
                <div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: T.sb, marginBottom: 4 }}>Bank Details (for Razorpay Payouts)</div>
                  <Inp label="Account Number" value={wf.bankAccount} onChange={v => uwf("bankAccount", v)} placeholder="Account number" />
                  <Inp label="IFSC Code" value={wf.bankIfsc} onChange={v => uwf("bankIfsc", v)} placeholder="SBIN0001234" />
                  <Inp label="Bank & Branch" value={wf.bankName} onChange={v => uwf("bankName", v)} placeholder="SBI, Colaba Branch" />
                </div>
                <div>
                  <FileUp label="Store Photo (Exterior)" file={wf.storePhotoExt} onUpload={v => uwf("storePhotoExt", v)} accept="JPG, PNG (max 5MB)" />
                  <FileUp label="Store Photo (Interior)" file={wf.storePhotoInt} onUpload={v => uwf("storePhotoInt", v)} accept="JPG, PNG (max 5MB)" />
                </div>
              </div>
            </Card>)}

            {wz === 2 && (<Card t="Step 3: Agreement Acceptance & E-Signature">
              <div style={{ fontSize: 9, color: T.sb, marginBottom: 10, lineHeight: 1.4 }}>The following legal agreements must be read and accepted before store activation. Each document is displayed as a PDF. Electronic acceptance is legally binding under the IT Act 2000.</div>
              {[["Master Subscription Agreement (MSA)", "msaAccepted", "Governs the SaaS subscription, payment terms, SLA, liability caps, termination clauses"], ["Data Processing Agreement (DPA)", "dpaAccepted", "DPDP Act 2023 compliance: data handling, processing purpose, retention, deletion"], ["Acceptable Use Policy (AUP)", "aupAccepted", "Prohibited uses: counterfeit goods, spam, reverse-engineering, data abuse"], ["Hardware Rental Addendum", "hwAccepted", "Smart Mirror and Tablet remain company property. Care obligations, replacement terms"], ["SLA Schedule", "slaAccepted", "99.5% uptime target. Service credit formula. Escalation matrix."]].map(([doc, key, desc]) => (
                <div key={key} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.tx }}>{doc}</span>
                    <Btn small>View PDF</Btn>
                  </div>
                  <div style={{ fontSize: 8, color: T.sb, marginBottom: 4 }}>{desc}</div>
                  <Chk label={`I have read and accept the ${doc}`} checked={wf[key]} onChange={v => uwf(key, v)} />
                </div>
              ))}
              <div style={{ marginTop: 12, padding: "12px", background: T.bg, borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, marginBottom: 8 }}>Electronic Signature (IT Act 2000 compliant)</div>
                <Inp label="Full Legal Name of Signer" value={wf.signerName} onChange={v => uwf("signerName", v)} placeholder="As on PAN card" required />
                <Inp label="Date of Signing" value={wf.signDate} onChange={v => uwf("signDate", v)} type="date" required />
                <Chk label="I confirm that I am authorised to sign on behalf of the store and that this electronic signature has the same legal validity as a wet signature under the Information Technology Act, 2000." checked={wf.signConsent} onChange={v => uwf("signConsent", v)} />
                <div style={{ fontSize: 7, color: T.mt, marginTop: 4 }}>IP Address and timestamp will be recorded for legal validity.</div>
              </div>
            </Card>)}

            {wz === 3 && (<Card t="Step 4: Plan & Billing Configuration">
              <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, marginBottom: 8 }}>Select Subscription Plan</div>
              {[["digital", "Dukaan Digital", "Rs 10,000/mo", "Catalog + AI Search + CRM + WhatsApp (no Mirror)"], ["smart", "Dukaan Smart", "Rs 15,000/mo", "Everything in Digital + Smart Mirror + Virtual Try-On + AI Stylist"]].map(([v, n, p, d]) => (
                <div key={v} onClick={() => uwf("plan", v)} style={{ padding: "12px", borderRadius: 6, border: `2px solid ${wf.plan === v ? T.pr : T.bd}`, background: wf.plan === v ? T.prB : T.bg, cursor: "pointer", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, fontWeight: 700, color: wf.plan === v ? T.pr : T.tx }}>{n}</span><span style={{ fontSize: 12, fontWeight: 700, color: T.cy, fontFamily: "monospace" }}>{p}</span></div>
                  <div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{d}</div>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, marginBottom: 6 }}>Billing Cycle</div>
                {[["monthly", "Monthly", "Full price"], ["annual", "Annual (25% off)", "Billed yearly, Rs " + (wf.plan === "smart" ? "1,35,000" : "90,000")]].map(([v, l, d]) => (
                  <div key={v} onClick={() => uwf("billing", v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", cursor: "pointer" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${wf.billing === v ? T.pr : T.bd}`, background: wf.billing === v ? T.pr : "transparent" }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: wf.billing === v ? T.pr : T.tx }}>{l}</span>
                    <span style={{ fontSize: 8, color: T.mt }}>{d}</span>
                  </div>
                ))}
              </div>
              <Inp label="Discount Code (if applicable)" value={wf.discountCode} onChange={v => uwf("discountCode", v)} placeholder="e.g. EARLY40, ASSOC30" />
              <Sel label="Payment Method" value={wf.paymentMethod} onChange={v => uwf("paymentMethod", v)} options={[["upi", "UPI (Razorpay)"], ["card", "Credit/Debit Card"], ["netbanking", "Net Banking"], ["autodebit", "Auto-Debit Mandate (NACH)"]]} required />
              <div style={{ fontSize: 8, color: T.mt, marginTop: 4 }}>First invoice with GST (18%) will be generated upon activation. Razorpay subscription ID will be created automatically.</div>
            </Card>)}

            {wz === 4 && (<Card t="Step 5: Hardware Assignment">
              <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, marginBottom: 8 }}>Smart Mirrors</div>
              {wf.mirrors.map((m, i) => (
                <div key={i} style={{ padding: "8px", background: T.bg, borderRadius: 4, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: T.sb }}>Mirror #{i + 1}</span>
                    {i > 0 && <Btn small danger onClick={() => rmMirror(i)}>Remove</Btn>}
                  </div>
                  <Inp label="Serial Number" value={m.serial} onChange={v => updMirror(i, "serial", v)} placeholder="e.g. WFY-MR-2026-XXX" required half />
                  <Inp label="IoT Device ID" value={m.iotId} onChange={v => updMirror(i, "iotId", v)} placeholder="Auto-generated from AWS IoT Core" half />
                  <Sel label="Source" value={m.source} onChange={v => updMirror(i, "source", v)} options={[["spare", "From spare inventory"], ["new", "Order new (4-6 weeks)"], ["refurb", "Refurbished unit"]]} />
                </div>
              ))}
              <Btn small primary onClick={addMirror}>+ Add Another Mirror</Btn>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, margin: "12px 0 8px" }}>Tablets</div>
              {wf.tablets.map((t, i) => (
                <div key={i} style={{ padding: "8px", background: T.bg, borderRadius: 4, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: T.sb }}>Tablet #{i + 1}</span>
                    {i > 0 && <Btn small danger onClick={() => rmTablet(i)}>Remove</Btn>}
                  </div>
                  <Inp label="Tablet Serial" value={t.serial} onChange={v => updTablet(i, "serial", v)} placeholder="Tab serial number" half />
                  <Sel label="Source" value={t.source} onChange={v => updTablet(i, "source", v)} options={[["spare", "From spare inventory"], ["new", "Order new"]]} />
                </div>
              ))}
              <Btn small primary onClick={addTablet}>+ Add Another Tablet</Btn>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, margin: "12px 0 8px" }}>Accessories</div>
              <Chk label="Photo Booth Kit (tripod + light + backdrop)" checked={wf.photoBooth} onChange={v => uwf("photoBooth", v)} />
              <Chk label="WiFi Router (pre-configured, WPA3)" checked={wf.wifiRouter} onChange={v => uwf("wifiRouter", v)} />
              <Inp label="Shipping Address (if different from store)" value={wf.shipAddress} onChange={v => uwf("shipAddress", v)} placeholder="Leave blank to use store address" />
              <Inp label="Preferred Installation Date" value={wf.installDate} onChange={v => uwf("installDate", v)} type="date" half />
              <Inp label="Assigned Field Technician" value={wf.fieldTech} onChange={v => uwf("fieldTech", v)} placeholder="e.g. Amit Kumar" half />
            </Card>)}

            {wz === 5 && (<Card t="Step 6: Staff Setup & Credentials">
              <div style={{ fontSize: 9, color: T.sb, marginBottom: 10, lineHeight: 1.4 }}>Store Owner (from Step 1) is automatically assigned Role R03. Add managers and salespersons below. Each gets a unique login with role-based access.</div>
              <div style={{ padding: "8px 10px", background: T.prB, borderRadius: 4, marginBottom: 10, fontSize: 9 }}>
                <span style={{ fontWeight: 700, color: T.pr }}>Auto-created:</span> {wf.ownerName || "Owner"} — Role R03 (Store Owner) — Phone: {wf.phone || "---"}
              </div>
              {wf.staff.map((s, i) => (
                <div key={i} style={{ padding: "8px", background: T.bg, borderRadius: 4, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: T.sb }}>Staff #{i + 1}</span>
                    {wf.staff.length > 1 && <Btn small danger onClick={() => rmStaff(i)}>Remove</Btn>}
                  </div>
                  <Inp label="Full Name" value={s.name} onChange={v => updStaff(i, "name", v)} placeholder="Staff name" required half />
                  <Inp label="Phone" value={s.phone} onChange={v => updStaff(i, "phone", v)} placeholder="+91 XXXXXXXXXX" required half />
                  <Inp label="Login PIN (4-6 digits)" value={s.pin} onChange={v => updStaff(i, "pin", v)} placeholder="e.g. 4521" required half />
                  <Sel label="Role" value={s.role} onChange={v => updStaff(i, "role", v)} options={[["R04", "R04 - Store Manager"], ["R05", "R05 - Salesperson"]]} />
                </div>
              ))}
              <Btn small primary onClick={addStaff}>+ Add Staff Member</Btn>
              <div style={{ fontSize: 7, color: T.mt, marginTop: 8 }}>Credentials are generated on activation. SMS sent to each staff member with app download link + PIN.</div>
            </Card>)}

            {wz === 6 && (<Card t="Step 7: WhatsApp Business Integration">
              <div style={{ fontSize: 9, color: T.sb, marginBottom: 10, lineHeight: 1.4 }}>Connect the store's WhatsApp Business number for customer sharing, campaigns, and automated notifications via Gupshup API.</div>
              <Inp label="WhatsApp Business Phone Number" value={wf.whatsappNumber} onChange={v => uwf("whatsappNumber", v)} placeholder="+91 98XXXXXXXX" required />
              <div style={{ marginTop: 8 }}>
                <Btn small primary onClick={() => uwf("whatsappVerified", true)}>Verify via Gupshup OTP</Btn>
                {wf.whatsappVerified && <span style={{ fontSize: 9, color: T.cy, marginLeft: 8, fontWeight: 600 }}>✓ Verified</span>}
              </div>
              {wf.whatsappVerified && (<div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, marginBottom: 6 }}>Template Approval Status</div>
                {[["welcome_message", "Approved"], ["new_arrival_festival", "Approved"], ["thank_you_visit", "Approved"], ["re_engagement_30d", "Pending"], ["birthday_wish", "Approved"]].map(([t, s]) => (
                  <Row key={t}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{t}</span><Badge s={s === "Approved" ? "active" : "pending"}>{s}</Badge></Row>
                ))}
                <div style={{ marginTop: 8 }}>
                  <Btn small onClick={() => uwf("testSent", true)}>Send Test Message</Btn>
                  {wf.testSent && <span style={{ fontSize: 9, color: T.cy, marginLeft: 8, fontWeight: 600 }}>✓ Test delivered</span>}
                </div>
              </div>)}
            </Card>)}

            {wz === 7 && (<Card t="Step 8: Review & Activate">
              <div style={{ fontSize: 10, fontWeight: 700, color: T.tx, marginBottom: 10 }}>Complete Onboarding Summary</div>
              {[["Store", wf.storeName, wf.city], ["Owner", wf.ownerName, wf.phone], ["GSTIN", wf.gstin, wf.pan], ["Plan", wf.plan === "smart" ? "Dukaan Smart (Rs 15K)" : "Dukaan Digital (Rs 10K)", wf.billing === "annual" ? "Annual (25% off)" : "Monthly"], ["Mirrors", `${wf.mirrors.length} assigned`, wf.mirrors.map(m => m.serial || "---").join(", ")], ["Tablets", `${wf.tablets.length} assigned`, ""], ["Staff", `${wf.staff.length + 1} total (incl. owner)`, ""], ["WhatsApp", wf.whatsappNumber, wf.whatsappVerified ? "Verified" : "Not verified"]].map(([l, v, d]) => (
                <div key={l} style={{ display: "flex", padding: "4px 0", borderBottom: `1px solid ${T.bd}`, fontSize: 9 }}>
                  <span style={{ width: 80, color: T.mt }}>{l}</span><span style={{ flex: 1, fontWeight: 600 }}>{v}</span><span style={{ color: T.sb }}>{d}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 10, fontWeight: 700, color: T.tx }}>Compliance Checklist</div>
              {[["KYC Documents", wf.aadhaarFile && wf.panFile], ["Agreements Signed", wf.msaAccepted && wf.dpaAccepted && wf.aupAccepted && wf.hwAccepted], ["E-Signature Captured", wf.signerName && wf.signConsent], ["Payment Configured", wf.paymentMethod], ["Hardware Assigned", wf.mirrors[0]?.serial], ["Staff Created", wf.staff[0]?.name], ["WhatsApp Connected", wf.whatsappVerified]].map(([l, ok]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 9 }}>
                  <span style={{ color: ok ? T.cy : T.rd, fontSize: 10 }}>{ok ? "✓" : "✗"}</span>
                  <span style={{ color: ok ? T.tx : T.rd }}>{l}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Btn primary onClick={() => setConfirm("Activate store as TRIAL (14 days)? This will create subscription, provision devices, and send welcome messages.")}>Activate as Trial</Btn>
                <Btn onClick={() => setConfirm("Activate store as ACTIVE (billing starts immediately)?")}>Activate as Active</Btn>
                <Btn danger onClick={() => go("str")}>Discard</Btn>
              </div>
            </Card>)}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
              <Btn onClick={() => setWz(Math.max(0, wz - 1))} disabled={wz === 0}>Previous</Btn>
              <span style={{ fontSize: 9, color: T.mt }}>Step {wz + 1} of 8{wzValid[wz] ? "" : " — Complete required fields"}</span>
              <Btn primary onClick={() => setWz(Math.min(7, wz + 1))} disabled={wz === 7}>Next Step</Btn>
            </div>
          </div>
        ) : sub === "manage" ? (
          <div>
            <Btn onClick={() => go("str", "detail", sel)}>Back to Store</Btn>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "10px 0 4px" }}>Manage: {sel?.n}</h2>
            <p style={{ fontSize: 10, color: T.sb, marginBottom: 12 }}>Add devices, control catalog services, update configuration</p>
            <Tabs items={["Add Device", "Catalog Services", "Edit Store"]} active={gt("manage") || "Add Device"} onChange={v => st("manage", v)} />
            {(gt("manage") || "Add Device") === "Add Device" && (<div>
              <Card t="Current Devices">{DEVS.filter(d => d.si === sel?.id).map(d => (<Row key={d.id}><span style={{ fontFamily: "monospace", fontSize: 9, flex: 1 }}>{d.id} - {d.tp}</span><Badge s={d.st} /><Badge s={d.lc}>{d.lc}</Badge><span style={{ fontSize: 8, color: T.mt }}>{d.ls}</span></Row>))}{DEVS.filter(d => d.si === sel?.id).length === 0 && <div style={{ fontSize: 9, color: T.mt, padding: 8 }}>No devices yet</div>}</Card>
              <Card t="Add New Device to This Store">
                <Sel label="Device Type" value="mirror" onChange={() => {}} options={[["mirror", "Smart Mirror (43 inch, Jetson Orin NX)"], ["tablet", "Android Tablet (10 inch)"], ["photo_kit", "Photo Booth Kit"], ["wifi", "WiFi Router"]]} required />
                <Inp label="Serial Number" value="" onChange={() => {}} placeholder="WFY-MR-2026-XXX or WFY-TB-2026-XXX" required />
                <Inp label="IoT Device ID (Mirrors only)" value="" onChange={() => {}} placeholder="Auto-provisioned from AWS IoT Core" />
                <Sel label="Source" value="spare" onChange={() => {}} options={[["spare", "Assign from spare inventory"], ["new", "Order new (4-6 weeks lead time)"], ["refurb", "Refurbished unit"], ["transfer", "Transfer from another store"]]} />
                <Inp label="Model/Firmware Version" value="" onChange={() => {}} placeholder="e.g. v2.3 (latest)" />
                <Inp label="Expected Delivery Date" value="" onChange={() => {}} type="date" half />
                <Inp label="Installation Technician" value="" onChange={() => {}} placeholder="Assigned field tech" half />
                <div style={{ fontSize: 8, color: T.sb, marginTop: 4, lineHeight: 1.4 }}>On save: Device enters PROVISIONED state. IoT certificate auto-generated. Ansible base-setup playbook queued. Shipping tracker initiated.</div>
                <div style={{ marginTop: 8 }}><Btn primary onClick={() => setConfirm(`Add new device to ${sel?.n}? This will provision IoT certificate and queue Ansible setup.`)}>Add Device</Btn></div>
              </Card>
            </div>)}
            {gt("manage") === "Catalog Services" && (<div>
              <Card t="Catalog & Feature Access Control">
                <div style={{ fontSize: 9, color: T.sb, marginBottom: 10, lineHeight: 1.4 }}>Enable or disable specific platform features for this store. Changes take effect within 5 minutes via feature flag propagation to edge devices.</div>
                {Object.entries(svc).map(([k, v]) => {
                  const labels = { virtual_tryon: ["Virtual Try-On (VTON)", "Core AI: real-time saree draping on customer body"], ai_search: ["AI Visual Search", "Camera-based catalog search by showing fabric/color"], skin_tone: ["Skin Tone Analysis", "AI color recommendations based on complexion"], whatsapp_share: ["WhatsApp Share", "Share try-on images + catalog to customer WhatsApp"], crm: ["Customer CRM", "Purchase history, preferences, visit tracking"], campaign_manager: ["Campaign Manager", "WhatsApp campaign creation and scheduling via AGT-02"], demand_forecast: ["Demand Forecast", "AI-predicted inventory needs via M-08 DemandForecaster"], staff_analytics: ["Staff Analytics", "Per-salesperson performance tracking via AGT-06"], voice_search: ["Voice Search (Beta)", "Hindi/English voice-based catalog search"], appointment_booking: ["Appointment Booking", "Customer self-scheduling for store visits"], aging_alerts: ["Inventory Aging Alerts", "Auto-flag slow-moving items for markdowns"], blouse_referral: ["Blouse Referral Service", "Revenue Stream 1: Tailor referral integration"] };
                  const [label, desc] = labels[k] || [k, ""];
                  return (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                      <Toggle on={v} onToggle={() => setSvc({ ...svc, [k]: !v })} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: v ? T.tx : T.mt }}>{label}</div>
                        <div style={{ fontSize: 7, color: T.mt }}>{desc}</div>
                      </div>
                      <Badge s={v ? "active" : "planned"}>{v ? "ON" : "OFF"}</Badge>
                    </div>
                  );
                })}
              </Card>
            </div>)}
            {gt("manage") === "Edit Store" && (<Card t="Edit Store Profile">
              <Inp label="Store Name" value={sel?.n} onChange={() => {}} half />
              <Inp label="City" value={sel?.ci} onChange={() => {}} half />
              <Sel label="Status" value={sel?.st} onChange={() => {}} options={[["active", "Active"], ["trial", "Trial"], ["suspended", "Suspended"], ["churned", "Churned"]]} />
              <Sel label="Plan" value={sel?.pl === "Smart" ? "smart" : "digital"} onChange={() => {}} options={[["smart", "Dukaan Smart (Rs 15K)"], ["digital", "Dukaan Digital (Rs 10K)"], ["trial", "Trial (free)"]]} />
              <Inp label="Discount Applied" value={sel?.dc || ""} onChange={() => {}} placeholder="e.g. Early Adopter 40%" />
              <Inp label="Operating Hours" value="10:00 AM - 9:00 PM" onChange={() => {}} />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <Btn primary onClick={() => setConfirm("Save store changes?")}>Save Changes</Btn>
                <Btn danger onClick={() => setConfirm(`SUSPEND ${sel?.n}? All devices will be remotely disabled.`)}>Suspend Store</Btn>
              </div>
            </Card>)}
          </div>
        ) : sub === "detail" ? (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <Btn onClick={() => go("str")}>Back</Btn>
            <Btn primary onClick={() => go("str", "manage", sel)}>Manage Store</Btn>
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 4px" }}>{sel?.n} <Badge s={sel?.st} /></h2>
          <p style={{ fontSize: 10, color: T.sb, marginBottom: 12 }}>{sel?.ci} - {sel?.pl} - Onboarding: {sel?.ob}/5</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}><KPI l="Health" v={`${sel?.hp}%`} c={sel?.hp > 90 ? T.cy : T.am} /><KPI l="Churn" v={`${sel?.cr}%`} c={sel?.cr < 20 ? T.cy : T.rd} ai /><KPI l="Feature" v={`${sel?.fs}/100`} ai /><KPI l="Catalog" v={`${sel?.cu}%`} /><KPI l="Conv" v={`${sel?.cv}%`} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Card t="Agreements (MSA+DPA+AUP+HW+SLA)">{[["MSA", sel?.ag], ["DPA", sel?.ag === "signed" ? "signed" : "pending"], ["AUP Acknowledged", sel?.ag === "signed" ? "signed" : "pending"], ["Hardware Addendum", sel?.ag === "signed" ? "signed" : "pending"], ["SLA Schedule", sel?.ag === "signed" ? "signed" : "pending"], ["Discount", sel?.dc || "None (full MRP)"]].map(([l, v]) => (<Row key={l}><span style={{ flex: 1, fontSize: 9 }}>{l}</span><Badge s={v === "signed" ? "signed" : "pending"}>{v}</Badge></Row>))}</Card>
            <Card t="5-Stage Onboarding">{["Welcome & Setup", "Inventory Seed (200 sarees)", "Staff Training (2+ staff)", "Soft Launch (10 sessions)", "Go-Live (self-sufficient)"].map((s, i) => (<Row key={s}><div style={{ width: 18, height: 18, borderRadius: "50%", background: i < (sel?.ob || 0) ? T.cyB : T.bd, border: `2px solid ${i < (sel?.ob || 0) ? T.cy : T.bd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: T.cy, flexShrink: 0 }}>{i < (sel?.ob || 0) ? "✓" : i + 1}</div><span style={{ fontSize: 9, color: i < (sel?.ob || 0) ? T.tx : T.mt }}>{s}</span></Row>))}</Card>
            <Card t="Devices">
              {DEVS.filter(d => d.si === sel?.id).map(d => (<Row key={d.id}><span style={{ fontFamily: "monospace", fontSize: 9, flex: 1 }}>{d.id} - {d.tp}</span><Badge s={d.st} /></Row>))}
              {DEVS.filter(d => d.si === sel?.id).length === 0 && <div style={{ fontSize: 9, color: T.mt }}>No devices</div>}
              <div style={{ marginTop: 6 }}><Btn small primary onClick={() => go("str", "manage", sel)}>+ Add Device</Btn></div>
            </Card>
            <Card t="AI Health (6 Dimensions)">{[["Usage Frequency", "85%"], ["Data Quality", "92%"], ["Revenue Trend", "78%"], ["Customer Engagement", "88%"], ["Technical Health", "95%"], ["Staff Performance", "72%"]].map(([l, v]) => (<Metric key={l} l={l} v={v} c={parseFloat(v) > 85 ? T.cy : parseFloat(v) > 70 ? T.am : T.rd} />))}</Card>
          </div>
        </div>
        ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Stores ({STORES.length})</h1><Btn primary onClick={() => { setWz(0); go("str", "wizard"); }}>+ Onboard New Store</Btn></div>
          <Tabs items={["Registry", "Tailors", "Content", "Field Ops", "Deployment", "Health Config", "Catalog QA", "Training"]} active={gt("str") || "Registry"} onChange={(v) => st("str", v)} />
          {(gt("str") || "Registry") === "Registry" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Active" v="5" /><KPI l="Trial" v="2" c={T.am} /><KPI l="Churned" v="1" c={T.rd} /><KPI l="Conv" v="60%" ai /><KPI l="Health" v="87%" ai /></div>
            <Card t="Store Registry">{STORES.map(s => (<Row key={s.id} onClick={() => go("str", "detail", s)}><span style={{ width: 50, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{s.id}</span><span style={{ flex: 1, fontWeight: 600 }}>{s.n}</span><span style={{ width: 60, fontSize: 9, color: T.sb }}>{s.ci}</span><span style={{ width: 50, fontSize: 9 }}>{s.pl}</span><Badge s={s.st} /><span style={{ width: 30, fontSize: 9, fontFamily: "monospace", color: s.hp > 90 ? T.cy : s.hp > 0 ? T.am : T.mt }}>{s.hp || "---"}</span><span style={{ width: 45, fontSize: 9, fontFamily: "monospace" }}>{s.mr > 0 ? `${s.mr / 1000}K` : "---"}</span><Badge s={s.ag} /></Row>))}</Card>
          </div>)}
          {gt("str") === "Tailors" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Tailors" v="4" /><KPI l="Verified" v="3" /><KPI l="Referrals" v="105" s="Total" /><KPI l="Revenue" v="Rs 10.5K" s="Commissions" /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 11, fontWeight: 700, color: T.tx }}>Tailor Registry</span><Btn small primary onClick={() => openModal("tailor", {})}>+ Add Tailor</Btn></div>
            <Card t="Tailor Registry (Revenue Stream 1: Blouse Referrals)">{tailorList.map(tl => (<Row key={tl.id}><span style={{ width: 50, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{tl.id}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{tl.nm}</span><span style={{ width: 60, fontSize: 9, color: T.sb }}>{tl.ci}</span><Badge s={tl.st} /><span style={{ fontSize: 9, fontFamily: "monospace" }}>{tl.referrals} refs</span><span style={{ fontSize: 9, fontFamily: "monospace", color: T.cy }}>Rs {tl.rev}</span><span style={{ fontSize: 9, color: T.am }}>{tl.rating > 0 ? `${tl.rating}★` : "---"}</span><Btn small onClick={() => openModal("tailor", tl)}>Edit</Btn><Btn small danger onClick={() => { setTailorList(tailorList.filter(x => x.id !== tl.id)); setConfirm(`Tailor ${tl.nm} removed.`); }}>Del</Btn></Row>))}</Card>
          </div>)}
          {gt("str") === "Content" && (<div>
            <Card t="Content Management (MA-32)">
              {[["Mirror Attract Screen", "Default template", "Active", "Last updated 2d ago"], ["Catalog Banner", "Festival season theme", "Active", "Diwali early-bird"], ["Store QR Code Poster", "Auto-generated per store", "Active", "PDF download"], ["Photo Booth Guide", "Saree photography tips", "Active", "v2.1"], ["Staff Training Video", "Mirror operation guide", "Active", "12 min duration"]].map(([n, d, s, dt]) => (<Row key={n}><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{n}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><Badge s="active">{s}</Badge><span style={{ fontSize: 8, color: T.mt }}>{dt}</span></Row>))}
            </Card>
          </div>)}
          {gt("str") === "Field Ops" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Pending Visits" v="2" /><KPI l="Spare Mirrors" v="1" s="Mumbai depot" /><KPI l="Spare Tablets" v="3" /><KPI l="Insurance" v="6/6" s="All covered" /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span/><Btn small primary onClick={() => openModal("field_visit")}>+ Schedule Visit</Btn></div><Card t="Field Operations Scheduler">{[["Banarasi House (Varanasi)", "Thermal audit for MR-004", "Scheduled Mar 15", "Field tech: Amit"], ["Tant Bangla (Kolkata)", "Staff training completion", "Scheduled Mar 16", "Trainer: Priya"], ["Royal Weaves (Jaipur)", "Day 7 check-in call", "Due Mar 17", "Support: Rahul"]].map(([s, t, d, a]) => (<Row key={s}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s}</span><span style={{ fontSize: 8, color: T.sb }}>{t}</span><span style={{ fontSize: 8, color: T.am }}>{d}</span><span style={{ fontSize: 7, color: T.mt }}>{a}</span></Row>))}</Card>
            <Card t="Spare Hardware Inventory">{[["Smart Mirror", "1 unit", "Mumbai warehouse", "Ready to ship"], ["Tablet 10 inch", "3 units", "Mumbai (2) + Delhi (1)", "Ready"], ["Photo Booth Kit", "2 units", "Mumbai warehouse", "Ready"], ["WiFi Router", "4 units", "Distributed", "Ready"]].map(([h, q, l, s]) => (<Row key={h}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{h}</span><span style={{ fontSize: 9, fontFamily: "monospace" }}>{q}</span><span style={{ fontSize: 8, color: T.sb }}>{l}</span><Badge s="active">{s}</Badge></Row>))}</Card>
            <Card t="Maintenance Windows">{[["Tue/Thu 12-4 AM IST", "Regular maintenance", "48h advance notice to stores"], ["No-Deploy Fridays", "Engineering policy", "No exceptions"], ["Festival freeze periods", "See Festival Calendar", "Revenue protection"]].map(([w, t, n]) => (<Row key={w}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{w}</span><span style={{ fontSize: 8, color: T.sb }}>{t}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></Row>))}</Card>
          </div>)}
          {gt("str") === "Deployment" && (<div>
            <Card t="Store Deployment Checklist (per store)">{[["D-7: Site survey (power, internet, placement)", "5/5 stores done", T.cy], ["D-5: Ship hardware (insured courier)", "5/5 shipped", T.cy], ["D-3: Create account, configure subscription", "6/8 done", T.am], ["D-2: Pre-load catalog if digitized", "5/8 done", T.am], ["D-1: Final check (VPN, dashboard, WhatsApp)", "5/8 done", T.am], ["D-Day: Install, calibrate, test, train, go-live", "5/8 completed", T.am]].map(([s, v, c]) => (<Row key={s}><span style={{ flex: 1, fontSize: 9 }}>{s}</span><span style={{ fontSize: 8, color: c, fontWeight: 600 }}>{v}</span></Row>))}</Card>
            <Card t="Go-Live Readiness Gate (4 Categories)">{[["Infrastructure Ready", "API health, edge VPN, cloud dashboard", "5/5 stores green"], ["Application Ready", "All modules functional, AI models loaded", "5/5 stores green"], ["Security Ready", "VAPT passed, DPDP consent, RBAC, secure boot", "5/5 stores green"], ["Business Ready", "MSA signed, inventory digitized, staff trained, billing configured", "5/8 stores green"]].map(([c, d, s]) => (<Row key={c}><span style={{ fontSize: 9, fontWeight: 600, width: 120 }}>{c}</span><span style={{ flex: 1, fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 8, color: s.includes("5/5") ? T.cy : T.am }}>{s}</span></Row>))}</Card>
            <Card t="Photo Booth Kit Status">{STORES.filter(s => s.st !== "churned").map(s => (<Row key={s.id}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span><Badge s={s.ob >= 2 ? "active" : "pending"}>{s.ob >= 2 ? "Kit received + used" : "Kit pending"}</Badge><span style={{ fontSize: 8, color: T.mt }}>{s.cu}% catalog digitized</span></Row>))}</Card>
          </div>)}
          {gt("str") === "Health Config" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Avg Health" v="87%" c={T.cy} ai /><KPI l="Below 80%" v="2 stores" c={T.rd} /><KPI l="Model Ver" v="v2.1" /><KPI l="Recalc" v="Hourly" /></div>
              <Card t="Health Score Methodology — Weight Editor">
                {[{dim:"Usage Frequency",weight:25,desc:"Sessions/day vs target 5-10",formula:"sessions_last_7d / 70"},{dim:"Data Quality",weight:20,desc:"Catalog completeness + tag accuracy",formula:"(catalog_pct * 0.6) + (tag_acc * 0.4)"},{dim:"Revenue Trend",weight:20,desc:"MoM revenue change",formula:"rev_mom_delta_normalized"},{dim:"Customer Engagement",weight:15,desc:"Try-to-buy rate + repeat visits",formula:"(try_buy * 0.7) + (repeat_rate * 0.3)"},{dim:"Technical Health",weight:12,desc:"Uptime + FPS + GPU temp",formula:"(uptime * 0.5) + (fps_score * 0.3) + (thermal_score * 0.2)"},{dim:"Staff Performance",weight:8,desc:"Training completion + conversion rate",formula:"(training_pct * 0.5) + (staff_conv * 0.5)"}].map(w => (
                  <div key={w.dim} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{w.dim}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: T.cy, width: 35 }}>{w.weight}%</span>
                      <Btn small onClick={() => openModal("health_weight", w)}>Edit Weight</Btn>
                    </div>
                    <div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{w.desc}</div>
                    <div style={{ fontSize: 7, color: T.mt, fontFamily: "monospace", marginTop: 1 }}>formula: {w.formula}</div>
                  </div>
                ))}
                <div style={{ padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: T.cy }}>Total weight: 100% ✓</span>
                  <Btn primary onClick={() => setConfirm("Recalculate all store health scores with new weights?")}>Recalculate All Stores</Btn>
                </div>
              </Card>
            </div>
          )}
          {gt("str") === "Catalog QA" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Pending Review" v="14" c={T.am} /><KPI l="Approved" v="48,186" c={T.cy} /><KPI l="Rejected" v="312" c={T.rd} /><KPI l="Auto-Tagged" v="98.2%" ai /></div>
              <Card t="Catalog Quality Moderation — Image Review Queue">
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}><Btn small primary onClick={() => setConfirm("Approve all 14 pending items?")}>Approve All</Btn><Btn small danger onClick={() => setConfirm("Reject all flagged items?")}>Reject Flagged</Btn></div>
                {[{id:"IMG-4521",store:"Banarasi House",saree:"Chanderi Silk S-298",issue:"Low resolution (480px)",flag:"quality",status:"pending"},{id:"IMG-4518",store:"Royal Weaves",saree:"Rajasthani S-401",issue:"Background clutter",flag:"quality",status:"pending"},{id:"IMG-4510",store:"MAUVE Sarees",saree:"Bandhani S-187",issue:"Duplicate detected (95% similarity to S-190)",flag:"duplicate",status:"pending"},{id:"IMG-4505",store:"Silk Heritage",saree:"Kanjivaram S-112",issue:"Auto-tag: 'cotton' but image shows silk",flag:"ai_tag_error",status:"pending"}].map(item => (
                  <div key={item.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 55 }}>{item.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{item.saree} <span style={{ fontSize: 8, color: T.sb }}>— {item.store}</span></div>
                        <div style={{ fontSize: 8, color: T.am }}>{item.issue}</div>
                      </div>
                      <Badge s={item.flag === "quality" ? "trial" : item.flag === "duplicate" ? "P2" : "review"}>{item.flag}</Badge>
                      <Btn small primary onClick={() => setConfirm(`Approve ${item.id}?`)}>✓ Approve</Btn>
                      <Btn small danger onClick={() => setConfirm(`Reject ${item.id}?`)}>✗ Reject</Btn>
                    </div>
                  </div>
                ))}
              </Card>
              <Card t="AI Auto-Tag Accuracy Monitor (Per-Store)">
                {STORES.filter(s => s.st !== "churned").map(s => (
                  <Row key={s.id}>
                    <span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace" }}>{s.cu}% catalog uploaded</span>
                    <Metric l="" v={s.hp > 85 ? "98.5" : s.hp > 70 ? "95.2" : "88.4"} mx={100} c={T.cy} />
                    <span style={{ fontSize: 8, color: T.sb }}>tag accuracy</span>
                    <Btn small onClick={() => setConfirm(`Re-run AI auto-tagging for ${s.n}?`)}>Re-Tag</Btn>
                  </Row>
                ))}
              </Card>
            </div>
          )}
          {gt("str") === "Training" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div style={{ display: "flex", gap: 8 }}><KPI l="Programs" v={trainings.length} /><KPI l="Avg Completion" v="72%" ai /><KPI l="Certified Users" v="11" c={T.cy} /></div><Btn small primary onClick={() => openModal("training_cert", {})}>+ Add Program</Btn></div>
              <Card t="Training & Certification Manager">
                {trainings.map(tr => (
                  <div key={tr.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{tr.name} <Badge s={tr.type === "Mandatory" ? "P1" : "active"}>{tr.type}</Badge></div>
                        <div style={{ fontSize: 8, color: T.sb }}>{tr.format} — {tr.duration} — {tr.certified}/{tr.total} certified</div>
                      </div>
                      <div style={{ width: 80 }}>
                        <div style={{ fontSize: 7, color: T.mt, marginBottom: 2 }}>{tr.completionRate}%</div>
                        <div style={{ height: 4, borderRadius: 2, background: T.bd }}><div style={{ height: "100%", borderRadius: 2, background: tr.completionRate > 80 ? T.cy : T.am, width: `${tr.completionRate}%` }} /></div>
                      </div>
                      <Btn small onClick={() => openModal("training_cert", tr)}>Edit</Btn>
                      <Btn small onClick={() => setConfirm(`Send reminder for "${tr.name}" to incomplete users?`)}>Remind</Btn>
                      <Btn small danger onClick={() => setTrainings(trainings.filter(x => x.id !== tr.id))}>Del</Btn>
                    </div>
                  </div>
                ))}
              </Card>
              <Card t="Certification Status by Store">
                {STORES.filter(s => s.st !== "churned").map(s => (
                  <Row key={s.id}>
                    <span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: s.ob >= 3 ? T.cy : T.am }}>{s.ob >= 3 ? "Mirror Basics: ✓" : "Mirror Basics: Pending"}</span>
                    <span style={{ fontSize: 9, fontFamily: "monospace", color: s.ag === "signed" ? T.cy : T.am }}>{s.ag === "signed" ? "DPDP: ✓" : "DPDP: Pending"}</span>
                  </Row>
                ))}
              </Card>
            </div>
          )}
        </div>
        ));

      case "dev": return sub === "detail" ? (
        <div>
          <Btn onClick={() => go("dev")}>Back</Btn>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "10px 0 4px" }}>{sel?.id} — {sel?.tp} <Badge s={sel?.st} /> <Badge s={sel?.lc}>{sel?.lc}</Badge></h2>
          <p style={{ fontSize: 10, color: T.sb, marginBottom: 12 }}>{sel?.sr} — Cert: {sel?.ce} — Queue: {sel?.qq}</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Uptime" v={`${sel?.up}%`} /><KPI l="GPU" v={`${sel?.gp}ms`} /><KPI l="Last" v={sel?.ls} /><KPI l="Queue" v={sel?.qq} c={sel?.qq > 0 ? T.am : T.cy} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Card t="Live Telemetry"><Metric l="CPU" v={`${sel?.cp}%`} c={T.cy} /><Metric l="GPU Temp" v={`${sel?.gt}C`} mx={100} c={sel?.gt > 75 ? T.rd : T.cy} /><Metric l="Memory" v={`${sel?.mm}GB`} mx={8} c={T.bl} /><Metric l="FPS" v={`${sel?.fp}`} mx={30} c={sel?.fp > 20 ? T.cy : T.rd} /><div style={{ marginTop: 6, fontSize: 8, color: T.pr }}>AI: {sel?.note}</div></Card>
            <Card t="Remote Actions"><div style={{ display: "flex", flexDirection: "column", gap: 5 }}><Btn onClick={() => setConfirm(`Restart ${sel?.id}?`)}>Restart (SSH/SSM)</Btn><Btn danger onClick={() => setConfirm(`STOP ${sel?.id}?`)}>Emergency Stop</Btn><Btn onClick={() => {}}>Pull Logs</Btn><Btn onClick={() => setConfirm(`Rollback on ${sel?.id}?`)}>Force Rollback</Btn><Btn danger onClick={() => setConfirm(`WIPE ${sel?.id}? CTO ONLY`)}>Remote Wipe</Btn></div></Card>
            <Card t="Lifecycle">{["PROVISIONED","SHIPPING","INSTALLING","ACTIVE","OFFLINE","MAINTENANCE","DECOMMISSIONED"].map(s => (<div key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: s === sel?.lc ? T.cyB : T.bd, border: `2px solid ${s === sel?.lc ? T.cy : T.bd}`, fontSize: 6, display: "flex", alignItems: "center", justifyContent: "center", color: T.cy }}>{s === sel?.lc ? "●" : ""}</div><span style={{ fontSize: 9, color: s === sel?.lc ? T.tx : T.mt }}>{s}</span></div>))}</Card>
            <Card t="OTA History">{[["v2.3","Mar 12","Success"],["v2.2","Feb 28","Success"],["v2.1","Feb 14","Rollback"]].map(([v, d, s]) => (<Row key={v}><span style={{ fontWeight: 600, fontSize: 10 }}>{v}</span><span style={{ fontSize: 9, color: T.mt }}>{d}</span><Badge s={s === "Success" ? "active" : "trial"}>{s}</Badge></Row>))}</Card>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Device Fleet ({DEVS.length})</h1>
            <Btn small primary onClick={() => setConfirm("Provision new device? IoT certificate will be generated.")}>+ Provision Device</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Online" v={DEVS.filter(d => d.st === "online").length} /><KPI l="Offline" v={DEVS.filter(d => d.st === "offline").length} c={T.rd} /><KPI l="Mirrors" v={DEVS.filter(d => d.tp === "Mirror").length} /><KPI l="Avg GPU" v="46ms" ai /></div>
          <Tabs items={["Fleet","Shadow","Provisioning","Shipping","Offline Queue"]} active={gt("dev") || "Fleet"} onChange={(v) => st("dev", v)} />
          {(gt("dev") || "Fleet") === "Fleet" && (<Card t="Fleet">{DEVS.map(d => (<Row key={d.id} onClick={() => go("dev", "detail", d)}><span style={{ width: 50, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{d.id}</span><span style={{ width: 40, fontSize: 9 }}>{d.tp}</span><span style={{ flex: 1, fontWeight: 600, fontSize: 10 }}>{d.sr}</span><Badge s={d.st} /><Badge s={d.lc}>{d.lc}</Badge><span style={{ width: 40, fontSize: 9, fontFamily: "monospace" }}>{d.up}%</span><span style={{ width: 35, fontSize: 9, fontFamily: "monospace", color: d.gp > 0 ? T.cy : T.mt }}>{d.gp > 0 ? `${d.gp}ms` : "---"}</span><span style={{ width: 50, fontSize: 8, color: T.sb }}>{d.ce}</span></Row>))}</Card>)}
          {gt("dev") === "Shadow" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="In Sync" v="5/6" c={T.cy} /><KPI l="Desired≠Reported" v="1" c={T.rd} /><KPI l="Last Sync" v="2m ago" /><KPI l="Shadow Ver" v="v2.3" /></div>
              <Card t="Device Shadow Viewer (AWS IoT Core)">
                {DEVS.map(d => (
                  <div key={d.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: T.mt, width: 50 }}>{d.id}</span>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{d.sr}</span>
                      <Badge s={d.st === "online" ? "active" : "offline"}>{d.st}</Badge>
                      <Btn small onClick={() => setConfirm(`Sync shadow for ${d.id}?`)}>Force Sync</Btn>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginLeft: 56 }}>
                      <div style={{ background: T.bg, borderRadius: 4, padding: "6px 8px" }}>
                        <div style={{ fontSize: 7, color: T.pr, fontWeight: 700, marginBottom: 3 }}>DESIRED STATE</div>
                        {[["firmware","v2.3"],["ai_model","posenet_v2.3"],["feature_flags","7 active"],["vton_mode","realtime"]].map(([k,v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 8 }}><span style={{ color: T.mt, fontFamily: "monospace" }}>{k}</span><span style={{ color: T.tx }}>{v}</span></div>
                        ))}
                      </div>
                      <div style={{ background: T.bg, borderRadius: 4, padding: "6px 8px" }}>
                        <div style={{ fontSize: 7, color: d.st === "offline" ? T.rd : T.am, fontWeight: 700, marginBottom: 3 }}>REPORTED STATE</div>
                        {[["firmware", d.st === "offline" ? "v2.2" : "v2.3"],["ai_model", d.st === "offline" ? "posenet_v2.2" : "posenet_v2.3"],["feature_flags", d.st === "offline" ? "6 active" : "7 active"],["vton_mode", d.st === "offline" ? "pending_sync" : "realtime"]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 8 }}><span style={{ color: T.mt, fontFamily: "monospace" }}>{k}</span><span style={{ color: d.st === "offline" ? T.rd : T.tx }}>{v}</span></div>
                        ))}
                      </div>
                    </div>
                    {d.st === "offline" && <div style={{ fontSize: 8, color: T.rd, marginTop: 4, marginLeft: 56 }}>⚠ Shadow delta detected — device unreachable for 3h+. Desired state will apply on reconnect.</div>}
                  </div>
                ))}
              </Card>
            </div>
          )}
          {gt("dev") === "Provisioning" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Total Provisioned" v="6" /><KPI l="In Progress" v="1" c={T.am} /><KPI l="Pending" v="2" c={T.mt} /><KPI l="Certificates" v="6/6" c={T.cy} /></div>
              <Card t="Provisioning Progress Dashboard">
                {[{id:"MR-001",store:"MAUVE Sarees",step:7,total:7,status:"complete",cert:"arn:aws:iot:ap-south-1::cert/abc123",ansible:"Completed",ts:"Feb 1"},{id:"MR-004",store:"Banarasi House",step:5,total:7,status:"in_progress",cert:"arn:aws:iot:ap-south-1::cert/def456",ansible:"Pending thermal fix",ts:"Feb 14"},{id:"MR-NEW",store:"Pending Assignment",step:1,total:7,status:"queued",cert:"Not generated",ansible:"Not started",ts:"Queued"}].map(dev => (
                  <div key={dev.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 9, color: T.mt, width: 55 }}>{dev.id}</span>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{dev.store}</span>
                      <Badge s={dev.status === "complete" ? "active" : dev.status === "in_progress" ? "trial" : "planned"}>{dev.status}</Badge>
                      <span style={{ fontSize: 8, color: T.mt }}>{dev.ts}</span>
                      <Btn small onClick={() => setConfirm(`Run Ansible playbook for ${dev.id}?`)}>▶ Run Ansible</Btn>
                    </div>
                    <div style={{ marginTop: 6, marginLeft: 61 }}>
                      <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
                        {["Create Account","Generate Cert","IoT Register","Ansible Base","App Config","Staff Create","Go-Live"].map((step, i) => (
                          <div key={step} title={step} style={{ flex: 1, height: 6, borderRadius: 2, background: i < dev.step ? T.cy : T.bd }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 7, color: T.sb }}>Step {dev.step}/7 — Cert: {dev.cert.length > 20 ? dev.cert.slice(0, 25) + "..." : dev.cert}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {gt("dev") === "Shipping" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="In Transit" v="1" c={T.am} /><KPI l="Delivered" v="5" c={T.cy} /><KPI l="Pending Ship" v="2" c={T.mt} /><KPI l="Insurance" v="100%" c={T.cy} /></div>
              <Card t="Hardware Shipping Tracker">
                {[{id:"SHP-001",device:"MR-003",store:"Kanchi Collections",courier:"BlueDart",trackNo:"BD-9284761",status:"Delivered",shipped:"Jan 28",delivered:"Feb 2",weight:"48kg",insured:"Rs 2.5L"},{id:"SHP-002",device:"MR-004",store:"Banarasi House",courier:"DTDC",trackNo:"DTDC-44821",status:"Delivered",shipped:"Feb 10",delivered:"Feb 14",weight:"48kg",insured:"Rs 2.5L"},{id:"SHP-003",device:"MR-NEW",store:"Pending",courier:"---",trackNo:"---",status:"Pending",shipped:"---",delivered:"---",weight:"48kg",insured:"Pre-insured"},{id:"SHP-004",device:"TB-003",store:"Royal Weaves",courier:"BlueDart",trackNo:"BD-9301234",status:"In Transit",shipped:"Mar 13",delivered:"Est. Mar 16",weight:"2kg",insured:"Rs 20K"}].map(shp => (
                  <div key={shp.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 55 }}>{shp.device}</span>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{shp.store}</span>
                      <Badge s={shp.status === "Delivered" ? "active" : shp.status === "In Transit" ? "trial" : "planned"}>{shp.status}</Badge>
                      <Btn small onClick={() => setConfirm(`Mark ${shp.device} as received?`)}>✓ Received</Btn>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 7, color: T.sb, marginTop: 3, marginLeft: 61 }}>
                      <span>{shp.courier}</span><span>Track: {shp.trackNo}</span><span>Shipped: {shp.shipped}</span><span>Delivered: {shp.delivered}</span><span>Insured: {shp.insured}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {gt("dev") === "Offline Queue" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Total Queued" v="1,842" c={T.rd} /><KPI l="Device" v="MR-004" c={T.rd} /><KPI l="Oldest Event" v="3h 12m" c={T.am} /><KPI l="Auto-Replay" v="On Reconnect" /></div>
              <Card t="Offline Queue — MR-004 (Banarasi House) — Per-Event Detail">
                <div style={{ marginBottom: 8, padding: "6px 10px", background: T.amB, borderRadius: 4, fontSize: 9, color: T.am }}>
                  ⚠ 1,842 events queued in edge SQLite. Will auto-replay to cloud in order on reconnect. MQTT QoS 1 guarantees at-least-once delivery.
                </div>
                {[{id:"E-001",type:"session.start",ts:"Mar 15 10:42:18",data:'{"session_id":"S-2831","staff":"Raghav","customer":"anon"}',size:"0.8KB",priority:"high"},{id:"E-002",type:"tryon.complete",ts:"Mar 15 10:48:32",data:'{"sarees_tried":4,"duration":8,"conversion":false}',size:"2.1KB",priority:"high"},{id:"E-003",type:"health.metric",ts:"Mar 15 10:50:00",data:'{"cpu":89,"gpu_temp":82,"fps":8,"memory":3.1}',size:"0.4KB",priority:"medium"},{id:"E-004",type:"whatsapp.share",ts:"Mar 15 10:52:11",data:'{"phone":"redacted","saree_ids":["S-112","S-204"]}',size:"1.2KB",priority:"high"},{id:"E-005",type:"consent.record",ts:"Mar 15 10:42:15",data:'{"consent_type":"camera","accepted":true,"ip":"10.0.1.3"}',size:"0.3KB",priority:"critical"}].map(ev => (
                  <div key={ev.id} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 40 }}>{ev.id}</span>
                      <Badge s={ev.priority === "critical" ? "P1" : ev.priority === "high" ? "trial" : "active"}>{ev.priority}</Badge>
                      <span style={{ flex: 1, fontFamily: "monospace", fontSize: 9, color: T.cy }}>{ev.type}</span>
                      <span style={{ fontSize: 8, color: T.mt }}>{ev.ts}</span>
                      <span style={{ fontSize: 7, color: T.sb }}>{ev.size}</span>
                      <Btn small onClick={() => setConfirm(`Force-replay event ${ev.id}?`)}>Replay</Btn>
                    </div>
                    <div style={{ fontSize: 7, color: T.mt, fontFamily: "monospace", marginTop: 2, marginLeft: 46, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.data}</div>
                  </div>
                ))}
                <div style={{ fontSize: 8, color: T.mt, padding: "6px 0" }}>… and 1,837 more events. Showing newest 5. Use filters to drill down by type, priority, or timestamp.</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <Btn primary onClick={() => setConfirm("Force-replay ALL 1,842 queued events? Will occur on reconnect regardless.")}>Force Replay All</Btn>
                  <Btn danger onClick={() => setConfirm("Purge non-critical queue events? CONSENT records will be preserved.")}>Purge Non-Critical</Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      );

      case "agt": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 4px" }}>Agentic AI Control Plane</h1>
          <p style={{ fontSize: 10, color: T.sb, marginBottom: 10 }}>8 agents - 15 tools - Multi-agent conflict resolution</p>
          <Tabs items={["Agents", "Tool Registry", "Conflicts", "Agent vs Human"]} active={gt("agt") || "Agents"} onChange={(v) => st("agt", v)} />
          {(gt("agt") || "Agents") === "Agents" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Running" v="5/8" /><KPI l="Actions" v="24" /><KPI l="Accuracy" v="92.4%" ai /><KPI l="LLM Cost" v="Rs 405/d" c={T.am} /></div>
            {AGTS.map(a => (<Card key={a.id} t={`${a.id}: ${a.nm}`}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}><Badge s={a.st} /><Badge s={a.md} /><span style={{ fontSize: 8, color: T.mt }}>Ph{a.ph} - {a.sr}st - {a.cy}</span><div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>{[["Act", a.ac], ["Acc", `${a.ax}%`], ["Rs", a.cs]].map(([l, v]) => (<div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{v}</div><div style={{ fontSize: 7, color: T.mt }}>{l}</div></div>))}{a.st !== "planned" && <Btn small danger={a.st === "running"} onClick={() => setConfirm(`${a.st === "running" ? "PAUSE" : "RESUME"} ${a.nm}?`)}>{a.st === "running" ? "Pause" : "Start"}</Btn>}{a.st !== "planned" && <Btn small onClick={() => setConfirm(`Configure ${a.nm} — adjust confidence threshold, cycle time, tool permissions?`)}>Edit</Btn>}<Btn small danger onClick={() => setConfirm(`Delete agent ${a.nm}? This will stop all scheduled actions.`)}>Del</Btn></div></div><div style={{ fontSize: 9, color: T.sb, lineHeight: 1.5, padding: "6px 10px", background: T.bg, borderRadius: 4 }}>AI: {a.rs}</div></Card>))}
          </div>)}
          {gt("agt") === "Tool Registry" && (<div>
            <Card t="15 Registered Agent Tools (T-01 to T-15)" action={<Btn small primary onClick={() => setConfirm("Register new tool? Opens tool configuration wizard.")}>+ Add Tool</Btn>}>
              {TOOLS.map(tl => (<Row key={tl.id}><span style={{ width: 35, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{tl.id}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{tl.nm}</span><span style={{ fontSize: 8, color: T.sb, width: 120 }}>{tl.desc}</span><span style={{ fontSize: 8, color: T.mt, width: 60 }}>{tl.agents}</span><Badge s={tl.approval === "Auto" ? "active" : "pending"}>{tl.approval}</Badge><span style={{ fontSize: 9, fontFamily: "monospace", width: 30 }}>{tl.used}x</span><span style={{ fontSize: 7, color: T.mt }}>{tl.limit}</span><Btn small onClick={() => setConfirm(`Edit tool ${tl.nm}: change approval, limits, agent access?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Delete tool ${tl.nm}? Agents using it will lose access.`)}>Del</Btn></Row>))}
            </Card>
          </div>)}
          {gt("agt") === "Conflicts" && (<div>
            <Card t="Agent Conflict Resolution Log">
              {CONFLICTS.map((c, i) => (<div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", gap: 4, marginBottom: 4 }}><Badge s={c.st} /><span style={{ fontSize: 10, fontWeight: 600 }}>{c.a} vs {c.b}</span><span style={{ fontSize: 8, color: T.mt }}>{c.time}</span></div><div style={{ fontSize: 9, color: T.sb }}>Resource: {c.res}</div><div style={{ fontSize: 9, color: T.am, marginTop: 2 }}>Conflict: {c.issue}</div><div style={{ fontSize: 9, color: T.pr, marginTop: 2 }}>Resolution: {c.fix}</div></div>))}
            </Card>
          </div>)}
          {gt("agt") === "Agent vs Human" && (<div>
            <Card t="Agent vs Human Decision Comparison (Shadow Mode Data)">
              {AGTS.filter(a => a.hu).map(a => (<div key={a.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", gap: 4, marginBottom: 2 }}><span style={{ fontSize: 10, fontWeight: 600 }}>{a.id}: {a.nm}</span><Badge s={a.md} /></div><div style={{ fontSize: 9, color: T.pr, padding: "4px 8px", background: T.prB, borderRadius: 3, lineHeight: 1.4 }}>{a.hu}</div></div>))}
            </Card>
          </div>)}
        </div>
      );

      case "mdl": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 12px" }}>AI Model Registry & MLOps</h1>
          <Tabs items={["Models", "Prompts", "Rollout", "Training", "Dataset"]} active={gt("mdl") || "Models"} onChange={(v) => st("mdl", v)} />
          {(gt("mdl") || "Models") === "Models" && (<div>{MDLS.map(m => (<Card key={m.id} t={`${m.nm} ${m.vr}`}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, fontSize: 9, color: T.sb }}>{m.ty} - {m.sr} stores</div>{[["Lat", `${m.lt}ms`], ["Acc", `${m.ac}%`], ["Drift", `${m.dr}%`]].map(([l, v]) => (<div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: l === "Drift" ? (m.dr < 1 ? T.cy : m.dr < 2 ? T.am : T.rd) : T.tx }}>{v}</div><div style={{ fontSize: 7, color: T.mt }}>{l}</div></div>))}<div style={{ width: 80 }}><ResponsiveContainer width="100%" height={22}><LineChart data={m.dp}><Line type="monotone" dataKey="v" stroke={m.dr < 1 ? T.cy : T.am} strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer></div><Btn small primary>Push</Btn></div></Card>))}<Card t="Hallucination Monitor (Claude)"><div style={{ fontSize: 24, fontWeight: 800, color: T.pr, fontFamily: "monospace" }}>0.8%</div><Metric l="This week" v="0.8" mx={5} c={T.cy} /><Metric l="Last week" v="1.1" mx={5} c={T.am} /></Card></div>)}
          {gt("mdl") === "Prompts" && (<Card t="Prompt Version Manager">{[["ai_stylist_main", "v3.2", "active", "92% satisfaction"], ["skin_tone_reco", "v2.1", "active", "88% accuracy"], ["campaign_draft", "v1.8", "testing", "+12% CTR in A/B"], ["search_parse", "v2.0", "active", "95% parse rate"], ["coaching_tip", "v1.3", "active", "Constructive tone verified"]].map(([n, v, s, m]) => (<Row key={n}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 9 }}>{n}</span><span style={{ fontSize: 8, color: T.mt }}>{v}</span><Badge s={s === "active" ? "active" : "trial"}>{s}</Badge><span style={{ fontSize: 7, color: T.pr }}>{m}</span><Btn small>Rollback</Btn></Row>))}</Card>)}
          {gt("mdl") === "Rollout" && (<Card t="OTA Staged Rollout Pipeline">{[["Canary (10%)", "Deployed Mar 10", "0 errors", "active"], ["Early Majority (50%)", "Deployed Mar 11", "0 rollbacks", "active"], ["Full Fleet (100%)", "Scheduled Mar 13", "Health gate pending", "pending"]].map(([s, d, n, st]) => (<div key={s} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", gap: 4 }}><Badge s={st}>{st === "active" ? "✓" : "⏳"}</Badge><span style={{ fontSize: 10, fontWeight: 600 }}>{s}</span></div><div style={{ fontSize: 8, color: T.mt }}>{d} - {n}</div></div>))}</Card>)}
          {gt("mdl") === "Training" && (<div>
            <Card t="Training Pipeline Status">{[["PoseNet-Saree v2.4", "Scheduled", "Mar 20", "Est. 4h on SageMaker", "5,200 images"], ["SareeDrape-VTON v2.4", "Queued", "Mar 25", "Est. 8h on SageMaker", "3,800 pairs"], ["SkinTone v1.9", "Completed", "Mar 5", "3.2h actual", "2,100 images"], ["VisualSearch v1.6", "Planning", "Apr 1", "Est. 6h", "4,500 images"], ["DemandForecaster v1.3", "Running Daily", "Continuous", "Prophet + XGBoost", "12 months data"]].map(([m, s, d, t, ds]) => (<div key={m} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{m}</span><Badge s={s === "Completed" ? "resolved" : s === "Running Daily" ? "running" : "pending"}>{s}</Badge></div><div style={{ display: "flex", gap: 12, fontSize: 8, color: T.sb, marginTop: 2 }}><span>Date: {d}</span><span>{t}</span><span>Data: {ds}</span></div></div>))}</Card>
            <Card t="Model A/B Testing">{[["PoseNet v2.3 vs v2.2", "v2.3 wins (+1.2% accuracy, -3ms latency)", "Concluded", T.cy], ["VTON v2.3 vs v2.2", "v2.3 wins (+0.8% on Kanjivaram drapes)", "Concluded", T.cy], ["Claude Prompt v3.2 vs v3.1", "v3.2 +12% CTR on campaigns", "Running", T.am]].map(([t, r, s, c]) => (<div key={t} style={{ padding: "5px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ fontSize: 9, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 8, color: c }}>{r}</div><div style={{ fontSize: 7, color: T.mt }}>{s}</div></div>))}</Card>
          </div>)}
          {gt("mdl") === "Dataset" && (<div>
            <Card t="Dataset Health Dashboard">{[["Saree images (catalog)", "48,200", ">85% tag accuracy", "Growing daily"], ["Pose estimation training", "5,200", "Manually annotated", "Refresh: quarterly"], ["VTON draping pairs", "3,800", "6 draping styles", "Need +2 styles"], ["Skin tone calibration", "2,100", "Fitzpatrick I-VI", "Balanced"], ["Visual search embeddings", "4,500", "Pinecone indexed", "Auto-update"], ["Demand features", "12 months", "Festival + season signals", "Daily ETL"]].map(([d, c, q, n]) => (<Row key={d}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{d}</span><span style={{ fontSize: 9, fontFamily: "monospace" }}>{c}</span><span style={{ fontSize: 8, color: T.sb }}>{q}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></Row>))}</Card>
            <Card t="Feature Store">{[["customer_recency", "Days since last visit", "Daily refresh", "AGT-04"], ["saree_aging_days", "Days since inventory add", "Real-time", "AGT-01"], ["staff_conversion_rate", "30-day rolling", "Daily", "AGT-06"], ["store_revenue_trend", "7-day moving avg", "Hourly", "AGT-03"], ["category_demand_score", "Demand forecast signal", "Daily (M-08)", "AGT-01, AGT-05"], ["customer_ltv_score", "Predicted lifetime value", "Weekly", "AGT-04"]].map(([f, d, r, a]) => (<Row key={f}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{f}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 7, color: T.mt }}>Refresh: {r}</span><span style={{ fontSize: 7, color: T.pr }}>Used by: {a}</span></Row>))}</Card>
          </div>)}
        </div>
      );

      case "rev": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Revenue Intelligence</h1><div style={{ display: "flex", gap: 4 }}><Btn small primary onClick={() => openModal("lead")}>+ Lead</Btn><Btn small primary onClick={() => openModal("discount")}>+ Discount</Btn></div></div>
          <Tabs items={["7 Streams", "Discounts", "Pipeline", "Referrals", "Forecast", "Placements", "Commissions", "White-Label"]} active={gt("rev") || "7 Streams"} onChange={(v) => st("rev", v)} />
          {(gt("rev") || "7 Streams") === "7 Streams" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="MRR" v="Rs 65K" /><KPI l="ARR" v="Rs 7.8L" ai /><KPI l="Active" v="3/7" /><KPI l="ARPU" v="Rs 12,143" /></div>
            <Card t="Revenue Streams with Management">{RVST.map(r => (<div key={r.nm} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: r.cl, flexShrink: 0 }} /><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{r.nm}</span><span style={{ width: 60, fontSize: 9, fontFamily: "monospace", textAlign: "right" }}>{r.cur}</span><span style={{ width: 70, fontSize: 8, color: T.sb }}>Tgt: {r.tg}</span><div style={{ width: 50 }}><div style={{ height: 3, borderRadius: 2, background: T.bd }}><div style={{ height: "100%", borderRadius: 2, background: r.cl, width: `${Math.max(r.pc, 2)}%` }} /></div></div></div>))}</Card>
          </div>)}
          {gt("rev") === "Discounts" && (<div><div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><Btn small primary onClick={() => openModal("discount")}>+ Add Discount</Btn></div><Card t="Strategic Discount Manager (6 Tiers)">{[["Early Adopter 40%", "MAUVE Sarees", "Rs 9,000 effective", "6 months"],["Annual 25%","Silk Heritage","Rs 11,250 effective","12 months"],["Association 30%","Tant Bangla","Rs 10,500 effective","10+ stores"],["Festival 20%","---","Rs 12,000 effective","Pre-Diwali"],["Referral","Kanchi (2 refs)","1 month free earned","Per referral"],["Competitive Switch 35%","---","Rs 9,750 effective","When competitors enter"]].map(([d, s, e, t]) => (<Row key={d}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{d}</span><span style={{ fontSize: 8, color: T.sb }}>{s}</span><span style={{ fontSize: 9, fontFamily: "monospace", color: T.cy }}>{e}</span><span style={{ fontSize: 7, color: T.mt }}>{t}</span><Btn small onClick={() => openModal("discount", {name:d,store:s,effective:e,term:t})}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Remove discount "${d}"?`)}>Del</Btn></Row>))}</Card></div>)}
          {gt("rev") === "Pipeline" && (<div><div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><Btn small primary onClick={() => openModal("lead")}>+ Add Lead</Btn></div><Card t="Sales Pipeline / Lead CRM">{[["Demo Scheduled","3 leads","Jaipur x2, Lucknow x1",T.bl],["Trial Active","2 stores","Banarasi House, Royal Weaves",T.am],["Conversion Likely (>50%)","1 store","Banarasi (usage trending up)",T.cy],["At Risk (<30%)","1 store","Royal Weaves (low adoption score 35)",T.rd]].map(([s, v, d, c]) => (<div key={s} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{s}</span><span style={{ fontSize: 10, fontWeight: 600, color: c }}>{v}</span><Btn small onClick={() => openModal("lead", {stage:s})}>+ Add</Btn></div><div style={{ fontSize: 8, color: T.mt }}>{d}</div></div>))}</Card></div>)}
          {gt("rev") === "Referrals" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Total Referrals" v="105" /><KPI l="Commission Earned" v="Rs 10.5K" /><KPI l="Stores Referred" v="1" s="Kanchi did 2 referrals" /><KPI l="Reward Given" v="2 mo free" /></div>
            <Card t="Referral Program Tracker">{[["Kanchi Collections","Referred 2 stores","2 months free earned","Both converted to trial"],["MAUVE Sarees","Referred 1 store","1 month free earned","Trial in progress"],["Silk Heritage","0 referrals","---","No activity"]].map(([s, r, rw, st]) => (<Row key={s}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s}</span><span style={{ fontSize: 8, color: T.sb }}>{r}</span><span style={{ fontSize: 8, color: T.cy }}>{rw}</span><span style={{ fontSize: 7, color: T.mt }}>{st}</span></Row>))}</Card>
            <Card t="Association Bulk Deals">{[["Kolkata Textile Merchants Assoc.","15 potential stores","30% bulk discount offered","3 demos scheduled"],["Mumbai Saree Retailers Forum","22 potential stores","Proposal sent","Awaiting response"],["Chennai Silk Traders Guild","8 potential stores","Early discussion","Contact: VP Mr. Rajan"]].map(([a, p, s, n]) => (<Row key={a}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{a}</span><span style={{ fontSize: 8, color: T.sb }}>{p}</span><span style={{ fontSize: 8, color: T.am }}>{s}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></Row>))}</Card>
          </div>)}
          {gt("rev") === "Forecast" && (<div>
            <Card t="Revenue Forecast vs Actual (AI)"><ResponsiveContainer width="100%" height={160}><BarChart data={[{m:"Oct",a:42,f:38},{m:"Nov",a:68,f:72},{m:"Dec",a:95,f:90},{m:"Jan",a:125,f:130},{m:"Feb",a:158,f:155},{m:"Mar",a:182,f:190}]}><CartesianGrid strokeDasharray="3 3" stroke={T.bd} /><XAxis dataKey="m" tick={{ fontSize: 8, fill: T.mt }} /><YAxis tick={{ fontSize: 8, fill: T.mt }} /><Tooltip {...TTP} /><Bar dataKey="a" fill={T.cy} name="Actual (K)" radius={[2,2,0,0]} /><Bar dataKey="f" fill={T.am} name="Forecast (K)" radius={[2,2,0,0]} /></BarChart></ResponsiveContainer></Card>
            <Card t="Variance Analysis">{[["Oct","42K","38K","+10.5%","Beat forecast - strong pilot launch"],["Nov","68K","72K","-5.6%","Below - delayed Silk Heritage onboarding"],["Dec","95K","90K","+5.6%","Beat - festive season boost"],["Jan","125K","130K","-3.8%","Slightly below - Mysore Silks churned"],["Feb","158K","155K","+1.9%","On track"],["Mar","182K","190K","-4.2%","Below - Banarasi House trial delayed"]].map(([m, a, f, v, n]) => (<Row key={m}><span style={{ width: 30, fontSize: 9, fontWeight: 600 }}>{m}</span><span style={{ width: 40, fontSize: 8, fontFamily: "monospace" }}>{a}</span><span style={{ width: 40, fontSize: 8, fontFamily: "monospace", color: T.am }}>{f}</span><span style={{ width: 40, fontSize: 8, color: v.includes("+") ? T.cy : T.rd }}>{v}</span><span style={{ flex: 1, fontSize: 7, color: T.mt }}>{n}</span></Row>))}</Card>
          </div>)}
          {gt("rev") === "Placements" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}><KPI l="Active" v={placements.length} c={T.cy} /><KPI l="Revenue" v="Rs 3,500/wk" /><KPI l="Impressions" v="3,040" ai /></div>
                <Btn small primary onClick={() => openModal("placement", {})}>+ New Placement</Btn>
              </div>
              <Card t="Promoted Placement Manager (Revenue Stream 5)">
                {placements.map(p => (
                  <div key={p.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 40 }}>{p.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{p.saree} <span style={{ fontSize: 8, color: T.sb }}>— {p.store}</span></div>
                        <div style={{ fontSize: 8, color: T.sb }}>{p.position} — {p.start} to {p.end} — {p.rate}</div>
                      </div>
                      <Badge s={p.status} /><span style={{ fontSize: 8, fontFamily: "monospace", color: T.cy }}>{p.impressions.toLocaleString()} imp</span>
                      <Btn small onClick={() => openModal("placement", p)}>Edit</Btn>
                      <Btn small danger onClick={() => setPlacements(placements.filter(x => x.id !== p.id))}>End</Btn>
                    </div>
                  </div>
                ))}
                {placements.length === 0 && <div style={{ fontSize: 9, color: T.mt, padding: 8 }}>No active placements. Feature flag: promoted_placement must be ON.</div>}
              </Card>
            </div>
          )}
          {gt("rev") === "Commissions" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}><KPI l="Total Paid" v="Rs 16.1K" c={T.cy} /><KPI l="This Month" v="Rs 4.2K" /><KPI l="Structures" v={commissions.length} /></div>
                <Btn small primary onClick={() => openModal("commission_edit", {})}>+ Add Structure</Btn>
              </div>
              <Card t="Marketplace Commission Manager (Per-Category Tracking)">
                {commissions.map(cm => (
                  <div key={cm.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 35 }}>{cm.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{cm.category}</div>
                        <div style={{ fontSize: 8, color: T.sb }}>Rate: {cm.rate} | {cm.model} | Payout: {cm.payoutFreq} | Cap: {cm.cap}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: T.cy }}>{cm.totalPaid}</div>
                        <div style={{ fontSize: 7, color: T.mt }}>Last: {cm.lastPayout}</div>
                      </div>
                      <Btn small onClick={() => openModal("commission_edit", cm)}>Edit</Btn>
                      <Btn small onClick={() => setConfirm(`Process payout for "${cm.category}"?`)}>Pay</Btn>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {gt("rev") === "White-Label" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}><KPI l="Prospects" v={whiteLabels.length} c={T.am} /><KPI l="Potential ARR" v="Rs 2.4Cr" ai /><KPI l="Min Stores" v="10" /></div>
                <Btn small primary onClick={() => openModal("white_label", {})}>+ Add Client</Btn>
              </div>
              <Card t="White-Label Client Manager (Revenue Stream 6)">
                {whiteLabels.map(wl => (
                  <div key={wl.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{wl.client} <Badge s={wl.status === "proposal" ? "trial" : "planned"}>{wl.status}</Badge></div>
                        <div style={{ fontSize: 8, color: T.sb }}>{wl.stores} stores — {wl.plan} — Domain: {wl.domain}</div>
                        <div style={{ fontSize: 8, color: T.mt }}>Contact: {wl.contact} — Branding: {wl.branding}</div>
                      </div>
                      <Btn small onClick={() => openModal("white_label", wl)}>Edit</Btn>
                      <Btn small primary onClick={() => setConfirm(`Send proposal to ${wl.client}?`)}>Send Proposal</Btn>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      );

      case "bil": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Billing, Tax & Invoicing</h1><div style={{ display: "flex", gap: 4 }}><Btn small primary onClick={() => openModal("invoice")}>+ Generate Invoice</Btn></div></div>
          <Tabs items={["Overview","Invoices","Tax","SLA Credits","Annual","Subscriptions"]} active={gt("bil") || "Overview"} onChange={(v) => st("bil", v)} />
          {(gt("bil") || "Overview") === "Overview" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="MRR" v="Rs 65K" /><KPI l="Razorpay" v="96%" s="Success" /><KPI l="GST" v="Rs 11.7K" /><KPI l="Late" v="2" c={T.rd} /><KPI l="Credits" v="Rs 750" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Card t="MRR Waterfall"><ResponsiveContainer width="100%" height={130}><BarChart data={[{n:"Start",v:50},{n:"+New",v:20},{n:"+Exp",v:10},{n:"-Churn",v:-15},{n:"End",v:65}]}><XAxis dataKey="n" tick={{ fontSize: 8, fill: T.mt }} /><YAxis tick={{ fontSize: 8, fill: T.mt }} /><Tooltip {...TTP} /><Bar dataKey="v" radius={[2,2,0,0]}>{[T.cy,T.cy,T.bl,T.rd,T.cy].map((c, i) => (<Cell key={i} fill={c} />))}</Bar></BarChart></ResponsiveContainer></Card>
              <Card t="Late Payment Pipeline">{[["Day 15","Downgrade to Free Tier","Royal Weaves"],["Day 30","Mirror remotely disabled","---"],["Day 60+","Account suspended, data 90d","Mysore Silks"]].map(([d, a, s]) => (<Row key={d}><span style={{ width: 45, fontSize: 9, fontWeight: 600, color: d.includes("60") ? T.rd : T.am }}>{d}</span><span style={{ flex: 1, fontSize: 8, color: T.sb }}>{a}</span><span style={{ fontSize: 8, color: T.mt }}>{s}</span></Row>))}</Card>
            </div>
          </div>)}
          {gt("bil") === "Invoices" && (<div><div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}><Btn small primary onClick={() => openModal("invoice")}>+ Generate</Btn></div><Card t="GST Invoice Repository">{INVOICES.map(inv => (<Row key={inv.id}><span style={{ width: 55, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{inv.id}</span><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{inv.store}</span><span style={{ fontSize: 9, fontFamily: "monospace" }}>Rs {inv.amt.toLocaleString()}</span><span style={{ fontSize: 8, color: T.sb }}>+GST Rs {inv.gst.toLocaleString()}</span><span style={{ fontSize: 9, fontWeight: 600, fontFamily: "monospace", color: T.cy }}>Rs {inv.total.toLocaleString()}</span><Badge s={inv.st} /><span style={{ fontSize: 8, color: T.mt }}>{inv.dt}</span><Btn small onClick={() => openModal("invoice", inv)}>Edit</Btn><Btn small onClick={() => setConfirm(`Send invoice ${inv.id} reminder via WhatsApp?`)}>Send</Btn></Row>))}</Card></div>)}
          {gt("bil") === "Tax" && (<Card t="GST & Tax Compliance">{[["GSTR-3B March","Filed",T.cy],["GSTR-1 March","Filed",T.cy],["TDS Sec 195 Anthropic","Due",T.am],["TDS Sec 195 AWS","Filed",T.cy],["Reverse Charge GST","Applied 18%",T.cy],["Annual Reconciliation","Pending Sep 2026",T.am],["Service Credits Issued","Rs 750 (SLA breach)",T.cy]].map(([i, s, c]) => (<Row key={i}><span style={{ flex: 1, fontSize: 9 }}>{i}</span><span style={{ fontSize: 9, color: c, fontWeight: 600 }}>{s}</span><Btn small onClick={() => setConfirm(`Mark "${i}" as filed?`)}>Mark Filed</Btn></Row>))}</Card>)}
          {gt("bil") === "SLA Credits" && (<div>
            <Card t="SLA Compliance per Store">{STORES.filter(s => s.st === "active").map(s => (<Row key={s.id}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span><span style={{ fontSize: 8, color: T.cy }}>Uptime: 99.8%</span><span style={{ fontSize: 8, color: T.cy }}>SLA: met</span><span style={{ fontSize: 8, color: T.mt }}>Credits: Rs 0</span><Btn small onClick={() => setConfirm(`Issue SLA credit for ${s.n}?`)}>Issue Credit</Btn></Row>))}</Card>
            <Card t="Service Credit Calculator">{[["SLA Target","99.5% monthly uptime","216 min allowed downtime"],["Credit Formula","5% of monthly fee per 0.5% below target","Max 25% of monthly fee"],["Feb 2026 breach","ST-002 Silk Heritage: 98.9% (breach)","Credit: Rs 750 issued"],["Mar 2026 status","All stores above 99.5%","Rs 0 credits due"]].map(([l, d, n]) => (<Row key={l}><span style={{ fontSize: 9, fontWeight: 600, width: 100 }}>{l}</span><span style={{ flex: 1, fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></Row>))}</Card>
          </div>)}
          {gt("bil") === "Annual" && (<Card t="Annual Billing Discount Manager">{[["Monthly billing","Rs 15,000/mo (MRP)","5 stores","Standard"],["Annual billing (25% off)","Rs 11,250/mo effective","1 store (Silk Heritage)","Rs 1.35L/yr"],["Association bulk (30% off)","Rs 10,500/mo effective","1 store (Tant Bangla)","10+ stores in group"],["Early Adopter (40% off)","Rs 9,000/mo effective","1 store (MAUVE)","First 50 stores, 6mo"]].map(([p, pr, c, n]) => (<Row key={p}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{p}</span><span style={{ fontSize: 9, fontFamily: "monospace", color: T.cy }}>{pr}</span><span style={{ fontSize: 8, color: T.sb }}>{c}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></Row>))}</Card>)}
          {gt("bil") === "Subscriptions" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}><KPI l="Active Subs" v={subscriptions.length} c={T.cy} /><KPI l="MRR from Subs" v="Rs 1,396/mo" /><KPI l="Renewals" v="8 total" /></div>
                <Btn small primary onClick={() => openModal("subscription_edit", {})}>+ Add Subscription</Btn>
              </div>
              <Card t="Saree Care Subscription Manager (Revenue Stream 7)">
                {subscriptions.map(sub => (
                  <div key={sub.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 40 }}>{sub.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{sub.customer} <span style={{ fontSize: 8, color: T.sb }}>— {sub.store}</span></div>
                        <div style={{ fontSize: 8, color: T.sb }}>{sub.plan} — {sub.items} — Next billing: {sub.nextBilling}</div>
                      </div>
                      <Badge s={sub.status} /><span style={{ fontSize: 8, fontFamily: "monospace", color: T.mt }}>{sub.renewals} renewals</span>
                      <Btn small onClick={() => openModal("subscription_edit", sub)}>Edit</Btn>
                      <Btn small danger onClick={() => { setSubscriptions(subscriptions.filter(x => x.id !== sub.id)); setConfirm("Subscription cancelled. Confirmation sent to customer."); }}>Cancel</Btn>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      );

      case "net": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 12px" }}>Network Intelligence</h1>
          <Tabs items={["Overview","Regional","Benchmark","Manufacturer","Report Builder"]} active={gt("net") || "Overview"} onChange={(v) => st("net", v)} />
          {(gt("net") || "Overview") === "Overview" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Stores" v="8" /><KPI l="Live" v="12" ai /><KPI l="Fabric" v="Silk" s="+22%" ai /><KPI l="Color" v="Maroon" ai /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Card t="India Map"><div style={{ background: T.bg, borderRadius: 4, height: 170, position: "relative" }}>{[{ c: "Mumbai", x: 28, y: 52, s: 3 }, { c: "Delhi", x: 44, y: 18, s: 2 }, { c: "Chennai", x: 50, y: 78, s: 2 }, { c: "Varanasi", x: 55, y: 28, s: 1 }, { c: "Surat", x: 30, y: 43, s: 3 }, { c: "Kolkata", x: 70, y: 38, s: 2 }, { c: "Bangalore", x: 42, y: 72, s: 2 }, { c: "Jaipur", x: 36, y: 24, s: 1 }].map(p => (<div key={p.c} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}><div style={{ width: 4 + p.s * 4, height: 4 + p.s * 4, borderRadius: "50%", background: `${T.cy}66`, border: `1.5px solid ${T.cy}` }} /><div style={{ fontSize: 6, color: T.sb, marginTop: 1, textAlign: "center" }}>{p.c}</div></div>))}</div></Card>
              <Card t="Trending">{[["Pure Silk", "+22%"], ["Chiffon", "+15%"], ["Kanjivaram", "+18%"], ["Nivi Drape", "78%"], ["Maroon", "+30%"]].map(([f, t]) => (<Row key={f}><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{f}</span><span style={{ fontSize: 10, fontWeight: 600, color: T.cy, fontFamily: "monospace" }}>{t}</span></Row>))}</Card>
            </div>
          </div>)}
          {gt("net") === "Regional" && (<Card t="Regional Demand Heatmap">{[["West (Mumbai, Surat)", "Pure Silk, Paithani", "+25% demand", "Wedding + festival peak", T.cy], ["North (Delhi, Jaipur, Varanasi)", "Banarasi, Chanderi", "+18% demand", "Wedding season drive", T.cy], ["South (Chennai, Bangalore)", "Kanjivaram, Mysore Silk", "+22% demand", "Pongal aftermath", T.am], ["East (Kolkata)", "Tant, Jamdani, Baluchari", "+12% demand", "Growing market", T.am]].map(([r, f, d, n, c]) => (<div key={r} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{r}</span><span style={{ fontSize: 10, fontWeight: 600, color: c }}>{d}</span></div><div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>Top fabrics: {f} | {n}</div></div>))}</Card>)}
          {gt("net") === "Benchmark" && (<Card t="Network Benchmark (Anonymized, K=10)">{[["Avg sessions/store/day", "18.4", "Your best: Kanchi 31", "Network leader"], ["Avg conversion rate", "37%", "Your best: Kanchi 45%", "Above avg"], ["Avg catalog utilization", "78%", "Your best: Kanchi 95%", "Strong"], ["Avg feature adoption", "63/100", "Your best: Kanchi 88", "Room to grow"], ["Avg health score", "87%", "Your best: Kanchi 96%", "Healthy"]].map(([m, nv, yv, s]) => (<Row key={m}><span style={{ flex: 1, fontSize: 9 }}>{m}</span><span style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 600 }}>{nv}</span><span style={{ fontSize: 8, color: T.cy }}>{yv}</span><span style={{ fontSize: 7, color: T.mt }}>{s}</span></Row>))}</Card>)}
          {gt("net") === "Manufacturer" && (<div>
            <Card t="Manufacturer Intelligence (Revenue Stream 3 — AGT-08)">
              <div style={{ fontSize: 9, color: T.sb, marginBottom: 8, lineHeight: 1.4 }}>Phase 3 feature. Aggregated demand signals from the network (K-anonymized, min 10 stores per segment) sold to manufacturers at Rs 10-25K/quarter.</div>
              {[["Trending: Pure Silk demand +22% (wedding)","High confidence","Report ready when 50+ stores"],["Color shift: Maroon overtaking Red for weddings","Medium confidence","8 stores contributing data"],["Price sweet spot: Rs 3K-8K range growing fastest","High confidence","Cross-category signal"],["Regional: Kanjivaram demand stable in South, growing in North","Medium confidence","5 stores (min 10 needed)"]].map(([i, c, n]) => (<div key={i} style={{ padding: "5px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ fontSize: 9, color: T.tx }}>{i}</div><div style={{ display: "flex", gap: 8, marginTop: 2 }}><span style={{ fontSize: 7, color: T.pr }}>Conf: {c}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></div></div>))}
            </Card>
          </div>)}
          {gt("net") === "Report Builder" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}><KPI l="Reports Generated" v="3" /><KPI l="Subscribers" v="2" c={T.am} /><KPI l="Revenue" v="Rs 45K/qtr" c={T.cy} /></div>
                <Btn small primary onClick={() => openModal("mfr_report", {})}>+ Generate Report</Btn>
              </div>
              <Card t="Manufacturer Report Generator">
                {[{id:"MFR-001",title:"Q1 2026 Silk Demand Report",period:"Jan-Mar 2026",segments:["Pure Silk","Kanjivaram","Banarasi"],stores:8,status:"draft",buyer:"Pochampally Weavers Co-op",price:"Rs 15,000"},{id:"MFR-002",title:"Wedding Season Color Trends",period:"Nov 2025-Feb 2026",segments:["Color trends","Nivi drape","Price range"],stores:6,status:"sent",buyer:"Naturals Sarees Ltd.",price:"Rs 25,000"},{id:"MFR-003",title:"Festive Season Demand Spike",period:"Oct-Nov 2025",segments:["All categories"],stores:5,status:"paid",buyer:"Kanchipuram Silk Association",price:"Rs 10,000"}].map(rpt => (
                  <div key={rpt.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 55 }}>{rpt.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{rpt.title}</div>
                        <div style={{ fontSize: 8, color: T.sb }}>{rpt.period} — {rpt.stores} stores — Buyer: {rpt.buyer} — {rpt.price}</div>
                        <div style={{ fontSize: 7, color: T.mt }}>Segments: {rpt.segments.join(", ")}</div>
                      </div>
                      <Badge s={rpt.status === "paid" ? "active" : rpt.status === "sent" ? "trial" : "planned"}>{rpt.status}</Badge>
                      <Btn small onClick={() => openModal("mfr_report", rpt)}>Edit</Btn>
                      <Btn small primary onClick={() => setConfirm(`Send report "${rpt.title}" to ${rpt.buyer}?`)}>Send</Btn>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      );

      case "sup": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Support & AI Diagnosis</h1><Btn primary onClick={() => openModal("ticket")}>+ Create Ticket</Btn></div>
          <Tabs items={["Tickets", "Channels", "Knowledge", "NPS", "Check-Ins"]} active={gt("sup") || "Tickets"} onChange={(v) => st("sup", v)} />
          {(gt("sup") || "Tickets") === "Tickets" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Open" v="1" c={T.rd} /><KPI l="Progress" v="1" c={T.am} /><KPI l="Resolved" v="12" /><KPI l="MTTR" v="2.4h" /></div>
            <Card t="Tickets (AI Root Cause)">{TIKS.map(tk => (<div key={tk.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 3 }}><span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt }}>{tk.id}</span><Badge s={tk.pr} /><Badge s={tk.st === "progress" ? "progress" : tk.st} />{tk.sl !== "---" && <span style={{ fontSize: 8, color: T.rd }}>SLA: {tk.sl}</span>}</div><div style={{ fontSize: 11, fontWeight: 600 }}>{tk.sj}</div><div style={{ fontSize: 8, color: T.mt }}>{tk.sr}</div><div style={{ fontSize: 8, color: T.pr, padding: "4px 8px", background: T.prB, borderRadius: 3, marginTop: 4 }}>AI: {tk.ai}</div></div>))}</Card>
            <Card t="Escalation Matrix">{[["L1 Support", "30 min", "Restart, connectivity"], ["L2 Engineering", "1 hour", "VPN debug, reproduce"], ["L3 CTO", "Trigger", "Hardware, DPDP"], ["DPO", "Immediate", "Privacy incidents"]].map(([l, t, d]) => (<Row key={l}><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{l}</span><span style={{ fontSize: 9, color: T.am, fontFamily: "monospace" }}>{t}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span></Row>))}</Card>
          </div>)}
          {gt("sup") === "Channels" && (<Card t="Support Channel Health">{[["WhatsApp Support", "9AM-9PM IST, Mon-Sat", "<2h (P1), <4h (P2)", "Active", "Queue: 0"], ["In-App Help Widget", "24/7 (automated + queue)", "Instant (auto), <4h (human)", "Active", "Queue: 1"], ["Phone (P0/P1)", "24/7 for P0, 9AM-9PM P1", "<30 min", "Active", "On-call: Amit"], ["Email", "Business hours", "<24 hours", "Active", "Queue: 0"], ["Monthly Check-In", "Scheduled for Smart tier", "Proactive", "Active", "3 due this week"]].map(([c, h, s, st, q]) => (<div key={c} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{c}</span><Badge s="active">{st}</Badge></div><div style={{ display: "flex", gap: 12, marginTop: 2, fontSize: 8, color: T.sb }}><span>Hours: {h}</span><span>SLA: {s}</span><span style={{ color: T.mt }}>{q}</span></div></div>))}</Card>)}
          {gt("sup") === "Knowledge" && (<><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span/><Btn small primary onClick={() => openModal("kb", {})}>+ Add Article</Btn></div><Card t="Knowledge Base Articles">{kbList.map(kb => (<Row key={kb.id}><span style={{ width: 40, fontFamily: "monospace", fontSize: 8, color: T.mt }}>{kb.id}</span><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{kb.title}</span><Badge s="active">{kb.cat}</Badge><span style={{ fontSize: 8, color: T.sb }}>{kb.views} views</span><span style={{ fontSize: 8, color: T.cy }}>{kb.helpful}% helpful</span><Btn small onClick={() => openModal("kb", kb)}>Edit</Btn><Btn small danger onClick={() => { setKbList(kbList.filter(x => x.id !== kb.id)); setConfirm(`Article "${kb.title}" deleted.`); }}>Del</Btn></Row>))}</Card></>)}
          {gt("sup") === "NPS" && (<div><div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Current NPS" v="72" ai /><KPI l="Promoters" v="5" /><KPI l="Passives" v="2" /><KPI l="Detractors" v="0" /><KPI l="Response Rate" v="87%" /></div><Card t="NPS Trend">{[["Mar 2026", "72", "+2", "7 responses"], ["Feb 2026", "70", "+5", "6 responses"], ["Jan 2026", "65", "baseline", "5 responses"]].map(([m, s, d, r]) => (<Row key={m}><span style={{ flex: 1, fontSize: 9 }}>{m}</span><span style={{ fontSize: 12, fontWeight: 700, color: T.cy, fontFamily: "monospace" }}>{s}</span><span style={{ fontSize: 8, color: parseInt(d) > 0 ? T.cy : T.mt }}>{d}</span><span style={{ fontSize: 8, color: T.mt }}>{r}</span></Row>))}</Card></div>)}
          {gt("sup") === "Check-Ins" && (<Card t="Monthly Check-In Calls (Dukaan Smart)">{STORES.filter(s => s.pl === "Smart").map(s => (<Row key={s.id}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span><span style={{ fontSize: 8, color: T.sb }}>Last: Mar 7</span><Badge s="pending">Next: Apr 7</Badge><span style={{ fontSize: 7, color: T.mt }}>Notes: Usage healthy, requested voice search</span></Row>))}</Card>)}
        </div>
      );

      case "leg": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 12px" }}>Legal, Contracts & IP</h1>
          <Tabs items={["Agreements", "Doc Repository", "Customer Terms", "AUP & Terms", "IP", "Regulatory", "Disputes"]} active={gt("leg") || "Agreements"} onChange={(v) => st("leg", v)} />
          {(gt("leg") || "Agreements") === "Agreements" && (<Card t="Agreement Status">{STORES.map(s => (<Row key={s.id}><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{s.n}</span><Badge s={s.ag} />{["MSA", "DPA", "AUP", "HW", "SLA"].map(d => (<span key={d} style={{ fontSize: 7, padding: "1px 4px", borderRadius: 2, background: s.ag === "signed" ? T.cyB : s.ag === "terminated" ? T.rdB : T.amB, color: s.ag === "signed" ? T.cy : s.ag === "terminated" ? T.rd : T.am }}>{d}</span>))}</Row>))}</Card>)}
          {gt("leg") === "Doc Repository" && (<div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div><div style={{ fontSize: 11, fontWeight: 700, color: T.tx }}>Legal Document Repository</div><div style={{ fontSize: 8, color: T.sb }}>Master templates uploaded here are presented to retailers during onboarding (Step 3). Version-controlled with audit trail.</div></div>
              <Btn primary onClick={() => openModal("legal_doc", {})}>+ Upload Document</Btn>
            </div>
            <Card t="Retailer-Facing Agreements (Presented at Onboarding Step 3)">
              {legalDocs.filter(d => d.type === "retailer").map(d => (
                <div key={d.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 7, color: T.mt, width: 45 }}>{d.id}</span>
                    <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{d.name}</span>
                    <Badge s={d.status}>{d.status}</Badge>
                    <span style={{ fontSize: 8, fontFamily: "monospace", color: T.cy }}>{d.ver}</span>
                    <Btn small onClick={() => openModal("legal_doc", d)}>Edit</Btn>
                    <Btn small>View PDF</Btn>
                  </div>
                  <div style={{ fontSize: 8, color: T.sb, marginTop: 2, marginLeft: 51 }}>{d.desc}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 7, color: T.mt, marginTop: 2, marginLeft: 51 }}>
                    <span>File: {d.file}</span><span>Uploaded: {d.uploaded}</span><span>Effective: {d.effective}</span><span>Accepted by: {d.acceptedBy} stores</span>
                  </div>
                </div>
              ))}
            </Card>
            <div style={{ fontSize: 8, color: T.sb, padding: "8px 12px", background: T.bg, borderRadius: 4, lineHeight: 1.5, marginTop: 4 }}>
              When you upload a new version of an agreement, existing stores on the old version will be prompted to re-accept on their next dashboard login. New onboarding flows automatically use the latest active version. Archived versions are retained for legal reference but not presented to new stores.
            </div>
          </div>)}
          {gt("leg") === "Customer Terms" && (<div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div><div style={{ fontSize: 11, fontWeight: 700, color: T.tx }}>Customer-Facing Legal Documents</div><div style={{ fontSize: 8, color: T.sb }}>Documents shown to end customers on Mirror screen, Tablet, and PWA. Consent captured before interaction begins.</div></div>
              <Btn primary onClick={() => openModal("legal_doc", { type: "customer" })}>+ Upload Document</Btn>
            </div>
            <Card t="Documents Shown on Smart Mirror (Before Try-On)">
              {legalDocs.filter(d => d.type === "customer" && (d.name.includes("Mirror") || d.name.includes("Camera"))).map(d => (
                <div key={d.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{d.name}</span>
                    <Badge s={d.status} /><span style={{ fontSize: 8, fontFamily: "monospace", color: T.cy }}>{d.ver}</span>
                    <Btn small onClick={() => openModal("legal_doc", d)}>Edit</Btn><Btn small>Preview</Btn>
                  </div>
                  <div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{d.desc}</div>
                </div>
              ))}
            </Card>
            <Card t="Documents Shown on WhatsApp / PWA">
              {legalDocs.filter(d => d.type === "customer" && (d.name.includes("WhatsApp") || d.name.includes("Privacy") || d.name.includes("Deletion"))).map(d => (
                <div key={d.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{d.name}</span>
                    <Badge s={d.status} /><span style={{ fontSize: 8, fontFamily: "monospace", color: T.cy }}>{d.ver}</span>
                    <Btn small onClick={() => openModal("legal_doc", d)}>Edit</Btn><Btn small>Preview</Btn>
                  </div>
                  <div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{d.desc}</div>
                </div>
              ))}
            </Card>
            <Card t="Consent Capture Flow (How It Works)">
              {[["Mirror Session Start", "Customer stands in front of mirror. Camera Consent + Mirror ToU shown as overlay. Customer taps 'I Agree' or nods. Session begins only after consent.", "Mandatory"], ["WhatsApp Share", "After try-on, customer enters phone. WhatsApp Opt-in terms shown. Customer checks box before share.", "Mandatory"], ["PWA Registration", "When customer registers on PWA. Privacy Policy + Terms shown. Accept checkbox required.", "Mandatory"], ["Marketing Campaigns", "WhatsApp campaign opt-in captured during first interaction. Can opt-out anytime via 'STOP' keyword.", "Opt-in"], ["Data Deletion", "Customer can request deletion via PWA, WhatsApp, or in-store. Form template (LD-010) used. 72h SLA.", "On request"]].map(([t, d, r]) => (
                <div key={t} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{t}</span><Badge s={r === "Mandatory" ? "P1" : r === "Opt-in" ? "trial" : "active"}>{r}</Badge></div>
                  <div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </Card>
          </div>)}
          {gt("leg") === "AUP & Terms" && (<div>
            <Card t="AUP Violation Tracker">{[["Data abuse (fake inventory)", "0 incidents", "Warning -> Suspension -> Termination"], ["Customer harassment (spam)", "0 incidents", "Immediate campaign suspension"], ["System abuse (reverse-engineering)", "0 incidents", "Immediate suspension"], ["IP violation", "0 incidents", "Termination + legal action"]].map(([v, c, p]) => (<Row key={v}><span style={{ flex: 1, fontSize: 9 }}>{v}</span><span style={{ fontSize: 9, color: T.cy }}>{c}</span><span style={{ fontSize: 7, color: T.mt }}>{p}</span></Row>))}</Card>
            <Card t="Termination Workflow">{[["Retailer-initiated", "30d notice, pro-rata refund", "0 active"], ["Company for-cause", "Immediate (AUP breach, 60d non-payment)", "1 (Mysore Silks)"], ["Company without-cause", "90d notice + pro-rata refund", "0 active"], ["Post-termination", "30d data export -> 15d hardware retrieval -> 90d delete", "Standard"]].map(([t, d, s]) => (<Row key={t}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{t}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 8, color: T.mt }}>{s}</span></Row>))}</Card>
            <Card t="Hardware Rental Tracker">{[["Smart Mirror x4", "Company property", "3 active + 1 offline", "Replace cost: Rs 1-1.5L each"], ["Tablet x2", "Company property", "2 active", "Replace cost: Rs 15K each"], ["Photo Booth Kit x5", "Company property", "5 deployed", "Replace cost: Rs 10K each"]].map(([h, o, s, c]) => (<Row key={h}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{h}</span><span style={{ fontSize: 8, color: T.sb }}>{o}</span><span style={{ fontSize: 8, color: T.mt }}>{s}</span><span style={{ fontSize: 7, color: T.am }}>{c}</span></Row>))}</Card>
          </div>)}
          {gt("leg") === "IP" && (<Card t="IP Portfolio">{[["PAT-01", "Virtual Try-On Method", "Filed Mar 2026"], ["PAT-02", "Edge AI Draping Algorithm", "Draft Q2 2026"], ["TM-01", "Wearify Trademark", "Filed Feb 2026"], ["TM-02", "PhygiFyt Trademark", "Filed Feb 2026"]].map(([id, n, s]) => (<Row key={id}><span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 40 }}>{id}</span><span style={{ flex: 1, fontSize: 9 }}>{n}</span><Badge s={s.includes("Filed") ? "active" : "trial"}>{s}</Badge></Row>))}</Card>)}
          {gt("leg") === "Regulatory" && (<div>
            <Card t="Regulatory Compliance Calendar">{[["FEMA FC-GPR", "30 days from allotment", "N/A (no foreign investment yet)", "---"], ["FLA Return", "July 15 annually", "N/A yet", "---"], ["DPIIT Recognition", "Immediate", "Applied", T.cy], ["GST Filing GSTR-3B", "20th monthly", "March filed", T.cy], ["TDS 195 (Foreign)", "Quarterly", "Q4 due", T.am], ["CERT-In Reporting", "6 hours (if breach)", "No incidents", T.cy], ["DPDP Compliance", "Ongoing", "0 violations", T.cy], ["Companies Act Annual", "Sept 30 AGM", "Due Sep 2026", T.am]].map(([r, d, s, c]) => (<Row key={r}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{r}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 8, color: c || T.mt }}>{s}</span></Row>))}</Card>
          </div>)}
          {gt("leg") === "Disputes" && (<div>
            <Card t="Dispute Resolution Tracker">{[["No active disputes", "---", "---", "---"]].map(([s, st, t, n]) => (<Row key={s}><span style={{ flex: 1, fontSize: 9 }}>{s}</span></Row>))}</Card>
            <Card t="Dispute Resolution Process (Doc 30, Section 9)">{[["Step 1: Escalation", "Good-faith negotiation between designated reps", "14 days"], ["Step 2: Mediation", "Under Mediation Act 2023, mutual mediator", "30 days"], ["Step 3: Arbitration", "Binding, under A&C Act 1996, Bengaluru seat", "90 days"], ["Governing Law", "Laws of India, Bengaluru courts jurisdiction", "---"], ["Injunctive Relief", "Available for IP/confidentiality without mediation", "Immediate"]].map(([s, d, t]) => (<Row key={s}><span style={{ fontSize: 9, fontWeight: 600, width: 100 }}>{s}</span><span style={{ flex: 1, fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 8, color: T.mt }}>{t}</span></Row>))}</Card>
            <Card t="Indemnification Claims Log">{[["Company indemnifies Retailer", "Third-party IP infringement claims", "0 claims", T.cy], ["Retailer indemnifies Company", "Counterfeit goods, DPDP violations, AUP breach", "0 claims", T.cy]].map(([p, d, c, cl]) => (<Row key={p}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{p}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 8, color: cl }}>{c}</span></Row>))}</Card>
            <Card t="Confidentiality Breach Log">{[["No breaches reported", "NDA monitoring active for all 12 team members", "Last audit: Mar 1, 2026"]].map(([s, d, l]) => (<Row key={s}><span style={{ flex: 1, fontSize: 9 }}>{s}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><span style={{ fontSize: 7, color: T.cy }}>{l}</span></Row>))}</Card>
          </div>)}
        </div>
      );

      case "sec": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Security & Access</h1><div style={{ display: "flex", gap: 4 }}><Btn small primary onClick={() => openModal("user")}>+ User</Btn><Btn small primary onClick={() => openModal("api_key")}>+ API Key</Btn></div></div>
          <Tabs items={["Overview","CERT-In","Network Sec","Sessions","Role Events"]} active={gt("sec") || "Overview"} onChange={(v) => st("sec", v)} />
          {(gt("sec") || "Overview") === "Overview" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Failed Login" v="0" /><KPI l="Sessions" v="2" /><KPI l="2FA" v="100%" /><KPI l="API Keys" v="4" /><KPI l="VAPT" v="Passed" /></div>
            <Card t="API Keys">{[["svc-whatsapp","Jun 26","2h"],["svc-razorpay","Apr 26","45m"],["svc-iot-mqtt","May 26","5m"],["svc-anthropic","Jun 26","12m"]].map(([n, e, l]) => (<Row key={n}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{n}</span><span style={{ fontSize: 8, color: e.includes("Apr") ? T.am : T.sb }}>Exp: {e}</span><span style={{ fontSize: 8, color: T.mt }}>Used: {l} ago</span><Btn small onClick={() => setConfirm(`Rotate key "${n}"? Old key invalidated immediately.`)}>Rotate</Btn><Btn small danger onClick={() => setConfirm(`Revoke "${n}"? This will break all integrations using this key.`)}>Revoke</Btn></Row>))}</Card>
            <Card t="RBAC (7 Roles)">{["R01 Super Admin: Full access all","R02 Support: Read store + tickets","R03 Owner: Full store + billing","R04 Manager: Dashboard (no billing)","R05 Salesperson: Tablet + mirror (shift)","R06 Customer Auth: Mirror + WhatsApp","R07 Customer Anon: Mirror only"].map(r => (<div key={r} style={{ display: "flex", alignItems: "center", padding: "3px 0", borderBottom: `1px solid ${T.bd}`, fontSize: 9, color: T.sb }}><span style={{ flex: 1 }}>{r}</span><Btn small onClick={() => openModal("user", {role: r.split(" ")[0]})}>+ User</Btn></div>))}</Card>
          </div>)}
          {gt("sec") === "CERT-In" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Active Incidents" v="0" /><KPI l="Report Window" v="6 hours" s="Mandatory" /><KPI l="Last Drill" v="Feb 15" /><KPI l="Contacts" v="CTO, DPO, Legal" /></div>
            <Card t="Incident History">{INCIDENTS.map(inc => (<div key={inc.id} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", gap: 4, marginBottom: 2 }}><span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt }}>{inc.id}</span><Badge s={inc.sev} /><Badge s={inc.status} /></div><div style={{ fontSize: 10, fontWeight: 600 }}>{inc.title}</div><div style={{ fontSize: 8, color: T.sb }}>{inc.start} to {inc.end} ({inc.dur}) - {inc.stores} stores - Root: {inc.root}</div></div>))}</Card>
            <Card t="Post-Mortem Repository">{INCIDENTS.map(inc => (<Row key={inc.id}><span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt }}>{inc.id}</span><span style={{ flex: 1, fontSize: 9 }}>{inc.title}</span><span style={{ fontSize: 8, color: T.sb }}>Root: {inc.root}</span><span style={{ fontSize: 8, color: T.cy }}>Action items: 2 completed</span></Row>))}</Card>
          </div>)}
          {gt("sec") === "Network Sec" && (<Card t="Network Security Status">{[["WPA3 Enterprise","All stores","Enforced on store WiFi",T.cy],["VLAN Isolation","Mirror + Tablet on separate VLAN","All stores configured",T.cy],["Mutual TLS (mTLS)","All MQTT IoT Core connections","X.509 per device",T.cy],["Tamper Detection","Enclosure tamper switches","0 alerts",T.cy],["IP Allowlist (Admin)","Admin panel restricted","Office IPs only",T.cy],["DDoS Protection","AWS WAF + Shield","Standard tier active",T.cy]].map(([f, s, d, c]) => (<Row key={f}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{f}</span><span style={{ fontSize: 8, color: T.sb }}>{s}</span><span style={{ fontSize: 8, color: c }}>{d}</span></Row>))}</Card>)}
          {gt("sec") === "Sessions" && (<div>
            <Card t="Live Sessions (Anonymized)">{SESSIONS.map(s => (<Row key={s.id}><span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt }}>{s.id}</span><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.store}</span><span style={{ fontSize: 8, color: T.sb }}>Staff: {s.staff}</span><span style={{ fontSize: 8, color: T.sb }}>{s.mirror}</span><span style={{ fontSize: 8, fontFamily: "monospace" }}>{s.dur}</span><span style={{ fontSize: 8 }}>{s.sarees} sarees</span><Badge s={s.status === "active" ? "running" : "resolved"}>{s.status}</Badge><Btn small danger onClick={() => setConfirm(`Force-end session ${s.id}?`)}>End</Btn></Row>))}</Card>
            <Card t="Anomaly Detection">{[["No anomalies detected in last 24h","ML-based pattern analysis",T.cy],["Off-hours activity","0 sessions outside 10AM-9PM",T.cy],["Unusual session volume","All stores within 2 std dev",T.cy],["Failed auth attempts","0 brute-force patterns",T.cy]].map(([a, d, c]) => (<Row key={a}><span style={{ flex: 1, fontSize: 9 }}>{a}</span><span style={{ fontSize: 8, color: T.sb }}>{d}</span><span style={{ color: c, fontSize: 9 }}>OK</span></Row>))}</Card>
          </div>)}
          {gt("sec") === "Role Events" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8 }}><KPI l="Role Changes" v={roleEvents.length} /><KPI l="This Month" v="4" c={T.cy} /><KPI l="Pending Approval" v="0" /></div>
                <Btn small primary onClick={() => openModal("role_event", {})}>+ Log Event</Btn>
              </div>
              <Card t="Role Lifecycle Events (Change History)">
                {roleEvents.map(ev => (
                  <div key={ev.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 55 }}>{ev.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{ev.user}</div>
                        <div style={{ fontSize: 8, color: T.sb }}>
                          <span style={{ color: T.rd }}>{ev.from}</span>
                          {" → "}
                          <span style={{ color: T.cy }}>{ev.to}</span>
                          {" — "}{ev.reason}
                        </div>
                        <div style={{ fontSize: 7, color: T.mt }}>Approved by: {ev.by} — {ev.date}</div>
                      </div>
                      <Badge s={ev.approved ? "active" : "pending"}>{ev.approved ? "Approved" : "Pending"}</Badge>
                      <Btn small onClick={() => openModal("role_event", ev)}>Edit</Btn>
                      <Btn small danger onClick={() => setRoleEvents(roleEvents.filter(x => x.id !== ev.id))}>Del</Btn>
                    </div>
                  </div>
                ))}
              </Card>
              <Card t="Daily Active Stores Tracker">
                <div style={{ marginBottom: 8, fontSize: 9, color: T.sb }}>Stores that had at least one session in the past 24 hours.</div>
                {STORES.filter(s => s.st !== "churned").map(s => (
                  <Row key={s.id}>
                    <span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span>
                    <Badge s={s.st === "active" && s.hp > 70 ? "active" : "pending"}>{s.st === "active" && s.hp > 70 ? "Active Today" : "No Activity"}</Badge>
                    <span style={{ fontSize: 8, color: T.sb }}>{s.ss} sessions</span>
                    <span style={{ fontSize: 8, color: T.cy }}>{s.cv}% conv rate</span>
                  </Row>
                ))}
              </Card>
            </div>
          )}
        </div>
      );

      case "dgv": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Data Governance & CV Privacy</h1>
            <div style={{ display: "flex", gap: 4 }}>
              {gt("dgv") === "Retention" && <Btn small primary onClick={() => openModal("retention_edit", {})}>+ Add Policy</Btn>}
            </div>
          </div>
          <Tabs items={["Camera & CV","Retention","Consent","Classification","Masking","Archival","Data Residency","Governance"]} active={gt("dgv") || "Camera & CV"} onChange={(v) => st("dgv", v)} />
          {(gt("dgv") || "Camera & CV") === "Camera & CV" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Consent" v="94.2%" /><KPI l="Deletions" v="3" s="<72h" /><KPI l="Violations" v="0" /><KPI l="Camera" v="100%" s="Zero-storage" /></div>
            <Card t="Camera Zero-Storage Invariant">{[["Camera frames","GPU memory ONLY — never disk, never cloud"],["GPU purge","Session end + 15min idle"],["Try-on images","Temp S3 WhatsApp — 30d delete"],["CV model I/O","Input: frames → Output: overlays. No PII leaks."],["Secure Boot","UEFI verified every startup"],["TLS 1.3","All cloud + mTLS for MQTT"],["AES-256","RDS, S3, ElastiCache, Pinecone"]].map(([l, d]) => (<Row key={l}><span style={{ color: T.cy, fontSize: 9 }}>✓</span><span style={{ fontSize: 9, fontWeight: 600, width: 100 }}>{l}</span><span style={{ fontSize: 8, color: T.sb, flex: 1 }}>{d}</span></Row>))}</Card>
          </div>)}
          {gt("dgv") === "Retention" && (
            <Card t="Data Retention Policies (Editable)">
              {retentionPolicies.map(rp => (
                <div key={rp.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{rp.category}</div>
                    <div style={{ fontSize: 8, color: T.sb }}>Retention: {rp.retention} | Action: {rp.deletion} | Law: {rp.law}</div>
                  </div>
                  <Btn small onClick={() => openModal("retention_edit", rp)}>Edit</Btn>
                  <Btn small danger onClick={() => setRetentionPolicies(retentionPolicies.filter(x => x.id !== rp.id))}>Del</Btn>
                </div>
              ))}
            </Card>
          )}
          {gt("dgv") === "Consent" && (<div>
            <Card t="Consent Registry (Platform-Wide)">{[["Total customers (opted-in)","1,247","Across all stores"],["CRM consent","94.2%","Profile + purchase history"],["Marketing consent","78.5%","WhatsApp campaigns"],["Analytics consent","91.0%","Session behavior tracking"],["Opt-outs this month","3","Marketing only"]].map(([l, v, d]) => (<Row key={l}><span style={{ flex: 1, fontSize: 9 }}>{l}</span><span style={{ fontSize: 10, fontWeight: 600, fontFamily: "monospace" }}>{v}</span><span style={{ fontSize: 8, color: T.mt }}>{d}</span></Row>))}</Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span/><Btn small primary onClick={() => openModal("deletion")}>+ Process Request</Btn></div>
            <Card t="Deletion Request Log">{[["C-4421","Full PII erasure","Completed 48h","Cascade: profile+prefs+interactions"],["C-3892","Marketing opt-out","Completed 2h","consent_type=marketing revoked"],["C-5103","Full account","Processing","30d cooling -> hard delete"]].map(([id, tp, st, dt]) => (<Row key={id}><span style={{ fontFamily: "monospace", fontSize: 8 }}>{id}</span><span style={{ fontSize: 8, color: T.sb }}>{tp}</span><Badge s={st.includes("Completed") ? "resolved" : "progress"}>{st}</Badge><span style={{ fontSize: 7, color: T.mt }}>{dt}</span></Row>))}</Card>
          </div>)}
          {gt("dgv") === "Classification" && (<Card t="Data Classification (4 Tiers)">{[["Tier 1 — PII","Customer phone, name","AES encrypted (KMS)","DPDP regulated"],["Tier 2 — Business","Transactions, inventory","AES-256 at rest","Store-scoped RLS"],["Tier 3 — Non-sensitive","Catalog images, tags","Standard encryption","Public within store"],["Tier 4 — Anonymized","Analytics, trends","K-anonymized","Network-wide safe"]].map(([t, d, e, n]) => (<div key={t} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ fontSize: 10, fontWeight: 600, color: T.tx }}>{t}</div><div style={{ fontSize: 8, color: T.sb }}>{d}</div><div style={{ display: "flex", gap: 8, marginTop: 2 }}><span style={{ fontSize: 7, color: T.cy }}>{e}</span><span style={{ fontSize: 7, color: T.mt }}>{n}</span></div></div>))}</Card>)}
          {gt("dgv") === "Masking" && (<Card t="Non-Production Data Masking Verification">{[["Customer phones","Replaced with fake (same format, invalid prefix)","Verified Q1 2026",T.cy],["Customer names","Random names (matching language distribution)","Verified Q1 2026",T.cy],["Transaction amounts","Randomised within +/-20%","Verified Q1 2026",T.cy],["Store names/addresses","Fictional equivalents","Verified Q1 2026",T.cy],["Staging environment","NEVER contains real PII","DPO audit: passed",T.cy],["Dev environment","Docker Compose with synthetic data only","Verified",T.cy]].map(([r, m, v, c]) => (<Row key={r}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{r}</span><span style={{ fontSize: 8, color: T.sb }}>{m}</span><span style={{ fontSize: 8, color: c }}>{v}</span></Row>))}</Card>)}
          {gt("dgv") === "Archival" && (<Card t="Data Archival Status">{[["Interaction logs (>12mo)","S3 Glacier Deep Archive","Last run: Mar 1","2,400 records archived",T.cy],["Session telemetry (>90d)","S3 Glacier","Last run: Mar 1","18,500 events",T.cy],["API logs (>90d)","S3 Glacier","Continuous lifecycle","Auto-managed",T.cy],["Old model artifacts","S3 Glacier (>6mo versions)","Last run: Feb 15","3 old versions",T.cy],["PostgreSQL partitions","Pruned monthly (1st, 3AM)","Last run: Mar 1","2 partitions dropped",T.cy],["Terraform state versions","S3 versioning (90d)","Auto-managed","12 versions retained",T.cy]].map(([d, t, l, n, c]) => (<Row key={d}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{d}</span><span style={{ fontSize: 8, color: T.sb }}>{t}</span><span style={{ fontSize: 7, color: T.mt }}>{l}</span><span style={{ fontSize: 7, color: c }}>{n}</span></Row>))}</Card>)}
          {gt("dgv") === "Data Residency" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Primary Region" v="ap-south-1" s="Mumbai" /><KPI l="DR Region" v="ap-south-2" s="Hyderabad" /><KPI l="Data Leaves India" v="Never" c={T.cy} /><KPI l="Compliance" v="DPDP 2023" c={T.cy} /></div>
              <Card t="Data Residency Verification Dashboard">
                {[{svc:"RDS PostgreSQL",region:"ap-south-1 Mumbai",replication:"ap-south-2 Hyderabad (read replica)",crossBorder:"No",verified:"Mar 1",status:"verified"},{svc:"S3 Catalog Images",region:"ap-south-1 Mumbai",replication:"ap-south-2 cross-region",crossBorder:"No",verified:"Mar 1",status:"verified"},{svc:"ElastiCache Redis",region:"ap-south-1 Mumbai",replication:"None (session data, ephemeral)",crossBorder:"No",verified:"Mar 1",status:"verified"},{svc:"Anthropic Claude API",region:"US (Anthropic infrastructure)",replication:"N/A",crossBorder:"Yes — prompt only, no PII",verified:"Feb 28",status:"conditional"},{svc:"Gupshup WhatsApp",region:"India PoP (Mumbai CDN)",replication:"WhatsApp global infra",crossBorder:"Phone numbers only",verified:"Feb 28",status:"conditional"},{svc:"IoT Core MQTT",region:"ap-south-1 Mumbai",replication:"None",crossBorder:"No",verified:"Mar 1",status:"verified"}].map(item => (
                  <div key={item.svc} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{item.svc}</span>
                      <Badge s={item.status === "verified" ? "active" : "trial"}>{item.status}</Badge>
                      <Btn small onClick={() => setConfirm(`Re-verify data residency for ${item.svc}?`)}>Re-Verify</Btn>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 8, color: T.sb, marginTop: 3 }}>
                      <span>Region: {item.region}</span>
                      <span style={{ color: item.crossBorder === "No" ? T.cy : T.am }}>Cross-border: {item.crossBorder}</span>
                      <span>Last verified: {item.verified}</span>
                    </div>
                  </div>
                ))}
              </Card>
              <Card t="DPDP Act 2023 — Data Localisation Controls">
                {[["Customer PII","Stored only in India (RDS ap-south-1)","Never leaves India","Compliant"],["Behavioral data","S3 ap-south-1 + ap-south-2 DR","India only","Compliant"],["Biometric-adjacent (pose data)","GPU VRAM only — never persisted","Zero-storage invariant","Compliant"],["Consent records","RDS ap-south-1 indefinite","India only","Compliant"],["LLM prompts (AGT-**)","Sent to Anthropic US — no PII in prompts","DPO verified Feb 2026","Conditional OK"]].map(([cat, loc, policy, status]) => (
                  <Row key={cat}><span style={{ width: 140, fontSize: 9, fontWeight: 600 }}>{cat}</span><span style={{ flex: 1, fontSize: 8, color: T.sb }}>{loc}</span><span style={{ fontSize: 7, color: T.mt, width: 100 }}>{policy}</span><Badge s={status === "Compliant" ? "active" : "trial"}>{status}</Badge></Row>
                ))}
              </Card>
            </div>
          )}
          {gt("dgv") === "Governance" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Open Items" v="2" c={T.am} /><KPI l="Controls" v="18" c={T.cy} /><KPI l="Last Audit" v="Mar 1" /><KPI l="DPO" v="Saurav S." /></div>
              <Card t="Production Data Governance Controls">
                {[{id:"DGC-01",control:"Row-Level Security (RLS)",desc:"PostgreSQL RLS ensures store_id isolation — no cross-store data leakage",status:"active",lastAudit:"Mar 1",owner:"Engineering"},{id:"DGC-02",control:"PII Field Encryption (KMS)",desc:"customer_phone, customer_name encrypted at column level using AWS KMS",status:"active",lastAudit:"Mar 1",owner:"Engineering"},{id:"DGC-03",control:"Consent Gate",desc:"All customer data writes blocked without valid consent record",status:"active",lastAudit:"Feb 28",owner:"Product"},{id:"DGC-04",control:"72h Deletion SLA",desc:"Automated pipeline: consent revocation → cascade delete → DPO notification",status:"active",lastAudit:"Mar 1",owner:"Engineering"},{id:"DGC-05",control:"Audit Trail Immutability",desc:"All data access/modification events logged to append-only CloudWatch",status:"active",lastAudit:"Feb 15",owner:"Engineering"},{id:"DGC-06",control:"LLM Prompt PII Scrubbing",desc:"Regex + NER pass removes phone/name before any prompt sent to Anthropic",status:"review",lastAudit:"Feb 28",owner:"AI Team"},{id:"DGC-07",control:"Data Classification Labels",desc:"4-tier labels applied at table/column level in schema documentation",status:"active",lastAudit:"Feb 28",owner:"DPO"},{id:"DGC-08",control:"Third-Party DPA Verification",desc:"All vendors with data access have signed DPA on file",status:"review",lastAudit:"Feb 20",owner:"Legal"}].map(ctrl => (
                  <div key={ctrl.id} style={{ padding: "8px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: T.mt, width: 50 }}>{ctrl.id}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>{ctrl.control}</div>
                        <div style={{ fontSize: 8, color: T.sb }}>{ctrl.desc}</div>
                      </div>
                      <Badge s={ctrl.status === "active" ? "active" : "review"}>{ctrl.status}</Badge>
                      <span style={{ fontSize: 7, color: T.mt, width: 60 }}>Audited: {ctrl.lastAudit}</span>
                      <Btn small onClick={() => setConfirm(`Mark DGC control "${ctrl.control}" as audited?`)}>Audit</Btn>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      );

      case "vnd": return (<div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Vendor & Infrastructure</h1><Btn small primary onClick={() => openModal("vendor")}>+ Add Vendor</Btn></div>
        <Tabs items={["Vendors", "Webhooks", "DLQ Monitor"]} active={gt("vnd") || "Vendors"} onChange={(v) => st("vnd", v)} />
        {(gt("vnd") || "Vendors") === "Vendors" && (<Card t="Vendor Registry">{vendorList.map(v => (<Row key={v.nm}><span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{v.nm} <span style={{ fontWeight: 400, color: T.sb, fontSize: 9 }}>({v.tp})</span></span><Badge s={v.dp === "Signed" ? "signed" : "pending"}>DPA: {v.dp}</Badge><Badge s={v.rk === "Low" ? "ok" : "review"}>Risk: {v.rk}</Badge><span style={{ fontSize: 9, fontFamily: "monospace" }}>Rs {v.sp.toLocaleString()}/mo</span><Btn small onClick={() => openModal("vendor", v)}>Edit</Btn><Btn small danger onClick={() => { setVendorList(vendorList.filter(x => x.nm !== v.nm)); setConfirm(`Vendor ${v.nm} removed.`); }}>Del</Btn></Row>))}</Card>)}
        {gt("vnd") === "Webhooks" && (<Card t="Webhook Health Monitor">{[["Gupshup (WhatsApp)", "HMAC-SHA256", "99.2% delivery", "Last: 12m ago", "Healthy"], ["Razorpay (Payments)", "SHA256 signature", "100% delivery", "Last: 45m ago", "Healthy"], ["MSG91 (SMS)", "API key header", "98.8% delivery", "Last: 2h ago", "Healthy"]].map(([p, a, d, l, s]) => (<div key={p} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{p}</span><Badge s={s === "Healthy" ? "active" : "review"}>{s}</Badge></div><div style={{ display: "flex", gap: 10, fontSize: 8, color: T.sb, marginTop: 2 }}><span>Auth: {a}</span><span>Rate: {d}</span><span style={{ color: T.mt }}>{l}</span></div></div>))}</Card>)}
        {gt("vnd") === "DLQ Monitor" && (<Card t="Dead Letter Queue Monitor">{[["wearify-auto-tag", "0", "Exp. backoff (1s-10min)", "Clear", "Manual re-drive"], ["wearify-campaign-dispatch", "0", "Fixed (5min-60min)", "Clear", "SMS fallback"], ["wearify-erasure-pipeline", "0", "Fixed (1min-30min)", "Clear (DPDP critical)", "CTO escalation"], ["MQTT device messages", "0", "QoS 1 redeliver", "Clear", "Edge queues locally"]].map(([q, d, r, s, a]) => (<Row key={q}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{q}</span><span style={{ fontSize: 10, fontWeight: 700, color: d === "0" ? T.cy : T.rd }}>{d}</span><span style={{ fontSize: 7, color: T.sb }}>{r}</span><Badge s={s.includes("Clear") ? "active" : "P1"}>{s}</Badge><span style={{ fontSize: 7, color: T.mt }}>{a}</span></Row>))}</Card>)}
      </div>);

      case "aud": return (<div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Audit Trail & Communications</h1><Btn small primary onClick={() => openModal("broadcast")}>+ Broadcast</Btn></div>
        <Tabs items={["Audit Log", "Broadcast", "Store Comms"]} active={gt("aud") || "Audit Log"} onChange={(v) => st("aud", v)} />
        {(gt("aud") || "Audit Log") === "Audit Log" && (<Card t="Immutable Audit Trail">{AUDT.map((a, i) => (<Row key={i}><span style={{ width: 35, fontSize: 8, color: T.mt, fontFamily: "monospace" }}>{a.t}</span><span style={{ flex: 1, fontSize: 9 }}>{a.a}</span><span style={{ fontSize: 8, color: T.mt, fontFamily: "monospace" }}>{a.u}</span></Row>))}</Card>)}
        {gt("aud") === "Broadcast" && (<Card t="Broadcast Messaging (Platform-Wide)">{[["v2.3 Release Announcement", "All stores", "Mar 12", "Delivered to 6 stores"], ["Scheduled Maintenance Notice", "All stores", "Mar 13", "48h advance (per ToS)"], ["Festival Season Prep Guide", "Active stores", "Mar 5", "Opened by 5/6 stores"], ["DPDP Compliance Update", "All stores", "Feb 28", "Regulatory notice"], ["New Feature: Voice Search Beta", "Smart tier only", "Feb 20", "Opt-in invitation"]].map(([m, t, d, s]) => (<div key={m} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{m}</span><Badge s="active">Sent</Badge></div><div style={{ display: "flex", gap: 10, fontSize: 8, color: T.sb, marginTop: 2 }}><span>To: {t}</span><span>Date: {d}</span><span style={{ color: T.mt }}>{s}</span></div></div>))}</Card>)}
        {gt("aud") === "Store Comms" && (<Card t="Store Communication Log">{STORES.filter(s => s.st !== "churned").map(s => (<div key={s.id} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{s.n}</span><span style={{ fontSize: 8, color: T.mt }}>{s.ci}</span></div><div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{s.st === "trial" ? "Last: Onboarding check-in call (2d ago)" : s.ob === 5 ? "Last: Monthly review call (5d ago)" : "Last: Training follow-up (3d ago)"} | Next: {s.st === "trial" ? "Day 7 check-in" : "Monthly review Apr 7"}</div></div>))}</Card>)}
      </div>);

      case "ota": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 12px" }}>OTA, Features & Releases</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Card t="Feature Flags">{Object.entries(flags).map(([k, v]) => (<div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div><div style={{ fontSize: 10, fontWeight: 600 }}>{k.replace(/_/g, " ")}</div><div style={{ fontSize: 7, color: T.mt, fontFamily: "monospace" }}>{k}</div></div><Toggle on={v} onToggle={() => setFlags({ ...flags, [k]: !v })} /></div>))}</Card>
            <div>
              <Card t="CI/CD">{[["mirror-app", "v2.3.1", "Deployed"], ["tablet-app", "v2.3.0", "Deployed"], ["cloud-api", "v4.12.0", "Building"], ["dashboard", "v3.8.2", "Deployed"]].map(([n, v, s]) => (<Row key={n}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 9 }}>{n}</span><span style={{ fontSize: 8, color: T.mt }}>{v}</span><span style={{ fontSize: 9, color: s === "Deployed" ? T.cy : T.am }}>{s}</span></Row>))}</Card>
              <Card t="Deploy Freeze">{[["No-Deploy Fridays", "Active"], ["Festival", "Diwali +-7d"], ["OTA Window", "2-5 AM IST"], ["Emergency", "CTO approval"]].map(([l, v]) => (<Row key={l}><span style={{ flex: 1, fontSize: 9 }}>{l}</span><span style={{ fontSize: 8, color: T.cy }}>{v}</span></Row>))}</Card>
              <Card t="Data Export (MA-34)">{[["Store data export (CSV/JSON)", "Per retailer request", "5 business days SLA"], ["Analytics export (PDF)", "Auto-generated monthly", "Dashboard available"], ["DPDP export (customer data)", "On deletion request", "72h SLA"], ["Bulk export (all stores)", "Admin only", "CTO approval required"]].map(([t, tr, s]) => (<Row key={t}><span style={{ flex: 1, fontSize: 9 }}>{t}</span><span style={{ fontSize: 8, color: T.sb }}>{tr}</span><span style={{ fontSize: 7, color: T.mt }}>{s}</span></Row>))}</Card>
              <Card t="Ansible Playbook Manager (5 Playbooks)">{[["jetson-base-setup.yml", "Base OS + Docker + models", "Last: Mar 10", "All devices"], ["model-deploy.yml", "OTA model weight update", "Last: Mar 12", "v2.3 rollout"], ["app-deploy.yml", "Mirror + tablet app update", "Last: Mar 12", "v2.3.1"], ["security-audit.yml", "CVE scan + compliance check", "Last: Feb 28", "Monthly"], ["factory-reset.yml", "Complete device wipe", "Last: never", "CTO only"]].map(([p, d, l, s]) => (<Row key={p}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{p}</span><span style={{ fontSize: 7, color: T.sb }}>{d}</span><span style={{ fontSize: 7, color: T.mt }}>{l}</span><span style={{ fontSize: 7, color: T.cy }}>{s}</span></Row>))}</Card>
              <Card t="Release Management (MA-27)">{[["mirror-app", "v2.3.1", "v2.3.0", "Mar 12", "6 stores"], ["tablet-app", "v2.3.0", "v2.2.0", "Mar 10", "6 stores"], ["cloud-api", "v4.12.0", "v4.11.0", "Mar 14", "Production"], ["retailer-dashboard", "v3.8.2", "v3.8.1", "Mar 11", "Production"], ["edge-ai-runtime", "v2.3", "v2.2", "Mar 12", "6 Jetsons"]].map(([c, cur, prev, d, t]) => (<Row key={c}><span style={{ flex: 1, fontFamily: "monospace", fontSize: 8 }}>{c}</span><span style={{ fontSize: 8, fontWeight: 600, color: T.cy }}>{cur}</span><span style={{ fontSize: 7, color: T.mt }}>prev: {prev}</span><span style={{ fontSize: 7, color: T.sb }}>{d}</span><span style={{ fontSize: 7, color: T.mt }}>{t}</span></Row>))}</Card>
            </div>
          </div>
        </div>
      );

      case "drc": return (
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: "0 0 12px" }}>DR & Resilience</h1>
          <Tabs items={["Backups", "Drills", "Environment", "Runbook"]} active={gt("drc") || "Backups"} onChange={(v) => st("drc", v)} />
          {(gt("drc") || "Backups") === "Backups" && (<div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Backups" v="All OK" /><KPI l="Last Drill" v="Feb 15" /><KPI l="RTO" v="30min" /><KPI l="RPO" v="5min" /></div>
            <Card t="Backup Health" action={<Btn small primary onClick={() => setConfirm("Schedule new backup job?")}>+ Add Backup</Btn>}>{BKPS.map(b => (<Row key={b.s}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{b.s}</span><span style={{ fontSize: 7, color: T.sb }}>{b.m}</span><span style={{ fontSize: 7, fontFamily: "monospace" }}>RPO:{b.rp}</span><span style={{ fontSize: 7, fontFamily: "monospace" }}>RTO:{b.rt}</span><span style={{ fontSize: 7, color: T.mt }}>{b.l}</span><span style={{ color: T.cy }}>OK</span><Btn small onClick={() => setConfirm(`Edit backup schedule for ${b.s}?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Delete backup job for ${b.s}? Data retention at risk.`)}>Del</Btn></Row>))}</Card>
          </div>)}
          {gt("drc") === "Drills" && (<Card t="DR Drill Schedule & Results" action={<Btn small primary onClick={() => setConfirm("Schedule a new DR drill?")}>+ Schedule Drill</Btn>}>{DR_DRILLS.map(d => (<Row key={d.test}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{d.test}</span><span style={{ fontSize: 8, color: T.sb }}>{d.freq}</span><span style={{ fontSize: 8, color: T.cy }}>{d.last} - {d.result}</span><span style={{ fontSize: 8, color: T.am }}>Next: {d.next}</span><Btn small onClick={() => setConfirm(`Edit drill schedule for ${d.test}?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Run ${d.test} drill now? This will simulate a failure.`)}>Run Now</Btn></Row>))}</Card>)}
          {gt("drc") === "Environment" && (<div>
            <Card t="Environment Registry" action={<Btn small primary onClick={() => setConfirm("Add a new environment?")}>+ Add Env</Btn>}>{[["Development", "Local Docker Compose", "dev.phygifyt.local", "Healthy", "No real data"], ["Staging", "ECS Fargate (ap-south-1)", "staging.phygifyt.com", "Healthy", "Masked data only"], ["Production", "ECS Fargate (ap-south-1)", "api.phygifyt.com", "Healthy", "Live data + RLS"], ["Edge-Dev", "Jetson Dev Kit (office)", "local", "Active", "Test models"], ["ML Training", "SageMaker (on-demand)", "N/A", "Idle", "Training jobs"]].map(([e, i, u, s, n]) => (<div key={e} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 10, fontWeight: 600 }}>{e}</span><Badge s={s === "Healthy" || s === "Active" ? "active" : "trial"}>{s}</Badge><Btn small onClick={() => setConfirm(`Edit ${e} environment config?`)}>Edit</Btn><Btn small danger onClick={() => setConfirm(`Delete ${e} environment? This is destructive!`)}>Del</Btn></div><div style={{ display: "flex", gap: 12, fontSize: 8, color: T.sb, marginTop: 2 }}><span>{i}</span><span style={{ fontFamily: "monospace" }}>{u}</span><span style={{ color: T.mt }}>{n}</span></div></div>))}</Card>
            <Card t="Terraform State">{[["VPC + Networking", "Applied", "12 resources", "No drift"], ["ECS Services", "Applied", "8 task definitions", "No drift"], ["RDS + Cache", "Applied", "4 resources", "No drift"], ["IoT Core", "Applied", "6 things registered", "No drift"], ["S3 + CloudFront", "Applied", "5 buckets", "No drift"]].map(([m, s, r, d]) => (<Row key={m}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{m}</span><Badge s="active">{s}</Badge><span style={{ fontSize: 8, color: T.sb }}>{r}</span><span style={{ fontSize: 8, color: T.cy }}>{d}</span><Btn small onClick={() => setConfirm(`Plan terraform for ${m}?`)}>Plan</Btn><Btn small primary onClick={() => setConfirm(`Apply terraform for ${m}? This modifies infrastructure.`)}>Apply</Btn></Row>))}</Card>
          </div>)}
          {gt("drc") === "Runbook" && (<Card t="Ransomware Response (8-Step)" action={<Btn small primary onClick={() => setConfirm("Edit runbook procedure?")}>Edit Runbook</Btn>}>{["1. ISOLATE - Revoke network access", "2. PRESERVE - Snapshot volumes (evidence)", "3. CERT-In - Report within 6 hours", "4. ASSESS - Compare with clean backups", "5. RESTORE - Point-in-time recovery (PITR)", "6. RE-PROVISION - Terraform destroy + re-apply", "7. ROTATE - ALL credentials (DB, API, JWT, admin)", "8. FORENSICS - Post-incident analysis + hardening"].map(s => (<div key={s} style={{ padding: "4px 0", borderBottom: `1px solid ${T.bd}`, fontSize: 9, color: T.sb }}>{s}</div>))}</Card>)}
        </div>
      );

      case "cfg": return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: T.tx, margin: 0 }}>Settings</h1>
            <div style={{ display: "flex", gap: 4 }}>
              {(gt("cfg") || "Config") === "Config" && <Btn small primary onClick={() => openModal("platform_config")}>Edit Config</Btn>}
              {gt("cfg") === "WhatsApp" && <Btn small primary onClick={() => openModal("wa_template", {})}>+ Add Template</Btn>}
              {gt("cfg") === "Notifications" && <Btn small primary onClick={() => openModal("notif_rule", {})}>+ Add Rule</Btn>}
              {gt("cfg") === "Festival" && <Btn small primary onClick={() => openModal("festival", {})}>+ Add Festival</Btn>}
              {gt("cfg") === "Changelog" && <Btn small primary onClick={() => openModal("changelog_entry", {})}>+ Add Entry</Btn>}
              {gt("cfg") === "On-Call" && <Btn small primary onClick={() => openModal("oncall_edit", {})}>+ Add Person</Btn>}
              {gt("cfg") === "Languages" && <Btn small primary onClick={() => openModal("language_edit", {})}>+ Add Language</Btn>}
            </div>
          </div>
          <Tabs items={["Config", "WhatsApp", "Notifications", "Festival", "Changelog", "On-Call", "Languages"]} active={gt("cfg") || "Config"} onChange={(v) => st("cfg", v)} />
          {(gt("cfg") || "Config") === "Config" && (
            <Card t="Platform Configuration (Editable)">
              {cfgItems.map(([k, v], idx) => (
                <div key={k} style={{ display: "flex", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.bd}`, gap: 6 }}>
                  <span style={{ width: 130, fontSize: 9, color: T.sb }}>{k}</span>
                  <span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{v}</span>
                  <Btn small onClick={() => openModal("platform_config", { idx, key: k, value: v })}>Edit</Btn>
                </div>
              ))}
            </Card>
          )}
          {gt("cfg") === "WhatsApp" && (
            <Card t="WhatsApp Business Templates (Meta Approved)">
              {waTpls.map(tpl => (
                <div key={tpl.id} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 28, fontSize: 8, color: T.mt, fontFamily: "monospace" }}>{tpl.id}</span>
                    <span style={{ flex: 1, fontFamily: "monospace", fontSize: 9, fontWeight: 600 }}>{tpl.nm}</span>
                    <Badge s={tpl.st === "Approved" ? "active" : "pending"}>{tpl.st}</Badge>
                    <span style={{ fontSize: 7, color: T.mt, width: 55 }}>{tpl.agent}</span>
                    <Btn small onClick={() => openModal("wa_template", tpl)}>Edit</Btn>
                    <Btn small danger onClick={() => { setWaTpls(waTpls.filter(t => t.id !== tpl.id)); setConfirm("Template deleted."); }}>Del</Btn>
                  </div>
                  <div style={{ fontSize: 8, color: T.sb, marginTop: 3, marginLeft: 34, fontStyle: "italic" }}>{tpl.body}</div>
                </div>
              ))}
            </Card>
          )}
          {gt("cfg") === "Notifications" && (
            <Card t="Notification Rules Engine (MA-33)">
              {notifRules.map(rule => (
                <div key={rule.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <Toggle on={rule.active} onToggle={() => setNotifRules(notifRules.map(r => r.id === rule.id ? { ...r, active: !r.active } : r))} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: rule.active ? T.tx : T.mt }}>{rule.nm}</div>
                    <div style={{ fontSize: 8, color: T.sb }}>Trigger: {rule.trigger} → {rule.target} via {rule.ch}</div>
                  </div>
                  <Badge s={rule.active ? "active" : "planned"}>{rule.active ? "ON" : "OFF"}</Badge>
                  <Btn small onClick={() => openModal("notif_rule", rule)}>Edit</Btn>
                  <Btn small danger onClick={() => setNotifRules(notifRules.filter(r => r.id !== rule.id))}>Del</Btn>
                </div>
              ))}
            </Card>
          )}
          {gt("cfg") === "Festival" && (
            <div>
              <Card t="Festival Calendar & Deploy Freeze Periods">
                {festivalList.map(f => (
                  <div key={f.id} style={{ padding: "7px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>{f.name}</span>
                      <Toggle on={f.freeze} onToggle={() => setFestivalList(festivalList.map(x => x.id === f.id ? { ...x, freeze: !x.freeze } : x))} />
                      <span style={{ fontSize: 8, color: T.mt, width: 60 }}>Deploy Freeze</span>
                      <Badge s="active">{f.campaign}</Badge>
                      <Btn small onClick={() => openModal("festival", f)}>Edit</Btn>
                      <Btn small danger onClick={() => setFestivalList(festivalList.filter(x => x.id !== f.id))}>Del</Btn>
                    </div>
                    <div style={{ fontSize: 8, color: T.sb, marginTop: 2 }}>{f.start} to {f.end}</div>
                  </div>
                ))}
              </Card>
            </div>
          )}
          {gt("cfg") === "Changelog" && (
            <Card t="Platform Changelog">
              {changelogList.map(c => (
                <div key={c.ver} style={{ padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: T.cy }}>{c.ver}</span>
                    <Badge s={c.type === "Major" ? "P1" : c.type === "Minor" ? "trial" : "active"}>{c.type}</Badge>
                    <span style={{ fontSize: 8, color: T.mt, flex: 1 }}>{c.date}</span>
                    <Btn small onClick={() => openModal("changelog_entry", c)}>Edit</Btn>
                    <Btn small danger onClick={() => setChangelogList(changelogList.filter(x => x.ver !== c.ver))}>Del</Btn>
                  </div>
                  <div style={{ fontSize: 9, color: T.sb, marginTop: 2 }}>{c.notes}</div>
                </div>
              ))}
            </Card>
          )}
          {gt("cfg") === "On-Call" && (
            <div>
              <Card t="On-Call Rotation (PagerDuty)">
                {onCallList.map(oc => (
                  <div key={oc.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{oc.role}</div>
                      <div style={{ fontSize: 8, color: T.sb }}>{oc.name} — {oc.title} — {oc.week}</div>
                    </div>
                    <Badge s="active">{oc.status}</Badge>
                    <Btn small onClick={() => openModal("oncall_edit", oc)}>Edit</Btn>
                    <Btn small danger onClick={() => setOnCallList(onCallList.filter(x => x.id !== oc.id))}>Del</Btn>
                  </div>
                ))}
              </Card>
              <Card t="Internal Notes (Store-level)">{STORES.filter(s => s.st !== "churned").map(s => (<Row key={s.id}><span style={{ flex: 1, fontSize: 9, fontWeight: 600 }}>{s.n}</span><span style={{ fontSize: 8, color: T.sb }}>{s.st === "trial" ? "Trial — monitor closely" : s.hp > 90 ? "Healthy — potential case study" : "Needs attention — check engagement"}</span></Row>))}</Card>
            </div>
          )}
          {gt("cfg") === "Languages" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><KPI l="Complete" v={langContent.filter(l => l.status === "Complete").length} c={T.cy} /><KPI l="In Progress" v={langContent.filter(l => l.status === "In Progress").length} c={T.am} /><KPI l="Not Started" v={langContent.filter(l => l.status === "Not Started").length} c={T.mt} /><KPI l="Coverage" v="4 langs" s="100% complete" /></div>
              <Card t="Multi-Language Content Manager">
                {langContent.map(lc => (
                  <div key={lc.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 0", borderBottom: `1px solid ${T.bd}` }}>
                    <span style={{ width: 28, fontSize: 8, color: T.mt, fontFamily: "monospace" }}>{lc.id}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{lc.lang} <span style={{ fontSize: 8, color: T.mt }}>({lc.code})</span></div>
                      <div style={{ fontSize: 8, color: T.sb }}>Translator: {lc.translator} — Updated: {lc.lastUpdated}</div>
                    </div>
                    <div style={{ width: 80 }}>
                      <div style={{ fontSize: 7, color: T.mt, marginBottom: 2 }}>{lc.pct}%</div>
                      <div style={{ height: 4, borderRadius: 2, background: T.bd }}><div style={{ height: "100%", borderRadius: 2, background: lc.pct === 100 ? T.cy : lc.pct > 0 ? T.am : T.mt, width: `${lc.pct}%` }} /></div>
                    </div>
                    <Badge s={lc.status === "Complete" ? "active" : lc.status === "In Progress" ? "trial" : "planned"}>{lc.status}</Badge>
                    <Btn small onClick={() => openModal("language_edit", lc)}>Edit</Btn>
                    <Btn small danger onClick={() => setLangContent(langContent.filter(x => x.id !== lc.id))}>Del</Btn>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      );

      default: return (<div style={{ textAlign: "center", padding: 40, color: T.mt }}>Select a module</div>);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: T.bg, color: T.tx }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.bd};border-radius:3px}::-webkit-scrollbar-track{background:transparent}`}</style>
      <div style={{ width: 185, background: T.pn, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: `1px solid ${T.bd}` }}>
        <div style={{ padding: "14px 14px 16px" }}><div style={{ fontSize: 8, color: T.pr, letterSpacing: 3, fontWeight: 700 }}>WEARIFY</div><div style={{ fontSize: 13, fontWeight: 800, color: T.tx, marginTop: 2 }}>Mission Control</div><div style={{ fontSize: 7, color: T.mt }}>v4.0 - 225 Features</div></div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 4px" }}>{NAV.map(n => { const active = pg === n.k; return (<div key={n.k} onClick={() => go(n.k)} style={{ padding: "6px 8px", borderRadius: 3, cursor: "pointer", background: active ? T.prB : "transparent", color: active ? T.pr : T.mt, fontSize: 10, fontWeight: active ? 600 : 400, display: "flex", alignItems: "center" }}><span style={{ flex: 1 }}>{n.l}</span>{n.k === "cmd" && DEVS.some(d => d.st === "offline") && <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.rd }} />}</div>); })}</div>
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.bd}`, fontSize: 7, color: T.mt }}>Phygify Technoservices</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 16px", background: T.pn, borderBottom: `1px solid ${T.bd}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: T.cd, borderRadius: 3, padding: "5px 8px", width: 240, border: `1px solid ${T.bd}` }}><span style={{ color: T.mt, fontSize: 10 }}>Search</span><input placeholder="stores, devices, agents..." style={{ border: "none", outline: "none", background: "transparent", fontSize: 10, flex: 1, fontFamily: "inherit", color: T.tx }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 8, color: T.pr, fontFamily: "'JetBrains Mono', monospace" }}>{tm.toLocaleTimeString()}</span><div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 22, height: 22, borderRadius: "50%", background: T.pr, color: "#FBF8F3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700 }}>SA</div><div><div style={{ fontSize: 10, fontWeight: 600 }}>Super Admin</div><div style={{ fontSize: 7, color: T.mt }}>admin@phygifyt.com</div></div></div><button onClick={() => { setLoggedIn(false); setPg("dash"); }} style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${T.pr}`, background: "transparent", color: T.pr, fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Logout &rarr;</button></div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{renderPage()}</div>
      </div>
      {modal && (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, overflow: "auto", padding: 20 }}>
        <div style={{ background: T.pn, borderRadius: 10, padding: "20px", maxWidth: 520, width: "100%", border: `1px solid ${T.bd}`, maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.tx }}>
              {modal === "ticket" && "Create Support Ticket"}
              {modal === "user" && "Create Platform User"}
              {modal === "api_key" && "Create API Key"}
              {modal === "tailor" && (mf.id ? "Edit Tailor" : "Add Tailor")}
              {modal === "invoice" && (mf.id ? "Edit Invoice" : "Generate Invoice")}
              {modal === "vendor" && (mf.id ? "Edit Vendor" : "Add Vendor")}
              {modal === "kb" && (mf.id ? "Edit KB Article" : "Add KB Article")}
              {modal === "broadcast" && "Compose Broadcast"}
              {modal === "lead" && (mf.id ? "Edit Lead" : "Add Sales Lead")}
              {modal === "discount" && (mf.id ? "Edit Discount" : "Create Discount")}
              {modal === "deletion" && "Process Deletion Request"}
              {modal === "field_visit" && "Schedule Field Visit"}
              {modal === "legal_doc" && (mf.id ? "Edit Legal Document" : "Upload Legal Document")}
              {modal === "platform_config" && "Edit Config Value"}
              {modal === "wa_template" && (mf.id ? "Edit WhatsApp Template" : "Add WhatsApp Template")}
              {modal === "notif_rule" && (mf.id ? "Edit Notification Rule" : "Add Notification Rule")}
              {modal === "festival" && (mf.id ? "Edit Festival" : "Add Festival")}
              {modal === "changelog_entry" && (mf.ver ? "Edit Changelog Entry" : "Add Changelog Entry")}
              {modal === "oncall_edit" && (mf.id ? "Edit On-Call Person" : "Add On-Call Person")}
              {modal === "language_edit" && (mf.id ? "Edit Language" : "Add Language")}
              {modal === "health_weight" && "Edit Health Score Weight"}
              {modal === "training_cert" && (mf.id ? "Edit Training Program" : "Add Training Program")}
              {modal === "placement" && (mf.id ? "Edit Placement" : "New Promoted Placement")}
              {modal === "commission_edit" && (mf.id ? "Edit Commission" : "Add Commission Structure")}
              {modal === "white_label" && (mf.id ? "Edit White-Label Client" : "Add White-Label Client")}
              {modal === "subscription_edit" && (mf.id ? "Edit Subscription" : "Add Subscription")}
              {modal === "retention_edit" && (mf.id ? "Edit Retention Policy" : "Add Retention Policy")}
              {modal === "role_event" && (mf.id ? "Edit Role Event" : "Log Role Event")}
              {modal === "mfr_report" && (mf.id ? "Edit Report" : "Generate Manufacturer Report")}
            </span>
            <Btn small onClick={closeModal}>X</Btn>
          </div>

          {modal === "ticket" && (<div>
            <Sel label="Store" value={mf.store || ""} onChange={v => umf("store", v)} options={STORES.map(s => [s.id, s.n])} required />
            <Inp label="Subject" value={mf.subject} onChange={v => umf("subject", v)} placeholder="Brief description" required />
            <Sel label="Priority" value={mf.priority || "P2"} onChange={v => umf("priority", v)} options={[["P1", "P1 - Critical (SLA: 1h)"], ["P2", "P2 - High (SLA: 4h)"], ["P3", "P3 - Medium (SLA: 24h)"]]} required />
            <Inp label="Description" value={mf.desc} onChange={v => umf("desc", v)} placeholder="Detailed issue description..." />
            <Sel label="Assign To" value={mf.assign || ""} onChange={v => umf("assign", v)} options={[["l1", "L1 Support Agent"], ["l2", "L2 Engineering"], ["l3", "L3 CTO Escalation"]]} />
            <FileUp label="Attachments (screenshots, logs)" file={mf.attachment} onUpload={v => umf("attachment", v)} />
          </div>)}

          {modal === "user" && (<div>
            <Inp label="Full Name" value={mf.name} onChange={v => umf("name", v)} placeholder="e.g. Amit Sharma" required />
            <Inp label="Email" value={mf.email} onChange={v => umf("email", v)} placeholder="user@phygifyt.com" required type="email" />
            <Sel label="Role" value={mf.role || "R02"} onChange={v => umf("role", v)} options={[["R01", "R01 - Super Admin"], ["R02", "R02 - Support Agent"], ["eng", "Engineering"]]} required />
            <Chk label="Require 2FA (TOTP) on first login" checked={mf.mfa !== false} onChange={v => umf("mfa", v)} />
            <Chk label="Send welcome email with setup instructions" checked={mf.welcome !== false} onChange={v => umf("welcome", v)} />
          </div>)}

          {modal === "api_key" && (<div>
            <Inp label="Service Name" value={mf.service} onChange={v => umf("service", v)} placeholder="e.g. svc-analytics" required />
            <Sel label="Permissions" value={mf.perms || "read"} onChange={v => umf("perms", v)} options={[["read", "Read Only"], ["write", "Read + Write"], ["admin", "Full Admin"]]} required />
            <Inp label="Expiry Date" value={mf.expiry} onChange={v => umf("expiry", v)} type="date" required />
            <Inp label="Rate Limit (req/min)" value={mf.rateLimit} onChange={v => umf("rateLimit", v)} placeholder="100" />
            <Inp label="IP Whitelist (comma-separated)" value={mf.ipWhitelist} onChange={v => umf("ipWhitelist", v)} placeholder="Optional: 1.2.3.4, 5.6.7.8" />
          </div>)}

          {modal === "tailor" && (<div>
            <Inp label="Tailor / Shop Name" value={mf.name} onChange={v => umf("name", v)} placeholder="e.g. Stitchwell Tailors" required />
            <Inp label="City" value={mf.city} onChange={v => umf("city", v)} placeholder="e.g. Mumbai" required half />
            <Inp label="Contact Phone" value={mf.phone} onChange={v => umf("phone", v)} placeholder="+91 XXXXXXXXXX" required half />
            <Sel label="Specialty" value={mf.spec || ""} onChange={v => umf("spec", v)} options={[["blouse", "Blouse specialist"], ["all", "All ethnic wear"], ["premium", "Premium / designer blouse"], ["petticoat", "Blouse + Petticoat"]]} />
            <FileUp label="Portfolio / Sample Photos" file={mf.portfolio} onUpload={v => umf("portfolio", v)} accept="JPG, PNG, PDF" />
            <Inp label="Commission Rate (%)" value={mf.commission} onChange={v => umf("commission", v)} placeholder="Default: Rs 100/referral" />
          </div>)}

          {modal === "invoice" && (<div>
            <Sel label="Store" value={mf.store || ""} onChange={v => umf("store", v)} options={STORES.filter(s => s.st === "active").map(s => [s.id, `${s.n} (${s.pl} - Rs ${s.mr})`])} required />
            <Sel label="Period" value={mf.period || ""} onChange={v => umf("period", v)} options={[["mar2026", "March 2026"], ["apr2026", "April 2026"], ["q4fy26", "Q4 FY26 (Annual)"]]} required />
            <Inp label="Base Amount (Rs)" value={mf.amount} onChange={v => umf("amount", v)} placeholder="Auto-calculated from plan" disabled />
            <Inp label="GST 18% (Rs)" value={mf.gst} onChange={v => umf("gst", v)} placeholder="Auto-calculated" disabled />
            <Inp label="Discount Applied" value={mf.discount} onChange={v => umf("discount", v)} placeholder="e.g. Early Adopter 40%" />
            <Inp label="Notes" value={mf.notes} onChange={v => umf("notes", v)} placeholder="Optional invoice notes" />
            <div style={{ fontSize: 8, color: T.mt, marginTop: 4 }}>Invoice PDF auto-generated with GSTIN, SAC code 998314, HSN. Sent via email + WhatsApp.</div>
          </div>)}

          {modal === "vendor" && (<div>
            <Inp label="Vendor Name" value={mf.name} onChange={v => umf("name", v)} placeholder="e.g. New Vendor Inc." required />
            <Sel label="Type" value={mf.type || ""} onChange={v => umf("type", v)} options={[["cloud", "Cloud Infrastructure"], ["api", "API Service"], ["payment", "Payment Gateway"], ["llm", "LLM / AI Provider"], ["sms", "SMS / Communication"], ["other", "Other"]]} required />
            <Sel label="Risk Level" value={mf.risk || "Low"} onChange={v => umf("risk", v)} options={[["Low", "Low"], ["Medium", "Medium"], ["High", "High"]]} />
            <FileUp label="Data Processing Agreement (DPA)" file={mf.dpa} onUpload={v => umf("dpa", v)} required accept="PDF (signed copy)" />
            <Inp label="Monthly Spend (Rs)" value={mf.spend} onChange={v => umf("spend", v)} placeholder="Estimated monthly" />
            <Inp label="Contract Renewal Date" value={mf.renewal} onChange={v => umf("renewal", v)} type="date" />
            <Inp label="Primary Contact" value={mf.contact} onChange={v => umf("contact", v)} placeholder="Name + email" />
          </div>)}

          {modal === "kb" && (<div>
            <Inp label="Article Title" value={mf.title} onChange={v => umf("title", v)} placeholder="e.g. How to calibrate the Smart Mirror" required />
            <Sel label="Category" value={mf.cat || ""} onChange={v => umf("cat", v)} options={[["troubleshoot", "Troubleshooting"], ["guide", "How-To Guide"], ["analytics", "Analytics"], ["faq", "FAQ"]]} required />
            <Inp label="Content / Body" value={mf.content} onChange={v => umf("content", v)} placeholder="Full article text (supports markdown)..." />
            <FileUp label="Attachments (images, PDFs)" file={mf.attachment} onUpload={v => umf("attachment", v)} />
            <Sel label="Visibility" value={mf.visibility || "all"} onChange={v => umf("visibility", v)} options={[["all", "All stores"], ["smart", "Smart tier only"], ["internal", "Internal only"]]} />
          </div>)}

          {modal === "broadcast" && (<div>
            <Inp label="Subject / Title" value={mf.subject} onChange={v => umf("subject", v)} placeholder="e.g. Platform Update v2.3" required />
            <Sel label="Target Audience" value={mf.target || "all"} onChange={v => umf("target", v)} options={[["all", "All stores"], ["active", "Active stores only"], ["smart", "Smart tier only"], ["trial", "Trial stores only"], ["internal", "Internal team only"]]} required />
            <Inp label="Message Body" value={mf.body} onChange={v => umf("body", v)} placeholder="Full message text..." />
            <Sel label="Channel" value={mf.channel || "dashboard"} onChange={v => umf("channel", v)} options={[["dashboard", "Dashboard notification"], ["email", "Email"], ["whatsapp", "WhatsApp"], ["all_channels", "All channels"]]} />
            <Inp label="Scheduled Date/Time" value={mf.schedule} onChange={v => umf("schedule", v)} type="datetime-local" />
            <div style={{ fontSize: 8, color: T.mt, marginTop: 4 }}>Per ToS: 48h advance notice required for maintenance. Max 1 campaign/week/store.</div>
          </div>)}

          {modal === "lead" && (<div>
            <Inp label="Store / Contact Name" value={mf.name} onChange={v => umf("name", v)} placeholder="e.g. Ravi Textiles" required />
            <Inp label="City" value={mf.city} onChange={v => umf("city", v)} placeholder="e.g. Lucknow" required half />
            <Inp label="Contact Phone" value={mf.phone} onChange={v => umf("phone", v)} placeholder="+91 XXXXXXXXXX" required half />
            <Sel label="Stage" value={mf.stage || "demo"} onChange={v => umf("stage", v)} options={[["lead", "New Lead"], ["demo", "Demo Scheduled"], ["trial", "Trial Started"], ["negotiation", "Negotiation"]]} />
            <Sel label="Source" value={mf.source || ""} onChange={v => umf("source", v)} options={[["referral", "Referral"], ["association", "Association"], ["inbound", "Inbound inquiry"], ["outbound", "Outbound sales"], ["event", "Event / Exhibition"]]} />
            <Inp label="Notes" value={mf.notes} onChange={v => umf("notes", v)} placeholder="Additional context..." />
            <Inp label="Follow-up Date" value={mf.followup} onChange={v => umf("followup", v)} type="date" />
          </div>)}

          {modal === "discount" && (<div>
            <Inp label="Discount Name" value={mf.name} onChange={v => umf("name", v)} placeholder="e.g. Summer Launch 20%" required />
            <Sel label="Type" value={mf.type || ""} onChange={v => umf("type", v)} options={[["percentage", "Percentage off MRP"], ["fixed", "Fixed amount off"], ["free_month", "Free month(s)"]]} required />
            <Inp label="Value" value={mf.value} onChange={v => umf("value", v)} placeholder="e.g. 20 (for 20%) or 3000 (for Rs 3000 off)" required half />
            <Inp label="Max Discount Cap" value={mf.cap} onChange={v => umf("cap", v)} placeholder="40% (hard cap per Doc 3)" half />
            <Sel label="Apply To" value={mf.applyTo || "new"} onChange={v => umf("applyTo", v)} options={[["new", "New stores only"], ["existing", "Existing stores"], ["all", "All stores"], ["specific", "Specific store"]]} />
            <Inp label="Duration" value={mf.duration} onChange={v => umf("duration", v)} placeholder="e.g. 6 months, 1 year" />
            <Inp label="Discount Code" value={mf.code} onChange={v => umf("code", v)} placeholder="e.g. SUMMER20" />
            <Inp label="Valid Until" value={mf.validUntil} onChange={v => umf("validUntil", v)} type="date" />
          </div>)}

          {modal === "deletion" && (<div>
            <Inp label="Customer ID" value={mf.customerId} onChange={v => umf("customerId", v)} placeholder="e.g. C-5501" required />
            <Sel label="Request Type" value={mf.type || ""} onChange={v => umf("type", v)} options={[["full_erasure", "Full PII Erasure (DPDP Right to Erasure)"], ["marketing_optout", "Marketing Opt-out Only"], ["account_delete", "Full Account Deletion (30d cooling)"], ["data_export", "Data Export (Right to Access)"], ["correction", "Data Correction (Right to Correction)"]]} required />
            <Inp label="Customer Phone (for verification)" value={mf.phone} onChange={v => umf("phone", v)} placeholder="+91 XXXXXXXXXX" required />
            <Sel label="Verification Method" value={mf.verification || "otp"} onChange={v => umf("verification", v)} options={[["otp", "OTP verification"], ["in_store", "In-store identity verification"], ["email", "Email confirmation"]]} />
            <Inp label="Notes" value={mf.notes} onChange={v => umf("notes", v)} placeholder="Reason or additional context" />
            <div style={{ fontSize: 8, color: T.sb, marginTop: 4, lineHeight: 1.4 }}>SLA: Full erasure within 72 hours. Cascading delete: profile → preferences → interactions → anonymize transactions. Consent records NEVER deleted (legal requirement). Confirmation sent to customer via verified channel.</div>
          </div>)}

          {modal === "field_visit" && (<div>
            <Sel label="Store" value={mf.store || ""} onChange={v => umf("store", v)} options={STORES.filter(s => s.st !== "churned").map(s => [s.id, s.n])} required />
            <Sel label="Purpose" value={mf.purpose || ""} onChange={v => umf("purpose", v)} options={[["install", "New Installation"], ["maintenance", "Scheduled Maintenance"], ["thermal_audit", "Thermal Audit"], ["training", "Staff Training"], ["checkin", "Monthly Check-in"], ["hardware_swap", "Hardware Swap/Replace"], ["troubleshoot", "On-site Troubleshooting"]]} required />
            <Inp label="Scheduled Date" value={mf.date} onChange={v => umf("date", v)} type="date" required />
            <Sel label="Assigned Technician" value={mf.tech || ""} onChange={v => umf("tech", v)} options={[["amit", "Amit Kumar (Mumbai)"], ["priya", "Priya Sharma (Delhi)"], ["rahul", "Rahul Verma (Pan-India)"]]} required />
            <Inp label="Notes" value={mf.notes} onChange={v => umf("notes", v)} placeholder="Special instructions..." />
            <Chk label="Requires spare hardware (check inventory first)" checked={mf.needsHardware || false} onChange={v => umf("needsHardware", v)} />
          </div>)}

          {modal === "legal_doc" && (<div>
            <Inp label="Document Name" value={mf.name || ""} onChange={v => umf("name", v)} placeholder="e.g. Master Subscription Agreement (MSA)" required />
            <Sel label="Document Type" value={mf.type || "retailer"} onChange={v => umf("type", v)} options={[["retailer", "Retailer-Facing (shown at Onboarding)"], ["customer", "Customer-Facing (shown on Mirror/Tablet/PWA)"], ["internal", "Internal (company policy)"]]} required />
            <Inp label="Version" value={mf.ver || ""} onChange={v => umf("ver", v)} placeholder="e.g. v3.2" required half />
            <Inp label="Effective Date" value={mf.effective || ""} onChange={v => umf("effective", v)} type="date" required half />
            <FileUp label="Upload Document (PDF)" file={mf.file || null} onUpload={v => umf("file", v)} required accept="PDF only (max 10MB)" />
            <Inp label="Description / Summary" value={mf.desc || ""} onChange={v => umf("desc", v)} placeholder="Brief description of what this document covers" />
            <Sel label="Status" value={mf.status || "active"} onChange={v => umf("status", v)} options={[["draft", "Draft (not shown to anyone)"], ["active", "Active (presented to new stores/customers)"], ["archived", "Archived (kept for reference, not shown)"]]} />
            {mf.type === "customer" && (<div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: T.tx, marginBottom: 4 }}>Display Configuration</div>
              <Sel label="Show On" value={mf.showOn || "mirror"} onChange={v => umf("showOn", v)} options={[["mirror", "Smart Mirror (before try-on)"], ["tablet", "Sales Tablet"], ["pwa", "Customer PWA"], ["whatsapp", "WhatsApp first interaction"], ["all", "All touchpoints"]]} />
              <Sel label="Consent Type" value={mf.consentType || "mandatory"} onChange={v => umf("consentType", v)} options={[["mandatory", "Mandatory (block until accepted)"], ["opt_in", "Opt-in (can skip)"], ["informational", "Informational (display only)"]]} />
            </div>)}
            <div style={{ fontSize: 7, color: T.mt, marginTop: 8 }}>Retailer documents: presented during onboarding Step 3 with e-signature. Customer documents: shown on device screens with tap-to-accept. All acceptances logged with timestamp + IP for legal validity.</div>
          </div>)}

          {modal === "platform_config" && (<div>
            <div style={{ marginBottom: 8, fontSize: 9, color: T.sb }}>Editing: <span style={{ color: T.cy, fontFamily: "monospace" }}>{mf.key}</span></div>
            <Inp label="Value" value={mf.value || ""} onChange={v => umf("value", v)} required />
            <div style={{ fontSize: 8, color: T.mt, marginTop: 4 }}>Changes are logged to audit trail and take effect immediately.</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn onClick={closeModal}>Cancel</Btn>
              <Btn primary onClick={() => {
                if (mf.idx !== undefined) setCfgItems(cfgItems.map((item, i) => i === mf.idx ? [item[0], mf.value] : item));
                setConfirm("Config updated. Logged to audit trail."); closeModal();
              }}>Save Changes</Btn>
            </div>
          </div>)}
          {modal === "wa_template" && (<div>
            <Inp label="Template Name (snake_case)" value={mf.nm || ""} onChange={v => umf("nm", v)} placeholder="e.g. new_arrival_diwali" required />
            <Inp label="Body Text" value={mf.body || ""} onChange={v => umf("body", v)} placeholder="Use {variable} for dynamic fields" required />
            <Sel label="Assigned Agent" value={mf.agent || "System"} onChange={v => umf("agent", v)} options={[["System","System (auto)"],["AGT-02","AGT-02 Campaign Orchestrator"],["AGT-04","AGT-04 Customer Intelligence"]]} />
            <Sel label="Status" value={mf.st || "Pending"} onChange={v => umf("st", v)} options={[["Pending","Pending Meta Approval"],["Approved","Approved"],["Rejected","Rejected — needs revision"]]} />
          </div>)}
          {modal === "notif_rule" && (<div>
            <Inp label="Rule Name" value={mf.nm || ""} onChange={v => umf("nm", v)} placeholder="e.g. Payment Reminder Day 30" required />
            <Inp label="Trigger Event" value={mf.trigger || ""} onChange={v => umf("trigger", v)} placeholder="e.g. invoice_overdue_30d" required />
            <Sel label="Target" value={mf.target || "admin"} onChange={v => umf("target", v)} options={[["admin","Platform Admin"],["store_owner","Store Owner"],["admin+store","Admin + Store Owner"],["dpo","DPO"]]} />
            <Sel label="Channel" value={mf.ch || "dashboard"} onChange={v => umf("ch", v)} options={[["dashboard","Dashboard"],["email","Email"],["whatsapp","WhatsApp"],["all","All channels"]]} />
          </div>)}
          {modal === "festival" && (<div>
            <Inp label="Festival Name" value={mf.name || ""} onChange={v => umf("name", v)} placeholder="e.g. Onam" required />
            <Inp label="Start Date" value={mf.start || ""} onChange={v => umf("start", v)} placeholder="e.g. Sep 5" required half />
            <Inp label="End Date" value={mf.end || ""} onChange={v => umf("end", v)} placeholder="e.g. Sep 15" required half />
            <Inp label="Campaign Note" value={mf.campaign || ""} onChange={v => umf("campaign", v)} placeholder="e.g. AGT-02 scheduled" />
            <Chk label="Deploy Freeze during this period" checked={mf.freeze || false} onChange={v => umf("freeze", v)} />
          </div>)}
          {modal === "changelog_entry" && (<div>
            <Inp label="Version" value={mf.ver || ""} onChange={v => umf("ver", v)} placeholder="e.g. v2.4.0" required half />
            <Sel label="Type" value={mf.type || "Patch"} onChange={v => umf("type", v)} options={[["Major","Major"],["Minor","Minor"],["Patch","Patch"]]} />
            <Inp label="Date" value={mf.date || ""} onChange={v => umf("date", v)} placeholder="e.g. Mar 20" required half />
            <Inp label="Release Notes" value={mf.notes || ""} onChange={v => umf("notes", v)} placeholder="Brief summary of changes" required />
          </div>)}
          {modal === "oncall_edit" && (<div>
            <Inp label="Role" value={mf.role || ""} onChange={v => umf("role", v)} placeholder="e.g. P0/P1 Primary" required />
            <Inp label="Name" value={mf.name || ""} onChange={v => umf("name", v)} placeholder="e.g. Jaideep Choudhary" required half />
            <Inp label="Title" value={mf.title || ""} onChange={v => umf("title", v)} placeholder="e.g. Lead Architect" required half />
            <Inp label="Week / Coverage" value={mf.week || ""} onChange={v => umf("week", v)} placeholder="e.g. Mar 10-16" required half />
            <Inp label="Phone" value={mf.phone || ""} onChange={v => umf("phone", v)} placeholder="+91 XXXXXXXXXX" half />
          </div>)}
          {modal === "language_edit" && (<div>
            <Inp label="Language" value={mf.lang || ""} onChange={v => umf("lang", v)} placeholder="e.g. Malayalam" required half />
            <Inp label="Language Code" value={mf.code || ""} onChange={v => umf("code", v)} placeholder="e.g. ml" required half />
            <Sel label="Status" value={mf.status || "Not Started"} onChange={v => umf("status", v)} options={[["Complete","Complete"],["In Progress","In Progress"],["Not Started","Not Started"]]} />
            <Inp label="Completion %" value={String(mf.pct || "")} onChange={v => umf("pct", Number(v))} placeholder="0-100" type="number" half />
            <Inp label="Translator" value={mf.translator || ""} onChange={v => umf("translator", v)} placeholder="e.g. External — Name" half />
          </div>)}
          {modal === "health_weight" && (<div>
            <div style={{ marginBottom: 8, fontSize: 9, color: T.sb }}>Dimension: <span style={{ color: T.cy }}>{mf.dim}</span></div>
            <Inp label="Weight (%)" value={String(mf.weight || "")} onChange={v => umf("weight", Number(v))} placeholder="0-100" type="number" required />
            <Inp label="Description" value={mf.desc || ""} onChange={v => umf("desc", v)} placeholder="What this dimension measures" />
            <Inp label="Formula" value={mf.formula || ""} onChange={v => umf("formula", v)} placeholder="e.g. sessions_last_7d / 70" />
            <div style={{ fontSize: 8, color: T.am, marginTop: 4 }}>All weights must sum to 100%. Recalculation runs after save.</div>
          </div>)}
          {modal === "training_cert" && (<div>
            <Inp label="Program Name" value={mf.name || ""} onChange={v => umf("name", v)} placeholder="e.g. Advanced AI Features" required />
            <Sel label="Type" value={mf.type || "Optional"} onChange={v => umf("type", v)} options={[["Mandatory","Mandatory"],["Optional","Optional"]]} />
            <Inp label="Duration" value={mf.duration || ""} onChange={v => umf("duration", v)} placeholder="e.g. 2h" half />
            <Sel label="Format" value={mf.format || "Video"} onChange={v => umf("format", v)} options={[["Video","Video"],["Live Workshop","Live Workshop"],["Online","Online Module"],["PDF","PDF Guide"]]} />
          </div>)}
          {modal === "placement" && (<div>
            <Sel label="Store" value={mf.store || ""} onChange={v => umf("store", v)} options={STORES.filter(s => s.st === "active").map(s => [s.n, s.n])} required />
            <Inp label="Saree / Item" value={mf.saree || ""} onChange={v => umf("saree", v)} placeholder="e.g. Kanjivaram S-118" required />
            <Sel label="Position" value={mf.position || ""} onChange={v => umf("position", v)} options={[["Top Carousel Slot 1","Top Carousel — Slot 1"],["Top Carousel Slot 2","Top Carousel — Slot 2"],["Featured Banner","Featured Banner"],["End-of-Search Promo","End-of-Search Promo"]]} required />
            <Inp label="Rate" value={mf.rate || ""} onChange={v => umf("rate", v)} placeholder="e.g. Rs 2,000/week" required half />
            <Inp label="Start Date" value={mf.start || ""} onChange={v => umf("start", v)} type="date" half />
            <Inp label="End Date" value={mf.end || ""} onChange={v => umf("end", v)} type="date" half />
          </div>)}
          {modal === "commission_edit" && (<div>
            <Inp label="Category" value={mf.category || ""} onChange={v => umf("category", v)} placeholder="e.g. Marketplace Transaction" required />
            <Inp label="Rate" value={mf.rate || ""} onChange={v => umf("rate", v)} placeholder="e.g. 8% of sale or Rs 100 flat" required />
            <Sel label="Model" value={mf.model || "Percentage"} onChange={v => umf("model", v)} options={[["Percentage","Percentage of sale"],["Fixed","Fixed amount"],["Tiered","Tiered (volume-based)"]]} />
            <Sel label="Payout Frequency" value={mf.payoutFreq || "Monthly"} onChange={v => umf("payoutFreq", v)} options={[["Weekly","Weekly"],["Monthly","Monthly"],["Quarterly","Quarterly"]]} />
            <Inp label="Cap per Transaction" value={mf.cap || ""} onChange={v => umf("cap", v)} placeholder="e.g. Rs 5,000 or No cap" />
          </div>)}
          {modal === "white_label" && (<div>
            <Inp label="Client / Chain Name" value={mf.client || ""} onChange={v => umf("client", v)} placeholder="e.g. Nalli Group" required />
            <Inp label="Number of Stores" value={String(mf.stores || "")} onChange={v => umf("stores", Number(v))} placeholder="e.g. 28" type="number" half required />
            <Inp label="Contact Person" value={mf.contact || ""} onChange={v => umf("contact", v)} placeholder="Name + designation" half />
            <Inp label="Custom Domain" value={mf.domain || ""} onChange={v => umf("domain", v)} placeholder="e.g. mirror.client.com" />
            <Inp label="Branding Config" value={mf.branding || ""} onChange={v => umf("branding", v)} placeholder="e.g. Custom logo + brand colors" />
            <Inp label="Plan / Pricing" value={mf.plan || ""} onChange={v => umf("plan", v)} placeholder="e.g. Enterprise Rs 8K/store/mo" />
            <Sel label="Status" value={mf.status || "discussion"} onChange={v => umf("status", v)} options={[["discussion","Early Discussion"],["proposal","Proposal Sent"],["negotiation","Negotiation"],["signed","Signed"]]} />
          </div>)}
          {modal === "subscription_edit" && (<div>
            <Sel label="Store" value={mf.store || ""} onChange={v => umf("store", v)} options={STORES.filter(s => s.st === "active").map(s => [s.n, s.n])} required />
            <Inp label="Customer ID" value={mf.customer || ""} onChange={v => umf("customer", v)} placeholder="e.g. C-1021 Priya" required />
            <Sel label="Plan" value={mf.plan || ""} onChange={v => umf("plan", v)} options={[["Monthly - Rs 199","Monthly — Rs 199"],["Quarterly - Rs 499","Quarterly — Rs 499"],["Annual - Rs 1,799","Annual — Rs 1,799"]]} required />
            <Inp label="Items / Bundle" value={mf.items || ""} onChange={v => umf("items", v)} placeholder="e.g. 1 saree care, 2 saree bundle" />
            <Inp label="Next Billing Date" value={mf.nextBilling || ""} onChange={v => umf("nextBilling", v)} type="date" half />
          </div>)}
          {modal === "retention_edit" && (<div>
            <Inp label="Data Category" value={mf.category || ""} onChange={v => umf("category", v)} placeholder="e.g. Customer PII (Tier 1)" required />
            <Inp label="Retention Period" value={mf.retention || ""} onChange={v => umf("retention", v)} placeholder="e.g. Consent period / 7 years / INDEFINITE" required />
            <Inp label="Deletion Action" value={mf.deletion || ""} onChange={v => umf("deletion", v)} placeholder="e.g. Hard-delete 72h / Anonymize after" required />
            <Inp label="Governing Law / Policy" value={mf.law || ""} onChange={v => umf("law", v)} placeholder="e.g. DPDP Act 2023" />
          </div>)}
          {modal === "role_event" && (<div>
            <Inp label="User (name + store)" value={mf.user || ""} onChange={v => umf("user", v)} placeholder="e.g. Deepa (MAUVE)" required />
            <Inp label="From Role" value={mf.from || ""} onChange={v => umf("from", v)} placeholder="e.g. Salesperson" half required />
            <Inp label="To Role" value={mf.to || ""} onChange={v => umf("to", v)} placeholder="e.g. Manager" half required />
            <Inp label="Reason" value={mf.reason || ""} onChange={v => umf("reason", v)} placeholder="e.g. Promotion, New hire, Restructure" required />
            <Inp label="Approved By" value={mf.by || ""} onChange={v => umf("by", v)} placeholder="e.g. Store Owner / COO" half />
            <Inp label="Date" value={mf.date || ""} onChange={v => umf("date", v)} type="date" half />
          </div>)}
          {modal === "mfr_report" && (<div>
            <Inp label="Report Title" value={mf.title || ""} onChange={v => umf("title", v)} placeholder="e.g. Q2 2026 Silk Demand Report" required />
            <Inp label="Coverage Period" value={mf.period || ""} onChange={v => umf("period", v)} placeholder="e.g. Apr-Jun 2026" required half />
            <Inp label="Price (Rs)" value={mf.price || ""} onChange={v => umf("price", v)} placeholder="e.g. Rs 15,000" half />
            <Inp label="Buyer / Client" value={mf.buyer || ""} onChange={v => umf("buyer", v)} placeholder="e.g. Pochampally Weavers Co-op" />
            <Inp label="Segments Covered" value={(mf.segments || []).join(", ")} onChange={v => umf("segments", v.split(", "))} placeholder="e.g. Pure Silk, Kanjivaram, Banarasi" />
            <Sel label="Status" value={mf.status || "draft"} onChange={v => umf("status", v)} options={[["draft","Draft"],["sent","Sent to Buyer"],["paid","Paid"]]} />
          </div>)}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Btn onClick={closeModal}>Cancel</Btn>
            <Btn primary onClick={() => { setConfirm("Saved. All changes logged to audit trail."); closeModal(); }}>
              {mf.id ? "Save Changes" : modal === "legal_doc" ? "Upload & Activate" : "Create"}
            </Btn>
            {mf.id && modal === "legal_doc" && <Btn danger onClick={() => { setConfirm("Archive this document? It will no longer be shown to new stores/customers."); closeModal(); }}>Archive</Btn>}
          </div>
        </div>
      </div>)}
      {confirm && (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}><div style={{ background: T.pn, borderRadius: 12, padding: "22px 18px", maxWidth: 360, width: "90%", textAlign: "center", border: `1px solid ${T.bd}`, boxShadow: "0 12px 40px rgba(113,34,29,.1)" }}><div style={{ fontSize: 22, marginBottom: 6 }}>⚠️</div><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Confirm Action</div><div style={{ fontSize: 11, color: T.sb, marginBottom: 14, lineHeight: 1.4 }}>{confirm}</div><div style={{ fontSize: 8, color: T.mt, marginBottom: 12 }}>Logged in audit trail</div><div style={{ display: "flex", gap: 6 }}><button onClick={() => setConfirm(null)} style={{ flex: 1, padding: 9, borderRadius: 20, border: `1.5px solid ${T.pr}`, background: "transparent", color: T.pr, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button><button onClick={() => setConfirm(null)} style={{ flex: 1, padding: 9, borderRadius: 20, border: "none", background: confirm.includes("STOP") || confirm.includes("WIPE") || confirm.includes("PAUSE") || confirm.includes("emov") || confirm.includes("eject") || confirm.includes("Delete") || confirm.includes("SUSPEND") ? T.rd : T.pr, color: "#FBF8F3", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Confirm</button></div></div></div>)}
    </div>
  );
}
