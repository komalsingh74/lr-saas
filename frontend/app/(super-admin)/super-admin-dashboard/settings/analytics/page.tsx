"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import RevenueChart from "@/components/RevenueChart";
import api from "@/lib/api";
import {
  Building2,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";

interface CompanyItem {
  _id: string;
  companyName?: string;
  planType?: string;
  totalRevenueGenerated?: number;
  totalLRs?: number;
}

interface TransactionItem {
  id: string;
  company: string;
  plan: string;
  amount: number;
  status: string;
  date: string;
}

interface AnalyticsStats {
  totalCompanies: number;
  activeCompanies: number;
  expiredPlans: number;
  totalRevenue: number;
  totalLRs: number;
}

const initialStats: AnalyticsStats = {
  totalCompanies: 0,
  activeCompanies: 0,
  expiredPlans: 0,
  totalRevenue: 0,
  totalLRs: 0,
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function aggregateLast30Days(transactions: TransactionItem[]) {
  const days = 30;
  const today = new Date();
  const buckets: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    buckets[date.toISOString().slice(0, 10)] = 0;
  }

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const key = date.toISOString().slice(0, 10);
    if (key in buckets) buckets[key] += Number(transaction.amount) || 0;
  });

  return Object.keys(buckets).map((key) => ({
    label: key.slice(5),
    value: buckets[key],
  }));
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>(initialStats);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const [companyRes, paymentRes, userRes] = await Promise.all([
          api.get("/company/admin/all", { params: { page: 1, limit: 100 } }),
          api.get("/payment/transactions", { params: { page: 1, limit: 10 } }),
          api.get("/users/admin/all", { params: { page: 1, limit: 100 } }),
        ]);

        setStats(companyRes.data.stats || initialStats);
        setCompanies(companyRes.data.data?.companies || []);
        setTransactions(paymentRes.data.results || []);
        setUsers(userRes.data.data?.users || []);
      } catch (err: any) {
        console.error("Failed to load analytics dashboard", err);
        setError(err?.response?.data?.message || err?.message || "Unable to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const activeUsers = useMemo(() => users.filter((user) => user.isActive).length, [users]);
  const paidTransactions = useMemo(
    () => transactions.filter((transaction) => String(transaction.status).toLowerCase() === "paid").length,
    [transactions]
  );

  const topPlans = useMemo(() => {
    const planCounts = companies.reduce<Record<string, number>>((acc, company) => {
      const key = (company.planType || "Unknown").toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(planCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [companies]);

  const topCompanies = useMemo(
    () =>
      [...companies]
        .sort((a, b) => (b.totalRevenueGenerated || 0) - (a.totalRevenueGenerated || 0))
        .slice(0, 5),
    [companies]
  );

  const recentActivity = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <div className="p-1 space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-slate-500 text-sm">Track real platform performance from live backend data.</p>
          </div>
          <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">Live analytics</span>
        </div>
      </Card>

      {loading && <p className="text-sm text-slate-500">Loading analytics data...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign className="text-indigo-600" />} growth="Live revenue from payments" />
        <StatCard title="Active Companies" value={String(stats.activeCompanies)} icon={<Building2 className="text-emerald-600" />} growth={`${Math.round((stats.activeCompanies / Math.max(stats.totalCompanies, 1)) * 100)}% of total companies`} />
        <StatCard title="Active Users" value={String(activeUsers)} icon={<Users className="text-sky-600" />} growth={`${users.length} total users synced`} />
        <StatCard title="Paid Transactions" value={String(paidTransactions)} icon={<CreditCard className="text-violet-600" />} growth={`${transactions.length} recent payment records`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Revenue Trend</h2>
              <p className="text-xs text-slate-500">Sales performance over the last 30 days</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Professional graph</span>
          </div>
          <RevenueChart data={aggregateLast30Days(transactions)} />
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold">Plan Mix</h2>
            <p className="text-xs text-slate-500">Distribution of current company plans</p>
          </div>
          <div className="space-y-4">
            {topPlans.length > 0 ? (
              topPlans.map(([plan, count]) => {
                const percentage = Math.round((count / Math.max(companies.length, 1)) * 100);
                return (
                  <div key={plan} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{plan}</span>
                      <span className="text-slate-500">{count} companies</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-[11px] text-slate-400">{percentage}% of active plan subscriptions</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No plan data available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Top Plans</h2>
          <ul className="space-y-3 text-sm">
            {topPlans.length > 0 ? (
              topPlans.map(([plan, count]) => (
                <li key={plan} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium text-slate-700">{plan}</span>
                  <span className="font-semibold text-slate-900">{count} companies</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No plan data available.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Top Companies</h2>
          <ul className="space-y-3 text-sm">
            {topCompanies.length > 0 ? (
              topCompanies.map((company) => (
                <li key={company._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium text-slate-700">{company.companyName || "Unnamed Company"}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(company.totalRevenueGenerated || 0)}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">No company revenue data available.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="p-2 text-left">Event</th>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? (
                recentActivity.map((entry) => (
                  <tr key={entry.id} className="border-t">
                    <td className="p-2">Payment {entry.status}</td>
                    <td className="p-2">{entry.company}</td>
                    <td className="p-2">{formatCurrency(entry.amount)}</td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${entry.status === "paid" || entry.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="p-2">{new Date(entry.date).toLocaleString("en-IN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-2 text-slate-500">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, growth }: { title: string; value: string; icon: React.ReactNode; growth: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>
      <h2 className="mt-2 text-xl font-bold text-slate-900">{value}</h2>
      <p className="mt-1 text-xs text-emerald-600">{growth}</p>
    </div>
  );
}