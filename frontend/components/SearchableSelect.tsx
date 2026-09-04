"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

export type SelectOption = { label: string; value: string };

type SearchableSelectProps = {
    label: string;
    placeholder?: string;
    options: SelectOption[];
    value: string; // currently displayed text (usually the label)
    onSelect: (option: SelectOption) => void;
    onTextChange?: (text: string) => void; // only used when freeText is true
    disabled?: boolean;
    freeText?: boolean; // allow a value that isn't in the options list (used for City)
};

export default function SearchableSelect({
    label,
    placeholder = "Select...",
    options,
    value,
    onSelect,
    onTextChange,
    disabled = false,
    freeText = false,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(value || "");
    const wrapRef = useRef<HTMLDivElement>(null);

    // keep local text in sync when parent value changes (e.g. edit mode, country switch)
    useEffect(() => {
        setQuery(value || "");
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
                if (!freeText) {
                    // snap back to a valid option label if the typed text doesn't match one
                    const match = options.find(
                        (o) => o.label.toLowerCase() === query.toLowerCase()
                    );
                    setQuery(match ? match.label : value || "");
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, options, freeText, value]);

    const filtered = query
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    return (
        <div ref={wrapRef} className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        if (freeText) onTextChange?.(e.target.value);
                    }}
                    onFocus={() => setOpen(true)}
                    className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                />
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {open && !disabled && filtered.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg text-sm">
                    {filtered.slice(0, 100).map((opt) => (
                        <li
                            key={opt.value}
                            onClick={() => {
                                onSelect(opt);
                                setQuery(opt.label);
                                setOpen(false);
                            }}
                            className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer"
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}

            {open && !disabled && filtered.length === 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg text-sm px-3 py-2 text-slate-400">
                    {freeText ? "No match — you can still type a custom name" : "No results found"}
                </div>
            )}
        </div>
    );
}