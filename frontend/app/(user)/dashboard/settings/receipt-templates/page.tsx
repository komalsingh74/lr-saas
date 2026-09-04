"use client";
// app/dashboard/settings/receipt-templates/page.tsx
// (drop this in at your existing route — same UI/UX as before,
//  but the preview now comes from the shared LRReceiptRenderer,
//  so it is pixel-identical to what LRList will print/export.)

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Check, X, Palette, Search, UploadCloud, Truck } from "lucide-react";
import { useCompany } from "@/app/company-context";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import LRReceiptRenderer from "@/components/lr/LRReceiptRenderer";
import {
  COLORS, FIELD_GROUPS, TEMPLATE_DEFS, buildInitialConfigs,
  getColor, SAMPLE_RECEIPT_DATA,
  type LRTemplateConfig,
} from "@/lib/lr/template-config";

const FONT = "'Inter','Segoe UI',system-ui,sans-serif";

function FieldCheckbox({ checked, onChange, label, color }: any) {
  return (
    <button onClick={onChange} className="flex items-center gap-2 w-full px-1.5 py-1 rounded border-none bg-transparent cursor-pointer text-left transition-colors hover:bg-gray-100">
      <span className="w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center transition-all" style={{ border: checked ? "none" : "1.5px solid #C7CBD4", background: checked ? color : "#fff" }}>
        {checked && <Check size={9} color="#fff" strokeWidth={3} />}
      </span>
      <span className="text-xs" style={{ color: checked ? "#1F2937" : "#8A8F98", fontWeight: checked ? 500 : 400 }}>{label}</span>
    </button>
  );
}

function FitPreview({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const recalc = () => {
      const outer = outerRef.current, inner = innerRef.current;
      if (!outer || !inner) return;
      const availH = outer.clientHeight - 12, availW = outer.clientWidth - 12;
      const contentH = inner.scrollHeight, contentW = inner.scrollWidth;
      if (!contentH || !contentW) return;
      const next = Math.min(1, availH / contentH, availW / contentW);
      setScale((prev) => (Math.abs(prev - next) > 0.005 ? next : prev));
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  });

  return (
    <div ref={outerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>{children}</div>
    </div>
  );
}

function CustomizeModal({ name, badge, badgeColor, draft, setDraft, onCancel, onSave }: any) {
  const [search, setSearch] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const color = getColor(draft);

  const toggleField = (id: string) => setDraft((prev: any) => ({ ...prev, fields: { ...prev.fields, [id]: !prev.fields[id] } }));
  const patch = (obj: any) => setDraft((prev: any) => ({ ...prev, ...obj }));

  const handleLogo = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ logo: reader.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const filteredGroups = FIELD_GROUPS.map((g) => ({ ...g, fields: g.fields.filter((f) => f.label.toLowerCase().includes(search.toLowerCase())) })).filter((g) => g.fields.length > 0);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ background: "rgba(17,20,28,.55)", fontFamily: FONT }}>
      <div className="w-full max-w-[1120px] h-[94vh] max-h-[920px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4.5 py-1.5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color.hex}, ${color.dark})` }}>
              <Palette size={11} color="#fff" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-800">Customize · {name}</span>
              <span className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: badgeColor }}>{badge}</span>
            </div>
          </div>
          <button onClick={onCancel} className="border-none bg-gray-100 w-8 h-8 rounded cursor-pointer flex items-center justify-center hover:bg-gray-200">
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-[190px_1fr_220px] min-h-0">
          {/* FIELDS */}
          <div className="border-r border-gray-200 flex flex-col min-h-0">
            <div className="px-2.5 pt-2.5 pb-2 flex-shrink-0">
              <div className="text-[8.5px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">LR Fields</div>
              <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1.5">
                <Search size={12} color="#8A8F98" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="border-none bg-transparent outline-none text-[11px] w-full text-gray-700" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-1.5 pb-2">
              {filteredGroups.map((g) => (
                <div key={g.title} className="mb-1.5">
                  <div className="text-[8px] font-bold text-gray-400 tracking-wider uppercase px-1.5 pt-1 pb-0.5">{g.title}</div>
                  {g.fields.map((f) => (
                    <FieldCheckbox key={f.id} label={f.label} checked={!!draft.fields[f.id]} color={color.hex} onChange={() => toggleField(f.id)} />
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 px-1.5 py-2 flex gap-1.5 flex-shrink-0">
              <button onClick={() => setDraft((prev: any) => ({ ...prev, fields: Object.fromEntries(Object.keys(prev.fields).map((k) => [k, true])) }))} className="flex-1 px-1.5 py-1 rounded border border-gray-300 bg-white text-[9px] font-semibold text-gray-500 cursor-pointer hover:bg-gray-100">Select All</button>
              <button onClick={() => setDraft((prev: any) => ({ ...prev, fields: Object.fromEntries(Object.keys(prev.fields).map((k) => [k, false])) }))} className="flex-1 px-1.5 py-1 rounded border border-gray-300 bg-white text-[9px] font-semibold text-gray-500 cursor-pointer hover:bg-gray-100">Clear All</button>
            </div>
          </div>

          {/* PREVIEW — shared renderer, same one used in LRList */}
          <div className="bg-gray-50 flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex-1 min-h-0 px-3 pb-1 flex items-start justify-center overflow-y-auto overflow-x-hidden">
              <div className="w-full max-w-[680px] overflow-hidden flex items-center justify-center px-1 m-auto flex-shrink-0">
                <FitPreview>
                  <LRReceiptRenderer config={draft} data={SAMPLE_RECEIPT_DATA} width={600} />
                </FitPreview>
              </div>
            </div>
          </div>

          {/* DESIGN OPTIONS */}
          <div className="border-l border-gray-200 overflow-y-auto px-3 pt-3 pb-3.5">
            <div className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">Colour Theme</div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {COLORS.map((c) => (
                <button key={c.id} onClick={() => patch({ color: c.id })} className="px-1.5 py-1.5 rounded-lg cursor-pointer transition-all" style={{ border: draft.color === c.id ? `2px solid ${c.hex}` : "2px solid #E5E7EB", background: draft.color === c.id ? `${c.hex}08` : "#FFFFFF" }}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="w-5 h-5 rounded" style={{ background: c.hex, boxShadow: draft.color === c.id ? `0 0 0 4px ${c.hex}18` : "none" }} />
                    <span className="text-[8px] text-gray-500 font-medium">{c.name.split(" ")[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="h-px bg-gray-200 my-2.5" />
            <div className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">Receipt Elements</div>

            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded" style={{ background: draft.fields?.companyLogo ? "#F0F9FF" : "transparent" }}>
                <input type="checkbox" checked={draft.fields?.companyLogo || false} onChange={() => toggleField("companyLogo")} className="w-4 h-4 cursor-pointer" style={{ accentColor: color.hex }} />
                <span className="text-xs text-gray-700 font-medium">Company Logo</span>
              </label>
              {draft.fields?.companyLogo && (
                <div className="mt-1.5 px-2">
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                  {draft.logo ? (
                    <div className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-white flex items-center justify-center" style={{ border: `1px solid ${color.hex}30` }}>
                        <img src={draft.logo} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10.5px] font-semibold text-gray-700">Logo uploaded</div>
                        <button onClick={() => logoInputRef.current?.click()} className="text-[9.5px] font-bold cursor-pointer border-none bg-transparent p-0 mt-0.5" style={{ color: color.hex }}>Change image</button>
                      </div>
                      <button onClick={() => patch({ logo: null })} className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 border-none cursor-pointer bg-transparent hover:bg-gray-200">
                        <X size={12} color="#9CA3AF" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => logoInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-1 py-4 rounded-lg border-2 border-dashed cursor-pointer bg-white hover:bg-gray-50" style={{ borderColor: `${color.hex}45` }}>
                      <UploadCloud size={16} color={color.hex} />
                      <span className="text-[10px] font-bold" style={{ color: color.hex }}>Upload logo</span>
                      <span className="text-[8.5px] text-gray-400">PNG or JPG, square works best</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded" style={{ background: (draft.fields?.receiverSignature || draft.fields?.authorizedSignature) ? "#F0F9FF" : "transparent" }}>
                <input
                  type="checkbox"
                  checked={(draft.fields?.receiverSignature || draft.fields?.authorizedSignature) || false}
                  onChange={() => setDraft((prev: any) => ({ ...prev, fields: { ...prev.fields, receiverSignature: !prev.fields.receiverSignature, authorizedSignature: !prev.fields.authorizedSignature } }))}
                  className="w-4 h-4 cursor-pointer" style={{ accentColor: color.hex }}
                />
                <span className="text-xs text-gray-700 font-medium">Signature Fields</span>
              </label>
            </div>

            <div className="h-px bg-gray-200 my-2.5" />
            <div className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">Header Design</div>
            <label className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded" style={{ background: draft.showHeaderBg === false ? "#F0F9FF" : "transparent" }}>
              <input type="checkbox" checked={draft.showHeaderBg !== false} onChange={() => setDraft((prev: any) => ({ ...prev, showHeaderBg: prev.showHeaderBg === false ? true : false }))} className="w-4 h-4 cursor-pointer" style={{ accentColor: color.hex }} />
              <span className="text-xs text-gray-700 font-medium">Show Header Background</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4.5 py-2 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onCancel} className="px-4 py-1.5 rounded border border-gray-300 bg-white text-gray-700 text-xs font-semibold cursor-pointer hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} className="px-4.5 py-1.5 rounded border-none text-white text-xs font-bold cursor-pointer hover:shadow-lg" style={{ background: color.hex }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default function LRReceiptTemplatesPage() {
  const [configs, setConfigs] = useState<Record<string, LRTemplateConfig>>(buildInitialConfigs());
  const [activeId, setActiveId] = useState("classic");
  const [modalId, setModalId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LRTemplateConfig | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { company, loading: loadingCompany, refreshCompany } = useCompany();

  useEffect(() => {
    if (!company) return;
    if (company.receiptTemplateConfig) setConfigs((prev) => ({ ...prev, ...company.receiptTemplateConfig }));
    if (!company.selectedTemplate) return;
    const selected = TEMPLATE_DEFS.some((t) => t.id === company.selectedTemplate) ? company.selectedTemplate : "classic";
    setActiveId(selected);
  }, [company]);

  const openModal = (id: string) => { setModalId(id); setDraft(JSON.parse(JSON.stringify(configs[id]))); };
  const closeModal = () => { setModalId(null); setDraft(null); };

  const persist = async (updatedConfigs: Record<string, LRTemplateConfig>, selectedTemplate: string, successMsg: string) => {
    setSavingTemplate(true);
    setSaveError("");
    try {
      await api.put("/company/me", { selectedTemplate, receiptTemplateConfig: updatedConfigs }, { showToast: true, successMessage: successMsg } as any);
      await refreshCompany();
      showSuccess(successMsg);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to save template.";
      setSaveError(message);
      showError(message);
    } finally {
      setSavingTemplate(false);
    }
  };

  const saveModal = async () => {
    if (!modalId || !draft) return;
    const updatedConfigs = { ...configs, [modalId]: draft };
    setConfigs(updatedConfigs);
    setActiveId(modalId);
    closeModal();
    await persist(updatedConfigs, modalId, "Template saved");
  };

  const handleSaveSelectedTemplate = async () => {
    if (!company) { showError("Company data not loaded yet."); return; }
    await persist(configs, activeId, "Selected template saved");
  };

  const activeConfig = configs[activeId];
  const activeDef = TEMPLATE_DEFS.find((t) => t.id === activeId)!;
  const activeColor = getColor(activeConfig);

  return (
    <div className="min-h-screen p-4 pb-6" style={{ fontFamily: FONT, background: "#F8F9FB" }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #4338CA, #7C3AED)" }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <div className="text-base font-extrabold text-gray-800 tracking-tight">LR Receipt Templates</div>
            <div className="text-xs text-gray-500 mt-0.5">Customize & manage your LR formats</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-4.5 items-start">
        <div>
          <div className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mb-2.5">Templates</div>
          {TEMPLATE_DEFS.map((t) => {
            const cfg = configs[t.id];
            const c = getColor(cfg);
            const isActive = activeId === t.id;
            return (
              <div key={t.id} onClick={() => setActiveId(t.id)} className="bg-white rounded-xl px-3.5 py-3 mb-2.5 cursor-pointer flex items-center gap-3 transition-all" style={{ border: isActive ? `2px solid ${c.hex}` : "1px solid #E5E7EB", boxShadow: isActive ? `0 0 0 4px ${c.hex}12` : "0 1px 3px rgba(0,0,0,.05)" }}>
                <span className="w-3 h-3 rounded-full flex-shrink-0 bg-white" style={{ border: isActive ? `3px solid ${c.hex}` : "2px solid #D1D5DB" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-bold text-gray-800">{t.name}</span>
                    <span className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: t.badgeColor }}>{t.badge}</span>
                    {isActive && <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ color: c.hex, background: `${c.hex}12` }}>Active</span>}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{t.desc}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openModal(t.id); }} className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-white border-none rounded px-2.5 py-1.5 cursor-pointer hover:shadow-lg" style={{ background: c.hex }}>
                  <Palette size={13} /> Edit
                </button>
              </div>
            );
          })}
        </div>

        <div className="sticky top-4 bg-white rounded-xl border border-gray-200 !mt-[-55px] shadow-md overflow-hidden">
          <div className="flex justify-between items-center px-3.5 pb-2 border-b border-gray-200">
            <div>
              <div className="text-[13px] font-bold text-gray-800">Preview</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{activeDef.name}</div>
            </div>
          </div>
          <div className="bg-gray-50 px-0.5 py-1 flex justify-center min-h-[320px]">
            <LRReceiptRenderer config={activeConfig} data={SAMPLE_RECEIPT_DATA} width={450} />
          </div>
          <div className="px-3 pb-3">
            <button onClick={handleSaveSelectedTemplate} disabled={savingTemplate || loadingCompany || activeId === company?.selectedTemplate} className="w-full py-2 rounded-lg border-none text-white text-xs font-bold cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500" style={{ background: activeId === company?.selectedTemplate ? "#9CA3AF" : "#4338CA" }}>
              {activeId === company?.selectedTemplate ? "Active template set" : savingTemplate ? "Saving..." : "Save & activate template"}
            </button>
            {saveError && <div className="text-[11px] text-red-600 mt-2">{saveError}</div>}
          </div>
        </div>
      </div>

      {modalId && draft && (
        <CustomizeModal
          name={TEMPLATE_DEFS.find((t) => t.id === modalId)!.name}
          badge={TEMPLATE_DEFS.find((t) => t.id === modalId)!.badge}
          badgeColor={TEMPLATE_DEFS.find((t) => t.id === modalId)!.badgeColor}
          draft={draft}
          setDraft={setDraft}
          onCancel={closeModal}
          onSave={saveModal}
        />
      )}
    </div>
  );
}