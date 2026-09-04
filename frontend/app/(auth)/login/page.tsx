"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Truck, Lock, User, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
      };

      const res = await api.post("/users/login", payload);

      showSuccess("Logged in successfully!");

      // ✅ Clear old data first
      localStorage.clear();

      // 🔥 IMPORTANT SaaS logic
      const user = res.data.user;

      // ✅ ALWAYS save token and user ID
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      // ✅ Save company identifiers if they exist
      if (user.companyId) {
        const companyId = typeof user.companyId === "object"
          ? user.companyId._id
          : user.companyId;
        localStorage.setItem("companyId", companyId);
      }
      if (user.compCd) {
        localStorage.setItem("CompCd", user.compCd);
      }

      console.log("✅ LOGIN SUCCESS:", {
        userId: user._id,
        hasCompany: !!user.companyId,
        compCd: user.compCd,
      });

      // 🔥 Route based on company status
      if (user.role === "superAdmin") {
        // 🔥 Super Admin
        console.log("👑 Super Admin Login");
        router.push("/super-admin-dashboard");

      } else if (!user.companyId || !user.compCd) {
        // 👉 Normal user but no company
        console.log("⚠️ No company found - redirecting to create-company");
        router.push("/create-company");

      } else {
        // 👉 Normal user with company
        console.log("✅ Company found - redirecting to dashboard");
        router.push("/dashboard");
      }

    } catch (err: any) {
      // setError(err.response?.data?.message || "Invalid credentials");
      showError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden pt-3">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 w-full max-w-[480px] px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-3">
              <Truck className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Shree<span className="text-blue-600">Logistics</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Login to manage your LR business
            </p>
          </div>

          {/* Error */}
          {/* {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl mb-3 text-sm">
              {error}
            </div>
          )} */}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-2 ml-1">
                Email / Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-2 ml-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} Shree Logistics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
