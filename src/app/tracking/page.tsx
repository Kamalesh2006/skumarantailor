"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import { OrderData, getOrdersByPhone, incrementUserQueryCount } from "@/lib/firestore";
import LogoLoading from "@/components/LogoLoading";
import {
    PackageSearch,
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
    { key: "Pending", icon: Package, color: "gold" },
    { key: "Cutting", icon: Scissors, color: "brown" },
    { key: "Stitching", icon: Circle, color: "charcoal" },
    { key: "Alteration", icon: Clock, color: "brown" },
    { key: "Ready", icon: CheckCircle2, color: "gold" },
    { key: "Delivered", icon: Truck, color: "charcoal" },
];

function TrackingPageContent() {
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
            await incrementUserQueryCount(phone, "Tracker", "Checked via website tracker");
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
        }
    }, [loadData, searchParams]);

    // Get status index for stepper
    const getStatusIndex = (status: string) => {
        return STATUS_KEYS.findIndex((s) => s.key === status);
    };

    const statusLabel = (key: string) => t(`status.${key}`) || key;

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border-color)" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(212,175,55,0.06), transparent, rgba(139,90,43,0.03))" }} />
                <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl brand-gradient shadow-lg">
                            <PackageSearch className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-serif font-bold tracking-tight text-themed-primary leading-tight">{t("track.title")}</h1>
                            <p className="text-sm text-themed-secondary mt-1">{t("track.subtitle")}</p>
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
                            className="btn-primary min-w-[140px] flex justify-center items-center"
                            disabled={!phoneQuery.trim() || searching}
                        >
                            {searching ? <LogoLoading size={20} /> : "Find Orders"}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </div>

                {searching ? (
                    <div className="flex items-center justify-center py-24">
                        <LogoLoading size={48} />
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
                                                <div className="flex items-center gap-x-4 gap-y-2 mt-2 text-xs text-themed-muted flex-wrap">
                                                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {t("common.due")}: {order.targetDeliveryDate}</span>
                                                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> ₹{order.basePrice + (order.rushFee || 0)}</span>
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
                                                {/* Progress line — gold */}
                                                <div
                                                    className="absolute top-4 left-[8%] h-0.5 transition-all duration-700"
                                                    style={{ width: `${statusIdx > 0 ? (statusIdx / (STATUS_KEYS.length - 1)) * 84 : 0}%`, background: "#D4AF37" }}
                                                />

                                                {STATUS_KEYS.map((step, i) => {
                                                    const isComplete = i <= statusIdx;
                                                    const isCurrent = i === statusIdx;
                                                    return (
                                                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                                                            <div
                                                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${isComplete
                                                                    ? "border-gold-400 bg-gold-400 text-white"
                                                                    : "text-themed-muted"
                                                                    } ${isCurrent ? "ring-4 ring-gold-400/20" : ""}`}
                                                                style={!isComplete ? { borderColor: "var(--border-color)", background: "var(--bg-secondary)" } : {}}
                                                            >
                                                                <step.icon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className={`text-[10px] sm:text-xs font-medium text-center whitespace-normal leading-tight mt-1 ${isComplete ? "text-themed-primary" : "text-themed-muted"}`}>
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
                                                                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${isComplete ? "border-gold-400 bg-gold-400 text-white" : "text-themed-muted"
                                                                    } ${isCurrent ? "ring-4 ring-gold-400/20" : ""}`}
                                                                style={!isComplete ? { borderColor: "var(--border-color)", background: "var(--bg-secondary)" } : {}}
                                                            >
                                                                <step.icon className="h-3 w-3" />
                                                            </div>
                                                            {i < STATUS_KEYS.length - 1 && (
                                                                <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-2 ${isComplete ? "bg-gold-400" : ""}`} style={!isComplete ? { background: "var(--border-color)" } : {}} />
                                                            )}
                                                        </div>
                                                        <span className={`text-sm font-medium ${isComplete ? "text-themed-primary" : "text-themed-muted"}`}>
                                                            {statusLabel(step.key)}
                                                        </span>
                                                        {isCurrent && (
                                                            <ChevronRight className="h-4 w-4 text-gold-400 animate-pulse ml-auto" />
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
                <LogoLoading size={48} />
            </div>
        }>
            <TrackingPageContent />
        </Suspense>
    );
}
