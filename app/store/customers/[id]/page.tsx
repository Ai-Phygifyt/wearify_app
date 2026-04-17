"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Tab = "Overview" | "Visits" | "Consent";

const SEGMENT_BADGE: Record<string, string> = {
  VIP:       "w-badge w-badge-gold",
  Regular:   "w-badge w-badge-teal",
  New:       "w-badge w-badge-success",
  "At Risk": "w-badge w-badge-danger",
  Gold:      "w-badge w-badge-gold",
  Silver:    "w-badge w-badge-navy",
};

const AVATAR_GRAD: Record<string, string> = {
  VIP:       "linear-gradient(145deg, var(--w-gold), var(--w-gold-bright))",
  Regular:   "linear-gradient(145deg, var(--w-teal), #2980B9)",
  New:       "linear-gradient(145deg, var(--w-success), #27AE60)",
  "At Risk": "linear-gradient(145deg, var(--w-danger), #C0392B)",
  Gold:      "linear-gradient(145deg, var(--w-gold), var(--w-gold-bright))",
  Silver:    "linear-gradient(145deg, #7A8B9A, #A0B0BD)",
};

function badgeClass(key: string) {
  return SEGMENT_BADGE[key] ?? "w-badge w-badge-navy";
}
function avatarGrad(key: string) {
  return AVATAR_GRAD[key] ?? "linear-gradient(145deg, var(--w-navy), var(--w-teal))";
}

function Chip({ label, variant = "teal" }: { label: string; variant?: "teal" | "gold" | "navy" }) {
  const cls = variant === "gold" ? "w-badge w-badge-gold" : variant === "navy" ? "w-badge w-badge-navy" : "w-badge w-badge-teal";
  return <span className={cls}>{label}</span>;
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="w-back-btn" onClick={onClick} aria-label="Back"
      style={{
        width: 36, height: 36, borderRadius: "var(--w-r-sm)",
        border: "1px solid var(--w-cream-border)", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", boxShadow: "var(--w-shadow-xs)",
        transition: "all 0.18s",
      }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="2.2" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--w-cream-border)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--w-ink-soft)" }}>
        {icon}
        {label}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--w-ink)" }}>{value}</span>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: on ? "var(--w-success)" : "var(--w-cream-border)",
        position: "relative", transition: "background 0.22s var(--w-ease)", flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "white",
        position: "absolute", top: 3, left: on ? 23 : 3,
        transition: "left 0.22s var(--w-spring)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as Id<"customers">;

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const customer     = useQuery(api.customers.getById, customerId ? { customerId } : "skip");
  const storeLink    = useQuery(api.customers.getStoreLink, storeId && customerId ? { customerId, storeId } : "skip");
  const visitHistory = useQuery(api.customers.listVisitHistory, customerId ? { customerId } : "skip");
  const updateConsent = useMutation(api.customers.updateConsent);

  /* ── Loading ── */
  if (customer === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="w-loadscreen-inner">
          <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
          <div><span className="w-load-text">Loading customer</span><span className="w-load-dots"><span /><span /><span /></span></div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (customer === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <BackBtn onClick={() => router.back()} />
        <div className="w-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-soft)" }}>Customer not found</p>
        </div>
      </div>
    );
  }

  const segment = storeLink?.segment ?? "New";
  const tier    = customer.loyaltyTier ?? "Regular";

  const maskedPhone = customer.phone.length > 5
    ? customer.phone.slice(0, 6) + "****" + customer.phone.slice(-2)
    : customer.phone;

  const displayName = customer.name && customer.name !== "Guest"
    ? customer.name
    : `Customer #${String(customerId).slice(-6).toUpperCase()}`;

  const inits = customer.name
    ? customer.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : String(customerId).slice(-2).toUpperCase();

  async function toggleConsent(field: string, current: boolean | undefined) {
    await updateConsent({ customerId, [field]: !current, consentGrantedDate: new Date().toISOString().split("T")[0] });
  }

  const TABS: Tab[] = ["Overview", "Visits", "Consent"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Back ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BackBtn onClick={() => router.back()} />
        <span style={{ fontSize: 12, color: "var(--w-ink-muted)", letterSpacing: "0.04em" }}>Customer Profile</span>
      </div>

      {/* ── Hero card ── */}
      <div className="w-card w-card-gold" style={{ padding: "22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          {/* Avatar */}
          <div style={{
            width: 68, height: 68, borderRadius: "50%",
            background: avatarGrad(segment),
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: segment === "VIP" ? "0 6px 20px rgba(184,134,11,0.32)" : "var(--w-shadow-md)",
            border: segment === "VIP" ? "2.5px solid var(--w-gold-pale)" : "2px solid rgba(255,255,255,0.5)",
          }}>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{inits}</span>
          </div>

          {/* Name + phone + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--w-ink)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 5.55 5.55l.46-.46a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="w-mono" style={{ fontSize: 12.5, color: "var(--w-ink-soft)" }}>{maskedPhone}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className={badgeClass(segment)}>{segment}</span>
              <span className={badgeClass(tier)}>{tier}</span>
              {customer.profileComplete && <span className="w-badge w-badge-success">Profile complete</span>}
            </div>
          </div>
        </div>

        <div className="w-rule-gold" style={{ marginBottom: 16 }} />

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
              value: `₹${(storeLink?.clv ?? 0).toLocaleString("en-IN")}`,
              label: "CLV",
            },
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>,
              value: String(customer.totalVisits ?? 0),
              label: "Visits",
            },
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
              value: String(customer.loyaltyPoints ?? 0),
              label: "Points",
            },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 4 }}>
                {stat.icon}
              </div>
              <div className="w-mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--w-navy)" }}>{stat.value}</div>
              <div style={{ fontSize: 10.5, color: "var(--w-ink-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Upcoming occasion ── */}
      {customer.upcomingOccasion && (
        <div className="w-card" style={{
          padding: "14px 18px",
          background: "var(--w-teal-soft)",
          border: "1px solid rgba(26,82,118,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--w-r-sm)", background: "rgba(26,82,118,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--w-teal)" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--w-teal)", marginBottom: 2 }}>
                Upcoming: {customer.upcomingOccasion}
              </div>
              {customer.upcomingOccasionDate && (
                <div style={{ fontSize: 12, color: "var(--w-ink-soft)" }}>{customer.upcomingOccasionDate}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--w-cream-border)" }}>
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "11px 0", fontSize: 13, fontWeight: 700,
            color: activeTab === tab ? "var(--w-navy)" : "var(--w-ink-ghost)",
            background: "transparent", border: "none",
            borderBottom: activeTab === tab ? "2.5px solid var(--w-gold)" : "2.5px solid transparent",
            cursor: "pointer", transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Preferences */}
          <div className="w-card" style={{ padding: "18px 20px" }}>
            <div className="w-card-header" style={{ marginBottom: 14 }}>
              <span className="w-card-title">Preferences</span>
            </div>

            {customer.preferredOccasions && customer.preferredOccasions.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 7 }}>
                  Occasions
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {customer.preferredOccasions.map((o: string) => <Chip key={o} label={o} variant="teal" />)}
                </div>
              </div>
            )}

            {customer.preferredFabrics && customer.preferredFabrics.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 7 }}>
                  Fabrics
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {customer.preferredFabrics.map((f: string) => <Chip key={f} label={f} variant="gold" />)}
                </div>
              </div>
            )}

            {customer.preferredColors && customer.preferredColors.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 7 }}>
                  Colors
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {customer.preferredColors.map((c: string) => <Chip key={c} label={c} variant="navy" />)}
                </div>
              </div>
            )}

            <div className="w-divider" />
            <DetailRow label="Budget Range" value={customer.budgetRange || "Not set"}
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>} />
            <DetailRow label="Language" value={customer.language || "English"}
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>} />
          </div>

          {/* Loyalty */}
          <div className="w-card" style={{ padding: "18px 20px" }}>
            <div className="w-card-header" style={{ marginBottom: 14 }}>
              <span className="w-card-title">Loyalty</span>
              <span className={badgeClass(tier)}>{tier}</span>
            </div>
            <DetailRow label="Points" value={String(customer.loyaltyPoints ?? 0)}
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>} />
            <DetailRow label="Last visit" value={storeLink?.lastVisit || "N/A"}
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>} />
            <DetailRow label="Visits (this store)" value={String(storeLink?.visits ?? 0)}
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>} />
            {customer.city && (
              <DetailRow label="City" value={customer.city}
                icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>} />
            )}
          </div>
        </div>
      )}

      {/* ── Visits ── */}
      {activeTab === "Visits" && (
        <div className="w-card" style={{ padding: "18px 20px" }}>
          <div className="w-card-header" style={{ marginBottom: 16 }}>
            <span className="w-card-title">Visit History</span>
          </div>

          {visitHistory === undefined ? (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <span className="w-load-dots"><span /><span /><span /></span>
            </div>
          ) : !visitHistory || visitHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.5" style={{ marginBottom: 10 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="w-serif" style={{ fontSize: 15, fontStyle: "italic", color: "var(--w-ink-muted)" }}>No visits recorded</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {visitHistory.map((visit, idx) => (
                <div key={visit._id} style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "12px 0",
                  borderBottom: idx < visitHistory.length - 1 ? "1px solid var(--w-cream-border)" : "none",
                }}>
                  {/* Timeline dot */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, flexShrink: 0 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: visit.purchased ? "var(--w-success)" : "var(--w-cream-border)",
                      border: `2px solid ${visit.purchased ? "var(--w-success)" : "var(--w-cream-border)"}`,
                      boxShadow: visit.purchased ? "0 0 0 3px var(--w-success-bg)" : "none",
                    }} />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--w-ink)", marginBottom: 3 }}>
                      {visit.storeName || "Store Visit"}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--w-ink-soft)" }}>
                        {visit.staffName || "Staff"}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--w-ink-ghost)" }}>
                        {visit.sareesTried ?? 0} sarees
                      </span>
                      {visit.purchased && <span className="w-badge w-badge-success">Purchased</span>}
                      {(visit.pointsEarned ?? 0) > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--w-gold)" }}>+{visit.pointsEarned} pts</span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="w-mono" style={{ fontSize: 11.5, color: "var(--w-ink-ghost)", flexShrink: 0, paddingTop: 2 }}>
                    {visit.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Consent ── */}
      {activeTab === "Consent" && (
        <div className="w-card" style={{ padding: "18px 20px" }}>
          <div className="w-card-header" style={{ marginBottom: 6 }}>
            <span className="w-card-title">DPDP Consent</span>
            <span className="w-badge w-badge-navy">DPDP Act</span>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--w-ink-soft)", marginBottom: 20, lineHeight: 1.6 }}>
            Manage customer data consent per the Digital Personal Data Protection Act. Changes are saved immediately.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              {
                field: "consentHistory", label: "Browse & Purchase History",
                desc: "Allow storing visit and purchase data",
                on: customer.consentHistory ?? false,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
              },
              {
                field: "consentMessages", label: "Marketing Messages",
                desc: "WhatsApp, SMS, and email campaigns",
                on: customer.consentMessages ?? false,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="1.8" strokeLinecap="round"><path d="M22 2L11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
              },
              {
                field: "consentAiPersonal", label: "AI Personalization",
                desc: "AI-powered recommendations and styling",
                on: customer.consentAiPersonal ?? false,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
              },
              {
                field: "consentPhotos", label: "Photos & Try-On Images",
                desc: "Store virtual try-on photos",
                on: customer.consentPhotos ?? false,
                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
              },
            ].map(({ field, label, desc, on, icon }) => (
              <div key={field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--w-ink)", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--w-ink-soft)" }}>{desc}</div>
                  </div>
                </div>
                <Toggle on={on} onToggle={() => toggleConsent(field, on)} />
              </div>
            ))}
          </div>

          {customer.consentGrantedDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--w-cream-border)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ fontSize: 11.5, color: "var(--w-ink-ghost)" }}>Last updated: {customer.consentGrantedDate}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}
