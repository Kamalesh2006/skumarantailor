"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";

import TailorIcon from "@/components/TailorIcon";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { user, loading } = useAuth();
    const { lang, toggleLang } = useLanguage();
    const pathname = usePathname();

    if (pathname === "/login" || pathname.startsWith("/dashboard")) return null;

    // Always return the Figma-based design for public routes (e.g. '/' and '/track')
    // We already return null for /dashboard and /login.

    return (
        <div className="w-full pt-4 px-4 md:px-8 absolute top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto bg-figma-bg rounded-t-[16px] flex items-center justify-between px-6 h-[72px]" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] relative flex items-center justify-center">
                        <TailorIcon size={28} />
                    </div>
                    <span className="text-[18px] font-bricolage font-extrabold tracking-wide text-figma-dark">
                        S Kumaran Tailors
                    </span>
                </Link>
                
                <div className="hidden md:flex items-center gap-7">
                    <div className="flex items-center gap-6">
                        <Link href="/#services" className="text-[13px] font-bold text-figma-grayBrown hover:text-figma-dark transition-colors">Services</Link>
                        <Link href="/#how-it-works" className="text-[13px] font-bold text-figma-grayBrown hover:text-figma-dark transition-colors">How it works</Link>
                        <Link href="/#visit-us" className="text-[13px] font-bold text-figma-grayBrown hover:text-figma-dark transition-colors">Visit us</Link>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link href="/track" className="text-[13px] font-bold text-figma-dark bg-[#F2EDE4] px-4 py-2.5 rounded-[10px] hover:bg-[#E8E2D7] transition-colors">
                            Track order
                        </Link>
                        
                        <div className="flex items-center bg-[#F2EDE4] p-1 rounded-[10px]">
                            <button 
                                onClick={() => lang !== 'en' && toggleLang()}
                                className={`text-[12px] font-extrabold px-3 py-1.5 rounded-[8px] transition-all ${lang === 'en' ? 'bg-white text-figma-dark shadow-sm' : 'text-figma-grayBrown hover:text-figma-dark'}`}
                            >
                                EN
                            </button>
                            <button 
                                onClick={() => lang !== 'ta' && toggleLang()}
                                className={`text-[12px] font-extrabold px-3 py-1.5 rounded-[8px] transition-all ${lang === 'ta' ? 'bg-white text-figma-dark shadow-sm' : 'text-figma-grayBrown hover:text-figma-dark'}`}
                            >
                                தமிழ்
                            </button>
                        </div>

                        {!loading && user ? (
                            <Link href="/dashboard" className="text-[13px] font-bold text-white bg-[#2A1D16] px-5 py-2.5 rounded-[10px] hover:bg-black transition-colors">
                                Dashboard
                            </Link>
                        ) : (
                            <Link href="/login" className="text-[13px] font-bold text-white bg-[#2A1D16] px-5 py-2.5 rounded-[10px] hover:bg-black transition-colors">
                                Sign In
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
