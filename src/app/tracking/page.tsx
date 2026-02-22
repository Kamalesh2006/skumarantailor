"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import {
    getOrdersByPhone,
    getSettings,
    createOrder,
    getCapacityForDate,
    OrderData,
    SettingsData,
} from "@/lib/firestore";
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
    AlertTriangle,
    Plus,
    X,
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

export default function TrackingPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [, setSettingsState] = useState<SettingsData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [showNewOrder, setShowNewOrder] = useState(false);

    // New order state
    const [deliveryDays, setDeliveryDays] = useState(10);
    const [garmentType, setGarmentType] = useState("");
    const [notes, setNotes] = useState("");
    const [basePrice] = useState(2500);
    const [submitting, setSubmitting] = useState(false);
    const [dateCapacity, setDateCapacity] = useState<{ date: string; available: boolean; load: number; capacity: number } | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.replace("/login");
    }, [user, authLoading, router]);

    const loadData = useCallback(async () => {
        if (!user?.phoneNumber) return;
        setDataLoading(true);
        const [o, s] = await Promise.all([
            getOrdersByPhone(user.phoneNumber),
            getSettings(),
        ]);
        setOrders(o);
        setSettingsState(s);
        setDataLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) loadData();
    }, [user, loadData]);

    // Update capacity when delivery days changes
    useEffect(() => {
        const d = new Date();
        d.setDate(d.getDate() + deliveryDays);
        const dateStr = d.toISOString().split("T")[0];
        const cap = getCapacityForDate(dateStr);
        setDateCapacity({ date: dateStr, ...cap });
    }, [deliveryDays]);

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    // Rush fee calculation: 0 at 10 days, max ₹2000 at 1 day
    const rushFee = deliveryDays >= 10 ? 0 : Math.round(((10 - deliveryDays) / 9) * 2000);
    const totalPrice = basePrice + rushFee;
    const isCapacityFull = dateCapacity ? !dateCapacity.available : false;

    const handlePlaceOrder = async () => {
        if (!user.phoneNumber) return;
        setSubmitting(true);
        const today = new Date();
        const target = new Date(today);
        target.setDate(target.getDate() + deliveryDays);

        await createOrder({
            customerPhone: user.phoneNumber,
            customerName: "Customer",
            status: isCapacityFull ? "Pending" : "Pending",
            binLocation: "",
            submissionDate: today.toISOString().split("T")[0],
            targetDeliveryDate: target.toISOString().split("T")[0],
            basePrice,
            rushFee,
            isApprovedRushed: isCapacityFull,
            garmentType,
            notes: isCapacityFull ? `[RUSH REQUEST] ${notes}` : notes,
        });

        setShowNewOrder(false);
        setGarmentType("");
        setNotes("");
        setDeliveryDays(10);
        setSubmitting(false);
        loadData();
    };

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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient shadow-lg shadow-sky-500/20">
                                <PackageSearch className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-themed-primary">{t("track.title")}</h1>
                                <p className="text-sm text-themed-secondary">{t("track.subtitle")}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowNewOrder(true)} className="btn-primary text-sm !py-2 !px-4">
                            <Plus className="h-4 w-4" /> {t("track.newOrder")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6">
                {dataLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {/* Orders List */}
                        {orders.length === 0 ? (
                            <div className="glass-card p-10 text-center">
                                <PackageSearch className="h-16 w-16 mx-auto mb-4 text-themed-muted" />
                                <h2 className="text-xl font-semibold text-themed-primary mb-2">{t("track.noOrders")}</h2>
                                <p className="text-themed-secondary text-sm max-w-md mx-auto mb-4">
                                    {t("track.noOrdersHint")}
                                </p>
                                <button onClick={() => setShowNewOrder(true)} className="btn-primary text-sm">
                                    <Plus className="h-4 w-4" /> {t("track.placeFirst")}
                                </button>
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
                                                    <span className="text-sm text-themed-secondary">— {order.garmentType}</span>
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
            </div>

            {/* ━━━ New Order Modal — with Pricing Slider ━━━ */}
            {showNewOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <div className="glass-card p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto" style={{ background: "var(--bg-secondary)" }}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-themed-primary">{t("track.placeOrder")}</h3>
                            <button onClick={() => setShowNewOrder(false)} className="text-themed-muted hover:text-themed-primary">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Garment */}
                            <div>
                                <label className="text-sm font-medium text-themed-secondary mb-1 block">{t("track.garmentType")}</label>
                                <input
                                    value={garmentType}
                                    onChange={(e) => setGarmentType(e.target.value)}
                                    className="form-input"
                                    placeholder={t("track.garmentPlaceholder")}
                                />
                            </div>

                            {/* Delivery Timeline Slider */}
                            <div>
                                <label className="text-sm font-medium text-themed-secondary mb-2 block">{t("track.deliveryTimeline")}</label>
                                <div className="glass-card p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-bold text-themed-primary">{deliveryDays} {t("track.days")}</span>
                                        <span className={`text-sm font-medium ${deliveryDays <= 3 ? "text-red-400" : deliveryDays <= 6 ? "text-amber-500" : "text-emerald-500"}`}>
                                            {deliveryDays <= 3 ? t("track.express") : deliveryDays <= 6 ? t("track.priority") : t("track.standard")}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={15}
                                        value={deliveryDays}
                                        onChange={(e) => setDeliveryDays(Number(e.target.value))}
                                        className="w-full"
                                        disabled={isCapacityFull}
                                    />
                                    <div className="flex justify-between text-xs text-themed-muted mt-1">
                                        <span>{t("track.dayExpress")}</span>
                                        <span>{t("track.15days")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="glass-card p-4">
                                <h4 className="text-sm font-medium text-themed-secondary mb-3">{t("track.pricing")}</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-themed-secondary">{t("track.basePrice")}</span>
                                        <span className="text-themed-primary">₹{basePrice.toLocaleString()}</span>
                                    </div>
                                    {rushFee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-amber-500 flex items-center gap-1"><Zap className="h-3 w-3" /> {t("track.rushFee")}</span>
                                            <span className="text-amber-500">+₹{rushFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 flex justify-between text-sm font-semibold" style={{ borderColor: "var(--border-color)" }}>
                                        <span className="text-themed-primary">{t("track.total")}</span>
                                        <span className="text-sky-500 text-lg">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Capacity Warning */}
                            {isCapacityFull && (
                                <div className="flex items-start gap-2 rounded-xl p-3 bg-amber-500/10 border border-amber-500/20">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-500">{t("track.capacityFull")} {dateCapacity?.date}</p>
                                        <p className="text-xs text-themed-secondary mt-0.5">
                                            {t("track.rushRequest")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="text-sm font-medium text-themed-secondary mb-1 block">{t("track.notesLabel")}</label>
                                <input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="form-input"
                                    placeholder={t("track.notesPlaceholder")}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={!garmentType || submitting}
                                className="btn-primary w-full"
                            >
                                {submitting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> {t("track.placingOrder")}</>
                                ) : isCapacityFull ? (
                                    <><Zap className="h-4 w-4" /> {t("track.emergencyRush")}</>
                                ) : (
                                    <><Plus className="h-4 w-4" /> {t("track.placeOrderBtn")} — ₹{totalPrice.toLocaleString()}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
