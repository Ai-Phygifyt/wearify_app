"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, Tabs, Toggle, Row, PageLoading } from "@/components/ui/wearify-ui";
import { useState } from "react";

export default function SettingsPage() {
  const flags = useQuery(api.settings.listFlags);
  const config = useQuery(api.settings.listConfig);
  const toggleFlag = useMutation(api.settings.toggleFlag);
  const [tab, setTab] = useState("Platform");

  if (!flags || !config) return <PageLoading />;

  return (
    <div>
      <h1 className="text-base font-extrabold text-wf-text mb-1">
        Settings & Configuration
      </h1>
      <p className="text-[10px] text-wf-subtext mb-3">
        Platform configuration, feature flags, notifications
      </p>

      <Tabs
        items={["Platform", "Feature Flags", "WhatsApp", "Notifications", "Festival Calendar", "Changelog", "On-Call", "Languages"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Platform" && (
        <Card title="Platform Configuration">
          {config.map((c) => (
            <div key={c._id} className="flex justify-between py-1.5 text-[9px] border-b border-wf-border last:border-0">
              <span className="text-wf-subtext font-medium">{c.key}</span>
              <span className="font-semibold text-wf-text font-mono">{c.value}</span>
            </div>
          ))}
        </Card>
      )}

      {tab === "Feature Flags" && (
        <Card title="Feature Flags">
          <div className="flex py-1.5 border-b border-wf-border text-[8px] font-bold text-wf-muted uppercase tracking-wider mb-1">
            <span className="flex-1">Flag</span>
            <span className="w-[250px]">Description</span>
            <span className="w-[50px] text-right">Status</span>
          </div>
          {flags.map((f) => (
            <Row key={f._id}>
              <span className="flex-1 font-mono text-[9px] font-semibold">
                {f.key}
              </span>
              <span className="w-[250px] text-[8px] text-wf-subtext">
                {f.description}
              </span>
              <span className="w-[50px] flex justify-end">
                <Toggle on={f.enabled} onToggle={() => toggleFlag({ id: f._id })} />
              </span>
            </Row>
          ))}
        </Card>
      )}

      {tab !== "Platform" && tab !== "Feature Flags" && (
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
