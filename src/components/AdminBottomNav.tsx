"use client";

import React from "react";

interface AdminBottomNavProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

export default function AdminBottomNav({ currentTab, onTabChange }: AdminBottomNavProps) {
    const tabs = [
        { key: "overview", label: "Home", icon: "⌂" },
        { key: "orders", label: "Orders", icon: "☰" },
        { key: "customers", label: "Customers", icon: "☺" },
        { key: "queries", label: "Queries", icon: "✆" },
    ];

    return (
        <div className="md:hidden block relative">
            <button 
                onClick={() => { /* Open New Order Modal or Action */ }}
                className="absolute right-[20px] top-[-62px] w-[60px] h-[60px] rounded-[20px] bg-figma-gold shadow-[0_8px_20px_rgba(200,145,47,0.4)] flex items-center justify-center text-[28px] text-figma-dark font-light border-none z-20 cursor-pointer active:scale-95 transition-transform"
            >
                +
            </button>
            <nav className="flex bg-white border-t border-figma-border px-[8px] pt-[10px] pb-[16px] relative z-10 pb-safe">
                {tabs.map(tab => {
                    const isActive = currentTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => onTabChange(tab.key)}
                            className="flex-1 flex flex-col items-center gap-[4px] bg-transparent border-none cursor-pointer p-0"
                        >
                            <span className={`text-[19px] ${isActive ? 'text-figma-goldDark' : 'text-[#A6947F]'}`}>
                                {tab.icon}
                            </span>
                            <span className={`text-[11px] ${isActive ? 'font-bold text-figma-goldDark' : 'font-semibold text-[#A6947F]'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
