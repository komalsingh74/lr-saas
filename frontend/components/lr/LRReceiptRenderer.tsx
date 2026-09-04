"use client";
// components/lr/LRReceiptRenderer.tsx
//
// THE MASTER TEMPLATE.
// One component renders every template (classic / modern / gst / any
// future one) purely from a config object. Do NOT fork this component
// per template — add a headerStyle/option instead. This is what fixes
// "preview looks different from what actually prints/exports": the
// same component is used in all three places.

import React from "react";
import type { LRTemplateConfig, ReceiptData } from "@/lib/lr/template-config";
import { getColor } from "@/lib/lr/template-config";

const FONT = "Arial, Helvetica, sans-serif";

const SECTION_HEADER: React.CSSProperties = {
  background: "#F1F5F9",
  padding: "7px 22px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#475569",
};

export default function LRReceiptRenderer({
  config,
  data,
  width = 620,
}: {
  config: LRTemplateConfig;
  data: ReceiptData;
  width?: number;
}) {
  const f = config.fields || {};
  const color = getColor(config);
  const bgColor = config.bgColor || "#FFFFFF";
  const headerBgOn = config.showHeaderBg !== false;
  const headerTextColor = headerBgOn ? "#FFFFFF" : "#1F2937";
  const headerMutedOpacity = headerBgOn ? 0.8 : 0.65;
  const border = config.headerStyle === "bordered";

  const statusColors: Record<string, [string, string]> = {
    Delivered: ["#D1FAE5", "#065F46"],
    "In Transit": ["#FEF3C7", "#92400E"],
    Pending: ["#FEE2E2", "#991B1B"],
  };
  const [statusBg, statusFg] = statusColors[data.status] || ["#F3F4F6", "#374151"];

  const showConsignor = f.consignorName || f.consigneeName;
  const showRoute = f.fromLocation || f.toLocation;
  const showSignatures = f.receiverSignature || f.authorizedSignature;

  // Transport & Load — real table, columns driven by which fields are on
  const transportCols: { label: string; value: string | number; bold?: boolean }[] = [
    f.vehicleNo && { label: "Vehicle No", value: data.vehicleNo || "—" },
    f.driverName && { label: "Driver", value: data.driverName || "—" },
    f.driverPhone && { label: "Phone", value: data.driverPhone || "—" },
    f.qty && { label: "Qty", value: data.qty ?? "—" },
    f.weight && { label: "Weight (KG)", value: data.weight ?? "—" },
    f.freight && { label: "Freight (₹)", value: data.freight ? `₹${data.freight}` : "—", bold: true },
    f.paymentMode && { label: "Payment", value: data.paymentMode || "—" },
    f.transportMode && { label: "Mode", value: data.transportMode || "—" },
  ].filter(Boolean) as any;

  // Material Description — 3-column grid, rows computed from field count
  const materialCells: { label: string; value: string | number }[] = [
    f.itemName && { label: "Item Name", value: data.itemName || "—" },
    f.packages && { label: "No. of Packages", value: data.packages ?? "—" },
    f.packagingType && { label: "Packaging Type", value: data.packagingType || "—" },
    f.invoiceNo && { label: "Invoice No.", value: data.invoiceNo || "—" },
    f.ewayBill && { label: "E-Way Bill No.", value: data.ewayBill || "—" },
    f.freightType && { label: "Freight Type", value: data.freightType || "—" },
  ].filter(Boolean) as any;
  const materialRows = Math.ceil(materialCells.length / 3);

  return (
    <div style={{ width, fontFamily: FONT, background: bgColor, padding: 8, boxSizing: "border-box" }}>
      <div
        style={{
          width: "100%",
          background: "#fff",
          overflow: "hidden",
          borderRadius: border ? 10 : 12,
          border: border ? `2px solid ${color.hex}` : "1px solid #EDEFF3",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}
      >
        {/* ── HEADER ── */}
        {config.headerStyle === "gradient" && (
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 24px",
              background: headerBgOn ? `linear-gradient(135deg, ${color.hex}, ${color.dark})` : `${color.hex}0D`,
              color: headerTextColor,
              borderBottom: headerBgOn ? "none" : `2px solid ${color.hex}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {f.companyLogo && config.logo && (
                <img src={config.logo} alt="logo" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,.35)" }} />
              )}
              <div>
                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", opacity: headerMutedOpacity, marginBottom: 4 }}>Lorry Receipt</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>{config.authName || "Shree Logistics"}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {f.lrNumber && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.1em", textTransform: "uppercase", opacity: headerMutedOpacity }}>LR No.</div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.5px", color: headerBgOn ? headerTextColor : color.hex }}>{data.lrNumber}</div>
                </>
              )}
              {f.lrDate && <div style={{ fontSize: 11, opacity: headerMutedOpacity, marginTop: 2 }}>{data.date}</div>}
            </div>
          </div>
        )}

        {config.headerStyle === "bordered" && (
          <div style={{ textAlign: "center", padding: "14px 18px 10px", borderBottom: `2px solid ${color.hex}22` }}>
            {f.companyLogo && config.logo && (
              <img src={config.logo} alt="logo" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", margin: "0 auto 6px", border: `2px solid ${color.hex}33` }} />
            )}
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.05em", color: color.hex }}>
              लॉरी रसीद / {(config.authName || "SHREE LOGISTICS").toUpperCase()}
            </div>
            {f.jurisdictionText && <div style={{ fontSize: 9.5, color: "#9CA3AF", marginTop: 3 }}>{config.footerText}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, textAlign: "left" }}>
              {f.lrNumber && (
                <div>
                  <div style={{ fontSize: 8.5, color: "#9CA3AF" }}>LR No.</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: color.hex }}>{data.lrNumber}</div>
                </div>
              )}
              {f.lrDate && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 8.5, color: "#9CA3AF" }}>Date</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1F2937" }}>{data.date}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {config.headerStyle === "minimal" && (
          <div>
            <div style={{ height: 4, background: color.hex }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {f.companyLogo && config.logo && (
                  <img src={config.logo} alt="logo" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: `1.5px solid ${color.hex}40` }} />
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>{config.authName || "Shree Logistics"}</div>
              </div>
              {f.lrNumber && <div style={{ fontSize: 13, fontWeight: 700, color: color.hex }}>{data.lrNumber}</div>}
            </div>
          </div>
        )}

        {/* ── ROUTE + STATUS ── */}
        {(showRoute || f.status) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", padding: "10px 24px" }}>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {f.fromLocation && (
                <div>
                  <div style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>From</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginTop: 2 }}>{data.from || "—"}</div>
                </div>
              )}
              {f.fromLocation && f.toLocation && <div style={{ color: "#94A3B8", paddingTop: 10 }}>→</div>}
              {f.toLocation && (
                <div>
                  <div style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>To</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", marginTop: 2 }}>{data.to || "—"}</div>
                </div>
              )}
            </div>
            {f.status && (
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: statusBg, color: statusFg }}>
                {data.status}
              </span>
            )}
          </div>
        )}

        {/* ── CONSIGNOR / CONSIGNEE ── */}
        {showConsignor && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #E2E8F0", borderTop: "none" }}>
            {f.consignorName && (
              <div style={{ padding: "12px 24px", borderRight: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Consignor (Sender)</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1E293B" }}>{data.consignorName || "—"}</div>
                {f.consignorAddress && <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{data.consignorAddress}</div>}
              </div>
            )}
            {f.consigneeName && (
              <div style={{ padding: "12px 24px" }}>
                <div style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Consignee (Receiver)</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1E293B" }}>{data.consigneeName || "—"}</div>
                {f.consigneeAddress && <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{data.consigneeAddress}</div>}
              </div>
            )}
          </div>
        )}

        {/* ── TRANSPORT & LOAD ── real table, columns follow enabled fields ── */}
        {transportCols.length > 0 && (
          <div style={{ border: "1px solid #E2E8F0", borderTop: "none", overflow: "hidden" }}>
            <div style={SECTION_HEADER}>Transport &amp; Load Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {transportCols.map((col) => (
                    <th key={col.label} style={{ padding: "7px 10px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {transportCols.map((col) => (
                    <td key={col.label} style={{ padding: "9px 10px", color: "#1E293B", fontWeight: col.bold ? 600 : 400, borderRight: "1px solid #E2E8F0" }}>
                      {col.value}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── MATERIAL DESCRIPTION ── 3-column grid ── */}
        {materialCells.length > 0 && (
          <div style={{ border: "1px solid #E2E8F0", borderTop: "none" }}>
            <div style={SECTION_HEADER}>Material Description</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {materialCells.map((cell, idx) => (
                <div
                  key={cell.label}
                  style={{
                    padding: "10px 16px",
                    borderRight: (idx + 1) % 3 !== 0 ? "1px solid #E2E8F0" : "none",
                    borderBottom: Math.floor(idx / 3) < materialRows - 1 ? "1px solid #E2E8F0" : "none",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{cell.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{cell.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SIGNATURES ── */}
        {showSignatures && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #E2E8F0", borderTop: "none", background: "#FAFAFA" }}>
            {f.receiverSignature && (
              <div style={{ padding: "16px 24px", borderRight: f.authorizedSignature ? "1px solid #E2E8F0" : "none" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 36 }}>Receiver Signature</div>
                <div style={{ borderTop: "1px dashed #CBD5E1", paddingTop: 4, fontSize: 10, color: "#94A3B8" }}>Sign above</div>
              </div>
            )}
            {f.authorizedSignature && (
              <div style={{ padding: "16px 24px" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 36 }}>Authorized Signature</div>
                <div style={{ borderTop: "1px dashed #CBD5E1", paddingTop: 4, fontSize: 10, color: "#94A3B8" }}>Sign above</div>
              </div>
            )}
          </div>
        )}

        {/* ── TERMS ── */}
        {f.termsConditions && (
          <div style={{ padding: "8px 22px", fontSize: 8.5, color: "#94A3B8", borderTop: "1px solid #E2E8F0" }}>
            Goods carried at owner's risk. Company not responsible for breakage/leakage unless proven negligence.
          </div>
        )}

        {data.qrUrl && (
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 22px" }}>
            <img src={data.qrUrl} alt="Scan to track LR" width={76} height={76} />
          </div>
        )}
      </div>
    </div>
  );
}