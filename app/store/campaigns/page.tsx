"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type CampaignStatus = "sent" | "completed" | "scheduled" | "draft";
type Channel = "whatsapp" | "sms" | "email";

const STATUS_INFO: Record<CampaignStatus, { badge: string; label: string }> = {
  sent:      { badge: "w-badge w-badge-success", label: "Sent" },
  completed: { badge: "w-badge w-badge-success", label: "Completed" },
  scheduled: { badge: "w-badge w-badge-gold",    label: "Scheduled" },
  draft:     { badge: "w-badge w-badge-navy",    label: "Draft" },
};

function getStatusInfo(status: string) {
  return STATUS_INFO[status as CampaignStatus] ?? { badge: "w-badge", label: status };
}

function ChannelIcon({ channel, size = 14 }: { channel: string; size?: number }) {
  if (channel === "whatsapp") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
  if (channel === "sms") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

const CHANNEL_COLOR: Record<string, string> = {
  whatsapp: "#25D366",
  sms: "#1565C0",
  email: "#E65100",
};

export default function CampaignsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (u.storeId) setStoreId(u.storeId);
    } catch { /* */ }
  }, []);

  const campaigns = useQuery(
    api.campaignOps.listCampaignsByStore,
    storeId ? { storeId } : "skip"
  );

  const allCampaigns = campaigns ?? [];
  const sentCount = allCampaigns.filter((c) => c.status === "sent" || c.status === "completed").length;
  const scheduledCount = allCampaigns.filter((c) => c.status === "scheduled").length;
  const draftCount = allCampaigns.filter((c) => c.status === "draft").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 4 }}>
            Marketing
          </p>
          <h1 className="w-serif" style={{ fontSize: 28, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", lineHeight: 1.1, margin: 0 }}>
            Campaigns
          </h1>
        </div>
        <button
          className="w-btn w-btn-primary"
          onClick={() => setShowModal(true)}
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { label: "Total", value: allCampaigns.length },
          { label: "Sent", value: sentCount },
          { label: "Scheduled", value: scheduledCount },
          { label: "Drafts", value: draftCount },
        ].map(({ label, value }) => (
          <div key={label} className="w-card" style={{ padding: "12px 10px", textAlign: "center" }}>
            <div className="w-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--w-navy)", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--w-ink-muted)", marginTop: 4, letterSpacing: "0.04em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Modal ── */}
      {showModal && storeId && (
        <CreateCampaignModal storeId={storeId} onClose={() => setShowModal(false)} />
      )}

      {/* ── Loading ── */}
      {campaigns === undefined && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0" }}>
          <div className="w-loadscreen-inner">
            <div className="w-load-mark"><span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span></div>
            <div><span className="w-load-text">Loading campaigns</span><span className="w-load-dots"><span /><span /><span /></span></div>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {campaigns !== undefined && allCampaigns.length === 0 && (
        <div className="w-card" style={{ textAlign: "center", padding: "56px 24px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.4" style={{ marginBottom: 14 }}>
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-soft)", marginBottom: 6 }}>
            No campaigns yet
          </p>
          <p style={{ fontSize: 13, color: "var(--w-ink-ghost)", marginBottom: 18 }}>
            Create your first campaign to reach customers
          </p>
          <button className="w-btn w-btn-primary" onClick={() => setShowModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Campaign
          </button>
        </div>
      )}

      {/* ── Campaign List ── */}
      {campaigns !== undefined && allCampaigns.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {allCampaigns.map((campaign) => {
            const statusInfo = getStatusInfo(campaign.status);
            const channelColor = CHANNEL_COLOR[campaign.channel] ?? "#9C8878";
            const hasSentMetrics = (campaign.sent ?? 0) > 0;
            const isSent = campaign.status === "sent" || campaign.status === "completed";

            return (
              <div
                key={campaign._id}
                className="w-card"
                style={{
                  padding: "16px",
                  border: isSent ? "1px solid rgba(30,92,47,0.2)" : "1px solid var(--w-cream-border)",
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Channel icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: "var(--w-r-sm)",
                    background: channelColor + "18",
                    border: `1.5px solid ${channelColor}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    color: channelColor,
                  }}>
                    <ChannelIcon channel={campaign.channel} size={18} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--w-ink)" }}>{campaign.name}</span>
                      <span className={statusInfo.badge}>{statusInfo.label}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                        color: channelColor, textTransform: "uppercase",
                      }}>
                        {campaign.channel}
                      </span>
                      {campaign.segment && (
                        <>
                          <span style={{ color: "var(--w-cream-border)" }}>·</span>
                          <span style={{ fontSize: 12, color: "var(--w-ink-muted)" }}>{campaign.segment}</span>
                        </>
                      )}
                    </div>

                    {campaign.scheduledDate && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, color: "var(--w-ink-ghost)", fontSize: 12 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Scheduled {campaign.scheduledDate}
                      </div>
                    )}

                    <div style={{ fontSize: 11, color: "var(--w-ink-ghost)", marginTop: 4 }}>
                      Created {campaign.createdAt}
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                {hasSentMetrics && (
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
                    marginTop: 14, paddingTop: 14,
                    borderTop: "1px solid var(--w-cream-border)",
                  }}>
                    {[
                      { label: "Delivered", value: campaign.delivered ?? 0, color: "var(--w-ink)" },
                      { label: "Opened", value: campaign.opened ?? 0, color: "var(--w-teal)" },
                      { label: "Clicked", value: campaign.clicked ?? 0, color: "var(--w-gold)" },
                    ].map((m, i, arr) => (
                      <React.Fragment key={m.label}>
                        <div style={{ textAlign: "center" }}>
                          <div className="w-mono" style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                          <div style={{ fontSize: 11, color: "var(--w-ink-ghost)", marginTop: 2 }}>{m.label}</div>
                        </div>
                        {i < arr.length - 1 && <div style={{ background: "var(--w-cream-border)" }} />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}

/* ── Create Campaign Modal ───────────────────────────────────────── */
function CreateCampaignModal({ storeId, onClose }: { storeId: string; onClose: () => void }) {
  const createCampaign = useMutation(api.campaignOps.createCampaign);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [template, setTemplate] = useState("");
  const [segment, setSegment] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const CHANNELS: Channel[] = ["whatsapp", "sms", "email"];
  const SEGMENTS = ["All Customers", "VIP", "Regular", "New", "At Risk"];

  async function handleSubmit() {
    if (!name.trim()) { setError("Campaign name is required"); return; }
    setLoading(true);
    setError("");
    try {
      await createCampaign({
        storeId,
        name: name.trim(),
        channel,
        template: template.trim() || undefined,
        segment: segment || undefined,
        scheduledDate: scheduledDate || undefined,
        status: scheduledDate ? "scheduled" : "draft",
        createdAt: new Date().toISOString().split("T")[0],
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.07em", textTransform: "uppercase",
    color: "var(--w-ink-muted)", marginBottom: 8,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(13,31,53,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 520,
        background: "var(--w-cream)",
        borderRadius: "var(--w-r-lg) var(--w-r-lg) 0 0",
        boxShadow: "var(--w-shadow-lg)",
        maxHeight: "90vh", overflowY: "auto",
        padding: "24px 20px 40px",
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--w-cream-border)", margin: "0 auto 20px" }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Marketing</p>
            <h2 className="w-serif" style={{ fontSize: 24, fontWeight: 700, fontStyle: "italic", color: "var(--w-navy)", margin: 0 }}>
              New Campaign
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: "var(--w-r-xs)", border: "1px solid var(--w-cream-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-muted)" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Gold rule */}
        <div style={{ height: 2, background: "linear-gradient(90deg, var(--w-gold), var(--w-gold-bright), transparent)", borderRadius: 1, marginBottom: 20 }} />

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: "var(--w-r-sm)",
            background: "var(--w-danger-bg)", border: "1px solid rgba(139,0,0,0.15)",
            color: "var(--w-danger)", fontSize: 13, fontWeight: 600, marginBottom: 18,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Campaign name */}
          <div>
            <label style={labelStyle}>Campaign Name <span style={{ color: "var(--w-gold)" }}>*</span></label>
            <input
              className="w-input" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali Collection Launch"
            />
          </div>

          {/* Channel */}
          <div>
            <label style={labelStyle}>Channel <span style={{ color: "var(--w-gold)" }}>*</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              {CHANNELS.map((ch) => {
                const color = CHANNEL_COLOR[ch];
                const active = channel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    style={{
                      flex: 1, padding: "10px 8px",
                      borderRadius: "var(--w-r-sm)",
                      border: `1.5px solid ${active ? color : "var(--w-cream-border)"}`,
                      background: active ? color + "14" : "var(--w-cream-deep)",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 5,
                      transition: "all 0.18s var(--w-ease)",
                      color: active ? color : "var(--w-ink-muted)",
                    }}
                  >
                    <ChannelIcon channel={ch} size={16} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {ch}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template */}
          <div>
            <label style={labelStyle}>Message Template</label>
            <textarea
              className="w-input" value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Hi {name}, check out our new collection…"
              rows={3}
              style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </div>

          {/* Segment */}
          <div>
            <label style={labelStyle}>Target Segment</label>
            <select
              className="w-input" value={segment}
              onChange={(e) => setSegment(e.target.value)}
              style={{ appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239C8878' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              <option value="">All customers</option>
              {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Schedule */}
          <div>
            <label style={labelStyle}>
              Schedule Date
              <span style={{ fontWeight: 400, letterSpacing: "normal", textTransform: "none", color: "var(--w-ink-ghost)", marginLeft: 6 }}>— optional</span>
            </label>
            <input className="w-input" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="w-btn w-btn-primary"
              style={{ flex: 2, opacity: loading ? 0.65 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating…" : "Create Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
