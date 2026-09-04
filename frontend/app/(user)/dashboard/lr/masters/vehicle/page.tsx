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

type Vehicle = {
    _id: string;
    vehicleNumber: string;
    vehicleType: string;
    ownerName: string;
    ownerPhone: string;
    capacity: number | string;
    isActive?: boolean;
};

export default function VehicleMaster() {
    const t = useTranslations();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        vehicleNumber: "",
        vehicleType: "Truck",
        ownerName: "",
        ownerPhone: "",
        capacity: "",
    });

    const vehicleTypes = [
        { _id: "Truck", label: "Truck" },
        { _id: "Tempo", label: "Tempo" },
        { _id: "Trailer", label: "Trailer" },
        { _id: "Van", label: "Van" },
        { _id: "Mini Truck", label: "Mini Truck" },
    ];
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [deleteItemNumber, setDeleteItemNumber] = useState("");
    const [deleteItemIsActive, setDeleteItemIsActive] = useState<boolean | null>(null);

    // 📥 Fetch vehicles with pagination and search
    const fetchVehicles = async (searchTerm = "", pageNum = 1, limit = 10) => {
        try {
            setLoading(true);
            setError(null);

            const payload: any = {
                search: searchTerm,
                page: pageNum,
                limit: limit,
            };

            if (statusFilter !== "all") payload.isActive = statusFilter === "enabled";

            const response = await api.post("/vehicles/filter", payload);

            setVehicles(response.data.vehicles || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalResults(response.data.totalResults || 0);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.response?.data?.message || t("errorFetchingVehicles"));
            showError(err.response?.data?.message || t("errorFetchingVehicles"));
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔍 Fetch once on mount and debounce search/filter changes.
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchVehicles(search, 1, pageSize);
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [search, statusFilter, pageSize]);

    const resetForm = () => {
        setFormData({
            vehicleNumber: "",
            vehicleType: "Truck",
            ownerName: "",
            ownerPhone: "",
            capacity: "",
        });
        setEditId(null);
    };

    // ➕ Create or Update Vehicle
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.vehicleNumber.trim() || !formData.ownerName.trim() || !formData.ownerPhone.trim()) {
            showError(t("fillAllFields"));
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                ...formData,
                capacity: formData.capacity ? Number(formData.capacity) : 0
            };

            if (editId) {
                // ✏️ Update
                await api.put(`/vehicles/${editId}`, payload, {
                    showToast: true,
                    successMessage: t("vehicleUpdatedSuccess")
                } as any);
            } else {
                // ➕ Create
                await api.post("/vehicles", payload, {
                    showToast: true,
                    successMessage: t("vehicleCreatedSuccess")
                } as any);
            }

            resetForm();
            setShowForm(false);
            await fetchVehicles(search, page, pageSize);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || t("errorSavingVehicle");
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setFormData({
            vehicleNumber: vehicle.vehicleNumber || "",
            vehicleType: vehicle.vehicleType || "Truck",
            ownerName: vehicle.ownerName || "",
            ownerPhone: vehicle.ownerPhone || "",
            capacity: String(vehicle.capacity || ""),
        });
        setEditId(vehicle._id);
        setShowForm(true);
    };

    // ❌ Delete Vehicle - Open Confirmation Dialog
    const openDeleteDialog = (vehicle: Vehicle) => {
        setDeleteItemId(vehicle._id);
        setDeleteItemNumber(vehicle.vehicleNumber);
        setDeleteItemIsActive(vehicle.isActive ?? true);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeleteItemId(null);
        setDeleteItemNumber("");
    };

    const confirmDelete = async () => {
        if (!deleteItemId || deleteItemIsActive === null) return;
        try {
            const newState = !deleteItemIsActive;
            await api.put(`/vehicles/${deleteItemId}`, { isActive: newState }, {
                showToast: true,
                successMessage: newState ? t("vehicleEnabledSuccess") : t("vehicleDisabledSuccess")
            } as any);
            closeDeleteDialog();
            await fetchVehicles(search, page, pageSize);
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
                        <DialogTitle className="text-amber-600">Enable / Disable Vehicle</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to <span className="font-semibold text-gray-900">{deleteItemIsActive ? "disable" : "enable"}</span> vehicle <span className="font-semibold text-gray-900">"{deleteItemNumber}"</span>?
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
            <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">{t("vehicleMasterTitle")}</h1>
                    <p className="text-xs text-slate-500 mt-0">{t("vehicleMasterSubtitle")}</p>
                </div>

                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl font-semibold transition-all"
                >
                    <Plus size={18} /> {t("addVehicle")}
                </button>
            </Card>

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
    <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
            type="text"
            placeholder={t("searchVehicle")}
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
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{editId ? t("editVehicle") : t("addNewVehicle")}</h2>
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("vehicleNumber")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.vehicleNumber}
                                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterVehicleNumber")}
                                        disabled={submitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("vehicleType")}</label>
                                    <SearchableCombobox
                                        data={vehicleTypes}
                                        displayKey="label"
                                        placeholder={t("selectVehicleType")}
                                        value={formData.vehicleType}
                                        onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}
                                        masterLabel="Vehicle Type"
                                        masterPath="/dashboard/lr/masters/vehicle"
                                        inputClass="border border-slate-200 rounded-lg bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("ownerName")}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterOwnerName")}
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("ownerPhone")}</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.ownerPhone}
                                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterOwnerPhone")}
                                        disabled={submitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t("capacity")}</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="w-full px-4 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("enterCapacity")}
                                        disabled={submitting}
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
                                    <th className="px-6 py-2 text-left">{t("vehicleNumber")}</th>
                                    <th className="px-6 py-2 text-left">{t("vehicleType")}</th>
                                    <th className="px-6 py-2 text-left">{t("ownerName")}</th>
                                    <th className="px-6 py-2 text-left">{t("ownerPhone")}</th>
                                    <th className="px-6 py-2 text-left">{t("capacity")}</th>
                                    <th className="px-6 py-2 text-left">Enabled</th>
                                    <th className="px-6 py-2 text-center">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableBodyLoader colSpan={7} label={t("loadingVehicles")} />
                                ) : vehicles.length > 0 ? (
                                    vehicles.map((vehicle) => (
                                        <tr key={vehicle._id} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-2 font-semibold text-slate-800">{vehicle.vehicleNumber}</td>
                                            <td className="px-6 py-2 text-slate-600">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                    {vehicle.vehicleType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 text-slate-600">{vehicle.ownerName}</td>
                                            <td className="px-6 py-2 text-slate-600">{vehicle.ownerPhone || "—"}</td>
                                            <td className="px-6 py-2 text-slate-600">{vehicle.capacity ? `${vehicle.capacity} Tons` : "—"}</td>
                                            <td className="px-6 py-2 text-center">
                                                {vehicle.isActive ? (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Enabled</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Disabled</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(vehicle)} 
                                                        className="p-2 hover:bg-slate-200 rounded-lg text-amber-600 transition-colors"
                                                        title={t("edit")}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteDialog(vehicle)} 
                                                        className="p-2 hover:bg-slate-200 rounded-lg text-amber-600 transition-colors"
                                                        title={vehicle.isActive ? t("disable") : t("enable")}
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-500">{t("noVehiclesFound")}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                </div>

                {/* Pagination */}
                {!loading && vehicles.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalResults={totalResults}
                        onPageChange={(newPage) => fetchVehicles(search, newPage, pageSize)}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            fetchVehicles(search, 1, size);
                        }}
                    />
                )}
            </div>
        </div>
    );
}