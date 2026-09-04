"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2, Pencil } from "lucide-react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PlanForm {
  _id?: string;
  name: string;
  key: string;
  price: string;
  users: string;
  companies: string;
  features: string;
  description: string;
  popular: boolean;
  active: boolean;
}

interface PlanRecord {
  _id: string;
  name: string;
  key: string;
  price: number;
  users: string;
  companies: number;
  features: string[];
  description?: string;
  popular?: boolean;
  active?: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanForm>({
    name: "",
    key: "",
    price: "",
    users: "10 Users",
    companies: "0",
    features: "",
    description: "",
    popular: false,
    active: true,
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/plans");
      setPlans(data?.data || []);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      key: "",
      price: "",
      users: "10 Users",
      companies: "0",
      features: "",
      description: "",
      popular: false,
      active: true,
    });
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (plan: PlanRecord) => {
    setForm({
      _id: plan._id,
      name: plan.name,
      key: plan.key,
      price: String(plan.price),
      users: plan.users,
      companies: String(plan.companies),
      features: plan.features.join(", "),
      description: plan.description || "",
      popular: Boolean(plan.popular),
      active: plan.active !== false,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        key: form.key || form.name.toLowerCase().replace(/\s+/g, "-"),
        price: Number(form.price || 0),
        users: form.users,
        companies: Number(form.companies || 0),
        features: form.features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        description: form.description,
        popular: form.popular,
        active: form.active,
      };

      if (form._id) {
        await api.put(`/plans/${form._id}`, payload, { showToast: true, successMessage: "Plan updated" } as any);
      } else {
        await api.post("/plans", payload, { showToast: true, successMessage: "Plan created" } as any);
      }

      await fetchPlans();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: PlanRecord) => {
    if (!confirm(`Delete ${plan.name}?`)) return;

    try {
      await api.delete(`/plans/${plan._id}`, { showToast: true, successMessage: "Plan deleted" } as any);
      await fetchPlans();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to delete plan");
    }
  };

  return (
    <div className="p-1 space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Plans & Pricing</h1>
            <p className="text-slate-500 text-sm">Manage subscription plans used in checkout and the select-plan page.</p>
          </div>
          <Button onClick={openCreateForm} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={16} /> Add Plan
          </Button>
        </div>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form._id ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogDescription>
              {form._id ? "Update the current plan details below." : "Create a new subscription plan for your checkout flow."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <input className="border rounded-lg px-3 py-2" placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Plan key (basic/pro/enterprise)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Users" value={form.users} onChange={(e) => setForm({ ...form, users: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" type="number" placeholder="Companies" value={form.companies} onChange={(e) => setForm({ ...form, companies: e.target.value })} />
            <input className="border rounded-lg px-3 py-2" placeholder="Features (comma separated)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
            <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} /> Mark as popular</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : form._id ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 xl:grid-cols-3">
        {loading ? (
          <Card className="p-6 text-slate-500">Loading plans...</Card>
        ) : plans.length === 0 ? (
          <Card className="p-6 text-slate-500">No plans found. Create one to make the pricing page work.</Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan._id} className="p-5 space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{plan.name}</h2>
                    {plan.popular && <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700">Most Popular</span>}
                  </div>
                  <p className="text-xs text-slate-500">Key: {plan.key}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-slate-100 rounded" onClick={() => openEditForm(plan)}><Pencil size={14} /></button>
                  <button className="p-2 hover:bg-slate-100 rounded text-rose-600" onClick={() => handleDelete(plan)}><Trash2 size={14} /></button>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold">₹{plan.price}</h3>
                <p className="text-xs text-slate-400">per month</p>
              </div>
              <p className="text-sm text-slate-600">{plan.users}</p>
              <p className="text-sm text-slate-500">{plan.description || "No description yet."}</p>
              <ul className="space-y-1 text-sm">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2"><Check size={14} className="text-green-500" /> {feature}</li>
                ))}
              </ul>
              <div className="pt-3 border-t text-sm flex justify-between text-slate-500"><span>{plan.companies} Companies</span><span>{plan.active === false ? "Inactive" : "Active"}</span></div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-3">Plan Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3 text-left">Plan</th><th className="p-3 text-left">Key</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Users</th><th className="p-3 text-left">Companies</th><th className="p-3 text-left">Status</th></tr></thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan._id} className="border-t hover:bg-slate-50"><td className="p-3 font-medium">{plan.name}</td><td className="p-3">{plan.key}</td><td className="p-3">₹{plan.price}</td><td className="p-3">{plan.users}</td><td className="p-3">{plan.companies}</td><td className="p-3">{plan.active === false ? "Inactive" : "Active"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}