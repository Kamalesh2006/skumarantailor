"use client";

import { useLanguage } from "@/lib/LanguageContext";
import TailorIcon from "@/components/TailorIcon";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="py-6 px-6" style={{ borderTop: "1px solid var(--glass-border)", background: "var(--bg-secondary)" }}>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <TailorIcon className="text-sky-500" size={18} />
                            <span
                                className="font-bold text-sm"
                                style={{
                                    background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 40%, #a855f7 70%, #0ea5e9 100%)",
                                    backgroundSize: "200% 200%",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    animation: "navGradientShift 4s ease-in-out infinite",
                                }}
                            >
                                {t("app.name")}
                            </span>
                        </div>
                        <p className="text-xs text-themed-muted">© {new Date().getFullYear()} S Kumaran Tailors</p>
                    </div>

                    {/* Contact quick links */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-themed-secondary">
                        <a href="tel:+919442898544" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                            <Phone className="h-3 w-3" /> +91 94428 98544
                        </a>
                        <a href="mailto:skumarantailorscuddalore@gmail.com" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                            <Mail className="h-3 w-3" /> skumarantailorscuddalore@gmail.com
                        </a>
                        <a href="https://maps.app.goo.gl/JRro36KmqkzCneSS6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-sky-500 transition-colors">
                            <MapPin className="h-3 w-3" /> Cuddalore, Tamil Nadu
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
