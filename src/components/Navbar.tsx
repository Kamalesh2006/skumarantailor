"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";


import { usePathname } from "next/navigation";

export default function Navbar() {
    const { user, loading } = useAuth();
    const { lang, toggleLang } = useLanguage();
    const pathname = usePathname();

    if (pathname === "/login" || pathname.startsWith("/dashboard")) return null;

    // Always return the Figma-based design for public routes (e.g. '/' and '/track')
    // We already return null for /dashboard and /login.

    return (
        <div className="w-full absolute top-0 left-0 right-0 z-50">
            <div className="w-full bg-[#FBF7F0]/95 backdrop-blur-sm flex items-center justify-between px-6 md:px-11 h-[72px] border-b border-[#EADFCF]">
                <Link href="/" className="flex items-center gap-[9px]">
                    <img src="/sk-mark-dark.png" alt="S Kumaran Tailors Logo" className="w-[32px] h-[32px] object-contain" />
                    <span className="text-[19px] font-bricolage font-extrabold tracking-[-0.4px] text-[#2A1D14]">
                        S Kumaran Tailors
                    </span>
                </Link>
                
                <div className="hidden md:flex items-center gap-7">
                    <div className="flex items-center gap-6">
                        <Link href="/#services" className="text-[14.5px] font-semibold text-[#5E4A38] hover:text-[#2A1D14] transition-colors">Services</Link>
                        <Link href="/#how-it-works" className="text-[14.5px] font-semibold text-[#5E4A38] hover:text-[#2A1D14] transition-colors">How it works</Link>
                        <Link href="/#visit-us" className="text-[14.5px] font-semibold text-[#5E4A38] hover:text-[#2A1D14] transition-colors">Visit us</Link>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link href="/track" className="text-[14px] font-bold text-[#5E4A38] bg-[#F1EBE3] px-4 py-2 rounded-xl hover:bg-[#E8E2D7] transition-colors h-[40px] flex items-center">
                            Track order
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
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[14px] font-bold text-[#F7EEDC] bg-[#2A1D14] px-[18px] h-[40px] flex items-center rounded-xl hover:bg-black transition-colors">
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Hamburger / Quick Actions */}
                <div className="flex items-center gap-3 md:hidden">
                    {!loading && user ? (
                        <Link href="/dashboard" className="text-[12px] font-bold text-white bg-[#2A1D16] px-4 py-2 rounded-[8px]">
                            Dashboard
                        </Link>
                    ) : (
                        <Link href="/login" className="text-[12px] font-bold text-white bg-[#2A1D16] px-4 py-2 rounded-[8px]">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
