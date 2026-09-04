// ================= SIDEBAR (Next.js) =================
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  LogOut,
  Truck,
  ChartColumnBig,
  ChevronDown,
  Users,
  MapPin,
  Package,
  Boxes,
  ChevronLeft,
  Settings,
  Building2,
  Headphones,
  ReceiptText
} from "lucide-react";
import api from "@/lib/api";
import { useCompany } from "@/app/company-context";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const { company } = useCompany();
  const [mastersOpen, setMastersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const handleLogout = async () => {
    try {
      await api.post("/api/users/logout")
    } catch (err) {
      // even if API fails, still logout locally
    } finally {
      localStorage.removeItem("token");      // token hatao
      localStorage.removeItem("user");
      localStorage.removeItem("CompCd");
      localStorage.removeItem("companyId");
      localStorage.removeItem("isLoggedIn");       // user data bhi clear karo
      router.push("/login");                 // redirect
    }
  };


  const navItems = [
    { path: "/dashboard", label: t("dashboard"), Icon: LayoutDashboard },
    { path: "/dashboard/lr/create", label: t("createLR"), Icon: FilePlus },
    { path: "/dashboard/lr/list", label: t("lrList"), Icon: FileText },
    { path: "/dashboard/lr/reports", label: t("reports"), Icon: ChartColumnBig },
  ];

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 `}>

      {/* Logo */}
      <div className={`border-b flex items-center ${sidebarOpen ? "px-6 py-3 justify-between" : "p-3 justify-center"}`}>
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            {company?.logo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100">
                <Image
                  src={company.logo}
                  alt={company.companyName || "Company Logo"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Truck className="text-white" size={20} />
              </div>
            )}
            <div>
              <h1 className="text-base font-extrabold truncate">
                {company?.companyName || "Shree Logistics"}
              </h1>
              <p className="text-xs text-slate-400">LR Portal</p>
            </div>
          </div>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="py-3">
          {sidebarOpen ? <ChevronLeft /> : <Truck />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 p-3 rounded-xl font-semibold ${isActive ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-blue-50"}`}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Masters */}
        <button
          onClick={() => setMastersOpen(!mastersOpen)}
          className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 cursor-pointer"
        >
          <div className="flex items-center gap-3 font-semibold ">
            <Boxes size={18} />
            {sidebarOpen && <span>{t("masters")}</span>}
          </div>
          {/* {sidebarOpen && <ChevronDown className={mastersOpen ? "rotate-180" : ""} />} */}
          <ChevronDown className={`${mastersOpen ? "rotate-180" : ""} transition-transform`} />
        </button>

        {mastersOpen && sidebarOpen && (
          <div className="ml-4 space-y-1">
            <Link
              href="/dashboard/lr/masters/party"
              className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded"
            >
              <Users className="w-4 h-4" />
              {t("party")}
            </Link>
            <Link href="/dashboard/lr/masters/city" className="flex items-center gap-2 p-2  leading-none hover:bg-blue-50 rounded">
              <MapPin className="w-4 h-4" /> {t("cityMenu")}
            </Link>
            <Link href="/dashboard/lr/masters/vehicle" className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded">
              <Truck className="w-4 h-4" /> {t("vehicle")}
            </Link>
            <Link href="/dashboard/lr/masters/item" className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded">
              <Package className="w-4 h-4" /> {t("item")}
            </Link>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 cursor-pointer"
          >
            <div className="flex items-center gap-3 font-semibold cursor-pointer">
              <Settings size={18} />
              {sidebarOpen && <span>{t("settings")}</span>}
            </div>
            <ChevronDown className={`${settingsOpen ? "rotate-180" : ""} transition-transform`} />
          </button>

          {settingsOpen && sidebarOpen && (
            <div className="ml-4 space-y-1">
              <Link
                href="/dashboard/settings/company-details"
                className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded"
              >
                <Building2 className="w-4 h-4" />
                {t("companyDetails")}
              </Link>
                <Link
                href="/dashboard/settings/receipt-templates"
                className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded"
              >
                <ReceiptText className="w-4 h-4" />
                {t("receiptTemplates")}
              </Link>
              <Link
                href="/dashboard/settings/support"
                className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded"
              >
                <Headphones className="w-4 h-4" />
                {t("support")}
              </Link>
              {/* <Link
                href="/dashboard/settings/manage-lr-fields"
                className="flex items-center gap-2 p-2 leading-none hover:bg-blue-50 rounded"
              >
                <Settings className="w-4 h-4" />
                {t("manageLRFields")}
              </Link> */}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5
               text-sm font-semibold text-red-600 cursor-pointer
               bg-white hover:bg-red-50
               border border-red-200 hover:border-red-300
               rounded-lg shadow-sm hover:shadow
               transition-all duration-200
               focus:outline-none focus:ring-2 focus:ring-red-500/30
               active:scale-95 group"
        >
          <LogOut size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

