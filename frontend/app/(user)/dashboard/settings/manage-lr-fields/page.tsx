"use client";

import { useState } from "react";
import { Save, Settings2, Lock, EyeOff, Eye } from "lucide-react";

// Initial Fields Setup
const initialFields = [
  { id: "lr_number", label: "LR Number", isCompulsory: true, enabled: true, category: "Basic Info" },
  { id: "date", label: "Date", isCompulsory: true, enabled: true, category: "Basic Info" },
  { id: "consignor", label: "Consignor Details", isCompulsory: true, enabled: true, category: "Parties" },
  { id: "consignee", label: "Consignee Details", isCompulsory: true, enabled: true, category: "Parties" },
  { id: "gst_billing", label: "GST Billing Details", isCompulsory: false, enabled: true, category: "Billing" },
  { id: "status_track", label: "Live Status Tracking", isCompulsory: false, enabled: true, category: "Tracking" },
  { id: "eway_bill", label: "E-Way Bill Number", isCompulsory: false, enabled: false, category: "Basic Info" },
  { id: "insurance", label: "Insurance Details", isCompulsory: false, enabled: true, category: "Extra" },
];

export default function ManageLRFields() {
  const [fields, setFields] = useState(initialFields);
  const [saving, setSaving] = useState(false);

  // Toggle Function
  const toggleField = (id: string) => {
    setFields(fields.map(f => {
      if (f.id === id && !f.isCompulsory) {
        return { ...f, enabled: !f.enabled };
      }
      return f;
    }));
  };

  const handleSave = () => {
    setSaving(true);
    // 🔹 Backend API call here to save field preferences
    setTimeout(() => {
      setSaving(false);
      alert("LR Form Layout Updated!");
    }, 800);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage LR Fields</h1>
            <p className="text-gray-500 mt-2">Choose which fields appear on your Lorry Receipt form.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-95 shadow-sm"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>

        {/* Fields List Card */}
        <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">
          <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Field Name</span>
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Visibility</span>
          </div>

          <div className="divide-y divide-gray-100">
            {fields.map((field) => (
              <div 
                key={field.id} 
                className={`p-5 flex items-center justify-between transition-colors ${!field.enabled ? 'bg-gray-50/30' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${field.isCompulsory ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Settings2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${!field.enabled ? 'text-gray-400' : 'text-gray-800'}`}>
                        {field.label}
                      </span>
                      {field.isCompulsory && (
                        <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                          <Lock size={10} /> Compulsory
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{field.category}</span>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-400">
                    {field.enabled ? (
                      <span className="flex items-center gap-1 text-green-600"><Eye size={14}/> Visible</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400"><EyeOff size={14}/> Hidden</span>
                    )}
                  </span>
                  
                  <button
                    onClick={() => toggleField(field.id)}
                    disabled={field.isCompulsory}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
                      ${field.isCompulsory ? 'opacity-30 cursor-not-allowed bg-blue-600' : 
                        field.enabled ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${field.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
          <div className="text-blue-600 font-bold text-lg">i</div>
          <p className="text-sm text-blue-800 leading-relaxed">
            <b>Note:</b> Compulsory fields cannot be disabled as they are required for legal and tax compliance in Lorry Receipts. Any changes here will reflect immediately on the "Create LR" page.
          </p>
        </div>
      </div>
    </div>
  );
}