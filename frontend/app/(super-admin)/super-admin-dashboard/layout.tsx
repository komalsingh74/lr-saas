// /layouts/SuperAdminLayout.tsx
import React, { ReactNode } from "react";
import Link from "next/link";
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import { SuperAdminNavbar } from "@/components/layout/SuperAdminNavbar";

interface Props {
    children: ReactNode;
}

const SuperAdminLayout: React.FC<Props> = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden">
          <SuperAdminSidebar />
    
          <div className="flex-1 flex flex-col min-w-0">
            {/* < /> */}
            <SuperAdminNavbar />
    
            <main className="flex-1 p-7 overflow-y-auto min-w-0">
              {children}
            </main>
          </div>
        </div>

    );
};

export default SuperAdminLayout;