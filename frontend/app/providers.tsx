"use client";

import { useEffect, useMemo, useState } from "react";
import { IntlProvider } from "next-intl";
import { LocaleProvider, type Locale } from "./locale-context";
import { CompanyProvider } from "./company-context";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

const messagesMap: Record<Locale, Record<string, string>> = {
    en,
    hi,
};

const DEFAULT_LOCALE: Locale = "en";

export function Providers({ children }: { children: React.ReactNode }) {
    const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        const storedLocale = window.localStorage.getItem("locale");
        if (storedLocale === "hi" || storedLocale === "en") {
            setLocale(storedLocale);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("locale", locale);
    }, [locale]);

    const messages = messagesMap[locale];

    const providerProps = useMemo(
        () => ({ locale, messages, timeZone: "Asia/Kolkata" }),
        [locale, messages]
    );

    return (
        <CompanyProvider>
            <LocaleProvider value={{ locale, setLocale }}>
                <IntlProvider {...providerProps}>{children}</IntlProvider>
            </LocaleProvider>
        </CompanyProvider>
    );
}
