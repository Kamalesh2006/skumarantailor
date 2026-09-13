"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { user, loading } = useAuth();
    const { lang, toggleLang, t } = useLanguage();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (pathname === "/login" || pathname.startsWith("/dashboard")) return null;

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        if (pathname === "/") {
            e.preventDefault();
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                window.history.pushState(null, "", `/#${sectionId}`);
            }
        }
        setMobileMenuOpen(false);
    };

    return (
        <div className="w-full absolute top-0 left-0 right-0 z-50">
            <div className="w-full bg-[#FBF7F0]/95 backdrop-blur-sm flex items-center justify-between px-6 md:px-11 h-[72px] border-b border-[#EADFCF]">
                <Link href="/" onClick={(e) => { if (pathname === "/") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); window.history.pushState(null, "", "/"); } }} className="flex items-center gap-[9px]">
                    <img src="/sk-mark-dark.png" alt="S Kumaran Tailors Logo" className="w-[32px] h-[32px] object-contain" />
                    <span className="text-[19px] font-bricolage font-extrabold tracking-[-0.4px] text-[#2A1D14]">
                        {t("app.name")}
                    </span>
                </Link>
                
                <div className="hidden md:flex items-center gap-7">
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/#services" 
                            onClick={(e) => handleNavClick(e, "services")}
                            className="text-[14.5px] font-semibold text-[#5E4A38] hover:text-[#2A1D14] transition-colors"
                        >
                            {t("nav.services")}
                        </Link>
                        <Link 
                            href="/#how-it-works" 
                            onClick={(e) => handleNavClick(e, "how-it-works")}
                            className="text-[14.5px] font-semibold text-[#5E4A38] hover:text-[#2A1D14] transition-colors"
                        >
                            {t("nav.howItWorks")}
                        </Link>
                        <Link 
                            href="/#visit-us" 
                            onClick={(e) => handleNavClick(e, "visit-us")}
                            className="text-[14.5px] font-semibold text-[#5E4A38] hover:text-[#2A1D14] transition-colors"
                        >
                            {t("nav.visitUs")}
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link href="/track" className="text-[14px] font-bold text-[#5E4A38] bg-[#F1EBE3] px-4 py-2 rounded-xl hover:bg-[#E8E2D7] transition-colors h-[40px] flex items-center">
                            {t("nav.trackOrder")}
                        </Link>
                        
                        <div className="flex items-center bg-[#F1EBE3] p-[3px] rounded-[10px]">
                            <button 
                                onClick={() => lang !== 'en' && toggleLang()}
                                className={`text-[12.5px] font-extrabold px-3 h-[32px] rounded-[8px] transition-all flex items-center ${lang === 'en' ? 'bg-white text-[#2A1D14] border border-[#EADFCF]' : 'text-[#8A7A69] hover:text-[#2A1D14]'}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => lang !== 'ta' && toggleLang()}
                                className={`text-[13px] font-bold px-3 h-[32px] rounded-[8px] transition-all flex items-center font-noto ${lang === 'ta' ? 'bg-white text-[#2A1D14] border border-[#EADFCF]' : 'text-[#8A7A69] hover:text-[#2A1D14]'}`}
                            >
                                தமிழ்
                            </button>
                        </div>

                        {!loading && user ? (
                            <Link href="/dashboard" className="text-[14px] font-bold text-[#F7EEDC] bg-[#2A1D14] px-[18px] h-[40px] flex items-center rounded-xl hover:bg-black transition-colors">
                                {t("nav.dashboard")}
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[14px] font-bold text-[#F7EEDC] bg-[#2A1D14] px-[18px] h-[40px] flex items-center rounded-xl hover:bg-black transition-colors">
                                {t("common.signIn")}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Quick Actions & Language Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <div className="flex items-center bg-[#F1EBE3] p-[2px] rounded-[8px]">
                        <button 
                            onClick={() => lang !== 'en' && toggleLang()}
                            className={`text-[11px] font-extrabold px-2 h-[28px] rounded-[6px] transition-all flex items-center ${lang === 'en' ? 'bg-white text-[#2A1D14] border border-[#EADFCF]' : 'text-[#8A7A69]'}`}
                        >
                            EN
                        </button>
                        <button 
                            onClick={() => lang !== 'ta' && toggleLang()}
                            className={`text-[11px] font-bold px-2 h-[28px] rounded-[6px] transition-all flex items-center font-noto ${lang === 'ta' ? 'bg-white text-[#2A1D14] border border-[#EADFCF]' : 'text-[#8A7A69]'}`}
                        >
                            தமிழ்
                        </button>
                    </div>

                    {!loading && user ? (
                        <Link href="/dashboard" className="text-[12px] font-bold text-white bg-[#2A1D16] px-3 py-1.5 rounded-[8px]">
                            {t("nav.dashboard")}
                        </Link>
                    ) : (
                        <Link href="/login" className="text-[12px] font-bold text-white bg-[#2A1D16] px-3 py-1.5 rounded-[8px]">
                            {t("common.signIn")}
                        </Link>
                    )}

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Navigation Menu"
                        className="w-[34px] h-[34px] rounded-[8px] bg-[#F1EBE3] text-[#2A1D14] flex items-center justify-center ml-0.5"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#FBF7F0] border-b border-[#EADFCF] px-6 py-4 shadow-lg flex flex-col gap-3 animate-slide-up">
                    <Link
                        href="/#services"
                        onClick={(e) => handleNavClick(e, "services")}
                        className="text-[15px] font-bold text-[#5E4A38] hover:text-[#2A1D14] py-2 border-b border-[#F1EBE3] flex items-center justify-between"
                    >
                        <span>{t("nav.services")}</span>
                        <span className="text-[#C8912F]">→</span>
                    </Link>
                    <Link
                        href="/#how-it-works"
                        onClick={(e) => handleNavClick(e, "how-it-works")}
                        className="text-[15px] font-bold text-[#5E4A38] hover:text-[#2A1D14] py-2 border-b border-[#F1EBE3] flex items-center justify-between"
                    >
                        <span>{t("nav.howItWorks")}</span>
                        <span className="text-[#C8912F]">→</span>
                    </Link>
                    <Link
                        href="/#visit-us"
                        onClick={(e) => handleNavClick(e, "visit-us")}
                        className="text-[15px] font-bold text-[#5E4A38] hover:text-[#2A1D14] py-2 border-b border-[#F1EBE3] flex items-center justify-between"
                    >
                        <span>{t("nav.visitUs")}</span>
                        <span className="text-[#C8912F]">→</span>
                    </Link>
                    <Link
                        href="/track"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[15px] font-bold text-[#8A5A1E] bg-[#F7EEDC] px-4 py-2.5 rounded-xl flex items-center justify-between mt-1"
                    >
                        <span>{t("nav.trackOrder")}</span>
                        <span>→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
