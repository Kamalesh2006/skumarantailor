"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "@/lib/ThemeContext";

interface TailorIconProps {
    className?: string;
    size?: number;
    /**
     * If true, the image brightness is inverted so the dark sewing machine
     * appears white — useful on dark backgrounds / brand gradient containers.
     */
    invertForDark?: boolean;
}

/**
 * Vintage sewing machine icon for S Kumaran Tailors.
 * Uses the actual detailed sewing machine PNG for a realistic look.
 * CSS filter recolors it to match the blue/indigo brand theme.
 */
export default function TailorIcon({ className = "", size = 24, invertForDark = false }: TailorIconProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Recolor filters:
    // invertForDark: white silhouette (for on-gradient usage)
    // Dark theme: warm gold so it's visible on dark backgrounds
    // Light theme: dark charcoal
    let themeFilter: string;
    if (invertForDark) {
        themeFilter = "brightness(0) invert(1)";
    } else if (isDark) {
        // Gold: #D4AF37 → warm golden tone
        themeFilter = "brightness(0) saturate(100%) invert(72%) sepia(45%) saturate(600%) hue-rotate(10deg) brightness(95%) contrast(90%)";
    } else {
        // Charcoal: #2D2D2D → dark warm charcoal
        themeFilter = "brightness(0) saturate(100%) invert(15%) sepia(5%) saturate(200%) hue-rotate(20deg) brightness(100%) contrast(95%)";
    }

    return (
        <Image
            src="/sewing-machine.png"
            alt="S Kumaran Tailors - Sewing Machine"
            width={size}
            height={size}
            className={className}
            style={{
                objectFit: "contain",
                filter: themeFilter,
            }}
            priority
        />
    );
}
