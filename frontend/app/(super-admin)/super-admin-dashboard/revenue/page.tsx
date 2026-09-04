"use client";
import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import api from "@/lib/api";
import RevenueChart from "@/components/RevenueChart";

export default function RevenuePage() {
  const [filter, setFilter] = useState("monthly");

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    transactions: 0,
  });

  useEffect(() => {
    loadTransactions(page, limit);
    loadStats();
  }, [page, limit]);

  const loadTransactions = async (pageNumber: number, pageSize: number) => {
    try {
      setLoading(true);
      const res = await api.get("/payment/transactions", {
        params: { page: pageNumber, limit: pageSize },
      });

      setTransactions(res.data.results || []);
      setTotalResults(res.data.totalResults || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || pageNumber);
      setLimit(res.data.limit || pageSize);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  // Load aggregate stats from company endpoint
  const loadStats = async () => {
    try {
      const res = await api.get("/company/admin/all", { params: { page: 1, limit: 1 } });
      const s = res.data.stats || {};
      setStats({
        totalRevenue: s.totalRevenue || 0,
        monthlyRevenue: s.totalRevenue || 0,
        activeSubscriptions: s.activeCompanies || 0,
        transactions: res.data.pagination?.totalCompanies || 0,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  // Aggregate transactions into last 30 days buckets for the chart
  function aggregateLast30Days(trans: any[]) {
    const days = 30;
    const today = new Date();
    const buckets: Record<string, number> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = 0;
    }

    trans.forEach((t: any) => {
      const d = new Date(t.date);
      const key = d.toISOString().slice(0, 10);
      const amt = Number(t.amount) || 0;
      if (key in buckets) buckets[key] += amt;
    });

    return Object.keys(buckets).map((k) => ({ label: k.slice(5), value: buckets[k] }));
  }

  return (
    <div className="p-1 space-y-4">

      {/* 🔹 Header */}
      <Card className="p-4">
        <h1 className="text-2xl font-bold">Revenue</h1>
        <p className="text-slate-500 text-sm">Track earnings & subscription performance</p>
      </Card>

      {/* 🔹 Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign />} growth="" />
        <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue.toLocaleString()}`} icon={<TrendingUp />} growth="" />
        <StatCard title="Active Subscriptions" value={String(stats.activeSubscriptions)} icon={<Users />} growth="" />
        <StatCard title="Transactions" value={String(totalResults)} icon={<CreditCard />} growth="" />
      </div>

      {/* 🔹 Chart */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-semibold mb-4">Revenue Trend</h2>
        <RevenueChart data={aggregateLast30Days(transactions)} />
      </div>

      {/* 🔹 Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Plan</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t: any) => (
              <tr key={t.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-medium">{t.company}</td>
                <td className="p-3">{t.plan}</td>
                <td className="p-3">₹{t.amount}</td>
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded ${t.status === "paid" || t.status === "Paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
  );
}

/* 🔹 Stat Card */
function StatCard({ title, value, icon, growth }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>
      <h2 className="text-xl font-bold mt-2">{value}</h2>
      <p className="text-green-600 text-xs mt-1">{growth}</p>
    </div>
  );
}