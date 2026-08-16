"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface SettingsTabProps {
    pricingInput: Record<string, string>;
    setPricingInput: (val: Record<string, string>) => void;
    handleSavePricing: () => void;
    savingPricing: boolean;
}

export default function SettingsTab({ 
    pricingInput, 
    setPricingInput, 
    handleSavePricing, 
    savingPricing 
}: SettingsTabProps) {
    const { t } = useLanguage();

    const garments = [
        "Shirt", "Pant", "Girl's Dress", "Blouse", "School Uniform (Boy)", 
        "Salwar Kameez", "School Uniform (Girl)", "General", "Police Uniform"
    ];

    return (
        <div className="flex flex-col h-full bg-[#F5EFE5] rounded-[18px] border border-[#EADFCF] overflow-hidden animate-fade-in w-full max-w-5xl">
            <div className="bg-white border-b border-[#EADFCF] p-[20px_26px_16px] flex items-center justify-between">
                <div>
                    <h2 className="font-bricolage font-extrabold tracking-[-0.5px] text-[23px] text-[#2A1D14]">Settings</h2>
                    <div className="text-[12.5px] text-[#7A6A5C] mt-1">Configure your shop&apos;s base pricing and capacity</div>
                </div>
                <button 
                    onClick={handleSavePricing}
                    disabled={savingPricing}
                    className="h-[44px] px-[22px] rounded-[12px] bg-[#C8912F] flex items-center justify-center text-[14.5px] font-extrabold text-[#2A1D14] hover:bg-[#b8852a] transition-colors disabled:opacity-50"
                >
                    {savingPricing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save changes"}
                </button>
            </div>

            <div className="flex-1 p-[24px_30px] grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-[22px] overflow-y-auto">
                {/* Base garment pricing */}
                <div className="bg-white border border-[#EADFCF] rounded-[18px] flex flex-col overflow-hidden">
                    <div className="p-[18px_24px_14px] border-b border-[#F1EBE3] flex items-baseline gap-[12px]">
                        <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#2A1D14]">Base garment pricing</span>
                        <span className="text-[12.5px] text-[#7A6A5C]">{garments.length} garments</span>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
                        {garments.map((gType, idx) => (
                            <div key={gType} className={`flex flex-wrap sm:flex-nowrap items-center gap-[14px] p-[14px_24px] border-b border-[#F1EBE3] ${idx % 2 === 0 ? 'xl:border-r' : ''}`}>
                                <span className="flex-1 text-[14.5px] font-bold text-[#2A1D14] truncate pr-2">{t(`garment.${gType}`) || gType}</span>
                                <div className="w-[116px] bg-[#FBF7F0] border border-[#EADFCF] rounded-[10px] p-[9px_13px] flex items-center gap-[8px] focus-within:border-[#C8912F] focus-within:bg-white transition-colors">
                                    <span className="text-[13px] text-[#A6947F]">₹</span>
                                    <input 
                                        type="number"
                                        value={pricingInput[gType] || ""}
                                        onChange={(e) => setPricingInput({ ...pricingInput, [gType]: e.target.value })}
                                        className="flex-1 bg-transparent border-none outline-none text-[15.5px] font-extrabold text-[#2A1D14] text-right"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-[12px] p-[14px_24px] cursor-pointer hover:bg-[#FBF7F0] transition-colors">
                            <span className="w-[26px] h-[26px] rounded-[9px] border-[1.5px] border-dashed border-[#C8912F] flex items-center justify-center text-[14px] text-[#8A5A1E]">＋</span>
                            <span className="flex-1 text-[14px] font-extrabold text-[#8A5A1E]">Add garment type</span>
                        </div>
                    </div>
                    <div className="mt-auto p-[14px_24px] border-t border-[#F1EBE3] text-[12.5px] text-[#7A6A5C]">
                        Alteration and bulk rates are quoted per order and are not set here.
                    </div>
                </div>

                {/* Right Column: Capacity */}
                <div className="flex flex-col gap-[22px]">
                    <div className="bg-white border border-[#EADFCF] rounded-[18px] p-[20px_22px]">
                        <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#2A1D14]">Daily stitch capacity</div>
                        <div className="text-[13px] text-[#7A6A5C] mt-[5px]">Most sets the shop can take on in one day</div>
                        <div className="flex items-center gap-[14px] mt-[16px]">
                            <div className="flex-1 bg-[#FBF7F0] border-2 border-[#C8912F] rounded-[12px] p-[13px_16px] flex items-baseline gap-[9px]">
                                <span className="font-bricolage font-extrabold text-[26px] text-[#2A1D14] leading-[1]">50</span>
                                <span className="text-[13px] text-[#7A6A5C]">sets per day</span>
                            </div>
                            <button className="w-[44px] h-[44px] rounded-[12px] bg-[#F1EBE3] flex items-center justify-center text-[18px] text-[#5E4A38] hover:bg-[#EADFCF] transition-colors">–</button>
                            <button className="w-[44px] h-[44px] rounded-[12px] bg-[#2A1D14] flex items-center justify-center text-[18px] text-[#E7C87A] hover:bg-[#3B2A20] transition-colors">+</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-white border border-[#EADFCF] rounded-[18px] p-[20px_22px]">
                        <div className="flex items-baseline gap-[10px]">
                            <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#2A1D14]">Next 7 days</span>
                            <span className="text-[12.5px] text-[#7A6A5C]">Booked against 50</span>
                        </div>
                        <div className="flex flex-col gap-[13px] mt-[18px]">
                            {[
                                { day: "Mon, 17 Aug", count: 38, max: 50, color: "#C8912F" },
                                { day: "Tue, 18 Aug", count: 50, max: 50, color: "#B4472F" },
                                { day: "Wed, 19 Aug", count: 31, max: 50, color: "#C8912F" },
                                { day: "Thu, 20 Aug", count: 24, max: 50, color: "#E0CFAE" },
                                { day: "Fri, 21 Aug", count: 17, max: 50, color: "#E0CFAE" },
                                { day: "Sat, 22 Aug", count: 42, max: 50, color: "#C8912F" },
                            ].map((stat) => (
                                <div key={stat.day}>
                                    <div className="flex justify-between text-[13px] font-bold text-[#2A1D14] mb-[6px]">
                                        <span>{stat.day}</span>
                                        <span style={{ color: stat.color }}>{stat.count} / {stat.max}</span>
                                    </div>
                                    <div className="h-[9px] rounded-full bg-[#F1EBE3] overflow-hidden">
                                        <div 
                                            className="h-full rounded-full" 
                                            style={{ width: `${(stat.count / stat.max) * 100}%`, backgroundColor: stat.color }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            <div>
                                <div className="flex justify-between text-[13px] font-bold text-[#A6947F] mb-[6px]">
                                    <span>Sun, 23 Aug</span>
                                    <span>Closed</span>
                                </div>
                                <div className="h-[9px] rounded-full bg-[#F1EBE3]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
