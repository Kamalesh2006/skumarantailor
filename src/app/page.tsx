"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";

export default function LandingPage() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-figma-bg flex flex-col font-sans relative text-figma-dark selection:bg-figma-gold/30">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 md:px-10">
                <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] relative">
                        <Image src="/sk-mark-dark.png" alt="S Kumaran Tailors" fill className="object-contain" priority />
                    </div>
                    <span className="font-bricolage font-extrabold tracking-tight text-[18px] hidden sm:block mt-0.5">
                        S Kumaran Tailors
                    </span>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <div className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-figma-dark/80 mr-4">
                        <a href="#services" className="hover:text-figma-dark transition-colors">Services</a>
                        <a href="#how-it-works" className="hover:text-figma-dark transition-colors">How it works</a>
                        <a href="#visit" className="hover:text-figma-dark transition-colors">Visit us</a>
                    </div>
                    
                    <button 
                        onClick={() => router.push("/tracking")}
                        className="hidden md:flex h-[38px] px-5 rounded-full bg-figma-cream border border-figma-border items-center justify-center text-[13px] font-bold hover:bg-white transition-colors"
                    >
                        Track order
                    </button>

                    <div className="flex h-[36px] bg-figma-cream border border-figma-border rounded-full p-1 overflow-hidden">
                        <button className="px-3 h-full rounded-full bg-white shadow-sm text-[12px] font-bold flex items-center justify-center">EN</button>
                        <button className="px-3 h-full rounded-full text-[13px] font-bold text-figma-dark/60 font-noto flex items-center justify-center hover:text-figma-dark transition-colors">தமிழ்</button>
                    </div>

                    <button 
                        onClick={() => router.push("/login")}
                        className="hidden md:flex h-[38px] px-6 rounded-full bg-figma-dark text-figma-cream items-center justify-center text-[13px] font-bold hover:bg-black transition-colors"
                    >
                        Sign in
                    </button>
                </div>
            </header>

            {/* Main Hero Content */}
            <main className="flex-1 flex flex-col items-center justify-center pt-24 px-6 md:px-10 relative z-10">
                <div className="relative w-full max-w-[280px] md:max-w-[400px] aspect-[4/3] mb-8 md:mb-10">
                    <Image src="/sewing-machine-dark.png" alt="Vintage Sewing Machine" fill className="object-contain drop-shadow-2xl opacity-90" priority />
                </div>

                <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
                    <h1 className="font-bricolage font-extrabold tracking-tight text-[42px] md:text-[68px] leading-[1] text-figma-gold drop-shadow-sm mb-4">
                        S Kumaran<br className="md:hidden" /> Tailors
                    </h1>
                    
                    <p className="text-[11px] md:text-[13px] tracking-[2.5px] font-bold text-figma-gold/80 mb-6 md:mb-8">
                        SINCE 1986 &middot; CUDDALORE
                    </p>

                    <p className="text-[15px] md:text-[18px] text-figma-grayBrown max-w-[280px] md:max-w-[500px] leading-relaxed mb-10 md:mb-12">
                        <span className="hidden md:inline">Premium tailoring services in Cuddalore since 1986. </span>
                        Custom-made garments with precision, quality, and care. 
                        <span className="md:hidden"> Your measurements stay saved for next time.</span>
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => router.push("/login")}
                            className="w-full md:w-auto h-[56px] px-8 rounded-2xl bg-figma-dark text-white text-[16px] font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(42,29,20,0.15)] hover:-translate-y-0.5 transition-transform"
                        >
                            Get started
                            <span className="text-figma-gold text-lg ml-1">→</span>
                        </button>
                        
                        <button 
                            onClick={() => router.push("/tracking")}
                            className="w-full md:w-auto h-[56px] px-8 rounded-2xl bg-white border border-figma-border text-figma-dark text-[16px] font-extrabold flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            Track {typeof window !== 'undefined' && window.innerWidth < 768 ? 'my ' : ''}order
                        </button>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-16 md:mt-24 mb-16 md:mb-8 flex items-center justify-center w-full max-w-md md:max-w-xl">
                    <div className="flex-1 flex flex-col items-center border-r border-figma-border/60">
                        <div className="font-bricolage font-extrabold text-[24px] md:text-[28px] text-figma-dark leading-none mb-1">39</div>
                        <div className="text-[11px] md:text-[12px] text-figma-grayBrown font-medium">Years<span className="hidden md:inline"> in the trade</span></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center border-r border-figma-border/60">
                        <div className="font-bricolage font-extrabold text-[24px] md:text-[28px] text-figma-dark leading-none mb-1">318</div>
                        <div className="text-[11px] md:text-[12px] text-figma-grayBrown font-medium"><span className="hidden md:inline">Regular </span>Customers</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <div className="font-bricolage font-extrabold text-[24px] md:text-[28px] text-figma-dark leading-none mb-1">12</div>
                        <div className="text-[11px] md:text-[12px] text-figma-grayBrown font-medium">Garments<span className="hidden md:inline"> types</span></div>
                    </div>
                </div>

                {/* Mobile Bottom Sign In */}
                <div className="md:hidden mt-auto pb-10 text-center">
                    <div className="text-[14px] text-figma-grayBrown">
                        Shop staff? <button onClick={() => router.push("/login")} className="font-extrabold text-[#8A5A1E]">Sign in</button>
                    </div>
                    <div className="text-[#8A5A1E]/30 mt-6 text-xl animate-bounce">
                        ⌄
                    </div>
                </div>
            </main>
        </div>
    );
}
