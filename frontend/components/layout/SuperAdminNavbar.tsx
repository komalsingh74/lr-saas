"use client";

import React from "react";
import { 
  Search, 
  Bell, 
  User, 
  Globe, 
  Settings, 
  LogOut, 
  Command,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function SuperAdminNavbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full flex items-center px-8 justify-between">
      
      {/* 1. Left Side: Search & Global Commands */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={17} />
          <Input 
            placeholder="Search Companies, LRs ..." 
            className="pl-10 bg-slate-50 border-none rounded-xl focus-visible:ring-blue-500/20 focus-visible:bg-white transition-all font-medium text-sm"
          />
          
        </div>
      </div>

      {/* 2. Right Side: Toggles & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Language Toggle (Hindi/English) */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2 text-slate-600 hover:bg-slate-100">
              <Globe size={18} className="text-blue-600" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">English</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem className="font-bold cursor-pointer">English (UK)</DropdownMenuItem>
            <DropdownMenuItem className="font-bold cursor-pointer font-hindi">हिन्दी (India)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        {/* Support & Notifications */}
        <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-blue-600 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 p-0 overflow-hidden group">
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-black text-xs group-hover:scale-110 transition-transform">
                AD
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mt-2 rounded-[1.5rem] p-2 shadow-2xl border-slate-100" align="end">
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-black text-slate-900 leading-none flex items-center gap-2">
                  Super Admin <Badge className="bg-blue-600 text-[9px] h-4 px-1 text-white uppercase font-black">System</Badge>
                </p>
                <p className="text-xs text-slate-500 font-medium leading-none">admin@shreelogistics.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer gap-3">
                <User size={16} /> <Link href="/super-admin-dashboard/profile">My Account</Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer gap-3">
                <ShieldCheck size={16} /> Security Settings
              </DropdownMenuItem> */}
              <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer gap-3">
                <HelpCircle size={16} /> <Link href="/super-admin-dashboard/help-center">Help Center</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-50" />
            <div className="p-1">
              <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer gap-3">
                <LogOut size={16} /> Sign Out System
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}