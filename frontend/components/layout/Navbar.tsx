"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, Settings, UserCircle2, ChevronDown, LogOut } from "lucide-react";
import { useLocaleContext } from "@/app/locale-context";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const t = useTranslations();
  const { locale, setLocale } = useLocaleContext();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleLocale = () => {
    setLocale(locale === "en" ? "hi" : "en");
  };

  const handleLogout = () => {
    // Clear auth data (adjust based on your auth implementation)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    setProfileDropdownOpen(false);
    router.push("/login");
  };

  const handleNavigateProfile = () => {
    setProfileDropdownOpen(false);
    router.push("/dashboard/profile");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">

      {/* LEFT SECTION: Contextual Info */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            {t("dashboard")}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("liveSystem")}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              <Link href="/super-admin-dashboard"> admin dashboard</Link>
            </span>
          </div>
        </div>

        {/* Global Search Bar (Standard for SaaS) */}
        {/* <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 w-64 group focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search size={16} className="text-slate-400 group-focus-within:text-blue-500" />
          <input 
            type="text" 
            placeholder="Search LRs..." 
            className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder:text-slate-400"
          />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-sm">
            ⌘K
          </kbd>
        </div> */}
      </div>

      {/* RIGHT SECTION: Actions & Profile */}
      <div className="flex items-center gap-3">

        {/* Quick Actions */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
          <button
            type="button"
            onClick={toggleLocale}
            className={`
    flex items-center gap-2 px-4 py-2 rounded-xl 
    border shadow-sm transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer
    ${locale === "en"
                ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }
  `}
            aria-label="Toggle language"
          >
            <Globe size={16} className={locale === "en" ? "text-blue-500" : "text-emerald-500"} />
            <span className="text-xs font-semibold tracking-wide">
              {locale === "en" ? "Switch to हिंदी" : "Switch to English"}
            </span>
          </button>

          {/* <Link href="/dashboard/settings" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Settings size={20} />
          </Link> */}
        </div>

        {/* User Profile Dropdown Component */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 pl-2 py-1 pr-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {t("profileName")}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {t("profileBranch")}
              </p>
            </div>

            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
                <UserCircle2 size={22} className="text-white" />
              </div>
              {/* Online Status Dot */}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 group-hover:text-slate-600 transition-transform ${profileDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t("profileName")}
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {t("profileBranch")}
                </p>
              </div>

              <div className="py-2">
                {/* Profile Option */}
                {/* <button
                  onClick={handleNavigateProfile}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <UserCircle2 size={16} />
                  <span>{t("profileName") || "Profile"}</span>
                </button> */}

                {/* Settings Option */}
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    router.push("/dashboard/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 cursor-pointer hover:bg-amber-50 hover:text-amber-600 transition-colors border-t border-slate-100"
                >
                  <UserCircle2 size={16} />
                  <span>{t("Profile") || "Profile"}</span>
                </button>

                {/* Logout Option */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>{t("logout") || "Logout"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}