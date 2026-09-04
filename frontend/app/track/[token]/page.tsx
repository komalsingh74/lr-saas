"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface PublicLR {
  lrNumber: string;
  date: string;
  status: string;
  from: string;
  to: string;
  updatedAt: string;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  "In Transit": "bg-blue-100 text-blue-800",
  Delivered: "bg-emerald-100 text-emerald-800",
};

export default function PublicTrackingPage() {
  const params = useParams<{ token: string }>();
  const [lr, setLr] = useState<PublicLR | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTracking = async () => {
      try {
        const response = await api.get(`/public/track/${params.token}`);
        setLr(response.data.lr);
      } catch (requestError: any) {
        setError(requestError.response?.data?.message || "Tracking details unavailable");
      }
    };

    if (params.token) loadTracking();
  }, [params.token]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Public LR Tracking</p>
        <h1 className="mt-2 text-2xl font-extrabold">Shipment status</h1>
        {error ? (
          <p className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : !lr ? (
          <p className="mt-8 text-sm text-slate-500">Loading tracking details...</p>
        ) : (
          <div className="mt-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">LR Number</p>
                <p className="text-lg font-bold">{lr.lrNumber}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[lr.status] || "bg-slate-100 text-slate-700"}`}>
                {lr.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-5">
              <div><p className="text-xs text-slate-500">From</p><p className="mt-1 font-semibold">{lr.from || "-"}</p></div>
              <div><p className="text-xs text-slate-500">To</p><p className="mt-1 font-semibold">{lr.to || "-"}</p></div>
            </div>
            <div className="text-sm text-slate-500">
              Created {new Date(lr.date).toLocaleDateString("en-IN")} · Last updated {new Date(lr.updatedAt).toLocaleString("en-IN")}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
