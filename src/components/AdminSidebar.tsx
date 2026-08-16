"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";

interface AdminSidebarProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ currentTab, onTabChange }: AdminSidebarProps) {
    const { logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { lang, toggleLang } = useLanguage();

    const tabs = [
        { key: "overview", label: "Dashboard", icon: "⌂", activeColor: "bg-figma-gold text-figma-dark", inactiveColor: "text-figma-cream", iconColor: "text-figma-dark", inactiveIconColor: "text-figma-mutedGold" },
        { key: "orders", label: "Orders", icon: "☰", badge: "23", activeColor: "bg-figma-gold text-figma-dark", inactiveColor: "text-figma-cream", iconColor: "text-figma-dark", inactiveIconColor: "text-figma-mutedGold" },
        { key: "monitoring", label: "Monitoring", icon: "▦", activeColor: "bg-figma-gold text-figma-dark", inactiveColor: "text-figma-cream", iconColor: "text-figma-dark", inactiveIconColor: "text-figma-mutedGold" },
        { key: "customers", label: "Customers", icon: "☺", badge: "318", activeColor: "bg-figma-gold text-figma-dark", inactiveColor: "text-figma-cream", iconColor: "text-figma-dark", inactiveIconColor: "text-figma-mutedGold" },
        { key: "queries", label: "Queries", icon: "✆", redBadge: "4", activeColor: "bg-figma-gold text-figma-dark", inactiveColor: "text-figma-cream", iconColor: "text-figma-dark", inactiveIconColor: "text-figma-mutedGold" },
        { key: "revenue", label: "Revenue", icon: "₹", activeColor: "bg-figma-gold text-figma-dark", inactiveColor: "text-figma-cream", iconColor: "text-figma-dark", inactiveIconColor: "text-figma-mutedGold" },
    ];

    const bottomTabs = [
        { key: "settings", label: "Prices", icon: "▤" },
        { key: "backup", label: "Backup", icon: "⇪" },
    ];

    return (
        <div className="w-[236px] bg-figma-dark hidden md:flex flex-col py-[24px] px-[14px] shrink-0 z-10 h-full">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="w-[32px] h-[32px] relative flex items-center justify-center">
                    <Image src="/sewing-machine.png" alt="Logo" width={28} height={28} className="object-contain" style={{ filter: "brightness(0) saturate(100%) invert(72%) sepia(45%) saturate(600%) hue-rotate(10deg) brightness(95%) contrast(90%)" }} priority />
                </div>
                <span className="font-bricolage font-extrabold text-[16px] tracking-wide text-figma-cream">S Kumaran Tailors</span>
            </div>

            <div className="flex flex-col gap-[3px]">
                {tabs.map(tab => {
                    const isActive = currentTab === tab.key;
                    return (
                        <div 
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className={`flex items-center gap-[12px] px-[12px] py-[11px] rounded-[11px] cursor-pointer ${isActive ? tab.activeColor : 'hover:bg-figma-darkHover'}`}
                        >
                            <span className={`flex items-center justify-center text-[16px] w-[18px] leading-none ${isActive ? tab.iconColor : tab.inactiveIconColor}`}>{tab.icon}</span>
                            <span className={`flex-1 text-[14px] ${isActive ? 'font-extrabold' : 'font-semibold'} ${isActive ? 'text-figma-dark' : tab.inactiveColor}`}>{tab.label}</span>
                            {tab.badge && <span className={`text-[11.5px] font-extrabold ${isActive ? 'text-figma-dark' : 'text-figma-grayBrown'}`}>{tab.badge}</span>}
                            {tab.redBadge && <span className="px-[7px] py-[2px] rounded-full bg-figma-red text-white text-[11px] font-extrabold">{tab.redBadge}</span>}
                        </div>
                    );
                })}
            </div>

            <div className="h-[1px] bg-figma-darkHover mx-2 my-4"></div>

            <div className="flex flex-col gap-[3px] flex-1">
                {bottomTabs.map(tab => (
                    <div 
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={`flex items-center gap-[12px] px-[12px] py-[11px] rounded-[11px] cursor-pointer hover:bg-figma-darkHover`}
                    >
                        <span className="flex items-center justify-center text-[16px] text-figma-mutedGold w-[18px] leading-none">{tab.icon}</span>
                        <span className="flex-1 text-[14px] font-semibold text-figma-cream">{tab.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-figma-darkHover">
                <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex w-full items-center gap-[12px] px-[12px] py-[11px] rounded-[11px] cursor-pointer hover:bg-red-500/10 text-red-400 transition-colors"
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    <span className="text-[14px] font-semibold">Logout</span>
                </button>
            </div>
        
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-[#140E09]/60 flex items-center justify-center z-50 p-4">
                    <div className="w-[520px] bg-[#FBF7F0] rounded-[24px] p-[30px_32px_26px] shadow-[0_30px_80px_rgba(20,14,9,0.42)]">
                        <div className="flex gap-[16px] items-center">
                            <div className="w-[54px] h-[54px] rounded-[16px] bg-[#FBE9E4] flex items-center justify-center text-[23px] text-[#B4472F]">
                                ⏻
                            </div>
                            <div className="flex-1">
                                <div className="font-bricolage font-extrabold tracking-tight text-[24px] text-figma-dark leading-tight">
                                    Log out of this computer?
                                </div>
                                <div className="text-[13.5px] text-figma-grayBrown mt-[5px]">
                                    S Kumaran Tailor
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-[#EADFCF] rounded-[16px] p-[16px_18px] mt-[20px] flex flex-col gap-[11px]">
                            <div className="flex items-center gap-[11px]">
                                <span className="text-[14px] text-[#6E8B5E]">✓</span>
                                <span className="flex-1 text-[13.5px] text-[#5E4A38]">All orders saved and backed up</span>
                            </div>
                            <div className="flex items-start gap-[11px]">
                                <span className="text-[14px] text-figma-goldDark">•</span>
                                <span className="flex-1 text-[13.5px] text-[#5E4A38] leading-relaxed">
                                    You will need your phone number and password to sign in again.
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-[12px] mt-[20px]">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 h-[52px] rounded-[15px] bg-[#F1EBE3] flex items-center justify-center text-[15px] font-bold text-[#5E4A38] hover:bg-[#EADFCF] transition-colors"
                            >
                                Stay signed in
                            </button>
                            <button 
                                onClick={logout}
                                className="flex-1 h-[52px] rounded-[15px] bg-[#B4472F] flex items-center justify-center text-[15px] font-extrabold text-white hover:bg-red-700 transition-colors"
                            >
                                Yes, log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
</div>
    );
}
