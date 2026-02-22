"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import TailorIcon from "./TailorIcon";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
    const { t } = useLanguage();

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
            className={`fixed inset-0 z-[100] flex items-center justify-center ${phase === "exit" ? "pointer-events-none" : ""
                }`}
            style={{
                background: "var(--bg-primary)",
                opacity: phase === "exit" ? 0 : 1,
                transition: phase === "exit" ? "opacity 600ms ease" : "none",
            }}
        >
            {/* Animated ambient glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        width: "600px",
                        height: "600px",
                        background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
                        animation: "splashGlowPulse 2s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                        width: "400px",
                        height: "400px",
                        background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)",
                        animation: "splashGlowPulse 2s ease-in-out 0.5s infinite",
                    }}
                />
            </div>

            <div
                className="relative flex flex-col items-center gap-6"
                style={{
                    animation: phase === "enter"
                        ? "none"
                        : phase === "hold"
                            ? "splashFadeScaleIn 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                            : "splashZoomOut 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
                    opacity: phase === "enter" ? 0 : undefined,
                }}
            >
                {/* Logo container with animated ring */}
                <div className="relative">
                    {/* Outer spinning ring */}
                    <div
                        className="absolute -inset-5 rounded-[32px]"
                        style={{
                            border: "2px solid transparent",
                            borderTopColor: "rgba(14, 165, 233, 0.4)",
                            borderRightColor: "rgba(14, 165, 233, 0.15)",
                            animation: "splashSpin 1.5s linear infinite",
                        }}
                    />

                    {/* Pulsing glow ring */}
                    <div
                        className="absolute -inset-3 rounded-[28px]"
                        style={{
                            boxShadow: "0 0 30px rgba(14, 165, 233, 0.2), 0 0 60px rgba(14, 165, 233, 0.1)",
                            animation: "splashRingPulse 1.2s ease-in-out infinite",
                        }}
                    />

                    {/* Icon */}
                    <div
                        className="relative flex h-28 w-28 items-center justify-center rounded-3xl brand-gradient shadow-2xl overflow-hidden"
                        style={{
                            boxShadow: "0 0 40px rgba(14, 165, 233, 0.3), 0 20px 60px rgba(14, 165, 233, 0.2)",
                        }}
                    >
                        <TailorIcon
                            className="text-white drop-shadow-lg"
                            size={72}
                        />

                        {/* Shimmer sweep */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                                animation: "splashShimmer 2s ease-in-out infinite",
                            }}
                        />
                    </div>
                </div>

                {/* Brand Text */}
                <div
                    className="text-center"
                    style={{
                        animation: phase === "hold" ? "splashTextFadeIn 600ms 300ms ease-out both" : "none",
                    }}
                >
                    <h1 className="text-3xl font-bold tracking-tight text-themed-primary">
                        {t("app.name")}
                    </h1>
                    <p className="mt-1.5 text-sm text-themed-secondary">
                        {t("app.tagline")}
                    </p>
                </div>

                {/* Animated loading bar */}
                <div
                    className="w-32 h-1 rounded-full overflow-hidden"
                    style={{
                        background: "var(--bg-tertiary)",
                        animation: phase === "hold" ? "splashTextFadeIn 400ms 500ms ease-out both" : "none",
                    }}
                >
                    <div
                        className="h-full rounded-full brand-gradient"
                        style={{
                            animation: "splashLoadBar 1.8s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>

            {/* Keyframe styles */}
            <style jsx>{`
                @keyframes splashFadeScaleIn {
                    from { opacity: 0; transform: scale(0.7); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes splashZoomOut {
                    from { opacity: 1; transform: scale(1); }
                    to   { opacity: 0; transform: scale(1.5); }
                }
                @keyframes splashSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes splashIconFloat {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-4px); }
                }
                @keyframes splashShimmer {
                    0%   { transform: translateX(-100%); }
                    50%  { transform: translateX(100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes splashRingPulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%      { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes splashGlowPulse {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
                    50%      { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
                }
                @keyframes splashTextFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes splashLoadBar {
                    0%   { width: 0%; margin-left: 0%; }
                    50%  { width: 70%; margin-left: 15%; }
                    100% { width: 0%; margin-left: 100%; }
                }
            `}</style>
        </div>
    );
}
