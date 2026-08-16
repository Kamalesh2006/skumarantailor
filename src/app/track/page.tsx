"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { getOrdersByPhone } from "@/lib/firestore";
import type { OrderData } from "@/lib/firestore";

export default function TrackOrderPage() {
    const { t } = useLanguage();
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            setError(t("track.invalidPhone") || "Please enter a valid phone number");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const fetchedOrders = await getOrdersByPhone(cleanPhone);
            // Sort orders: active first, then delivered
            fetchedOrders.sort((a, b) => {
                if (a.status !== "Delivered" && b.status === "Delivered") return -1;
                if (a.status === "Delivered" && b.status !== "Delivered") return 1;
                return new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime();
            });
            setOrders(fetchedOrders);
            setSearched(true);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(t("track.fetchError") || "Failed to fetch orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return { bg: "#F1EBE3", text: "#7A6A5C", border: "#EADFCF" };
            case "Cutting": return { bg: "#F7EEDC", text: "#8A5A1E", border: "#E7C87A" };
            case "Stitching": return { bg: "#F7EEDC", text: "#8A5A1E", border: "#E7C87A" };
            case "Alteration": return { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
            case "Ready": return { bg: "#EAF0E4", text: "#41603A", border: "#D3E0C8" };
            case "Delivered": return { bg: "#F1EBE3", text: "#7A6A5C", border: "#EADFCF" };
            default: return { bg: "#F1EBE3", text: "#7A6A5C", border: "#EADFCF" };
        }
    };

    return (
        <div className="min-h-[calc(100vh-72px)] bg-[#FBF7F0] pt-[72px] flex justify-center px-4 md:px-8 pb-12">
            {!searched ? (
                // Number Entry State
                <div className="w-full max-w-6xl mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center animate-fade-in">
                    <div>
                        <h1 className="font-bricolage font-extrabold tracking-[-2px] text-[40px] md:text-[56px] text-[#2A1D14] leading-[1.05]" style={{ whiteSpace: "pre-line" }}>
                            {t("track.mainTitle") || "Where is\nmy order?"}
                        </h1>
                        <p className="max-w-[440px] text-[15px] md:text-[17px] text-[#6E6058] leading-[1.55] mt-5">
                            {t("track.mainSubtitle") || "Enter the phone number you gave at the shop. Every order under that number will show here, with the stage it has reached."}
                        </p>
                        <form onSubmit={handleSearch} className="max-w-[440px] mt-8">
                            <label className="block text-[11.5px] font-bold tracking-[1.1px] text-[#9A8874] mb-[9px]">
                                {t("track.phoneLabel") || "PHONE NUMBER"}
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 bg-white border-2 border-[#C8912F] rounded-[13px] px-[17px] py-[15px] flex items-center gap-[12px] focus-within:shadow-[0_0_0_4px_rgba(200,145,47,0.15)] transition-shadow">
                                    <span className="text-[15.5px] font-bold text-[#7A6A5C] pr-[12px] border-r border-[#EADFCF]">+91</span>
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none text-[18px] font-bold text-[#2A1D14] tracking-[0.6px] placeholder:text-[#A6947F]"
                                        placeholder="98765 43210"
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading || phone.length < 10}
                                    className="h-[56px] px-[28px] rounded-[13px] bg-[#2A1D14] flex items-center justify-center text-[15.5px] font-extrabold text-[#F7EEDC] disabled:opacity-70 hover:bg-[#1a110c] transition-colors whitespace-nowrap"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (t("track.checkStatus") || "Check status")}
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-[13px] mt-2 font-medium">{error}</p>}
                            <p className="text-[13px] text-[#7A6A5C] mt-[11px]">
                                {t("track.noSignInNeeded") || "No sign in and no order number needed."}
                            </p>
                        </form>
                    </div>

                    <div className="bg-white border border-[#EADFCF] rounded-[22px] p-6 md:p-8 shadow-sm">
                        <h2 className="font-bricolage font-extrabold tracking-[-0.5px] text-[22px] text-[#2A1D14]">
                            {t("track.stagesTitle") || "What the stages mean"}
                        </h2>
                        <div className="flex flex-col gap-5 mt-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-[#F1EBE3] flex items-center justify-center text-[17px] text-[#7A6A5C] shrink-0">◷</div>
                                <div>
                                    <div className="text-[17px] font-extrabold text-[#2A1D14]">{t("track.stagePendingTitle") || "Pending"}</div>
                                    <div className="text-[14px] text-[#7A6A5C] leading-[1.5] mt-1">{t("track.stagePendingDesc") || "Your cloth is with us and the order is in the queue."}</div>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-[#F7EEDC] flex items-center justify-center text-[17px] text-[#8A5A1E] shrink-0">✂</div>
                                <div>
                                    <div className="text-[17px] font-extrabold text-[#2A1D14]">{t("track.stageStitchingTitle") || "Stitching"}</div>
                                    <div className="text-[14px] text-[#7A6A5C] leading-[1.5] mt-1">{t("track.stageStitchingDesc") || "Being cut and stitched. For bulk orders you will see how many sets are done."}</div>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-xl bg-[#EAF0E4] flex items-center justify-center text-[17px] text-[#4F6742] shrink-0">✓</div>
                                <div>
                                    <div className="text-[17px] font-extrabold text-[#2A1D14]">{t("track.stageReadyTitle") || "Ready or Delivered"}</div>
                                    <div className="text-[14px] text-[#7A6A5C] leading-[1.5] mt-1">{t("track.stageReadyDesc") || "Finished and checked. Collect at the shop, or we send it out to you."}</div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-[#F1EBE3] mt-7 pt-5 flex items-center gap-[13px]">
                            <div className="w-[38px] h-[38px] rounded-xl bg-[#25795A] flex items-center justify-center text-[16px] text-white shrink-0">✆</div>
                            <div className="flex-1">
                                <div className="text-[14.5px] font-bold text-[#2A1D14]">{t("track.askUsTitle") || "Rather just ask us?"}</div>
                                <div className="text-[13px] text-[#7A6A5C] mt-0.5">{t("track.askUsDesc") || "Message the shop on WhatsApp"}</div>
                            </div>
                            <span className="text-[18px] text-[#A6947F]">›</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Status View State
                <div className="w-full max-w-5xl mt-6 animate-fade-in">
                    <button 
                        onClick={() => setSearched(false)}
                        className="text-[14px] font-bold text-[#7A6A5C] mb-6 hover:text-[#2A1D14] flex items-center gap-1 transition-colors"
                    >
                        ← Back to search
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
                        <div className="flex-1">
                            <h1 className="font-bricolage font-extrabold tracking-[-1.4px] text-[32px] md:text-[40px] text-[#2A1D14] leading-[1.1]">
                                {orders.length === 0 ? t("track.noOrdersFound") : `${orders.length} ${t("dash.ordersText") || "orders"} ${t("dash.for") || "for"} ${phone}`}
                            </h1>
                            <p className="text-[14.5px] text-[#7A6A5C] mt-2">
                                {orders.length === 0 
                                    ? t("track.tryAnother") 
                                    : t("track.yourOrders")}
                            </p>
                        </div>
                        {orders.length > 0 && (
                            <div className="flex gap-2.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                                {(() => {
                                    const stitching = orders.filter(o => o.status === "Stitching" || o.status === "Cutting" || o.status === "Alteration").length;
                                    const ready = orders.filter(o => o.status === "Ready").length;
                                    const pending = orders.filter(o => o.status === "Pending").length;
                                    
                                    return (
                                        <>
                                            {stitching > 0 && <span className="h-[42px] px-4 rounded-xl bg-[#F7EEDC] border border-[#E7C87A] flex items-center text-[13.5px] font-extrabold text-[#8A5A1E] shrink-0">{stitching} stitching</span>}
                                            {ready > 0 && <span className="h-[42px] px-4 rounded-xl bg-[#EAF0E4] border border-[#D3E0C8] flex items-center text-[13.5px] font-extrabold text-[#41603A] shrink-0">{ready} ready</span>}
                                            {pending > 0 && <span className="h-[42px] px-4 rounded-xl bg-[#F1EBE3] border border-[#EADFCF] flex items-center text-[13.5px] font-extrabold text-[#7A6A5C] shrink-0">{pending} pending</span>}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {orders.map((order) => {
                            const colors = getStatusColor(order.status);
                            const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
                            const isPaid = totalAmount === 0; // Temporary mock since paymentStatus doesn't exist
                            const itemsText = `${t(`garment.${order.garmentType}`) || order.garmentType} × ${order.numberOfSets || 1}`;
                            const isDelivered = order.status === "Delivered";
                            const isPending = order.status === "Pending";
                            const isReady = order.status === "Ready";
                            const isProcessing = order.status === "Stitching" || order.status === "Cutting" || order.status === "Alteration";

                            return (
                                <div key={order.orderId} className={`bg-white border rounded-[22px] p-6 md:p-8 shadow-sm ${isDelivered ? "opacity-70 border-[#F1EBE3]" : "border-[#EADFCF]"}`}>
                                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <h3 className="font-bricolage font-extrabold tracking-[-0.6px] text-[22px] md:text-[26px] text-[#2A1D14] break-words">
                                                {itemsText}
                                            </h3>
                                            <div className="text-[13.5px] text-[#7A6A5C] mt-1">
                                                {order.orderId} &middot; placed {new Date(order.submissionDate || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'long' })} &middot; {isPaid ? "paid" : "total"} ₹{totalAmount.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <span 
                                            className="px-[13px] py-[7px] rounded-full text-[12px] font-extrabold tracking-wide uppercase shrink-0"
                                            style={{ backgroundColor: colors.bg, color: colors.text }}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    {isDelivered ? (
                                        <div className="bg-[#F1EBE3] rounded-2xl p-4 md:p-5 mt-6 font-medium text-[#7A6A5C]">
                                            This order was delivered to you on {new Date(order.targetDeliveryDate || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'long' })}.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col mt-7 relative">
                                                {/* Connecting line */}
                                                <div className="absolute left-[13px] top-[14px] bottom-[38px] w-[3px] bg-[#EADFCF] z-0"></div>
                                                
                                                {/* Pending Step */}
                                                <div className="flex gap-4 relative z-10 mb-6">
                                                    <div className="w-[28px] flex flex-col items-center shrink-0">
                                                        <div className="w-[28px] h-[28px] rounded-full bg-[#6E8B5E] flex items-center justify-center text-[13px] text-white">✓</div>
                                                    </div>
                                                    <div className="flex-1 pb-1">
                                                        <div className="text-[16px] font-bold text-[#2A1D14]">Pending</div>
                                                        <div className="text-[13px] text-[#7A6A5C] mt-0.5">Order received and logged</div>
                                                    </div>
                                                </div>

                                                {/* Processing Step */}
                                                <div className="flex gap-4 relative z-10 mb-6">
                                                    <div className="w-[28px] flex flex-col items-center shrink-0">
                                                        {isPending ? (
                                                            <div className="w-[28px] h-[28px] rounded-full bg-[#F1EBE3] border-2 border-[#EADFCF]"></div>
                                                        ) : isReady || isDelivered ? (
                                                            <div className="w-[28px] h-[28px] rounded-full bg-[#6E8B5E] flex items-center justify-center text-[13px] text-white">✓</div>
                                                        ) : (
                                                            <div className="w-[28px] h-[28px] rounded-full bg-[#C8912F] flex items-center justify-center text-[12px] text-[#2A1D14]" style={{ boxShadow: "0 0 0 5px rgba(200,145,47,0.2)" }}>●</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-1">
                                                        <div className={`text-[16px] md:text-[18px] font-extrabold ${isPending ? "text-[#A6947F]" : "text-[#2A1D14]"}`}>
                                                            {order.status === "Alteration" ? "Alteration" : "Stitching"}
                                                        </div>
                                                        {isProcessing ? (
                                                            <div className="text-[13.5px] font-bold text-[#8A5A1E] mt-1">Happening now</div>
                                                        ) : (
                                                            <div className={`text-[13px] mt-0.5 ${isPending ? "text-[#A6947F]" : "text-[#7A6A5C]"}`}>
                                                                {isReady || isDelivered ? "Completed" : "Next step"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Ready Step */}
                                                <div className="flex gap-4 relative z-10">
                                                    <div className="w-[28px] flex justify-center shrink-0">
                                                        {isReady || isDelivered ? (
                                                            <div className="w-[28px] h-[28px] rounded-full bg-[#6E8B5E] flex items-center justify-center text-[13px] text-white">✓</div>
                                                        ) : (
                                                            <div className="w-[28px] h-[28px] rounded-full bg-[#F1EBE3] border-2 border-[#EADFCF]"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-[16px] font-bold ${isReady || isDelivered ? "text-[#2A1D14]" : "text-[#A6947F]"}`}>
                                                            Ready to collect
                                                        </div>
                                                        <div className={`text-[13px] mt-0.5 ${isReady || isDelivered ? "text-[#7A6A5C]" : "text-[#A6947F]"}`}>
                                                            {isReady 
                                                                ? "Collect anytime between 9 am and 9 pm, closed Sundays." 
                                                                : `Expected ${new Date(order.targetDeliveryDate).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-[#F5EFE5] rounded-2xl p-4 md:p-5 mt-7 flex items-center gap-4 flex-wrap">
                                                <div className="flex-1 min-w-[120px]">
                                                    <div className="text-[12.5px] text-[#7A6A5C]">{isPaid ? "Paid in full" : "Amount due on collection"}</div>
                                                    <div className="text-[19px] font-extrabold tracking-[-0.4px] text-[#2A1D14] mt-1">₹{totalAmount.toLocaleString('en-IN')}</div>
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-full text-[11.5px] font-extrabold shrink-0 ${isPaid ? "bg-[#EAF0E4] text-[#4F6742]" : "bg-[#F7EEDC] text-[#8A5A1E]"}`}>
                                                    {isPaid ? "NOTHING DUE" : "PENDING PAYMENT"}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}

                        {orders.length > 0 && (
                            <div className="bg-[#2A1D14] rounded-[22px] p-6 md:p-[26px_30px] flex flex-col md:flex-row md:items-center gap-4 md:gap-[18px]">
                                <div className="w-[46px] h-[46px] rounded-xl bg-[#25795A] flex items-center justify-center text-[19px] text-white shrink-0">✆</div>
                                <div className="flex-1">
                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[19px] text-[#F7EEDC]">Something not right?</div>
                                    <div className="text-[13.5px] text-[#B9A48A] mt-1">Message the shop and we will check straight away.</div>
                                </div>
                                <a 
                                    href="https://wa.me/919488339199" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="h-[44px] px-5 rounded-xl bg-[#C8912F] flex items-center justify-center text-[14.5px] font-extrabold text-[#2A1D14] hover:bg-[#b8852a] transition-colors shrink-0"
                                >
                                    WhatsApp
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
