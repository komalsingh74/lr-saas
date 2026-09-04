"use client";
import { useState, type FormEvent, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus, Edit, Ban, Search, X, ChevronDown } from "lucide-react";
import { Country, State, City as CityData } from "country-state-city";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import TableBodyLoader from "@/components/TableBodyLoader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SearchableSelect, { SelectOption } from "@/components/SearchableSelect";

type City = {
    _id: string;
    cityName: string;
    state: string;
    isActive?: boolean;
};

const DEFAULT_COUNTRY_ISO = "IN"; // change/remove if you don't want a default

export default function CityMaster() {
    const t = useTranslations();
    const [cities, setCities] = useState<City[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ cityName: "", state: "" });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // 🌍 Country / State selection — only used to drive the dropdowns.
    // Backend payload still only sends { cityName, state } exactly as before.
    const [countryIso, setCountryIso] = useState(DEFAULT_COUNTRY_ISO);
    const [stateIso, setStateIso] = useState("");

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [deleteItemName, setDeleteItemName] = useState("");
    const [deleteItemIsActive, setDeleteItemIsActive] = useState<boolean | null>(null);

    // 📦 Static country/state/city data from the "country-state-city" package
    const countryOptions: SelectOption[] = useMemo(
        () => Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode })),
        []
    );

    const stateOptions: SelectOption[] = useMemo(
        () =>
            countryIso
                ? State.getStatesOfCountry(countryIso).map((s) => ({ label: s.name, value: s.isoCode }))
                : [],
        [countryIso]
    );

    const cityOptions: SelectOption[] = useMemo(
        () =>
            countryIso && stateIso
                ? CityData.getCitiesOfState(countryIso, stateIso).map((c) => ({ label: c.name, value: c.name }))
                : [],
        [countryIso, stateIso]
    );

    const selectedCountryLabel =
        countryOptions.find((c) => c.value === countryIso)?.label || "";

    // 📥 Fetch cities with pagination and search
    const fetchCities = async (searchTerm = "", pageNum = 1, limit = 10) => {
        try {
            setLoading(true);
            setError("");

            const payload: any = {
                search: searchTerm,
                page: pageNum,
                limit: limit,
            };

            if (statusFilter !== "all") payload.isActive = statusFilter === "enabled";

            const response = await api.post("/cities/filter", payload);

            setCities(response.data.cities || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalResults(response.data.totalResults || 0);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.response?.data?.message || t("errorFetchingCities"));
            showError(err.response?.data?.message || t("errorFetchingCities"));
            setCities([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔍 Fetch once on mount and debounce search/filter changes.
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchCities(search, 1, pageSize);
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [search, statusFilter, pageSize]);

    const resetForm = () => {
        setFormData({ cityName: "", state: "" });
        setEditId(null);
        setCountryIso(DEFAULT_COUNTRY_ISO);
        setStateIso("");
    };

    // ➕ Create or Update City
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.cityName.trim() || !formData.state.trim()) {
            showError(t("fillAllFields"));
            return;
        }

        try {
            setSubmitting(true);

            if (editId) {
                // ✏️ Update — payload shape unchanged: { cityName, state }
                await api.put(`/cities/${editId}`, formData, {
                    showToast: true,
                    successMessage: t("cityUpdatedSuccess"),
                } as any);
            } else {
                // ➕ Create — payload shape unchanged: { cityName, state }
                await api.post("/cities", formData, {
                    showToast: true,
                    successMessage: t("cityCreatedSuccess"),
                } as any);
            }

            resetForm();
            setShowForm(false);
            await fetchCities(search, page, pageSize);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || t("errorSavingCity");
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (city: City) => {
        // Try to resolve the saved state name back to an isoCode (under the default
        // country) so the State dropdown and the City suggestions line up correctly.
        const matchedState = State.getStatesOfCountry(DEFAULT_COUNTRY_ISO).find(
            (s) => s.name.toLowerCase() === (city.state || "").toLowerCase()
        );

        setCountryIso(DEFAULT_COUNTRY_ISO);
        setStateIso(matchedState ? matchedState.isoCode : "");
        setFormData({ cityName: city.cityName || "", state: city.state || "" });
        setEditId(city._id);
        setShowForm(true);
    };

    // ❌ Delete City - Open Confirmation Dialog
    const openDeleteDialog = (city: City) => {
        setDeleteItemId(city._id);
        setDeleteItemName(city.cityName);
        setDeleteItemIsActive(city.isActive ?? true);
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
            await api.put(`/cities/${deleteItemId}`, { isActive: newState }, {
                showToast: true,
                successMessage: newState ? t("cityEnabledSuccess") : t("cityDisabledSuccess"),
            } as any);
            closeDeleteDialog();
            await fetchCities(search, page, pageSize);
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
                        <DialogTitle className="text-amber-600">Enable / Disable City</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to{" "}
                            <span className="font-semibold text-gray-900">
                                {deleteItemIsActive ? "disable" : "enable"}
                            </span>{" "}
                            <span className="font-semibold text-gray-900">"{deleteItemName}"</span>?
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
                    <h1 className="text-2xl font-extrabold text-slate-800">{t("cityMasterTitle")}</h1>
                    <p className="text-xs text-slate-500 mt-0">{t("cityMasterSubtitle")}</p>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl font-semibold transition-all"
                >
                    <Plus size={18} /> {t("addCity")}
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
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                }}
                className="px-4 py-2 pr-8 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
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
            placeholder={t("searchCityState")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
    </div>
</Card>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editId ? t("editCity") : t("addNewCity")}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="p-1 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-3">
                            {/* Country — drives the State list. Not sent to backend. */}
                            <SearchableSelect
                                label="Country"
                                placeholder="Select country"
                                options={countryOptions}
                                value={selectedCountryLabel}
                                disabled={submitting}
                                onSelect={(opt) => {
                                    setCountryIso(opt.value);
                                    setStateIso("");
                                    setFormData((prev) => ({ ...prev, state: "" }));
                                }}
                            />

                            {/* State — drives the City suggestions. Value sent to backend as before. */}
                            <SearchableSelect
                                label={t("state")}
                                placeholder={t("enterStateName")}
                                options={stateOptions}
                                value={formData.state}
                                disabled={submitting}
                                onSelect={(opt) => {
                                    setStateIso(opt.value);
                                    setFormData((prev) => ({ ...prev, state: opt.label }));
                                }}
                            />

                            {/* City — searchable, but freeText so a city missing from the package can still be typed */}
                            <SearchableSelect
                                label={t("cityName")}
                                placeholder={t("enterCityName")}
                                options={cityOptions}
                                value={formData.cityName}
                                disabled={submitting}
                                freeText
                                onSelect={(opt) => setFormData((prev) => ({ ...prev, cityName: opt.label }))}
                                onTextChange={(text) => setFormData((prev) => ({ ...prev, cityName: text }))}
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    disabled={submitting}
                                    className="px-6 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submitting ? t("saving") : editId ? t("update") : t("save")}
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
                                    <th className="px-6 py-2 text-left">{t("cityName")}</th>
                                    <th className="px-6 py-2 text-left">{t("state")}</th>
                                    <th className="px-6 py-2 text-left">Enabled</th>
                                    <th className="px-6 py-2 text-center">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableBodyLoader colSpan={4} label={t("loadingCities")} />
                                ) : cities.length > 0 ? (
                                    cities.map((city) => (
                                        <tr key={city._id} className="border-t border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-2 font-semibold text-slate-800">{city.cityName}</td>
                                            <td className="px-6 py-2 text-slate-600">{city.state}</td>
                                            <td className="px-6 py-2 text-center">
                                                {city.isActive ? (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                                                        Enabled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                        Disabled
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(city)}
                                                        className="p-2 hover:bg-slate-200 rounded-lg text-amber-600 transition-colors"
                                                        title={t("edit")}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteDialog(city)}
                                                        className="p-2 hover:bg-slate-200 rounded-lg text-amber-600 transition-colors"
                                                        title={city.isActive ? t("disable") : t("enable")}
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-500">
                                            {t("noCitiesFound")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {cities.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalResults={totalResults}
                            onPageChange={(newPage) => fetchCities(search, newPage, pageSize)}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                fetchCities(search, 1, size);
                            }}
                        />
                    )}
            </div>
        </div>
    );
}