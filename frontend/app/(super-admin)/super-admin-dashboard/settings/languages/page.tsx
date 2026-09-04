"use client";
import { useState } from "react";
import { Globe, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LanguagesPage() {
  const [defaultLang, setDefaultLang] = useState("en");

  const [languages, setLanguages] = useState([
    { code: "en", name: "English", enabled: true },
    { code: "hi", name: "Hindi", enabled: true },
  ]);

  const toggleLanguage = (code: string) => {
    setLanguages((prev) =>
      prev.map((lang) =>
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    );
  };

  return (
    <div className="p-1 space-y-4">

      {/* 🔹 Header */}
      <Card className="p-4">
        <h1 className="text-2xl font-bold">Languages</h1>
        <p className="text-slate-500 text-sm">
          Manage app languages and translations
        </p>
      </Card>

      {/* 🔹 Available Languages */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Globe size={18} /> Available Languages
        </h2>

        {languages.map((lang) => (
          <div
            key={lang.code}
            className="flex items-center justify-between border p-3 rounded-lg"
          >
            <div>
              <p className="font-medium">{lang.name}</p>
              <p className="text-xs text-slate-400">{lang.code}</p>
            </div>

            <button
              onClick={() => toggleLanguage(lang.code)}
              className={`px-3 py-1 text-xs rounded ${
                lang.enabled
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {lang.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>

      {/* 🔹 Default Language */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <CheckCircle size={18} /> Default Language
        </h2>

        {languages
          .filter((l) => l.enabled)
          .map((lang) => (
            <label
              key={lang.code}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
            >
              <input
                type="radio"
                name="defaultLang"
                value={lang.code}
                checked={defaultLang === lang.code}
                onChange={() => setDefaultLang(lang.code)}
              />
              <span>{lang.name}</span>
            </label>
          ))}
      </div>

      {/* 🔹 Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        Users can switch language from their dashboard. Default language will
        be applied on first login.
      </div>

    </div>
  );
}