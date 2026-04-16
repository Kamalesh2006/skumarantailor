"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, Plus, CheckCircle, User } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { GARMENT_TYPES, GARMENT_CONFIGS } from "@/lib/measurements";
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

    const garmentConfig = garmentType ? GARMENT_CONFIGS[garmentType as keyof typeof GARMENT_CONFIGS] : null;

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
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="glass-card w-full max-w-3xl max-h-[92vh] overflow-y-auto animate-slide-up flex flex-col"
                style={{ background: "var(--bg-secondary)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b shrink-0"
                    style={{ borderColor: "var(--glass-border)" }}
                >
                    <h3 className="text-lg font-semibold text-themed-primary">
                        {t("dash.createOrder")}
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-themed-muted hover:text-themed-primary transition-colors"
                        style={{ background: "var(--hover-bg)" }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* ── Success ── */}
                {success ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-emerald-500">Order created!</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">

                        {/* ── Section 1: Customer ── */}
                        <section className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Customer</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Phone with autocomplete */}
                                <div className="relative">
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        {t("dash.customerPhone")}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-themed-muted shrink-0">+91</span>
                                        <div className="relative flex-1">
                                            <input
                                                ref={phoneRef}
                                                type="tel"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                onFocus={() => phone.length >= 3 && setShowDropdown(true)}
                                                placeholder="9876543210"
                                                className="form-input text-sm w-full"
                                                maxLength={10}
                                                autoComplete="off"
                                            />
                                            {/* Dropdown */}
                                            {showDropdown && filteredCustomers.length > 0 && (
                                                <div
                                                    ref={dropdownRef}
                                                    className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl overflow-hidden shadow-xl"
                                                    style={{
                                                        background: "var(--bg-primary)",
                                                        border: "1px solid var(--glass-border)",
                                                    }}
                                                >
                                                    {filteredCustomers.map((u) => (
                                                        <button
                                                            key={u.uid}
                                                            type="button"
                                                            onClick={() => handleSelectCustomer(u)}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gold-400/10 transition-colors"
                                                        >
                                                            <div className="h-7 w-7 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                                {u.name ? u.name.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-themed-primary truncate">
                                                                    {u.name || <span className="text-themed-muted italic">Unnamed</span>}
                                                                </p>
                                                                <p className="text-xs text-themed-muted">{u.phoneNumber}</p>
                                                            </div>
                                                            {Object.keys(u.measurements || {}).length > 0 && (
                                                                <span className="ml-auto text-[10px] font-semibold text-gold-400 bg-gold-400/10 px-1.5 py-0.5 rounded-md shrink-0">
                                                                    Has measurements
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedCustomer && (
                                        <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Existing customer selected
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        {t("dash.customerName")}
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder={t("dash.namePlaceholder")}
                                        className="form-input text-sm w-full"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── Section 2: Garment & Measurements ── */}
                        <section className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Garment & Measurements</p>

                            {/* Garment type + Sets row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        {t("dash.garmentType")}
                                    </label>
                                    <select
                                        value={garmentType}
                                        onChange={(e) => setGarmentType(e.target.value)}
                                        className="w-full appearance-none rounded-lg px-3 py-2 text-sm font-medium cursor-pointer"
                                        style={{
                                            background: "var(--input-bg)",
                                            border: "1px solid var(--glass-border)",
                                            color: garmentType ? "var(--text-primary)" : "var(--text-muted)",
                                        }}
                                    >
                                        <option value="">Select garment...</option>
                                        {GARMENT_TYPES.map((g) => (
                                            <option key={g} value={g}>
                                                {t(`garment.${g}`) || g}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        Number of Sets
                                    </label>
                                    <div
                                        className="flex items-center rounded-lg overflow-hidden"
                                        style={{ border: "1px solid var(--glass-border)" }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setNumberOfSets((n) => Math.max(1, n - 1))}
                                            className="flex h-9 w-10 items-center justify-center text-themed-secondary hover:text-themed-primary transition-colors"
                                            style={{ background: "var(--hover-bg)" }}
                                        >
                                            <span className="text-lg font-bold leading-none">−</span>
                                        </button>
                                        <span
                                            className="flex-1 flex items-center justify-center h-9 text-sm font-bold"
                                            style={{ background: "var(--input-bg)", color: "var(--text-primary)" }}
                                        >
                                            {numberOfSets}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setNumberOfSets((n) => Math.min(99, n + 1))}
                                            className="flex h-9 w-10 items-center justify-center text-themed-secondary hover:text-themed-primary transition-colors"
                                            style={{ background: "var(--hover-bg)" }}
                                        >
                                            <span className="text-lg font-bold leading-none">+</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Measurement fields + Visualizer */}
                            {garmentType && garmentConfig && (
                                <div className="flex flex-col lg:flex-row gap-5 rounded-xl p-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>
                                    {/* Fields */}
                                    <div className="flex-1 space-y-3">
                                        <p className="text-xs font-semibold text-themed-secondary">
                                            Measurements{" "}
                                            {selectedCustomer && Object.keys(selectedCustomer.measurements?.[garmentType] ?? {}).length > 0 && (
                                                <span className="text-gold-400">(pre-filled from customer record)</span>
                                            )}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {garmentConfig.map((field) => (
                                                <div key={field.id}>
                                                    <label className="text-[10px] font-medium text-themed-muted uppercase tracking-wider block mb-0.5">
                                                        {t(field.labelKey) || field.id}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.25"
                                                        min="0"
                                                        value={measurements[field.id] || ""}
                                                        onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="form-input text-sm w-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visualizer */}
                                    <div className="w-full lg:w-44 shrink-0">
                                        <MeasurementVisualizer
                                            garmentType={garmentType as import("@/lib/measurements").GarmentType}
                                            measurements={visualizerMeasurements}
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ── Section 3: Delivery & Notes ── */}
                        <section className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Delivery & Notes</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        Delivery Date
                                    </label>
                                    <input
                                        type="date"
                                        value={deliveryDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                        className="form-input text-sm w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        {t("dash.notes")}
                                    </label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={t("dash.detailsPlaceholder")}
                                        className="form-input text-sm w-full"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── Section 4: Price ── */}
                        <section className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Pricing</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-themed-secondary mb-1.5 block">
                                        {t("dash.basePrice")} (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))}
                                        placeholder="Auto from settings"
                                        className="form-input text-sm w-full"
                                    />
                                </div>
                                <div
                                    className="flex flex-col justify-center rounded-xl px-4 py-3"
                                    style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}
                                >
                                    <p className="text-[10px] font-medium text-themed-muted uppercase tracking-wider">Total Amount</p>
                                    <p className="text-xl font-bold text-gold-400 mt-0.5">
                                        ₹{((typeof basePrice === "number" ? basePrice : garmentPrices[garmentType] ?? 0) * numberOfSets).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-[10px] text-themed-muted mt-0.5">
                                        ₹{typeof basePrice === "number" ? basePrice : garmentPrices[garmentType] ?? 0} × {numberOfSets} set{numberOfSets > 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ── Submit ── */}
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || submitting}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: isValid && !submitting ? "#2D2D2D" : "var(--bg-tertiary)",
                                color: isValid && !submitting ? "#D4AF37" : undefined,
                                border: isValid && !submitting ? "1px solid rgba(212,175,55,0.3)" : undefined,
                            }}
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Creating order…</>
                            ) : (
                                <><Plus className="h-4 w-4" /> {t("dash.createOrderBtn")}</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
