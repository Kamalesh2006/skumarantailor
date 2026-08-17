"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, Plus, CheckCircle, User } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { GARMENT_TYPES, GARMENT_CONFIGS, MeasurementField, GarmentType } from "@/lib/measurements";
import {
    UserData,
    createOrder,
    createUser,
    getUserByPhone,
    updateUser,
} from "@/lib/firestore";
import MeasurementVisualizer from "./MeasurementVisualizer";

// ── Types ──────────────────────────────────────────────────────────────────

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated: () => void;
    allUsers: UserData[];
    garmentPrices: Record<string, number>;
}

// ── Default delivery date (today + 10 days) ───────────────────────────────

function defaultDeliveryDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split("T")[0];
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CreateOrderModal({
    isOpen,
    onClose,
    onOrderCreated,
    allUsers,
    garmentPrices,
}: CreateOrderModalProps) {
    const { t } = useLanguage();

    // ── Form state ──
    const [phone, setPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [garmentType, setGarmentType] = useState("");
    const [numberOfSets, setNumberOfSets] = useState(1);
    const [measurements, setMeasurements] = useState<Record<string, number>>({});
    const [deliveryDate, setDeliveryDate] = useState(defaultDeliveryDate());
    const [notes, setNotes] = useState("");
    const [basePrice, setBasePrice] = useState<number | "">("");
    
    // ── Custom Measurement Fields ──
    const [customFields, setCustomFields] = useState<Record<string, MeasurementField[]>>({});
    
    useEffect(() => {
        try {
            const saved = localStorage.getItem('tailor_custom_fields');
            if (saved) setCustomFields(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load custom fields", e);
        }
    }, []);

    // ── Customer lookup ──
    const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const phoneRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ── Submit state ──
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Filtered customer suggestions
    const filteredCustomers = phone.replace(/\D/g, "").length >= 3
        ? allUsers.filter((u) =>
            u.phoneNumber.replace(/\D/g, "").includes(phone.replace(/\D/g, ""))
        ).slice(0, 6)
        : [];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhone("");
            setCustomerName("");
            setGarmentType("");
            setNumberOfSets(1);
            setMeasurements({});
            setDeliveryDate(defaultDeliveryDate());
            setNotes("");
            setBasePrice("");
            setSelectedCustomer(null);
            setShowDropdown(false);
            setSubmitting(false);
            setSuccess(false);
        }
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                phoneRef.current && !phoneRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Auto-update base price when garment type changes
    useEffect(() => {
        if (garmentType && garmentPrices[garmentType]) {
            setBasePrice(garmentPrices[garmentType]);
        }
    }, [garmentType, garmentPrices]);

    // Load measurements: fetch fresh from Firestore when garment type is chosen
    // so we always have the latest saved values regardless of allUsers staleness.
    useEffect(() => {
        if (!garmentType) return;

        const phone10 = phone.replace(/\D/g, "");
        if (phone10.length !== 10) {
            setMeasurements({});
            return;
        }

        let cancelled = false;
        getUserByPhone(`+91${phone10}`).then((freshUser) => {
            if (cancelled) return;
            const saved = freshUser?.measurements?.[garmentType] ?? {};
            setMeasurements(saved as Record<string, number>);
        });

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [garmentType, phone]);

    // ── Handlers ──

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
        setPhone(digits);
        setSelectedCustomer(null);
        setCustomerName("");
        setShowDropdown(digits.length >= 3);
    };

    const handleSelectCustomer = (user: UserData) => {
        const digits = user.phoneNumber.replace(/\D/g, "");
        setPhone(digits.slice(-10));
        setCustomerName(user.name || "");
        setSelectedCustomer(user);
        setShowDropdown(false);
        // Load measurements for current garment if already selected
        if (garmentType) {
            const saved = user.measurements?.[garmentType] ?? {};
            setMeasurements(saved as Record<string, number>);
        }
    };

    const handleMeasurementChange = useCallback((fieldId: string, value: string) => {
        const num = parseFloat(value);
        setMeasurements((prev) => ({ ...prev, [fieldId]: isNaN(num) ? 0 : num }));
    }, []);

    const isValid =
        phone.length === 10 &&
        customerName.trim().length > 0 &&
        garmentType !== "" &&
        numberOfSets > 0 &&
        deliveryDate !== "";

    const handleSubmit = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);

        try {
            const fullPhone = `+91${phone}`;

            // Create or update user
            let user = selectedCustomer ?? (await getUserByPhone(fullPhone));
            const updatedMeasurements = {
                ...(user?.measurements || {}),
                [garmentType]: measurements,
            };
            if (!user) {
                user = await createUser({
                    phoneNumber: fullPhone,
                    role: "customer",
                    name: customerName.trim(),
                    measurements: updatedMeasurements,
                });
            } else {
                // Always save measurements back (new garment profile or updated values)
                await updateUser(user.uid, {
                    name: customerName.trim(),
                    measurements: updatedMeasurements,
                });
            }

            const price = typeof basePrice === "number" ? basePrice : garmentPrices[garmentType] ?? 1000;

            await createOrder({
                customerPhone: fullPhone,
                customerName: customerName.trim(),
                status: "Pending",
                binLocation: "",
                submissionDate: new Date().toISOString().split("T")[0],
                targetDeliveryDate: deliveryDate,
                basePrice: price,
                numberOfSets,
                totalAmount: price * numberOfSets,
                rushFee: 0,
                isApprovedRushed: false,
                garmentType,
                notes,
            });

            setSuccess(true);
            onOrderCreated();
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            console.error("Create order failed:", err);
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const baseConfig = garmentType ? GARMENT_CONFIGS[garmentType as keyof typeof GARMENT_CONFIGS] : null;
    const garmentConfig = baseConfig ? [...baseConfig, ...(customFields[garmentType] || [])] : null;

    const handleAddField = () => {
        if (!garmentType) return;
        const currentCustoms = customFields[garmentType] || [];
        if (currentCustoms.length >= 20) {
            alert("Maximum of 20 custom fields allowed per garment.");
            return;
        }
        
        const fieldName = prompt("Enter name for the new measurement field:", `Field ${currentCustoms.length + 1}`);
        if (!fieldName || !fieldName.trim()) return;
        
        const newField: MeasurementField = {
            id: `custom_${Date.now()}`,
            labelKey: fieldName.trim(), // Use actual name as a fallback for translation
            placeholder: "e.g., 0"
        };
        
        const updatedCustoms = [...currentCustoms, newField];
        const newCustomFields = { ...customFields, [garmentType]: updatedCustoms };
        setCustomFields(newCustomFields);
        localStorage.setItem('tailor_custom_fields', JSON.stringify(newCustomFields));
    };

    // Build visualizer measurements (string values for display)
    const visualizerMeasurements: Record<string, string | number> = {};
    if (garmentConfig) {
        garmentConfig.forEach((f) => {
            if (measurements[f.id] !== undefined && measurements[f.id] !== 0) {
                visualizerMeasurements[f.id] = measurements[f.id];
            }
        });
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#140E09]/55" onClick={onClose}>
            <div className="w-full max-w-[880px] bg-[#FBF7F0] rounded-[24px] overflow-hidden shadow-[0_30px_80px_rgba(20,14,9,0.42)] flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="bg-[#2A1D14] p-[17px_30px] flex items-center gap-[16px] shrink-0">
                    <div className="w-[42px] h-[42px] rounded-[13px] bg-[#C8912F] flex items-center justify-center text-[19px] text-[#2A1D14]">✂</div>
                    <div className="flex-1">
                        <div className="font-bricolage font-extrabold tracking-[-0.5px] text-[23px] text-[#F7EEDC] leading-[1.1]">Create new order</div>
                        <div className="text-[12.5px] text-[#B9A48A] mt-[4px]">Payment is collected now, at the counter</div>
                    </div>
                    <button onClick={onClose} className="w-[38px] h-[38px] rounded-[11px] bg-[#3B2A20] flex items-center justify-center text-[16px] text-[#B9A48A] hover:bg-[#4a3628] transition-colors">✕</button>
                </div>

                {/* Body */}
                <div className="p-[16px_30px_14px] flex flex-col gap-[14px] overflow-y-auto">
                    {/* CUSTOMER */}
                    <div>
                        <div className="text-[11.5px] font-extrabold tracking-[1.4px] text-[#8A5A1E] mb-[10px]">CUSTOMER</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                            <div className="relative">
                                <div className="text-[12.5px] font-bold text-[#7A6A5C] mb-[7px]">Phone number</div>
                                <div className="bg-white border-2 border-[#C8912F] rounded-[12px] p-[12px_15px] flex items-center gap-[11px]">
                                    <span className="text-[14px] font-bold text-[#7A6A5C] pr-[11px] border-r border-[#EADFCF]">+91</span>
                                    <input 
                                        ref={phoneRef}
                                        type="tel" 
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="00000 00000"
                                        maxLength={10}
                                        className="flex-1 text-[16px] font-bold text-[#2A1D14] tracking-[0.4px] bg-transparent outline-none"
                                    />
                                    {selectedCustomer && (
                                        <span className="text-[11px] font-extrabold text-[#6E8B5E]">✓ FOUND</span>
                                    )}
                                </div>
                                
                                {/* Dropdown for search */}
                                {showDropdown && filteredCustomers.length > 0 && (
                                    <div ref={dropdownRef} className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-[#EADFCF] rounded-[12px] shadow-lg z-10 overflow-hidden">
                                        {filteredCustomers.map(u => (
                                            <div 
                                                key={u.uid} 
                                                onClick={() => handleSelectCustomer(u)}
                                                className="p-3 border-b border-[#F1EBE3] hover:bg-[#FBF7F0] cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="font-bold text-[#2A1D14]">{u.name || "Unknown"}</div>
                                                <div className="text-sm text-[#7A6A5C]">{u.phoneNumber}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="text-[12.5px] font-bold text-[#7A6A5C] mb-[7px]">Name</div>
                                <div className="bg-white border border-[#EADFCF] rounded-[12px] p-[12px_15px] flex items-center gap-[11px]">
                                    <input 
                                        type="text" 
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Customer name"
                                        className="flex-1 text-[16px] font-bold text-[#2A1D14] bg-transparent outline-none"
                                    />
                                    {!selectedCustomer && phone.length === 10 && customerName.length > 0 && (
                                        <span className="text-[12px] font-extrabold text-[#8A5A1E]">Add customer</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {selectedCustomer && (
                            <div className="flex items-center gap-[11px] bg-[#EAF0E4] border border-[#D3E0C8] rounded-[11px] p-[10px_14px] mt-[11px]">
                                <span className="text-[13px] text-[#4F6742]">✓</span>
                                <span className="flex-1 text-[13px] text-[#41603A]">
                                    {selectedCustomer.queryCount || 0} past orders · saved sizes for {Object.keys(selectedCustomer.measurements || {}).join(", ") || "nothing yet"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* GARMENT & MEASUREMENTS */}
                    <div>
                        <div className="text-[11.5px] font-extrabold tracking-[1.4px] text-[#8A5A1E] mb-[10px]">GARMENT & MEASUREMENTS</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] items-start">
                            <div>
                                <div className="text-[12.5px] font-bold text-[#7A6A5C] mb-[7px]">Garment type</div>
                                <div className="bg-white border border-[#EADFCF] rounded-[12px] p-[12px_15px] flex items-center gap-[11px] relative">
                                    <select 
                                        value={garmentType}
                                        onChange={(e) => setGarmentType(e.target.value)}
                                        className="flex-1 text-[15.5px] font-bold text-[#2A1D14] bg-transparent outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select garment</option>
                                        {GARMENT_TYPES.map(g => (
                                            <option key={g} value={g}>{t(`garment.${g}`) || g}</option>
                                        ))}
                                    </select>
                                    <span className="text-[13px] text-[#A6947F] pointer-events-none absolute right-4">▾</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-[12.5px] font-bold text-[#7A6A5C] mb-[7px]">Number of sets</div>
                                <div className="bg-white border border-[#EADFCF] rounded-[12px] p-[7px_9px] flex items-center justify-between">
                                    <button 
                                        onClick={() => setNumberOfSets(Math.max(1, numberOfSets - 1))}
                                        className="w-[38px] h-[38px] rounded-[10px] bg-[#F1EBE3] flex items-center justify-center text-[18px] text-[#5E4A38] hover:bg-[#EADFCF]"
                                    >–</button>
                                    <span className="font-bricolage font-extrabold text-[22px] text-[#2A1D14]">{numberOfSets}</span>
                                    <button 
                                        onClick={() => setNumberOfSets(numberOfSets + 1)}
                                        className="w-[38px] h-[38px] rounded-[10px] bg-[#2A1D14] flex items-center justify-center text-[18px] text-[#E7C87A] hover:bg-[#3B2A20]"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {garmentType && garmentConfig && (
                            <div className="bg-white border border-[#EADFCF] rounded-[14px] p-[13px] mt-[11px]">
                                <div className="flex items-center gap-[10px] mb-[10px]">
                                    <span className="flex-1 text-[14px] font-extrabold text-[#2A1D14]">{t(`garment.${garmentType}`) || garmentType} measurements</span>
                                    {selectedCustomer && selectedCustomer.measurements?.[garmentType] && (
                                        <span className="text-[12px] font-extrabold text-[#6E8B5E]">Filled from last order</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-[9px]">
                                    {garmentConfig.map((field) => (
                                        <div key={field.id} className="bg-[#FBF7F0] border border-[#EADFCF] rounded-[10px] p-[9px_11px]">
                                            <div className="text-[11px] text-[#7A6A5C]">{t(field.labelKey) || field.id}</div>
                                            <input 
                                                type="number" 
                                                value={measurements[field.id] || ""}
                                                onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                                                className="w-full text-[16.5px] font-extrabold text-[#2A1D14] mt-[1px] bg-transparent outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                    <div 
                                        onClick={handleAddField}
                                        className="border-[1.5px] border-dashed border-[#C8912F] rounded-[10px] p-[9px_11px] flex flex-col justify-center items-center cursor-pointer hover:bg-orange-50/50"
                                    >
                                        <div className="text-[15px] text-[#8A5A1E] leading-[1]">＋</div>
                                        <div className="text-[11px] font-extrabold text-[#8A5A1E]">Add field</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* DELIVERY & NOTES */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-[16px] items-start">
                        <div>
                            <div className="text-[11.5px] font-extrabold tracking-[1.4px] text-[#8A5A1E] mb-[10px]">DELIVERY & NOTES</div>
                            <div className="flex flex-wrap sm:flex-nowrap gap-[12px]">
                                <div className="flex-1 bg-white border border-[#EADFCF] rounded-[12px] p-[11px_14px]">
                                    <div className="text-[11.5px] text-[#7A6A5C]">Delivery date</div>
                                    <div className="flex items-baseline gap-[8px] mt-[3px]">
                                        <input 
                                            type="date" 
                                            value={deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                            className="text-[15.5px] font-extrabold text-[#2A1D14] bg-transparent outline-none w-full"
                                        />
                                    </div>
                                </div>
                                <div className="w-[100px] bg-white border border-[#EADFCF] rounded-[12px] p-[11px_14px]">
                                    <div className="text-[11.5px] text-[#7A6A5C]">Bin</div>
                                    <input 
                                        type="text" 
                                        placeholder="—"
                                        className="text-[15.5px] font-extrabold text-[#2A1D14] bg-transparent outline-none w-full mt-[3px]"
                                    />
                                </div>
                            </div>
                            <div className="mt-[12px]">
                                <div className="bg-white border border-[#EADFCF] rounded-[12px] p-[12px_14px] flex items-start gap-[10px]">
                                    <span className="text-[16px] text-[#A6947F] mt-[2px]">✎</span>
                                    <textarea 
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes for the tailors"
                                        className="flex-1 text-[13.5px] font-bold text-[#2A1D14] bg-transparent outline-none resize-none h-[40px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SUM */}
                        <div className="bg-[#2A1D14] rounded-[18px] p-[18px_20px] flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-baseline mb-[6px]">
                                    <span className="text-[13.5px] font-bold text-[#B9A48A]">
                                        {garmentType ? `${t(`garment.${garmentType}`) || garmentType} × ${numberOfSets}` : 'No garment'}
                                    </span>
                                    <div className="flex items-center gap-[4px] bg-[#3B2A20] rounded-[6px] px-[6px] py-[2px]">
                                        <span className="text-[11.5px] text-[#8C7761]">₹</span>
                                        <input 
                                            type="number"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(Number(e.target.value))}
                                            className="w-[40px] text-[13.5px] font-bold text-[#E3D6C4] bg-transparent outline-none text-right"
                                        />
                                    </div>
                                </div>
                                <div className="h-[1px] bg-[#3B2A20] my-[14px]"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[12px] text-[#8C7761] mb-[3px]">Total to collect</span>
                                    <span className="font-bricolage font-extrabold text-[28px] text-[#F7EEDC] tracking-[-0.5px]">
                                        ₹{((typeof basePrice === 'number' ? basePrice : 0) * numberOfSets).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={handleSubmit}
                                disabled={!isValid || submitting}
                                className="w-full h-[52px] rounded-[14px] bg-[#C8912F] flex items-center justify-center gap-[10px] text-[15.5px] font-extrabold text-[#2A1D14] mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b8852a] transition-colors"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? <CheckCircle className="w-5 h-5 text-green-800" /> : "+ Create order"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
