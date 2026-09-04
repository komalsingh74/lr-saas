"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Truck, User, Lock, Mail, Phone, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };




const router = useRouter();

const handleRegister = async (e: FormEvent) => {
  e.preventDefault();
  setError("");

  // if (formData.password !== formData.confirmPassword) {
  //   setError("Passwords do not match");
  //   return;
  // }

  setLoading(true);

  try {

   const payload= {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      }
    const res = await api.post(
      "/users/register",
      payload
    );

    showSuccess("Account created successfully!");

    // ✅ token save
    localStorage.setItem("token", res.data.token);

    // ✅ redirect
    router.push("/create-company");

  } catch (err: any) {
    setError(err.response?.data?.message || "Something went wrong");
    showError(err.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden py-1.5">
      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 w-full md:max-w-[520px] px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] px-8 py-5">

          {/* Logo */}
          <div className="flex flex-col items-center mb-3">
            <div className="w-13 h-13 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-2">
              <Truck className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Shree<span className="text-blue-600">Logistics</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Create your account to start LR management
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl mb-3 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-2">

            {/* Name */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-1 ml-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-1 ml-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-1 ml-1">
                Phone No.<span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-1 ml-1">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {/* <div>
              <label className="block text-slate-700 text-xs font-bold uppercase mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3"
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
            </div> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-3 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>

          </div>
          {/* <div>
            <Link href="/create-company" className="text-blue-600 font-semibold hover:underline">
              Create Company
            </Link>
          </div> */}
        </div>

        <p className="text-center text-slate-400 text-xs mt-4">
          © {new Date().getFullYear()} Shree Logistics. All rights reserved.
        </p>
      </div>
    </div>
  );
}
