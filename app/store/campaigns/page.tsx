"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const STATUS_BADGES: Record<string, { bg: string; color: string }> = {
  sent: { bg: "rgba(27, 94, 32, 0.1)", color: "#1B5E20" },
  completed: { bg: "rgba(27, 94, 32, 0.1)", color: "#1B5E20" },
  scheduled: { bg: "rgba(201, 148, 26, 0.12)", color: "#C9941A" },
  draft: { bg: "rgba(10, 22, 40, 0.08)", color: "#0A1628" },
};

const CHANNEL_COLORS: Record<string, { bg: string; icon: string }> = {
  whatsapp: { bg: "#25D366", icon: "WA" },
  sms: { bg: "#1565C0", icon: "SM" },
  email: { bg: "#E65100", icon: "EM" },
};

export default function CampaignsPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch {
      /* ignore */
    }
  }, []);

  const campaigns = useQuery(api.campaignOps.listCampaignsByStore, storeId ? { storeId } : "skip");

  if (!storeId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1
            className="rt-serif"
            style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}
          >
            WhatsApp Campaigns
          </h1>
          <p style={{ fontSize: 13, color: "var(--rt-muted)", margin: "4px 0 0" }}>
            {campaigns?.length ?? 0} campaigns
          </p>
        </div>
        <button className="rt-btn rt-btn-gold rt-btn-sm" onClick={() => setShowModal(true)}>
          + New Campaign
        </button>
      </div>

      {/* Create Modal */}
      {showModal && storeId && (
        <CreateCampaignModal storeId={storeId} onClose={() => setShowModal(false)} />
      )}

      {/* Campaign List */}
      {campaigns === undefined ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <span style={{ fontSize: 14, color: "var(--rt-muted)" }}>Loading campaigns...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rt-card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <p style={{ fontSize: 14, color: "var(--rt-muted)" }}>No campaigns yet. Create your first one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {campaigns.map((campaign) => {
            const statusStyle = STATUS_BADGES[campaign.status] || STATUS_BADGES.draft;
            const channelInfo = CHANNEL_COLORS[campaign.channel] || { bg: "#7A6E8A", icon: "?" };
            const hasSentMetrics = (campaign.sent ?? 0) > 0;

            return (
              <div key={campaign._id} className="rt-card">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* Channel Icon */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: channelInfo.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: "white", fontSize: 12, fontWeight: 800 }}>{channelInfo.icon}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--rt-text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {campaign.name}
                      </span>
                      <span
                        className="rt-badge"
                        style={{ background: statusStyle.bg, color: statusStyle.color, textTransform: "capitalize" }}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rt-muted)" }}>
                      {campaign.channel.toUpperCase()}
                      {campaign.segment ? ` \u00B7 ${campaign.segment}` : ""}
                    </div>
                    {campaign.scheduledDate && (
                      <div style={{ fontSize: 12, color: "var(--rt-muted)", marginTop: 2 }}>
                        Scheduled: {campaign.scheduledDate}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--rt-muted)", marginTop: 2 }}>
                      Created: {campaign.createdAt}
                    </div>
                  </div>
                </div>

                {/* Sent Metrics */}
                {hasSentMetrics && (
                  <>
                    <div className="rt-divider" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div style={{ textAlign: "center" }}>
                        <div className="rt-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-text)" }}>
                          {campaign.delivered ?? 0}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>Delivered</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="rt-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-teal)" }}>
                          {campaign.opened ?? 0}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>Opened</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="rt-mono" style={{ fontSize: 14, fontWeight: 700, color: "var(--rt-gold)" }}>
                          {campaign.clicked ?? 0}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--rt-muted)" }}>Clicked</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateCampaignModal({ storeId, onClose }: { storeId: string; onClose: () => void }) {
  const createCampaign = useMutation(api.campaignOps.createCampaign);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("whatsapp");
  const [template, setTemplate] = useState("");
  const [segment, setSegment] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const CHANNEL_OPTIONS = ["whatsapp", "sms", "email"];
  const SEGMENT_OPTIONS = ["All Customers", "VIP", "Regular", "New", "At Risk"];

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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 22, 40, 0.4)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--rt-white)",
          borderRadius: "var(--rt-radius)",
          border: "1px solid var(--rt-border)",
          width: "100%",
          maxWidth: 400,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2
            className="rt-serif"
            style={{ fontSize: 18, fontWeight: 700, fontStyle: "italic", color: "var(--rt-navy)", margin: 0 }}
          >
            New Campaign
          </h2>
          <button
            onClick={onClose}
            style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rt-muted)" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(183, 28, 28, 0.08)",
            color: "var(--rt-alert)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
              Campaign Name *
            </label>
            <input
              className="rt-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Diwali Collection Launch"
            />
          </div>

          {/* Channel */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
              Channel *
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`rt-pill ${channel === ch ? "active" : ""}`}
                  style={{ flex: 1, textAlign: "center" }}
                >
                  {ch.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
              Template Text
            </label>
            <textarea
              className="rt-input"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Hi {name}, check out our new collection..."
              rows={3}
              style={{ resize: "vertical", minHeight: 60 }}
            />
          </div>

          {/* Segment */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
              Target Segment
            </label>
            <select
              className="rt-select"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
            >
              <option value="">Select segment...</option>
              {SEGMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Schedule Date */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--rt-text)", marginBottom: 4 }}>
              Schedule Date (optional)
            </label>
            <input
              className="rt-input"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="rt-btn rt-btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              className="rt-btn rt-btn-primary"
              style={{ flex: 1, opacity: loading ? 0.6 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
