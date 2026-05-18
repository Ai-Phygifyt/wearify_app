"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexImage } from "@/lib/ConvexImage";
import { MapPin, Image as ImageIcon } from "lucide-react";

type Tailor = {
  _id: Id<"tailors">;
  tailorId: string;
  name: string;
  phone: string;
  city: string;
  area?: string;
  rating: number;
  reviewCount?: number;
  experience?: string;
  bio?: string;
  badge?: string;
  specialties?: string[];
  referrals?: number;
};

export function TailorDetailView({
  tailor,
  onConnect,
  connecting,
}: {
  tailor: Tailor;
  onConnect: () => void;
  connecting: boolean;
}) {
  const portfolio = useQuery(api.tailorOps.getPortfolio, { tailorId: tailor.tailorId });
  const firstName = (tailor.name || "").trim().split(/\s+/)[0] || tailor.name;
  const happyClients = tailor.referrals ?? tailor.reviewCount ?? 0;
  const initial = (tailor.name || "?").trim().charAt(0).toUpperCase();
  const locationText = [tailor.area, tailor.city].filter(Boolean).join(", ") || tailor.city || "—";

  return (
    <div className="k-tdv">
      <div className="k-tdv-card">
        <div className="k-tdv-top">
          <div className="k-tdv-photo">
            <span className="k-tdv-photo-initial">{initial}</span>
          </div>
          <div className="k-tdv-info">
            <div className="k-tdv-name">{tailor.name}</div>
            <div className="k-tdv-spec">{tailor.specialties?.join(" & ") || "Tailor"}</div>
            <div className="k-tdv-clients">
              <div className="k-tdv-mini-avatars" aria-hidden>
                <span className="k-tdv-mini-avatar k-tdv-mini-1" />
                <span className="k-tdv-mini-avatar k-tdv-mini-2" />
                <span className="k-tdv-mini-avatar k-tdv-mini-3" />
                <span className="k-tdv-mini-avatar k-tdv-mini-4" />
              </div>
              <span className="k-tdv-clients-text">+{happyClients} Happy Clients</span>
            </div>
            <div className="k-tdv-meta-row">
              <MapPin size={11} color="var(--k-maroon)" strokeWidth={2.4} />
              <span className="k-tdv-meta-text">{locationText}</span>
              {tailor.experience && (
                <>
                  <span className="k-tdv-meta-dot" />
                  <span className="k-tdv-meta-text">{tailor.experience} Year Experience</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          className="k-tdv-cta k-press"
          onClick={onConnect}
          disabled={connecting}
        >
          {connecting ? "Connecting…" : `Connect With ${firstName}`}
        </button>
      </div>

      <div className="k-tdv-portfolio-title">Portfolio</div>
      {portfolio === undefined ? (
        <div className="k-tdv-portfolio-loading">Loading…</div>
      ) : portfolio.length === 0 ? (
        <div className="k-tdv-portfolio-empty">
          <ImageIcon size={28} strokeWidth={1.5} />
          <span>No portfolio items yet</span>
        </div>
      ) : (
        <div className="k-tdv-portfolio-grid">
          {portfolio.map((p) => (
            <div key={p._id} className="k-tdv-portfolio-item">
              {p.imageFileId ? (
                <ConvexImage
                  fileId={p.imageFileId}
                  alt={p.tag || "Portfolio"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="k-tdv-portfolio-fallback"
                  style={{
                    background: p.grad
                      ? `linear-gradient(135deg, ${p.grad[0] ?? "#E8E0D4"}, ${p.grad[1] ?? "#D4A843"})`
                      : "linear-gradient(135deg, #E8E0D4, #D4A843)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { TailorDetailView as TailorDetailModal };
