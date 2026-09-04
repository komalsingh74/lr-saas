"use client";
import { createContext, useContext } from "react";

type Locale = "en" | "hi";

interface LocaleContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: LocaleContextValue;
}) {
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error("useLocaleContext must be used within a LocaleProvider");
    }
    return context;
}

export type { Locale };