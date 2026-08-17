import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Grid, List, Plus, ChevronDown, MoreHorizontal, Loader2, Calendar, LayoutGrid, List as ListIcon } from "lucide-react";
import { OrderData, searchOrdersCursor, searchOrdersPaginated, getOrders, updateOrder, OrderStatus } from "@/lib/firestore";
import { useLanguage } from "@/lib/LanguageContext";

const PAGE_SIZE = 5;
const BATCH_SIZE = 9;

export default function OrdersTab({ onCreateOrder }: { onCreateOrder: () => void }) {
    const { t } = useLanguage();
    
    const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [searching, setSearching] = useState(false);
    
    const [listOrders, setListOrders] = useState<OrderData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);

    const [gridOrders, setGridOrders] = useState<OrderData[]>([]);
    const [gridCursor, setGridCursor] = useState<number | null>(0);
    const [gridHasMore, setGridHasMore] = useState(true);
    const [gridLoading, setGridLoading] = useState(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await updateOrder(orderId, { status: newStatus });
            // Update local state
            setGridOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
            setListOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleBinUpdate = async (orderId: string, newBin: string) => {
        try {
            await updateOrder(orderId, { binLocation: newBin });
            setGridOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, binLocation: newBin } : o));
            setListOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, binLocation: newBin } : o));
        } catch (error) {
            console.error("Failed to update bin", error);
        }
    };


    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    const fetchListPage = useCallback(async (page: number) => {
        setSearching(true);
        const result = await searchOrdersPaginated({
            query: debouncedQuery || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: (statusFilter as OrderStatus) || undefined,
        }, page, PAGE_SIZE);
        setListOrders(result.items);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalOrders(result.total);
        setSearching(false);
    }, [debouncedQuery, dateFrom, dateTo, statusFilter]);

    const fetchGridInitial = useCallback(async () => {
        setSearching(true);
        const result = await searchOrdersCursor({
            query: debouncedQuery || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: (statusFilter as OrderStatus) || undefined,
        }, 0, BATCH_SIZE);
        setGridOrders(result.items);
        setGridCursor(result.nextCursor);
        setGridHasMore(result.hasMore);
        setSearching(false);
        setTotalOrders(result.total);
    }, [debouncedQuery, dateFrom, dateTo, statusFilter]);

    const loadMoreGrid = useCallback(async () => {
        if (!gridHasMore || gridLoading) return;
        setGridLoading(true);
        const result = await searchOrdersCursor({
            query: debouncedQuery || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: (statusFilter as OrderStatus) || undefined,
        }, gridCursor || 0, BATCH_SIZE);
        setGridOrders(prev => [...prev, ...result.items]);
        setGridCursor(result.nextCursor);
        setGridHasMore(result.hasMore);
        setGridLoading(false);
    }, [debouncedQuery, dateFrom, dateTo, statusFilter, gridCursor, gridHasMore, gridLoading]);

    useEffect(() => {
        if (viewMode === "list") fetchListPage(1);
        else fetchGridInitial();
    }, [viewMode, fetchListPage, fetchGridInitial]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-[#F1EBE3] text-[#7A6A5C]";
            case "Cutting": return "bg-[#F7EEDC] text-[#8A5A1E]";
            case "Stitching": return "bg-[#F7EEDC] text-[#8A5A1E]";
            case "Alteration": return "bg-[#FEF2F2] text-[#991B1B]";
            case "Ready": return "bg-[#EAF0E4] text-[#41603A]";
            case "Delivered": return "bg-[#F1EBE3] text-[#7A6A5C]";
            default: return "bg-[#F1EBE3] text-[#7A6A5C]";
        }
    };

    return (
        <div className="flex flex-col h-full bg-figma-bg p-6 lg:p-10 pb-20 overflow-y-auto">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <h1 className="font-bricolage font-extrabold text-[28px] lg:text-[32px] text-figma-dark">
                        {t("orders.allOrders")} <span className="text-figma-grayBrown/60 ml-1">{totalOrders}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center p-1 bg-white border border-figma-border rounded-xl shadow-sm mr-2">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${viewMode === "list" ? "bg-[#F1EBE3] text-figma-dark" : "text-figma-grayBrown hover:bg-gray-50"}`}
                        >
                            <ListIcon className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${viewMode === "grid" ? "bg-[#F1EBE3] text-figma-dark" : "text-figma-grayBrown hover:bg-gray-50"}`}
                        >
                            <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </button>
                    </div>

                    <button
                        onClick={onCreateOrder}
                        className="h-[46px] px-6 rounded-[14px] bg-figma-dark text-white text-[14px] font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(42,29,20,0.1)] hover:-translate-y-0.5 transition-transform shrink-0"
                    >
                        <Plus className="w-5 h-5" />
                        {t("orders.newOrder")}
                    </button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col xl:flex-row gap-3 mb-8">
                <div className="w-full xl:flex-1 sm:min-w-[300px] bg-white border border-figma-border rounded-[14px] flex items-center px-4 min-h-[50px] shadow-sm focus-within:border-figma-gold focus-within:shadow-[0_0_0_2px_rgba(198,143,47,0.1)] transition-all">
                    <Search className="w-5 h-5 text-figma-grayBrown/60 mr-3 shrink-0" />
                    <input
                        type="text"
                        placeholder={t("orders.searchPlaceholder") as string}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 w-full h-full py-2 appearance-none bg-transparent border-none outline-none text-[15px] text-figma-dark placeholder:text-figma-grayBrown/60"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-[13px] font-bold text-figma-grayBrown hover:text-figma-dark px-2 shrink-0">{t("common.clear")}</button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-3 shrink-0 w-full xl:w-auto">
                    <div className="flex items-center bg-white border border-figma-border rounded-[14px] px-3 sm:px-4 h-[50px] shadow-sm w-full">
                        <Calendar className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] text-figma-grayBrown/60 mr-1.5 sm:mr-2 shrink-0" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] sm:text-[14px] font-medium text-figma-dark w-full min-w-0"
                        />
                    </div>
                    
                    <div className="flex items-center bg-white border border-figma-border rounded-[14px] px-3 sm:px-4 h-[50px] shadow-sm w-full">
                        <Calendar className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] text-figma-grayBrown/60 mr-1.5 sm:mr-2 shrink-0" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] sm:text-[14px] font-medium text-figma-dark w-full min-w-0"
                        />
                    </div>

                    <div className="relative col-span-2 sm:col-span-1 w-full sm:min-w-[140px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none bg-white border border-figma-border rounded-[14px] px-4 pr-10 h-[50px] shadow-sm text-[14px] font-medium text-figma-dark focus:outline-none focus:border-figma-gold"
                        >
                            <option value="">{t("orders.allStatuses")}</option>
                            <option value="Pending">{t("orders.status.pending")}</option>
                            <option value="Cutting">{t("orders.status.cutting")}</option>
                            <option value="Stitching">{t("orders.status.stitching")}</option>
                            <option value="Alteration">{t("orders.status.alteration")}</option>
                            <option value="Ready">{t("orders.status.ready")}</option>
                            <option value="Delivered">{t("orders.status.delivered")}</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#7A6A5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="animate-fade-in">
                    {gridOrders.length === 0 && !searching ? (
                        <div className="text-center py-20 bg-white border border-figma-border border-dashed rounded-[24px]">
                            <p className="text-[16px] text-figma-grayBrown font-medium mb-1">{t("orders.noOrders")}</p>
                            <p className="text-[14px] text-figma-grayBrown/60">{t("orders.adjustSearch")}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 lg:gap-6">
                            {gridOrders.map((order) => (
                                <div key={order.orderId} className="bg-white border border-figma-border rounded-[20px] shadow-[0_2px_12px_rgba(42,29,20,0.03)] hover:shadow-[0_4px_16px_rgba(42,29,20,0.06)] transition-shadow overflow-hidden flex flex-col">
                                    <div className="p-5 border-b border-figma-border/50 flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[14px] font-extrabold tracking-[0.5px] text-figma-dark">{order.orderId}</span>
                                            <div className="relative">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                                                    className={`appearance-none px-3 pr-6 py-1 rounded-[8px] text-[11px] font-extrabold uppercase tracking-[0.5px] outline-none cursor-pointer ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Cutting">Cutting</option>
                                                    <option value="Stitching">Stitching</option>
                                                    <option value="Alteration">Alteration</option>
                                                    <option value="Ready">Ready</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bricolage font-extrabold text-[22px] text-figma-dark mb-1 truncate">{order.customerName}</h3>
                                            <p className="text-[14.5px] text-figma-grayBrown font-medium truncate">
                                                {t(`garment.${order.garmentType}`) || order.garmentType} × {order.numberOfSets || 1}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between text-[13px] font-bold text-figma-dark bg-[#FBF7F0] p-3 rounded-xl mt-1">
                                            <span>₹{order.totalAmount?.toLocaleString('en-IN') || 0} total</span>
                                            <span className="text-[#8A5A1E]">Due: {new Date(order.submissionDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                                        </div>
                                    </div>
                                    <div className="bg-[#FBF7F0]/50 p-4 flex items-center justify-between mt-auto">
                                        <div className="text-[13px] font-bold text-figma-grayBrown flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#EADFCF]" />
                                            Bin: <input type="text" value={order.binLocation || ""} onChange={(e) => handleBinUpdate(order.orderId, e.target.value)} className="bg-transparent border-b border-transparent hover:border-figma-grayBrown/30 focus:border-figma-grayBrown outline-none w-12 text-[13px] font-bold text-figma-grayBrown transition-colors" placeholder="—" />
                                        </div>
                                        <button className="w-[32px] h-[32px] flex items-center justify-center rounded-lg hover:bg-black/5 text-figma-grayBrown transition-colors">
                                            <MoreHorizontal className="w-[18px] h-[18px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {gridHasMore && (
                        <div className="mt-10 flex justify-center pb-10">
                            <button
                                onClick={loadMoreGrid}
                                disabled={gridLoading}
                                className="h-[46px] px-8 rounded-xl bg-white border border-figma-border text-[14px] font-extrabold text-figma-dark flex items-center gap-2 hover:bg-[#FBF7F0] transition-colors disabled:opacity-50 shadow-sm"
                            >
                                {gridLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="bg-white border border-figma-border rounded-[20px] shadow-[0_2px_12px_rgba(42,29,20,0.03)] overflow-hidden animate-fade-in flex flex-col min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-figma-border bg-[#FBF7F0]">
                                    <th className="py-4 px-6 text-[12px] font-bold text-figma-grayBrown uppercase tracking-wider">Order ID</th>
                                    <th className="py-4 px-6 text-[12px] font-bold text-figma-grayBrown uppercase tracking-wider">Customer</th>
                                    <th className="py-4 px-6 text-[12px] font-bold text-figma-grayBrown uppercase tracking-wider">Garment</th>
                                    <th className="py-4 px-6 text-[12px] font-bold text-figma-grayBrown uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-[12px] font-bold text-figma-grayBrown uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-[12px] font-bold text-figma-grayBrown uppercase tracking-wider text-right">Amount</th>
                                    <th className="py-4 px-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-figma-border">
                                {listOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-figma-grayBrown">No orders found</td>
                                    </tr>
                                ) : (
                                    listOrders.map(order => (
                                        <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 text-[14px] font-bold text-figma-dark">{order.orderId}</td>
                                            <td className="py-4 px-6 text-[14.5px] font-bold text-figma-dark">{order.customerName}</td>
                                            <td className="py-4 px-6 text-[14px] text-figma-grayBrown">{t(`garment.${order.garmentType}`) || order.garmentType} <span className="text-[12px] text-figma-grayBrown/60 ml-1">×{order.numberOfSets || 1}</span></td>
                                            <td className="py-4 px-6 text-[14px] text-figma-grayBrown">{new Date(order.submissionDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-[0.5px] ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-[14px] font-bold text-figma-dark text-right">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</td>
                                            <td className="py-4 px-4 text-center">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-figma-grayBrown transition-colors">
                                                    <MoreHorizontal className="w-[18px] h-[18px]" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-figma-border bg-[#FBF7F0]/50 flex items-center justify-between mt-auto">
                            <span className="text-[13px] text-figma-grayBrown font-medium">Page {currentPage} of {totalPages}</span>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={currentPage <= 1}
                                    onClick={() => fetchListPage(currentPage - 1)}
                                    className="px-4 py-2 bg-white border border-figma-border rounded-lg text-[13px] font-bold text-figma-dark disabled:opacity-50 shadow-sm"
                                >
                                    Prev
                                </button>
                                <button 
                                    disabled={currentPage >= totalPages}
                                    onClick={() => fetchListPage(currentPage + 1)}
                                    className="px-4 py-2 bg-white border border-figma-border rounded-lg text-[13px] font-bold text-figma-dark disabled:opacity-50 shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
