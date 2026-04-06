"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Btn, PageLoading } from "@/components/ui/wearify-ui";

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/tailor/orders")}
          className="p-1 rounded-lg hover:bg-wf-card transition-colors bg-transparent border-none cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wf-text">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-wf-text">New Order</h1>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-lg bg-wf-red/10 text-wf-red text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Customer Name *</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer full name"
            className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Customer Phone *</label>
          <div className="flex items-center border border-wf-border rounded-lg bg-white overflow-hidden">
            <span className="px-3 text-sm text-wf-muted font-mono bg-wf-card border-r border-wf-border py-2.5">+91</span>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Phone number"
              className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-wf-text"
              maxLength={10}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Saree / Description</label>
          <input
            type="text"
            value={saree}
            onChange={(e) => setSaree(e.target.value)}
            placeholder="e.g. Banarasi Silk Wedding Saree"
            className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Fabric Type</label>
          <input
            type="text"
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            placeholder="e.g. Silk, Cotton, Georgette"
            className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Service Type *</label>
          {serviceOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setService(svc.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                    service === svc.name
                      ? "bg-wf-primary/10 text-wf-primary border-wf-primary"
                      : "bg-white text-wf-subtext border-wf-border"
                  }`}
                >
                  {svc.name}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Silk Blouse Stitching"
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-wf-text mb-1.5">Price (Rs.) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-wf-text mb-1.5">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-wf-text mb-1.5">Notes</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional notes..."
            rows={3}
            className="w-full px-4 py-2.5 text-sm border border-wf-border rounded-lg outline-none bg-white text-wf-text resize-none"
          />
        </div>

        <Btn primary className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create Order"}
        </Btn>
      </div>
    </div>
  );
}
