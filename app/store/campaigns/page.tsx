"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const STATUS_BADGES: Record<string, { bg: string; color: string }> = {
  sent: { bg: "rgba(27, 94, 32, 0.1)", color: "#1B5E20" },
  completed: { bg: "rgba(27, 94, 32, 0.1)", color: "#1B5E20" },
  scheduled: { bg: "rgba(184,134,11, 0.12)", color: "#B8860B" },
  draft: { bg: "rgba(13, 31, 53, 0.08)", color: "#0D1F35" },
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
    } catch { /* ignore */ }
  }, []);

  const campaigns = useQuery(
    api.campaignOps.listCampaignsByStore,
    storeId ? { storeId } : "skip"
  );

  if (!storeId) {
    return (
      <div className="w-page-loading">
        <div className="w-load-mark">
          <span className="w-logomark-letter" style={{ fontSize: 17 }}>W</span>
        </div>
        <div>
          <span className="w-load-text">Loading</span>
          <span className="w-load-dots"><span /><span /><span /></span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-campaigns-root">

      {/* ── Page Header ── */}
      <div className="w-page-header">
        <div>
          <p className="w-page-eyebrow">Marketing</p>
          <h1 className="w-display w-page-title">Campaigns</h1>
          <div className="w-rule-gold" style={{ width: 48, marginTop: 10 }} />
        </div>
        <button className="w-btn w-btn-gold" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="w-campaigns-stats">
        <div className="w-cstat">
          <span className="w-mono w-cstat-num">{campaigns?.length ?? 0}</span>
          <span className="w-cstat-label">Total</span>
        </div>
        <div className="w-cstat-divider" />
        <div className="w-cstat">
          <span className="w-mono w-cstat-num">
            {campaigns?.filter(c => c.status === "sent" || c.status === "completed").length ?? 0}
          </span>
          <span className="w-cstat-label">Sent</span>
        </div>
        <div className="w-cstat-divider" />
        <div className="w-cstat">
          <span className="w-mono w-cstat-num">
            {campaigns?.filter(c => c.status === "scheduled").length ?? 0}
          </span>
          <span className="w-cstat-label">Scheduled</span>
        </div>
        <div className="w-cstat-divider" />
        <div className="w-cstat">
          <span className="w-mono w-cstat-num">
            {campaigns?.filter(c => c.status === "draft").length ?? 0}
          </span>
          <span className="w-cstat-label">Drafts</span>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && storeId && (
        <CreateCampaignModal storeId={storeId} onClose={() => setShowModal(false)} />
      )}

      {/* ── Campaign List ── */}
      {campaigns === undefined ? (
        <div className="w-list-loading">
          <span className="w-load-text">Loading campaigns</span>
          <span className="w-load-dots"><span /><span /><span /></span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="w-card w-campaigns-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-ghost)" strokeWidth="1.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="w-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--w-ink-muted)", marginTop: 12 }}>
            No campaigns yet
          </p>
          <p style={{ fontSize: 13, color: "var(--w-ink-ghost)", marginTop: 4 }}>
            Create your first campaign to reach customers
          </p>
          <button className="w-btn w-btn-gold" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
            + New Campaign
          </button>
        </div>
      ) : (
        <div className="w-campaigns-list">
          {campaigns.map((campaign, idx) => {
            const statusStyle = STATUS_BADGES[campaign.status] || STATUS_BADGES.draft;
            const channelInfo = CHANNEL_COLORS[campaign.channel] || { bg: "#9C8878", icon: "?" };
            const hasSentMetrics = (campaign.sent ?? 0) > 0;

            return (
              <div
                key={campaign._id}
                className="w-card w-campaign-card"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* Top row */}
                <div className="w-campaign-top">
                  {/* Channel badge */}
                  <div
                    className="w-channel-badge"
                    style={{ background: channelInfo.bg }}
                  >
                    <span className="w-channel-icon">{channelInfo.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="w-campaign-info">
                    <div className="w-campaign-name-row">
                      <span className="w-campaign-name">{campaign.name}</span>
                      <span
                        className="w-badge"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: "capitalize",
                        }}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <div className="w-campaign-meta">
                      <span className="w-campaign-channel">{campaign.channel.toUpperCase()}</span>
                      {campaign.segment && (
                        <>
                          <span className="w-campaign-dot">·</span>
                          <span>{campaign.segment}</span>
                        </>
                      )}
                    </div>
                    {campaign.scheduledDate && (
                      <div className="w-campaign-scheduled">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {campaign.scheduledDate}
                      </div>
                    )}
                    <div className="w-campaign-created">Created {campaign.createdAt}</div>
                  </div>
                </div>

                {/* Metrics row */}
                {hasSentMetrics && (
                  <>
                    <div className="w-campaign-divider" />
                    <div className="w-campaign-metrics">
                      <div className="w-metric">
                        <span className="w-mono w-metric-num">{campaign.delivered ?? 0}</span>
                        <span className="w-metric-label">Delivered</span>
                      </div>
                      <div className="w-metric-sep" />
                      <div className="w-metric">
                        <span className="w-mono w-metric-num w-metric-teal">{campaign.opened ?? 0}</span>
                        <span className="w-metric-label">Opened</span>
                      </div>
                      <div className="w-metric-sep" />
                      <div className="w-metric">
                        <span className="w-mono w-metric-num w-metric-gold">{campaign.clicked ?? 0}</span>
                        <span className="w-metric-label">Clicked</span>
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

/* ── Create Campaign Modal ───────────────────────────────────────────── */
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
    <div className="w-modal-backdrop">
      <div className="w-modal" role="dialog" aria-modal="true">

        {/* Modal header */}
        <div className="w-modal-header">
          <div>
            <p className="w-modal-eyebrow">Marketing</p>
            <h2 className="w-display w-modal-title">New Campaign</h2>
          </div>
          <button className="w-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="w-rule-gold" style={{ marginBottom: 20 }} />

        {/* Error */}
        {error && (
          <div className="w-modal-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <div className="w-modal-form">

          {/* Campaign name */}
          <div className="w-field">
            <label className="w-label">Campaign Name <span className="w-label-req">*</span></label>
            <input
              className="w-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Diwali Collection Launch"
            />
          </div>

          {/* Channel */}
          <div className="w-field">
            <label className="w-label">Channel <span className="w-label-req">*</span></label>
            <div className="w-channel-pills">
              {CHANNEL_OPTIONS.map((ch) => {
                const info = CHANNEL_COLORS[ch] || { bg: "#9C8878", icon: "?" };
                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`w-channel-pill${channel === ch ? " active" : ""}`}
                    style={{ "--ch-color": info.bg } as React.CSSProperties}
                  >
                    <span
                      className="w-channel-pill-dot"
                      style={{ background: channel === ch ? info.bg : "var(--w-cream-border)" }}
                    />
                    {ch.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template */}
          <div className="w-field">
            <label className="w-label">Template Text</label>
            <textarea
              className="w-input w-textarea"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Hi {name}, check out our new collection..."
              rows={3}
            />
          </div>

          {/* Segment */}
          <div className="w-field">
            <label className="w-label">Target Segment</label>
            <select
              className="w-input w-select"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
            >
              <option value="">All customers</option>
              {SEGMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Schedule */}
          <div className="w-field">
            <label className="w-label">
              Schedule Date
              <span className="w-label-opt"> — optional</span>
            </label>
            <input
              className="w-input"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="w-modal-actions">
            <button className="w-btn w-btn-ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              className={`w-btn w-btn-primary${loading ? " w-btn-loading" : ""}`}
              style={{ flex: 2 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-spinner" />
                  Creating…
                </>
              ) : "Create Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}