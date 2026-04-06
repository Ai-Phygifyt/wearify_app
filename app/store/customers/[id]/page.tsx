"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const TABS = ["Overview", "Visits", "Consent"];

const SEGMENT_BADGE: Record<string, { bg: string; color: string }> = {
  VIP: { bg: "rgba(201, 148, 26, 0.15)", color: "#C9941A" },
  Regular: { bg: "rgba(26, 74, 101, 0.1)", color: "#1A4A65" },
  New: { bg: "rgba(27, 94, 32, 0.1)", color: "#1B5E20" },
  "At Risk": { bg: "rgba(183, 28, 28, 0.1)", color: "#B71C1C" },
  Gold: { bg: "rgba(201, 148, 26, 0.12)", color: "#C9941A" },
  Silver: { bg: "rgba(122, 110, 138, 0.12)", color: "#7A6E8A" },
};

function getBadgeStyle(key: string) {
  return SEGMENT_BADGE[key] || { bg: "rgba(10, 22, 40, 0.08)", color: "#0A1628" };
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as Id<"customers">;

  const [activeTab, setActiveTab] = useState("Overview");
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch {
      /* ignore */
    }
  }, []);

  const customer = useQuery(api.customers.getById, { customerId });
  const storeLink = useQuery(api.customers.getStoreLink, storeId ? { customerId, storeId } : "skip");
  const visitHistory = useQuery(api.customers.listVisitHistory, { customerId });
  const updateConsent = useMutation(api.customers.updateConsent);

  if (customer === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  if (customer === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: 8,
            borderRadius: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rt-text)" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="rt-card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <p style={{ fontSize: 14, color: "var(--rt-muted)" }}>Customer not found</p>
        </div>
      </div>
    );
  }

  const maskedPhone =
    customer.phone.length > 5
      ? customer.phone.slice(0, 6) + "****" + customer.phone.slice(-2)
      : customer.phone;

  const segment = storeLink?.segment || "New";
  const tier = customer.loyaltyTier || "Regular";
  const segStyle = getBadgeStyle(segment);
  const tierStyle = getBadgeStyle(tier);

  const initials = customer.name
    ? customer.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "CU";

  async function toggleConsent(field: string, current: boolean | undefined) {
    await updateConsent({
      customerId,
      [field]: !current,
      consentGrantedDate: new Date().toISOString().split("T")[0],
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          padding: 8,
          borderRadius: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          width: "fit-content",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rt-text)" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Hero */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--rt-navy), var(--rt-teal))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "var(--rt-gold)", fontSize: 22, fontWeight: 700 }}>{initials}</span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--rt-text)" }}>{customer.name}</div>
          <div style={{ fontSize: 13, color: "var(--rt-muted)", marginTop: 2 }}>{maskedPhone}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <span className="rt-badge" style={{ background: segStyle.bg, color: segStyle.color }}>
              {segment}
            </span>
            <span className="rt-badge" style={{ background: tierStyle.bg, color: tierStyle.color }}>
              {tier}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="rt-card" style={{ textAlign: "center", padding: "12px 8px" }}>
          <div className="rt-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--rt-text)" }}>
            Rs{(storeLink?.clv ?? 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>CLV</div>
        </div>
        <div className="rt-card" style={{ textAlign: "center", padding: "12px 8px" }}>
          <div className="rt-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--rt-text)" }}>
            {customer.totalVisits ?? 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>Visits</div>
        </div>
        <div className="rt-card" style={{ textAlign: "center", padding: "12px 8px" }}>
          <div className="rt-mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--rt-text)" }}>
            {customer.totalLooks ?? 0}
          </div>
          <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>Looks</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--rt-border)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 700,
              color: activeTab === tab ? "var(--rt-navy)" : "var(--rt-muted)",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--rt-gold)" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Preferences */}
          <div className="rt-card">
            <div className="rt-card-title">Preferences</div>
            {customer.preferredOccasions && customer.preferredOccasions.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 4 }}>Preferred Occasions</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {customer.preferredOccasions.map((o: string) => (
                    <span key={o} className="rt-badge rt-badge-teal">{o}</span>
                  ))}
                </div>
              </div>
            )}
            {customer.preferredFabrics && customer.preferredFabrics.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 4 }}>Preferred Fabrics</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {customer.preferredFabrics.map((f: string) => (
                    <span key={f} className="rt-badge rt-badge-gold">{f}</span>
                  ))}
                </div>
              </div>
            )}
            {customer.preferredColors && customer.preferredColors.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 4 }}>Preferred Colors</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {customer.preferredColors.map((c: string) => (
                    <span key={c} className="rt-badge rt-badge-amber">{c}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="rt-divider" />
            <DetailRow label="Budget Range" value={customer.budgetRange || "Not set"} />
            <DetailRow label="Language" value={customer.language || "English"} />
          </div>

          {/* Last Visit & Loyalty */}
          <div className="rt-card">
            <div className="rt-card-title">Loyalty</div>
            <DetailRow label="Loyalty Points" value={String(customer.loyaltyPoints ?? 0)} />
            <DetailRow label="Loyalty Tier" value={tier} />
            <DetailRow label="Last Visit" value={storeLink?.lastVisit || "N/A"} />
            <DetailRow label="Total Visits (this store)" value={String(storeLink?.visits ?? 0)} />
          </div>

          {/* Upcoming Occasion */}
          {customer.upcomingOccasion && (
            <div className="rt-card" style={{ background: "rgba(26, 74, 101, 0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-teal)" }}>
                    Upcoming: {customer.upcomingOccasion}
                  </div>
                  {customer.upcomingOccasionDate && (
                    <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>{customer.upcomingOccasionDate}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visits */}
      {activeTab === "Visits" && (
        <div className="rt-card">
          <div className="rt-card-title">Visit History</div>
          {visitHistory === undefined ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <span style={{ fontSize: 13, color: "var(--rt-muted)" }}>Loading...</span>
            </div>
          ) : !visitHistory || visitHistory.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--rt-muted)", textAlign: "center", padding: "24px 0" }}>
              No visit history
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {visitHistory.map((visit, idx) => (
                <div
                  key={visit._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: idx < visitHistory.length - 1 ? "1px solid var(--rt-border)" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rt-text)" }}>
                      {visit.storeName || "Store Visit"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>
                      {visit.staffName || "Staff"} &middot; {visit.sareesTried ?? 0} sarees tried
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--rt-text)" }}>{visit.date}</div>
                    {visit.purchased && (
                      <span className="rt-badge rt-badge-success">Purchased</span>
                    )}
                    {visit.pointsEarned != null && visit.pointsEarned > 0 && (
                      <div style={{ fontSize: 11, color: "var(--rt-success)", fontWeight: 600, marginTop: 2 }}>
                        +{visit.pointsEarned} pts
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consent */}
      {activeTab === "Consent" && (
        <div className="rt-card">
          <div className="rt-card-title">DPDP Consent</div>
          <p style={{ fontSize: 12, color: "var(--rt-muted)", marginBottom: 14 }}>
            Manage customer data consent as per DPDP Act. Changes take effect immediately.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <ConsentRow
              label="Browse & Purchase History"
              description="Allow storing visit and purchase data"
              on={customer.consentHistory ?? false}
              onToggle={() => toggleConsent("consentHistory", customer.consentHistory)}
            />
            <ConsentRow
              label="Marketing Messages"
              description="WhatsApp, SMS, and email campaigns"
              on={customer.consentMessages ?? false}
              onToggle={() => toggleConsent("consentMessages", customer.consentMessages)}
            />
            <ConsentRow
              label="AI Personalization"
              description="AI-powered recommendations and styling"
              on={customer.consentAiPersonal ?? false}
              onToggle={() => toggleConsent("consentAiPersonal", customer.consentAiPersonal)}
            />
            <ConsentRow
              label="Photos & Try-On Images"
              description="Store virtual try-on photos"
              on={customer.consentPhotos ?? false}
              onToggle={() => toggleConsent("consentPhotos", customer.consentPhotos)}
            />
          </div>
          {customer.consentGrantedDate && (
            <p style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 14 }}>
              Last updated: {customer.consentGrantedDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <span style={{ fontSize: 12, color: "var(--rt-muted)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--rt-text)" }}>{value}</span>
    </div>
  );
}

function ConsentRow({
  label,
  description,
  on,
  onToggle,
}: {
  label: string;
  description: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--rt-text)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>{description}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          background: on ? "var(--rt-success)" : "var(--rt-border)",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "white",
            position: "absolute",
            top: 3,
            left: on ? 23 : 3,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}
