"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, CheckCircle, Save } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { GARMENT_TYPES, GARMENT_CONFIGS } from "@/lib/measurements";
import {
    OrderData,
    updateOrder,
    getUserByPhone,
    updateUser,
} from "@/lib/firestore";
import MeasurementVisualizer from "./MeasurementVisualizer";

// ── Types ──────────────────────────────────────────────────────────────────

interface EditOrderModalProps {
    isOpen: boolean;
    order: OrderData | null;
    onClose: () => void;
    onOrderUpdated: () => void;
    garmentPrices: Record<string, number>;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EditOrderModal({
    isOpen,
    order,
    onClose,
    onOrderUpdated,
    garmentPrices,
}: EditOrderModalProps) {
    const { t } = useLanguage();

    // ── Form state ──
    const [garmentType, setGarmentType] = useState("");
    const [numberOfSets, setNumberOfSets] = useState(1);
    const [measurements, setMeasurements] = useState<Record<string, number>>({});
    const [deliveryDate, setDeliveryDate] = useState("");
    const [notes, setNotes] = useState("");
    const [basePrice, setBasePrice] = useState<number | "">(0);

    // ── Submit state ──
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Populate form when modal opens or order changes
    useEffect(() => {
        if (isOpen && order) {
            setGarmentType(order.garmentType);
            setNumberOfSets(order.numberOfSets);
            setDeliveryDate(order.targetDeliveryDate);
            setNotes(order.notes);
            setBasePrice(order.basePrice);
            setSubmitting(false);
            setSuccess(false);

            // Load measurements from customer record
            getUserByPhone(order.customerPhone).then((user) => {
                if (user) {
                    const saved = user.measurements?.[order.garmentType] ?? {};
                    setMeasurements(saved as Record<string, number>);
                } else {
                    setMeasurements({});
                }
            });
        }
    }, [isOpen, order]);

    // Reload measurements when garment type changes
    useEffect(() => {
        if (!isOpen || !order || !garmentType) return;

        getUserByPhone(order.customerPhone).then((user) => {
            if (user) {
                const saved = user.measurements?.[garmentType] ?? {};
                setMeasurements(saved as Record<string, number>);
            } else {
                setMeasurements({});
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [garmentType]);

    // Auto-update base price when garment type changes
    useEffect(() => {
        if (garmentType && garmentPrices[garmentType]) {
            setBasePrice(garmentPrices[garmentType]);
        }
    }, [garmentType, garmentPrices]);

    // ── Handlers ──

    const handleMeasurementChange = useCallback((fieldId: string, value: string) => {
        const num = parseFloat(value);
        setMeasurements((prev) => ({ ...prev, [fieldId]: isNaN(num) ? 0 : num }));
    }, []);

    const isValid =
        garmentType !== "" &&
        numberOfSets > 0 &&
        deliveryDate !== "";

    const handleSubmit = async () => {
        if (!isValid || submitting || !order) return;
        setSubmitting(true);

        try {
            const price = typeof basePrice === "number" ? basePrice : garmentPrices[garmentType] ?? 1000;

            // Update the order
            await updateOrder(order.orderId, {
                garmentType,
                numberOfSets,
                basePrice: price,
                totalAmount: price * numberOfSets,
                targetDeliveryDate: deliveryDate,
                notes,
            });

            // Save measurements back to customer profile
            const user = await getUserByPhone(order.customerPhone);
            if (user) {
                const updatedMeasurements = {
                    ...(user.measurements || {}),
                    [garmentType]: measurements,
                };
                await updateUser(user.uid, {
                    measurements: updatedMeasurements,
                });
            }

            setSuccess(true);
            onOrderUpdated();
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            console.error("Update order failed:", err);
            setSubmitting(false);
        }
    };

    if (!isOpen || !order) return null;

    const garmentConfig = garmentType ? GARMENT_CONFIGS[garmentType as keyof typeof GARMENT_CONFIGS] : null;

    // Build visualizer measurements
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
                    <div>
                        <h3 className="text-lg font-semibold text-themed-primary">
                            Edit Order
                        </h3>
                        <p className="text-xs text-themed-muted mt-0.5">
                            {order.orderId} • {order.customerName} • {order.customerPhone}
                        </p>
                    </div>
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
                        <p className="text-sm font-medium text-emerald-500">Order updated!</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">

                        {/* ── Section 1: Garment & Sets ── */}
                        <section className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Garment & Sets</p>

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
                        </section>

                        {/* ── Section 2: Measurements ── */}
                        {garmentType && garmentConfig && (
                            <section className="space-y-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-gold-400">Measurements</p>
                                <div className="flex flex-col lg:flex-row gap-5 rounded-xl p-4" style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>
                                    {/* Fields */}
                                    <div className="flex-1 space-y-3">
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
                            </section>
                        )}

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
                                <><Loader2 className="h-4 w-4 animate-spin" /> Saving changes…</>
                            ) : (
                                <><Save className="h-4 w-4" /> Save Changes</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
