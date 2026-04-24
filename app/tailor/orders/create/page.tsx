"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLoading } from "@/components/ui/wearify-ui";

export default function CreateOrderPage() {
  const router = useRouter();
  const [tailorId, setTailorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saree, setSaree] = useState("");
  const [fabric, setFabric] = useState("");
  const [service, setService] = useState("");
  const [price, setPrice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("wearify_auth_user") || "{}");
      if (userData.tailorId) setTailorId(userData.tailorId);
    } catch {
      // ignore
    }
  }, []);

  const profile = useQuery(
    api.tailorOps.getByTailorId,
    tailorId ? { tailorId } : "skip"
  );

  const createOrder = useMutation(api.tailorOps.createOrder);

  if (!tailorId || profile === undefined) {
    return <PageLoading />;
  }

  const serviceOptions = profile?.services?.filter((s) => s.active) || [];

  async function handleSubmit() {
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (customerPhone.length < 10) {
      setError("Enter a valid phone number");
      return;
    }
    if (!service) {
      setError("Select a service type");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Enter a valid price");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createOrder({
        tailorId: tailorId!,
        tailorName: profile!.name,
        customerName,
        customerPhone: "+91" + customerPhone,
        saree: saree || undefined,
        fabric: fabric || undefined,
        service,
        priceQuoted: Number(price),
        dueDate: dueDate || undefined,
        orderDate: new Date().toISOString().split("T")[0],
        note: note || undefined,
      });
      router.push("/tailor/orders");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="t-screen">
      <div className="t-topbar">
        <button
          type="button"
          className="t-back"
          onClick={() => router.push("/tailor/orders")}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1>New order</h1>
        <div style={{ width: 36 }} />
      </div>

      {error && (
        <div
          style={{
            margin: "0 20px 12px",
            padding: "10px 14px",
            background: "var(--urgent-tint)",
            color: "var(--urgent)",
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="t-field">
          <label>Customer name *</label>
          <input
            className="t-input"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer full name"
          />
        </div>

        <div className="t-field">
          <label>Customer phone *</label>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              background: "var(--paper)",
              border: "1px solid var(--line-2)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <span
              className="t-mono"
              style={{
                padding: "12px 14px",
                color: "var(--ink-3)",
                fontSize: 15,
                background: "var(--ivory-2)",
                borderRight: "1px solid var(--line)",
              }}
            >
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              className="t-mono"
              maxLength={10}
              style={{
                flex: 1,
                padding: "12px 14px",
                fontSize: 16,
                border: 0,
                outline: "none",
                background: "transparent",
                color: "var(--ink)",
                letterSpacing: "0.02em",
              }}
            />
          </div>
        </div>

        <div className="t-field">
          <label>Saree / description</label>
          <input
            className="t-input"
            type="text"
            value={saree}
            onChange={(e) => setSaree(e.target.value)}
            placeholder="e.g. Banarasi Silk Wedding Saree"
          />
        </div>

        <div className="t-field">
          <label>Fabric type</label>
          <input
            className="t-input"
            type="text"
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            placeholder="e.g. Silk, Cotton, Georgette"
          />
        </div>

        <div className="t-field">
          <label>Service type *</label>
          {serviceOptions.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {serviceOptions.map((svc) => {
                const on = service === svc.name;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setService(svc.name)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: on ? "var(--maroon-tint)" : "var(--paper)",
                      color: on ? "var(--maroon-ink)" : "var(--ink-3)",
                      border: `1px solid ${on ? "rgba(123, 29, 29, 0.2)" : "var(--line-2)"}`,
                    }}
                  >
                    {svc.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <input
              className="t-input"
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Silk Blouse Stitching"
            />
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="t-field">
            <label>Price (₹) *</label>
            <input
              className="t-input t-mono"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="t-field">
            <label>Due date</label>
            <input
              className="t-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="t-field">
          <label>Notes</label>
          <textarea
            className="t-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional notes…"
            rows={3}
            style={{ resize: "none", fontFamily: "inherit" }}
          />
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <button
          type="button"
          className="t-btn t-btn-primary t-btn-full t-btn-lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating…" : "Create order"}
        </button>
      </div>
    </div>
  );
}
