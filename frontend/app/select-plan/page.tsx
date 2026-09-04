"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import BuyButton from "@/components/BuyButton";
import api from "@/lib/api";

interface PlanRecord {
  _id: string;
  key: string;
  name: string;
  price: number;
  users: string;
  features: string[];
  description?: string;
  popular?: boolean;
}

export default function SelectPlanPage() {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get("/plans/public");
        const fetchedPlans = data?.data || [];
        setPlans(fetchedPlans);
        if (fetchedPlans.length > 0) {
          setSelectedPlan(fetchedPlans[0].key);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">

      {/* 🔹 Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-slate-500 text-sm mt-2">
          Select the best plan for your business
        </p>
      </div>

      {/* 🔹 Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {loading ? (
          <div className="md:col-span-3 rounded-xl border bg-white p-6 text-slate-500">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="md:col-span-3 rounded-xl border bg-white p-6 text-slate-500">No plans available yet. Please create plans from the super admin settings page.</div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.key}
              onClick={() => setSelectedPlan(plan.key)}
              className={`border rounded-2xl p-6 cursor-pointer transition ${selectedPlan === plan.key
                ? "border-blue-600 shadow-lg bg-white"
                : "bg-white hover:shadow-md"
                }`}
            >
              {plan.popular && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Most Popular</span>
              )}

              <h2 className="text-xl font-bold mt-3">{plan.name}</h2>
              <p className="text-sm text-slate-500 mt-1">{plan.description || "Subscription plan"}</p>

              <div className="mt-2">
                <span className="text-2xl font-bold">₹{plan.price}</span>
                <span className="text-sm text-slate-400"> /month</span>
              </div>

              <p className="text-sm text-slate-500 mt-1">{plan.users}</p>

              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-6 py-2 rounded-lg text-sm font-semibold ${selectedPlan === plan.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100"
                  }`}
              >
                {selectedPlan === plan.key ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* 🔹 Continue */}
      <div className="mt-8">
        <BuyButton plan={selectedPlan} />
      </div>

      {/* 🔹 Skip */}
      <Link href="/dashboard" className="mt-3 text-sm text-slate-500">
        Skip for now
      </Link>

    </div>
  );
}