"use client";

import React from "react";
import TailorIcon from "./TailorIcon";

export default function LogoLoading({ size = 48, className = "" }: { size?: number, className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div className="absolute inset-0 select-none animate-ping opacity-20" style={{ borderRadius: "50%", background: "var(--brand)" }} />
            <div style={{ animation: "splashIconFloat 2s ease-in-out infinite" }}>
                <TailorIcon size={size} />
            </div>
        </div>
    );
}
