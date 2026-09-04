"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, Activity, ShieldAlert, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";

type LogRow = {
  companyId: string;
  userId: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  createdAt: string;
};

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalLogs: number;
}

interface StatsState {
  totalLogs: number;
  totalModules: number;
  totalUsers: number;
}

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, totalPages: 1, totalLogs: 0 });
  const [stats, setStats] = useState<StatsState>({ totalLogs: 0, totalModules: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, unknown> = {
        page,
        limit: pageSize,
      };

      if (search.trim()) params.search = search.trim();

      const response = await api.get("/logs/admin/all", { params });
      const payload = response.data;

      setLogs(payload.data?.logs || []);
      setPagination(payload.pagination || { currentPage: 1, totalPages: 1, totalLogs: 0 });
      setStats(payload.stats || { totalLogs: 0, totalModules: 0, totalUsers: 0 });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Unable to load logs");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  return (
    <div className="p-1 space-y-4">
      <Card className="p-4">
        <h1 className="text-2xl font-bold">Logs</h1>
        <p className="text-slate-500 text-sm">Monitor system activity and events</p>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Logs" value={stats.totalLogs || pagination.totalLogs} icon={<Activity />} />
        <StatCard title="Modules" value={stats.totalModules} icon={<CheckCircle />} />
        <StatCard title="Unique Users" value={stats.totalUsers} icon={<ShieldAlert />} />
        <StatCard title="Current Page" value={pagination.currentPage} icon={<ShieldAlert />} />
      </div>

      <div className="flex gap-4">
        <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-full max-w-sm">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="ml-2 outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Company ID</th>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-left">Details</th>
              <th className="p-3 text-left">IP Address</th>
              <th className="p-3 text-left">Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">Loading logs...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-rose-600">{error}</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">No logs found.</td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={`${log.companyId}-${log.userId}-${i}`} className="border-t hover:bg-slate-50 align-top">
                  <td className="p-3 font-medium">{log.companyId}</td>
                  <td className="p-3">{log.userId}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">{log.module}</td>
                  <td className="p-3 text-slate-600 max-w-xs">{log.details}</td>
                  <td className="p-3 text-slate-500">{log.ipAddress}</td>
                  <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        pageSize={pageSize}
        totalResults={pagination.totalLogs}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
}

/* 🔹 Stat Card */
function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
    </div>
  );
}