"use client";

import React, { useState, useEffect } from "react";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

    useEffect(() => {
        const holdTimer = setTimeout(() => setPhase("hold"), 100);
        const exitTimer = setTimeout(() => setPhase("exit"), 2400);
        const doneTimer = setTimeout(() => onComplete(), 3000);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(exitTimer);
            clearTimeout(doneTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#2A1D14] ${phase === "exit" ? "pointer-events-none" : ""}`}
            style={{
                opacity: phase === "exit" ? 0 : 1,
                transition: phase === "exit" ? "opacity 600ms ease" : "none",
            }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(200,145,47,.18)_0,transparent_50%)]"></div>
            
            <div 
                className="relative flex-1 flex flex-col items-center justify-center text-center"
                style={{
                    animation: phase === "enter"
                        ? "none"
                        : phase === "hold"
                            ? "splashFadeScaleIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                            : "splashZoomOut 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
                    opacity: phase === "enter" ? 0 : undefined,
                }}
            >
                <img src="/sewing-machine.png" alt="Antique sewing machine" className="w-[268px] h-[268px] object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
                <div className="font-bricolage font-extrabold tracking-[-2.2px] text-[62px] text-[#F7EEDC] leading-[1.05] mt-[26px]">
                    S Kumaran Tailors
                </div>
                <div className="text-[13px] tracking-[4px] font-bold text-[#C8912F] mt-[18px]">
                    SINCE 1986 &middot; CUDDALORE
                </div>
                
                {/* Progress bar */}
                <div className="w-[240px] h-[5px] rounded-[3px] bg-[#3B2A20] overflow-hidden mt-[52px]">
                    <div className="h-[5px] rounded-[3px] bg-[#C8912F]" style={{ animation: 'splashProgressBar 2.4s ease-in-out infinite' }}></div>
                </div>
                <div className="text-[13.5px] text-[#8C7761] mt-[16px]">
                    Loading orders, customers and queries…
                </div>
            </div>

            <div className="absolute bottom-0 w-full pb-[34px] text-center text-[11.5px] tracking-[2px] font-bold text-[#4E3A2A]">
                CUSTOMER & ORDER MANAGEMENT
            </div>

            <style jsx>{`
                @keyframes splashFadeScaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes splashZoomOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(1.1); }
                }
                @keyframes splashProgressBar {
                    0%   { width: 0%; }
                    50%  { width: 80%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}
