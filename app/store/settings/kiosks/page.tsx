"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function formatWhen(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function useCountdown(expiresAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const msLeft = expiresAt - now;
  if (msLeft <= 0) return { expired: true, label: "expired" };
  const s = Math.ceil(msLeft / 1000);
  return { expired: false, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

export default function KioskDevicesPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.storeId) setStoreId(userData.storeId);
    } catch { /* ignore */ }
    const token = localStorage.getItem("wearify_auth_token");
    if (token) setSessionToken(token);
  }, []);

  const devices = useQuery(
    api.kioskPairing.listDevicesForStore,
    storeId && sessionToken ? { storeId, sessionToken } : "skip"
  );
  const pendingCodes = useQuery(
    api.kioskPairing.listActivePairingCodesForStore,
    storeId && sessionToken ? { storeId, sessionToken } : "skip"
  );

  const createCode = useMutation(api.kioskPairing.createPairingCode);
  const revokeDevice = useMutation(api.kioskPairing.revokeDevice);

  const activeDevices = useMemo(
    () => (devices ?? []).filter((d) => !d.revokedAt),
    [devices],
  );
  const revokedDevices = useMemo(
    () => (devices ?? []).filter((d) => d.revokedAt),
    [devices],
  );

  const latestCode = pendingCodes && pendingCodes.length > 0 ? pendingCodes[0] : null;
  const countdown = useCountdown(latestCode?.expiresAt);

  const handleGenerate = async () => {
    if (!storeId || !sessionToken) return;
    setError("");
    setGenerating(true);
    try {
      await createCode({ storeId, sessionToken });
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error: /, "") : "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (deviceId: string, deviceLabel?: string) => {
    if (!sessionToken) return;
    const label = deviceLabel || deviceId;
    if (!confirm(`Revoke "${label}"? The kiosk will be logged out and must be re-paired to work again.`)) return;
    try {
      await revokeDevice({ deviceId, sessionToken });
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error: /, "") : "Failed");
    }
  };

  if (!storeId || devices === undefined) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
        <span style={{ fontSize: 14, color: "var(--w-ink-muted)" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => router.push("/store/settings")}
          style={{ padding: 6, border: "none", background: "transparent", cursor: "pointer" }}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--w-ink-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--w-ink)", margin: 0, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
            Kiosk Mirrors
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--w-ink-muted)", margin: "2px 0 0" }}>
            Pair new mirrors, revoke the ones you no longer trust.
          </p>
        </div>
      </div>

      {error && (
        <div className="w-card" style={{
          padding: "12px 16px",
          background: "var(--w-danger-bg)",
          border: "1px solid rgba(192,57,43,0.25)",
          color: "var(--w-danger)",
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Pair new kiosk panel */}
      <div className="w-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 8 }}>
          Pair a new mirror
        </div>

        {latestCode && !countdown?.expired ? (
          <div>
            <p style={{ fontSize: 13.5, color: "var(--w-ink-soft)", margin: "0 0 14px" }}>
              Type this code into the mirror&rsquo;s setup screen.
            </p>
            <div style={{
              padding: "22px 18px",
              borderRadius: 14,
              background: "linear-gradient(135deg, var(--w-gold-mist), #fff)",
              border: "1.5px solid rgba(184,134,11,0.3)",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 38,
                fontWeight: 600,
                letterSpacing: 10,
                color: "var(--w-ink)",
              }}>
                {latestCode.code}
              </div>
              <div style={{
                marginTop: 10,
                fontSize: 12,
                color: "var(--w-ink-muted)",
              }}>
                Expires in <strong style={{ color: "var(--w-gold)", fontFamily: "'DM Mono', monospace" }}>{countdown?.label}</strong>
                {" · "}
                Issued by {latestCode.createdByKind === "admin" ? "Wearify admin" : "you"}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "11px 0",
                borderRadius: 10,
                border: "1px solid var(--w-cream-border)",
                background: "transparent",
                color: "var(--w-ink-soft)",
                fontSize: 13,
                fontWeight: 500,
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "Generating..." : "Regenerate code"}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13.5, color: "var(--w-ink-soft)", margin: "0 0 14px" }}>
              Generate a one-time code and type it into the new mirror&rsquo;s setup screen. Codes expire in 2 minutes.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-btn w-btn-primary"
              style={{ width: "100%", padding: "13px", fontSize: 14 }}
            >
              {generating ? "Generating..." : "Generate pairing code"}
            </button>
          </div>
        )}
      </div>

      {/* Paired devices */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 10 }}>
          Paired mirrors ({activeDevices.length})
        </div>

        {activeDevices.length === 0 ? (
          <div className="w-card" style={{ padding: 24, textAlign: "center", color: "var(--w-ink-muted)", fontSize: 13 }}>
            No mirrors paired yet. Generate a code above to pair your first one.
          </div>
        ) : (
          <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
            {activeDevices.map((d, i) => (
              <div
                key={d._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 18px",
                  borderBottom: i === activeDevices.length - 1 ? "none" : "1px solid var(--w-cream-border)",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "var(--w-gold-mist)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="14" rx="2" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--w-ink)" }}>
                    {d.deviceLabel || "Kiosk"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--w-ink-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                    {d.deviceId} · paired {formatWhen(d.pairedAt)} · last seen {formatWhen(d.lastSeenAt)}
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(d.deviceId, d.deviceLabel)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(192,57,43,0.25)",
                    background: "var(--w-danger-bg)",
                    color: "var(--w-danger)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {revokedDevices.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--w-ink-muted)", marginBottom: 10 }}>
            Revoked ({revokedDevices.length})
          </div>
          <div className="w-card" style={{ overflow: "hidden", padding: 0 }}>
            {revokedDevices.map((d, i) => (
              <div
                key={d._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 18px",
                  borderBottom: i === revokedDevices.length - 1 ? "none" : "1px solid var(--w-cream-border)",
                  opacity: 0.55,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--w-ink-soft)", textDecoration: "line-through" }}>
                    {d.deviceLabel || "Kiosk"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--w-ink-muted)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                    {d.deviceId} · revoked {formatWhen(d.revokedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
