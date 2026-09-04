"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableComboboxProps {
  data: Array<{ _id: string; [key: string]: any }>;
  displayKey: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  masterLabel: string;
  masterPath: string;
  inputClass?: string;
  renderItem?: (item: any) => string;
}

export function SearchableCombobox({
  data,
  displayKey,
  placeholder = "Select an option",
  value,
  onValueChange,
  masterLabel,
  masterPath,
  inputClass = "",
  renderItem,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

  // Get trigger width for popover
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      String(item[displayKey])
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, displayKey, searchQuery]);

  // Get display value
  const selectedItem = data.find((item) => item._id === value);
  const displayValue = selectedItem
    ? renderItem
      ? renderItem(selectedItem)
      : String(selectedItem[displayKey])
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:bg-gray-50 text-sm font-normal",
            !value && "text-gray-400",
            inputClass
          )}
        >
          <span className="truncate">
            {displayValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="p-0 border border-gray-200 shadow-lg rounded-lg"
        style={{ 
          width: triggerWidth ? `${triggerWidth}px` : 'auto',
          minWidth: '200px'
        }}
        align="start"
        sideOffset={4}
      >
        <div className="p-3 space-y-3">
          {/* Search Input */}
          <Input
            placeholder={`Search ${masterLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredData.length === 0 ? (
              <div className="py-4 px-2 text-center">
                <div className="text-sm text-gray-500 mb-3">
                  {data.length === 0
                    ? "No records found"
                    : `No results found for "${searchQuery}"`}
                </div>

                {data.length === 0 && (
                  <Link
                    href={masterPath}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New {masterLabel}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredData.map((item) => {
                  const isSelected = value === item._id;
                  const displayText = renderItem
                    ? renderItem(item)
                    : String(item[displayKey]);
                  
                  return (
                    <button
                      key={item._id}
                      onClick={() => {
                        onValueChange(item._id);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <span className="truncate">{displayText}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}