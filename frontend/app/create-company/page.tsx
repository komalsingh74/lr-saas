// app/company/create/page.tsx
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Truck,
  Upload,
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  FileText,
  Globe,
  Calendar,
  Users,
  CreditCard,
  Banknote,
  BadgeIndianRupee,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  X,
  Camera,
  Eye,
  EyeOff,
  Shield,
  Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import { updateToast, showLoading } from "@/lib/toast";

interface CompanyFormData {
  // Basic Information
  companyName: string;
  registrationNumber: string;
  gstNumber: string;
  panNumber: string;

  // Contact Information
  email: string;
  phone: string;
  alternatePhone: string;
  website: string;

  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  // Business Details
  businessType: string;
  establishedYear: string;
  fleetSize: string;
  branches: string;

  // Bank Details
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;

  // Tax Details
  cinNumber: string;
  msmeNumber: string;

  // Preferences
  currency: string;
  timezone: string;
}

export default function CompanyCreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [signPreview, setSignPreview] = useState<string | null>(null);
  const [signFile, setSignFile] = useState<File | null>(null);
  const signInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    registrationNumber: "",
    gstNumber: "",
    panNumber: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    businessType: "",
    establishedYear: "",
    fleetSize: "",
    branches: "",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    ifscCode: "",
    upiId: "",
    cinNumber: "",
    msmeNumber: "",
    currency: "INR",
    timezone: "Asia/Kolkata"
  });

  const [errors, setErrors] = useState<Partial<CompanyFormData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Private Limited",
    "Public Limited",
    "LLP",
    "One Person Company",
    "Others"
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo size should be less than 2MB");
        return;
      }
      if (!file.type.match(/image\/(jpeg|jpg|png|svg)/)) {
        alert("Please upload JPEG, PNG, or SVG file");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignFile(file);
    setSignPreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof CompanyFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = () => {
    const newErrors: Partial<CompanyFormData> = {};

    if (currentStep === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      // if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "Registration number is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    }

    if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = "Invalid pincode";
    }

    // if (currentStep === 3) {
    //   if (!formData.businessType) newErrors.businessType = "Business type is required";
    //   if (!formData.establishedYear) newErrors.establishedYear = "Established year is required";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading("Creating your company...");

    try {
      // Create FormData to handle file uploads
      const submitData = new FormData();

      // Add form fields (map from frontend names to backend names)
      submitData.append("companyName", formData.companyName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("gstNumber", formData.gstNumber);
      submitData.append("businessType", formData.businessType);
      submitData.append("establishedYear", formData.establishedYear);
      submitData.append("website", formData.website);
      submitData.append("fleetSize", formData.fleetSize);
      submitData.append("numberOfBranches", formData.branches);

      // Address fields
      submitData.append("street", formData.address);
      submitData.append("city", formData.city);
      submitData.append("state", formData.state);
      submitData.append("pincode", formData.pincode);
      submitData.append("country", formData.country);

      // Add files if they exist
      if (logoFile) {
        submitData.append("logo", logoFile);
      }
      if (signFile) {
        submitData.append("signature", signFile);
      }

      // Call API
      // 🔥 Don't set Content-Type for FormData - let axios/browser set it with boundary
      const response = await api.post("/company/create", submitData, {
        showToast: false, // We're handling toast manually
      });

      if (response.status === 201) {
        // ✅ Store company info in localStorage
        const company = response.data.data.company;
        const newToken = response.data.token; // 🔑 NEW TOKEN with companyId

        localStorage.setItem("token", newToken); // ✅ UPDATE TOKEN
        localStorage.setItem("companyId", company.id);
        localStorage.setItem("CompCd", company.compCd);

        updateToast(toastId, "success", "✅ Company created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/select-plan");
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create company";
      updateToast(toastId, "error", `❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: <Building2 size={18} /> },
    { number: 2, title: "Contact Details", icon: <MapPin size={18} /> },
    { number: 3, title: "Business Details", icon: <Briefcase size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-6 px-4 sm:px-6 lg:px-6">

      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">

        {/* Header */}
        <div className="mb-4">
          {/* <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 transition mb-4 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
            Back
          </button> */}
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Create Your Company Profile
                </h1>
                <p className="text-slate-500 mt-2">
                  Set up your transport company details. This information will appear on all your LRs.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
                <Shield size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Secure & Encrypted</span>
              </div>
            </div>
          </Card>

        </div>

        {/* Progress Steps */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl p-6 mb-4">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.number
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-400'
                    }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={20} />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className={`text-xs font-medium mt-2 ${currentStep >= step.number ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8">

              {/* Logo Upload Section */}
              <div className="mb-8 pb-8 border-b border-slate-200">

                <div className="grid md:grid-cols-2 gap-8">

                  {/* ================= LOGO ================= */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Company Logo
                    </label>

                    <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-2xl border">

                      {/* Preview */}
                      <div className="relative">
                        {logoPreview ? (
                          <div className="relative group">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden border shadow-md">
                              <img
                                src={logoPreview}
                                alt="Logo"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setLogoPreview(null);
                                setLogoFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border-2 border-dashed flex items-center justify-center">
                            <Truck size={30} className="text-slate-400" />
                          </div>
                        )}

                        {/* Upload Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow hover:scale-110 transition"
                        >
                          <Camera size={14} />
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Upload Logo
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Used in LR print & branding
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ================= SIGNATURE ================= */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Authorized Signature
                    </label>

                    <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-2xl border">

                      {/* Preview */}
                      <div className="relative">
                        {signPreview ? (
                          <div className="relative group">
                            <div className="w-28 h-28 bg-white rounded-2xl border shadow-md flex items-center justify-center p-2">
                              <img
                                src={signPreview}
                                alt="Signature"
                                className="max-h-full object-contain"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSignPreview(null);
                                setSignFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border-2 border-dashed flex items-center justify-center">
                            ✍️
                          </div>
                        )}

                        {/* Upload Button */}
                        <button
                          type="button"
                          onClick={() => signInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow hover:scale-110 transition"
                        >
                          <Camera size={14} />
                        </button>

                        <input
                          ref={signInputRef}
                          type="file"
                          accept="image/png"
                          onChange={handleSignUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Upload Signature
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Used for LR authorization
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    Basic Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField
                      label="Company Name *"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g., Shree Logistics Pvt Ltd"
                      icon={<Building2 size={18} />}
                      error={errors.companyName}
                    />
                    {/* <FormField
                      label="Registration Number *"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g., U12345DL2026PTC123456"
                      icon={<FileText size={18} />}
                      error={errors.registrationNumber}
                    /> */}
                    <FormField
                      label="GST Number"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      icon={<BadgeIndianRupee size={18} />}
                    />
                    {/* <FormField
                      label="PAN Number"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      placeholder="AAAAA1234A"
                      icon={<FileText size={18} />}
                    /> */}
                    <FormField
                      label="Email Address *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@company.com"
                      icon={<Mail size={18} />}
                      error={errors.email}
                    />
                    <FormField
                      label="Phone Number *"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      icon={<Phone size={18} />}
                      error={errors.phone}
                    />

                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Office Address
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      label="Street Address *"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123, Transport Nagar"
                      icon={<MapPin size={18} />}
                      error={errors.address}
                    />
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField
                        label="City *"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Agra"
                        icon={<MapPin size={18} />}
                        error={errors.city}
                      />
                      <FormField
                        label="State *"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Uttar Pradesh"
                        icon={<MapPin size={18} />}
                        error={errors.state}
                      />
                      <FormField
                        label="Pincode *"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="282001"
                        icon={<MapPin size={18} />}
                        error={errors.pincode}
                      />
                      <FormField
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="India"
                        icon={<Globe size={18} />}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Business Details */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" />
                    Business Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField
                      label="Business Type (optional)"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      placeholder="e.g., Private Limited"
                      icon={<Briefcase size={18} />}
                    />

                    <FormField
                      label="Established Year (optional)"
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleChange}
                      placeholder="e.g., 2015"
                      icon={<Calendar size={18} />}
                    />

                    <FormField
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://company.com"
                      icon={<Globe size={18} />}
                    />

                    <FormField
                      label="Fleet Size"
                      name="fleetSize"
                      value={formData.fleetSize}
                      onChange={handleChange}
                      placeholder="e.g., 25 Trucks"
                      icon={<Truck size={18} />}
                    />

                    <FormField
                      label="Number of Branches"
                      name="branches"
                      value={formData.branches}
                      onChange={handleChange}
                      placeholder="5"
                      icon={<Users size={18} />}
                    />
                  </div>
                </div>
              )}



              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-6 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30"
                  >
                    Next Step
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition flex items-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating Company...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Create Company
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Important Note</p>
              <p className="text-xs text-blue-600 mt-1">
                Your company logo and details will appear on all Lorry Receipts (LR) generated.
                Please ensure all information is accurate as this will be used for legal documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Helper Components ====================

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  error
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-3.5 text-slate-400">
          {icon}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200'} rounded-xl pl-${icon ? '10' : '4'} pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

// Icons for the page
const ArrowRight = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const Award = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// Add CSS animations
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}