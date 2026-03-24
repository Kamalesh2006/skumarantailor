"use client";

import React from "react";
import { GarmentType } from "@/lib/measurements";
import { useLanguage } from "@/lib/LanguageContext";

interface VisualizerProps {
    garmentType: GarmentType;
    measurements: Record<string, number | string>;
}

/* ─── Wireframe 3D-style Mannequin SVGs ─── */

function WireframeShirt({ measurements }: { measurements: Record<string, number | string> }) {
    return (
        <svg viewBox="0 0 300 360" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 12px rgba(212,175,55,0.3))" }}>
            {/* Grid background */}
            <defs>
                <pattern id="grid-shirt" width="15" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="glow-shirt" cx="50%" cy="45%" r="50%">
                    <stop offset="0%" stopColor="rgba(212,175,55,0.15)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="wireStroke-shirt" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8B5A2B" stopOpacity="0.6" />
                </linearGradient>
                <marker id="arrow-s" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
            </defs>

            <rect width="300" height="360" fill="url(#grid-shirt)" />
            <ellipse cx="150" cy="160" rx="130" ry="130" fill="url(#glow-shirt)" />

            {/* Wireframe Torso — 3D mannequin style */}
            {/* Neck */}
            <ellipse cx="150" cy="40" rx="18" ry="8" fill="none" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" />
            <line x1="132" y1="40" x2="125" y2="55" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" />
            <line x1="168" y1="40" x2="175" y2="55" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" />

            {/* Shoulders + sleeves */}
            <path d="M 125 55 L 70 70 L 50 140 L 75 145 L 90 90 L 95 55" fill="none" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 175 55 L 230 70 L 250 140 L 225 145 L 210 90 L 205 55" fill="none" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Collar */}
            <path d="M 125 55 C 130 75, 170 75, 175 55" fill="none" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" />

            {/* Body outline */}
            <path d="M 95 55 L 90 280 C 90 290, 210 290, 210 280 L 205 55" fill="none" stroke="url(#wireStroke-shirt)" strokeWidth="1.5" />

            {/* Center line */}
            <line x1="150" y1="70" x2="150" y2="280" stroke="rgba(212,175,55,0.15)" strokeWidth="1" strokeDasharray="6 6" />

            {/* Horizontal wireframe lines */}
            {[90, 120, 150, 180, 210, 240].map((y) => {
                const w = y < 100 ? 110 : y > 220 ? 100 : 115;
                return <line key={y} x1={150 - w / 2} y1={y} x2={150 + w / 2} y2={y} stroke="rgba(212,175,55,0.08)" strokeWidth="0.8" />;
            })}

            {/* Vertical wireframe lines */}
            {[110, 130, 150, 170, 190].map((x) => (
                <line key={x} x1={x} y1={60} x2={x} y2={275} stroke="rgba(212,175,55,0.06)" strokeWidth="0.8" />
            ))}

            {/* Glowing highlight zones for measurements */}
            {measurements.chest && (
                <ellipse cx="150" cy="110" rx="55" ry="10" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
            )}
            {measurements.waist && (
                <ellipse cx="150" cy="185" rx="50" ry="8" fill="rgba(212,175,55,0.06)" stroke="rgba(139,90,43,0.25)" strokeWidth="1" />
            )}

            {/* ── Measurement Lines ── */}
            {/* Shoulder */}
            {measurements.shoulder && (
                <g>
                    <line x1="70" y1="58" x2="230" y2="58" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#arrow-s)" markerStart="url(#arrow-s)" />
                    <rect x="120" y="44" width="60" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="150" y="55" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.shoulder}&quot;</text>
                </g>
            )}
            {/* Chest */}
            {measurements.chest && (
                <g>
                    <line x1="90" y1="110" x2="210" y2="110" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />
                    <rect x="120" y="96" width="60" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="150" y="107" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.chest}&quot;</text>
                </g>
            )}
            {/* Waist */}
            {measurements.waist && (
                <g>
                    <line x1="93" y1="185" x2="207" y2="185" stroke="#8B5A2B" strokeWidth="1.5" strokeDasharray="3 2" />
                    <rect x="120" y="171" width="60" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#8B5A2B" strokeWidth="0.5" />
                    <text x="150" y="182" fontSize="10" fill="#8B5A2B" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.waist}&quot;</text>
                </g>
            )}
            {/* Sleeve */}
            {measurements.sleeve && (
                <g>
                    <line x1="230" y1="70" x2="250" y2="140" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#arrow-s)" />
                    <rect x="252" y="98" width="44" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="274" y="109" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.sleeve}&quot;</text>
                </g>
            )}
            {/* Length */}
            {measurements.length && (
                <g>
                    <line x1="40" y1="40" x2="40" y2="280" stroke="#8B5A2B" strokeWidth="1.5" markerEnd="url(#arrow-s)" markerStart="url(#arrow-s)" />
                    <rect x="10" y="152" width="44" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#8B5A2B" strokeWidth="0.5" />
                    <text x="32" y="163" fontSize="10" fill="#8B5A2B" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.length}&quot;</text>
                </g>
            )}
        </svg>
    );
}

function WireframePant({ measurements }: { measurements: Record<string, number | string> }) {
    return (
        <svg viewBox="0 0 260 400" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 12px rgba(212,175,55,0.3))" }}>
            <defs>
                <pattern id="grid-pant" width="15" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="glow-pant" cx="50%" cy="35%" r="50%">
                    <stop offset="0%" stopColor="rgba(212,175,55,0.12)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="wireStroke-pant" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8B5A2B" stopOpacity="0.6" />
                </linearGradient>
                <marker id="arrow-p" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
            </defs>

            <rect width="260" height="400" fill="url(#grid-pant)" />
            <ellipse cx="130" cy="160" rx="100" ry="140" fill="url(#glow-pant)" />

            {/* Waistband */}
            <path d="M 70 30 L 190 30 L 195 50 L 65 50 Z" fill="none" stroke="url(#wireStroke-pant)" strokeWidth="1.5" />

            {/* Left leg */}
            <path d="M 65 50 L 55 160 L 55 370 L 105 370 L 120 160 L 130 100" fill="none" stroke="url(#wireStroke-pant)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Right leg */}
            <path d="M 195 50 L 205 160 L 205 370 L 155 370 L 140 160 L 130 100" fill="none" stroke="url(#wireStroke-pant)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Center seam */}
            <line x1="130" y1="50" x2="130" y2="170" stroke="rgba(212,175,55,0.12)" strokeWidth="1" strokeDasharray="6 6" />

            {/* Horizontal wireframe lines */}
            {[80, 120, 160, 200, 240, 280, 320].map((y) => {
                const leftX = y < 160 ? 60 : 55;
                const rightX = y < 160 ? 200 : 205;
                return <line key={y} x1={leftX} y1={y} x2={rightX} y2={y} stroke="rgba(212,175,55,0.06)" strokeWidth="0.8" />;
            })}

            {/* Glowing highlight zones */}
            {measurements.waist && (
                <ellipse cx="130" cy="40" rx="62" ry="6" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
            )}

            {/* ── Measurement Lines ── */}
            {/* Waist */}
            {measurements.waist && (
                <g>
                    <line x1="70" y1="20" x2="190" y2="20" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#arrow-p)" markerStart="url(#arrow-p)" />
                    <rect x="100" y="6" width="60" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="130" y="17" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.waist}&quot;</text>
                </g>
            )}
            {/* Length */}
            {measurements.length && (
                <g>
                    <line x1="30" y1="30" x2="30" y2="370" stroke="#8B5A2B" strokeWidth="1.5" markerEnd="url(#arrow-p)" markerStart="url(#arrow-p)" />
                    <rect x="8" y="192" width="44" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#8B5A2B" strokeWidth="0.5" />
                    <text x="30" y="203" fontSize="10" fill="#8B5A2B" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.length}&quot;</text>
                </g>
            )}
            {/* Inseam */}
            {measurements.inseam && (
                <g>
                    <line x1="130" y1="170" x2="130" y2="370" stroke="#D4AF37" strokeWidth="1.5" markerEnd="url(#arrow-p)" markerStart="url(#arrow-p)" />
                    <rect x="133" y="262" width="50" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="158" y="273" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.inseam}&quot;</text>
                </g>
            )}
        </svg>
    );
}

function WireframeDress({ measurements }: { measurements: Record<string, number | string> }) {
    return (
        <svg viewBox="0 0 300 360" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 12px rgba(212,175,55,0.3))" }}>
            <defs>
                <pattern id="grid-dress" width="15" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="glow-dress" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="rgba(212,175,55,0.12)" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="wireStroke-dress" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8B5A2B" stopOpacity="0.6" />
                </linearGradient>
                <marker id="arrow-d" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                </marker>
            </defs>

            <rect width="300" height="360" fill="url(#grid-dress)" />
            <ellipse cx="150" cy="160" rx="120" ry="130" fill="url(#glow-dress)" />

            {/* Neck */}
            <ellipse cx="150" cy="30" rx="18" ry="8" fill="none" stroke="url(#wireStroke-dress)" strokeWidth="1.5" />

            {/* Bodice */}
            <path d="M 132 30 L 105 50 L 85 70 L 105 80 L 110 60 L 120 50" fill="none" stroke="url(#wireStroke-dress)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 168 30 L 195 50 L 215 70 L 195 80 L 190 60 L 180 50" fill="none" stroke="url(#wireStroke-dress)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Upper body */}
            <path d="M 120 50 L 115 130 C 115 135, 185 135, 185 130 L 180 50" fill="none" stroke="url(#wireStroke-dress)" strokeWidth="1.5" />

            {/* Waistline */}
            <ellipse cx="150" cy="135" rx="35" ry="6" fill="rgba(212,175,55,0.06)" stroke="rgba(212,175,55,0.15)" strokeWidth="1" />

            {/* Skirt flare */}
            <path d="M 115 130 L 60 330 C 80 340, 220 340, 240 330 L 185 130" fill="none" stroke="url(#wireStroke-dress)" strokeWidth="1.5" />

            {/* Skirt wireframe lines */}
            {[170, 210, 250, 290].map((y) => {
                const spread = ((y - 130) / 200) * 85;
                return <line key={y} x1={150 - 35 - spread} y1={y} x2={150 + 35 + spread} y2={y} stroke="rgba(212,175,55,0.06)" strokeWidth="0.8" />;
            })}

            {/* Center fold line */}
            <line x1="150" y1="50" x2="150" y2="330" stroke="rgba(212,175,55,0.1)" strokeWidth="1" strokeDasharray="6 6" />

            {/* ── Measurement Lines ── */}
            {/* Chest */}
            {measurements.chest && (
                <g>
                    <line x1="115" y1="90" x2="185" y2="90" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />
                    <rect x="120" y="76" width="60" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#D4AF37" strokeWidth="0.5" />
                    <text x="150" y="87" fontSize="10" fill="#D4AF37" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.chest}&quot;</text>
                </g>
            )}
            {/* Waist */}
            {measurements.waist && (
                <g>
                    <line x1="115" y1="135" x2="185" y2="135" stroke="#8B5A2B" strokeWidth="1.5" />
                    <rect x="120" y="121" width="60" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#8B5A2B" strokeWidth="0.5" />
                    <text x="150" y="132" fontSize="10" fill="#8B5A2B" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.waist}&quot;</text>
                </g>
            )}
            {/* Length */}
            {measurements.length && (
                <g>
                    <line x1="40" y1="30" x2="40" y2="330" stroke="#8B5A2B" strokeWidth="1.5" markerEnd="url(#arrow-d)" markerStart="url(#arrow-d)" />
                    <rect x="15" y="172" width="44" height="16" rx="4" fill="rgba(26,26,26,0.85)" stroke="#8B5A2B" strokeWidth="0.5" />
                    <text x="37" y="183" fontSize="10" fill="#8B5A2B" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{measurements.length}&quot;</text>
                </g>
            )}
        </svg>
    );
}

export default function MeasurementVisualizer({ garmentType, measurements }: VisualizerProps) {
    const { t } = useLanguage();

    const renderSVG = () => {
        switch (garmentType) {
            case "Shirt":
            case "Police Uniform":
            case "School Uniform (Boy)":
                return <WireframeShirt measurements={measurements} />;
            case "Pant":
                return <WireframePant measurements={measurements} />;
            case "Girl's Dress":
            case "School Uniform (Girl)":
                return <WireframeDress measurements={measurements} />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-themed-muted italic p-10 text-center">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        <p className="text-sm">{t("dash.noVisualizer")}</p>
                    </div>
                );
        }
    };

    return (
        <div
            className="w-full h-full flex items-center justify-center p-4 rounded-2xl overflow-hidden relative"
            style={{ background: "rgba(26, 26, 26, 0.9)", border: "1px solid rgba(212,175,55,0.15)" }}
        >
            {/* Subtle scan line animation */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,175,55,0.015) 2px, rgba(212,175,55,0.015) 4px)",
                }}
            />
            {renderSVG()}
        </div>
    );
}
