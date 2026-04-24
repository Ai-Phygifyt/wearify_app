"use client";

import { Fragment } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexImage } from "@/lib/ConvexImage";
import {
  X, Scissors, Star, MapPin, Clock, Award, Briefcase, Image as ImageIcon,
} from "lucide-react";

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
  serviceRadius?: number;
  hoursOpen?: string;
  hoursClose?: string;
  subscription?: string;
  services?: Array<{
    id: string;
    name: string;
    priceMin: number;
    priceMax: number;
    days: number;
    active: boolean;
  }>;
};

export function TailorDetailModal({
  tailor,
  onClose,
  onConnect,
  connecting,
}: {
  tailor: Tailor;
  onClose: () => void;
  onConnect: () => void;
  connecting: boolean;
}) {
  const portfolio = useQuery(api.tailorOps.getPortfolio, { tailorId: tailor.tailorId });
  const activeServices = (tailor.services || []).filter((s) => s.active);
  const hours = tailor.hoursOpen && tailor.hoursClose ? `${tailor.hoursOpen} – ${tailor.hoursClose}` : null;

  return (
    <div className="k-overlay" onClick={onClose}>
      <div
        className="k-modal k-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 640, width: "92%", maxHeight: "90vh", padding: 0, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header strip */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid var(--k-border-l)",
          display: "flex", alignItems: "center", gap: 14, position: "relative",
          background: "linear-gradient(135deg, rgba(104,38,42,.04), rgba(201,148,26,.04))",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #E8E0D4, #D4A843)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}>
            <Scissors size={24} strokeWidth={1.8} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="k-heading" style={{ fontSize: 18, lineHeight: 1.2 }}>{tailor.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--k-text-muted)", marginTop: 4, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Star size={12} color="var(--k-gold)" fill="var(--k-gold)" />
                {tailor.rating?.toFixed(1) ?? "—"}
                {tailor.reviewCount ? ` (${tailor.reviewCount})` : ""}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> {tailor.city}{tailor.area ? `, ${tailor.area}` : ""}
              </span>
              {tailor.badge && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span className="k-chip k-chip-gold" style={{ fontSize: 10, padding: "2px 8px" }}>
                    <Award size={10} /> {tailor.badge}
                  </span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="k-iconbtn k-press" aria-label="Close" style={{ width: 36, height: 36 }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          {/* Quick stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 10, marginBottom: 18,
          }}>
            {tailor.experience && (
              <StatTile icon={<Briefcase size={14} />} label="Experience" value={tailor.experience} />
            )}
            {typeof tailor.referrals === "number" && (
              <StatTile icon={<Award size={14} />} label="Referrals" value={`${tailor.referrals}`} />
            )}
            {hours && (
              <StatTile icon={<Clock size={14} />} label="Hours" value={hours} />
            )}
            {typeof tailor.serviceRadius === "number" && (
              <StatTile icon={<MapPin size={14} />} label="Radius" value={`${tailor.serviceRadius} km`} />
            )}
          </div>

          {/* Bio */}
          {tailor.bio && (
            <Section title="About">
              <p style={{ fontSize: 13, color: "var(--k-text)", lineHeight: 1.6, margin: 0 }}>
                {tailor.bio}
              </p>
            </Section>
          )}

          {/* Specialties */}
          {tailor.specialties && tailor.specialties.length > 0 && (
            <Section title="Specialties">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tailor.specialties.map((s) => (
                  <span key={s} className="k-chip" style={{ fontSize: 11, padding: "4px 10px" }}>{s}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Services + pricing — 5-col CSS grid so price parts align across rows */}
          {activeServices.length > 0 && (
            <Section title="Services">
              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) max-content max-content max-content max-content",
                columnGap: 14,
                rowGap: 0,
                background: "var(--k-bg)",
                border: "1px solid var(--k-border-l)",
                borderRadius: 12,
                overflow: "hidden",
              }}>
                {activeServices.map((s, i) => {
                  const topBorder = i > 0 ? "1px solid var(--k-border-l)" : "none";
                  const base: React.CSSProperties = {
                    padding: "12px 0",
                    borderTop: topBorder,
                    display: "flex",
                    alignItems: "center",
                  };
                  return (
                    <Fragment key={s.id}>
                      {/* Service name */}
                      <div style={{ ...base, paddingLeft: 14, minWidth: 0 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {s.name}
                        </span>
                      </div>
                      {/* Days */}
                      <div style={{ ...base, fontSize: 11, color: "var(--k-text-muted)", whiteSpace: "nowrap" }}>
                        {s.days} {s.days === 1 ? "day" : "days"}
                      </div>
                      {/* Min price */}
                      <div
                        className="k-mono"
                        style={{
                          ...base,
                          fontSize: 13, fontWeight: 700, color: "var(--k-maroon)",
                          justifyContent: "flex-end", fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ₹{s.priceMin.toLocaleString("en-IN")}
                      </div>
                      {/* Dash */}
                      <div style={{
                        ...base,
                        fontSize: 13, color: "var(--k-text-muted)", opacity: 0.55,
                        justifyContent: "center",
                      }}>
                        –
                      </div>
                      {/* Max price */}
                      <div
                        className="k-mono"
                        style={{
                          ...base,
                          paddingRight: 14,
                          fontSize: 13, fontWeight: 700, color: "var(--k-maroon)",
                          justifyContent: "flex-end", fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ₹{s.priceMax.toLocaleString("en-IN")}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Portfolio */}
          <Section title="Portfolio">
            {portfolio === undefined ? (
              <div style={{ fontSize: 12, color: "var(--k-text-muted)" }}>Loading…</div>
            ) : portfolio.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "24px 0", color: "var(--k-text-muted)", fontSize: 12, gap: 8,
              }}>
                <ImageIcon size={28} strokeWidth={1.5} />
                <span>No portfolio items yet</span>
              </div>
            ) : (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8,
              }}>
                {portfolio.map((p) => (
                  <div key={p._id} style={{
                    aspectRatio: "3 / 4", borderRadius: 10, overflow: "hidden",
                    background: p.grad
                      ? `linear-gradient(135deg, ${p.grad[0] ?? "#E8E0D4"}, ${p.grad[1] ?? "#D4A843"})`
                      : "linear-gradient(135deg, #E8E0D4, #D4A843)",
                    position: "relative",
                    border: "1px solid var(--k-border-l)",
                  }}>
                    {p.imageFileId && (
                      <ConvexImage
                        fileId={p.imageFileId}
                        alt={p.tag || "Portfolio"}
                        style={{ width: "100%", height: "100%" }}
                      />
                    )}
                    {(p.tag || p.occasion) && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        padding: "6px 8px", fontSize: 10, fontWeight: 600, color: "#fff",
                        background: "linear-gradient(180deg, transparent, rgba(0,0,0,.55))",
                      }}>
                        {p.tag || p.occasion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Footer CTA */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid var(--k-border-l)",
          display: "flex", gap: 10, background: "var(--k-card)",
        }}>
          <button onClick={onClose} className="k-btn k-btn-secondary k-btn-pill k-press" style={{ flex: 1, fontSize: 13 }}>
            Close
          </button>
          <button
            onClick={onConnect}
            disabled={connecting}
            className="k-btn k-btn-primary k-btn-pill k-press"
            style={{ flex: 2, fontSize: 13, fontWeight: 600, opacity: connecting ? 0.6 : 1 }}
          >
            {connecting ? "Connecting…" : "Connect on WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 10, background: "var(--k-bg)",
      border: "1px solid var(--k-border-l)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--k-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
        color: "var(--k-text-muted)", marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
