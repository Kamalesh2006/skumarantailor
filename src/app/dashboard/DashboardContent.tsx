"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import {
    getOrders,
    getUsers,
    searchOrdersPaginated,
    searchOrdersCursor,
    searchUsersPaginated,
    searchUsersCursor,
    UserSearchFilters,
    getSettings,
    updateUser,
    updateOrder,
    createUser,
    deleteUser,
    deleteOrder,
    updateSettings,
    OrderData,
    UserData,
    SettingsData,
    ORDER_STATUSES,
    OrderStatus,
    OrderSearchFilters,
} from "@/lib/firestore";
import { GARMENT_TYPES } from "@/lib/measurements";
import {
    LayoutDashboard,
    PackageSearch,
    Users,
    Settings,
    Loader2,
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
    IndianRupee,
    Activity,
    FileText,
    RefreshCw,
    Eye,
    MessageCircle,
    Smartphone,
    Send,
    Trash2,
    ArrowUpRight,
    Scissors,
    CheckCircle2,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

type Tab = "overview" | "orders" | "customers" | "monitoring" | "settings" | "logs";
type ViewMode = "list" | "grid";

import MeasurementForm from "./components/MeasurementForm";
import QuickAddModal from "@/components/QuickAddModal";
import CreateOrderModal from "./components/CreateOrderModal";
import EditOrderModal from "./components/EditOrderModal";
import CustomerDetailModal from "./components/CustomerDetailModal";
import TailorIcon from "@/components/TailorIcon";

export default function DashboardContent({ activeTab = "overview" }: { activeTab?: Tab }) {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();


    const [currentTab, setCurrentTab] = useState<Tab>(activeTab);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);

    // Live clock
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const [settings, setSettingsState] = useState<SettingsData | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [dataLoading, setDataLoading] = useState(true);

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Hydrate search queries from URL safely after mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            const dFrom = params.get("dateFrom");
            const dTo = params.get("dateTo");
            const st = params.get("status") as OrderStatus;

            if (q) {
                setSearchQuery(q);
                setDebouncedQuery(q);
            }
            if (dFrom) setDateFrom(dFrom);
            if (dTo) setDateTo(dTo);
            if (st) setStatusFilter(st);
        }
    }, []);

    // View mode: list (paginated) vs grid (lazy load)
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
    const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);
    const [viewingCustomer, setViewingCustomer] = useState<UserData | null>(null);
    const [capacityInput, setCapacityInput] = useState("");
    const [savingCapacity, setSavingCapacity] = useState(false);
    const [pricingInput, setPricingInput] = useState<Record<string, string>>({});
    const [savingPricing, setSavingPricing] = useState(false);

    // Logs state
    const [fetchingLogs, setFetchingLogs] = useState(false);
    const [logsContent, setLogsContent] = useState("");
    const [showQuickAdd, setShowQuickAdd] = useState(false);

    // Status change notification prompt
    const [statusNotify, setStatusNotify] = useState<{
        show: boolean;
        customerName: string;
        customerPhone: string;
        status: string;
        garmentType: string;
        orderId: string;
    } | null>(null);

    const loadLogs = useCallback(async () => {
        setFetchingLogs(true);
        try {
            const res = await fetch("/api/logs");
            if (res.ok) {
                setLogsContent(await res.text());
            } else {
                setLogsContent("Failed to load logs. Server responded with an error.");
            }
        } catch {
            setLogsContent("Network error while loading logs.");
        } finally {
            setFetchingLogs(false);
        }
    }, []);

    useEffect(() => {
        if (currentTab === "logs") {
            loadLogs();
        } else if (currentTab === "monitoring") {
            // Auto-refresh users when switching to Monitoring tab
            setDataLoading(true);
            getUsers().then(u => {
                setAllUsers(u);
                setDataLoading(false);
            }).catch(err => {
                console.error("Failed to refresh users", err);
                setDataLoading(false);
            });
        }
    }, [currentTab, loadLogs]);

    // (new order state is managed inside CreateOrderModal)

    // View mode for customers
    const [customerViewMode, setCustomerViewMode] = useState<ViewMode>("grid");

    // Customer list pagination state
    const [listCustomers, setListCustomers] = useState<UserData[]>([]);
    const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
    const [customerTotalPages, setCustomerTotalPages] = useState(1);
    const [customerTotal, setCustomerTotal] = useState(0);
    const CUSTOMER_PAGE_SIZE = 5;

    // Customer grid lazy-load state
    const [gridCustomers, setGridCustomers] = useState<UserData[]>([]);
    const [customerGridCursor, setCustomerGridCursor] = useState<number | null>(0);
    const [customerGridHasMore, setCustomerGridHasMore] = useState(true);
    const [customerGridLoading, setCustomerGridLoading] = useState(false);
    const CUSTOMER_BATCH_SIZE = 6;
    const customerDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
    const [customerSortBy, setCustomerSortBy] = useState<"newest" | "oldest" | "nameaz">("newest");

    // Monitoring tab state
    const [monitorSearch, setMonitorSearch] = useState("");
    const [monitorPage, setMonitorPage] = useState(1);
    const [monitorViewMode, setMonitorViewMode] = useState<ViewMode>("grid");
    const [viewingQueriesFor, setViewingQueriesFor] = useState<UserData | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.replace("/login");
            else if (role !== "admin") router.replace("/tracking");
        }
    }, [user, role, authLoading, router]);

    const loadData = useCallback(async () => {
        setDataLoading(true);
        try {
            const [o, s, u] = await Promise.all([getOrders(), getSettings(), getUsers()]);
            setOrders(o);
            setSettingsState(s);
            setAllUsers(u);
            setCapacityInput(String(s.dailyStitchCapacity));
            if (s.garmentPrices) {
                const formatted: Record<string, string> = {};
                Object.entries(s.garmentPrices).forEach(([k, v]) => {
                    formatted[k] = String(v);
                });
                setPricingInput(formatted);
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setDataLoading(false);
        }
    }, []);

    // Debounce orders search query — waits 500ms after user stops typing
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    // Debounce customer search query
    useEffect(() => {
        if (customerDebounceRef.current) clearTimeout(customerDebounceRef.current);
        customerDebounceRef.current = setTimeout(() => {
            setDebouncedCustomerSearch(customerSearch);
        }, 500);
        return () => { if (customerDebounceRef.current) clearTimeout(customerDebounceRef.current); };
    }, [customerSearch]);

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

    // ─── Customer Fetch Routines ───
    const currentCustomerFilters: UserSearchFilters = {
        query: debouncedCustomerSearch || undefined,
        sortBy: customerSortBy,
    };

    const fetchCustomerListPage = useCallback(async (page: number) => {
        setSearching(true);
        const result = await searchUsersPaginated(currentCustomerFilters, page, CUSTOMER_PAGE_SIZE);
        setListCustomers(result.items);
        setCustomerCurrentPage(result.page);
        setCustomerTotalPages(result.totalPages);
        setCustomerTotal(result.total);
        setSearching(false);
    }, [debouncedCustomerSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCustomerGridInitial = useCallback(async () => {
        setSearching(true);
        const result = await searchUsersCursor(currentCustomerFilters, 0, CUSTOMER_BATCH_SIZE);
        setGridCustomers(result.items);
        setCustomerGridCursor(result.nextCursor);
        setCustomerGridHasMore(result.hasMore);
        setCustomerTotal(result.total);
        setSearching(false);
    }, [debouncedCustomerSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadMoreCustomerGrid = async () => {
        if (customerGridCursor === null || customerGridLoading) return;
        setCustomerGridLoading(true);
        const result = await searchUsersCursor(currentCustomerFilters, customerGridCursor, CUSTOMER_BATCH_SIZE);
        setGridCustomers(prev => [...prev, ...result.items]);
        setCustomerGridCursor(result.nextCursor);
        setCustomerGridHasMore(result.hasMore);
        setCustomerGridLoading(false);
    };

    // Trigger API on customer filter change
    useEffect(() => {
        if (dataLoading) return;
        if (customerViewMode === "list") {
            fetchCustomerListPage(1);
        } else {
            fetchCustomerGridInitial();
        }
    }, [debouncedCustomerSearch, customerSortBy, customerViewMode, dataLoading]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const displayedCustomers = customerViewMode === "list" ? listCustomers : gridCustomers;

    useEffect(() => {
        if (user && role === "admin") loadData();
    }, [user, role, loadData]);

    if (authLoading || !user || role !== "admin") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 text-gold-400 animate-spin" />
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
        { label: t("dash.stat.activeOrders"), value: activeOrders, icon: PackageSearch, color: "text-gold-400", bg: "bg-gold-400/10", nav: "/orders" },
        { label: t("dash.stat.todayLoad"), value: `${todayLoad}/${capacity}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", nav: `/orders?dateFrom=${todayKey}&dateTo=${todayKey}` },
        { label: t("dash.stat.readyPickup"), value: readyOrders, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", nav: "/orders?status=Ready" },
        { label: t("dash.stat.pendingApproval"), value: pendingOrders, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", nav: "/orders?status=Pending" },
    ];

    const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
        { key: "overview", label: t("dash.tab.overview"), icon: LayoutDashboard },
        { key: "orders", label: t("dash.tab.orders"), icon: PackageSearch },
        { key: "customers", label: t("dash.tab.customers"), icon: Users },
        { key: "monitoring", label: t("dash.tab.monitoring") || "Monitoring", icon: Activity },
        { key: "settings", label: t("dash.tab.settings"), icon: Settings },
        { key: "logs", label: t("dash.tab.logs") || "Logs", icon: FileText },
    ];

    // ─── Order Status Update ───
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateOrder(orderId, { status: newStatus });
        loadData();

        // Prompt admin to notify customer on Ready or Delivered
        if (newStatus === "Ready" || newStatus === "Delivered") {
            const order = orders.find((o) => o.orderId === orderId);
            if (order) {
                setStatusNotify({
                    show: true,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    status: newStatus,
                    garmentType: order.garmentType,
                    orderId: order.orderId,
                });
            }
        }
    };

    const getStatusNotifyMessage = (name: string, phone: string, status: string, garmentType: string) => {
        const siteUrl = "https://skumarantailors.vercel.app";
        const trackingLink = `${siteUrl}/tracking?phone=${encodeURIComponent(phone)}`;
        const garmentLabel = t(`garment.${garmentType}`) || garmentType;

        if (status === "Ready") {
            return (
                `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors*\n\n` +
                `வணக்கம் ${name}! 🙏\n` +
                `உங்கள் ${garmentLabel} தயாராகிவிட்டது! ✅\n` +
                `தயவுசெய்து எங்கள் கடையில் வந்து பெற்றுக்கொள்ளுங்கள்.\n\n` +
                `Hi ${name},\nYour ${garmentType} is ready for pickup! ✅\n` +
                `Please visit our shop to collect it.\n\n` +
                `📍 ஆர்டர் நிலை / Track: ${trackingLink}\n` +
                `📞 தொடர்புக்கு / Contact: +91 94428 98544\n\n` +
                `நன்றி! Thank you! 🙏`
            );
        } else {
            return (
                `🧵 *எஸ் குமரன் டெய்லர்ஸ் | S Kumaran Tailors*\n\n` +
                `வணக்கம் ${name}! 🙏\n` +
                `உங்கள் ${garmentLabel} வெற்றிகரமாக வழங்கப்பட்டது! 🎉\n` +
                `எங்கள் சேவையைப் பயன்படுத்தியதற்கு நன்றி.\n\n` +
                `Hi ${name},\nYour ${garmentType} has been delivered! 🎉\n` +
                `Thank you for choosing S Kumaran Tailors.\n\n` +
                `📍 ஆர்டர் நிலை / Track: ${trackingLink}\n` +
                `📞 தொடர்புக்கு / Contact: +91 94428 98544\n\n` +
                `நன்றி! Thank you! 🙏`
            );
        }
    };

    const sendStatusWhatsApp = (phone: string, name: string, status: string, garmentType: string) => {
        const clean = phone.replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(getStatusNotifyMessage(name, phone, status, garmentType));
        window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
        setStatusNotify(null);
    };

    const sendStatusSMS = (phone: string, name: string, status: string, garmentType: string) => {
        const msg = encodeURIComponent(getStatusNotifyMessage(name, phone, status, garmentType));
        window.open(`sms:${phone}?body=${msg}`, "_self");
        setStatusNotify(null);
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

    // ─── Save Pricing ───
    const handleSavePricing = async () => {
        setSavingPricing(true);
        const parsedPrices: Record<string, number> = {};
        Object.entries(pricingInput).forEach(([gType, val]) => {
            const num = parseInt(val);
            if (!isNaN(num) && num >= 0) {
                parsedPrices[gType] = num;
            }
        });
        await updateSettings({ garmentPrices: parsedPrices });
        await loadData();
        setSavingPricing(false);
    };

    // ─── Save User ───
    const handleSaveUser = async (uid: string, name: string, phone: string, gender: "male" | "female" | undefined, measurements: Record<string, Record<string, number>>) => {
        if (uid.startsWith("new_")) {
            await createUser({ name, phoneNumber: phone, role: "customer", gender, measurements });
        } else {
            await updateUser(uid, { name, phoneNumber: phone, gender, measurements });
        }
        setEditingUser(null);
        loadData();
    };

    // ─── Delete Customer ───
    const handleDeleteCustomer = async (uid: string, phone: string) => {
        if (!window.confirm("Are you sure you want to delete this customer? This action is irreversible.")) return;

        const confirmDeleteOrders = window.confirm("Do you also want to delete all orders for this customer?");

        try {
            await deleteUser(uid);
            if (confirmDeleteOrders) {
                const customerOrders = orders.filter((o) => o.customerPhone === phone);
                for (const order of customerOrders) {
                    await deleteOrder(order.orderId);
                }
            }
            
            // Reload all data so that the customer list reflects the changes
            loadData();
        } catch (e) {
            console.error(e);
            alert("Error deleting customer");
        }
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

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border-color)" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-transparent to-gold-400/5" />
                <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TailorIcon size={40} />
                            <div>
                                <h1 className="text-xl font-serif font-bold tracking-tight text-themed-primary">{t("dash.title")}</h1>
                                <p className="text-sm text-themed-secondary">{t("dash.subtitle")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Live Date & Time */}
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-semibold text-themed-primary">
                                    {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="text-xs text-themed-muted">
                                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowQuickAdd(true)}
                                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-all duration-200 hover:shadow-lg hover:shadow-gold-400/20 hover:scale-[1.03] active:scale-95"
                                style={{ background: "linear-gradient(135deg, #D4AF37, #8B5A2B, #6f4722)" }}
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">{t("quickAdd.title")}</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-1 overflow-x-auto">
                        {tabs.map((tb) => (
                            <button
                                key={tb.key}
                                onClick={() => {
                                    setCurrentTab(tb.key as Tab);
                                    const url = tb.key === "overview" ? "/dashboard" : `/${tb.key}`;
                                    window.history.replaceState(null, "", url);
                                }}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${currentTab === tb.key ? "bg-gold-400/10 text-gold-400" : "text-themed-secondary"
                                    }`}
                                style={currentTab !== tb.key ? { background: "transparent" } : {}}
                            >
                                <tb.icon className="h-4 w-4" />
                                {tb.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <QuickAddModal
                isOpen={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onOrderCreated={loadData}
            />

            {/* New Order Modal */}
            <CreateOrderModal
                isOpen={showNewOrder}
                onClose={() => setShowNewOrder(false)}
                onOrderCreated={() => { setShowNewOrder(false); loadData(); }}
                allUsers={allUsers}
                garmentPrices={settings?.garmentPrices ?? {}}
            />

            {/* Edit Order Modal */}
            <EditOrderModal
                isOpen={!!editingOrder}
                order={editingOrder}
                onClose={() => setEditingOrder(null)}
                onOrderUpdated={() => { setEditingOrder(null); loadData(); }}
                garmentPrices={settings?.garmentPrices ?? {}}
            />

            <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6">
                {dataLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-gold-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ━━━ OVERVIEW TAB — Today's Tasks ━━━ */}
                        {currentTab === "overview" && (() => {
                            const todayStr = new Date().toISOString().split("T")[0];

                            // STATUS_FLOW for advancing status
                            const STATUS_FLOW: Record<string, string> = {
                                Pending: "Cutting",
                                Cutting: "Stitching",
                                Stitching: "Alteration",
                                Alteration: "Ready",
                                Ready: "Delivered",
                            };

                            // Filter active orders only (not Ready/Delivered — those are done)
                            const activeTasks = orders.filter(
                                (o) => o.status !== "Delivered" && o.status !== "Ready"
                            );

                            // Compute priority score for sorting
                            const scored = activeTasks.map((o) => {
                                const dueDate = o.targetDeliveryDate;
                                const daysUntilDue = Math.ceil(
                                    (new Date(dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
                                );
                                const isOverdue = daysUntilDue < 0;
                                const isDueToday = daysUntilDue === 0;
                                const isUpcoming = daysUntilDue > 0 && daysUntilDue <= 2;
                                const isRush = o.isApprovedRushed || o.rushFee > 0;
                                const daysLate = isOverdue ? Math.abs(daysUntilDue) : 0;

                                // Priority: lower = higher priority
                                let priority = 100;
                                if (isOverdue && isRush) priority = 1;
                                else if (isOverdue) priority = 2;
                                else if (isDueToday && isRush) priority = 3;
                                else if (isDueToday) priority = 4;
                                else if (isUpcoming && isRush) priority = 5;
                                else if (isUpcoming) priority = 6;
                                else priority = 10 + daysUntilDue;

                                return { order: o, priority, daysLate, isDueToday, isOverdue, isUpcoming, isRush, daysUntilDue };
                            });

                            // Sort by priority, then by days until due
                            scored.sort((a, b) => a.priority - b.priority || a.daysUntilDue - b.daysUntilDue);

                            const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
                                const next = STATUS_FLOW[currentStatus];
                                if (next) {
                                    await updateOrder(orderId, { status: next as OrderStatus });
                                    loadData();

                                    // Only prompt notification on explicit important transitions:
                                    // Stitching -> Ready
                                    // Ready -> Delivered
                                    const isBecomingReady = currentStatus === "Stitching" && next === "Ready";
                                    const isBecomingDelivered = currentStatus === "Ready" && next === "Delivered";

                                    if (isBecomingReady || isBecomingDelivered) {
                                        const order = orders.find((o) => o.orderId === orderId);
                                        if (order) {
                                            setStatusNotify({
                                                show: true,
                                                customerName: order.customerName,
                                                customerPhone: order.customerPhone,
                                                status: next,
                                                garmentType: order.garmentType,
                                                orderId: order.orderId,
                                            });
                                        }
                                    }
                                }
                            };

                            const handleDefer = async (orderId: string, existingNotes: string) => {
                                const deferNote = `[Deferred ${todayStr}]`;
                                const newNotes = existingNotes ? `${existingNotes} ${deferNote}` : deferNote;
                                await updateOrder(orderId, { notes: newNotes });
                                loadData();
                            };

                            {
                                // ── Weekly Analytics Data ──
                                const weeklyData = (() => {
                                    const days: { label: string; date: string; orders: number }[] = [];
                                    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                    for (let i = 6; i >= 0; i--) {
                                        const d = new Date();
                                        d.setDate(d.getDate() - i);
                                        const dateStr = d.toISOString().split("T")[0];
                                        const count = orders.filter(o => o.submissionDate === dateStr).length;
                                        days.push({ label: dayNames[d.getDay()], date: dateStr, orders: count });
                                    }
                                    return days;
                                })();

                                // ── Recent Orders (last 5) ──
                                const recentOrders = [...orders]
                                    .sort((a, b) => b.submissionDate.localeCompare(a.submissionDate) || b.orderId.localeCompare(a.orderId))
                                    .slice(0, 5);

                                // ── Capacity color thresholds ──
                                const capacityPercent = capacity > 0 ? Math.round((todayLoad / capacity) * 100) : 0;
                                const capacityColor = capacityPercent >= 85 ? "#ef4444" : capacityPercent >= 60 ? "#f59e0b" : "#10b981";

                                // ── Pie chart data with legend ──
                                const statusColors: Record<string, string> = {
                                    "Pending": "#f59e0b", "Cutting": "#3b82f6", "Stitching": "#9333ea",
                                    "Alteration": "#f97316", "Ready": "#10b981", "Delivered": "#6b7280"
                                };
                                const pieData = ORDER_STATUSES
                                    .map(s => ({ name: statusLabel(s), value: orders.filter(o => o.status === s).length, status: s, color: statusColors[s] || "#8B5A2B" }))
                                    .filter(d => d.value > 0);

                                // ── Delivered count for stat card subtitle ──
                                const deliveredThisMonth = (() => {
                                    const now = new Date();
                                    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
                                    return orders.filter(o => o.status === "Delivered" && o.submissionDate >= monthStart).length;
                                })();

                                return (
                                <div className="space-y-6 animate-fade-in">

                                    {/* ── ROW 1: Premium Stat Cards ── */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Accent Card — Active Orders */}
                                        <div
                                            className="stat-card-accent p-5 cursor-pointer animate-count-up delay-0"
                                            onClick={() => router.push(stats[0].nav)}
                                        >
                                            <div className="stat-arrow">
                                                <ArrowUpRight className="h-4 w-4 text-white/70" />
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 mb-3">
                                                <PackageSearch className="h-5 w-5 text-emerald-300" />
                                            </div>
                                            <p className="text-3xl font-bold tracking-tight">{activeOrders}</p>
                                            <p className="text-sm text-white/70 mt-1">{stats[0].label}</p>
                                            {deliveredThisMonth > 0 && (
                                                <p className="text-xs text-emerald-300/80 mt-2 flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {deliveredThisMonth} delivered this month
                                                </p>
                                            )}
                                        </div>

                                        {/* Standard Cards */}
                                        {stats.slice(1).map((s, idx) => (
                                            <div
                                                key={s.label}
                                                className={`stat-card p-5 cursor-pointer animate-count-up delay-${idx + 1}`}
                                                onClick={() => router.push(s.nav)}
                                            >
                                                <div className="stat-arrow">
                                                    <ArrowUpRight className="h-3.5 w-3.5 text-themed-muted" />
                                                </div>
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} mb-3`}>
                                                    <s.icon className={`h-5 w-5 ${s.color}`} />
                                                </div>
                                                <p className="text-3xl font-bold text-themed-primary tracking-tight">{s.value}</p>
                                                <p className="text-sm text-themed-secondary mt-1">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── ROW 2: Analytics / Capacity / Pie Chart ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                                        {/* Weekly Analytics Bar Chart */}
                                        <div className="glass-card p-5">
                                            <h3 className="dash-section-title mb-4">
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                Weekly Orders
                                            </h3>
                                            <div className="h-[200px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={weeklyData} barCategoryGap="25%">
                                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} width={28} />
                                                        <RechartsTooltip
                                                            contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", borderRadius: "10px", fontSize: "12px", color: "var(--text-primary)", boxShadow: "0 4px 12px var(--shadow-color)" }}
                                                            itemStyle={{ color: "var(--text-primary)" }}
                                                            cursor={{ fill: "var(--hover-bg)" }}
                                                        />
                                                        <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="#10b981" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Today's Capacity — Enhanced */}
                                        {settings && (
                                            <div className="glass-card p-5 flex flex-col">
                                                <h3 className="dash-section-title mb-4">
                                                    <Activity className="h-4 w-4 text-gold-400" />
                                                    {t("dash.todayCapacity")}
                                                </h3>
                                                <div className="flex-1 flex flex-col items-center justify-center">
                                                    {/* Circular progress ring */}
                                                    <div className="relative w-32 h-32 mb-3">
                                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                                                            <circle cx="64" cy="64" r="54" fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" />
                                                            <circle
                                                                cx="64" cy="64" r="54" fill="none"
                                                                stroke={capacityColor}
                                                                strokeWidth="10"
                                                                strokeLinecap="round"
                                                                strokeDasharray={`${(Math.min(capacityPercent, 100) / 100) * 339.292} 339.292`}
                                                                style={{ transition: "stroke-dasharray 0.8s ease" }}
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-2xl font-bold text-themed-primary">{capacityPercent}%</span>
                                                            <span className="text-xs text-themed-muted">used</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-themed-secondary text-center">
                                                        <span className="font-semibold text-themed-primary">{todayLoad}</span> {t("dash.ordersOf")} {capacity} {t("dash.ordersText")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pie Chart — Enhanced with Legend */}
                                        <div className="glass-card p-5 flex flex-col">
                                            <h3 className="dash-section-title mb-3">
                                                <Scissors className="h-4 w-4 text-purple-500" />
                                                Orders by Status
                                            </h3>
                                            {orders.length === 0 ? (
                                                <p className="text-xs text-center text-themed-muted my-auto">No orders to display</p>
                                            ) : (
                                                <div className="flex-1 flex flex-col">
                                                    <div className="relative h-[140px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={pieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={40}
                                                                    outerRadius={62}
                                                                    paddingAngle={3}
                                                                    dataKey="value"
                                                                    stroke="none"
                                                                >
                                                                    {pieData.map((d, i) => (
                                                                        <Cell key={`cell-${i}`} fill={d.color} />
                                                                    ))}
                                                                </Pie>
                                                                <RechartsTooltip contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", borderRadius: "10px", fontSize: "12px", color: "var(--text-primary)" }} itemStyle={{ color: "var(--text-primary)" }} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        {/* Center label */}
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                            <span className="text-xl font-bold text-themed-primary">{orders.length}</span>
                                                            <span className="text-[10px] text-themed-muted">total</span>
                                                        </div>
                                                    </div>
                                                    {/* Legend */}
                                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
                                                        {pieData.map(d => (
                                                            <div key={d.status} className="flex items-center gap-1.5">
                                                                <div className="legend-dot" style={{ background: d.color }} />
                                                                <span className="text-xs text-themed-secondary truncate">{d.name}</span>
                                                                <span className="text-xs font-semibold text-themed-primary ml-auto">{d.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── ROW 3: Recent Orders + Upcoming Deliveries ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Recent Orders Feed */}
                                        <div className="glass-card p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="dash-section-title">
                                                    <Clock className="h-4 w-4 text-blue-500" />
                                                    Recent Orders
                                                </h3>
                                                <button
                                                    onClick={() => router.push("/orders")}
                                                    className="text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1"
                                                >
                                                    View all <ArrowUpRight className="h-3 w-3" />
                                                </button>
                                            </div>
                                            {recentOrders.length === 0 ? (
                                                <p className="text-sm text-themed-muted text-center py-6">No orders yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {recentOrders.map((o) => (
                                                        <div
                                                            key={o.orderId}
                                                            className="flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer"
                                                            style={{ background: "var(--hover-bg)" }}
                                                            onClick={() => setEditingOrder(o)}
                                                        >
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/10 flex-shrink-0">
                                                                <PackageSearch className="h-4 w-4 text-gold-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-themed-primary">{o.customerName}</span>
                                                                    <span className="text-xs text-themed-muted font-mono">{o.orderId}</span>
                                                                </div>
                                                                <p className="text-xs text-themed-secondary truncate">
                                                                    {t(`garment.${o.garmentType}`) || o.garmentType} × {o.numberOfSets} — {o.submissionDate}
                                                                </p>
                                                            </div>
                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusColor(o.status)}`}>
                                                                {statusLabel(o.status)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Upcoming Deliveries */}
                                        <div className="glass-card p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="dash-section-title">
                                                    <Calendar className="h-4 w-4 text-amber-500" />
                                                    Upcoming Deliveries
                                                </h3>
                                            </div>
                                            {(() => {
                                                const upcoming = orders
                                                    .filter(o => o.status !== "Delivered" && o.targetDeliveryDate >= todayStr)
                                                    .sort((a, b) => a.targetDeliveryDate.localeCompare(b.targetDeliveryDate))
                                                    .slice(0, 5);
                                                if (upcoming.length === 0) {
                                                    return <p className="text-sm text-themed-muted text-center py-6">No upcoming deliveries</p>;
                                                }
                                                return (
                                                    <div className="space-y-2">
                                                        {upcoming.map((o) => {
                                                            const daysUntil = Math.ceil(
                                                                (new Date(o.targetDeliveryDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
                                                            );
                                                            return (
                                                                <div
                                                                    key={o.orderId}
                                                                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                                                                    style={{ background: "var(--hover-bg)" }}
                                                                >
                                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${daysUntil === 0 ? "bg-amber-500/15" : daysUntil <= 2 ? "bg-orange-500/10" : "bg-emerald-500/10"}`}>
                                                                        <Calendar className={`h-4 w-4 ${daysUntil === 0 ? "text-amber-500" : daysUntil <= 2 ? "text-orange-500" : "text-emerald-500"}`} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-semibold text-themed-primary">{o.customerName}</span>
                                                                            <span className="text-xs text-themed-muted font-mono">{o.orderId}</span>
                                                                        </div>
                                                                        <p className="text-xs text-themed-secondary truncate">
                                                                            {t(`garment.${o.garmentType}`) || o.garmentType} — Due {o.targetDeliveryDate}
                                                                        </p>
                                                                    </div>
                                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${daysUntil === 0 ? "bg-amber-500/15 text-amber-500" : daysUntil <= 2 ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                                                        {daysUntil === 0 ? "Today" : `${daysUntil}d`}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* ── ROW 4: Today's Priority Tasks ── */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="dash-section-title text-base">
                                                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                                                {t("dash.todayTasks")}
                                                <span className="text-xs font-normal text-themed-muted ml-1 px-2 py-0.5 rounded-full" style={{ background: "var(--hover-bg)" }}>
                                                    {scored.length}
                                                </span>
                                            </h3>
                                            <span className="text-xs font-medium text-themed-muted uppercase tracking-wider">
                                                {t("dash.taskPriority")}
                                            </span>
                                        </div>

                                        {scored.length === 0 ? (
                                            <div className="glass-card p-10 text-center">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mx-auto mb-3">
                                                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                                                </div>
                                                <p className="text-lg font-semibold text-themed-primary">{t("dash.noTasks")}</p>
                                                <p className="text-sm text-themed-secondary mt-1">All caught up! Great work 🎉</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {scored.map(({ order: o, daysLate, isDueToday, isOverdue, isRush }) => (
                                                    <div
                                                        key={o.orderId}
                                                        className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 transition-all hover:shadow-lg"
                                                        style={{
                                                            borderLeft: isOverdue ? "3px solid #ef4444" : isDueToday ? "3px solid #f59e0b" : "3px solid var(--glass-border)",
                                                        }}
                                                    >
                                                        {/* Left: Order info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-mono text-sm font-bold text-themed-primary">{o.orderId}</span>
                                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(o.status)}`}>
                                                                    {statusLabel(o.status)}
                                                                </span>
                                                                {isRush && (
                                                                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400 flex items-center gap-1">
                                                                        ⚡ Rush
                                                                    </span>
                                                                )}
                                                                {isOverdue && (
                                                                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-red-500/15 text-red-400">
                                                                        🔴 {daysLate} {daysLate === 1 ? t("dash.dayLate") : t("dash.daysLate")}
                                                                    </span>
                                                                )}
                                                                {isDueToday && !isOverdue && (
                                                                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-500/15 text-amber-500">
                                                                        🟡 {t("dash.dueToday")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-themed-secondary mt-1 truncate">
                                                                {o.customerName} — {t(`garment.${o.garmentType}`) || o.garmentType} × {o.numberOfSets}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-themed-muted">
                                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {o.targetDeliveryDate}</span>
                                                                {o.binLocation && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {o.binLocation}</span>}
                                                                {o.notes && <span className="truncate max-w-[200px] flex items-center gap-1"><FileText className="h-3 w-3" /> {o.notes}</span>}
                                                            </div>
                                                        </div>

                                                        {/* Right: Actions */}
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {STATUS_FLOW[o.status] && (
                                                                <button
                                                                    onClick={() => handleAdvanceStatus(o.orderId, o.status)}
                                                                    className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95"
                                                                    style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                                                                >
                                                                    <CheckCircle2 className="h-3.5 w-3.5" /> {t("dash.markDone")}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDefer(o.orderId, o.notes)}
                                                                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-themed-secondary transition-all hover:text-themed-primary hover:scale-[1.02] active:scale-95"
                                                                style={{ background: "var(--hover-bg)", border: "1px solid var(--glass-border)" }}
                                                            >
                                                                📦 {t("dash.defer")}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            }
                        })()}

                        {/* ━━━ ORDERS TAB ━━━ */}
                        {currentTab === "orders" && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <h3 className="font-semibold text-themed-primary">{t("dash.allOrders")} ({orders.length})</h3>
                                    <div className="flex items-center gap-2">
                                        {/* View Mode Toggle */}
                                        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
                                            <button
                                                onClick={() => setViewMode("list")}
                                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${viewMode === "list" ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                style={viewMode !== "list" ? { background: "var(--bg-secondary)" } : {}}
                                            >
                                                <LayoutList className="h-3.5 w-3.5" /> {t("dash.listView")}
                                            </button>
                                            <button
                                                onClick={() => setViewMode("grid")}
                                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${viewMode === "grid" ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                style={viewMode !== "grid" ? { background: "var(--bg-secondary)" } : {}}
                                            >
                                                <LayoutGrid className="h-3.5 w-3.5" /> {t("dash.gridView")}
                                            </button>
                                        </div>

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
                                        <Loader2 className="h-6 w-6 text-gold-400 animate-spin" />
                                    </div>
                                )}

                                {/* Empty State */}
                                {!searching && displayedOrders.length === 0 && (
                                    <div className="glass-card p-8 text-center">
                                        <Search className="h-10 w-10 mx-auto mb-3 text-themed-muted" />
                                        <p className="text-sm font-medium text-themed-primary">{t("dash.noResults")}</p>
                                        <p className="text-xs text-themed-secondary mt-1">{t("dash.noResultsHint")}</p>
                                        {hasActiveFilters && <button onClick={clearFilters} className="mt-3 text-xs text-gold-400 hover:text-gold-300">{t("dash.clearFilters")}</button>}
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
                                                            <p className="text-sm text-themed-secondary mt-1">{o.customerName} — {t(`garment.${o.garmentType}`) || o.garmentType}{o.numberOfSets > 1 ? ` × ${o.numberOfSets}` : ""}</p>
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-themed-muted">
                                                                <span>₹{o.totalAmount.toLocaleString("en-IN")}</span>
                                                                <span>{t("common.due")}: {o.targetDeliveryDate}</span>
                                                                {o.binLocation && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{o.binLocation}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <button
                                                                onClick={() => setEditingOrder(o)}
                                                                className="p-2 rounded-lg text-themed-muted hover:text-gold-400 hover:bg-gold-400/10 transition-colors"
                                                                title="Edit Order"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
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
                                                        <p className="text-xs text-themed-secondary mt-0.5">{t(`garment.${o.garmentType}`) || o.garmentType}{o.numberOfSets > 1 ? ` × ${o.numberOfSets}` : ""}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-themed-muted pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                                        <span className="font-semibold text-themed-primary">₹{o.totalAmount.toLocaleString("en-IN")}</span>
                                                        <span>{t("common.due")}: {o.targetDeliveryDate}</span>
                                                    </div>
                                                    {o.binLocation && (
                                                        <span className="flex items-center gap-1 text-xs text-themed-muted"><MapPin className="h-3 w-3" />{o.binLocation}</span>
                                                    )}
                                                    {o.isApprovedRushed && <span className="self-start rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400">{t("common.rush")}</span>}
                                                    <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                                        <button
                                                            onClick={() => setEditingOrder(o)}
                                                            className="p-1.5 rounded-lg text-themed-muted hover:text-gold-400 hover:bg-gold-400/10 transition-colors shrink-0"
                                                            title="Edit Order"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </button>
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

                            </div>
                        )}

                        {/* ━━━ CUSTOMERS TAB ━━━ */}
                        {currentTab === "customers" && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-6 w-6 text-gold-400" />
                                        <h2 className="text-2xl font-bold text-themed-primary">{t("dash.customers")} ({customerTotal})</h2>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: "1px solid var(--glass-border)" }}>
                                            <button
                                                onClick={() => setCustomerViewMode("list")}
                                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${customerViewMode === "list" ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                style={customerViewMode !== "list" ? { background: "var(--bg-secondary)" } : {}}
                                            >
                                                <LayoutList className="h-3.5 w-3.5" /> {t("dash.listView")}
                                            </button>
                                            <button
                                                onClick={() => setCustomerViewMode("grid")}
                                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${customerViewMode === "grid" ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                style={customerViewMode !== "grid" ? { background: "var(--bg-secondary)" } : {}}
                                            >
                                                <LayoutGrid className="h-3.5 w-3.5" /> {t("dash.gridView")}
                                            </button>
                                        </div>
                                        <div className="relative flex-1 min-w-[200px] w-full sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                                            <input
                                                type="text"
                                                placeholder="Search customers..."
                                                className="form-input pl-9 text-sm w-full"
                                                value={customerSearch}
                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative shrink-0">
                                            <select
                                                value={customerSortBy}
                                                onChange={(e) => setCustomerSortBy(e.target.value as "newest" | "oldest" | "nameaz")}
                                                className="appearance-none rounded-lg pl-3 pr-8 py-2 text-xs font-medium cursor-pointer"
                                                style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                            >
                                                <option value="newest">Newest First</option>
                                                <option value="oldest">Oldest First</option>
                                                <option value="nameaz">Name (A-Z)</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-themed-muted pointer-events-none" />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingUser({
                                                    uid: "new_" + Date.now().toString(),
                                                    name: "",
                                                    phoneNumber: "",
                                                    role: "customer",
                                                    measurements: {}
                                                });
                                            }}
                                            className="btn-primary py-2 px-3 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
                                        >
                                            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Customer</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Loading State */}
                                {searching && (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-6 w-6 text-gold-400 animate-spin" />
                                    </div>
                                )}

                                {/* Empty State */}
                                {!searching && displayedCustomers.length === 0 && (
                                    <div className="glass-card p-8 text-center">
                                        <Search className="h-10 w-10 mx-auto mb-3 text-themed-muted" />
                                        <p className="text-sm font-medium text-themed-primary">{t("dash.noResults")}</p>
                                        <p className="text-xs text-themed-secondary mt-1">{t("dash.noResultsHint")}</p>
                                        {customerSearch && <button onClick={() => setCustomerSearch("")} className="mt-3 text-xs text-gold-400 hover:text-gold-300">{t("dash.clearFilters")}</button>}
                                    </div>
                                )}

                                {/* LIST VIEW */}
                                {!searching && customerViewMode === "list" && displayedCustomers.length > 0 && (
                                    <>
                                        <div className="glass-card overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm whitespace-nowrap">
                                                    <thead className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 uppercase text-xs font-semibold text-themed-secondary tracking-wider">
                                                        <tr>
                                                            <th className="px-5 py-3">{t("dash.name")}</th>
                                                            <th className="px-5 py-3">Phone</th>
                                                            <th className="px-5 py-3">Profiles</th>
                                                            <th className="px-5 py-3 text-center">Orders</th>
                                                            <th className="px-5 py-3 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                                        {displayedCustomers.map((u) => (
                                                            <tr key={u.uid} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setViewingCustomer(u)}>
                                                                <td className="px-5 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                                            {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold text-themed-primary">{u.name || <span className="text-themed-muted italic">{t("dash.unnamed")}</span>}</p>
                                                                            {u.gender && <p className="text-[10px] text-themed-secondary uppercase tracking-wider mt-0.5">{u.gender}</p>}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 text-themed-secondary">
                                                                    <div className="flex items-center gap-1.5 font-medium"><Phone className="h-3.5 w-3.5 text-themed-muted" />{u.phoneNumber}</div>
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                                        {Object.keys(u.measurements || {}).length > 0 ? Object.keys(u.measurements || {}).map(gType => (
                                                                            <span key={gType} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gold-400/10 text-gold-400 border border-gold-400/20">
                                                                                {gType}
                                                                            </span>
                                                                        )) : <span className="text-xs text-themed-muted italic">None</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-4 text-center">
                                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 text-themed-primary">
                                                                        {orders.filter(o => o.customerPhone === u.phoneNumber).length}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                                        <button onClick={() => setEditingUser({ ...u })} className="p-2 rounded-lg text-themed-muted hover:text-gold-400 hover:bg-gold-400/10 transition-colors inline-flex items-center">
                                                                            <Edit3 className="h-4 w-4" />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteCustomer(u.uid, u.phoneNumber)} className="p-2 rounded-lg text-themed-muted hover:text-red-500 hover:bg-red-500/10 transition-colors inline-flex items-center">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Pagination Controls */}
                                        {customerTotalPages > 1 && (
                                            <div className="flex items-center justify-center gap-2 pt-2">
                                                <button
                                                    onClick={() => fetchCustomerListPage(customerCurrentPage - 1)}
                                                    disabled={customerCurrentPage <= 1}
                                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                                >
                                                    <ChevronLeft className="h-3.5 w-3.5" /> {t("dash.prev")}
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: customerTotalPages }, (_, i) => i + 1).map((p) => (
                                                        <button
                                                            key={p}
                                                            onClick={() => fetchCustomerListPage(p)}
                                                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${p === customerCurrentPage ? "brand-gradient text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                                            style={p !== customerCurrentPage ? { background: "var(--bg-secondary)" } : {}}
                                                        >
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => fetchCustomerListPage(customerCurrentPage + 1)}
                                                    disabled={customerCurrentPage >= customerTotalPages}
                                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                                >
                                                    {t("dash.next")} <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* GRID VIEW */}
                                {!searching && customerViewMode === "grid" && displayedCustomers.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {displayedCustomers.map((u) => (
                                                <div key={u.uid} className="glass-card p-5 flex flex-col cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => setViewingCustomer(u)}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="min-w-0 pr-4">
                                                            <h4 className="font-semibold text-themed-primary truncate">{u.name || t("dash.unnamed")}</h4>
                                                            <p className="text-sm text-themed-secondary flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3 shrink-0" /><span className="truncate">{u.phoneNumber}</span></p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={() => setEditingUser({ ...u })} className="p-2 rounded-lg text-themed-muted hover:text-gold-400 transition-colors" style={{ background: "var(--hover-bg)" }}>
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteCustomer(u.uid, u.phoneNumber)} className="p-2 rounded-lg text-themed-muted hover:text-red-500 transition-colors" style={{ background: "var(--hover-bg)" }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Garment Profiles */}
                                                    {Object.keys(u.measurements || {}).length > 0 && (
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {Object.keys(u.measurements).map((garmentType) => (
                                                                <span key={garmentType} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs border" style={{ background: "var(--hover-bg)", borderColor: "var(--glass-border)" }}>
                                                                    <Ruler className="h-3 w-3 text-gold-400" />
                                                                    <span className="font-medium text-themed-primary">{t(`garment.${garmentType}`) || garmentType}</span>
                                                                    <span className="text-themed-muted ml-0.5">({Object.keys((u.measurements as Record<string, Record<string, number>>)[garmentType] || {}).length})</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-5">
                                                        <p className="text-xs text-themed-muted">
                                                            {orders.filter((o) => o.customerPhone === u.phoneNumber).length} {t("dash.orderCount")}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Load More Button */}
                                        <div className="flex justify-center pt-2">
                                            {customerGridHasMore ? (
                                                <button
                                                    onClick={loadMoreCustomerGrid}
                                                    disabled={customerGridLoading}
                                                    className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                                                    style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)", color: "var(--text-primary)" }}
                                                >
                                                    {customerGridLoading ? (
                                                        <><Loader2 className="h-4 w-4 animate-spin" /> {t("dash.loadingMore")}</>
                                                    ) : (
                                                        <>{t("dash.loadMore")} ({displayedCustomers.length}/{customerTotal})</>
                                                    )}
                                                </button>
                                            ) : (
                                                <p className="text-xs text-themed-muted">{t("dash.allLoaded")}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Edit User Modal */}
                                {editingUser && (
                                    <MeasurementForm
                                        key={editingUser.uid}
                                        user={editingUser}
                                        onClose={() => setEditingUser(null)}
                                        onSave={handleSaveUser}
                                    />
                                )}

                                {/* Customer Detail Modal */}
                                <CustomerDetailModal
                                    isOpen={!!viewingCustomer}
                                    customer={viewingCustomer}
                                    orders={orders}
                                    onClose={() => setViewingCustomer(null)}
                                    onEditOrder={(o) => { setViewingCustomer(null); setEditingOrder(o); }}
                                    onEditCustomer={(u) => { setViewingCustomer(null); setEditingUser({ ...u }); }}
                                />
                            </div>
                        )}

                        {/* ━━━ MONITORING TAB ━━━ */}
                        {currentTab === "monitoring" && (() => {
                            const MONITOR_PAGE_SIZE = 8;
                            const allMonitorUsers = allUsers
                                .filter(u => u.role === "customer")
                                .map(u => {
                                    const userOrders = orders.filter(o => o.customerPhone === u.phoneNumber);
                                    const activeOrdersCount = userOrders.filter(o => o.status !== "Delivered").length;
                                    return {
                                        ...u,
                                        totalOrders: userOrders.length,
                                        activeOrdersCount
                                    };
                                })
                                .filter(u => u.totalOrders > 0 && u.activeOrdersCount > 0)
                                .sort((a, b) => (b.queryCount || 0) - (a.queryCount || 0));

                            const filteredMonitorUsers = monitorSearch
                                ? allMonitorUsers.filter(u =>
                                    u.name.toLowerCase().includes(monitorSearch.toLowerCase()) ||
                                    u.phoneNumber.includes(monitorSearch)
                                )
                                : allMonitorUsers;

                            const monitorTotalPages = Math.max(1, Math.ceil(filteredMonitorUsers.length / MONITOR_PAGE_SIZE));
                            const safePage = Math.min(monitorPage, monitorTotalPages);
                            const monitorPaged = filteredMonitorUsers.slice((safePage - 1) * MONITOR_PAGE_SIZE, safePage * MONITOR_PAGE_SIZE);

                            const siteUrl = "https://skumarantailors.vercel.app";

                            const getMessageText = (name: string, phone: string) => {
                                const trackingLink = `${siteUrl}/tracking?phone=${encodeURIComponent(phone)}`;
                                return `வணக்கம் ${name}! 🙏\nHi ${name}, this is S Kumaran Tailors.\n\nஉங்கள் ஆர்டர் நிலையை அறிய கீழே உள்ள இணைப்பை பாருங்கள் / Track your order status here:\n${trackingLink}\n\n📞 தொடர்புக்கு / Contact: +91 94428 98544\n\nநன்றி! Thank you! 🙏`;
                            };

                            const openWhatsApp = (phone: string, name: string) => {
                                const clean = phone.replace(/[^0-9]/g, "");
                                const msg = encodeURIComponent(getMessageText(name, phone));
                                window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
                            };

                            const openSMS = (phone: string, name: string) => {
                                const msg = encodeURIComponent(getMessageText(name, phone));
                                window.open(`sms:${phone}?body=${msg}`, "_self");
                            };

                            return (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="glass-card p-6">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brown-500/10 text-brown-500">
                                                    <Activity className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-themed-primary">Customer Query Monitoring</h3>
                                                    <p className="text-sm text-themed-secondary">Track how often customers check their order status via WhatsApp or Public Tracker.</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDataLoading(true);
                                                    getUsers().then(u => {
                                                        setAllUsers(u);
                                                        setDataLoading(false);
                                                    }).catch(err => {
                                                        console.error("Failed to refresh users", err);
                                                        setDataLoading(false);
                                                    });
                                                }}
                                                disabled={dataLoading}
                                                className="btn-secondary h-9 px-4 text-xs font-medium flex items-center gap-2"
                                            >
                                                <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
                                                {dataLoading ? "Refreshing..." : "Refresh"}
                                            </button>
                                        </div>

                                        {/* Controls: Search + View Toggle */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                                                <input
                                                    type="text"
                                                    value={monitorSearch}
                                                    onChange={(e) => { setMonitorSearch(e.target.value); setMonitorPage(1); }}
                                                    placeholder="Search by name or phone..."
                                                    className="form-input text-sm pl-10 w-full"
                                                />
                                                {monitorSearch && (
                                                    <button onClick={() => { setMonitorSearch(""); setMonitorPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary">
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--glass-border)" }}>
                                                    <button
                                                        onClick={() => setMonitorViewMode("list")}
                                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${monitorViewMode === "list" ? "bg-gold-400/10 text-gold-400" : "text-themed-secondary hover:text-themed-primary"
                                                            }`}
                                                    >
                                                        <LayoutList className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setMonitorViewMode("grid")}
                                                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${monitorViewMode === "grid" ? "bg-gold-400/10 text-gold-400" : "text-themed-secondary hover:text-themed-primary"
                                                            }`}
                                                    >
                                                        <LayoutGrid className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <span className="text-xs text-themed-muted">{filteredMonitorUsers.length} customers</span>
                                            </div>
                                        </div>

                                        {/* List View */}
                                        {monitorViewMode === "list" ? (
                                            <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--glass-border)" }}>
                                                <table className="w-full text-left text-sm whitespace-nowrap">
                                                    <thead className="text-xs uppercase" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                                                        <tr>
                                                            <th className="px-5 py-3 font-semibold">Customer</th>
                                                            <th className="px-5 py-3 font-semibold">Phone #</th>
                                                            <th className="px-5 py-3 font-semibold text-center">Total Queries</th>
                                                            <th className="px-5 py-3 font-semibold text-center">Orders</th>
                                                            <th className="px-5 py-3 font-semibold text-right">Last Queried At</th>
                                                            <th className="px-5 py-3 font-semibold text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y" style={{ borderColor: "var(--glass-border)", background: "var(--bg-secondary)" }}>
                                                        {monitorPaged.map(u => (
                                                            <tr key={u.uid} className="transition-colors hover:bg-neutral-500/5">
                                                                <td className="px-5 py-3.5 font-medium text-themed-primary">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gold-400 to-brown-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                                                                            {u.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        {u.name}
                                                                    </div>
                                                                </td>
                                                                <td className="px-5 py-3.5 text-themed-secondary">{u.phoneNumber}</td>
                                                                <td className="px-5 py-3.5 text-center">
                                                                    <button 
                                                                        onClick={() => setViewingQueriesFor(u)}
                                                                        className="inline-flex items-center justify-center min-w-[32px] rounded-full px-2 py-1 text-xs font-bold bg-brown-500/10 text-brown-500 hover:bg-brown-500/20 transition-all cursor-pointer"
                                                                        title="View Query History"
                                                                    >
                                                                        {u.queryCount || 0}
                                                                    </button>
                                                                </td>
                                                                <td className="px-5 py-3.5 text-center">
                                                                    <span className="inline-flex items-center justify-center min-w-[32px] rounded-full px-2 py-1 text-xs font-bold bg-gold-400/10 text-gold-400">
                                                                        {u.totalOrders}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-3.5 text-right text-themed-muted text-xs">
                                                                    {u.lastQueryAt ? new Date(u.lastQueryAt).toLocaleString() : "Never"}
                                                                </td>
                                                                <td className="px-5 py-3.5 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => window.open(`/tracking?phone=${encodeURIComponent(u.phoneNumber)}`, "_blank")}
                                                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gold-400 hover:bg-gold-400/10 transition-all"
                                                                            title="View Orders"
                                                                        >
                                                                            <Eye className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openWhatsApp(u.phoneNumber, u.name)}
                                                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                                            title="WhatsApp"
                                                                        >
                                                                            <MessageCircle className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openSMS(u.phoneNumber, u.name)}
                                                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-all"
                                                                            title="SMS"
                                                                        >
                                                                            <Smartphone className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            /* Grid View */
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                {monitorPaged.map(u => (
                                                    <div key={u.uid} className="glass-card p-4 flex flex-col gap-3 hover:scale-[1.01] transition-transform">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gold-400 to-brown-500 flex items-center justify-center text-sm text-white font-bold flex-shrink-0">
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-themed-primary text-sm truncate">{u.name}</p>
                                                                <p className="text-xs text-themed-muted truncate">{u.phoneNumber}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setViewingQueriesFor(u)}
                                                                    className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold bg-brown-500/10 text-brown-500 hover:bg-brown-500/20 transition-all cursor-pointer"
                                                                    title="View Query History"
                                                                >
                                                                    {u.queryCount || 0} queries
                                                                </button>
                                                                <span className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold bg-gold-400/10 text-gold-400">
                                                                    {u.totalOrders} orders
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-themed-muted">
                                                                {u.lastQueryAt ? new Date(u.lastQueryAt).toLocaleDateString() : "Never"}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => window.open(`/tracking?phone=${encodeURIComponent(u.phoneNumber)}`, "_blank")}
                                                                className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gold-400 hover:bg-gold-400/10 transition-all flex-1"
                                                                style={{ border: "1px solid var(--glass-border)" }}
                                                            >
                                                                <Eye className="h-3.5 w-3.5" /> View
                                                            </button>
                                                            <button
                                                                onClick={() => openWhatsApp(u.phoneNumber, u.name)}
                                                                className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                                style={{ border: "1px solid var(--glass-border)" }}
                                                                title="WhatsApp"
                                                            >
                                                                <MessageCircle className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => openSMS(u.phoneNumber, u.name)}
                                                                className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-all"
                                                                style={{ border: "1px solid var(--glass-border)" }}
                                                                title="SMS"
                                                            >
                                                                <Smartphone className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pagination */}
                                        {monitorTotalPages > 1 && (
                                            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                                <p className="text-xs text-themed-muted">
                                                    Showing {(safePage - 1) * MONITOR_PAGE_SIZE + 1}–{Math.min(safePage * MONITOR_PAGE_SIZE, filteredMonitorUsers.length)} of {filteredMonitorUsers.length}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setMonitorPage(p => Math.max(1, p - 1))}
                                                        disabled={safePage <= 1}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-themed-secondary hover:text-themed-primary disabled:opacity-30 transition-all"
                                                        style={{ background: "var(--hover-bg)" }}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-xs font-medium text-themed-secondary px-2">{safePage} / {monitorTotalPages}</span>
                                                    <button
                                                        onClick={() => setMonitorPage(p => Math.min(monitorTotalPages, p + 1))}
                                                        disabled={safePage >= monitorTotalPages}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-themed-secondary hover:text-themed-primary disabled:opacity-30 transition-all"
                                                        style={{ background: "var(--hover-bg)" }}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Queries History Modal */}
                                    {viewingQueriesFor && (
                                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setViewingQueriesFor(null)}>
                                            <div className="glass-card w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-slide-up" style={{ background: "var(--bg-secondary)" }} onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--glass-border)" }}>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-themed-primary flex items-center gap-2">
                                                            <Activity className="h-5 w-5 text-brown-500" />
                                                            Query History
                                                        </h3>
                                                        <p className="text-sm text-themed-secondary mt-0.5">{viewingQueriesFor.name} <span className="opacity-70">({viewingQueriesFor.phoneNumber})</span></p>
                                                    </div>
                                                    <button onClick={() => setViewingQueriesFor(null)} className="rounded-lg p-2 text-themed-muted hover:bg-neutral-500/10 transition-colors">
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                                                    {!viewingQueriesFor.queryHistory || viewingQueriesFor.queryHistory.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Activity className="h-10 w-10 text-themed-muted mx-auto mb-3 opacity-30" />
                                                            <p className="text-themed-secondary text-sm">No detailed query history found for this user.</p>
                                                            <p className="text-themed-muted text-xs mt-1">Older queries might only have a numeric count.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {[...viewingQueriesFor.queryHistory].sort((a,b) => b.timestamp - a.timestamp).map((q, i) => (
                                                                <div key={i} className="rounded-xl p-4 transition-colors relative" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--glass-border)" }}>
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${q.source === 'WhatsApp' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'}`}>
                                                                            {q.source || 'Unknown'}
                                                                        </span>
                                                                        <span className="text-[11px] text-themed-muted font-medium flex items-center gap-1">
                                                                            <Clock className="h-3 w-3" />
                                                                            {new Date(q.timestamp).toLocaleString(undefined, {
                                                                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                                            })}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-themed-primary leading-relaxed p-3 rounded-lg font-medium" style={{ background: "var(--hover-bg)", border: "1px solid var(--glass-border)" }}>&quot;{q.text || "Checked order status"}&quot;</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* ━━━ SETTINGS TAB ━━━ */}
                        {currentTab === "settings" && settings && (
                            <div className="max-w-5xl w-full animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div className="glass-card p-6">
                                        <h3 className="font-semibold text-themed-primary mb-4 flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-gold-400" /> {t("dash.capacitySettings")}
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
                                                                className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-red-500" : "bg-gold-400"}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Pricing Editor */}
                                <div className="glass-card p-6">
                                    <h3 className="font-semibold text-themed-primary mb-4 flex items-center gap-2">
                                        <IndianRupee className="h-5 w-5 text-emerald-500" /> Base Garment Pricing
                                    </h3>
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                        {GARMENT_TYPES.map(gType => (
                                            <div key={gType} className="flex items-center justify-between gap-3">
                                                <label className="text-sm font-medium text-themed-secondary min-w-[120px]">{t(`garment.${gType}`) || gType}</label>
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-themed-muted font-medium text-sm">₹</span>
                                                    <input
                                                        type="number"
                                                        value={pricingInput[gType] || ""}
                                                        onChange={(e) => setPricingInput({ ...pricingInput, [gType]: e.target.value })}
                                                        min="0"
                                                        className="form-input text-sm w-full pl-7"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: "1px solid var(--glass-border)" }}>
                                        <button onClick={handleSavePricing} disabled={savingPricing} className="btn-primary text-sm px-6">
                                            {savingPricing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> {t("common.save")}</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ━━━ LOGS TAB ━━━ */}
                        {currentTab === "logs" && (
                            <div className="space-y-6 animate-fade-in glass-card p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-themed-primary">{t("dash.tab.logs")}</h3>
                                            <p className="text-sm text-themed-secondary">View internal system errors arrayed directly from the backend text file.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={loadLogs}
                                        disabled={fetchingLogs}
                                        className="btn-secondary h-9 px-4 text-xs font-medium flex items-center gap-2"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${fetchingLogs ? "animate-spin" : ""}`} />
                                        {fetchingLogs ? "Refreshing..." : "Refresh"}
                                    </button>
                                </div>
                                <div className="bg-black/95 text-green-400 p-5 rounded-xl overflow-x-auto overflow-y-auto min-h-[400px] max-h-[600px] text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                                    {logsContent || "No logs yet. Click refresh to load."}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* ─── Status Change Notification Prompt ─── */}
            {statusNotify?.show && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                    onClick={() => setStatusNotify(null)}
                >
                    <div
                        className="glass-card p-6 w-full max-w-sm animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                statusNotify.status === "Ready" ? "bg-emerald-500/15" : "bg-gray-500/15"
                            }`}>
                                <Send className={`h-5 w-5 ${
                                    statusNotify.status === "Ready" ? "text-emerald-500" : "text-gray-400"
                                }`} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-themed-primary">
                                    {statusNotify.status === "Ready" ? "Order Ready! ✅" : "Order Delivered! 🎉"}
                                </h3>
                                <p className="text-xs text-themed-secondary">Notify the customer?</p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="rounded-xl p-3 mb-5" style={{ background: "var(--bg-tertiary)" }}>
                            <p className="text-sm font-semibold text-themed-primary">{statusNotify.customerName}</p>
                            <p className="text-xs text-themed-secondary flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" />
                                {statusNotify.customerPhone}
                            </p>
                            <p className="text-xs text-themed-muted mt-1">
                                {t(`garment.${statusNotify.garmentType}`) || statusNotify.garmentType} • {statusNotify.orderId}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-3">
                            <button
                                onClick={() => sendStatusWhatsApp(
                                    statusNotify.customerPhone,
                                    statusNotify.customerName,
                                    statusNotify.status,
                                    statusNotify.garmentType
                                )}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                style={{ background: "#25D366" }}
                            >
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                            </button>
                            <button
                                onClick={() => sendStatusSMS(
                                    statusNotify.customerPhone,
                                    statusNotify.customerName,
                                    statusNotify.status,
                                    statusNotify.garmentType
                                )}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                style={{ background: "#D4AF37" }}
                            >
                                <Smartphone className="h-4 w-4" />
                                SMS
                            </button>
                        </div>

                        {/* Skip */}
                        <button
                            onClick={() => setStatusNotify(null)}
                            className="w-full py-2 text-sm text-themed-muted hover:text-themed-secondary transition-colors"
                        >
                            Skip notification
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
