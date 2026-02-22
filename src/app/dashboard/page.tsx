"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import {
    getOrders,
    searchOrdersPaginated,
    searchOrdersCursor,
    getUsers,
    getSettings,
    updateOrder,
    updateUser,
    updateSettings,
    createOrder,
    OrderData,
    UserData,
    SettingsData,
    ORDER_STATUSES,
    OrderStatus,
    OrderSearchFilters,
} from "@/lib/firestore";
import {
    LayoutDashboard,
    PackageSearch,
    Users,
    Settings,
    Loader2,
    ArrowRight,
    Save,
    X,
    Edit3,
    Plus,
    ChevronDown,
    MapPin,
    Phone,
    Ruler,
    TrendingUp,
    Clock,
    AlertTriangle,
    Search,
    Calendar,
    Filter,
    XCircle,
    LayoutList,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type Tab = "overview" | "orders" | "customers" | "settings";
type ViewMode = "list" | "grid";

export default function DashboardPage() {
    const { user, role, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("overview");
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [settings, setSettingsState] = useState<SettingsData | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // View mode: list (paginated) vs grid (lazy load)
    const [viewMode, setViewMode] = useState<ViewMode>("list");

    // List view pagination state
    const [listOrders, setListOrders] = useState<OrderData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const PAGE_SIZE = 5;

    // Grid view lazy-load state
    const [gridOrders, setGridOrders] = useState<OrderData[]>([]);
    const [gridCursor, setGridCursor] = useState<number | null>(0);
    const [gridHasMore, setGridHasMore] = useState(true);
    const [gridLoading, setGridLoading] = useState(false);
    const BATCH_SIZE = 6;

    // Modals
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [capacityInput, setCapacityInput] = useState("");
    const [savingCapacity, setSavingCapacity] = useState(false);

    // New order form
    const [newOrder, setNewOrder] = useState({
        customerPhone: "",
        customerName: "",
        garmentType: "",
        basePrice: 0,
        targetDays: 10,
        notes: "",
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.replace("/login");
            else if (role !== "admin") router.replace("/tracking");
        }
    }, [user, role, authLoading, router]);

    const loadData = useCallback(async () => {
        setDataLoading(true);
        const [o, u, s] = await Promise.all([getOrders(), getUsers(), getSettings()]);
        setOrders(o);
        setUsers(u.filter((u) => u.role === "customer"));
        setSettingsState(s);
        setCapacityInput(String(s.dailyStitchCapacity));
        setDataLoading(false);
    }, []);

    // Debounce search query — waits 500ms after user stops typing
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    const currentFilters: OrderSearchFilters = {
        query: debouncedQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: (statusFilter as OrderStatus) || undefined,
    };

    // List view: fetch paginated results
    const fetchListPage = useCallback(async (page: number) => {
        setSearching(true);
        const result = await searchOrdersPaginated(currentFilters, page, PAGE_SIZE);
        setListOrders(result.items);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalOrders(result.total);
        setSearching(false);
    }, [debouncedQuery, dateFrom, dateTo, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    // Grid view: fetch initial batch
    const fetchGridInitial = useCallback(async () => {
        setSearching(true);
        const result = await searchOrdersCursor(currentFilters, 0, BATCH_SIZE);
        setGridOrders(result.items);
        setGridCursor(result.nextCursor);
        setGridHasMore(result.hasMore);
        setTotalOrders(result.total);
        setSearching(false);
    }, [debouncedQuery, dateFrom, dateTo, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    // Grid view: load more
    const loadMoreGrid = async () => {
        if (gridCursor === null || gridLoading) return;
        setGridLoading(true);
        const result = await searchOrdersCursor(currentFilters, gridCursor, BATCH_SIZE);
        setGridOrders(prev => [...prev, ...result.items]);
        setGridCursor(result.nextCursor);
        setGridHasMore(result.hasMore);
        setGridLoading(false);
    };

    // Trigger API on filter change
    useEffect(() => {
        if (dataLoading) return;
        if (viewMode === "list") {
            fetchListPage(1);
        } else {
            fetchGridInitial();
        }
    }, [debouncedQuery, dateFrom, dateTo, statusFilter, viewMode, dataLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    const hasActiveFilters = debouncedQuery || dateFrom || dateTo || statusFilter;
    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedQuery("");
        setDateFrom("");
        setDateTo("");
        setStatusFilter("");
        setCurrentPage(1);
    };

    const displayedOrders = viewMode === "list" ? listOrders : gridOrders;

    useEffect(() => {
        if (user && role === "admin") loadData();
    }, [user, role, loadData]);

    if (authLoading || !user || role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    // ─── Stats ───
    const activeOrders = orders.filter((o) => o.status !== "Delivered").length;
    const readyOrders = orders.filter((o) => o.status === "Ready").length;
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;
    const todayKey = new Date().toISOString().split("T")[0];
    const todayLoad = settings?.currentLoad[todayKey] || 0;
    const capacity = settings?.dailyStitchCapacity || 50;

    const stats = [
        { label: t("dash.stat.activeOrders"), value: activeOrders, icon: PackageSearch, color: "text-sky-500", bg: "bg-sky-500/10" },
        { label: t("dash.stat.todayLoad"), value: `${todayLoad}/${capacity}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: t("dash.stat.readyPickup"), value: readyOrders, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: t("dash.stat.pendingApproval"), value: pendingOrders, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    ];

    const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
        { key: "overview", label: t("dash.tab.overview"), icon: LayoutDashboard },
        { key: "orders", label: t("dash.tab.orders"), icon: PackageSearch },
        { key: "customers", label: t("dash.tab.customers"), icon: Users },
        { key: "settings", label: t("dash.tab.settings"), icon: Settings },
    ];

    // ─── Order Status Update ───
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateOrder(orderId, { status: newStatus });
        loadData();
    };

    const handleBinUpdate = async (orderId: string, bin: string) => {
        await updateOrder(orderId, { binLocation: bin });
        loadData();
    };

    // ─── Save Capacity ───
    const handleSaveCapacity = async () => {
        const val = parseInt(capacityInput);
        if (isNaN(val) || val < 1) return;
        setSavingCapacity(true);
        await updateSettings({ dailyStitchCapacity: val });
        await loadData();
        setSavingCapacity(false);
    };

    // ─── Save User ───
    const handleSaveUser = async () => {
        if (!editingUser) return;
        await updateUser(editingUser.uid, editingUser);
        setEditingUser(null);
        loadData();
    };

    // ─── Create Order ───
    const handleCreateOrder = async () => {
        const today = new Date();
        const target = new Date(today);
        target.setDate(target.getDate() + newOrder.targetDays);

        await createOrder({
            customerPhone: newOrder.customerPhone.startsWith("+") ? newOrder.customerPhone : `+91${newOrder.customerPhone}`,
            customerName: newOrder.customerName,
            status: "Pending",
            binLocation: "",
            submissionDate: today.toISOString().split("T")[0],
            targetDeliveryDate: target.toISOString().split("T")[0],
            basePrice: newOrder.basePrice,
            rushFee: 0,
            isApprovedRushed: false,
            garmentType: newOrder.garmentType,
            notes: newOrder.notes,
        });

        setShowNewOrder(false);
        setNewOrder({ customerPhone: "", customerName: "", garmentType: "", basePrice: 0, targetDays: 10, notes: "" });
        loadData();
    };

    const statusColor = (s: string) => {
        const map: Record<string, string> = {
            Pending: "bg-yellow-500/15 text-yellow-500",
            Cutting: "bg-blue-500/15 text-blue-500",
            Stitching: "bg-purple-500/15 text-purple-500",
            Alteration: "bg-orange-500/15 text-orange-500",
            Ready: "bg-emerald-500/15 text-emerald-500",
            Delivered: "bg-gray-500/15 text-gray-400",
        };
        return map[s] || "bg-gray-500/15 text-gray-400";
    };

    const statusLabel = (s: string) => t(`status.${s}`) || s;

    const measurementLabel = (key: string) => t(`measure.${key}`) || key;

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border-color)" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 via-transparent to-sky-500/5" />
                <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl brand-gradient shadow-lg shadow-sky-500/20">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-themed-primary">{t("dash.title")}</h1>
                            <p className="text-sm text-themed-secondary">{t("dash.subtitle")}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-1 overflow-x-auto">
                        {tabs.map((tb) => (
                            <button
                                key={tb.key}
                                onClick={() => setTab(tb.key)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${tab === tb.key ? "bg-sky-500/10 text-sky-500" : "text-themed-secondary"
                                    }`}
                                style={tab !== tb.key ? { background: "transparent" } : {}}
                            >
                                <tb.icon className="h-4 w-4" />
                                {tb.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6">
                {dataLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ━━━ OVERVIEW TAB ━━━ */}
                        {tab === "overview" && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {stats.map((s) => (
                                        <div key={s.label} className="glass-card p-5">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} mb-3`}>
                                                <s.icon className={`h-5 w-5 ${s.color}`} />
                                            </div>
                                            <p className="text-2xl font-bold text-themed-primary">{s.value}</p>
                                            <p className="text-sm text-themed-secondary mt-1">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Capacity Bar */}
                                {settings && (
                                    <div className="glass-card p-5">
                                        <h3 className="font-semibold text-themed-primary mb-3">{t("dash.todayCapacity")}</h3>
                                        <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                                            <div
                                                className="h-full rounded-full brand-gradient transition-all duration-700"
                                                style={{ width: `${Math.min((todayLoad / capacity) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-themed-secondary mt-2">{todayLoad} {t("dash.ordersOf")} {capacity} {t("dash.ordersText")} ({Math.round((todayLoad / capacity) * 100)}%)</p>
                                    </div>
                                )}

                                {/* Recent Orders */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-themed-primary">{t("dash.recentOrders")}</h3>
                                        <button onClick={() => setTab("orders")} className="text-sm text-sky-500 flex items-center gap-1 hover:text-sky-400">
                                            {t("dash.viewAll")} <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {orders.slice(0, 5).map((o) => (
                                            <div key={o.orderId} className="glass-card p-4 flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm font-medium text-themed-primary">{o.orderId}</span>
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                                                    </div>
                                                    <p className="text-xs text-themed-secondary mt-0.5 truncate">{o.customerName} — {o.garmentType}</p>
                                                </div>
                                                {o.binLocation && (
                                                    <span className="flex items-center gap-1 text-xs text-themed-muted"><MapPin className="h-3 w-3" />{o.binLocation}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ━━━ ORDERS TAB ━━━ */}
                        {tab === "orders" && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <h3 className="font-semibold text-themed-primary">{t("dash.allOrders")} ({orders.length})</h3>
                                    <div className="flex items-center gap-2">
                                        {/* View Mode Toggle */}
                                        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                style={viewMode !== "list" ? { background: "var(--bg-secondary)" } : {}}
                                            >
                                                <LayoutList className="h-3.5 w-3.5" /> {t("dash.listView")}
                                            </button>
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "grid" ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                style={viewMode !== "grid" ? { background: "var(--bg-secondary)" } : {}}
                                            >
                                                <LayoutGrid className="h-3.5 w-3.5" /> {t("dash.gridView")}
                                            </button>
                                        </div>
                                        <button onClick={() => setShowNewOrder(true)} className="btn-primary text-sm !py-2 !px-4">
                                            <Plus className="h-4 w-4" /> {t("dash.newOrder")}
                                        </button>
                                    </div>
                                </div>

                                {/* Search & Filters */}
                                <div className="glass-card p-4 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={t("dash.searchPlaceholder")}
                                            className="form-input pl-10 text-sm"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary">
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-themed-muted flex-shrink-0" />
                                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                                                className="rounded-lg px-2.5 py-1.5 text-xs text-themed-primary"
                                                style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }}
                                                title={t("dash.dateFrom")} />
                                            <span className="text-xs text-themed-muted">–</span>
                                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                                                className="rounded-lg px-2.5 py-1.5 text-xs text-themed-primary"
                                                style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }}
                                                title={t("dash.dateTo")} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4 text-themed-muted flex-shrink-0" />
                                            <div className="relative">
                                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
                                                    className="appearance-none rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium cursor-pointer"
                                                    style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}>
                                                    <option value="">{t("dash.allStatuses")}</option>
                                                    {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-themed-muted pointer-events-none" />
                                            </div>
                                        </div>

                                        {hasActiveFilters && (
                                            <button onClick={clearFilters} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                                                <XCircle className="h-3.5 w-3.5" /> {t("dash.clearFilters")}
                                            </button>
                                        )}

                                        <span className="text-xs text-themed-muted ml-auto">
                                            {t("dash.showing")} {displayedOrders.length} {t("dash.of")} {totalOrders}
                                        </span>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {searching && (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                                    </div>
                                )}

                                {/* Empty State */}
                                {!searching && displayedOrders.length === 0 && (
                                    <div className="glass-card p-8 text-center">
                                        <Search className="h-10 w-10 mx-auto mb-3 text-themed-muted" />
                                        <p className="text-sm font-medium text-themed-primary">{t("dash.noResults")}</p>
                                        <p className="text-xs text-themed-secondary mt-1">{t("dash.noResultsHint")}</p>
                                        {hasActiveFilters && <button onClick={clearFilters} className="mt-3 text-xs text-sky-500 hover:text-sky-400">{t("dash.clearFilters")}</button>}
                                    </div>
                                )}

                                {/* ── LIST VIEW (paginated) ── */}
                                {!searching && viewMode === "list" && displayedOrders.length > 0 && (
                                    <>
                                        <div className="space-y-3">
                                            {displayedOrders.map((o) => (
                                                <div key={o.orderId} className="glass-card p-4 sm:p-5">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-mono text-sm font-bold text-themed-primary">{o.orderId}</span>
                                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                                                                {o.isApprovedRushed && <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400">{t("common.rush")}</span>}
                                                            </div>
                                                            <p className="text-sm text-themed-secondary mt-1">{o.customerName} — {o.garmentType}</p>
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-themed-muted">
                                                                <span>₹{o.basePrice + o.rushFee}</span>
                                                                <span>{t("common.due")}: {o.targetDeliveryDate}</span>
                                                                {o.binLocation && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{o.binLocation}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <div className="relative">
                                                                <select value={o.status} onChange={(e) => handleStatusChange(o.orderId, e.target.value as OrderStatus)}
                                                                    className="appearance-none rounded-lg pl-3 pr-8 py-2 text-xs font-medium cursor-pointer"
                                                                    style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}>
                                                                    {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                                                                </select>
                                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-themed-muted pointer-events-none" />
                                                            </div>
                                                            <input type="text" placeholder={t("dash.binPlaceholder")} value={o.binLocation}
                                                                onChange={(e) => handleBinUpdate(o.orderId, e.target.value)}
                                                                className="w-20 rounded-lg px-2 py-2 text-xs text-themed-primary"
                                                                style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-2">
                                                <button
                                                    onClick={() => fetchListPage(currentPage - 1)}
                                                    disabled={currentPage <= 1}
                                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                                >
                                                    <ChevronLeft className="h-3.5 w-3.5" /> {t("dash.prev")}
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                                        <button
                                                            key={p}
                                                            onClick={() => fetchListPage(p)}
                                                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${p === currentPage ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                            style={p !== currentPage ? { background: "var(--bg-secondary)" } : {}}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => fetchListPage(currentPage + 1)}
                                                    disabled={currentPage >= totalPages}
                                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                                >
                                                    {t("dash.next")} <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── GRID VIEW (lazy load) ── */}
                                {!searching && viewMode === "grid" && displayedOrders.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {displayedOrders.map((o) => (
                                                <div key={o.orderId} className="glass-card p-5 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-sm font-bold text-themed-primary">{o.orderId}</span>
                                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-themed-primary">{o.customerName}</p>
                                                        <p className="text-xs text-themed-secondary mt-0.5">{o.garmentType}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-themed-muted pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                                        <span className="font-semibold text-themed-primary">₹{o.basePrice + o.rushFee}</span>
                                                        <span>{t("common.due")}: {o.targetDeliveryDate}</span>
                                                    </div>
                                                    {o.binLocation && (
                                                        <span className="flex items-center gap-1 text-xs text-themed-muted"><MapPin className="h-3 w-3" />{o.binLocation}</span>
                                                    )}
                                                    {o.isApprovedRushed && <span className="self-start rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400">{t("common.rush")}</span>}
                                                    <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                                        <div className="relative flex-1">
                                                            <select value={o.status} onChange={(e) => handleStatusChange(o.orderId, e.target.value as OrderStatus)}
                                                                className="w-full appearance-none rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium cursor-pointer"
                                                                style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}>
                                                                {ORDER_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel(s)}</option>))}
                                                            </select>
                                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-themed-muted pointer-events-none" />
                                                        </div>
                                                        <input type="text" placeholder={t("dash.binPlaceholder")} value={o.binLocation}
                                                            onChange={(e) => handleBinUpdate(o.orderId, e.target.value)}
                                                            className="w-16 rounded-lg px-2 py-1.5 text-xs text-themed-primary"
                                                            style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Load More Button */}
                                        <div className="flex justify-center pt-2">
                                            {gridHasMore ? (
                                                <button
                                                    onClick={loadMoreGrid}
                                                    disabled={gridLoading}
                                                    className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                                >
                                                    {gridLoading ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin" /> {t("dash.loadingMore")}</>
                                                    ) : (
                                                        <>{t("dash.loadMore")} ({displayedOrders.length}/{totalOrders})</>
                                                    )}
                                                </button>
                                            ) : (
                                                <p className="text-xs text-themed-muted">{t("dash.allLoaded")}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* New Order Modal */}
                                {showNewOrder && (
                                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                                        <div className="glass-card p-6 w-full max-w-lg animate-slide-up" style={{ background: "var(--bg-secondary)" }}>
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-lg font-semibold text-themed-primary">{t("dash.createOrder")}</h3>
                                                <button onClick={() => setShowNewOrder(false)} className="text-themed-muted hover:text-themed-primary"><X className="h-5 w-5" /></button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.customerPhone")}</label>
                                                        <input value={newOrder.customerPhone} onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })} className="form-input text-sm" placeholder="9876543210" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.customerName")}</label>
                                                        <input value={newOrder.customerName} onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })} className="form-input text-sm" placeholder={t("dash.namePlaceholder")} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.garmentType")}</label>
                                                        <input value={newOrder.garmentType} onChange={(e) => setNewOrder({ ...newOrder, garmentType: e.target.value })} className="form-input text-sm" placeholder={t("dash.garmentPlaceholder")} />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.basePrice")}</label>
                                                        <input type="number" value={newOrder.basePrice || ""} onChange={(e) => setNewOrder({ ...newOrder, basePrice: Number(e.target.value) })} className="form-input text-sm" placeholder="2500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.deliveryIn")} {newOrder.targetDays} {t("dash.days")}</label>
                                                    <input type="range" min={1} max={20} value={newOrder.targetDays} onChange={(e) => setNewOrder({ ...newOrder, targetDays: Number(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.notes")}</label>
                                                    <input value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} className="form-input text-sm" placeholder={t("dash.detailsPlaceholder")} />
                                                </div>
                                                <button onClick={handleCreateOrder} className="btn-primary w-full" disabled={!newOrder.customerPhone || !newOrder.customerName || !newOrder.garmentType}>
                                                    <Plus className="h-4 w-4" /> {t("dash.createOrderBtn")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ━━━ CUSTOMERS TAB ━━━ */}
                        {tab === "customers" && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="font-semibold text-themed-primary">{t("dash.customers")} ({users.length})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {users.map((u) => (
                                        <div key={u.uid} className="glass-card p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-themed-primary">{u.name || t("dash.unnamed")}</h4>
                                                    <p className="text-sm text-themed-secondary flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{u.phoneNumber}</p>
                                                </div>
                                                <button onClick={() => setEditingUser({ ...u })} className="p-2 rounded-lg text-themed-muted hover:text-sky-500 transition-colors" style={{ background: "var(--hover-bg)" }}>
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Measurements */}
                                            {Object.keys(u.measurements).length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {Object.entries(u.measurements).map(([key, val]) => (
                                                        <span key={key} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{ background: "var(--hover-bg)" }}>
                                                            <Ruler className="h-3 w-3 text-sky-500" />
                                                            <span className="text-themed-secondary capitalize">{measurementLabel(key)}:</span>
                                                            <span className="font-medium text-themed-primary">{val}&quot;</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Customer orders count */}
                                            <p className="text-xs text-themed-muted mt-3">
                                                {orders.filter((o) => o.customerPhone === u.phoneNumber).length} {t("dash.orderCount")}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Edit User Modal */}
                                {editingUser && (
                                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                                        <div className="glass-card p-6 w-full max-w-lg animate-slide-up" style={{ background: "var(--bg-secondary)" }}>
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-lg font-semibold text-themed-primary">{t("dash.editCustomer")}</h3>
                                                <button onClick={() => setEditingUser(null)} className="text-themed-muted hover:text-themed-primary"><X className="h-5 w-5" /></button>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-medium text-themed-secondary mb-1 block">{t("dash.name")}</label>
                                                    <input value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="form-input text-sm" />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-themed-secondary mb-2 block">{t("dash.measurements")}</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {["chest", "waist", "shoulder", "sleeve", "inseam", "neck"].map((m) => (
                                                            <div key={m} className="flex items-center gap-2">
                                                                <label className="text-xs text-themed-secondary capitalize w-16">{measurementLabel(m)}</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={editingUser.measurements[m] || ""}
                                                                    onChange={(e) => setEditingUser({
                                                                        ...editingUser,
                                                                        measurements: { ...editingUser.measurements, [m]: Number(e.target.value) },
                                                                    })}
                                                                    className="form-input text-sm flex-1"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button onClick={handleSaveUser} className="btn-primary w-full">
                                                    <Save className="h-4 w-4" /> {t("dash.saveChanges")}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ━━━ SETTINGS TAB ━━━ */}
                        {tab === "settings" && settings && (
                            <div className="max-w-md space-y-6 animate-fade-in">
                                <div className="glass-card p-6">
                                    <h3 className="font-semibold text-themed-primary mb-4 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-sky-500" /> {t("dash.capacitySettings")}
                                    </h3>
                                    <div>
                                        <label className="text-sm font-medium text-themed-secondary mb-2 block">{t("dash.dailyStitchCapacity")}</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                value={capacityInput}
                                                onChange={(e) => setCapacityInput(e.target.value)}
                                                className="form-input text-sm flex-1"
                                                min="1"
                                            />
                                            <button onClick={handleSaveCapacity} disabled={savingCapacity} className="btn-primary !px-4 text-sm">
                                                {savingCapacity ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {t("common.save")}</>}
                                            </button>
                                        </div>
                                        <p className="text-xs text-themed-muted mt-2">{t("dash.maxOrders")}</p>
                                    </div>
                                </div>

                                {/* 7-day capacity overview */}
                                <div className="glass-card p-6">
                                    <h3 className="font-semibold text-themed-primary mb-4">{t("dash.7dayCapacity")}</h3>
                                    <div className="space-y-3">
                                        {Array.from({ length: 7 }, (_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + i);
                                            const key = d.toISOString().split("T")[0];
                                            const load = settings.currentLoad[key] || 0;
                                            const pct = Math.min((load / capacity) * 100, 100);
                                            const isFull = load >= capacity;
                                            return (
                                                <div key={key}>
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-themed-secondary">{d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}</span>
                                                        <span className={isFull ? "text-red-400 font-medium" : "text-themed-muted"}>{load}/{capacity}</span>
                                                    </div>
                                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-red-500" : "bg-sky-500"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
