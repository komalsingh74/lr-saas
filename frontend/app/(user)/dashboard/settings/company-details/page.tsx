"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Building2, User, Shield, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { useCompany } from "@/app/company-context";

type Company = {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  gstNumber?: string;
  website?: string;
  logo?: string;
  signature?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  fleetSize: number;
  numberOfBranches: number;
  compCd: string;
};

export default function SettingsPage() {
  const { refreshCompany } = useCompany();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch company data
        const companyResponse = await api.get("/company/me");
        setCompany(companyResponse.data.data.company);

        // Fetch user data
        const userResponse = await api.get("/users/me");
        setUser({
          name: userResponse.data.user.name,
          email: userResponse.data.user.email,
          password: "", // Don't show actual password
        });
      } catch (err: any) {
        console.error("Error fetching data:", err);
        showError("Failed to load data");
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompanyChange = (e: any) => {
    const { name, value } = e.target;

    if (!company) return;

    const parsedValue =
      name === "fleetSize" || name === "numberOfBranches"
        ? Number(value)
        : value;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setCompany({
        ...company,
        address: {
          ...company.address,
          [addressField]: value,
        },
      });
    } else {
      setCompany({ ...company, [name]: parsedValue });
    }
  };

  const handleUserChange = (e: any) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (file: File | null) => {
    setLogoFile(file);
  };

  const handleSignatureUpload = (file: File | null) => {
    setSignatureFile(file);
  };

  const handleSave = async () => {
    if (!company) return;

    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("companyName", company.companyName);
      formData.append("phone", company.phone);
      formData.append("gstNumber", company.gstNumber || "");
      formData.append("website", company.website || "");
      formData.append("fleetSize", String(company.fleetSize));
      formData.append("numberOfBranches", String(company.numberOfBranches));
      formData.append("street", company.address.street);
      formData.append("city", company.address.city);
      formData.append("state", company.address.state);
      formData.append("pincode", company.address.pincode);
      formData.append("country", company.address.country || "India");

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (signatureFile) {
        formData.append("signature", signatureFile);
      }

      const response = await api.put("/company/me", formData as any, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        showToast: true,
        successMessage: "Company settings updated successfully",
      } as any);

      setCompany(response.data.data.company);
      setLogoFile(null);
      setSignatureFile(null);

      // Refresh company context to update sidebar
      await refreshCompany();
    } catch (err: any) {
      console.error("Error updating company:", err);
      setError(err.response?.data?.message || "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm";

  const labelClass =
    "text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 ml-1 block";

  return (
    <div className="space-y-3">

      {/* Header */}
      <Card className="px-4 py-2">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Settings
        </h1>
        <span className="text-slate-500 text-xs !mt-[-18px]">
          Manage your company, account and system preferences
        </span>
      </Card>

      {/* ================= COMPANY SETTINGS ================= */}
      <div className="bg-white border rounded-2xl px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="text-blue-600" size={20} />
          <h2 className="text-md font-bold text-slate-800">
            Company Information
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-slate-600 font-medium">Loading company information...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        ) : company ? (
          <div className="space-y-4">
            {/* Company Logo and Signature Display */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Company Logo */}
              <div className="bg-slate-50 rounded-xl p-4">
                <label className={labelClass}>Company Logo</label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-center bg-white rounded-lg p-4 border-2 border-dashed border-slate-200">
                    {logoFile ? (
                      <img
                        src={URL.createObjectURL(logoFile)}
                        alt="New Company Logo"
                        className="max-w-full max-h-32 object-contain rounded"
                      />
                    ) : company.logo ? (
                      <img
                        src={company.logo}
                        alt="Company Logo"
                        className="max-w-full max-h-32 object-contain rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-sm text-slate-500">No logo uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      <Upload size={16} />
                      <span>{logoFile ? "Change Logo" : "Upload Logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                      />
                    </label>
                    {logoFile && (
                      <span className="text-sm text-slate-500">{logoFile.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Signature */}
              <div className="bg-slate-50 rounded-xl p-4">
                <label className={labelClass}>Company Signature</label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-center bg-white rounded-lg p-4 border-2 border-dashed border-slate-200">
                    {signatureFile ? (
                      <img
                        src={URL.createObjectURL(signatureFile)}
                        alt="New Company Signature"
                        className="max-w-full max-h-32 object-contain rounded"
                      />
                    ) : company.signature ? (
                      <img
                        src={company.signature}
                        alt="Company Signature"
                        className="max-w-full max-h-32 object-contain rounded"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto text-slate-400 mb-2" size={24} />
                        <p className="text-sm text-slate-500">No signature uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      <Upload size={16} />
                      <span>{signatureFile ? "Change Signature" : "Upload Signature"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload(e.target.files?.[0] || null)}
                      />
                    </label>
                    {signatureFile && (
                      <span className="text-sm text-slate-500">{signatureFile.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Company Name</label>
                <input
                  name="companyName"
                  value={company.companyName}
                  onChange={handleCompanyChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Company Code</label>
                <input
                  name="compCd"
                  value={company.compCd}
                  className={inputClass}
                  readOnly
                />
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input
                  name="phone"
                  value={company.phone}
                  onChange={handleCompanyChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  name="email"
                  value={company.email}
                  className={inputClass}
                  readOnly
                />
              </div>

              <div>
                <label className={labelClass}>GST Number</label>
                <input
                  name="gstNumber"
                  value={company.gstNumber || ""}
                  onChange={handleCompanyChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input
                  name="website"
                  value={company.website || ""}
                  onChange={handleCompanyChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Fleet Size</label>
                <input
                  name="fleetSize"
                  type="number"
                  value={company.fleetSize}
                  onChange={handleCompanyChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Number of Branches</label>
                <input
                  name="numberOfBranches"
                  type="number"
                  value={company.numberOfBranches}
                  onChange={handleCompanyChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Address Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <input
                    name="address.street"
                    value={company.address.street}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>City</label>
                  <input
                    name="address.city"
                    value={company.address.city}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <input
                    name="address.state"
                    value={company.address.state}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pincode</label>
                  <input
                    name="address.pincode"
                    value={company.address.pincode}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    name="address.country"
                    value={company.address.country}
                    onChange={handleCompanyChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <Building2 className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-500">No company information found</p>
          </div>
        )}
      </div>

      {/* ================= USER SETTINGS ================= */}
      {/* <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <User className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">
            Account Information
          </h2>
        </div>

        <div className="text-sm text-slate-600 mb-4">
          For profile updates and password changes, please visit the{" "}
          <a href="/dashboard/profile" className="text-blue-600 hover:underline font-semibold">
            Profile page
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              name="name"
              value={user.name}
              onChange={handleUserChange}
              className={inputClass}
              readOnly
            />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              value={user.email}
              onChange={handleUserChange}
              className={inputClass}
              readOnly
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Password</label>
            <input
              type="password"
              name="password"
              value="••••••••"
              className={inputClass}
              readOnly
            />
            <p className="text-xs text-slate-500 mt-1">
              Password is hidden for security. Use the Profile page to change it.
            </p>
          </div>
        </div>
      </div> */}

      {/* ================= SECURITY ================= */}
      {/* <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="text-green-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">
            Security
          </h2>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
          <div>
            <p className="font-semibold text-slate-800">
              Enable 2-Step Verification
            </p>
            <p className="text-sm text-slate-500">
              Add extra security to your account
            </p>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            Enable
          </button>
        </div>
      </div> */}

      {/* ================= SAVE BUTTON ================= */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || loading || !company}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

    </div>
  );
}