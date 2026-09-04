"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  BarChart3,
  Globe,
  Languages,
  BadgePercent,
  History,
  ShieldCheck,
  BookmarkCheck,
  Landmark  
} from "lucide-react";

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  const navItems = [
    { path: "/super-admin-dashboard", label: "Overview", Icon: LayoutDashboard },
    { path: "/super-admin-dashboard/companies", label: "Companies", Icon: Building2 },
    { path: "/super-admin-dashboard/revenue", label: "Revenue", Icon: CreditCard },
    { path: "/super-admin-dashboard/users", label: "Users", Icon: Users },
    { path: "/super-admin-dashboard/transactions", label: "Transactions", Icon: Landmark  },
    { path: "/super-admin-dashboard/logs", label: "Logs", Icon: History },
  ];

  return (
    <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r flex flex-col transition-all duration-300`}>

      {/* 🔹 Logo */}
      <div className={`border-b flex items-center ${sidebarOpen ? "px-6 py-5 justify-between" : "p-3 justify-center"}`}>
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-base font-extrabold">
                Core<span className="text-blue-600">Admin</span>
              </h1>
              <p className="text-xs text-slate-400">Super Panel</p>
            </div>
          </div>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <ChevronLeft className={`${!sidebarOpen && "rotate-180"}`} />
        </button>
      </div>

      {/* 🔹 Nav */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        {navItems.map(({ path, label, Icon }) => {
          const isActive = pathname === path;

          return (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-blue-50"
              }`}
            >
              <Icon size={18} />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </Link>
          );
        })}

        {/* 🔹 System Config Dropdown */}
        <button
          onClick={() => setSystemOpen(!systemOpen)}
          className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50"
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            {sidebarOpen && <span>System</span>}
          </div>

          {sidebarOpen && (
            <ChevronDown className={systemOpen ? "rotate-180" : ""} />
          )}
        </button>

        {/* Sub Menu */}
        {systemOpen && sidebarOpen && (
          <div className="ml-5 space-y-1">
            <SubLink href="/super-admin-dashboard/settings/subscriptions" label="Subscriptions / Plans" Icon={BookmarkCheck} />
            <SubLink href="/super-admin-dashboard/settings/languages" label="Languages" Icon={Languages} />
            {/* <SubLink href="/super-admin/settings/regions" label="Regions" Icon={Globe} /> */}
            <SubLink href="/super-admin-dashboard/settings/analytics" label="Analytics" Icon={BarChart3} />
          </div>
        )}
      </nav>

      {/* 🔹 Footer */}
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

/* 🔹 SubLink Component */
function SubLink({ href, label, Icon }: any) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 p-2 rounded text-sm ${
        isActive
          ? "text-blue-600 bg-blue-50"
          : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}