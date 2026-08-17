"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";

type Tab = "overview" | "orders" | "customers" | "monitoring" | "settings" | "logs" | "queries" | "revenue" | "backup";

interface MobileMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function MobileMenuModal({ isOpen, onClose, currentTab, onTabChange }: MobileMenuModalProps) {
    const { logout } = useAuth();
    const { lang, toggleLang } = useLanguage();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    if (!isOpen) return null;

    const handleTabClick = (tab: Tab) => {
        onTabChange(tab);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-[70] flex justify-end">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-[#140E09]/55" onClick={onClose}></div>
                
                {/* Slide-in Menu Panel */}
                <div className="relative w-[330px] h-full bg-[#FBF7F0] shadow-[-14px_0_40px_rgba(20,14,9,0.35)] flex flex-col overflow-y-auto">
                    {/* Header */}
                    <div className="bg-[#2A1D14] p-[14px_20px_20px] text-[#F3E9DA]">
                        <div className="flex justify-end text-[20px] text-[#B9A48A] cursor-pointer" onClick={onClose}>✕</div>
                        <div className="flex items-center gap-[12px] mt-[6px]">
                            <div className="w-[38px] h-[38px] bg-[#C8912F] rounded-lg flex items-center justify-center font-bricolage font-extrabold text-[#2A1D14]">SK</div>
                            <div>
                                <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-[#F7EEDC]">Kumaran S.</div>
                                <div className="text-[12px] text-[#B9A48A] mt-[2px]">Owner · Cuddalore branch</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-[16px_16px_0] flex flex-col gap-[4px]">
                        <div className="text-[11.5px] font-extrabold tracking-[1.2px] text-[#9A8874] p-[6px_8px_8px]">{t("menu.shop")}</div>
                        
                        <div 
                            onClick={() => handleTabClick("revenue")}
                            className={`flex items-center gap-[14px] p-[14px_12px] rounded-[14px] cursor-pointer ${currentTab === 'revenue' ? 'bg-[#F7EEDC]' : ''}`}
                        >
                            <span className="text-[18px] text-[#8A5A1E] w-[22px]">₹</span>
                            <span className="flex-1 text-[15px] font-bold text-[#2A1D14]">{t("menu.revenue")}</span>
                        </div>
                        
                        <div 
                            onClick={() => handleTabClick("settings")}
                            className={`flex items-center gap-[14px] p-[14px_12px] rounded-[14px] cursor-pointer ${currentTab === 'settings' ? 'bg-[#F7EEDC]' : ''}`}
                        >
                            <span className="text-[18px] text-[#8A5A1E] w-[22px]">☰</span>
                            <span className="flex-1 text-[15px] font-bold text-[#2A1D14]">{t("menu.pricesCapacity")}</span>
                            <span className="text-[16px] text-[#A6947F]">›</span>
                        </div>
                        
                        <div 
                            onClick={() => handleTabClick("monitoring")}
                            className={`flex items-center gap-[14px] p-[14px_12px] rounded-[14px] cursor-pointer ${currentTab === 'monitoring' ? 'bg-[#F7EEDC]' : ''}`}
                        >
                            <span className="text-[18px] text-[#8A5A1E] w-[22px]">▦</span>
                            <span className="flex-1 text-[15px] font-bold text-[#2A1D14]">{t("menu.monitoringBoard")}</span>
                            <span className="text-[16px] text-[#A6947F]">›</span>
                        </div>
                        
                        <div 
                            onClick={() => handleTabClick("logs")}
                            className={`flex items-center gap-[14px] p-[14px_12px] rounded-[14px] cursor-pointer ${currentTab === 'logs' ? 'bg-[#F7EEDC]' : ''}`}
                        >
                            <span className="text-[18px] text-[#8A5A1E] w-[22px]">▤</span>
                            <span className="flex-1 text-[15px] font-bold text-[#2A1D14]">{t("menu.queryLogs")}</span>
                            <span className="text-[16px] text-[#A6947F]">›</span>
                        </div>
                        
                        <div 
                            onClick={() => handleTabClick("backup")}
                            className={`flex items-center gap-[14px] p-[14px_12px] rounded-[14px] cursor-pointer ${currentTab === 'backup' ? 'bg-[#F7EEDC]' : ''}`}
                        >
                            <span className="text-[18px] text-[#8A5A1E] w-[22px]">⇪</span>
                            <span className="flex-1 text-[15px] font-bold text-[#2A1D14]">{t("menu.backupData")}</span>
                        </div>

                        <div className="text-[11.5px] font-extrabold tracking-[1.2px] text-[#9A8874] p-[16px_8px_8px]">{t("menu.app")}</div>
                        
                        <div className="p-[12px] rounded-[14px] bg-white border border-[#EADFCF]">
                            <div className="text-[13px] font-bold text-[#2A1D14] mb-[9px]">{t("menu.language")}</div>
                            <div className="flex gap-[6px] bg-[#F1EBE3] rounded-[12px] p-[4px]">
                                <span 
                                    onClick={() => lang !== 'en' && toggleLang()}
                                    className={`flex-1 h-[38px] rounded-[9px] text-[14px] font-bold flex items-center justify-center cursor-pointer ${lang === 'en' ? 'bg-[#2A1D14] text-[#F7EEDC]' : 'text-[#5E4A38]'}`}
                                >English</span>
                                <span 
                                    onClick={() => lang !== 'ta' && toggleLang()}
                                    className={`flex-1 h-[38px] rounded-[9px] text-[15px] font-bold flex items-center justify-center cursor-pointer ${lang === 'ta' ? 'bg-[#2A1D14] text-[#F7EEDC]' : 'text-[#5E4A38]'}`}
                                >தமிழ்</span>
                            </div>
                        </div>
                        
                        <div className="p-[12px] rounded-[14px] bg-white border border-[#EADFCF] mt-[8px]">
                            <div className="text-[13px] font-bold text-[#2A1D14] mb-[9px]">{t("menu.appearance")}</div>
                            <div className="flex gap-[6px] bg-[#F1EBE3] rounded-[12px] p-[4px]">
                                <span className="flex-1 h-[38px] rounded-[9px] bg-white border border-[#EADFCF] text-[#2A1D14] text-[14px] font-bold flex items-center justify-center cursor-pointer">☀ {t("menu.light")}</span>
                                <span className="flex-1 h-[38px] rounded-[9px] text-[#5E4A38] text-[14px] font-bold flex items-center justify-center cursor-pointer">☾ {t("menu.dark")}</span>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="mt-auto p-[16px_20px_24px] border-t border-[#EADFCF] flex items-center gap-[12px] cursor-pointer"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        <span className="text-[16px] text-[#B4472F]">⏻</span>
                        <span className="text-[15px] font-bold text-[#B4472F]">{t("common.logout")}</span>
                    </div>
                </div>
            </div>

            {/* Logout Confirm Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-[#140E09]/60 flex items-center justify-center z-[80] p-4">
                    <div className="w-full max-w-[520px] bg-[#FBF7F0] rounded-[24px] p-[30px_32px_26px] shadow-[0_30px_80px_rgba(20,14,9,0.42)]">
                        <div className="flex gap-[16px] items-center">
                            <div className="w-[54px] h-[54px] rounded-[16px] bg-[#FBE9E4] flex items-center justify-center text-[23px] text-[#B4472F]">
                                ⏻
                            </div>
                            <div className="flex-1">
                                <div className="font-bricolage font-extrabold tracking-tight text-[24px] text-[#2A1D14] leading-tight">
                                    {t("menu.logoutConfirm")}
                                </div>
                                <div className="text-[13.5px] text-[#7A6A5C] mt-[5px]">
                                    {t("menu.logoutDesc")}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-[#EADFCF] rounded-[16px] p-[16px_18px] mt-[20px] flex flex-col gap-[11px]">
                            <div className="flex items-center gap-[11px]">
                                <span className="text-[14px] text-[#6E8B5E]">✓</span>
                                <span className="flex-1 text-[13.5px] text-[#5E4A38]">{t("menu.logoutSaved")}</span>
                            </div>
                            <div className="flex items-start gap-[11px]">
                                <span className="text-[14px] text-[#C8912F]">•</span>
                                <span className="flex-1 text-[13.5px] text-[#5E4A38] leading-relaxed">
                                    {t("menu.logoutWarn")}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-[12px] mt-[20px]">
                            <button 
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 h-[52px] rounded-[15px] bg-[#F1EBE3] flex items-center justify-center text-[15px] font-bold text-[#5E4A38] hover:bg-[#EADFCF] transition-colors"
                            >
                                {t("menu.staySignedIn")}
                            </button>
                            <button 
                                onClick={logout}
                                className="flex-1 h-[52px] rounded-[15px] bg-[#B4472F] flex items-center justify-center text-[15px] font-extrabold text-white hover:bg-red-700 transition-colors"
                            >
                                {t("menu.yesLogout")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
