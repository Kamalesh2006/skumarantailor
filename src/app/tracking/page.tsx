"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { OrderData, getOrdersByPhone } from "@/lib/firestore";
import {
    PackageSearch,
    Loader2,
    Scissors,
    CheckCircle2,
    Circle,
    Clock,
    Truck,
    Package,
    MapPin,
    CalendarDays,
    IndianRupee,
    Zap,
    ChevronRight,
} from "lucide-react";

const STATUS_KEYS = [
    { key: "Pending", icon: Package, color: "sky" },
    { key: "Cutting", icon: Scissors, color: "blue" },
    { key: "Stitching", icon: Circle, color: "purple" },
    { key: "Alteration", icon: Clock, color: "orange" },
    { key: "Ready", icon: CheckCircle2, color: "emerald" },
    { key: "Delivered", icon: Truck, color: "gray" },
];

function TrackingPageContent() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [phoneQuery, setPhoneQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const loadData = useCallback(async (phone: string) => {
        if (!phone) return;
        setSearching(true);
        setError("");
        try {
            const data = await getOrdersByPhone(phone);
            setOrders(data || []);
            setHasSearched(true);
        } catch (err) {
            console.error(err);

            setError("Could not find orders. Please check the number and try again.");
        } finally {
            setSearching(false);
        }
    }, []);

    const searchParams = useSearchParams();

    useEffect(() => {
        // Check for ?phone= query param (from monitoring tab View button)
        const phoneParam = searchParams.get("phone");
        if (phoneParam) {
            const clean = phoneParam.startsWith("+") ? phoneParam : `+91${phoneParam}`;
            setPhoneQuery(clean);
            loadData(clean);
        } else if (user?.email) {
            // If admin is logged in, extract phone from email (e.g. 919876543210@...)
            const match = user.email.match(/^91(\d+)@/);
            if (match) {
                const phone = `+91${match[1]}`;
                setPhoneQuery(phone);
                loadData(phone);
            }
        }
    }, [user, loadData, searchParams]);

    // Get status index for stepper
    const getStatusIndex = (status: string) => {
        return STATUS_KEYS.findIndex((s) => s.key === status);
    };

    const statusLabel = (key: string) => t(`status.${key}`) || key;

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border-color)" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 via-transparent to-sky-500/5" />
                <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient shadow-lg shadow-sky-500/20">
                            <PackageSearch className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-themed-primary">{t("track.title")}</h1>
                            <p className="text-sm text-themed-secondary">{t("track.subtitle")}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6">
                {/* Search Bar for Public Tracking */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-themed-primary mb-3">Track Your Current Orders</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="tel"
                            placeholder="Enter your registered phone number (e.g. +91...)"
                            value={phoneQuery}
                            onChange={(e) => setPhoneQuery(e.target.value)}
                            className="form-input flex-1"
                        />
                        <button
                            onClick={async () => {
                                await loadData(phoneQuery);
                            }}
                            className="btn-primary"
                            disabled={!phoneQuery.trim() || searching}
                        >
                            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find Orders"}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>

                {searching ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                    </div>
                ) : hasSearched && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Orders List */}
                        {orders.length === 0 ? (
                            <div className="glass-card p-10 text-center">
                                <PackageSearch className="h-16 w-16 mx-auto mb-4 text-themed-muted" />
                                <h2 className="text-xl font-semibold text-themed-primary mb-2">{t("track.noOrders")}</h2>
                                <p className="text-themed-secondary text-sm max-w-md mx-auto mb-4">
                                    {t("track.noOrdersHint")}
                                </p>
                            </div>
                        ) : (
                            orders.map((order) => {
                                const statusIdx = getStatusIndex(order.status);
                                return (
                                    <div key={order.orderId} className="glass-card p-5 sm:p-6">
                                        {/* Order header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono text-sm font-bold text-themed-primary">{order.orderId}</span>
                                                    <span className="text-sm text-themed-secondary">— {t(`garment.${order.garmentType}`) || order.garmentType}</span>
                                                    {order.isApprovedRushed && (
                                                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400 flex items-center gap-1">
                                                            <Zap className="h-3 w-3" /> {t("common.rush")}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-themed-muted">
                                                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {t("common.due")}: {order.targetDeliveryDate}</span>
                                                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> ₹{order.basePrice + order.rushFee}</span>
                                                    {order.binLocation && (
                                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {order.binLocation}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Stepper — Desktop */}
                                        <div className="hidden sm:block">
                                            <div className="relative flex items-center justify-between">
                                                {/* Background line */}
                                                <div className="absolute top-4 left-[8%] right-[8%] h-0.5" style={{ background: "var(--bg-tertiary)" }} />
                                                {/* Progress line */}
                                                <div
                                                    className="absolute top-4 left-[8%] h-0.5 bg-sky-500 transition-all duration-700"
                                                    style={{ width: `${statusIdx > 0 ? (statusIdx / (STATUS_KEYS.length - 1)) * 84 : 0}%` }}
                                                />

                                                {STATUS_KEYS.map((step, i) => {
                                                    const isComplete = i <= statusIdx;
                                                    const isCurrent = i === statusIdx;
                                                    return (
                                                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${isComplete
                                                                    ? "border-sky-500 bg-sky-500 text-white"
                                                                    : "text-themed-muted"
                                                                    } ${isCurrent ? "ring-4 ring-sky-500/20" : ""}`}
                                                                style={!isComplete ? { borderColor: "var(--border-color)", background: "var(--bg-secondary)" } : {}}
                                                            >
                                                                <step.icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className={`text-xs font-medium ${isComplete ? "text-themed-primary" : "text-themed-muted"}`}>
                                                                {statusLabel(step.key)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Status Stepper — Mobile */}
                                        <div className="sm:hidden space-y-2">
                                            {STATUS_KEYS.map((step, i) => {
                                                const isComplete = i <= statusIdx;
                                                const isCurrent = i === statusIdx;
                                                return (
                                                    <div key={step.key} className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div
                                                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${isComplete ? "border-sky-500 bg-sky-500 text-white" : "text-themed-muted"
                                                                    } ${isCurrent ? "ring-4 ring-sky-500/20" : ""}`}
                                                                style={!isComplete ? { borderColor: "var(--border-color)", background: "var(--bg-secondary)" } : {}}
                                                            >
                                                                <step.icon className="h-3 w-3" />
                                                            </div>
                                                            {i < STATUS_KEYS.length - 1 && (
                                                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 ${isComplete ? "bg-sky-500" : ""}`} style={!isComplete ? { background: "var(--border-color)" } : {}} />
                                                            )}
                                                        </div>
                                                        <span className={`text-sm font-medium ${isComplete ? "text-themed-primary" : "text-themed-muted"}`}>
                                                            {statusLabel(step.key)}
                                                        </span>
                                                        {isCurrent && (
                                                            <ChevronRight className="h-4 w-4 text-sky-500 animate-pulse ml-auto" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {order.notes && (
                                            <p className="mt-3 text-xs text-themed-secondary rounded-lg p-2" style={{ background: "var(--hover-bg)" }}>
                                                {order.notes}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
                {!hasSearched && !searching && (
                    <div className="glass-card p-10 text-center text-themed-muted">
                        <PackageSearch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Enter your phone number above to track your garments.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        }>
            <TrackingPageContent />
        </Suspense>
    );
}
