"use client";

import React from "react";
import { GarmentType } from "@/lib/measurements";
import { useLanguage } from "@/lib/LanguageContext";

interface VisualizerProps {
    garmentType: GarmentType;
    measurements: Record<string, number | string>;
}

export default function MeasurementVisualizer({ garmentType, measurements }: VisualizerProps) {
    const { t } = useLanguage();

    const renderSVG = () => {
        switch (garmentType) {
            case "Shirt":
            case "Police Uniform":
            case "School Uniform (Boy)":
                return (
                    <svg viewBox="0 0 200 250" className="w-full h-auto drop-shadow-md text-sky-500/20 stroke-sky-400">
                        {/* Shirt Outline */}
                        <path d="M 60 20 L 140 20 L 180 80 L 160 100 L 150 70 L 150 230 L 50 230 L 50 70 L 40 100 L 20 80 Z" fill="currentColor" strokeWidth="2" strokeLinejoin="round" />

                        {/* Collar */}
                        <path d="M 80 20 C 80 40, 120 40, 120 20 C 120 40, 100 50, 80 20" fill="none" stroke="currentColor" strokeWidth="2" />

                        {/* Placket */}
                        <line x1="100" y1="40" x2="100" y2="230" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />

                        {/* Measurements Overlays */}
                        {/* Shoulder */}
                        {measurements.shoulder && (
                            <g>
                                <line x1="60" y1="10" x2="140" y2="10" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                                <text x="100" y="5" fontSize="10" fill="#f59e0b" textAnchor="middle" fontWeight="bold">{measurements.shoulder}{"\""}</text>
                            </g>
                        )}
                        {/* Chest */}
                        {measurements.chest && (
                            <g>
                                <line x1="50" y1="80" x2="150" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                                <text x="100" y="75" fontSize="10" fill="#ef4444" textAnchor="middle" fontWeight="bold">{measurements.chest}{"\""}</text>
                            </g>
                        )}
                        {/* Waist */}
                        {measurements.waist && (
                            <g>
                                <line x1="50" y1="150" x2="150" y2="150" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                                <text x="100" y="145" fontSize="10" fill="#10b981" textAnchor="middle" fontWeight="bold">{measurements.waist}{"\""}</text>
                            </g>
                        )}
                        {/* Sleeve */}
                        {measurements.sleeve && (
                            <g>
                                <line x1="145" y1="35" x2="175" y2="85" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrow)" />
                                <text x="170" y="60" fontSize="10" fill="#8b5cf6" textAnchor="start" fontWeight="bold">{measurements.sleeve}{"\""}</text>
                            </g>
                        )}
                        {/* Length */}
                        {measurements.length && (
                            <g>
                                <line x1="30" y1="20" x2="30" y2="230" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                                <text x="25" y="125" fontSize="10" fill="#3b82f6" textAnchor="end" fontWeight="bold">{measurements.length}{"\""}</text>
                            </g>
                        )}

                        {/* Defs for arrows */}
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                            </marker>
                        </defs>
                    </svg>
                );
            case "Pant":
                return (
                    <svg viewBox="0 0 200 300" className="w-full h-auto drop-shadow-md text-sky-500/20 stroke-sky-400">
                        {/* Pant Outline */}
                        <path d="M 60 20 L 140 20 L 150 120 L 130 280 L 105 280 L 100 140 L 95 280 L 70 280 L 50 120 Z" fill="currentColor" strokeWidth="2" strokeLinejoin="round" />

                        {/* Fly */}
                        <path d="M 100 20 L 100 120 C 100 120, 95 100, 95 80" fill="none" stroke="currentColor" strokeWidth="2" />

                        {/* Waist */}
                        {measurements.waist && (
                            <g>
                                <line x1="60" y1="10" x2="140" y2="10" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                                <text x="100" y="5" fontSize="10" fill="#f59e0b" textAnchor="middle" fontWeight="bold">{measurements.waist}{"\""}</text>
                            </g>
                        )}
                        {/* Length */}
                        {measurements.length && (
                            <g>
                                <line x1="30" y1="20" x2="30" y2="280" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                                <text x="25" y="150" fontSize="10" fill="#3b82f6" textAnchor="end" fontWeight="bold">{measurements.length}{"\""}</text>
                            </g>
                        )}
                        {/* Inseam */}
                        {measurements.inseam && (
                            <g>
                                <line x1="100" y1="140" x2="100" y2="280" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                                <text x="105" y="210" fontSize="10" fill="#10b981" textAnchor="start" fontWeight="bold">{measurements.inseam}{"\""}</text>
                            </g>
                        )}
                        {/* Defs */}
                        <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" /></marker></defs>
                    </svg>
                );
            case "Girl's Dress":
            case "School Uniform (Girl)":
                return (
                    <svg viewBox="0 0 200 250" className="w-full h-auto drop-shadow-md text-sky-500/20 stroke-sky-400">
                        {/* Dress Outline */}
                        <path d="M 70 20 C 70 30, 130 30, 130 20 L 140 60 L 130 70 L 120 100 L 150 230 C 120 240, 80 240, 50 230 L 80 100 L 70 70 L 60 60 Z" fill="currentColor" strokeWidth="2" strokeLinejoin="round" />

                        {/* Waistline */}
                        <line x1="80" y1="100" x2="120" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />

                        <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" /></marker></defs>

                        {/* Chest */}
                        {measurements.chest && (
                            <g>
                                <line x1="75" y1="70" x2="125" y2="70" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                                <text x="100" y="65" fontSize="10" fill="#ef4444" textAnchor="middle" fontWeight="bold">{measurements.chest}{"\""}</text>
                            </g>
                        )}
                        {/* Waist */}
                        {measurements.waist && (
                            <g>
                                <line x1="80" y1="100" x2="120" y2="100" stroke="#10b981" strokeWidth="1.5" />
                                <text x="100" y="95" fontSize="10" fill="#10b981" textAnchor="middle" fontWeight="bold">{measurements.waist}{"\""}</text>
                            </g>
                        )}
                        {/* Length */}
                        {measurements.length && (
                            <g>
                                <line x1="30" y1="20" x2="30" y2="230" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                                <text x="25" y="125" fontSize="10" fill="#3b82f6" textAnchor="end" fontWeight="bold">{measurements.length}{"\""}</text>
                            </g>
                        )}
                    </svg>
                );
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
        <div className="w-full h-full flex items-center justify-center p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10">
            {renderSVG()}
        </div>
    );
}
