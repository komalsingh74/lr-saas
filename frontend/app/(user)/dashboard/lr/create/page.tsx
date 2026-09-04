"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const getToday = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const initialFormData = {
  date: getToday(),
  consignor: "",
  consignee: "",
  fromCity: "",
  toCity: "",
  vehicle: "",
  driverName: "",
  quantity: "",
  weight: "",
  freight: "",
  paymentType: "To Pay",
  status: "Pending",
  freightType: "",
  transportMode: "",
  item: "",
  noOfPackages: "",
  packagingType: "",
  invoiceNumber: "",
  ewayBillNo: "",
  taxable: false,
  gstPercent: "",
  cgst: 0,
  sgst: 0,
  igst: 0,
  totalAmount: 0
};

interface CreateLRProps {
  existingLR?: any | null;
  onSaved?: (lr: any) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

export default function CreateLR({ existingLR = null, onSaved, onClose, readOnly = false }: CreateLRProps) {
  const [formData, setFormData] = useState(initialFormData);
  // const isEdit = !!existingLR && !!existingLR._id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [cities, setCities] = useState<Array<{ _id: string; cityName: string }>>([]);
  const [vehicles, setVehicles] = useState<Array<{ _id: string; vehicleNumber: string; vehicleType?: string; ownerName?: string; ownerPhone?: string; capacity?: number }>>([]);
  const [items, setItems] = useState<Array<{ _id: string; itemName: string }>>([]);
  const [parties, setParties] = useState<Array<{ _id: string; partyName: string }>>([]);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    if (!existingLR) return;
    const vehicleId = existingLR.vehicle?._id || existingLR.vehicleId || "";
    setFormData({
      ...initialFormData,
      date: getToday(),
      consignor: existingLR.consignor?._id || existingLR.consignorId || "",
      consignee: existingLR.consignee?._id || existingLR.consigneeId || "",
      fromCity: existingLR.fromCity?._id || existingLR.fromCityId || "",
      toCity: existingLR.toCity?._id || existingLR.toCityId || "",
      vehicle: vehicleId,
      driverName: existingLR.driverName || "",
      quantity: existingLR.quantity?.toString() || "",
      weight: existingLR.weight?.toString() || "",
      freight: (existingLR.freightAmount ?? existingLR.freight ?? "").toString(),
      paymentType: existingLR.paymentType || "To Pay",
      status: "Pending",
      freightType: existingLR.freightType || "",
      transportMode: existingLR.transportMode || "Road",
      item: existingLR.item?._id || existingLR.itemId || "",
      noOfPackages: existingLR.noOfPackages?.toString() || "",
      packagingType: existingLR.packagingType || "",
      invoiceNumber: existingLR.invoiceNumber || "",
      ewayBillNo: existingLR.ewayBillNo || existingLR.eWayBill || "",
      taxable: Boolean(existingLR.taxable),
      gstPercent: existingLR.gstPercent?.toString() || "",
      cgst: existingLR.cgst || 0,
      sgst: existingLR.sgst || 0,
      igst: existingLR.igst || 0,
      totalAmount: existingLR.totalAmount || 0,
    });
    setVehicleDetails(vehicles.find((vehicle) => vehicle._id === vehicleId) || null);
  }, [existingLR, vehicles]);

  // 📥 Fetch all dropdowns on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const [citiesRes, vehiclesRes, itemsRes, partiesRes] = await Promise.all([
          api.get("/cities/dropdown"),
          api.get("/vehicles/dropdown"),
          api.get("/items/dropdown"),
          api.get("/parties/dropdown"),
        ]);

        setCities(citiesRes.data);
        setVehicles(vehiclesRes.data);
        setItems(itemsRes.data);
        setParties(partiesRes.data);
        setLoadingDropdowns(false);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
        showError("Failed to load dropdown data");
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  const handleTaxChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // ✅ When Taxable is TRUE - Calculate GST
      if (updated.taxable && (name === "freight" || name === "gstPercent")) {
        const freightAmount = parseFloat(updated.freight) || 0;
        const gstPct = parseFloat(updated.gstPercent) || 0;

        if (freightAmount > 0 && gstPct > 0) {
          const gstAmount = (freightAmount * gstPct) / 100;
          const cgstAmount = gstAmount / 2;
          const sgstAmount = gstAmount / 2;

          updated.cgst = Math.round(cgstAmount * 100) / 100;
          updated.sgst = Math.round(sgstAmount * 100) / 100;
          updated.igst = 0;
          updated.totalAmount = Math.round((freightAmount + gstAmount) * 100) / 100;
        }
      }
      // ❌ When Taxable is FALSE - Just freight amount
      else if (!updated.taxable && name === "freight") {
        updated.totalAmount = Math.round((parseFloat(updated.freight) || 0) * 100) / 100;
      }

      return updated;
    });
  };

  // Native inputs (text/number/date/checkbox) still go through this handler.
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" ? (target as HTMLInputElement).checked : false;

    if (name === "taxable") {
      setFormData((prev) => {
        const updated = { ...prev, taxable: checked };
        if (!checked) {
          updated.gstPercent = "";
          updated.cgst = 0;
          updated.sgst = 0;
          updated.igst = 0;
          updated.totalAmount = Math.round((parseFloat(updated.freight) || 0) * 100) / 100;
        }
        return updated;
      });
    } else if (name === "gstPercent" || name === "freight") {
      handleTaxChange(e);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  // shadcn <Select> reports value directly via onValueChange instead of a
  // ChangeEvent, so every dropdown field is wired through this instead.
  const handleSelectChange = (name: string, value: string) => {
    // 🚗 Handle vehicle selection to show owner details
    if (name === "vehicle") {
      const selectedVehicle = vehicles.find(v => v._id === value);
      setVehicleDetails(selectedVehicle || null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // shadcn's Select isn't a native <select>, so browser "required"
    // validation no longer applies to those fields — check manually.
    if (!formData.date || !formData.consignor || !formData.consignee || !formData.fromCity || !formData.toCity) {
      const msg = "Please fill all required fields (date, consignor, consignee, from & to city).";
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    setError("");

    const submitLR = async () => {
      try {
        const { freight, ...rest } = formData;
        const payload = {
          ...rest,
          freightAmount: Number(freight || 0),
        };

        const response = await api.post("/lr", payload);

        if (response.data?.lr) {
          showSuccess(response.data?.message || "LR created successfully! 🎉");
          setFormData(initialFormData);
          setVehicleDetails(null);

          // Call callback if provided
          if (onSaved) {
            onSaved(response.data.lr);
          }

          // Close modal if provided
          if (onClose) {
            onClose();
          }
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "Failed to create LR. Please try again.";
        setError(errorMsg);
        showError(errorMsg);
        console.error("Error creating LR:", err);
      } finally {
        setLoading(false);
      }
    };

    submitLR();
  };

  // Common Input Styles (Same as yours) — passed as `className` to the
  // shadcn primitives too, so the look stays exactly as-is.
  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-sm";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 ml-1";

  return (
    <div className="w-full">
      <div className="">

        {/* Header Section */}
        <Card className="px-3 mb-2 py-2 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-0 gap-2">
            <div>
              <h1 className="sm:text-xl md:text-2xl font-extrabold text-gray-800 tracking-tight">{t("createTitle")}</h1>
              <p className="text-gray-500 text-xs mt-0">{t("createSubtitle")}</p>
            </div>
          </div>
          {/* {loadingDropdowns && (
            <div className="text-sm text-amber-600 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-amber-400 border-t-amber-600 rounded-full"></div>
              Loading master data...
            </div>
          )} */}
        </Card>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Error Feedback */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-xl text-sm animate-in fade-in">
              {error}
            </div>
          )}

          {/* Section 1: Basic Details */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-md font-bold text-blue-700 mb-2 border-b pb-2">📦 {t("consignmentDetails")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <label className={labelClass}>{t("date")} <span className="text-red-500">*</span></label>
                <Input type="date" name="date" value={formData.date} required onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("paymentType")}</label>
                <Select value={formData.paymentType} onValueChange={(v) => handleSelectChange("paymentType", v)}>
                  <SelectTrigger className={`${inputClass} !py-1`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Pay">{t("toPay")}</SelectItem>
                    <SelectItem value="Paid">{t("paid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelClass}>{t("status")}</label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">{t("pending")}</SelectItem>
                    <SelectItem value="In Transit">{t("inTransit")}</SelectItem>
                    <SelectItem value="Delivered">{t("delivered")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className={labelClass}>{t("consignorSender")} <span className="text-red-500">*</span></label>
                <SearchableCombobox
                  data={parties}
                  displayKey="partyName"
                  placeholder={t("selectParty")}
                  value={formData.consignor}
                  onValueChange={(v) => handleSelectChange("consignor", v)}
                  masterLabel="Party"
                  masterPath="/dashboard/lr/masters/party"
                  renderItem={(item) => item.partyName}
                />
              </div>
              <div>
                <label className={labelClass}>{t("consigneeReceiver")} <span className="text-red-500">*</span></label>
                <SearchableCombobox
                  data={parties}
                  displayKey="partyName"
                  placeholder={t("selectParty")}
                  value={formData.consignee}
                  onValueChange={(v) => handleSelectChange("consignee", v)}
                  masterLabel="Party"
                  masterPath="/dashboard/lr/masters/party"
                  renderItem={(item) => item.partyName}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-md font-bold text-blue-700 mb-2 border-b pb-2">📍 {t("routeTransport")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t("fromCity")} <span className="text-red-500">*</span></label>
                  <SearchableCombobox
                    data={cities}
                    displayKey="cityName"
                    placeholder={t("selectCity")}
                    value={formData.fromCity}
                    onValueChange={(v) => handleSelectChange("fromCity", v)}
                    masterLabel="City"
                    masterPath="/dashboard/lr/masters/city"
                    renderItem={(item) => item.cityName}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("toCity")} <span className="text-red-500">*</span></label>
                  <SearchableCombobox
                    data={cities}
                    displayKey="cityName"
                    placeholder={t("selectCity")}
                    value={formData.toCity}
                    onValueChange={(v) => handleSelectChange("toCity", v)}
                    masterLabel="City"
                    masterPath="/dashboard/lr/masters/city"
                    renderItem={(item) => item.cityName}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t("vehicleNumber")} <span className="text-red-500">*</span></label>
                  <SearchableCombobox
                    data={vehicles}
                    displayKey="vehicleNumber"
                    placeholder={t("selectVehicle")}
                    value={formData.vehicle}
                    onValueChange={(v) => handleSelectChange("vehicle", v)}
                    masterLabel="Vehicle"
                    masterPath="/dashboard/lr/masters/vehicle"
                    renderItem={(item) =>
                      `${item.vehicleNumber} - ${item.vehicleType} (Cap: ${item.capacity}T)`
                    }
                  />
                </div>

                {/* 🚗 Vehicle Details Display */}
                {vehicleDetails && (
                  <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 font-semibold">Type</p>
                        <p className="text-gray-900">{vehicleDetails.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">Capacity</p>
                        <p className="text-gray-900">{vehicleDetails.capacity} Tons</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">Owner</p>
                        <p className="text-gray-900">{vehicleDetails.ownerName || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-semibold">Phone</p>
                        <p className="text-gray-900">{vehicleDetails.ownerPhone || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <label className={labelClass}>{t("driverName")}</label>
                  <Input type="text" name="driverName" value={formData.driverName} onChange={handleChange} className={inputClass} placeholder={t("enterDriverName")} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t("transportMode")} <span className="text-red-500">*</span></label>
                  <Select value={formData.transportMode} onValueChange={(v) => handleSelectChange("transportMode", v)}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder={t("select")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Road">{t("road")}</SelectItem>
                      <SelectItem value="Rail">{t("rail")}</SelectItem>
                      <SelectItem value="Air">{t("air")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-md font-bold text-blue-700 mb-3 border-b pb-2">⚖️ {t("loadPricing")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("weightKG")}</label>
                  <Input type="number" name="weight" value={formData.weight} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("quantity")}</label>
                  <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>{t("freightAmount")} <span className="text-red-500">*</span></label>
                  <Input type="number" name="freight" onChange={handleChange} value={formData.freight} className={`${inputClass} font-bold text-blue-600`} placeholder={t("amountPlaceholder")} />
                </div>
                <div className="col-span-2">
                  {/* No shadcn `checkbox.tsx` in this project yet — kept native so nothing else changes. */}
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <input type="checkbox" name="taxable" checked={formData.taxable} onChange={handleChange} className="w-4 h-4" />
                    {t("taxableGST")}
                  </label>
                </div>
                {formData.taxable && (
                  <>
                    <div>
                      <label className={labelClass}>{t("gstPercent")}</label>
                      <Input type="number" name="gstPercent" value={formData.gstPercent} onChange={handleChange} className={inputClass} placeholder={t("gstPlaceholder")} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("cgst")}</label>
                      <Input type="number" value={formData.cgst} disabled className={`${inputClass} bg-gray-100`} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("sgst")}</label>
                      <Input type="number" value={formData.sgst} disabled className={`${inputClass} bg-gray-100`} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("igst")}</label>
                      <Input type="number" value={formData.igst} disabled className={`${inputClass} bg-gray-100`} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>{t("totalAmount")}</label>
                      <Input type="number" value={formData.totalAmount} disabled className={`${inputClass} font-bold text-green-600 bg-gray-100`} />
                    </div>
                  </>
                )}
                {!formData.taxable && formData.freight && (
                  <div className="col-span-2">
                    <label className={labelClass}>{t("totalAmount")}</label>
                    <Input type="number" value={formData.totalAmount} disabled className={`${inputClass} font-bold text-green-600 bg-gray-100`} />
                  </div>
                )}
                <div className="col-span-2">
                  <p className="mb-1 font-semibold text-xs text-gray-500 ml-1">{t("freightType")}<span className="text-red-500">*</span></p>
                  {/* No shadcn `radio-group.tsx` in this project yet — kept native so nothing else changes. */}
                  <div className="flex items-center gap-4">
                    {['To Pay', 'Paid', 'TBB', 'FOC'].map(opt => (
                      <label key={opt} className="inline-flex items-center">
                        <input
                          type="radio"
                          name="freightType"
                          value={opt}
                          checked={formData.freightType === opt}
                          onChange={handleChange}
                          className="form-radio h-4 w-4"
                        />
                        <span className="ml-1 text-sm">{t(opt.replace(/\s+/g, ""))}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Material Description */}
          <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-md font-bold text-blue-700 mb-2 border-b pb-2">📝 {t("materialDescription")}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t("itemName")}<span className="text-red-500">*</span></label>
                <SearchableCombobox
                  data={items}
                  displayKey="itemName"
                  placeholder={t("selectItem")}
                  value={formData.item}
                  onValueChange={(v) => handleSelectChange("item", v)}
                  masterLabel="Item"
                  masterPath="/dashboard/lr/masters/item"
                  renderItem={(item) => item.itemName}
                />
              </div>
              <div>
                <label className={labelClass}>{t("numberOfPackages")}</label>
                <Input type="number" name="noOfPackages" value={formData.noOfPackages} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("packagingType")}</label>
                <Select value={formData.packagingType} onValueChange={(v) => handleSelectChange("packagingType", v)}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Drum">Drum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={labelClass}>{t("invoiceNumber")}</label>
                <Input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div className="">
                <label className={labelClass}>{t("eWayBill")}</label>
                <Input type="text" name="ewayBillNo" value={formData.ewayBillNo} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-4 mt-0 bg-white p-2 rounded-xl shadow-inner border border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setFormData(initialFormData);
                setVehicleDetails(null);
                if (onClose) onClose();
              }}
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              {t("discard")}
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingDropdowns}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {t("saving")}
                </span>
              ) : (
                t("savePrintLR")
              )}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}