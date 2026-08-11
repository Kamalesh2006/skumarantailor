"use client";

import React from "react";
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
        <div className="w-[236px] bg-figma-dark hidden md:flex flex-col py-[18px] px-[14px] shrink-0 z-10 h-full">
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

            <div className="flex flex-col gap-[3px]">
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

        </div>
    );
}
