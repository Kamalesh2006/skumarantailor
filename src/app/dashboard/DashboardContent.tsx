"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useIsDesktop } from "@/lib/useIsDesktop";
import AdminSidebar from "@/components/AdminSidebar";
import AdminDesktopHeader from "@/components/AdminDesktopHeader";
import AdminMobileHeader from "@/components/AdminMobileHeader";
import AdminBottomNav from "@/components/AdminBottomNav";
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

type Tab = "overview" | "orders" | "customers" | "monitoring" | "settings" | "logs" | "queries" | "revenue" | "backup";
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
    const isDesktop = useIsDesktop();

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
        <div className="flex flex-col h-screen w-full overflow-hidden bg-figma-bg text-figma-dark font-sans">
            {isDesktop && <AdminDesktopHeader onQuickAdd={() => setShowQuickAdd(true)} />}
            
            <div className="flex flex-1 min-h-0 w-full overflow-hidden">
                {isDesktop && <AdminSidebar currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab as Tab)} />}
                
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {!isDesktop && <AdminMobileHeader />}

                <main id="app-content" className="flex-1 overflow-y-auto relative flex flex-col pb-[80px] md:pb-0">

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

            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0">
                {dataLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-gold-400 animate-spin" />
                    </div>
                ) : (
                    <>
                                                {/* ━━━ OVERVIEW TAB — Today's Tasks ━━━ */}
                        {currentTab === "overview" && (() => {
                            const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
                            
                            const readyOrders = orders.filter(o => o.status === "Ready");
                            const overdueOrders = orders.filter(o => {
                                if(o.status === "Delivered") return false;
                                const daysUntilDue = Math.ceil((new Date(o.targetDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return daysUntilDue < 0;
                            });
                            const stitchingOrders = orders.filter(o => o.status === "Stitching");
                            const cuttingOrders = orders.filter(o => o.status === "Cutting");
                            const alterationOrders = orders.filter(o => o.status === "Alteration");
                            const inShopOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Ready");

                            // Deliver today orders (Ready + Overdue)
                            const deliverToday = [...readyOrders].sort((a,b) => new Date(a.targetDeliveryDate).getTime() - new Date(b.targetDeliveryDate).getTime()).slice(0, 5);

                            const capacityPercent = capacity > 0 ? Math.round((todayLoad / capacity) * 100) : 0;

                            return (
                                <div className="flex flex-col h-full bg-figma-bg md:bg-white animate-fade-in">
                                    {/* Desktop Header */}
                                    <div className="bg-white border-b border-figma-border py-[18px] px-[30px] hidden md:flex items-center gap-[20px] shrink-0">
                                        <div className="flex-1">
                                            <div className="font-bricolage font-extrabold tracking-tight text-[25px] text-figma-dark leading-[1.1]">{todayStr}</div>
                                            <div className="text-[13px] text-figma-muted mt-1">{readyOrders.length} to deliver &middot; {overdueOrders.length} overdue &middot; {stitchingOrders.length} stitching</div>
                                        </div>
                                        <div className="w-[320px] bg-figma-grayLight border border-figma-border rounded-[11px] px-[14px] py-[11px] flex items-center gap-[10px]">
                                            <Search className="w-4 h-4 text-figma-muted" />
                                            <input 
                                                type="text" 
                                                placeholder="Search customer, phone or order no." 
                                                className="bg-transparent border-none outline-none text-[13.5px] w-full text-figma-dark placeholder-figma-muted"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => setShowNewOrder(true)} 
                                            className="flex items-center gap-[10px] h-[44px] px-[18px] rounded-[12px] bg-figma-gold cursor-pointer hover:opacity-90 transition-opacity"
                                        >
                                            <span className="text-[20px] text-figma-dark font-light">+</span>
                                            <span className="text-[14.5px] font-extrabold text-figma-dark">New order</span>
                                        </button>
                                    </div>

                                    {/* Desktop Content */}
                                    <div className="hidden md:flex flex-1 p-[24px_30px] flex-col gap-[20px] overflow-y-auto bg-figma-bg">
                                        <div className="grid grid-cols-4 gap-[16px] shrink-0">
                                            <div onClick={() => { setStatusFilter("Ready"); setCurrentTab("orders"); }} className="bg-white border border-figma-border rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-text">TO DELIVER</div>
                                                <div className="font-bricolage font-extrabold tracking-[-1px] text-[36px] text-figma-dark leading-[1.05] mt-2">{readyOrders.length}</div>
                                                <div className="text-[12.5px] font-bold text-figma-red mt-1">{overdueOrders.length} overdue</div>
                                            </div>
                                            <div onClick={() => { setCurrentTab("orders"); }} className="bg-white border border-figma-border rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-text">IN THE SHOP</div>
                                                <div className="font-bricolage font-extrabold tracking-[-1px] text-[36px] text-figma-dark leading-[1.05] mt-2">{inShopOrders.length}</div>
                                                <div className="text-[12.5px] text-figma-muted mt-1">{cuttingOrders.length} cutting &middot; {stitchingOrders.length} stitching</div>
                                            </div>
                                            <div onClick={() => setCurrentTab("queries")} className="bg-white border border-figma-border rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-text">QUERIES</div>
                                                <div className="font-bricolage font-extrabold tracking-[-1px] text-[36px] text-figma-dark leading-[1.05] mt-2">128</div>
                                                <div className="text-[12.5px] font-bold text-figma-goldDark mt-1">4 waiting now</div>
                                            </div>
                                            <div onClick={() => setCurrentTab("revenue")} className="bg-figma-dark rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-lg hover:shadow-black/20 transition-all">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-mutedGold">AUGUST REVENUE</div>
                                                <div className="font-extrabold tracking-[-1px] text-[31px] text-figma-cream leading-[1.05] mt-[9px]">₹1,42,300</div>
                                                <div className="text-[12.5px] text-[#E0CFAE] mt-[5px]">₹31,300 pending</div>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-[1.45fr_1fr] gap-[20px] min-h-0">
                                            {/* Deliver Today Table */}
                                            <div className="bg-white border border-figma-border rounded-[18px] flex flex-col overflow-hidden">
                                                <div className="p-[18px_22px_14px] flex items-baseline gap-[12px] border-b border-figma-grayLight shrink-0">
                                                    <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">Deliver today</span>
                                                    <span onClick={() => setCurrentTab("orders")} className="text-[13px] font-bold text-figma-goldDark cursor-pointer hover:underline">See all orders</span>
                                                </div>
                                                <div className="grid grid-cols-[1fr_130px_96px_110px] gap-[14px] p-[11px_22px] bg-figma-bg border-b border-figma-grayLight text-[11.5px] font-extrabold tracking-[0.8px] text-figma-text shrink-0">
                                                    <span>CUSTOMER</span><span>GARMENT</span><span>AMOUNT</span><span></span>
                                                </div>
                                                <div className="overflow-y-auto flex-1">
                                                    {deliverToday.map(order => (
                                                        <div key={order.orderId} className="grid grid-cols-[1fr_130px_96px_110px] gap-[14px] p-[14px_22px] items-center border-b border-figma-grayLight hover:bg-gray-50/50">
                                                            <div className="flex items-center gap-[11px]">
                                                                <div className="w-[8px] h-[34px] rounded-[4px] bg-figma-green"></div>
                                                                <div>
                                                                    <div className="text-[14.5px] font-bold text-figma-dark">{order.customerName}</div>
                                                                    <div className="text-[12px] text-figma-muted mt-[2px]">{order.orderId} &middot; {order.binLocation || "No Bin"}</div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[13.5px] text-figma-brown">{t(`garment.${order.garmentType}`) || order.garmentType}</span>
                                                            <span className="text-[14px] font-extrabold text-figma-dark">₹{order.totalAmount}</span>
                                                            <button 
                                                                onClick={() => handleStatusChange(order.orderId, "Delivered")}
                                                                className="h-[36px] rounded-[10px] bg-figma-dark text-figma-cream text-[13px] font-bold flex items-center justify-center cursor-pointer hover:bg-figma-darkHover transition-colors"
                                                            >
                                                                Deliver
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {deliverToday.length === 0 && (
                                                        <div className="p-8 text-center text-figma-muted">No orders ready for delivery today.</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="flex flex-col gap-[20px] overflow-y-auto">
                                                <div className="bg-white border border-figma-border rounded-[18px] p-[18px_20px] shrink-0">
                                                    <div className="flex items-baseline gap-[10px] mb-[14px]">
                                                        <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">Queries waiting</span>
                                                        <span className="px-[9px] py-[4px] rounded-full bg-[#FBE9E4] text-figma-red text-[11.5px] font-extrabold">4</span>
                                                    </div>
                                                    <div className="flex flex-col gap-[11px]">
                                                        <div className="flex gap-[11px] items-start">
                                                            <div className="w-[34px] h-[34px] rounded-[10px] bg-figma-cream flex items-center justify-center font-bricolage font-extrabold text-[12.5px] text-figma-goldDark">RM</div>
                                                            <div className="flex-1">
                                                                <div className="text-[13.5px] font-bold text-figma-dark">Ramesh M.</div>
                                                                <div className="text-[12.5px] text-figma-muted mt-[2px] leading-[1.4]">Sir, shirt ready aacha?</div>
                                                            </div>
                                                        </div>
                                                        {/* Static demo content for queries for now */}
                                                    </div>
                                                    <button onClick={() => setCurrentTab("queries")} className="w-full h-[40px] rounded-[11px] bg-figma-grayLight border border-figma-border flex items-center justify-center text-[13px] font-bold text-figma-goldDark mt-[15px] hover:bg-figma-cream transition-colors">
                                                        Open all queries
                                                    </button>
                                                </div>

                                                <div className="bg-white border border-figma-border rounded-[18px] p-[18px_20px] shrink-0">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark mb-[6px]">Today&apos;s capacity</div>
                                                    <div className="text-[12.5px] text-figma-muted">{todayLoad} of {capacity} items loaded</div>
                                                    <div className="h-[10px] rounded-[5px] bg-figma-grayLight overflow-hidden mt-[13px]">
                                                        <div className="h-full bg-figma-gold" style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
                                                    </div>
                                                    <div className="flex flex-col gap-[9px] mt-[16px]">
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-goldDark"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Cutting</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{cuttingOrders.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-gold"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Stitching</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{stitchingOrders.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-red"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Alteration</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{alterationOrders.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-green"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Ready</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{readyOrders.length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Content */}
                                    <div className="md:hidden flex-1 flex flex-col gap-[18px] p-[18px_20px]">
                                        <div className="bg-white border border-figma-border rounded-[20px] p-[18px_18px_14px] shadow-[0_2px_8px_rgba(42,29,20,.05)]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[12px] font-bold tracking-[1.4px] text-figma-text">TODAY</span>
                                                <span className="text-[12px] font-semibold text-figma-red">{overdueOrders.length} overdue</span>
                                            </div>
                                            <div className="flex gap-[10px] mt-[14px]">
                                                <div onClick={() => setCurrentTab("orders")} className="flex-1 bg-figma-cream rounded-[14px] p-[12px_12px_10px]">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[30px] text-figma-dark leading-[1]">{readyOrders.length}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[4px]">To deliver</div>
                                                </div>
                                                <div onClick={() => setCurrentTab("orders")} className="flex-1 bg-[#EAF0E4] rounded-[14px] p-[12px_12px_10px]">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[30px] text-figma-dark leading-[1]">{stitchingOrders.length}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[4px]">Stitching</div>
                                                </div>
                                                <div onClick={() => setCurrentTab("queries")} className="flex-1 bg-figma-grayLight rounded-[14px] p-[12px_12px_10px]">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[30px] text-figma-dark leading-[1]">4</div>
                                                    <div className="text-[12px] text-figma-muted mt-[4px]">New queries</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-[10px]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">Due today</span>
                                                <span onClick={() => setCurrentTab("orders")} className="text-[13px] font-semibold text-figma-goldDark cursor-pointer">See all</span>
                                            </div>
                                            <div className="flex flex-col gap-[10px]">
                                                {deliverToday.map((order, i) => (
                                                    <div key={order.orderId} onClick={() => { /* view order */ }} className="bg-white border border-figma-border rounded-[16px] p-[14px] flex gap-[12px] items-center">
                                                        <div className={`w-[44px] h-[44px] rounded-[12px] ${i%2===0 ? 'bg-[#FBE9E4] text-figma-red' : 'bg-figma-cream text-figma-goldDark'} flex items-center justify-center font-bricolage font-extrabold tracking-[-0.4px] text-[16px]`}>
                                                            {order.customerName.substring(0,2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[15px] font-bold text-figma-dark">{order.customerName}</div>
                                                            <div className="text-[12.5px] text-figma-muted mt-[2px]">{t(`garment.${order.garmentType}`) || order.garmentType} &middot; {order.orderId}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[11px] font-bold text-figma-green">READY</div>
                                                            <div className="text-[12px] text-figma-muted mt-[3px]">₹{order.totalAmount}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {deliverToday.length === 0 && (
                                                    <div className="p-4 text-center text-figma-muted text-sm border border-dashed border-figma-border rounded-xl">No orders ready</div>
                                                )}
                                            </div>
                                        </div>

                                        <div onClick={() => setCurrentTab("queries")} className="bg-figma-dark rounded-[18px] p-[15px_16px] flex gap-[12px] items-center mt-[10px] cursor-pointer active:scale-[0.98] transition-transform">
                                            <div className="w-[38px] h-[38px] rounded-[12px] bg-figma-green flex items-center justify-center text-[17px] text-white">✆</div>
                                            <div className="flex-1">
                                                <div className="text-[14px] font-bold text-figma-cream">4 WhatsApp queries</div>
                                                <div className="text-[12px] text-figma-mutedGold mt-[2px]">Latest: “Sir, dress ready aacha?”</div>
                                            </div>
                                            <span className="text-[18px] text-[#E7C87A]">›</span>
                                        </div>
                                    </div>
                                </div>
                            );
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
                        {currentTab === "customers" && (() => {
                            const today = new Date();
                            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
                            const newCustomersThisMonth = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= new Date(firstDayOfMonth)).length;

                            return (
                                <div className="flex flex-col h-full bg-figma-bg md:bg-white animate-fade-in">
                                    {/* Desktop View */}
                                    <div className="hidden md:flex flex-1 overflow-hidden">
                                        <div className="w-[420px] bg-white border-r border-figma-border flex flex-col overflow-hidden">
                                            <div className="p-[20px_22px_16px] border-b border-figma-border">
                                                <div className="flex items-center gap-[12px]">
                                                    <div className="flex-1">
                                                        <div className="font-bricolage font-extrabold tracking-[-0.5px] text-[23px] text-figma-dark">Customers</div>
                                                        <div className="text-[12.5px] text-figma-muted mt-[4px]">{allUsers.length} saved &middot; {newCustomersThisMonth} this month</div>
                                                    </div>
                                                    <button onClick={() => setEditingUser({ uid: "new_" + Date.now(), name: "", phoneNumber: "", role: "customer", measurements: {} })} className="h-[40px] px-[15px] rounded-[11px] bg-figma-gold flex items-center gap-[7px] text-[13.5px] font-extrabold text-figma-dark cursor-pointer hover:opacity-90">
                                                        <span className="text-[17px] font-light">+</span>Add
                                                    </button>
                                                </div>
                                                <div className="bg-figma-grayLight border border-figma-border rounded-[11px] p-[11px_14px] mt-[14px] flex items-center gap-[10px]">
                                                    <Search className="w-4 h-4 text-[#A6947F]" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search name or phone number" 
                                                        value={customerSearch}
                                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                                        className="bg-transparent border-none outline-none text-[13.5px] text-figma-dark placeholder-[#A6947F] w-full"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-[1fr_74px_82px] gap-[10px] p-[11px_22px] bg-figma-bg border-b border-figma-border text-[11.5px] font-extrabold tracking-[0.8px] text-figma-text shrink-0">
                                                <span>NAME</span>
                                                <span className="text-right">ORDERS</span>
                                                <span className="text-right">PHONE</span>
                                            </div>

                                            <div className="overflow-y-auto flex-1">
                                                {displayedCustomers.map(user => {
                                                    const initials = user.name ? user.name.substring(0,2).toUpperCase() : "CU";
                                                    const userOrdersCount = orders.filter(o => o.customerPhone === user.phoneNumber).length;
                                                    
                                                    return (
                                                        <div key={user.uid} onClick={() => setViewingCustomer(user)} className="grid grid-cols-[1fr_74px_82px] gap-[10px] p-[14px_22px] items-center border-b border-figma-grayLight cursor-pointer hover:bg-figma-cream">
                                                            <div className="flex items-center gap-[11px]">
                                                                <div className="w-[36px] h-[36px] rounded-[10px] bg-figma-grayLight flex items-center justify-center font-bricolage font-extrabold text-[12.5px] text-figma-goldDark">
                                                                    {initials}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <div className="text-[14.5px] font-bold text-figma-dark truncate">{user.name}</div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[13.5px] font-bold text-figma-brown text-right">{userOrdersCount}</span>
                                                            <span className="text-[12px] text-figma-muted text-right truncate">{user.phoneNumber}</span>
                                                        </div>
                                                    );
                                                })}
                                                {customerGridHasMore && (
                                                    <div className="p-4 text-center">
                                                        <button onClick={loadMoreCustomerGrid} disabled={customerGridLoading} className="text-figma-goldDark font-bold text-sm">
                                                            {customerGridLoading ? "Loading..." : "Load more"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center bg-figma-bg">
                                            <div className="text-center text-figma-muted font-semibold">Select a customer from the list to view profile.</div>
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="md:hidden flex flex-col h-full bg-figma-bg pb-20">
                                        <div className="bg-figma-dark p-[env(safe-area-inset-top,20px)_18px_16px] text-figma-cream">
                                            <div className="flex items-center gap-[14px] pt-[8px]">
                                                <div className="flex-1">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[20px] text-figma-cream">Customers</div>
                                                    <div className="text-[12px] text-figma-mutedGold mt-[2px]">{allUsers.length} saved</div>
                                                </div>
                                                <button onClick={() => setEditingUser({ uid: "new_" + Date.now(), name: "", phoneNumber: "", role: "customer", measurements: {} })} className="px-[13px] py-[6px] border border-[#4E3A2A] rounded-full text-[11.5px] font-extrabold text-figma-gold cursor-pointer">
                                                    ADD
                                                </button>
                                            </div>
                                            <div className="bg-figma-darkHover rounded-[14px] p-[12px_14px] mt-[14px] flex items-center gap-[10px]">
                                                <Search className="w-[15px] h-[15px] text-figma-mutedGold" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search name or phone number" 
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    className="flex-1 text-[14.5px] text-figma-cream bg-transparent border-none outline-none placeholder-figma-mutedGold font-sans"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 p-[14px_18px_20px] flex flex-col gap-[10px] overflow-y-auto">
                                            <div className="text-[11.5px] font-extrabold tracking-[1.2px] text-figma-text pl-[2px] pt-[8px]">ALL CUSTOMERS</div>
                                            {displayedCustomers.map((user, i) => {
                                                const initials = user.name ? user.name.substring(0,2).toUpperCase() : "CU";
                                                const userOrdersCount = orders.filter(o => o.customerPhone === user.phoneNumber).length;
                                                return (
                                                    <div key={user.uid} onClick={() => setViewingCustomer(user)} className="bg-white border border-figma-border rounded-[16px] p-[14px] flex gap-[12px] items-center cursor-pointer">
                                                        <div className={`w-[44px] h-[44px] rounded-[12px] ${i%2===0 ? 'bg-figma-cream' : 'bg-figma-grayLight'} flex items-center justify-center font-bricolage font-extrabold text-[15px] text-figma-goldDark`}>
                                                            {initials}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="text-[15.5px] font-bold text-figma-dark truncate">{user.name}</div>
                                                            <div className="text-[12.5px] text-figma-muted mt-[2px] truncate">{user.phoneNumber} &middot; {userOrdersCount} orders</div>
                                                        </div>
                                                        <span className="text-[18px] text-[#A6947F]">›</span>
                                                    </div>
                                                );
                                            })}
                                            {customerGridHasMore && (
                                                <div className="p-4 text-center">
                                                    <button onClick={loadMoreCustomerGrid} disabled={customerGridLoading} className="text-figma-goldDark font-bold text-sm">
                                                        {customerGridLoading ? "Loading..." : "Load more"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Include Customer Profile Modal in Customer Tab logic */}
                                    {viewingCustomer && (
                                        <CustomerDetailModal
    isOpen={!!viewingCustomer}
    customer={viewingCustomer}
    orders={orders.filter(o => o.customerPhone === viewingCustomer.phoneNumber)}
    onClose={() => setViewingCustomer(null)}
    onEditOrder={(order) => { setEditingOrder(order); setViewingCustomer(null); }}
    onEditCustomer={(c) => { setEditingUser(c); setViewingCustomer(null); }}
/>
                                    )}

                                </div>
                            );
                        })()}
{/* ━━━ MONITORING TAB ━━━ */}
                        {currentTab === "monitoring" && (() => {
                            const cuttingOrders = orders.filter(o => o.status === "Cutting");
                            const stitchingOrders = orders.filter(o => o.status === "Stitching");
                            const alterationOrders = orders.filter(o => o.status === "Alteration");
                            const readyOrders = orders.filter(o => o.status === "Ready");

                            const capacityPercent = capacity > 0 ? Math.round((todayLoad / capacity) * 100) : 0;

                            return (
                                <div className="flex flex-col h-full bg-figma-bg md:bg-white animate-fade-in">
                                    {/* Desktop Header */}
                                    <div className="hidden md:flex bg-white border-b border-figma-border py-[18px] px-[30px] items-center gap-[20px] shrink-0">
                                        <div className="flex-1">
                                            <div className="font-bricolage font-extrabold tracking-[-0.5px] text-[25px] text-figma-dark leading-[1.1]">Monitoring</div>
                                            <div className="text-[13px] text-figma-muted mt-1">{orders.filter(o => o.status !== "Delivered").length} orders in the shop &middot; tap a card to move it one stage forward</div>
                                        </div>
                                        <div className="w-[280px]">
                                            <div className="flex justify-between text-[12px] font-bold text-figma-brown">
                                                <span>Today&apos;s capacity</span>
                                                <span className="text-figma-goldDark">{todayLoad} / {capacity} items</span>
                                            </div>
                                            <div className="h-[9px] rounded-[5px] bg-figma-grayLight overflow-hidden mt-[7px]">
                                                <div className="h-full bg-figma-gold" style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Header */}
                                    <div className="md:hidden bg-figma-dark p-[env(safe-area-inset-top,20px)_18px_16px] text-[#F3E9DA]">
                                        <div className="flex items-center gap-[14px] pt-[8px]">
                                            <span className="text-[22px] text-[#E7C87A] cursor-pointer" onClick={() => setCurrentTab("overview")}>‹</span>
                                            <div className="flex-1">
                                                <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[20px] text-figma-cream">Monitoring</div>
                                                <div className="text-[12px] text-figma-mutedGold mt-[2px]">{orders.filter(o => o.status !== "Delivered").length} orders in the shop</div>
                                            </div>
                                            <span className="text-[18px] text-[#E7C87A]">⌕</span>
                                        </div>
                                        <div className="bg-figma-darkHover rounded-[14px] p-[12px_14px] mt-[14px]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[12.5px] font-semibold text-figma-mutedGold">Today&apos;s stitching capacity</span>
                                                <span className="text-[12.5px] font-extrabold text-[#E7C87A]">{todayLoad} / {capacity} items</span>
                                            </div>
                                            <div className="h-[8px] rounded-[4px] bg-[#4E3A2A] mt-[9px] overflow-hidden">
                                                <div className="h-full bg-figma-gold" style={{ width: `${Math.min(capacityPercent, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kanban Board Container (Desktop) */}
                                    <div className="hidden md:grid flex-1 p-[22px_26px] grid-cols-4 gap-[16px] overflow-hidden bg-figma-bg">
                                        
                                        {/* Column: Cutting */}
                                        <div className="bg-[#F5EFE5] border border-figma-border rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-goldDark"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Cutting</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-figma-goldDark">{cuttingOrders.length}</span>
                                            </div>
                                            {cuttingOrders.map(o => (
                                                <div key={o.orderId} onClick={() => handleStatusChange(o.orderId, "Stitching")} className="bg-white border border-figma-border rounded-[13px] p-[13px] cursor-pointer hover:shadow-sm transition-shadow">
                                                    <div className="text-[14px] font-bold text-figma-dark">{o.customerName}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(`garment.${o.garmentType}`) || o.garmentType} &middot; {o.orderId}</div>
                                                    <div className="text-[11.5px] font-bold text-figma-muted mt-[9px]">
                                                        due {new Date(o.targetDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Column: Stitching */}
                                        <div className="bg-[#F5EFE5] border border-figma-border rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-gold"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Stitching</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-figma-goldDark">{stitchingOrders.length}</span>
                                            </div>
                                            {stitchingOrders.map(o => (
                                                <div key={o.orderId} onClick={() => handleStatusChange(o.orderId, "Alteration")} className="bg-white border border-figma-border rounded-[13px] p-[13px] cursor-pointer hover:shadow-sm transition-shadow">
                                                    <div className="text-[14px] font-bold text-figma-dark">{o.customerName}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(`garment.${o.garmentType}`) || o.garmentType} &middot; {o.orderId}</div>
                                                    <div className="text-[11.5px] font-bold text-figma-muted mt-[9px]">
                                                        due {new Date(o.targetDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Column: Alteration */}
                                        <div className="bg-[#F5EFE5] border border-figma-border rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-red"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Alteration</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-figma-goldDark">{alterationOrders.length}</span>
                                            </div>
                                            {alterationOrders.map(o => (
                                                <div key={o.orderId} className="bg-white border border-[#F0CFC6] rounded-[13px] p-[13px]">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-[14px] font-bold text-figma-dark">{o.customerName}</span>
                                                    </div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(`garment.${o.garmentType}`) || o.garmentType} &middot; {o.orderId}</div>
                                                    <button onClick={() => handleStatusChange(o.orderId, "Ready")} className="w-full h-[34px] rounded-[9px] bg-figma-gold text-figma-dark text-[12.5px] font-extrabold flex items-center justify-center mt-[10px] cursor-pointer hover:opacity-90">
                                                        Move to Ready
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Column: Ready */}
                                        <div className="bg-[#EAF0E4] border border-[#D3E0C8] rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-green"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Ready</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-[#4F6742]">{readyOrders.length}</span>
                                            </div>
                                            {readyOrders.map(o => (
                                                <div key={o.orderId} className="bg-white border border-[#D3E0C8] rounded-[13px] p-[13px]">
                                                    <div className="text-[14px] font-bold text-figma-dark">{o.customerName}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(`garment.${o.garmentType}`) || o.garmentType} &middot; Bin {o.binLocation || '-'}</div>
                                                    <button onClick={() => handleStatusChange(o.orderId, "Delivered")} className="w-full h-[34px] rounded-[9px] bg-[#25795A] text-white text-[12.5px] font-extrabold flex items-center justify-center gap-2 mt-[10px] cursor-pointer hover:opacity-90">
                                                        <span>✆</span> Notify & Deliver
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                    
                                    {/* Mobile Content (List) */}
                                    <div className="md:hidden flex-1 p-[14px_18px_80px] flex flex-col gap-[11px] overflow-y-auto bg-figma-bg">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">All Active Orders</span>
                                            <span className="text-[12px] text-figma-muted">Tap card to edit</span>
                                        </div>
                                        {orders.filter(o => o.status !== "Delivered").map(o => (
                                            <div key={o.orderId} className="bg-white border border-figma-border rounded-[18px] p-[15px_16px]">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[15.5px] font-bold text-figma-dark">{o.customerName}</span>
                                                    <span className={`text-[11.5px] font-extrabold ${o.status==='Ready'?'text-figma-green':'text-figma-goldDark'}`}>
                                                        {o.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-[12.5px] text-figma-muted mt-[3px]">
                                                    {t(`garment.${o.garmentType}`) || o.garmentType} &middot; {o.orderId}
                                                </div>
                                                <div className="flex gap-[9px] mt-[13px]">
                                                    <button 
                                                        onClick={() => {
                                                            const nextStatus = o.status === "Pending" ? "Cutting" : o.status === "Cutting" ? "Stitching" : o.status === "Stitching" ? "Alteration" : "Ready";
                                                            if (o.status !== "Ready") handleStatusChange(o.orderId, nextStatus);
                                                            else handleStatusChange(o.orderId, "Delivered");
                                                        }} 
                                                        className="flex-1 h-[44px] rounded-[12px] bg-figma-gold text-figma-dark text-[13.5px] font-extrabold flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                                                    >
                                                        {o.status === "Ready" ? "Deliver" : "Move to Next ➔"}
                                                    </button>
                                                    <button onClick={() => setEditingOrder(o)} className="w-[44px] h-[44px] rounded-[12px] bg-figma-grayLight text-figma-brown text-[16px] flex items-center justify-center cursor-pointer active:scale-95">⋯</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

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
            </main>
            {!isDesktop && <AdminBottomNav currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab as Tab)} />}
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
        </div>
    );
}
