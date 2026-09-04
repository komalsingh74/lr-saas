"use client";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    DownloadCloud,
    Printer,
    Calendar,
    Search,
    FileText,
    IndianRupee,
    Weight,
    Clock,

} from "lucide-react";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { showError } from "@/lib/toast";
import TableBodyLoader from "@/components/TableBodyLoader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// import api from "@/lib/api";
// import { showError } from "@/lib/toast";

type LRReport = {
    _id: string;
    lrNumber: string;
    date: string;
    fromCity: { cityName: string };
    toCity: { cityName: string };
    consignor: { partyName: string };
    freightAmount: number;
    status: string;
    paymentType: string;
    weight: number;
};

type ReportsStats = {
    totalLR: number;
    pending: number;
    inTransit: number;
    delivered: number;
    totalFreight: number;
    totalWeight: number;
    avgWeight: number;
    toPayCount: number;
    paidCount: number;
};

type FilterData = {
    parties: string[];
    statuses: string[];
    paymentTypes: string[];
};

export default function Reports() {
    // Get today's date and default range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    // const formatDate = (d) => d.toISOString().split('T')[0];
    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const [range, setRange] = useState({
        from: formatDate(thirtyDaysAgo),
        to: formatDate(today)
    });
    const [partyFilter, setPartyFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");
    // Applied filters are empty by default so initial view shows all data
    const [appliedFilters, setAppliedFilters] = useState({
        range: { from: "", to: "" },
        party: "all",
        status: "all",
        payment: "all"
    });
    const [query, setQuery] = useState("");
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalResults, setTotalResults] = useState(0);

    // Data states
    const [reportsData, setReportsData] = useState<LRReport[]>([]);
    const [stats, setStats] = useState<ReportsStats>({
        totalLR: 0,
        pending: 0,
        inTransit: 0,
        delivered: 0,
        totalFreight: 0,
        totalWeight: 0,
        avgWeight: 0,
        toPayCount: 0,
        paidCount: 0
    });
    const [filterData, setFilterData] = useState<FilterData>({
        parties: [],
        statuses: [],
        paymentTypes: []
    });

    const t = useTranslations();


    const fetchReportsData = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch stats
            const statsResponse = await api.get("/lr/reports-stats", {
                params: {
                    fromDate: appliedFilters.range.from,
                    toDate: appliedFilters.range.to
                }
            });
            setStats(statsResponse.data);

            const payload: any = {
                page: currentPage,
                limit: pageSize,
                search: query,
            };

            if (appliedFilters.status !== "all") {
                payload.status = appliedFilters.status;
            }

            if (appliedFilters.payment !== "all") {
                payload.paymentType = appliedFilters.payment;
            }

            // Include date range in payload for server-side filtering
            if (appliedFilters.range?.from) {
                payload.dateFrom = appliedFilters.range.from;
            }
            if (appliedFilters.range?.to) {
                payload.dateTo = appliedFilters.range.to;
            }

            // Include consignor/party filter
            if (appliedFilters.party && appliedFilters.party !== "all") {
                payload.consignor = appliedFilters.party;
            }

            // if (appliedFilters.range.from && appliedFilters.range.to) {
            //   payload.dateFrom = appliedFilters.range.from;
            //   payload.dateTo = appliedFilters.range.to;
            // }

            const filterResponse = await api.post("/lr/filter", payload);

            setReportsData(filterResponse.data.lrs.map((lr: any) => ({
                _id: lr._id,
                lrNumber: lr.lrNumber || lr._id,
                date: lr.date ? new Date(lr.date).toLocaleDateString("en-IN") : "",
                fromCity: lr.fromCity,
                toCity: lr.toCity,
                consignor: lr.consignor,
                freightAmount: lr.freightAmount || 0,
                status: lr.status || "",
                paymentType: lr.paymentType || "",
                weight: lr.weight || 0
            })));

            setTotalResults(filterResponse.data.totalResults);
            setTotalPages(filterResponse.data.totalPages);

            // Extract filter options
            const uniqueParties = [...new Set(filterResponse.data.lrs.map((lr: any) => lr.consignor?.partyName).filter(Boolean))];
            const uniqueStatuses = [...new Set(filterResponse.data.lrs.map((lr: any) => lr.status).filter(Boolean))];
            const uniquePaymentTypes = [...new Set(filterResponse.data.lrs.map((lr: any) => lr.paymentType).filter(Boolean))];

            setFilterData({
                parties: uniqueParties,
                statuses: uniqueStatuses,
                paymentTypes: uniquePaymentTypes
            });

        } catch (err: any) {
            console.error("Error fetching reports data:", err);
            if (err.response) {
                console.error("Response status:", err.response.status);
                console.error("Response data:", err.response.data);
            } else if (err.request) {
                console.error("No response received:", err.request);
            } else {
                console.error("Request setup error:", err.message);
            }
            showError("Failed to load reports data");
            setError("Failed to load reports data");
        } finally {
            setLoading(false);
        }
    };
    // Fetch reports data
    useEffect(() => {
        console.log("useEffect triggered with:", { appliedFilters, currentPage, pageSize, query });


        fetchReportsData();
    }, [appliedFilters, currentPage, pageSize, query]);

    const exportToExcel = () => {
        const rows = [
            [t("lrNo"), t("date"), t("from"), t("to"), t("freight"), t("status"), t("party"), t("weight")],
            ...reportsData.map((r) => [
                r.lrNumber,
                r.date,
                r.fromCity?.cityName || "",
                r.toCity?.cityName || "",
                r.freightAmount,
                r.status,
                r.consignor?.partyName || "",
                r.weight
            ])
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lr-report-${appliedFilters.range.from}-${appliedFilters.range.to}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        setExportDropdownOpen(false);
    };

    const exportToPDF = () => {
        const rows = [
            [t("lrNo"), t("date"), t("from"), t("to"), t("freight"), t("status"), t("party"), t("weight")],
            ...reportsData.map((r) => [
                r.lrNumber,
                r.date,
                r.fromCity?.cityName || "",
                r.toCity?.cityName || "",
                r.freightAmount,
                r.status,
                r.consignor?.partyName || "",
                r.weight
            ])
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lr-report-${appliedFilters.range.from}-${appliedFilters.range.to}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setExportDropdownOpen(false);
    };

    const handlePrint = () => window.print();

    return (
        <div className="space-y-4">

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}
            <div className="gap-3">
                <Card className="px-4 py-2 mb-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                            {t("reportsTitle")}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {t("reportsSubtitle")}
                        </p>
                    </div>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total LR */}
                    <StatCard
                        title={t("totalLR")}
                        value={stats.totalLR}
                        icon={FileText}
                        colorClass="bg-blue-600 shadow-blue-100"
                        gradientClass="from-white to-blue-50/40"
                    />

                    {/* Total Freight */}
                    <StatCard
                        title={t("totalFreight")}
                        value={`₹${stats.totalFreight.toLocaleString('en-IN')}`}
                        icon={IndianRupee}
                        colorClass="bg-emerald-600 shadow-emerald-100"
                        gradientClass="from-white to-emerald-50/40"
                    />

                    {/* Avg Weight */}
                    <StatCard
                        title={t("avgWeightKG")}
                        value={stats.avgWeight.toFixed(2)}
                        icon={Weight}
                        colorClass="bg-amber-500 shadow-amber-100"
                        gradientClass="from-white to-amber-50/40"
                    />

                    {/* Pending Deliveries */}
                    <StatCard
                        title={t("pendingDeliveries")}
                        value={stats.pending}
                        icon={Clock}
                        colorClass="bg-rose-500 shadow-rose-100"
                        gradientClass="from-white to-rose-50/40"
                    />
                </div>


            </div>


            <div className="flex flex-wrap items-center gap-3">

                {/* Filters Form */}
                <div className="bg-white p-4 border border-slate-300 rounded-2xl flex flex-wrap gap-3 items-end">
                    {/* Search input */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <Search size={16} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder={t("searchLR")}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="text-sm bg-transparent outline-none"
                        />
                    </div>

                    {/* date range always shown */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                        <Calendar size={16} className="text-slate-500" />
                        <input
                            type="date"
                            value={range.from}
                            onChange={(e) =>
                                setRange((r) => ({ ...r, from: e.target.value }))
                            }
                            className="text-sm bg-transparent outline-none"
                        />
                        <span className="text-slate-300">—</span>
                        <input
                            type="date"
                            value={range.to}
                            onChange={(e) =>
                                setRange((r) => ({ ...r, to: e.target.value }))
                            }
                            className="text-sm bg-transparent outline-none"
                        />
                    </div>
                    <div>
                        <Select value={partyFilter} onValueChange={(v) => setPartyFilter(v)}>
                            <SelectTrigger className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
                                <SelectValue placeholder={t("allParties")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allParties")}</SelectItem>
                                {filterData.parties.map((party) => (
                                    <SelectItem key={party} value={party}>{party}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    <div>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                            <SelectTrigger className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
                                <SelectValue placeholder={t("allStatus")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allStatus")}</SelectItem>
                                {filterData.statuses.map((st) => (
                                    <SelectItem key={st} value={st}>
                                        {t(st === "In Transit" ? "inTransit" : st === "Delivered" ? "delivered" : st === "Pending" ? "pending" : st)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v)}>
                            <SelectTrigger className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm">
                                <SelectValue placeholder={t("allPaymentTypes")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allPaymentTypes")}</SelectItem>
                                {filterData.paymentTypes.map((p) => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setRange({ from: formatDate(thirtyDaysAgo), to: formatDate(today) });
                            setPartyFilter("all");
                            setStatusFilter("all");
                            setPaymentFilter("all");
                            setAppliedFilters({
                                range: { from: "", to: "" },
                                party: "all",
                                status: "all",
                                payment: "all"
                            });
                            setQuery("");
                            setCurrentPage(1);
                        }}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                        {t("resetFilter")}
                    </button>
                    <button
                        onClick={() => {
                            setAppliedFilters({
                                range: { from: range.from, to: range.to },
                                party: partyFilter,
                                status: statusFilter,
                                payment: paymentFilter
                            });
                            setCurrentPage(1); // reset to first page when filters change
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                        {t("applyFilter")}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                        >
                            <DownloadCloud size={16} /> {t("export")}
                        </button>
                        {exportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                                <button
                                    onClick={exportToExcel}
                                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 text-sm flex items-center gap-2"
                                >
                                    📊 Export to Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 text-sm border-t border-slate-100 flex items-center gap-2"
                                >
                                    📄 Export to PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                        <Printer size={16} /> {t("print")}
                    </button>
                </div>
            </div>


            {/* Table Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-800">
                        {t("lrRecords")}
                    </h3>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                        <Search size={14} className="text-slate-400" />
                        <input
                            placeholder={t("searchLR")}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="text-sm bg-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-1 text-left">{t("lrNo")}</th>
                                    <th className="px-4 py-1 text-left">{t("date")}</th>
                                    <th className="px-4 py-1 text-left">{t("from")}</th>
                                    <th className="px-4 py-1 text-left">{t("to")}</th>
                                    <th className="px-4 py-1 text-left">{t("freight")}</th>
                                    <th className="px-4 py-1 text-left">{t("status")}</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <TableBodyLoader colSpan={6} label="Loading reports" />
                                ) : reportsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            {t("noRecordsFound")}
                                        </td>
                                    </tr>
                                ) : (
                                    reportsData.map((r) => (
                                        <tr
                                            key={r._id}
                                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                                        >
                                            <td className="px-4 py-2 font-semibold text-slate-800">
                                                {r.lrNumber}
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">
                                                {r.date}
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">
                                                {r.fromCity?.cityName || ""}
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">
                                                {r.toCity?.cityName || ""}
                                            </td>
                                            <td className="px-4 py-2 text-slate-600">
                                                ₹{r.freightAmount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${r.status === "Delivered"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : r.status === "In Transit"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {t(r.status === "In Transit" ? "inTransit" : r.status === "Delivered" ? "delivered" : r.status === "Pending" ? "pending" : r.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {!loading && reportsData.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalResults={totalResults}
                                onPageChange={(page) => setCurrentPage(page)}
                                onPageSizeChange={(size) => {
                                    setPageSize(size);
                                    setCurrentPage(1); // Page size change pe 1st page pe reset karein
                                }}
                            />
                        )}


                </div>
            </div>
        </div>
    );
}

/* Reusable Stat Card */
function StatCard({ title, value, icon: Icon, colorClass, gradientClass }) {
    return (
        <Card className={`p-4 border-none shadow-sm bg-gradient-to-br ${gradientClass} hover:shadow-md transition-all group rounded-2xl`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <h3 className="text-md font-black text-slate-900 mt-1">
                        {value}
                    </h3>
                </div>
                <div className={`p-2.5 ${colorClass} text-white rounded-2xl shadow-lg transition-transform group-hover:scale-110`}>
                    <Icon size={16} />
                </div>
            </div>
        </Card>
    );
}