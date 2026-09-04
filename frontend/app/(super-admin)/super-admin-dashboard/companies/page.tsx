"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  Eye,
  ExternalLink,
  Edit,
  Ban,
  RefreshCw,
  Trash2,
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Shield,
  CalendarDays,
  BadgeCheck,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import Pagination from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showError, showSuccess } from "@/lib/toast";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState<{
    totalCompanies: number;
    activeCompanies: number;
    expiredPlans: number;
    totalRevenue: number;
  }>({
    totalCompanies: 0,
    activeCompanies: 0,
    expiredPlans: 0,
    totalRevenue: 0,
  });
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<"edit" | "renew" | null>(null);
  const [actionCompany, setActionCompany] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    gstNumber: "",
    planType: "PRO",
    companyStatus: "ACTIVE",
    address: { street: "", city: "", state: "", pincode: "" },
  });
  const [renewMonths, setRenewMonths] = useState("1");
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [search, planFilter, statusFilter, expiryFilter, page, limit]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        planType: planFilter,
        status: statusFilter,
        expirySoon: expiryFilter === "soon" ? "true" : "false",
        page: String(page),
        limit: String(limit),
      });

      const response = await api.get(`/company/admin/all?${params}`);
      setCompanies(response.data.data.companies || []);
      // Backend returns pagination and stats
      const pagination = response.data.pagination || {};
      setTotalResults(pagination.totalCompanies ?? 0);
      setTotalPages(pagination.totalPages ?? 1);
      setStats({
        totalCompanies: response.data.stats?.totalCompanies ?? 0,
        activeCompanies: response.data.stats?.activeCompanies ?? 0,
        expiredPlans: response.data.stats?.expiredPlans ?? 0,
        totalRevenue: response.data.stats?.totalRevenue ?? 0,
      });
      setErrorMessage(null);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 403) {
        setErrorMessage("Access denied. Super admin login required to view companies.");
      } else if (status === 401) {
        setErrorMessage("Not authorized. Please login again.");
      } else {
        setErrorMessage("Failed to load companies. Please try again.");
      }
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (expiryDate: string | Date | undefined) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays >= 0;
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "basic": return "bg-gray-100 text-gray-600";
      case "pro": return "bg-blue-100 text-blue-600";
      case "enterprise": return "bg-purple-100 text-purple-600";
      case "trial": return "bg-yellow-100 text-yellow-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const handleViewDetails = async (company: any) => {
    setDetailsOpen(true);
    setDetailsError(null);
    setDetailsLoading(true);
    setSelectedCompany(null);

    try {
      const response = await api.get(`/company/admin/${company._id}`);
      setSelectedCompany(response.data.data.company || null);
    } catch (error: any) {
      setDetailsError(error?.response?.data?.message || "Failed to load company details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEditDialog = (company: any) => {
    setActionCompany(company);
    setActionMode("edit");
    setEditForm({
      companyName: company.companyName || "",
      email: company.email || company.owner?.email || "",
      phone: company.phone || "",
      gstNumber: company.gstNumber || "",
      planType: company.planType || "PRO",
      companyStatus: company.companyStatus || "ACTIVE",
      address: {
        street: company.address?.street || "",
        city: company.address?.city || "",
        state: company.address?.state || "",
        pincode: company.address?.pincode || "",
      },
    });
  };

  const handleAction = (action: string, company: any) => {
    if (action === "Open Dashboard") {
      router.push(`/super-admin/company/${company._id}/dashboard`);
      return;
    }

    if (action === "Edit Company") {
      openEditDialog(company);
      return;
    }

    if (action === "Suspend Company") {
      const nextStatus = company.companyStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
      void updateCompanyStatus(company, nextStatus);
      return;
    }

    if (action === "Renew Plan") {
      setActionCompany(company);
      setActionMode("renew");
      setRenewMonths("1");
    }
  };

  const updateCompanyStatus = async (company: any, nextStatus: string) => {
    try {
      setSavingAction(true);
      await api.put(`/company/admin/${company._id}`, { companyStatus: nextStatus });
      setCompanies((prev) =>
        prev.map((item) =>
          item._id === company._id ? { ...item, companyStatus: nextStatus } : item
        )
      );
      showSuccess(`Company status updated to ${nextStatus}.`);
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to update company status.");
    } finally {
      setSavingAction(false);
    }
  };

  const submitEditCompany = async () => {
    if (!actionCompany) return;

    try {
      setSavingAction(true);
      const payload = {
        companyName: editForm.companyName,
        email: editForm.email,
        phone: editForm.phone,
        gstNumber: editForm.gstNumber,
        planType: editForm.planType,
        companyStatus: editForm.companyStatus,
        address: editForm.address,
      };

      const response = await api.put(`/company/admin/${actionCompany._id}`, payload);
      const updatedCompany = response.data?.data?.company || payload;
      setCompanies((prev) =>
        prev.map((item) => (item._id === actionCompany._id ? { ...item, ...updatedCompany } : item))
      );
      setActionMode(null);
      setActionCompany(null);
      showSuccess("Company details updated successfully.");
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to update company details.");
    } finally {
      setSavingAction(false);
    }
  };

  const submitRenewPlan = async () => {
    if (!actionCompany) return;

    try {
      setSavingAction(true);
      const months = Number(renewMonths);
      const currentExpiry = actionCompany.planExpiryDate ? new Date(actionCompany.planExpiryDate) : new Date();
      currentExpiry.setMonth(currentExpiry.getMonth() + months);

      const response = await api.put(`/company/admin/${actionCompany._id}`, {
        planExpiryDate: currentExpiry.toISOString(),
        subscriptionStatus: "ACTIVE",
      });
      const updatedCompany = response.data?.data?.company || { planExpiryDate: currentExpiry.toISOString() };
      setCompanies((prev) =>
        prev.map((item) => (item._id === actionCompany._id ? { ...item, ...updatedCompany } : item))
      );
      setActionMode(null);
      setActionCompany(null);
      showSuccess(`Plan extended successfully for ${months} month(s).`);
    } catch (error: any) {
      showError(error?.response?.data?.message || "Failed to renew plan.");
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className="p-1 space-y-4">
      <Card className="p-4">
        {/* 🔹 Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Companies</h1>
            <p className="text-slate-500 text-sm">
              Manage transport businesses
            </p>
          </div>
          {/* 
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <Plus size={16} /> Add Company
          </button> */}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* 🔹 Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-slate-500">Total Companies</p>
                <p className="text-2xl font-bold">{stats.totalCompanies}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-slate-500">Active Companies</p>
                <p className="text-2xl font-bold">{stats.activeCompanies}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              <div>
                <p className="text-sm text-slate-500">Expired Plans</p>
                <p className="text-2xl font-bold">{stats.expiredPlans}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 🔹 Filters */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-full max-w-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search company, owner, phone..."
              className="ml-2 outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
            <option value="trial">Trial</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">All</option>
            <option value="soon">Expiry Soon</option>
          </select>
        </div>
      </Card>

      {/* 🔹 Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">LRs</th>
              <th className="p-3 text-left">Revenue</th>
              <th className="p-3 text-left">Expiry</th>
              <th className="p-3 text-left">Created By</th>
              <th className="p-3 text-left">Last Activity</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {companies.map((c) => (
              <tr key={c._id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => handleViewDetails(c)}>

                {/* Company */}
                <td className="p-3">
                  <div>
                    <p className="font-semibold">{c.companyName || "-"}</p>
                    <p className="text-xs text-slate-400">{c.owner?.name || c.owner?.email || "-"}</p>
                  </div>
                </td>

                {/* Plan */}
                <td className="p-3">
                  <Badge className={getPlanColor(c.planType || "")}>
                    {c.planType?.toUpperCase() || "-"}
                  </Badge>
                </td>

                {/* Status */}
                <td className="p-3">
                  <Badge
                    variant={c.companyStatus === "ACTIVE" ? "default" : "secondary"}
                    className={c.companyStatus === "ACTIVE" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}
                  >
                    {c.companyStatus || "-"}
                  </Badge>
                </td>

                {/* LRs */}
                <td className="p-3">{c.totalLRs ?? 0}</td>

                {/* Revenue */}
                <td className="p-3">₹{(c.totalRevenueGenerated ?? 0).toLocaleString()}</td>

                {/* Expiry */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {c.planExpiryDate ? new Date(c.planExpiryDate).toLocaleDateString() : "-"}
                    {isExpiringSoon(c.planExpiryDate) && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-600 border-orange-300">
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Created By */}
                <td className="p-3">{c.createdBy?.name || c.createdBy?.email || "-"}</td>

                {/* Last Activity */}
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    {c.lastActivity ? new Date(c.lastActivity).toLocaleDateString() : "-"}
                  </div>
                </td>

                {/* Actions */}
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem onClick={() => handleViewDetails(c)}>
                        <Eye size={14} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Open Dashboard", c)}>
                        <ExternalLink size={14} className="mr-2" />
                        Open Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Edit Company", c)}>
                        <Edit size={14} className="mr-2" />
                        Edit Company
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Suspend Company", c)}>
                        <Ban size={14} className="mr-2" />
                        Suspend Company
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Renew Plan", c)}>
                        <RefreshCw size={14} className="mr-2" />
                        Renew Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Inactive Company", c)} className="text-red-600">
                        <Trash2 size={14} className="mr-2" />
                        Inactive Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={limit}
            totalResults={totalResults}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
          />
        </div>
      </div>

      <Dialog open={actionMode === "edit"} onOpenChange={(open) => !open && setActionMode(null)}>
        <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update business details and status for this company.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">Company Name</label><Input value={editForm.companyName} onChange={(e) => setEditForm((prev) => ({ ...prev, companyName: e.target.value }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">Email</label><Input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">Phone</label><Input value={editForm.phone} onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">GST No</label><Input value={editForm.gstNumber} onChange={(e) => setEditForm((prev) => ({ ...prev, gstNumber: e.target.value }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">Plan</label><Select value={editForm.planType} onValueChange={(value) => setEditForm((prev) => ({ ...prev, planType: value }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select plan" /></SelectTrigger><SelectContent>{["BASIC", "PRO", "ENTERPRISE", "TRIAL"].map((plan) => <SelectItem key={plan} value={plan}>{plan}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">Status</label><Select value={editForm.companyStatus} onValueChange={(value) => setEditForm((prev) => ({ ...prev, companyStatus: value }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{["ACTIVE", "SUSPENDED", "BLOCKED"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1 md:col-span-2"><label className="text-xs uppercase tracking-wide text-slate-500">Street</label><Input value={editForm.address.street} onChange={(e) => setEditForm((prev) => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">City</label><Input value={editForm.address.city} onChange={(e) => setEditForm((prev) => ({ ...prev, address: { ...prev.address, city: e.target.value } }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">State</label><Input value={editForm.address.state} onChange={(e) => setEditForm((prev) => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wide text-slate-500">Pincode</label><Input value={editForm.address.pincode} onChange={(e) => setEditForm((prev) => ({ ...prev, address: { ...prev.address, pincode: e.target.value } }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionMode(null)} disabled={savingAction}>Cancel</Button>
            <Button onClick={submitEditCompany} disabled={savingAction}>{savingAction ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={actionMode === "renew"} onOpenChange={(open) => !open && setActionMode(null)}>
        <DialogContent className="!max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Plan</DialogTitle>
            <DialogDescription>Extend the subscription period for this company.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-slate-500">Duration</label>
            <Select value={renewMonths} onValueChange={setRenewMonths}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose duration" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">+1 Month</SelectItem>
                <SelectItem value="3">+3 Months</SelectItem>
                <SelectItem value="12">+1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionMode(null)} disabled={savingAction}>Cancel</Button>
            <Button onClick={submitRenewPlan} disabled={savingAction}>{savingAction ? "Updating..." : "Extend Plan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>
              Full company information fetched directly from the API for the selected company.
            </DialogDescription>
          </DialogHeader>

          {detailsLoading && (
            <div className="flex items-center justify-center gap-3 py-8 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading company details...
            </div>
          )}

          {detailsError && !detailsLoading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {detailsError}
            </div>
          )}

          {!detailsLoading && !detailsError && selectedCompany && (
            <div className="space-y-6 text-sm">
              <div className="rounded-xl border bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Company</p>
                    <h3 className="text-xl font-semibold text-slate-900">{selectedCompany.companyName || "-"}</h3>
                    <p className="text-slate-500">{selectedCompany.compCd || ""}</p>
                  </div>
                  <Badge className={getPlanColor(selectedCompany.planType || "")}>{selectedCompany.planType ? selectedCompany.planType.toUpperCase() : "-"}</Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailCard icon={<Building2 className="h-4 w-4 text-blue-600" />} label="Company Name" value={selectedCompany.companyName} />
                <DetailCard icon={<Shield className="h-4 w-4 text-violet-600" />} label="Owner Name" value={selectedCompany.owner?.name || "-"} />
                <DetailCard icon={<Mail className="h-4 w-4 text-emerald-600" />} label="Email" value={selectedCompany.email || "-"} />
                <DetailCard icon={<Phone className="h-4 w-4 text-amber-600" />} label="Phone" value={selectedCompany.phone || "-"} />
                <DetailCard icon={<MapPin className="h-4 w-4 text-rose-600" />} label="Address" value={formatAddress(selectedCompany.address)} />
                <DetailCard icon={<BadgeCheck className="h-4 w-4 text-sky-600" />} label="GST No" value={selectedCompany.gstNumber || "-"} />
                <DetailCard icon={<FileText className="h-4 w-4 text-indigo-600" />} label="Plan" value={selectedCompany.planType || "-"} />
                <DetailCard icon={<CalendarDays className="h-4 w-4 text-orange-600" />} label="Plan Expiry" value={selectedCompany.planExpiryDate ? new Date(selectedCompany.planExpiryDate).toLocaleDateString() : "-"} />
                <DetailCard icon={<Users className="h-4 w-4 text-purple-600" />} label="Total Users" value={selectedCompany.totalUsers ?? "N/A"} />
                <DetailCard icon={<FileText className="h-4 w-4 text-slate-600" />} label="Total LRs" value={selectedCompany.totalLRs ?? 0} />
                <DetailCard icon={<DollarSign className="h-4 w-4 text-green-600" />} label="Revenue" value={`₹${(selectedCompany.totalRevenueGenerated ?? 0).toLocaleString()}`} />
                <DetailCard icon={<CalendarDays className="h-4 w-4 text-gray-600" />} label="Created Date" value={selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleString() : "-"} />
                <DetailCard icon={<Shield className="h-4 w-4 text-slate-600" />} label="Status" value={selectedCompany.companyStatus || "-"} />
                <DetailCard icon={<Users className="h-4 w-4 text-slate-600" />} label="Created By" value={selectedCompany.createdBy?.name || selectedCompany.createdBy?.email || "-"} />
                <DetailCard icon={<Clock className="h-4 w-4 text-slate-600" />} label="Last Activity" value={selectedCompany.lastActivity ? new Date(selectedCompany.lastActivity).toLocaleString() : "-"} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-base font-semibold text-slate-900">{value ?? "-"}</p>
    </div>
  );
}

function formatAddress(address: any) {
  if (!address) return "-";
  return [address.street, address.city, address.state, address.pincode, address.country]
    .filter(Boolean)
    .join(", ");
}
// }