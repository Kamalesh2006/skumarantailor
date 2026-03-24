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
                            <TailorIcon className="text-gold-400" size={18} />
                            <span className="font-serif font-bold text-sm text-themed-primary">
                                {t("app.name")}
                            </span>
                        </div>
                        <p className="text-xs text-themed-muted">© {new Date().getFullYear()} S Kumaran Tailors</p>
                    </div>

                    {/* Contact quick links */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-themed-secondary">
                        <a href="tel:+919442898544" className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
                            <Phone className="h-3 w-3" /> +91 94428 98544
                        </a>
                        <a href="mailto:skumarantailorscuddalore@gmail.com" className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
                            <Mail className="h-3 w-3" /> skumarantailorscuddalore@gmail.com
                        </a>
                        <a href="https://maps.app.goo.gl/JRro36KmqkzCneSS6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gold-400 transition-colors">
                            <MapPin className="h-3 w-3" /> Cuddalore, Tamil Nadu
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
