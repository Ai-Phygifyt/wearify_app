"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KPI, Card, Tabs, Badge, Row, Btn, Metric, PageLoading } from "@/components/ui/wearify-ui";
import { useState } from "react";

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
        items={["Fleet", "IoT Shadow", "Provisioning", "Shipping", "Offline Queue"]}
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

      {tab !== "Fleet" && (
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
