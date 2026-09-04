"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  CheckCircle,
  Plus,
  BarChart3,
  Truck,
  Search,
  Filter,
  ArrowRight,
  ArrowUpRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import api from "@/lib/api";
import { showError} from "@/lib/toast";
import { useCompany } from "@/app/company-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

type Summary = {
  totalLR: number;
  todayLR: number;
  inTransit: number;
  delivered: number;
};

type RecentLR = {
  _id: string;
  lrNumber: string;
  date: string;
  from: string;
  to: string;
  consignor: string;
  status: string;
};

// ================= SKELETON SUB-COMPONENTS =================

function StatCardSkeleton() {
  return (
    <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-white to-slate-50/30">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-0 space-y-2">
      {/* Header */}
      <Card className="px-3 py-2">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Overview + Status charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 py-2 px-5 border border-slate-200 shadow-none rounded-xl">
          <Skeleton className="h-3 w-24 mb-4" />
          <Skeleton className="h-[190px] w-full rounded-lg" />
        </Card>

        <Card className="px-5 py-2 border border-slate-200 shadow-none rounded-xl">
          <Skeleton className="h-3 w-28 mb-3" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-[100px] w-[120px] rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 px-5 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-wrap gap-2.5">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Recent LR table */}
      <Card className="border border-slate-200 shadow-none overflow-hidden rounded-xl">
        <div className="px-6 py-3 border-b border-slate-100">
          <Skeleton className="h-4 w-36" />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-6 py-2 text-left">LR No.</th>
                <th className="px-6 py-2 text-left">Date</th>
                <th className="px-6 py-2 text-left">Route (from - to)</th>
                <th className="px-6 py-2 text-left">Party</th>
                <th className="px-6 py-2 text-left">Status</th>
                <th className="px-6 py-2 text-right">Track</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <ArrowRight size={12} className="text-slate-200" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>
                  <td className="px-6 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-3 text-right"><Skeleton className="h-4 w-4 ml-auto rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-center">
          <Skeleton className="h-4 w-40" />
        </div>
      </Card>
    </div>
  );
}

// ================= MAIN DASHBOARD =================

export default function Dashboard() {
  const t = useTranslations();
  const { refreshCompany } = useCompany();
  const [summary, setSummary] = useState<Summary>({ totalLR: 0, todayLR: 0, inTransit: 0, delivered: 0 });
  const [recentLR, setRecentLR] = useState<RecentLR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch company data
        await refreshCompany();

        // Fetch summary
        const summaryResponse = await api.get("/lr/summary");
        setSummary(summaryResponse.data);

        // Fetch recent LRs
        const recentResponse = await api.post("/lr/filter", {
          page: 1,
          limit: 5,
          sort: { createdAt: -1 }
        });
        setRecentLR(recentResponse.data.lrs.map((lr: any) => ({
          _id: lr._id,
          lrNumber: lr.lrNumber || lr._id,
          date: lr.date ? new Date(lr.date).toLocaleDateString("en-IN") : "",
          from: lr.fromCity?.cityName || lr.from || "",
          to: lr.toCity?.cityName || lr.to || "",
          consignor: lr.consignor?.partyName || lr.consignor || "",
          status: lr.status || ""
        })));
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        showError("Failed to load dashboard data");
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshCompany]);

  // Helper for Status Badge Colors
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-[#1C6B4A]/10 text-[#1C6B4A]";
      case "In Transit":
        return "bg-[#B96A16]/10 text-[#B96A16]";
      case "Pending":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getTranslatedStatus = (status: string) => {
    if (status === "In Transit") return t("inTransit");
    if (status === "Delivered") return t("delivered");
    if (status === "Pending") return t("pending");
    return status;
  };

  // Derived, live chart data from the summary already fetched above
  const pendingCount = Math.max(summary.totalLR - summary.inTransit - summary.delivered, 0);
  const statusChartData = [
    { name: t("delivered"), value: summary.delivered, color: "#1C6B4A" },
    { name: t("inTransit"), value: summary.inTransit, color: "#D98324" },
    { name: t("pending"), value: pendingCount, color: "#152238" },
  ];
  const statusChartTotal = statusChartData.reduce((sum, d) => sum + d.value, 0);

  // Overview bar chart - also live, derived from the same summary
  const overviewChartData = [
    { name: t("totalLR"), value: summary.totalLR, color: "#152238" },
    { name: t("todayLR"), value: summary.todayLR, color: "#1C6B4A" },
    { name: t("inTransit"), value: summary.inTransit, color: "#D98324" },
    { name: t("delivered"), value: summary.delivered, color: "#5B6472" },
  ];

  if (loading) {
    return (
      <div className="p-0 space-y-2">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            {error}
            {/* {showError()} */}
          </div>
        )}
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-0 space-y-2">
      {/* Error Message */}
      {/* {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )} */}

      {/* ================= HEADER ================= */}
      <Card className="px-3 py-2">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {t("overview")}
            </h2>
            <p className="text-slate-500 text-xs mt-0">Real-time logistics monitoring</p>
          </div>
        </div>
      </Card>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total LR */}
        <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-white to-blue-50/30 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("totalLR")}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{summary.totalLR}</h3>
            </div>
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
              <FileText size={16} />
            </div>
          </div>
        </Card>

        {/* Today LR */}
        <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("todayLR")}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{summary.todayLR}</h3>
            </div>
            <div className="p-2.5 bg-green-600 text-white rounded-2xl shadow-lg shadow-green-100 group-hover:scale-110 transition-transform">
              <Plus size={16} />
            </div>
          </div>
        </Card>

        {/* In Transit */}
        <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-white to-amber-50/30 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("inTransit")}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{summary.inTransit}</h3>
            </div>
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
              <Truck size={16} />
            </div>
          </div>
        </Card>

        {/* Delivered */}
        <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("delivered")}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{summary.delivered}</h3>
            </div>
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle size={16} />
            </div>
          </div>
        </Card>
      </div>

      {/* ================= OVERVIEW + STATUS CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LR Overview Bar Chart - live, derived from summary */}
        <Card className="lg:col-span-2 py-2 px-5 border border-slate-200 shadow-none rounded-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LR overview</p>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewChartData} barSize={40}>
                <CartesianGrid vertical={false} stroke="#E4DCC8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#5B6472" }}
                  axisLine={{ stroke: "#E4DCC8" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#5B6472" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  cursor={{ fill: "#F6F1E4" }}
                  formatter={(value: number) => [`${value}`, "Count"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #E4DCC8", fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {overviewChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Shipment Status Donut Chart - live, derived from summary */}
        <Card className="px-5 py-2 border border-slate-200 shadow-none rounded-xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Shipment status</p>
          {statusChartTotal === 0 ? (
            <div className="h-[140px] flex items-center justify-center text-xs text-slate-400">
              No shipment data yet
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-[120px] h-[100px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={32}
                      outerRadius={50}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value} LRs`, name]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #E4DCC8", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {statusChartData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-slate-600 font-medium">{entry.name}</span>
                    </div>
                    <span className="font-bold text-[#152238]">
                      {entry.value} <span className="text-slate-400 font-normal">({statusChartTotal ? Math.round((entry.value / statusChartTotal) * 100) : 0}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="rounded-xl border border-slate-200 px-5 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[#152238]">
          {t("quickActions")}
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/dashboard/lr/create" className="flex items-center gap-2 bg-[#152238] hover:bg-[#1C6B4A] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            <Plus size={16} /> {t("createNewLR")}
          </Link>
          <Link href="/dashboard/lr/list" className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-[#152238] px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-200">
            <FileText size={16} /> {t("viewAllLR")}
          </Link>
          <Link href="/dashboard/lr/reports" className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-[#152238] px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-200">
            <BarChart3 size={16} /> {t("reports")}
          </Link>
        </div>
      </div>

      {/* ================= RECENT LR TABLE ================= */}
      <Card className="border border-slate-200 shadow-none overflow-hidden rounded-xl">
        <div className="px-6 py-1 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-bold text-[#152238]">
            {t("recentLREntries")}
          </h3>

          {/* <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input
                placeholder="Search LR or party..."
                className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus-visible:ring-1 focus-visible:ring-[#152238]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0">
              <Filter size={15} />
            </button>
          </div> */}
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-6 py-2 text-left">{t("lrNo")}</th>
                <th className="px-6 py-2 text-left">{t("date")}</th>
                <th className="px-6 py-2 text-left">Route (from - to)</th>
                <th className="px-6 py-2 text-left">{t("party")}</th>
                <th className="px-6 py-2 text-left">{t("status")}</th>
                {/* <th className="px-6 py-2 text-right">Track</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLR.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No recent LR entries found
                  </td>
                </tr>
              ) : (
                recentLR.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3 font-bold text-[#152238]">{item.lrNumber}</td>
                    <td className="px-6 py-3 text-slate-500">{item.date}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{item.from}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className="font-medium text-slate-700">{item.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{item.consignor}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getStatusStyles(item.status)}`}>
                        {getTranslatedStatus(item.status)}
                      </span>
                    </td>
                    {/* <td className="px-6 py-3 text-right">
                      <ArrowUpRight size={15} className="inline text-slate-300 hover:text-[#152238] transition-colors cursor-pointer" />
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3.5 border-t border-slate-100 text-center">
          <Link href="/dashboard/lr/list" className="text-sm font-bold text-[#1C6B4A] hover:underline inline-flex items-center gap-1">
            View all transactions <ArrowRight size={13} />
          </Link>
        </div>
      </Card>
    </div>
  );
}