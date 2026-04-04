"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { KPI, Card, Badge, Row, Tabs, PageLoading } from "@/components/ui/wearify-ui";

const CONFLICTS = [
  {
    a: "AGT-01",
    b: "AGT-02",
    resource: "Saree S-442 (Chanderi)",
    issue:
      "AGT-01 marked for liquidation; AGT-02 included in new arrival campaign",
    fix: "Inventory status is source of truth. Campaign adjusted to exclude liquidation items.",
    status: "resolved",
    time: "2h ago",
  },
  {
    a: "AGT-05",
    b: "AGT-01",
    resource: "Silk category (Kanchi)",
    issue:
      "Pricing agent recommends 20% discount; Inventory agent recommends bundle",
    fix: "First-approved action wins. Pricing locked item. Bundle adjusted to exclude.",
    status: "resolved",
    time: "1d ago",
  },
];

export default function AgentsPage() {
  const agents = useQuery(api.agents.list);
  const tools = useQuery(api.agents.listTools);
  const [tab, setTab] = useState("Agent Registry");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  if (!agents || !tools) return <PageLoading />;

  const runningCount = agents.filter((a) => a.status === "running").length;
  const totalActions = agents.reduce((sum, a) => sum + a.actions, 0);
  const avgAccuracy =
    agents.length > 0
      ? (agents.reduce((sum, a) => sum + a.accuracy, 0) / agents.length).toFixed(1)
      : "0";
  const dailyCost = agents
    .reduce((sum, a) => sum + a.costPerDay, 0)
    .toFixed(0);

  return (
    <div>
      <h1 className="text-base font-extrabold text-wf-text mb-1">
        AI Agent Control Plane
      </h1>
      <p className="text-[10px] text-wf-subtext mb-3">
        {agents.length} agents registered — {runningCount} running —{" "}
        {new Date().toLocaleTimeString()}
      </p>

      <Tabs
        items={["Agent Registry", "Tool Registry", "Conflicts"]}
        active={tab}
        onChange={setTab}
      />

      {/* ================================================================
          Agent Registry Tab
          ================================================================ */}
      {tab === "Agent Registry" && (
        <div>
          {/* KPI Row */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <KPI
              label="Running Agents"
              value={`${runningCount}/${agents.length}`}
              subtitle="active now"
              ai
            />
            <KPI
              label="Total Actions Today"
              value={totalActions}
              subtitle="across all agents"
            />
            <KPI
              label="Avg Accuracy"
              value={`${avgAccuracy}%`}
              subtitle="target >90%"
              color={
                parseFloat(avgAccuracy) >= 90
                  ? "var(--color-wf-green)"
                  : "var(--color-wf-amber)"
              }
            />
            <KPI
              label="Daily Cost"
              value={`₹${dailyCost}`}
              subtitle="all agents"
              color="var(--color-wf-amber)"
            />
          </div>

          {/* Agent List */}
          <Card title="All Agents">
            {/* Table Header */}
            <div className="flex py-1.5 border-b border-wf-border text-[8px] font-bold text-wf-muted uppercase tracking-wider">
              <span className="w-[60px]">ID</span>
              <span className="flex-1">Agent</span>
              <span className="w-[55px]">Phase</span>
              <span className="w-[70px]">Mode</span>
              <span className="w-[60px]">Status</span>
              <span className="w-[55px] text-right">Actions</span>
              <span className="w-[55px] text-right">Acc %</span>
              <span className="w-[55px] text-right">Cost/d</span>
              <span className="w-[50px] text-right">Stores</span>
              <span className="w-[55px] text-right">Cycle</span>
            </div>

            {agents.map((agent) => (
              <div key={agent._id}>
                <Row
                  onClick={() =>
                    setExpandedAgent(
                      expandedAgent === agent.agentId ? null : agent.agentId
                    )
                  }
                >
                  <span className="w-[60px] font-mono text-[8px] text-wf-muted">
                    {agent.agentId}
                  </span>
                  <span className="flex-1 font-semibold text-[10px]">
                    {agent.name}
                  </span>
                  <span className="w-[55px] text-[9px] font-mono text-wf-subtext">
                    {agent.phase}
                  </span>
                  <span className="w-[70px]">
                    <Badge status={agent.mode}>{agent.mode}</Badge>
                  </span>
                  <span className="w-[60px]">
                    <Badge status={agent.status}>{agent.status}</Badge>
                  </span>
                  <span className="w-[55px] text-right text-[9px] font-mono">
                    {agent.actions}
                  </span>
                  <span className="w-[55px] text-right">
                    <span
                      className="text-[9px] font-mono font-semibold"
                      style={{
                        color:
                          agent.accuracy >= 95
                            ? "var(--color-wf-green)"
                            : agent.accuracy >= 85
                              ? "var(--color-wf-amber)"
                              : "var(--color-wf-red)",
                      }}
                    >
                      {agent.accuracy}%
                    </span>
                  </span>
                  <span className="w-[55px] text-right text-[9px] font-mono text-wf-subtext">
                    ₹{agent.costPerDay}
                  </span>
                  <span className="w-[50px] text-right text-[9px] font-mono text-wf-subtext">
                    {agent.storesUsing}
                  </span>
                  <span className="w-[55px] text-right text-[9px] font-mono text-wf-subtext">
                    {agent.cycleTime}
                  </span>
                </Row>

                {/* Expanded Details */}
                {expandedAgent === agent.agentId && (
                  <div className="bg-wf-primary/5 rounded px-4 py-3 mb-1 border-l-2 border-wf-primary">
                    <div className="mb-2">
                      <div className="text-[8px] font-bold text-wf-muted uppercase tracking-wider mb-1">
                        Last Result
                      </div>
                      <div className="text-[10px] text-wf-text">
                        {agent.lastResult || "No result recorded"}
                      </div>
                    </div>
                    {agent.humanComparison && (
                      <div>
                        <div className="text-[8px] font-bold text-wf-muted uppercase tracking-wider mb-1">
                          Agent vs Human Comparison
                        </div>
                        <div className="text-[10px] text-wf-text">
                          {agent.humanComparison}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ================================================================
          Tool Registry Tab
          ================================================================ */}
      {tab === "Tool Registry" && (
        <div>
          <Card title="Registered Tools">
            {/* Table Header */}
            <div className="flex py-1.5 border-b border-wf-border text-[8px] font-bold text-wf-muted uppercase tracking-wider">
              <span className="w-[55px]">ID</span>
              <span className="w-[120px]">Tool</span>
              <span className="flex-1">Description</span>
              <span className="w-[100px]">Agents</span>
              <span className="w-[70px]">Approval</span>
              <span className="w-[55px] text-right">Used</span>
              <span className="w-[50px] text-right">Limit</span>
            </div>

            {tools.map((tool) => (
              <Row key={tool._id}>
                <span className="w-[55px] font-mono text-[8px] text-wf-muted">
                  {tool.toolId}
                </span>
                <span className="w-[120px] font-semibold text-[10px]">
                  {tool.name}
                </span>
                <span className="flex-1 text-[9px] text-wf-subtext truncate">
                  {tool.description}
                </span>
                <span className="w-[100px] text-[8px] font-mono text-wf-subtext truncate">
                  {tool.agents}
                </span>
                <span className="w-[70px]">
                  <Badge
                    status={
                      tool.approval === "auto"
                        ? "autonomous"
                        : tool.approval === "human"
                          ? "review"
                          : "supervised"
                    }
                  >
                    {tool.approval}
                  </Badge>
                </span>
                <span className="w-[55px] text-right text-[9px] font-mono">
                  {tool.usedToday}
                </span>
                <span className="w-[50px] text-right text-[9px] font-mono text-wf-subtext">
                  {tool.limit}
                </span>
              </Row>
            ))}
          </Card>
        </div>
      )}

      {/* ================================================================
          Conflicts Tab
          ================================================================ */}
      {tab === "Conflicts" && (
        <div>
          <div className="flex gap-2 mb-3">
            <KPI
              label="Total Conflicts"
              value={CONFLICTS.length}
              subtitle="all resolved"
            />
            <KPI
              label="Resolution"
              value="100%"
              subtitle="auto-mediated"
              color="var(--color-wf-green)"
            />
          </div>

          {CONFLICTS.map((c, i) => (
            <Card key={i}>
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] font-bold text-wf-primary">
                      {c.a}
                    </span>
                    <span className="text-[9px] text-wf-muted">vs</span>
                    <span className="font-mono text-[9px] font-bold text-wf-primary">
                      {c.b}
                    </span>
                    <Badge status={c.status}>{c.status}</Badge>
                    <span className="text-[8px] text-wf-muted ml-auto">
                      {c.time}
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold text-wf-text mb-1">
                    {c.resource}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="text-[8px] font-bold text-wf-muted uppercase tracking-wider mb-0.5">
                  Issue
                </div>
                <div className="text-[10px] text-wf-text">{c.issue}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-wf-muted uppercase tracking-wider mb-0.5">
                  Resolution
                </div>
                <div className="text-[10px] text-wf-text">{c.fix}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
