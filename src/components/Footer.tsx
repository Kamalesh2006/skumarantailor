"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";

import { usePathname } from "next/navigation";

export default function Footer() {
    const { t } = useLanguage();
    const pathname = usePathname();

    if (pathname === "/login" || pathname.startsWith("/dashboard")) return null;

    return (
        <footer className="py-8 px-6 bg-[#FBF7F0] border-t border-[#EADFCF]">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-1.5">
                        <div className="flex items-center gap-2">
                            <img src="/sk-mark-dark.png" alt="S Kumaran Logo" className="w-[20px] h-[20px] object-contain" />
                            <span className="font-bricolage font-extrabold text-[16px] text-[#2A1D14]">
                                {t("app.name")}
                            </span>
                        </div>
                        <p className="text-[12px] text-[#8C7761]">© {new Date().getFullYear()} {t("app.name")}. Since 1986 · Cuddalore</p>
                    </div>

                    {/* Contact quick links */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[#5E4A38]">
                        <a href="tel:+919442898544" className="flex items-center gap-1.5 hover:text-[#2A1D14] transition-colors font-medium">
                            <Phone className="h-3.5 w-3.5 text-[#8A5A1E]" /> +91 94428 98544
                        </a>
                        <a href="mailto:skumarantailorscuddalore@gmail.com" className="flex items-center gap-1.5 hover:text-[#2A1D14] transition-colors font-medium">
                            <Mail className="h-3.5 w-3.5 text-[#8A5A1E]" /> skumarantailorscuddalore@gmail.com
                        </a>
                        <a href="https://maps.app.goo.gl/JRro36KmqkzCneSS6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#2A1D14] transition-colors font-medium">
                            <MapPin className="h-3.5 w-3.5 text-[#8A5A1E]" /> {t("footer.address")}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
