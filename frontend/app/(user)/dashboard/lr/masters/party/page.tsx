"use client";
import { useState, type FormEvent, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit, Ban, Search, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import TableBodyLoader from "@/components/TableBodyLoader";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Party = {
    _id: string;
    partyName: string;
    phone: string;
    gstNumber?: string;
    city?: string | { _id: string; cityName: string };
    isActive?: boolean;
};

type City = {
    _id: string;
    cityName: string;
    state: string;
};

export default function PartyMaster() {
    const t = useTranslations();
    const [parties, setParties] = useState<Party[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        partyName: "",
        phone: "",
        city: "",
        gstNumber: ""
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [deleteItemName, setDeleteItemName] = useState("");
    const [deleteItemIsActive, setDeleteItemIsActive] = useState<boolean | null>(null);

    // 📥 Fetch cities for dropdown
    const fetchCities = async () => {
        try {
            const payload = { page: 1, limit: 100, isActive: true };
            const response = await api.post("/cities/filter", payload);
            setCities(response.data.cities || []);
        } catch (err: any) {
            console.error("Error fetching cities:", err);
        }
    };

    // 📥 Fetch parties with pagination and search
    const fetchParties = async (searchTerm = "", pageNum = 1, limit = 10) => {
        try {
            setLoading(true);
            setError("");

            const payload: any = {
                search: searchTerm,
                page: pageNum,
                limit: limit,
            };

            if (statusFilter !== "all") payload.isActive = statusFilter === "enabled";

            const response = await api.post("/parties/filter", payload);

            setParties(response.data.parties || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalResults(response.data.totalResults || 0);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.response?.data?.message || t("errorFetchingParties"));
            showError(err.response?.data?.message || t("errorFetchingParties"));
            setParties([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔍 Fetch once on mount and debounce search/filter changes.
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchParties(search, 1, pageSize);
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [search, statusFilter, pageSize]);

    useEffect(() => {
        fetchCities();
    }, []);

    const resetForm = () => {
        setFormData({
            partyName: "",
            phone: "",
            city: "",
            gstNumber: ""
        });
        setEditId(null);
    };

    // ➕ Create or Update Party
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.partyName.trim() || !formData.phone.trim()) {
            showError(t("fillAllFields"));
            return;
        }

        try {
            setSubmitting(true);

            if (editId) {
                // ✏️ Update
                await api.put(`/parties/${editId}`, formData, {
                    showToast: true,
                    successMessage: t("partyUpdatedSuccess")
                } as any);
            } else {
                // ➕ Create
                await api.post("/parties", formData, {
                    showToast: true,
                    successMessage: t("partyCreatedSuccess")
                } as any);
            }

            resetForm();
            setShowForm(false);
            await fetchParties(search, page, pageSize);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || t("errorSavingParty");
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (party: Party) => {
        setFormData({
            partyName: party.partyName || "",
            phone: party.phone || "",
            city: typeof party.city === "object" ? party.city._id : (party.city || ""),
            gstNumber: party.gstNumber || ""
        });
        setEditId(party._id);
        setShowForm(true);
    };

    // ❌ Delete Party - Open Confirmation Dialog
    const openDeleteDialog = (party: Party) => {
        setDeleteItemId(party._id);
        setDeleteItemName(party.partyName);
        setDeleteItemIsActive(party.isActive ?? true);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteItemId(null);
        setDeleteItemName("");
    };

    const confirmDelete = async () => {
        if (!deleteItemId || deleteItemIsActive === null) return;
        try {
            const newState = !deleteItemIsActive;
            await api.put(`/parties/${deleteItemId}`, { isActive: newState }, {
                showToast: true,
                successMessage: newState ? t("partyEnabledSuccess") : t("partyDisabledSuccess")
            } as any);
            closeDeleteDialog();
            await fetchParties(search, page, pageSize);
        } catch (err: any) {
            closeDeleteDialog();
        }
    };

    return (
        <div className="space-y-3">
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-amber-600">Enable / Disable Party</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to <span className="font-semibold text-gray-900">{deleteItemIsActive ? "disable" : "enable"}</span> <span className="font-semibold text-gray-900">"{deleteItemName}"</span>?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 sm:gap-0">
                            <Button variant="outline" onClick={closeDeleteDialog}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                {deleteItemIsActive ? "Disable" : "Enable"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="">
                <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-2">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800">{t("partyMasterTitle")}</h1>
                        <p className="text-xs text-slate-500 mt-0">{t("partyMasterSubtitle")}</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl font-semibold transition-all"
                    >
                        <Plus size={18} /> {t("addParty")}
                    </button>
                </Card>
            </div>

            {/* Error Message */}
            {/* {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )} */}



<Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
{/* Status Filter */}
<div className="flex items-center gap-3">
    {/* <label className="text-sm text-slate-700 font-semibold whitespace-nowrap">
        {t("all")}: 
    </label> */}
    <div className="relative">
        <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); }}
            className="px-4 py-2 pr-8 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none shadow-sm"
        >
            <option value="all">{t("all")}</option>
            <option value="enabled">{t("enabled")}</option>
            <option value="disabled">{t("disabled")}</option>
        </select>
        <ChevronDown 
            size={16} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
    </div>
</div>
{/* Search */}
<div className="relative flex-1 max-w-md">
    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
        type="text"
        placeholder={t("searchPartyOrGST")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
    />
</div>
</Card>
            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{editId ? t("editParty") : t("addNewParty")}</h2>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("partyNameLabel")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.partyName}
                                        onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterPartyName")}
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("ownerPhone")}</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterPhone")}
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("gstNumber")}</label>
                                    <input
                                        type="text"
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterGSTNumber")}
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("city")}</label>
                                    <SearchableCombobox
                                        data={cities}
                                        displayKey="cityName"
                                        placeholder={t("selectCity")}
                                        value={formData.city}
                                        onValueChange={(value) => setFormData({ ...formData, city: value })}
                                        masterLabel="City"
                                        masterPath="/dashboard/lr/masters/city"
                                        inputClass="border border-slate-200 rounded-lg bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} disabled={submitting} className="px-6 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50">
                                    {t("cancel")}
                                </button>
                                <button type="submit" disabled={submitting} className="px-6 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                                    {submitting ? t("saving") : (editId ? t("update") : t("save"))}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-2 text-left">{t("partyNameLabel")}</th>
                                    <th className="px-6 py-2 text-left">{t("gstNumber")}</th>
                                    <th className="px-6 py-2 text-left">{t("phone")}</th>
                                    <th className="px-6 py-2 text-left">{t("city")}</th>
                                    <th className="px-6 py-2 text-left">Enabled</th>
                                    <th className="px-6 py-2 text-center">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableBodyLoader colSpan={6} label={t("loadingParties")} />
                                ) : parties.length > 0 ? (
                                    parties.map((party) => (
                                        <tr key={party._id} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-2 font-semibold text-slate-800">{party.partyName}</td>
                                            <td className="px-6 py-2 text-slate-600">{party.gstNumber || "N/A"}</td>
                                            <td className="px-6 py-2 text-slate-600">{party.phone || "N/A"}</td>
                                            <td className="px-6 py-2 text-slate-600">
                                                {typeof party.city === "object" ? party.city.cityName : party.city || "N/A"}
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                {party.isActive ? (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Enabled</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Disabled</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(party)} 
                                                        className="p-2 hover:bg-slate-200 rounded-lg text-amber-600 transition-colors"
                                                        title={t("edit")}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteDialog(party)} 
                                                        className="p-2 hover:bg-slate-200 rounded-lg text-amber-600 transition-colors"
                                                        title={party.isActive ? t("disable") : t("enable")}
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">{t("noPartiesFound")}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {parties.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalResults={totalResults}
                            onPageChange={(newPage) => fetchParties(search, newPage, pageSize)}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                fetchParties(search, 1, size);
                            }}
                        />
                    )}
            </div>
        </div>
    );
}