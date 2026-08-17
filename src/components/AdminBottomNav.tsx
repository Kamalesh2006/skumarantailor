"use client";

import { useLanguage } from "@/lib/LanguageContext";

interface AdminBottomNavProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
    onOpenNewOrder: () => void;
}

export default function AdminBottomNav({ currentTab, onTabChange, onOpenNewOrder }: AdminBottomNavProps) {
    const { t } = useLanguage();
    
    const tabs = [
        { key: "overview", label: t("dash.tab.overview"), icon: "⌂" },
        { key: "orders", label: t("dash.tab.orders"), icon: "☰" },
        { key: "customers", label: t("dash.tab.customers"), icon: "☺" },
        { key: "queries", label: t("dash.tab.queries"), icon: "✆" },
    ];

    return (
        <div className="md:hidden block relative">
            <button 
                onClick={onOpenNewOrder}
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
                            <div className={`w-[52px] h-[32px] rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-[#F1EBE3]' : 'bg-transparent'}`}>
                                <span className={`text-[20px] ${isActive ? 'text-[#8A5A1E]' : 'text-[#A6947F]'}`}>
                                    {tab.icon}
                                </span>
                            </div>
                            <span className={`text-[11px] ${isActive ? 'font-bold text-[#5E4A38]' : 'font-semibold text-[#A6947F]'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
