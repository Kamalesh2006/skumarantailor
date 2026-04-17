"use client";

import React, { useState, useEffect } from "react";
import { X, Phone, Ruler, Package, ChevronDown, ChevronUp, MapPin, Calendar, Edit3 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { GARMENT_CONFIGS } from "@/lib/measurements";
import { OrderData, UserData, getUserByPhone } from "@/lib/firestore";
import MeasurementVisualizer from "./MeasurementVisualizer";

interface CustomerDetailModalProps {
    isOpen: boolean;
    customer: UserData | null;
    orders: OrderData[];
    onClose: () => void;
    onEditOrder: (order: OrderData) => void;
    onEditCustomer: (user: UserData) => void;
}

const STATUS_COLORS: Record<string, string> = {
    Pending: "bg-yellow-500/15 text-yellow-500",
    Cutting: "bg-blue-500/15 text-blue-500",
    Stitching: "bg-purple-500/15 text-purple-500",
    Alteration: "bg-orange-500/15 text-orange-500",
    Ready: "bg-emerald-500/15 text-emerald-500",
    Delivered: "bg-gray-500/15 text-gray-400",
};

export default function CustomerDetailModal({
    isOpen,
    customer,
    orders,
    onClose,
    onEditOrder,
    onEditCustomer,
}: CustomerDetailModalProps) {
    const { t } = useLanguage();

    // Measurements state (fetched fresh from Firestore)
    const [measurements, setMeasurements] = useState<Record<string, Record<string, number>>>({});
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [expandedGarment, setExpandedGarment] = useState<string | null>(null);

    // Fetch fresh measurements when modal opens
    useEffect(() => {
        if (isOpen && customer) {
            getUserByPhone(customer.phoneNumber).then((freshUser) => {
                if (freshUser) {
                    setMeasurements(freshUser.measurements || {});
                } else {
                    setMeasurements(customer.measurements || {});
                }
            });
            setExpandedOrderId(null);
            setExpandedGarment(null);
        }
    }, [isOpen, customer]);

    if (!isOpen || !customer) return null;

    // Filter orders for this customer
    const customerOrders = orders
        .filter((o) => o.customerPhone === customer.phoneNumber)
        .sort((a, b) => b.orderId.localeCompare(a.orderId));

    const activeOrders = customerOrders.filter((o) => o.status !== "Delivered");
    const totalSpend = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const garmentProfiles = Object.keys(measurements);

    const toggleMeasurement = (garmentType: string) => {
        setExpandedGarment((prev) => (prev === garmentType ? null : garmentType));
    };

    const toggleOrder = (orderId: string) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col"
                style={{ background: "var(--bg-secondary)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div
                    className="flex items-center justify-between px-6 py-5 border-b shrink-0"
                    style={{ borderColor: "var(--glass-border)" }}
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold text-lg shrink-0">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-themed-primary">
                                {customer.name || "Unnamed"}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-sm text-themed-secondary flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {customer.phoneNumber}
                                </span>
                                {customer.gender && (
                                    <span className="text-xs text-themed-muted uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "var(--hover-bg)" }}>
                                        {customer.gender}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEditCustomer(customer)}
                            className="p-2 rounded-lg text-themed-muted hover:text-gold-400 hover:bg-gold-400/10 transition-colors"
                            title="Edit Customer"
                        >
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-themed-muted hover:text-themed-primary transition-colors"
                            style={{ background: "var(--hover-bg)" }}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* ── Quick Stats ── */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 text-center" style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>
                            <p className="text-xl font-bold text-themed-primary">{customerOrders.length}</p>
                            <p className="text-[10px] text-themed-muted uppercase tracking-wider mt-0.5">Total Orders</p>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>
                            <p className="text-xl font-bold text-emerald-500">{activeOrders.length}</p>
                            <p className="text-[10px] text-themed-muted uppercase tracking-wider mt-0.5">Active</p>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>
                            <p className="text-xl font-bold text-gold-400">₹{totalSpend.toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-themed-muted uppercase tracking-wider mt-0.5">Total Spend</p>
                        </div>
                    </div>

                    {/* ── Measurement Profiles ── */}
                    {garmentProfiles.length > 0 && (
                        <section>
                            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-3 flex items-center gap-1.5">
                                <Ruler className="h-3.5 w-3.5" /> Measurement Profiles
                            </p>
                            <div className="space-y-2">
                                {garmentProfiles.map((garmentType) => {
                                    const isExpanded = expandedGarment === garmentType;
                                    const garmentMeasurements = measurements[garmentType] || {};
                                    const config = GARMENT_CONFIGS[garmentType as keyof typeof GARMENT_CONFIGS];
                                    const filledCount = Object.values(garmentMeasurements).filter((v) => v > 0).length;

                                    return (
                                        <div key={garmentType} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
                                            <button
                                                onClick={() => toggleMeasurement(garmentType)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                                style={{ background: "var(--bg-primary)" }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-themed-primary">
                                                        {t(`garment.${garmentType}`) || garmentType}
                                                    </span>
                                                    <span className="text-[10px] text-themed-muted px-1.5 py-0.5 rounded-md" style={{ background: "var(--hover-bg)" }}>
                                                        {filledCount} measurements
                                                    </span>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-themed-muted" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-themed-muted" />
                                                )}
                                            </button>
                                            {isExpanded && config && (
                                                <div className="px-4 py-4 flex flex-col sm:flex-row gap-4" style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--glass-border)" }}>
                                                    <div className="flex-1">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                                            {config.map((field) => {
                                                                const val = garmentMeasurements[field.id];
                                                                return (
                                                                    <div key={field.id} className="flex items-baseline justify-between">
                                                                        <span className="text-xs text-themed-muted">
                                                                            {t(field.labelKey) || field.id}
                                                                        </span>
                                                                        <span className={`text-sm font-semibold ml-2 ${val && val > 0 ? "text-themed-primary" : "text-themed-muted"}`}>
                                                                            {val && val > 0 ? `${val}"` : "—"}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    <div className="w-full sm:w-36 shrink-0">
                                                        <MeasurementVisualizer
                                                            garmentType={garmentType as import("@/lib/measurements").GarmentType}
                                                            measurements={garmentMeasurements}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* ── Orders ── */}
                    <section>
                        <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-3 flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5" /> Orders ({customerOrders.length})
                        </p>

                        {customerOrders.length === 0 ? (
                            <div className="rounded-xl p-6 text-center" style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>
                                <p className="text-sm text-themed-muted">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {customerOrders.map((o) => {
                                    const isExpanded = expandedOrderId === o.orderId;
                                    const garmentMeasurements = measurements[o.garmentType] || {};
                                    const config = GARMENT_CONFIGS[o.garmentType as keyof typeof GARMENT_CONFIGS];

                                    return (
                                        <div
                                            key={o.orderId}
                                            className="rounded-xl overflow-hidden"
                                            style={{ border: "1px solid var(--glass-border)" }}
                                        >
                                            {/* Order row */}
                                            <button
                                                onClick={() => toggleOrder(o.orderId)}
                                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                                style={{ background: "var(--bg-primary)" }}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="font-mono text-xs font-bold text-themed-primary shrink-0">
                                                        {o.orderId}
                                                    </span>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${STATUS_COLORS[o.status] || "bg-gray-500/15 text-gray-400"}`}>
                                                        {t(`status.${o.status}`) || o.status}
                                                    </span>
                                                    <span className="text-xs text-themed-secondary truncate">
                                                        {t(`garment.${o.garmentType}`) || o.garmentType}
                                                        {o.numberOfSets > 1 ? ` × ${o.numberOfSets}` : ""}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="text-sm font-semibold text-themed-primary">
                                                        ₹{o.totalAmount.toLocaleString("en-IN")}
                                                    </span>
                                                    {isExpanded ? (
                                                        <ChevronUp className="h-4 w-4 text-themed-muted" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-themed-muted" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expanded details */}
                                            {isExpanded && (
                                                <div className="px-4 py-4 space-y-4" style={{ background: "var(--bg-primary)", borderTop: "1px solid var(--glass-border)" }}>
                                                    {/* Order details */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div>
                                                            <p className="text-[10px] text-themed-muted uppercase tracking-wider">Base Price</p>
                                                            <p className="text-sm font-medium text-themed-primary">₹{o.basePrice.toLocaleString("en-IN")}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-themed-muted uppercase tracking-wider">Sets</p>
                                                            <p className="text-sm font-medium text-themed-primary">{o.numberOfSets}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-themed-muted uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3 w-3" /> Placed</p>
                                                            <p className="text-sm font-medium text-themed-primary">{o.submissionDate}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-themed-muted uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3 w-3" /> Due</p>
                                                            <p className="text-sm font-medium text-themed-primary">{o.targetDeliveryDate}</p>
                                                        </div>
                                                    </div>

                                                    {o.binLocation && (
                                                        <p className="text-xs text-themed-muted flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> Bin: {o.binLocation}
                                                        </p>
                                                    )}
                                                    {o.notes && (
                                                        <p className="text-xs text-themed-muted italic">📝 {o.notes}</p>
                                                    )}

                                                    {/* Measurements for this garment type */}
                                                    {config && Object.values(garmentMeasurements).some((v) => v > 0) && (
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-themed-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                                                                <Ruler className="h-3 w-3 text-gold-400" />
                                                                {t(`garment.${o.garmentType}`) || o.garmentType} Measurements
                                                            </p>
                                                            <div className="flex flex-col sm:flex-row gap-3 rounded-lg p-3" style={{ background: "var(--hover-bg)", border: "1px solid var(--glass-border)" }}>
                                                                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                                                                    {config.map((field) => {
                                                                        const val = garmentMeasurements[field.id];
                                                                        return (
                                                                            <div key={field.id} className="flex items-baseline justify-between">
                                                                                <span className="text-[11px] text-themed-muted">
                                                                                    {t(field.labelKey) || field.id}
                                                                                </span>
                                                                                <span className={`text-xs font-semibold ml-2 ${val && val > 0 ? "text-themed-primary" : "text-themed-muted"}`}>
                                                                                    {val && val > 0 ? `${val}"` : "—"}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="w-full sm:w-28 shrink-0">
                                                                    <MeasurementVisualizer
                                                                        garmentType={o.garmentType as import("@/lib/measurements").GarmentType}
                                                                        measurements={garmentMeasurements}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Edit button */}
                                                    <button
                                                        onClick={() => onEditOrder(o)}
                                                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-gold-400 hover:bg-gold-400/10 transition-colors"
                                                        style={{ border: "1px solid rgba(212,175,55,0.2)" }}
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" /> Edit Order
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
