"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Tabs, Badge, Row, Metric, PageLoading } from "@/components/ui/wearify-ui";
import { useEffect, useMemo, useState } from "react";

// ----------------------------------------------------------------------
// Pairing helpers
// ----------------------------------------------------------------------

function formatWhen(ts?: number) {
  if (!ts) return "—";
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function useCountdown(expiresAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const msLeft = expiresAt - now;
  if (msLeft <= 0) return { expired: true, label: "expired" };
  const s = Math.ceil(msLeft / 1000);
  return { expired: false, label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` };
}

// ----------------------------------------------------------------------
// Pairing tab
// ----------------------------------------------------------------------

function PairingTab() {
  const stores = useQuery(api.stores.list);
  const paired = useQuery(api.kioskPairing.listAllPairedDevices);

  const [selectedStore, setSelectedStore] = useState<string>("");
  const [issuedCode, setIssuedCode] = useState<{ code: string; storeName: string; expiresAt: number } | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");

  const createCode = useMutation(api.kioskPairing.createPairingCode);
  const revokeDevice = useMutation(api.kioskPairing.revokeDevice);

  const countdown = useCountdown(issuedCode?.expiresAt);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof paired>();
    if (!paired) return map;
    for (const d of paired) {
      const list = map.get(d.storeId) ?? [];
      list.push(d);
      map.set(d.storeId, list);
    }
    return map;
  }, [paired]);

  if (!stores || !paired) return <PageLoading />;

  const activeCount = paired.filter((d) => !d.revokedAt).length;
  const revokedCount = paired.filter((d) => d.revokedAt).length;

  const handleIssue = async () => {
    if (!selectedStore) {
      setError("Pick a store first");
      return;
    }
    setError("");
    setIssuing(true);
    try {
      const res = await createCode({ storeId: selectedStore });
      setIssuedCode({
        code: res.code,
        storeName: res.storeName,
        expiresAt: res.expiresAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error: /, "") : "Failed");
    } finally {
      setIssuing(false);
    }
  };

  const handleRevoke = async (deviceId: string, label?: string) => {
    if (!confirm(`Revoke "${label || deviceId}"? The kiosk will stop working until re-paired.`)) return;
    try {
      await revokeDevice({ deviceId });
    } catch (e) {
      setError(e instanceof Error ? e.message.replace(/^Error: /, "") : "Failed");
    }
  };

  return (
    <div>
      {/* KPIs */}
      <div className="flex gap-2 mb-3">
        <KPI label="Paired Kiosks" value={activeCount} />
        <KPI label="Revoked" value={revokedCount} />
        <KPI label="Stores" value={stores.length} />
      </div>

      {/* Issue code */}
      <Card title="Issue Pairing Code">
        {error && (
          <div className="p-2 mb-2 rounded bg-wf-red/5 border border-wf-red/20 text-[10px] text-wf-red">
            {error}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <select
            value={selectedStore}
            onChange={(e) => { setSelectedStore(e.target.value); setIssuedCode(null); }}
            className="flex-1 px-3 py-2 rounded bg-wf-panel border border-wf-border text-[11px] text-wf-text focus:outline-none focus:border-wf-primary"
          >
            <option value="">Select store...</option>
            {stores.map((s) => (
              <option key={s._id} value={s.storeId}>
                {s.name} · {s.storeId} · {s.city}
              </option>
            ))}
          </select>
          <button
            onClick={handleIssue}
            disabled={issuing || !selectedStore}
            className="px-4 py-2 rounded bg-wf-primary text-white text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {issuing ? "Issuing..." : "Issue code"}
          </button>
        </div>

        {issuedCode && !countdown?.expired && (
          <div className="mt-3 p-4 rounded border border-wf-primary/25 bg-wf-primary/5">
            <div className="text-[9px] uppercase tracking-wider text-wf-muted font-bold mb-1">
              Code for {issuedCode.storeName}
            </div>
            <div className="font-mono text-3xl font-semibold tracking-[0.3em] text-wf-text">
              {issuedCode.code}
            </div>
            <div className="mt-2 text-[10px] text-wf-subtext">
              Expires in <span className="font-mono font-semibold text-wf-primary">{countdown?.label}</span> — share this with the technician setting up the kiosk. One-time use.
            </div>
          </div>
        )}
        {issuedCode && countdown?.expired && (
          <div className="mt-3 p-3 rounded border border-wf-amber/30 bg-wf-amber/5 text-[10px] text-wf-subtext">
            Code expired. Issue a fresh one if still needed.
          </div>
        )}
      </Card>

      {/* Fleet by store */}
      <Card title={`Paired Devices (${activeCount} active${revokedCount > 0 ? `, ${revokedCount} revoked` : ""})`}>
        {paired.length === 0 ? (
          <div className="text-center py-8 text-wf-muted text-[11px]">
            No kiosks have been paired yet. Issue a code above, then type it on the mirror at /kiosk/setup.
          </div>
        ) : (
          <>
            {[...grouped.entries()].map(([storeId, list]) => (
              <div key={storeId} className="mb-3 last:mb-0">
                <div className="text-[9px] uppercase tracking-wider text-wf-muted font-bold mb-1 px-1">
                  {list![0].storeName} · {storeId}
                </div>
                {list!.map((d) => (
                  <div
                    key={d._id}
                    className="flex items-center gap-2 py-2 px-2 border-b border-wf-border last:border-0"
                    style={{ opacity: d.revokedAt ? 0.55 : 1 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold">
                        {d.deviceLabel || "Kiosk"}
                        {d.revokedAt && <span className="ml-2 text-wf-red font-normal">· revoked</span>}
                      </div>
                      <div className="text-[9px] font-mono text-wf-subtext">
                        {d.deviceId} · paired by {d.pairedByKind === "admin" ? "admin" : "store"} {formatWhen(d.pairedAt)} · last seen {formatWhen(d.lastSeenAt)}
                      </div>
                    </div>
                    {!d.revokedAt && (
                      <button
                        onClick={() => handleRevoke(d.deviceId, d.deviceLabel)}
                        className="px-3 py-1.5 rounded bg-wf-red/10 border border-wf-red/25 text-wf-red text-[10px] font-semibold cursor-pointer hover:bg-wf-red/15"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </Card>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main page
// ----------------------------------------------------------------------

export default function DevicesPage() {
  const devices = useQuery(api.devices.list);
  const stats = useQuery(api.devices.getStats);
  const [tab, setTab] = useState("Fleet");
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  if (!devices || !stats) return <PageLoading />;

  const selected = selectedDevice
    ? devices.find((d) => d.deviceId === selectedDevice)
    : null;

  return (
    <div>
      <h1 className="text-base font-extrabold text-wf-text mb-1">
        Device Fleet Management
      </h1>
      <p className="text-[10px] text-wf-subtext mb-3">
        {stats.total} devices — {stats.online} online
      </p>

      {/* KPI Row */}
      <div className="flex gap-2 mb-3">
        <KPI label="Total Fleet" value={stats.total} />
        <KPI label="Online" value={stats.online} subtitle={`${stats.offline} offline`} />
        <KPI label="Mirrors" value={stats.mirrors} />
        <KPI label="Tablets" value={stats.tablets} />
        <KPI label="Avg GPU" value={`${stats.avgGpu}ms`} subtitle="Target <60ms" />
      </div>

      <Tabs
        items={["Fleet", "Pairing", "IoT Shadow", "Provisioning", "Shipping", "Offline Queue"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Fleet" && (
        <div className={selected ? "grid grid-cols-[1fr_1fr] gap-2" : ""}>
          {/* Device List */}
          <Card title="Device Fleet">
            <div className="flex py-1.5 border-b border-wf-border text-[8px] font-bold text-wf-muted uppercase tracking-wider">
              <span className="w-[60px]">ID</span>
              <span className="w-[50px]">Type</span>
              <span className="flex-1">Store</span>
              <span className="w-[50px]">Status</span>
              <span className="w-[50px] text-right">Uptime</span>
              <span className="w-[50px] text-right">GPU</span>
              <span className="w-[50px] text-right">Seen</span>
            </div>
            {devices.map((d) => (
              <Row
                key={d._id}
                onClick={() => setSelectedDevice(d.deviceId === selectedDevice ? null : d.deviceId)}
                className={d.deviceId === selectedDevice ? "bg-wf-primary/5" : ""}
              >
                <span className="w-[60px] font-mono text-[8px] text-wf-muted">{d.deviceId}</span>
                <span className="w-[50px] text-[9px]">{d.type}</span>
                <span className="flex-1 text-[9px] font-semibold">{d.storeName}</span>
                <span className="w-[50px]">
                  <Badge status={d.status}>{d.status}</Badge>
                </span>
                <span className="w-[50px] text-right text-[9px] font-mono text-wf-subtext">
                  {d.uptime}%
                </span>
                <span
                  className="w-[50px] text-right text-[9px] font-mono"
                  style={{
                    color:
                      d.gpuLatency === 0
                        ? "var(--color-wf-muted)"
                        : d.gpuLatency < 50
                          ? "var(--color-wf-green)"
                          : "var(--color-wf-amber)",
                  }}
                >
                  {d.gpuLatency || "—"}ms
                </span>
                <span className="w-[50px] text-right text-[8px] text-wf-subtext">{d.lastSeen}</span>
              </Row>
            ))}
          </Card>

          {/* Device Detail Panel */}
          {selected && (
            <Card title={`${selected.deviceId} — ${selected.type}`}>
              <div className="mb-3">
                <Badge status={selected.status} className="text-[10px] px-3 py-1 mb-2">{selected.status.toUpperCase()}</Badge>
                <div className="text-[9px] text-wf-subtext mb-2">{selected.storeName} — {selected.storeId}</div>
              </div>

              <h4 className="text-[8px] font-bold text-wf-muted uppercase tracking-wider mb-2">
                Telemetry
              </h4>
              <Metric label="CPU" value={`${selected.cpuPercent}%`} color="var(--color-wf-blue)" />
              <Metric label="GPU Temp" value={`${selected.gpuTemp}°C`} max={100} color={selected.gpuTemp > 75 ? "var(--color-wf-red)" : "var(--color-wf-green)"} />
              <Metric label="Memory" value={`${selected.memoryGb}GB`} max={8} color="var(--color-wf-amber)" />
              <Metric label="FPS" value={`${selected.fps}`} max={30} color="var(--color-wf-green)" />
              <Metric label="Uptime" value={`${selected.uptime}%`} color="var(--color-wf-green)" />

              <h4 className="text-[8px] font-bold text-wf-muted uppercase tracking-wider mt-3 mb-2">
                Info
              </h4>
              {[
                ["Lifecycle", selected.lifecycle],
                ["Last Seen", selected.lastSeen],
                ["Cert Expiry", selected.certExpiry],
                ["Offline Queue", String(selected.offlineQueue)],
                ["GPU Latency", `${selected.gpuLatency}ms`],
                ["Note", selected.note || "—"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between py-0.5 text-[9px] border-b border-wf-border last:border-0">
                  <span className="text-wf-subtext">{l}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}

              {selected.offlineQueue > 0 && (
                <div className="mt-2 p-2 rounded bg-wf-red/5 border border-wf-red/20">
                  <div className="text-[8px] font-bold text-wf-red">⚠ Offline Queue</div>
                  <div className="text-[8px] text-wf-subtext">
                    {selected.offlineQueue} events queued — will sync on reconnection
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {tab === "Pairing" && <PairingTab />}

      {tab !== "Fleet" && tab !== "Pairing" && (
        <Card>
          <div className="text-center py-8 text-wf-muted text-[11px]">
            <span className="text-lg mb-2 block">🚧</span>
            {tab} — Coming in Phase 1c
          </div>
        </Card>
      )}
    </div>
  );
}
