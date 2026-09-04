"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  TrendingUp,
  Users,
  ArrowUpRight,
  Users2,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
interface CompanyCard {
  _id: string;
  companyName: string;
  owner?: { name?: string } | null;
  totalLRs?: number;
  totalRevenueGenerated?: number;
}

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  expiredPlans: number;
  totalRevenue: number;
  totalLRs: number;
}

const initialStats: DashboardStats = {
  totalCompanies: 0,
  activeCompanies: 0,
  expiredPlans: 0,
  totalRevenue: 0,
  totalLRs: 0,
};

const defaultCompanies: CompanyCard[] = [];

export default function OverviewPage() {
  const [companies, setCompanies] = useState<CompanyCard[]>(defaultCompanies);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get("/company/admin/all", {
          params: {
            page: 1,
            limit: 4,
          },
        });

        setStats(response.data.stats || initialStats);
        setCompanies(response.data.data.companies || []);
      } catch (err: any) {
        console.error("Failed to load super-admin dashboard data", err);
        setError(err?.response?.data?.message || err?.message || "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total LRs",
      value: String(stats.totalLRs),
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Active Companies",
      value: String(stats.activeCompanies),
      icon: Building2,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Total Companies",
      value: String(stats.totalCompanies),
      icon: Building2,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="p-1 space-y-3 min-h-screen">

      {/* Header */}
      <Card className="p-3">
        <div className="flex justify-between items-center flex-wrap gap-4">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Welcome back 👋 Here’s what’s happening today.
            </p>
          </div>


          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href="/super-admin-dashboard/companies"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Building2 size={16} />
              Companies
            </Link>

            <Link href="/super-admin-dashboard/users" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow">
              <Users2 size={16} />
              All Users
            </Link>
          </div>
        </div>
      </Card>
      {/* Stats */}
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <Card
            key={i}
            className="bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
                    {stat.value}
                  </h3>
                </div>
              </div>

              <div className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                {/* Real data cards do not render placeholder change values */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Companies (NOT TABLE anymore) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-slate-800">
            Recent Companies
          </h2>

          <Link
            href="/super-admin-dashboard/companies"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-slate-500">Loading companies...</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="space-y-4">
          {companies.length > 0 ? (
            companies.slice(0, 4).map((company) => (
              <div
                key={company._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                    {company.companyName?.[0] || "C"}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {company.companyName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {company.owner?.name || "Owner not available"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">
                    ₹{company.totalRevenueGenerated?.toLocaleString("en-IN") || 0}
                  </p>
                  <p className="text-xs text-slate-400">
                    {company.totalLRs ?? 0} LRs
                  </p>
                </div>
              </div>
            ))
          ) : !loading ? (
            <p className="text-sm text-slate-500">No recent companies available.</p>
          ) : null}
        </div>
      </div>

      {/* Optional: Activity Section */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-bold text-slate-800 mb-4">
          Recent Activity
        </h2>

        <div className="space-y-3 text-sm text-slate-600">
          <p>✅ New company added: Agra Logistics Hub</p>
          <p>📦 25 LRs created today</p>
          <p>💰 Payment received: ₹14,500</p>
        </div>
      </div> */}

    </div>
  );
}