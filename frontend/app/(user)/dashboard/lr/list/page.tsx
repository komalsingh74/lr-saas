"use client";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useReactToPrint } from "react-to-print";
import { useTranslations } from "next-intl";
import { Eye, Pencil, Ban, Check, Search, Printer, DownloadCloud, MapPin, Send, Clock, Lightbulb, Truck, X, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCompany } from "@/app/company-context";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { Input } from "@/components/ui/input";
import CreateLR from "@/app/(user)/dashboard/lr/create/page";

// ── shared template system ──────────────────────────────────
import LRReceiptRenderer from "@/components/lr/LRReceiptRenderer";
import { downloadReceiptsPdf } from "@/lib/lr/pdf-export";
import {
    buildInitialConfigs, mapLRItemToReceiptData,
    type LRTemplateConfig, type ReceiptData,
} from "@/lib/lr/template-config";

type LRItem = {
    _id: string;
    lrNumber?: string;
    date: string;
    from: string;
    to: string;
    consignor: string;
    consignee: string;
    consigneePhone?: string;
    status: string;
    freight: number;
    paymentType: string;
    vehicleNumber?: string;
    driverName?: string;
    quantity?: number;
    weight?: number;
    freightType?: string;
    transportMode?: string;
    itemName?: string;
    noOfPackages?: number;
    packagingType?: string;
    invoiceNumber?: string;
    eWayBill?: string;
    totalAmount?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    consignorId?: string;
    consigneeId?: string;
    fromCityId?: string;
    toCityId?: string;
    vehicleId?: string;
    itemId?: string;
    taxable?: boolean;
    gstPercent?: number | string;
    isActive?: boolean;
    trackingToken?: string;
    trackingRemarks?: string;
    trackingUpdatedAt?: string;
};

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-5 h-5 fill-green-500">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.821.739 5.574 2.145 7.999L0 32l8.203-2.113A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.057 22.387c-.337.949-1.978 1.782-2.726 1.888-.7.1-1.574.142-2.54-.163-.587-.187-1.342-.438-2.318-.861-4.076-1.764-6.725-5.857-6.929-6.137-.204-.28-1.656-2.205-1.656-4.205 0-2 1.047-2.983 1.418-3.388.37-.405.808-.506 1.078-.506.27 0 .54.003.776.014.25.011.585-.095.916.701.337.812 1.147 2.808 1.247 3.011.101.203.168.442.034.722-.135.28-.202.454-.404.701-.202.247-.424.552-.605.742-.202.202-.412.421-.177.825.236.404 1.049 1.728 2.252 2.802 1.546 1.379 2.849 1.806 3.253 2.008.404.202.639.169.875-.101.236-.27 1.012-1.178 1.283-1.582.27-.404.539-.337.909-.202.37.135 2.341 1.104 2.745 1.304.404.202.674.303.775.471.101.168.101.973-.236 1.922z" />
    </svg>
);

const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN");
};

/* ── Tracking timeline config ──────────────────────────────────────────
   Maps the LR's real status (Pending / In Transit / Delivered) onto a
   friendlier 5-stage shipment timeline for the tracking modal. ──────── */
const TRACKING_STAGES: Array<{ key: string; label: string; getDesc: (lr: LRItem) => string }> = [
    { key: "created", label: "LR Created", getDesc: () => "LR has been created successfully." },
    { key: "picked", label: "Picked Up", getDesc: (lr) => `Shipment has been picked up from ${lr.from || "origin"}.` },
    { key: "transit", label: "In Transit", getDesc: (lr) => `Shipment is on the way from ${lr.from || "origin"} to ${lr.to || "destination"}.` },
    { key: "out", label: "Out for Delivery", getDesc: () => "Shipment is out for delivery." },
    { key: "delivered", label: "Delivered", getDesc: () => "Shipment has been delivered successfully." },
];

const getTrackingStageIndex = (status: string) => {
    if (status === "Delivered") return 4;
    if (status === "In Transit") return 2;
    return 0; // Pending / unknown
};

const getTrackingStageState = (status: string, idx: number): "completed" | "current" | "pending" => {
    if (status === "Delivered") return "completed";
    const currentIdx = getTrackingStageIndex(status);
    if (idx < currentIdx) return "completed";
    if (idx === currentIdx) return "current";
    return "pending";
};

const formatTrackingTimestamp = (
    lr: LRItem,
    stageKey: string,
    lastUpdated: { date: string; by: string } | null
) => {
    if (stageKey === "created") return formatDate(lr.date);
    if (lastUpdated) {
        const d = new Date(lastUpdated.date);
        if (!Number.isNaN(d.getTime())) {
            return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
        }
    }
    return "—";
};

/* ═══════════════════════════════════════════════════════════════════════════
   Main LRList Component
═══════════════════════════════════════════════════════════════════════════ */
export default function LRList() {
    const t = useTranslations();
    const [search, setSearch] = useState("");
    const [recordFilter, setRecordFilter] = useState<"all" | "active" | "inactive">("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
    const [selected, setSelected] = useState<Set<string>>(() => new Set());
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [lrData, setLrData] = useState<LRItem[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"view" | "edit" | null>(null);
    const [activeLR, setActiveLR] = useState<LRItem | null>(null);
    const [editForm, setEditForm] = useState<LRItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [exportBusy, setExportBusy] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [deleteAction, setDeleteAction] = useState<"activate" | "deactivate">("deactivate");

    // ── Tracking modal state ──────────────────────────────────────────
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
    const [trackingLR, setTrackingLR] = useState<LRItem | null>(null);
    const [trackingStatus, setTrackingStatus] = useState("");
    const [trackingRemarks, setTrackingRemarks] = useState("");
    const [trackingLastUpdated, setTrackingLastUpdated] = useState<{ date: string; by: string } | null>(null);
    const [trackingBusy, setTrackingBusy] = useState(false);
    const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [cities, setCities] = useState<Array<{ _id: string; cityName: string }>>([]);
    const [vehicles, setVehicles] = useState<Array<{ _id: string; vehicleNumber: string; vehicleType?: string; ownerName?: string; ownerPhone?: string; capacity?: number }>>([]);
    const [items, setItems] = useState<Array<{ _id: string; itemName: string }>>([]);
    const [parties, setParties] = useState<Array<{ _id: string; partyName: string }>>([]);
    const [vehicleDetails, setVehicleDetails] = useState<any>(null);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const [copyLR, setCopyLR] = useState<any | null>(null);
    const [copyLoading, setCopyLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const translateStatus = (status: string) => {
        if (status === "In Transit") return t("inTransit");
        if (status === "Delivered") return t("delivered");
        if (status === "Pending") return t("pending");
        return status;
    };

    const translatePaymentType = (paymentType: string) => {
        if (paymentType === "To Pay") return t("toPay");
        if (paymentType === "Paid") return t("paid");
        return paymentType;
    };

    // ── the ONE place that resolves "which template + which fields
    //    is this company using right now" ─────────────────────────
    const { company } = useCompany();
    const selectedTemplateId = company?.selectedTemplate || "classic";
    const selectedTemplateConfig: LRTemplateConfig =
        company?.receiptTemplateConfig?.[selectedTemplateId] ||
        buildInitialConfigs()[selectedTemplateId];

    const normalizeLRItem = (lr: any): LRItem => ({
        _id: lr._id,
        lrNumber: lr.lrNumber,
        date: lr.date ? new Date(lr.date).toISOString() : "",
        from: lr.fromCity?.cityName ?? lr.from ?? "",
        to: lr.toCity?.cityName ?? lr.to ?? "",
        consignor: lr.consignor?.partyName ?? lr.consignor ?? "",
        consignee: lr.consignee?.partyName ?? lr.consignee ?? "",
        consigneePhone: lr.consignee?.phone ?? "",
        status: lr.status ?? "",
        freight: lr.freightAmount ?? lr.freight ?? 0,
        paymentType: lr.paymentType ?? "",
        vehicleNumber: lr.vehicle?.vehicleNumber ?? lr.vehicleNumber ?? "",
        driverName: lr.driverName ?? "",
        quantity: lr.quantity ?? 0,
        weight: lr.weight ?? 0,
        freightType: lr.freightType ?? "",
        transportMode: lr.transportMode ?? "",
        itemName: lr.item?.itemName ?? lr.itemName ?? "",
        noOfPackages: lr.noOfPackages ?? 0,
        packagingType: lr.packagingType ?? "",
        invoiceNumber: lr.invoiceNumber ?? "",
        eWayBill: lr.ewayBillNo ?? lr.eWayBill ?? "",
        totalAmount: lr.totalAmount ?? 0,
        cgst: lr.cgst ?? 0,
        sgst: lr.sgst ?? 0,
        igst: lr.igst ?? 0,
        consignorId: lr.consignor?._id ?? (typeof lr.consignor === "string" ? lr.consignor : ""),
        consigneeId: lr.consignee?._id ?? (typeof lr.consignee === "string" ? lr.consignee : ""),
        fromCityId: lr.fromCity?._id ?? (typeof lr.fromCity === "string" ? lr.fromCity : ""),
        toCityId: lr.toCity?._id ?? (typeof lr.toCity === "string" ? lr.toCity : ""),
        vehicleId: lr.vehicle?._id ?? (typeof lr.vehicle === "string" ? lr.vehicle : ""),
        itemId: lr.item?._id ?? (typeof lr.item === "string" ? lr.item : ""),
        taxable: lr.taxable ?? false,
        gstPercent: lr.gstPercent ?? "",
        isActive: lr.isActive !== false,
        trackingToken: lr.trackingToken,
        trackingRemarks: lr.trackingRemarks ?? "",
        trackingUpdatedAt: lr.trackingUpdatedAt,
    });

    const openViewDialog = (item: LRItem) => {
        setActiveLR(item);
        setDialogMode("view");
        setDialogOpen(true);
    };

    const openEditDialog = (item: LRItem) => {
        setActiveLR(item);
        setEditForm({ ...item });
        const vd = vehicles.find(v => v._id === item.vehicleId);
        setVehicleDetails(vd || null);
        setDialogMode("edit");
        setDialogOpen(true);
    };

    const openCopyDialog = async (item: LRItem) => {
        try {
            setCopyLoading(true);
            const response = await api.get(`/lr/${item._id}`);
            setCopyLR(response.data?.lr || item);
            setCopyDialogOpen(true);
        } catch (err: any) {
            showError(err.response?.data?.message || "Failed to load LR details");
        } finally {
            setCopyLoading(false);
        }
    };

    const closeCopyDialog = () => {
        setCopyDialogOpen(false);
        setCopyLR(null);
    };

    const handleEditTaxChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => {
            if (!prev) return prev;
            const updated: any = { ...prev, [name]: value };
            if (updated.taxable && (name === "freight" || name === "gstPercent")) {
                const freightAmount = parseFloat(updated.freight) || 0;
                const gstPct = parseFloat(updated.gstPercent) || 0;
                if (freightAmount > 0 && gstPct > 0) {
                    const gstAmount = (freightAmount * gstPct) / 100;
                    updated.cgst = Math.round((gstAmount / 2) * 100) / 100;
                    updated.sgst = Math.round((gstAmount / 2) * 100) / 100;
                    updated.igst = 0;
                    updated.totalAmount = Math.round((freightAmount + gstAmount) * 100) / 100;
                }
            } else if (!updated.taxable && name === "freight") {
                updated.totalAmount = Math.round((parseFloat(updated.freight) || 0) * 100) / 100;
            }
            return updated as LRItem;
        });
    };

    const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;
        if (!editForm) return;

        if (name === "taxable") {
            setEditForm(prev => {
                if (!prev) return prev;
                const updated: any = { ...prev, taxable: checked };
                if (!checked) {
                    updated.gstPercent = "";
                    updated.cgst = 0;
                    updated.sgst = 0;
                    updated.igst = 0;
                    updated.totalAmount = Math.round((parseFloat(updated.freight as any) || 0) * 100) / 100;
                }
                return updated as LRItem;
            });
        } else if (name === "gstPercent" || name === "freight") {
            handleEditTaxChange(e);
        } else {
            setEditForm(prev => prev ? { ...prev, [name]: type === "checkbox" ? checked : value } as LRItem : null);
        }
    };

    const handleEditSelectChange = (name: string, value: string) => {
        setEditForm(prev => {
            if (!prev) return prev;
            const updated: any = { ...prev, [name]: value };
            if (name === "vehicleId") {
                const v = vehicles.find(x => x._id === value);
                setVehicleDetails(v || null);
                updated.vehicleNumber = v?.vehicleNumber || "";
            }
            if (name === "consignorId") updated.consignor = parties.find(x => x._id === value)?.partyName || "";
            if (name === "consigneeId") updated.consignee = parties.find(x => x._id === value)?.partyName || "";
            if (name === "fromCityId") updated.from = cities.find(x => x._id === value)?.cityName || "";
            if (name === "toCityId") updated.to = cities.find(x => x._id === value)?.cityName || "";
            if (name === "itemId") updated.itemName = items.find(x => x._id === value)?.itemName || "";
            return updated as LRItem;
        });
    };

    const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editForm) return;

        if (!editForm.date || !editForm.consignorId || !editForm.consigneeId || !editForm.fromCityId || !editForm.toCityId) {
            showError("Please fill all required fields (date, consignor, consignee, from & to city).");
            return;
        }

        try {
            const payload = {
                date: editForm.date,
                consignor: editForm.consignorId,
                consignee: editForm.consigneeId,
                fromCity: editForm.fromCityId,
                toCity: editForm.toCityId,
                vehicle: editForm.vehicleId,
                driverName: editForm.driverName,
                quantity: editForm.quantity,
                weight: editForm.weight,
                freightAmount: Number(editForm.freight || 0),
                paymentType: editForm.paymentType,
                status: editForm.status,
                freightType: editForm.freightType,
                transportMode: editForm.transportMode,
                item: editForm.itemId,
                noOfPackages: editForm.noOfPackages,
                packagingType: editForm.packagingType,
                invoiceNumber: editForm.invoiceNumber,
                ewayBillNo: editForm.eWayBill,
                taxable: editForm.taxable,
                gstPercent: editForm.gstPercent,
                cgst: editForm.cgst,
                sgst: editForm.sgst,
                igst: editForm.igst,
                totalAmount: editForm.totalAmount,
            };

            const response = await api.put(`/lr/${editForm._id}`, payload);
            const updated = response.data?.lr ? normalizeLRItem(response.data.lr) : editForm;
            setLrData(prev => prev.map(item => item._id === editForm._id ? updated : item));
            showSuccess("LR updated successfully");
            closeDialog();
        } catch (err: any) {
            showError(err.response?.data?.message || "Failed to update LR");
        }
    };

    const closeDialog = () => { setDialogOpen(false); setDialogMode(null); setActiveLR(null); setEditForm(null); };

    const openDeleteDialog = (lrId: string, action: "activate" | "deactivate" = "deactivate") => {
        setDeleteItemId(lrId);
        setDeleteAction(action);
        setDeleteDialogOpen(true);
    };
    const closeDeleteDialog = () => { setDeleteDialogOpen(false); setDeleteItemId(null); };

    const confirmDelete = async () => {
        if (!deleteItemId) return;
        try {
            const isActive = deleteAction === "activate";
            const response = await api.put(`/lr/${deleteItemId}`, { isActive });
            const updated = response.data?.lr ? normalizeLRItem(response.data.lr) : null;
            setLrData(prev => prev.map(item => item._id === deleteItemId ? (updated ?? { ...item, isActive }) : item));
            setRefreshKey((key) => key + 1);
            showSuccess(isActive ? "LR activated successfully" : "LR deactivated successfully");
            closeDeleteDialog();
        } catch (err: any) {
            showError(err.response?.data?.message || "Failed to delete LR");
            closeDeleteDialog();
        }
    };

    // ── Tracking modal handlers ────────────────────────────────────────
    const openTrackingDialog = (item: LRItem) => {
        setTrackingLR(item);
        setTrackingStatus(item.status);
        setTrackingRemarks(item.trackingRemarks ?? "");
        setTrackingLastUpdated({ date: item.trackingUpdatedAt || item.date || new Date().toISOString(), by: "System" });
        setTrackingDialogOpen(true);
    };

    const closeTrackingDialog = () => {
        setTrackingDialogOpen(false);
        setTrackingLR(null);
        setTrackingStatus("");
        setTrackingRemarks("");
        setTrackingLastUpdated(null);
    };

    const handleUpdateTrackingStatus = async () => {
        if (!trackingLR) return;
        try {
            setTrackingBusy(true);
            const response = await api.put(`/lr/${trackingLR._id}`, {
                status: trackingStatus,
                trackingRemarks,
            });
            const updated = response.data?.lr ? normalizeLRItem(response.data.lr) : { ...trackingLR, status: trackingStatus };
            setLrData(prev => prev.map(i => i._id === trackingLR._id ? updated : i));
            setTrackingLR(updated);
            setRefreshKey((key) => key + 1);
            setTrackingLastUpdated({ date: updated.trackingUpdatedAt || new Date().toISOString(), by: "Shree Admin" });
            showSuccess("Tracking status updated");
        } catch (err: any) {
            showError(err.response?.data?.message || "Failed to update tracking status");
        } finally {
            setTrackingBusy(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm";
    const labelClass = "block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1";
    const filterSelectClass = "bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm";

    useEffect(() => {
        const fetchLRs = async () => {
            try {
                setLoading(true);
                setError("");
                const payload: any = { page: currentPage, limit: pageSize };
                if (search) payload.search = search;
                if (recordFilter !== "all") payload.recordStatus = recordFilter;
                if (statusFilter !== "all") payload.status = statusFilter;
                if (paymentTypeFilter !== "all") payload.paymentType = paymentTypeFilter;

                const response = await api.post("/lr/filter", payload);
                if (response.data?.lrs) {
                    setLrData(response.data.lrs.map(normalizeLRItem));
                    setTotalResults(response.data.totalResults || 0);
                    setTotalPages(response.data.totalPages || 1);
                }
            } catch (err: any) {
                console.error("Error fetching LRs:", err);
                showError("Failed to load LRs");
                setError("Failed to load LRs");
            } finally {
                setLoading(false);
            }
        };
        fetchLRs();
    }, [currentPage, pageSize, search, recordFilter, statusFilter, paymentTypeFilter, refreshKey]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-emerald-100 text-emerald-700";
            case "In Transit": return "bg-amber-100 text-amber-700";
            case "Pending": return "bg-rose-100 text-rose-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const toggleSelect = (lrId: string) => {
        setSelected(prev => { const c = new Set(prev); c.has(lrId) ? c.delete(lrId) : c.add(lrId); return c; });
    };
    const isAllSelected = lrData.length > 0 && lrData.every(d => selected.has(d._id));
    const toggleSelectAll = () => {
        setSelected(prev => {
            const c = new Set(prev);
            isAllSelected ? lrData.forEach(d => c.delete(d._id)) : lrData.forEach(d => c.add(d._id));
            return c;
        });
    };

    const selectedLRs = lrData.filter(lr => selected.has(lr._id));

    const exportToExcel = (items: LRItem[]) => {
        const headers = [t("lrNo"), t("date"), t("from"), t("to"), t("freight"), t("payment"), t("status")];
        const rows = items.map(i => [i.lrNumber || i._id, formatDate(i.date), i.from, i.to, i.freight?.toLocaleString("en-IN"), translatePaymentType(i.paymentType), i.status]);
        const escapeCell = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const html = `<table><thead><tr>${headers.map((header) => `<th>${escapeCell(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        const blob = new Blob([`<html><head><meta charset="utf-8"></head><body>${html}</body></html>`], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "lr-export.xls";
        a.click();
        URL.revokeObjectURL(url);
        setExportDropdownOpen(false);
    };

    // ── PDF export: captures the SAME <LRReceiptRenderer/> used on
    //    screen, driven by the company's selected template + fields.
    //    No more hand-drawn jsPDF layout to keep in sync. ──────────
    const exportToPDF = async (items: LRItem[]) => {
        if (!items.length) return;
        setExportDropdownOpen(false);
        setExportBusy(true);
        try {
            const payload = items.map(item => ({
                data: mapLRItemToReceiptData(item),
                config: selectedTemplateConfig,
            }));
            await downloadReceiptsPdf(payload, "LR-Receipts.pdf");
        } catch (err) {
            console.error("PDF export failed:", err);
            showError("Failed to generate PDF");
        } finally {
            setExportBusy(false);
        }
    };

    const generateLRPdf = async (lr: LRItem) => {
        try {
            setPdfBusyId(lr._id);
            await downloadReceiptsPdf(
                [{ data: mapLRItemToReceiptData(lr), config: selectedTemplateConfig }],
                `${lr.lrNumber || lr._id}.pdf`
            );
        } catch (err) {
            console.error("PDF download failed:", err);
            showError("Failed to download PDF");
        } finally {
            setPdfBusyId(null);
        }
    };

    // 🖨️ Print — browser print still uses a hidden DOM container,
    // but it now renders the SAME shared component.
    const printRef = useRef<HTMLDivElement>(null);
    const [printItems, setPrintItems] = useState<LRItem[]>([]);
    const [shouldPrint, setShouldPrint] = useState(false);

    const handlePrint = useReactToPrint({
        documentTitle: "LR Print",
        onAfterPrint: () => { setPrintItems([]); setShouldPrint(false); }
    });

    useEffect(() => {
        if (shouldPrint && printItems.length && printRef.current) handlePrint(() => printRef.current);
    }, [shouldPrint, printItems, handlePrint]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                setLoadingDropdowns(true);
                const [citiesRes, vehiclesRes, itemsRes, partiesRes] = await Promise.all([
                    api.get("/cities/dropdown"),
                    api.get("/vehicles/dropdown"),
                    api.get("/items/dropdown"),
                    api.get("/parties/dropdown"),
                ]);
                setCities(citiesRes.data);
                setVehicles(vehiclesRes.data);
                setItems(itemsRes.data);
                setParties(partiesRes.data);
            } catch (err) {
                console.error("Error fetching dropdowns:", err);
                showError("Failed to load dropdown data");
            } finally {
                setLoadingDropdowns(false);
            }
        };
        fetchDropdowns();
    }, []);

    const onPrintItems = (items: LRItem[]) => {
        if (!items.length) return;
        setPrintItems(items);
        setShouldPrint(true);
    };

    const buildWhatsAppUrl = (lr: LRItem) => {
        const phone = lr.consigneePhone?.replace(/\D/g, "");
        if (!phone) return null;
        const fullPhone = phone.startsWith("91") ? phone : `91${phone}`;
        const message = `
*${selectedTemplateConfig.authName || "SHREE LOGISTICS"} - Lorry Receipt*
━━━━━━━━━━━━━━━━━━━━
*LR No:* ${lr.lrNumber || lr._id}
*Date:* ${formatDate(lr.date)}
━━━━━━━━━━━━━━━━━━━━
*From:* ${lr.from}
*To:* ${lr.to}
*Consignor:* ${lr.consignor}
*Consignee:* ${lr.consignee}
━━━━━━━━━━━━━━━━━━━━
*Freight:* Rs.${lr.freight?.toLocaleString("en-IN")}
*Payment:* ${lr.paymentType}
*Status:* ${lr.status}
━━━━━━━━━━━━━━━━━━━━
        `.trim();
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    };

    const handleWhatsAppSend = async (lr: LRItem, popupWindow?: Window | null) => {
        const url = buildWhatsAppUrl(lr);
        if (!url) {
            showError("Consignee ka phone number nahi hai");
            return;
        }
        const popup = popupWindow ?? window.open("about:blank", "_blank");
        if (popup) popup.location.href = url;
        else window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleBulkWhatsApp = async () => {
        const popups = selectedLRs.map(() => window.open("about:blank", "_blank"));
        for (let i = 0; i < selectedLRs.length; i++) {
            await handleWhatsAppSend(selectedLRs[i], popups[i] ?? null);
        }
    };

    const selectedItems = lrData.filter(i => selected.has(i._id));

    return (
        <div>
            {/* ── Hidden print container — renders the shared component ── */}
            <div style={{ position: "absolute", left: -9999, top: 0, width: "190mm" }}>
                <style>{`
                    @page { size: A4; margin: 10mm; }
                    .print-lr { page-break-after: always; margin-bottom: 16mm; }
                    .print-lr:last-child { page-break-after: auto; margin-bottom: 0; }
                `}</style>
                <div ref={printRef}>
                    {printItems.map(item => (
                        <div key={item._id} className="print-lr">
                            <LRReceiptRenderer config={selectedTemplateConfig} data={mapLRItemToReceiptData(item)} width={700} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Copy LR Dialog ── */}
            <Dialog open={copyDialogOpen} onOpenChange={(open) => !open && closeCopyDialog()}>
                <DialogContent className="!max-w-5xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Copy LR</DialogTitle>
                        <DialogDescription>Original LR details loaded. Date and status reset for the new LR.</DialogDescription>
                    </DialogHeader>
                    {copyLR && (
                        <CreateLR
                            existingLR={copyLR}
                            onSaved={() => { closeCopyDialog(); setRefreshKey((key) => key + 1); }}
                            onClose={closeCopyDialog}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Dialog ── */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className={deleteAction === "activate" ? "text-emerald-600" : "text-amber-600"}>
                            {deleteAction === "activate" ? t("activate") : t("deactivate")} LR
                        </DialogTitle>
                        <DialogDescription>
                            {deleteAction === "activate"
                                ? "Are you sure you want to activate this LR?"
                                : "Are you sure you want to deactivate this LR? You can reactivate it later from admin."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeDeleteDialog}>Cancel</Button>
                        <Button variant={deleteAction === "activate" ? "default" : "destructive"} onClick={confirmDelete}>
                            {deleteAction === "activate" ? t("activate") : t("deactivate")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── View / Edit dialog ── */}
            {dialogOpen && activeLR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-2" onClick={closeDialog}>
                    <div className="w-full !max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-1 shrink-0">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{dialogMode === "view" ? "LR Receipt" : "Edit LR"}</h2>
                                <p className="text-sm text-slate-500 mt-0">
                                    {dialogMode === "view" ? `Viewing details for ${activeLR.lrNumber || activeLR._id}` : "Update LR details and save changes."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {dialogMode === "view" && (
                                    <>
                                        <button type="button" onClick={() => generateLRPdf(activeLR)} disabled={pdfBusyId === activeLR._id} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                                            <DownloadCloud size={14} /> {pdfBusyId === activeLR._id ? "PDF..." : "PDF"}
                                        </button>
                                        <button type="button" onClick={() => onPrintItems([activeLR])} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                                            <Printer size={14} /> Print
                                        </button>
                                    </>
                                )}
                                <button type="button" onClick={closeDialog} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 text-xl leading-none">×</button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-2">
                            {dialogMode === "view" ? (
                                // ── same component + same config used everywhere else ──
                                <LRReceiptRenderer config={selectedTemplateConfig} data={mapLRItemToReceiptData(activeLR)} width={680} />
                            ) : (
                                <form onSubmit={handleEditSubmit} className="space-y-3">
                                    {loadingDropdowns && (
                                        <div className="text-sm text-amber-600 flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-amber-400 border-t-amber-600 rounded-full"></div>
                                            Loading master data...
                                        </div>
                                    )}

                                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                                        <h3 className="text-md font-bold text-blue-700 mb-2 border-b pb-2">📦 {t("consignmentDetails")}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className={labelClass}>{t("date")} <span className="text-red-500">*</span></label>
                                                <Input type="date" name="date" value={editForm?.date?.slice(0, 10) ?? ""} onChange={handleEditChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("paymentType")}</label>
                                                <Select value={editForm?.paymentType ?? ""} onValueChange={(v) => handleEditSelectChange("paymentType", v)}>
                                                    <SelectTrigger className={`${inputClass} !py-1`}><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="To Pay">{t("toPay")}</SelectItem>
                                                        <SelectItem value="Paid">{t("paid")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("status")}</label>
                                                <Select value={editForm?.status ?? ""} onValueChange={(v) => handleEditSelectChange("status", v)}>
                                                    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pending">{t("pending")}</SelectItem>
                                                        <SelectItem value="In Transit">{t("inTransit")}</SelectItem>
                                                        <SelectItem value="Delivered">{t("delivered")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className={labelClass}>{t("consignorSender")} <span className="text-red-500">*</span></label>
                                                <SearchableCombobox
                                                    data={parties} displayKey="partyName" placeholder={t("selectParty")}
                                                    value={editForm?.consignorId ?? ""}
                                                    onValueChange={(v) => handleEditSelectChange("consignorId", v)}
                                                    masterLabel="Party" masterPath="/dashboard/lr/masters/party"
                                                    renderItem={(item) => item.partyName}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("consigneeReceiver")} <span className="text-red-500">*</span></label>
                                                <SearchableCombobox
                                                    data={parties} displayKey="partyName" placeholder={t("selectParty")}
                                                    value={editForm?.consigneeId ?? ""}
                                                    onValueChange={(v) => handleEditSelectChange("consigneeId", v)}
                                                    masterLabel="Party" masterPath="/dashboard/lr/masters/party"
                                                    renderItem={(item) => item.partyName}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                                            <h3 className="text-md font-bold text-blue-700 mb-2 border-b pb-2">📍 {t("routeTransport")}</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelClass}>{t("fromCity")} <span className="text-red-500">*</span></label>
                                                    <SearchableCombobox
                                                        data={cities} displayKey="cityName" placeholder={t("selectCity")}
                                                        value={editForm?.fromCityId ?? ""}
                                                        onValueChange={(v) => handleEditSelectChange("fromCityId", v)}
                                                        masterLabel="City" masterPath="/dashboard/lr/masters/city"
                                                        renderItem={(item) => item.cityName}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>{t("toCity")} <span className="text-red-500">*</span></label>
                                                    <SearchableCombobox
                                                        data={cities} displayKey="cityName" placeholder={t("selectCity")}
                                                        value={editForm?.toCityId ?? ""}
                                                        onValueChange={(v) => handleEditSelectChange("toCityId", v)}
                                                        masterLabel="City" masterPath="/dashboard/lr/masters/city"
                                                        renderItem={(item) => item.cityName}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className={labelClass}>{t("vehicleNumber")}</label>
                                                    <SearchableCombobox
                                                        data={vehicles} displayKey="vehicleNumber" placeholder={t("selectVehicle")}
                                                        value={editForm?.vehicleId ?? ""}
                                                        onValueChange={(v) => handleEditSelectChange("vehicleId", v)}
                                                        masterLabel="Vehicle" masterPath="/dashboard/lr/masters/vehicle"
                                                        renderItem={(item) => `${item.vehicleNumber} - ${item.vehicleType} (Cap: ${item.capacity}T)`}
                                                    />
                                                </div>
                                                {vehicleDetails && (
                                                    <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                            <div><p className="text-gray-600 font-semibold">Type</p><p className="text-gray-900">{vehicleDetails.vehicleType}</p></div>
                                                            <div><p className="text-gray-600 font-semibold">Capacity</p><p className="text-gray-900">{vehicleDetails.capacity} Tons</p></div>
                                                            <div><p className="text-gray-600 font-semibold">Owner</p><p className="text-gray-900">{vehicleDetails.ownerName || "N/A"}</p></div>
                                                            <div><p className="text-gray-600 font-semibold">Phone</p><p className="text-gray-900">{vehicleDetails.ownerPhone || "N/A"}</p></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-span-2">
                                                    <label className={labelClass}>{t("driverName")}</label>
                                                    <Input type="text" name="driverName" value={editForm?.driverName ?? ""} onChange={handleEditChange} className={inputClass} placeholder={t("enterDriverName")} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className={labelClass}>{t("transportMode")}</label>
                                                    <Select value={editForm?.transportMode ?? ""} onValueChange={(v) => handleEditSelectChange("transportMode", v)}>
                                                        <SelectTrigger className={inputClass}><SelectValue placeholder={t("select")} /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Road">{t("road")}</SelectItem>
                                                            <SelectItem value="Rail">{t("rail")}</SelectItem>
                                                            <SelectItem value="Air">{t("air")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                                            <h3 className="text-md font-bold text-blue-700 mb-3 border-b pb-2">⚖️ {t("loadPricing")}</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>{t("weightKG")}</label>
                                                    <Input type="number" name="weight" value={editForm?.weight ?? ""} onChange={handleEditChange} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>{t("quantity")}</label>
                                                    <Input type="number" name="quantity" value={editForm?.quantity ?? ""} onChange={handleEditChange} className={inputClass} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className={labelClass}>{t("freightAmount")}</label>
                                                    <Input type="number" name="freight" value={editForm?.freight ?? ""} onChange={handleEditChange} className={`${inputClass} font-bold text-blue-600`} placeholder={t("amountPlaceholder")} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                                        <input type="checkbox" name="taxable" checked={!!editForm?.taxable} onChange={handleEditChange} className="w-4 h-4" />
                                                        {t("taxableGST")}
                                                    </label>
                                                </div>
                                                {editForm?.taxable && (
                                                    <>
                                                        <div>
                                                            <label className={labelClass}>{t("gstPercent")}</label>
                                                            <Input type="number" name="gstPercent" value={editForm?.gstPercent ?? ""} onChange={handleEditChange} className={inputClass} placeholder={t("gstPlaceholder")} />
                                                        </div>
                                                        <div><label className={labelClass}>{t("cgst")}</label><Input type="number" value={editForm?.cgst ?? 0} disabled className={`${inputClass} bg-gray-100`} /></div>
                                                        <div><label className={labelClass}>{t("sgst")}</label><Input type="number" value={editForm?.sgst ?? 0} disabled className={`${inputClass} bg-gray-100`} /></div>
                                                        <div><label className={labelClass}>{t("igst")}</label><Input type="number" value={editForm?.igst ?? 0} disabled className={`${inputClass} bg-gray-100`} /></div>
                                                        <div className="col-span-2">
                                                            <label className={labelClass}>{t("totalAmount")}</label>
                                                            <Input type="number" value={editForm?.totalAmount ?? 0} disabled className={`${inputClass} font-bold text-green-600 bg-gray-100`} />
                                                        </div>
                                                    </>
                                                )}
                                                {!editForm?.taxable && editForm?.freight ? (
                                                    <div className="col-span-2">
                                                        <label className={labelClass}>{t("totalAmount")}</label>
                                                        <Input type="number" value={editForm?.totalAmount ?? 0} disabled className={`${inputClass} font-bold text-green-600 bg-gray-100`} />
                                                    </div>
                                                ) : null}
                                                <div className="col-span-2">
                                                    <p className="mb-1 font-semibold text-xs text-gray-500 ml-1">{t("freightType")}</p>
                                                    <div className="flex items-center gap-4">
                                                        {['To Pay', 'Paid', 'TBB', 'FOC'].map(opt => (
                                                            <label key={opt} className="inline-flex items-center">
                                                                <input type="radio" name="freightType" value={opt} checked={editForm?.freightType === opt} onChange={handleEditChange} className="form-radio h-4 w-4" />
                                                                <span className="ml-1 text-sm">{t(opt.replace(/\s+/g, ""))}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                                        <h3 className="text-md font-bold text-blue-700 mb-2 border-b pb-2">📝 {t("materialDescription")}</h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className={labelClass}>{t("itemName")}</label>
                                                <SearchableCombobox
                                                    data={items} displayKey="itemName" placeholder={t("selectItem")}
                                                    value={editForm?.itemId ?? ""}
                                                    onValueChange={(v) => handleEditSelectChange("itemId", v)}
                                                    masterLabel="Item" masterPath="/dashboard/lr/masters/item"
                                                    renderItem={(item) => item.itemName}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("numberOfPackages")}</label>
                                                <Input type="number" name="noOfPackages" value={editForm?.noOfPackages ?? ""} onChange={handleEditChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("packagingType")}</label>
                                                <Select value={editForm?.packagingType ?? ""} onValueChange={(v) => handleEditSelectChange("packagingType", v)}>
                                                    <SelectTrigger className={inputClass}><SelectValue placeholder={t("select")} /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Bag">Bag</SelectItem>
                                                        <SelectItem value="Box">Box</SelectItem>
                                                        <SelectItem value="Drum">Drum</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("invoiceNumber")}</label>
                                                <Input type="text" name="invoiceNumber" value={editForm?.invoiceNumber ?? ""} onChange={handleEditChange} className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>{t("eWayBill")}</label>
                                                <Input type="text" name="eWayBill" value={editForm?.eWayBill ?? ""} onChange={handleEditChange} className={inputClass} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-1 border-t border-slate-200">
                                        <button type="button" onClick={closeDialog} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                            {t("cancel") ?? "Cancel"}
                                        </button>
                                        <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                                            {t("save") ?? "Save"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── LR Tracking dialog ── */}
            {trackingDialogOpen && trackingLR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-2" onClick={closeTrackingDialog}>
                    <div className="w-full !max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">LR Tracking</h2>
                                    <p className="text-xs text-slate-500">Track and update the status of this LR</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold whitespace-nowrap">
                                    {trackingLR.lrNumber || trackingLR._id}
                                </span>
                                <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusStyle(trackingLR.status)}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {translateStatus(trackingLR.status)}
                                </span>
                                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
                                <button type="button" onClick={closeTrackingDialog} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                                {/* Left column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Current Status</label>
                                        <Select value={trackingStatus} onValueChange={setTrackingStatus}>
                                            <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">🟠 {t("pending")}</SelectItem>
                                                <SelectItem value="In Transit">🟡 {t("inTransit")}</SelectItem>
                                                <SelectItem value="Delivered">🟢 {t("delivered")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleUpdateTrackingStatus}
                                        disabled={trackingBusy}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                                    >
                                        <Send size={15} />
                                        {trackingBusy ? "Updating..." : "Update Status"}
                                    </button>

                                    <div>
                                        <label className={labelClass}>Add Remarks (Optional)</label>
                                        <textarea
                                            value={trackingRemarks}
                                            onChange={(e) => setTrackingRemarks(e.target.value.slice(0, 200))}
                                            placeholder="Enter remarks about this update..."
                                            rows={4}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm resize-none"
                                        />
                                        <p className="text-right text-[11px] text-slate-400 mt-1">{trackingRemarks.length}/200</p>
                                    </div>

                                    {trackingLastUpdated && (
                                        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                                            <Clock size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                            <div className="text-xs">
                                                <p className="font-semibold text-slate-700">Last Updated</p>
                                                <p className="text-slate-500">
                                                    {new Date(trackingLastUpdated.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, {new Date(trackingLastUpdated.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                                <p className="text-slate-500">By {trackingLastUpdated.by}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                                        <Lightbulb size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                        <div className="text-xs">
                                            <p className="font-semibold text-slate-700">Tip</p>
                                            <p className="text-slate-500">Add remarks to keep a clear record of shipment updates.</p>
                                        </div>
                                    </div>
                                    {trackingLR.trackingRemarks && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                                            <p className="text-xs font-semibold text-slate-700">Latest Remark</p>
                                            <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{trackingLR.trackingRemarks}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right column ── Tracking History timeline */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-4">Tracking History</h3>
                                    <div className="relative">
                                        {TRACKING_STAGES.map((stage, idx) => {
                                            const state = getTrackingStageState(trackingLR.status, idx);
                                            const isLast = idx === TRACKING_STAGES.length - 1;
                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={`relative flex gap-4 pb-6 ${state === "current" ? "bg-blue-50/60 -mx-3 px-3 rounded-lg" : ""}`}
                                                >
                                                    {!isLast && (
                                                        <div className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${state === "pending" ? "bg-slate-200" : "bg-emerald-300"}`}></div>
                                                    )}
                                                    <div className="shrink-0 z-10">
                                                        {state === "completed" && (
                                                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                                                <Check size={16} />
                                                            </div>
                                                        )}
                                                        {state === "current" && (
                                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                                <Truck size={16} />
                                                            </div>
                                                        )}
                                                        {state === "pending" && (
                                                            <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-white"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex items-start justify-between gap-3 pt-1">
                                                        <div>
                                                            <p className={`text-sm font-bold ${state === "pending" ? "text-slate-400" : state === "current" ? "text-blue-700" : "text-slate-900"}`}>
                                                                {stage.label}
                                                            </p>
                                                            <p className={`text-xs mt-0.5 ${state === "pending" ? "text-slate-400" : "text-slate-500"}`}>
                                                                {stage.getDesc(trackingLR)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-xs text-slate-500 whitespace-nowrap">
                                                                {state === "pending" ? "—" : formatTrackingTimestamp(trackingLR, stage.key, trackingLastUpdated)}
                                                            </p>
                                                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                                                                state === "completed" ? "bg-emerald-100 text-emerald-700" :
                                                                state === "current" ? "bg-blue-100 text-blue-700" :
                                                                "bg-slate-100 text-slate-500"
                                                            }`}>
                                                                {state === "completed" ? "Completed" : state === "current" ? "Current" : "Pending"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-200 shrink-0">
                            <button type="button" onClick={closeTrackingDialog} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main page ── */}
            <div className="space-y-3">
                <Card className="px-4 py-2 mb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{t("lrManagement")}</h2>
                            <p className="text-xs text-slate-500">{t("manageLorryReceipts")}</p>
                        </div>
                        <div className="w-full md:w-64 relative">
                            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input type="text" placeholder={t("searchByLRNo")} value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </Card>

                <div className="bg-white">
                    {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
                    <div className="">
                            <div className="bg-slate-50 px-4 py-2 rounded-xl mb-6 border border-slate-200">
<p className="text-sm font-semibold text-slate-700 mb-3">{t("filters")}</p>
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
    {/* Record Filter */}
    <div className="flex items-center gap-3">
        {/* <p className="text-xs font-semibold text-slate-600 mr-1">Record</p> */}
     <div className="flex flex-wrap items-center gap-2">
  {([
    { value: "all", label: "All Records" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ] as const).map((option) => {
    const isSelected = recordFilter === option.value;

    // Theme Styles Handler
    const getButtonStyles = () => {
      if (!isSelected) {
        return "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";
      }

      switch (option.value) {
        case "active":
          return "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200";
        case "inactive":
          return "bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-200";
        default:
          return "bg-slate-900 border-slate-900 text-white shadow-sm shadow-slate-200";
      }
    };

    const getDotStyles = () => {
      if (isSelected) {
        return "bg-white/20 text-white";
      }

      switch (option.value) {
        case "active":
          return "bg-emerald-100 text-emerald-600";
        case "inactive":
          return "bg-rose-100 text-rose-600";
        default:
          return "bg-slate-100 text-slate-500";
      }
    };

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => {
          setRecordFilter(option.value);
          setCurrentPage(1);
          setSelected(new Set());
        }}
        className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 border cursor-pointer active:scale-95 ${getButtonStyles()}`}
      >
        <span className={`flex items-center justify-center w-2 h-2 rounded-full ${getDotStyles()}`}>
          {option.value === "active" && (
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500 animate-pulse"}`} />
          )}
          {option.value === "inactive" && (
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-rose-500"}`} />
          )}
          {option.value === "all" && (
            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-slate-400"}`} />
          )}
        </span>
        {option.label}
      </button>
    );
  })}
</div>
    </div>

    {/* Dropdowns */}
    <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="In Transit">{t("inTransit")}</SelectItem>
                <SelectItem value="Delivered">{t("delivered")}</SelectItem>
                <SelectItem value="Pending">{t("pending")}</SelectItem>
            </SelectContent>
        </Select>
        <Select value={paymentTypeFilter} onValueChange={(v) => { setPaymentTypeFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{t("allPaymentTypes")}</SelectItem>
                <SelectItem value="To Pay">{t("toPay")}</SelectItem>
                <SelectItem value="Paid">{t("paid")}</SelectItem>
            </SelectContent>
        </Select>
        <button
            type="button"
            onClick={() => {
                setSearch("");
                setRecordFilter("all");
                setStatusFilter("all");
                setPaymentTypeFilter("all");
                setCurrentPage(1);
                setSelected(new Set());
            }}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-semibold"
        >
            {t("resetFilter")}
        </button>
    </div>
      <div className="flex items-center gap-2">
        <button
            disabled={selectedLRs.length === 0}
            className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-200 cursor-pointer ${
                selectedLRs.length === 0
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-green-600 border-green-500 hover:bg-green-50"
            }`}
            onClick={handleBulkWhatsApp}
        >
            <WhatsAppIcon />
            <span className="font-semibold">WhatsApp</span>
            {selectedLRs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-bold">
                    +{selectedLRs.length || 0}
                </span>
            )}
        </button>
        <div className="relative">
            <button onClick={() => setExportDropdownOpen(!exportDropdownOpen)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                <DownloadCloud size={16} /> {exportBusy ? "Exporting..." : t("export")}
            </button>
            {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <button onClick={() => exportToExcel(selectedItems.length ? selectedItems : lrData)} className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 text-sm flex items-center gap-2">📊 {t("exportToExcel")}</button>
                    <button onClick={() => exportToPDF(selectedItems.length ? selectedItems : lrData)} className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 text-sm border-t border-slate-100 flex items-center gap-2">📄 {t("exportToPDF")}</button>
                </div>
            )}
        </div>
        <button
            onClick={() => onPrintItems(selectedItems.length ? selectedItems : lrData)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
        >
            <Printer size={16} />
            <span>Print</span>
            {selectedItems.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{selectedItems.length}</span>
            )}
        </button>
    </div>
</div>

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
    <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} className="w-4 h-4" />
            <span className="text-slate-600">{t("selectAllOnPage")}</span>
        </label>
        <div className="text-sm text-slate-500">{t("selectedText", { count: selected.size })}</div>
    </div>
  
</div>

                                <div className="overflow-x-auto mb-6">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                                                <th className="p-3 text-left w-12"> </th>
                                                <th className="p-3 text-left">{t("lrNo")}</th>
                                                <th className="p-3 text-left">{t("date")}</th>
                                                <th className="p-3 text-left">{t("from")}</th>
                                                <th className="p-3 text-left">{t("to")}</th>
                                                <th className="p-3 text-left">{t("freight")}</th>
                                                <th className="p-3 text-left">{t("payment")}</th>
                                                <th className="p-3 text-left">Record</th>
                                                <th className="p-3 text-left">{t("status")}</th>
                                                <th className="p-3 text-center">{t("actions")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={10} className="p-0">
                                                        <div className="flex min-h-56 flex-col items-center justify-center gap-4 bg-white">
                                                            <div className="relative h-12 w-12">
                                                                <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                                                                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600"></div>
                                                                <div className="absolute inset-3 animate-pulse rounded-full bg-indigo-100"></div>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-sm font-semibold text-slate-700">Loading LRs</span>
                                                                <span className="flex gap-1">
                                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]"></span>
                                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]"></span>
                                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500"></span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : lrData.map((item) => (
                                                <tr key={item._id} className="border-t hover:bg-slate-50 transition">
                                                    <td className="p-1"><input type="checkbox" checked={selected.has(item._id)} onChange={() => toggleSelect(item._id)} className="w-4 h-4" /></td>
                                                    <td className="p-1 font-medium text-slate-800">{item.lrNumber || item._id}</td>
                                                    <td className="p-1 text-slate-600">{formatDate(item.date)}</td>
                                                    <td className="p-1 text-slate-600">{item.from}</td>
                                                    <td className="p-1 text-slate-600">{item.to}</td>
                                                    <td className="p-1 text-slate-600">₹{item.freight?.toLocaleString("en-IN")}</td>
                                                    <td className="p-1 text-slate-600 text-sm font-medium">{translatePaymentType(item.paymentType)}</td>
                                                    <td className="p-1 text-sm">
                                                        {item.isActive ? (
                                                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Active</span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td className="p-1">
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(item.status)}`}>
                                                            {translateStatus(item.status)}
                                                        </span>
                                                    </td>
                                                    <td className="p-1 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button type="button" title={copyLoading ? "Loading LR" : t("copy")} onClick={() => openCopyDialog(item)} disabled={copyLoading} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer disabled:opacity-50">
                                                                <Copy size={16} />
                                                            </button>
                                                            <button type="button" title={t("view")} onClick={() => openViewDialog(item)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"><Eye size={16} /></button>
                                                            <button type="button" title={t("edit")} onClick={() => openEditDialog(item)} className="p-2 rounded-lg hover:bg-slate-100 text-amber-600 transition cursor-pointer"><Pencil size={16} /></button>
                                                            <button type="button" title="Tracking" onClick={() => openTrackingDialog(item)} className="p-2 rounded-lg hover:bg-slate-100 text-blue-600 transition cursor-pointer"><MapPin size={16} /></button>
                                                            {item.isActive ? (
                                                                <button type="button" title={t("deactivate")} onClick={() => openDeleteDialog(item._id)} className="p-2 rounded-lg hover:bg-slate-100 text-amber-600 transition cursor-pointer"><Ban size={16} /></button>
                                                            ) : (
                                                                <button type="button" title={t("activate")} onClick={() => openDeleteDialog(item._id, "activate")} className="p-2 rounded-lg hover:bg-slate-100 text-emerald-600 transition"><Check size={16} /></button>
                                                            )}
                                                            <button onClick={() => handleWhatsAppSend(item)} className="hover:scale-110 transition cursor-pointer" title="Send on WhatsApp">
                                                                <WhatsAppIcon />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {lrData.length === 0 && (
                                        <div className="text-center py-6 text-slate-500">{loading ? "Loading..." : t("noLRFound")}</div>
                                    )}
                                </div>
                                {lrData.length > 0 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        pageSize={pageSize}
                                        totalResults={totalResults}
                                        onPageChange={(page) => setCurrentPage(page)}
                                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                                    />
                                )}
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
}