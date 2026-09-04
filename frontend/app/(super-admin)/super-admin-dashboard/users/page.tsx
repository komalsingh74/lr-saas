"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, KeyRound, MoreVertical, Pencil, ShieldCheck, ShieldOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

interface CompanyInfo {
  _id?: string;
  companyName?: string;
  compCd?: string;
  planType?: string;
  subscriptionStatus?: string;
}

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId?: CompanyInfo | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  companyRole?: string;
  userCd?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

interface Stats {
  activeUsers: number;
  inactiveUsers: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "user" });

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, roleFilter, statusFilter, page, pageSize]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, unknown> = { page, limit: pageSize };
      if (search) params.search = search;
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await api.get("/users/admin/all", { params });
      const payload = response.data;

      setUsers(payload.data?.users || []);
      setPagination({
        currentPage: payload.pagination?.currentPage || 1,
        totalPages: payload.pagination?.totalPages || 1,
        totalUsers: payload.pagination?.totalUsers || 0,
      });
      setPage(payload.pagination?.currentPage || 1);
      setStats({
        activeUsers: payload.stats?.activeUsers || 0,
        inactiveUsers: payload.stats?.inactiveUsers || 0,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  const openView = (user: UserRow) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
    });
    setEditOpen(true);
  };

  const openReset = (user: UserRow) => {
    setSelectedUser(user);
    setTemporaryPassword("");
    setResetOpen(true);
  };

  const toggleStatus = async (user: UserRow) => {
    const nextStatus = !user.isActive;
    try {
      setSaving(true);
      await api.put(`/users/admin/${user._id}`, { isActive: nextStatus }, { showToast: true, successMessage: `User ${nextStatus ? "activated" : "suspended"}` } as any);
      setUsers((prev) => prev.map((item) => item._id === user._id ? { ...item, isActive: nextStatus } : item));
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      await api.put(`/users/admin/${selectedUser._id}`, editForm, { showToast: true, successMessage: "User updated" } as any);
      setUsers((prev) => prev.map((item) => item._id === selectedUser._id ? { ...item, ...editForm } : item));
      setEditOpen(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const response = await api.post(`/users/admin/${selectedUser._id}/reset-password`, {}, { showToast: true, successMessage: "Temporary password generated" } as any);
      setTemporaryPassword(response.data?.data?.temporaryPassword || "");
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const displayedUsers = useMemo(() => users, [users]);

  return (
    <div className="p-1 space-y-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-slate-500 text-sm">Manage all platform users, subscription status, and quick admin actions.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total users" value={pagination.totalUsers} />
        <StatCard title="Active users" value={stats.activeUsers} />
        <StatCard title="Inactive users" value={stats.inactiveUsers} />
        <StatCard title="Page size" value={`${displayedUsers.length} / ${pageSize}`} />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 md:max-w-md">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone"
              className="w-full border-none bg-transparent px-1 text-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="all">All Roles</option>
              <option value="superAdmin">Super Admin</option>
              <option value="user">User</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Subscription</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Last Login</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-500">Loading users...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="p-6 text-center text-rose-600">{error}</td></tr>
            ) : displayedUsers.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-500">No users found.</td></tr>
            ) : (
              displayedUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-slate-50">
                  <td className="p-3"><div><p className="font-semibold">{user.name}</p><p className="text-xs text-slate-400">{user.email}</p>{user.phone && <p className="text-xs text-slate-400">{user.phone}</p>}</div></td>
                  <td className="p-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.role === "superAdmin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>{user.role === "superAdmin" ? "Super Admin" : "User"}</span></td>
                  <td className="p-3">{user.companyId?.companyName || user.companyId?.compCd || "No company"}</td>
                  <td className="p-3"><span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{user.companyId?.planType || "TRIAL"}</span> <span className="ml-1 text-xs text-slate-400">{user.companyId?.subscriptionStatus || "ACTIVE"}</span></td>
                  <td className="p-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="p-3 text-slate-500">{formatDate(user.updatedAt)}</td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => openView(user)}><Eye size={14} className="mr-2" />View User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(user)}><Pencil size={14} className="mr-2" />Edit User</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReset(user)}><KeyRound size={14} className="mr-2" />Reset Password</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(user)}><span className="mr-2">{user.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}</span>{user.isActive ? "Suspend User" : "Activate User"}</DropdownMenuItem>
                        {user.companyId?._id && <DropdownMenuItem onClick={() => router.push(`/super-admin-dashboard/companies/${user.companyId?._id}`)}><Building2 size={14} className="mr-2" />Open Company</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openView(user)}>View Activity</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={pagination.totalPages} pageSize={pageSize} totalResults={pagination.totalUsers} onPageChange={(newPage) => setPage(newPage)} onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(1); }} />

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Basic overview for quick super-admin verification.</DialogDescription>
          </DialogHeader>
          {selectedUser && <div className="grid gap-3 text-sm">{[
            ["Name", selectedUser.name],
            ["Email", selectedUser.email],
            ["Phone", selectedUser.phone || "-"],
            ["Role", selectedUser.role],
            ["Company", selectedUser.companyId?.companyName || selectedUser.companyId?.compCd || "No company"],
            ["Created Date", formatDate(selectedUser.createdAt)],
            ["Last Login", formatDate(selectedUser.updatedAt)],
            ["Status", selectedUser.isActive ? "Active" : "Inactive"],
          ].map(([label, value]) => <div key={label} className="grid grid-cols-2 gap-2 rounded-lg border bg-slate-50 p-3"><span className="text-slate-500">{label}</span><strong className="text-right">{value}</strong></div>)} </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit user</DialogTitle><DialogDescription>Update the primary account details for this user.</DialogDescription></DialogHeader>
          <div className="grid gap-3 py-2">
            <input className="rounded-lg border px-3 py-2" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <input className="rounded-lg border px-3 py-2" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <input className="rounded-lg border px-3 py-2" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <select className="rounded-lg border px-3 py-2" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
              <option value="user">User</option>
              <option value="superAdmin">Super Admin</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Generate a temporary password for this user. Share it securely.</DialogDescription></DialogHeader>
          <div className="space-y-3 py-2">
            <Button onClick={resetPassword} disabled={saving} className="w-full">{saving ? "Generating..." : "Generate temporary password"}</Button>
            {temporaryPassword && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">Temporary password: <strong>{temporaryPassword}</strong></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setResetOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (<div className="bg-white p-4 rounded-xl border"><p className="text-sm text-slate-500">{title}</p><h2 className="text-xl font-bold mt-2">{value}</h2></div>);
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}