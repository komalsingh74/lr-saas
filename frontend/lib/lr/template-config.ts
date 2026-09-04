// lib/lr/template-config.ts
// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for LR receipt templates.
// Both the "Receipt Templates" customize page and the LRList
// (view / print / PDF / WhatsApp) import from here.
// Add a new colour, field, or template ONLY in this file.
// ─────────────────────────────────────────────────────────────

export type HeaderStyle = "bordered" | "gradient" | "minimal";

export interface LRTemplateConfig {
  color: string;              // id from COLORS, or "custom"
  customColor?: string | null;
  headerStyle: HeaderStyle;
  bgColor?: string;
  showHeaderBg?: boolean;      // false = white header with coloured underline
  authName?: string;
  footerText?: string;         // jurisdiction / GSTIN line
  logo?: string | null;        // base64 or URL
  fields: Record<string, boolean>;
}

export const COLORS = [
  { id: "crimson", name: "Crimson Red", tag: "Traditional", hex: "#B4232E", dark: "#7A1620" },
  { id: "indigo", name: "Corporate Indigo", tag: "Corporate", hex: "#3949AB", dark: "#232F73" },
  { id: "purple", name: "Tax Purple", tag: "GST", hex: "#6D28D9", dark: "#4C1D95" },
  { id: "forest", name: "Forest Green", tag: "Eco Fleet", hex: "#166534", dark: "#0E3B1F" },
  { id: "charcoal", name: "Charcoal Black", tag: "Premium", hex: "#27272A", dark: "#0A0A0B" },
  { id: "teal", name: "Highway Teal", tag: "Fleet", hex: "#0F766E", dark: "#0A4A45" },
];

export const HEADER_STYLES = [
  { id: "bordered", name: "Bordered Classic", hint: "Boxed border" },
  { id: "gradient", name: "Gradient Bar", hint: "Bold colour band" },
  { id: "minimal", name: "Minimal Rule", hint: "Slim underline" },
];

export function darken(hex: string, amt: number) {
  let c = (hex || "#4338CA").replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const num = parseInt(c, 16);
  let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  r = Math.max(0, Math.round(r * (1 - amt / 100)));
  g = Math.max(0, Math.round(g * (1 - amt / 100)));
  b = Math.max(0, Math.round(b * (1 - amt / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getColor(config: Partial<LRTemplateConfig>) {
  if (config.color === "custom" && config.customColor) {
    return { id: "custom", name: "Custom Colour", hex: config.customColor, dark: darken(config.customColor, 32) };
  }
  return COLORS.find((c) => c.id === config.color) || COLORS[0];
}

// Every toggleable field lives here ONCE. Add a new field = add one line here.
export const FIELD_GROUPS = [
  {
    title: "Branding",
    fields: [{ id: "companyLogo", label: "Company Logo" }],
  },
  {
    title: "Basic Details",
    fields: [
      { id: "lrNumber", label: "LR Number" },
      { id: "lrDate", label: "LR Date" },
      { id: "status", label: "Status Tag" },
    ],
  },
  {
    title: "Route",
    fields: [
      { id: "fromLocation", label: "From Location" },
      { id: "toLocation", label: "To Location" },
    ],
  },
  {
    title: "Consignor / Consignee",
    fields: [
      { id: "consignorName", label: "Consignor Name" },
      { id: "consignorAddress", label: "Consignor Address" },
      { id: "consigneeName", label: "Consignee Name" },
      { id: "consigneeAddress", label: "Consignee Address" },
    ],
  },
  {
    title: "Transport & Load",
    fields: [
      { id: "vehicleNo", label: "Vehicle Number" },
      { id: "driverName", label: "Driver Name" },
      { id: "driverPhone", label: "Driver Phone" },
      { id: "qty", label: "Quantity" },
      { id: "weight", label: "Weight" },
      { id: "freight", label: "Freight Amount" },
      { id: "paymentMode", label: "Payment Mode" },
      { id: "transportMode", label: "Transport Mode" },
    ],
  },
  {
    title: "Material Description",
    fields: [
      { id: "itemName", label: "Goods / Item" },
      { id: "packages", label: "No. of Packages" },
      { id: "packagingType", label: "Packaging Type" },
      { id: "invoiceNo", label: "Invoice Number" },
      { id: "ewayBill", label: "E-Way Bill No." },
      { id: "freightType", label: "Freight Type" },
    ],
  },
  {
    title: "Signatures & Legal",
    fields: [
      { id: "receiverSignature", label: "Receiver Signature" },
      { id: "authorizedSignature", label: "Authorized Signature" },
      { id: "jurisdictionText", label: "Jurisdiction Note" },
      { id: "termsConditions", label: "Terms & Conditions" },
    ],
  },
];

export const DEFAULT_FIELDS: Record<string, boolean> = {
  companyLogo: false,
  lrNumber: true, lrDate: true, status: true, fromLocation: true, toLocation: true,
  consignorName: true, consignorAddress: true, consigneeName: true, consigneeAddress: true,
  vehicleNo: true, driverName: true, driverPhone: false, qty: true, weight: true, freight: true,
  paymentMode: true, transportMode: false, itemName: true, packages: true, packagingType: true,
  invoiceNo: false, ewayBill: false, freightType: true, receiverSignature: true,
  authorizedSignature: true, jurisdictionText: true, termsConditions: false,
};

export interface TemplateDef {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
  tags: string;
  defaults: Partial<LRTemplateConfig>;
}

// NOTE: all three below render through the SAME <LRReceiptRenderer/>.
// They only differ by headerStyle + colour + copy. To add a 4th template,
// add one entry here — no new component needed.
export const TEMPLATE_DEFS: TemplateDef[] = [
  {
    id: "classic", name: "Classic Bilty", badge: "Most Popular", badgeColor: "#EA580C",
    desc: "Bilingual, bordered format", tags: "Popular: Delhi • Agra • UP",
    defaults: {
      color: "crimson", headerStyle: "bordered", bgColor: "#FFFFFF",
      footerText: "Subject to Agra / Delhi Jurisdiction", authName: "Shree Logistics", logo: null,
    },
  },
  {
    id: "modern", name: "Modern Bilty", badge: "Premium", badgeColor: "#2563EB",
    desc: "Clean gradient header", tags: "Popular: Delhi • Noida • Gurgaon",
    defaults: {
      color: "indigo", headerStyle: "gradient", bgColor: "#FFFFFF",
      footerText: "Subject to Agra Jurisdiction only", authName: "Shree Logistics", logo: null,
    },
  },
  {
    id: "gst", name: "GST Format", badge: "Tax Ready", badgeColor: "#7C3AED",
    desc: "GSTIN-ready layout", tags: "Popular: Interstate • Trade",
    defaults: {
      color: "purple", headerStyle: "gradient", bgColor: "#FFFFFF",
      footerText: "GSTIN: 09XXXXX1234X1Z5 · Subject to Agra Jurisdiction", authName: "Shree Logistics", logo: null,
    },
  },
];

export const LOCKED_TEMPLATES = [
  { id: "thermal", name: "Thermal Print", badge: "Fast Print", badgeColor: "#16A34A", desc: "58/80mm thermal roll format", tags: "Popular: Local • Short Haul" },
  { id: "a4", name: "A4 Invoice Style", badge: "Corporate", badgeColor: "#18181B", desc: "Full A4 invoice-style layout", tags: "Popular: Corporate • Premium" },
];

export function buildInitialConfigs(): Record<string, LRTemplateConfig> {
  const map: Record<string, LRTemplateConfig> = {};
  TEMPLATE_DEFS.forEach((t) => {
    map[t.id] = { ...(t.defaults as LRTemplateConfig), customColor: null, fields: { ...DEFAULT_FIELDS } };
  });
  return map;
}

// ─────────────────────────────────────────────────────────────
// Canonical data shape the renderer consumes. Both the sample
// preview data AND real LR-list data are mapped into this shape,
// so the renderer never needs to know which one it's looking at.
// ─────────────────────────────────────────────────────────────
export interface ReceiptData {
  lrNumber: string;
  date: string;          // pre-formatted display string
  status: string;
  from: string;
  to: string;
  consignorName: string;
  consignorAddress?: string;
  consigneeName: string;
  consigneeAddress?: string;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  qty?: string | number;
  weight?: string | number;
  freight?: string | number;
  paymentMode?: string;
  transportMode?: string;
  itemName?: string;
  packages?: string | number;
  packagingType?: string;
  invoiceNo?: string;
  ewayBill?: string;
  freightType?: string;
  qrUrl?: string;
}

export const SAMPLE_RECEIPT_DATA: ReceiptData = {
  lrNumber: "LR-AGR-9982", date: "05 Jun 2026", status: "Pending",
  from: "Agra", to: "Delhi",
  consignorName: "Shree Ganesh Goods", consignorAddress: "Agra",
  consigneeName: "Delhi Leather Co.", consigneeAddress: "Delhi",
  vehicleNo: "UP80 T 7453", driverName: "Ravi Kumar", driverPhone: "+91 98765 43210",
  qty: "40 Bags", weight: "320 kg", freight: "23,300", paymentMode: "To Pay", transportMode: "Road",
  itemName: "Shoe Materials", packages: "40", packagingType: "Bags",
  invoiceNo: "INV-2201", ewayBill: "EWB-3300113309", freightType: "To Pay",
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN");
};

// Maps your real Mongo LR document (as normalized in LRList) into ReceiptData.
export function mapLRItemToReceiptData(lr: any): ReceiptData {
  return {
    lrNumber: lr.lrNumber || lr._id,
    date: formatDate(lr.date),
    status: lr.status || "",
    from: lr.from || "",
    to: lr.to || "",
    consignorName: lr.consignor || "",
    consigneeName: lr.consignee || "",
    vehicleNo: lr.vehicleNumber || "",
    driverName: lr.driverName || "",
    qty: lr.quantity ?? "",
    weight: lr.weight ?? "",
    freight: lr.freight != null ? Number(lr.freight).toLocaleString("en-IN") : "",
    paymentMode: lr.paymentType || "",
    transportMode: lr.transportMode || "",
    itemName: lr.itemName || "",
    packages: lr.noOfPackages ?? "",
    packagingType: lr.packagingType || "",
    invoiceNo: lr.invoiceNumber || "",
    ewayBill: lr.eWayBill || "",
    freightType: lr.freightType || "",
    qrUrl: lr.trackingToken ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/public/track/qr/${lr.trackingToken}` : "",
  };
}