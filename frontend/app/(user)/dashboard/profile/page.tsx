"use client";

import { useEffect, useState } from "react";
import { UserCircle2, Save, Key, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  });
  const [originalUser, setOriginalUser] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm";

  const labelClass =
    "text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1 block";

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/users/me");
        const currentUser = response.data.user;

        const userData = {
          name: currentUser.name || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        };

        setUser(userData);
        setOriginalUser(userData);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.response?.data?.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "currentPassword") setCurrentPassword(value);
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload: any = {};

      // Only include name if it has changed
      if (user.name !== originalUser.name) {
        payload.name = user.name;
      }

      // Check if user wants to change password
      const passwordFieldsFilled = currentPassword || newPassword || confirmPassword;

      if (passwordFieldsFilled) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setError("Current password, new password and confirm password are required to change password.");
          return;
        }

        if (newPassword !== confirmPassword) {
          setError("New password and confirm password do not match.");
          return;
        }

        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      // Check if anything is being updated
      if (Object.keys(payload).length === 0) {
        setError("No changes detected. Please modify at least one field.");
        return;
      }

      const response = await api.put("/users/me", payload);

      showSuccess(response.data.message || "Profile updated successfully.");
      // setSuccess(response.data.message || "Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (response.data.user) {
        const updatedUserData = {
          name: response.data.user.name || originalUser.name,
          email: response.data.user.email || originalUser.email,
          phone: response.data.user.phone || originalUser.phone,
        };
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(updatedUserData);
        setOriginalUser(updatedUserData);
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Unable to update profile.");
      showError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">

      {/* Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3 mb-0">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <UserCircle2 className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              My Profile
            </h1>
            <p className="text-sm text-slate-500">
              Manage your account details
            </p>
          </div>
        </div>
      </Card>


      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 rounded-lg">
            {success}
          </div>
        )} */}

        <div>
          <label className={labelClass}>Full Name</label>
          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            name="email"
            value={user.email}
            readOnly
            className={`${inputClass} cursor-not-allowed text-slate-500`}
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            name="phone"
            value={user.phone}
            readOnly
            className={`${inputClass} cursor-not-allowed text-slate-500`}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className={labelClass}>Current Password</label>
            <div className="relative">
              <input
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={handlePasswordFieldChange}
                placeholder="Enter current password"
                className={inputClass}
              />
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={handlePasswordFieldChange}
                placeholder="Enter new password"
                className={inputClass}
              />
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handlePasswordFieldChange}
                placeholder="Confirm new password"
                className={inputClass}
              />
              <ShieldAlert className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition disabled:opacity-70"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}