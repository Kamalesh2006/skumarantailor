"use client";

import React, { useMemo } from "react";
import { OrderData } from "@/lib/firestore";
import { useLanguage } from "@/lib/LanguageContext";

interface RevenueTabProps {
    orders: OrderData[];
}

export default function RevenueTab({ orders }: RevenueTabProps) {
    const { t } = useLanguage();

    const stats = useMemo(() => {
        let totalExpected = 0;
        let deliveredRevenue = 0;
        let pendingOrdersCount = 0;
        
        const deliveredOrders: OrderData[] = [];
        const pendingOrders: OrderData[] = [];
        
        orders.forEach(o => {
            const amount = o.totalAmount || 0;
            totalExpected += amount;
            if (o.status === "Delivered") {
                deliveredRevenue += amount;
                deliveredOrders.push(o);
            } else {
                pendingOrdersCount++;
                pendingOrders.push(o);
            }
        });
        
        const pendingRevenue = totalExpected - deliveredRevenue;
        
        // Calculate average
        const averagePerOrder = deliveredOrders.length > 0 ? Math.round(deliveredRevenue / deliveredOrders.length) : 0;
        
        // Calculate best day (for simplicity, using targetDeliveryDate or submissionDate)
        const dailyRevenue: Record<string, number> = {};
        let bestDay = { date: "N/A", amount: 0 };
        
        deliveredOrders.forEach(o => {
            const date = new Date(o.targetDeliveryDate || o.submissionDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
            dailyRevenue[date] = (dailyRevenue[date] || 0) + (o.totalAmount || 0);
            if (dailyRevenue[date] > bestDay.amount) {
                bestDay = { date, amount: dailyRevenue[date] };
            }
        });

        // Garment breakdown
        const garmentRevenue: Record<string, number> = {};
        orders.forEach(o => {
            const gType = o.garmentType || "Other";
            garmentRevenue[gType] = (garmentRevenue[gType] || 0) + (o.totalAmount || 0);
        });
        
        const garmentList = Object.entries(garmentRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);

        // Sort pending orders by amount
        pendingOrders.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));

        return {
            totalExpected,
            deliveredRevenue,
            pendingRevenue,
            pendingOrdersCount,
            deliveredCount: deliveredOrders.length,
            averagePerOrder,
            bestDay,
            garmentList,
            pendingOrders
        };
    }, [orders]);

    return (
        <div className="flex flex-col gap-5 animate-fade-in max-w-5xl w-full h-full pb-8 md:pb-0">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-4 shrink-0">
                <div className="bg-[#2A1D14] rounded-[16px] p-[20px_22px]">
                    <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-[#B9A48A] uppercase">THIS MONTH</div>
                    <div className="flex items-end gap-3 mt-2">
                        <span className="font-extrabold tracking-[-1.2px] text-[38px] text-[#F7EEDC] leading-none">₹{stats.totalExpected.toLocaleString()}</span>
                        <span className="mb-[5px] px-[9px] py-[4px] rounded-full bg-[#3B5A2E] text-[#D7E9C8] text-[12px] font-extrabold">▲ 11%</span>
                    </div>
                    <div className="flex h-[9px] rounded-[5px] overflow-hidden mt-4">
                        <div style={{ width: `${stats.totalExpected ? (stats.deliveredRevenue / stats.totalExpected) * 100 : 0}%` }} className="bg-[#6E8B5E]"></div>
                        <div style={{ width: `${stats.totalExpected ? (stats.pendingRevenue / stats.totalExpected) * 100 : 100}%` }} className="bg-[#C8912F]"></div>
                    </div>
                    <div className="flex gap-5 mt-3">
                        <div>
                            <div className="text-[15px] font-extrabold text-[#F7EEDC]">₹{stats.deliveredRevenue.toLocaleString()}</div>
                            <div className="text-[11.5px] text-[#B9A48A] mt-[2px]">Collected</div>
                        </div>
                        <div>
                            <div className="text-[15px] font-extrabold text-[#E7C87A]">₹{stats.pendingRevenue.toLocaleString()}</div>
                            <div className="text-[11.5px] text-[#B9A48A] mt-[2px]">Pending &middot; {stats.pendingOrdersCount} orders</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#EADFCF] rounded-[16px] p-[20px_22px]">
                    <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-[#9A8874] uppercase">ORDERS DELIVERED</div>
                    <div className="font-bricolage font-extrabold tracking-[-1px] text-[34px] text-[#2A1D14] leading-[1.05] mt-2">{stats.deliveredCount}</div>
                    <div className="text-[12.5px] text-[#7A6A5C] mt-[5px]">Average ₹{stats.averagePerOrder.toLocaleString()} per order</div>
                </div>

                <div className="bg-white border border-[#EADFCF] rounded-[16px] p-[20px_22px]">
                    <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-[#9A8874] uppercase">BEST DAY</div>
                    <div className="font-bricolage font-extrabold tracking-[-1px] text-[34px] text-[#2A1D14] leading-[1.05] mt-2">₹{stats.bestDay.amount.toLocaleString()}</div>
                    <div className="text-[12.5px] text-[#7A6A5C] mt-[5px] truncate">{stats.bestDay.date}</div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-5 overflow-hidden min-h-[400px]">
                
                {/* Charts Column */}
                <div className="flex flex-col gap-5 overflow-hidden">
                    {/* Last 6 months */}
                    <div className="bg-white border border-[#EADFCF] rounded-[18px] p-[20px_22px_16px]">
                        <div className="flex items-baseline gap-3 mb-4">
                            <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#2A1D14]">Last 6 months</span>
                            <span className="text-[12.5px] text-[#7A6A5C]">₹7.4L total</span>
                        </div>
                        <div className="flex items-end gap-4 h-[150px]">
                            {/* Static placeholder data to match Figma exactly */}
                            <div className="flex-1 flex flex-col items-center gap-[7px]"><span className="text-[12px] font-bold text-[#7A6A5C]">98k</span><div className="w-full h-[76px] rounded-[8px_8px_3px_3px] bg-[#EADFCF]"></div><span className="text-[11.5px] text-[#9A8874] font-bold">Mar</span></div>
                            <div className="flex-1 flex flex-col items-center gap-[7px]"><span className="text-[12px] font-bold text-[#7A6A5C]">112k</span><div className="w-full h-[87px] rounded-[8px_8px_3px_3px] bg-[#EADFCF]"></div><span className="text-[11.5px] text-[#9A8874] font-bold">Apr</span></div>
                            <div className="flex-1 flex flex-col items-center gap-[7px]"><span className="text-[12px] font-bold text-[#7A6A5C]">147k</span><div className="w-full h-[114px] rounded-[8px_8px_3px_3px] bg-[#E0CFAE]"></div><span className="text-[11.5px] text-[#9A8874] font-bold">May</span></div>
                            <div className="flex-1 flex flex-col items-center gap-[7px]"><span className="text-[12px] font-bold text-[#7A6A5C]">121k</span><div className="w-full h-[94px] rounded-[8px_8px_3px_3px] bg-[#EADFCF]"></div><span className="text-[11.5px] text-[#9A8874] font-bold">Jun</span></div>
                            <div className="flex-1 flex flex-col items-center gap-[7px]"><span className="text-[12px] font-bold text-[#7A6A5C]">128k</span><div className="w-full h-[99px] rounded-[8px_8px_3px_3px] bg-[#EADFCF]"></div><span className="text-[11.5px] text-[#9A8874] font-bold">Jul</span></div>
                            <div className="flex-1 flex flex-col items-center gap-[7px]"><span className="text-[12px] font-extrabold text-[#2A1D14]">142k</span><div className="w-full h-[110px] rounded-[8px_8px_3px_3px] bg-[#C8912F]"></div><span className="text-[11.5px] text-[#2A1D14] font-extrabold">Aug</span></div>
                        </div>
                    </div>

                    {/* By garment */}
                    <div className="flex-1 bg-white border border-[#EADFCF] rounded-[18px] p-[20px_22px]">
                        <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#2A1D14] mb-4">By garment</div>
                        <div className="flex flex-col gap-[13px]">
                            {stats.garmentList.map((g, idx) => {
                                const colors = ["#C8912F", "#8A5A1E", "#6E8B5E", "#A6947F"];
                                const pct = Math.max(10, Math.min(100, (g[1] / stats.totalExpected) * 100 * 2)); // * 2 just for visual scale
                                return (
                                    <div key={g[0]}>
                                        <div className="flex justify-between text-[13.5px] font-bold text-[#2A1D14] mb-1.5">
                                            <span>{t(`garment.${g[0]}`) || g[0]}</span>
                                            <span>₹{g[1].toLocaleString()}</span>
                                        </div>
                                        <div className="h-[9px] rounded-[5px] bg-[#F1EBE3] overflow-hidden">
                                            <div style={{ width: `${pct}%`, background: colors[idx % colors.length] }} className="h-full"></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.garmentList.length === 0 && (
                                <div className="text-[13px] text-[#7A6A5C]">No data available yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Payments Column */}
                <div className="bg-white border border-[#EADFCF] rounded-[18px] flex flex-col overflow-hidden max-h-[500px]">
                    <div className="p-[20px_22px_14px] border-b border-[#F1EBE3] flex items-baseline gap-[10px] shrink-0">
                        <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#2A1D14]">Pending payments</span>
                        <span className="text-[12.5px] font-extrabold text-[#B4472F]">₹{stats.pendingRevenue.toLocaleString()}</span>
                    </div>
                    <div className="overflow-y-auto">
                        {stats.pendingOrders.map(o => (
                            <div key={o.orderId} className="p-[15px_22px] border-b border-[#F1EBE3] hover:bg-[#FBF7F0] transition-colors cursor-pointer">
                                <div className="flex items-baseline gap-[10px]">
                                    <span className="flex-1 text-[14.5px] font-bold text-[#2A1D14]">{o.customerName}</span>
                                    <span className="text-[16px] font-extrabold text-[#2A1D14]">₹{o.totalAmount?.toLocaleString() || 0}</span>
                                </div>
                                <div className="text-[12px] text-[#7A6A5C] mt-[3px]">
                                    {o.orderId} &middot; {o.status === 'Delivered' ? `delivered ${new Date(o.targetDeliveryDate).toLocaleDateString()}` : `due ${new Date(o.targetDeliveryDate).toLocaleDateString()}`}
                                </div>
                            </div>
                        ))}
                        {stats.pendingOrders.length === 0 && (
                            <div className="p-8 text-center text-[#7A6A5C] text-[13px] font-semibold">
                                No pending payments!
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
