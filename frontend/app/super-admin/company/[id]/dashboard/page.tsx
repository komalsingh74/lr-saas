"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, DollarSign, FileText, Mail, MapPin, Phone, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";

export default function CompanyDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                const response = await api.get(`/company/admin/${params.id}`);
                setCompany(response.data?.data?.company || null);
            } catch (error) {
                console.error("Failed to load company dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) loadCompany();
    }, [params.id]);

    if (loading) {
        return <div className="p-6 text-sm text-slate-500">Loading company dashboard...</div>;
    }

    if (!company) {
        return <div className="p-6 text-sm text-red-600">Company not found.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Company Dashboard</p>
                        <h1 className="text-2xl font-bold">{company.companyName}</h1>
                    </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">{company.companyStatus || "ACTIVE"}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-4"><div className="flex items-center gap-3"><Users className="text-indigo-600" /><div><p className="text-sm text-slate-500">Total Users</p><p className="text-2xl font-bold">{company.totalUsers ?? 0}</p></div></div></Card>
                <Card className="p-4"><div className="flex items-center gap-3"><FileText className="text-blue-600" /><div><p className="text-sm text-slate-500">Total LRs</p><p className="text-2xl font-bold">{company.totalLRs ?? 0}</p></div></div></Card>
                <Card className="p-4"><div className="flex items-center gap-3"><DollarSign className="text-green-600" /><div><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-bold">₹{(company.totalRevenueGenerated ?? 0).toLocaleString()}</p></div></div></Card>
                <Card className="p-4"><div className="flex items-center gap-3"><CalendarDays className="text-amber-600" /><div><p className="text-sm text-slate-500">Plan Expiry</p><p className="text-2xl font-bold">{company.planExpiryDate ? new Date(company.planExpiryDate).toLocaleDateString() : "-"}</p></div></div></Card>
            </div>

            <Card className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Company Overview</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <SummaryItem icon={<Building2 className="h-4 w-4 text-blue-600" />} label="Company Name" value={company.companyName} />
                    <SummaryItem icon={<Shield className="h-4 w-4 text-violet-600" />} label="Owner Name" value={company.owner?.name || "-"} />
                    <SummaryItem icon={<Mail className="h-4 w-4 text-emerald-600" />} label="Email" value={company.email || company.owner?.email || "-"} />
                    <SummaryItem icon={<Phone className="h-4 w-4 text-amber-600" />} label="Phone" value={company.phone || "-"} />
                    <SummaryItem icon={<MapPin className="h-4 w-4 text-rose-600" />} label="Address" value={[company.address?.street, company.address?.city, company.address?.state, company.address?.pincode].filter(Boolean).join(", ") || "-"} />
                    <SummaryItem icon={<FileText className="h-4 w-4 text-slate-600" />} label="GST No" value={company.gstNumber || "-"} />
                    <SummaryItem icon={<CalendarDays className="h-4 w-4 text-indigo-600" />} label="Plan" value={company.planType || "-"} />
                    <SummaryItem icon={<CalendarDays className="h-4 w-4 text-slate-600" />} label="Created Date" value={company.createdAt ? new Date(company.createdAt).toLocaleString() : "-"} />
                </div>
            </Card>
        </div>
    );
}

function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
    return (
        <div className="rounded-xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide">{icon}<span>{label}</span></div>
            <p className="mt-2 text-base font-semibold text-slate-900">{value ?? "-"}</p>
        </div>
    );
}
