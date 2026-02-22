import React from "react";

interface TailorIconProps {
    className?: string;
    size?: number;
}

/**
 * SK monogram for S Kumaran Tailors — pure SVG, no external image.
 */
export default function TailorIcon({ className = "", size = 24 }: TailorIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width={size}
            height={size}
            className={className}
        >
            {/* S letter */}
            <text
                x="8"
                y="35"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="bold"
                fontSize="32"
                fill="currentColor"
                letterSpacing="-2"
            >
                S
            </text>

            {/* K letter — offset and slightly overlapping */}
            <text
                x="22"
                y="35"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontWeight="bold"
                fontSize="32"
                fill="currentColor"
                letterSpacing="-1"
            >
                K
            </text>

            {/* Needle line crossing diagonally */}
            <line
                x1="6"
                y1="38"
                x2="42"
                y2="8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.6"
            />

            {/* Needle eye (small circle at top) */}
            <circle cx="42" cy="8" r="1.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />

            {/* Thread from needle */}
            <path
                d="M42 8 Q46 12, 43 16 Q40 20, 44 23"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.4"
                strokeDasharray="2 1.5"
            />
        </svg>
    );
}
