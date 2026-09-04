"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/lib/api";

type CompanyData = {
    _id: string;
    companyName: string;
    logo?: string;
    phone?: string;
    email?: string;
    selectedTemplate?: string;
    receiptTemplateConfig?: Record<string, any>;
    address?: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
};

type CompanyContextType = {
    company: CompanyData | null;
    loading: boolean;
    setCompany: (company: CompanyData | null) => void;
    refreshCompany: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch company data on mount
    useEffect(() => {
        const fetchCompany = async () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/company/me`);
                if (response.data?.data?.company) {
                    setCompany(response.data.data.company);
                }
            } catch (error) {
                console.error("Failed to fetch company:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, []);

    const refreshCompany = useCallback(async () => {
        try {
            const response = await api.get(`/company/me`);
            if (response.data?.data?.company) {
                setCompany(response.data.data.company);
            }
        } catch (error) {
            console.error("Failed to refresh company:", error);
        }
    }, []);

    return (
        <CompanyContext.Provider value={{ company, loading, setCompany, refreshCompany }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error("useCompany must be used within CompanyProvider");
    }
    return context;
}
