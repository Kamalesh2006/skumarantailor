"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import {
    Scissors,
    Sparkles,
    Crown,
    Zap,
    MapPin,
    Clock,
    Phone,
    Mail,
    ArrowRight,
    Navigation,
    MessageCircle,
    CheckCircle2,
    ChevronDown,
    Check,
} from "lucide-react";

export default function LandingPage() {
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        const handleHash = () => {
            if (typeof window === "undefined") return;
            const hash = window.location.hash.replace("#", "");
            if (hash) {
                setTimeout(() => {
                    const el = document.getElementById(hash);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                    }
                }, 120);
            }
        };

        handleHash();
        window.addEventListener("hashchange", handleHash);
        return () => window.removeEventListener("hashchange", handleHash);
    }, []);

    const services = [
        {
            icon: Scissors,
            titleKey: "home.services.custom",
            descKey: "home.services.customDesc",
            highlight: "Bespoke Fit",
            color: "bg-[#F7EEDC] text-[#8A5A1E]",
        },
        {
            icon: Sparkles,
            titleKey: "home.services.alteration",
            descKey: "home.services.alterationDesc",
            highlight: "Fast Turnaround",
            color: "bg-[#EAF0E4] text-[#41603A]",
        },
        {
            icon: Crown,
            titleKey: "home.services.wedding",
            descKey: "home.services.weddingDesc",
            highlight: "Grand Occasions",
            color: "bg-[#FBE9E4] text-[#B4472F]",
        },
        {
            icon: Zap,
            titleKey: "home.services.express",
            descKey: "home.services.expressDesc",
            highlight: "Priority Stitching",
            color: "bg-[#FFF4DC] text-[#B87A1E]",
        },
    ];

    const popularGarments = [
        { nameKey: "garment.Shirt", price: "₹400" },
        { nameKey: "garment.Pant", price: "₹450" },
        { nameKey: "garment.Kurta", price: "₹500" },
        { nameKey: "garment.Suit", price: "₹3,500" },
        { nameKey: "garment.Safari", price: "₹1,200" },
        { nameKey: "garment.School Uniform (Boy)", price: "₹350" },
    ];

    const steps = [
        {
            stepNum: "01",
            titleKey: "home.howItWorks.step1Title",
            descKey: "home.howItWorks.step1Desc",
        },
        {
            stepNum: "02",
            titleKey: "home.howItWorks.step2Title",
            descKey: "home.howItWorks.step2Desc",
        },
        {
            stepNum: "03",
            titleKey: "home.howItWorks.step3Title",
            descKey: "home.howItWorks.step3Desc",
        },
        {
            stepNum: "04",
            titleKey: "home.howItWorks.step4Title",
            descKey: "home.howItWorks.step4Desc",
        },
    ];

    return (
        <div className="flex-1 bg-figma-bg flex flex-col font-sans relative text-figma-dark selection:bg-figma-gold/30">
            {/* ━━━ Main Hero Content ━━━ */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 relative z-10 min-h-full pt-32 md:pt-40 pb-10">
                <div className="relative w-full max-w-[280px] md:max-w-[400px] aspect-[4/3] mb-8 md:mb-10">
                    <Image
                        src="/sewing-machine.png"
                        alt="Vintage Sewing Machine"
                        fill
                        className="object-contain drop-shadow-2xl opacity-90"
                        priority
                        style={{
                            filter: "brightness(0) saturate(100%) invert(72%) sepia(45%) saturate(600%) hue-rotate(10deg) brightness(95%) contrast(90%)",
                        }}
                    />
                </div>

                <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
                    <h1 className="font-bricolage font-extrabold tracking-tight text-[42px] md:text-[68px] leading-[1] text-figma-gold drop-shadow-sm mb-4">
                        {t("landing.heroTitle")}
                    </h1>

                    <p className="text-[11px] md:text-[13px] tracking-[2.5px] font-bold text-figma-gold/80 mb-6 md:mb-8">
                        {t("landing.tagline")}
                    </p>

                    <p className="text-[15px] md:text-[18px] text-figma-grayBrown max-w-[280px] md:max-w-[500px] leading-relaxed mb-10 md:mb-12">
                        <span className="hidden md:inline">{t("landing.heroSubtitleDesktop")}</span>
                        {t("landing.heroSubtitleCommon")}{" "}
                        <span className="md:hidden">{t("landing.savedMeasurementsHint")}</span>
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full md:w-auto h-[56px] px-8 rounded-2xl bg-figma-dark text-white text-[16px] font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(42,29,20,0.15)] hover:-translate-y-0.5 transition-transform"
                        >
                            {t("landing.getStarted")}
                            <span className="text-figma-gold text-lg ml-1">→</span>
                        </button>

                        <button
                            onClick={() => router.push("/track")}
                            className="w-full md:w-auto h-[56px] px-8 rounded-2xl bg-white border border-figma-border text-figma-dark text-[16px] font-extrabold flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            {typeof window !== "undefined" && window.innerWidth < 768
                                ? t("landing.trackMyOrder")
                                : t("landing.trackOrder")}
                        </button>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-16 md:mt-24 mb-16 md:mb-8 flex items-center justify-center w-full max-w-md md:max-w-xl">
                    <div className="flex-1 flex flex-col items-center border-r border-figma-border/60">
                        <div className="font-bricolage font-extrabold text-[24px] md:text-[28px] text-figma-dark leading-none mb-1">
                            39
                        </div>
                        <div className="text-[11px] md:text-[12px] text-figma-grayBrown font-medium">
                            <span className="hidden md:inline">{t("landing.yearsInTrade")}</span>
                            <span className="md:hidden">{t("landing.yearsTradeShort")}</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center border-r border-figma-border/60">
                        <div className="font-bricolage font-extrabold text-[24px] md:text-[28px] text-figma-dark leading-none mb-1">
                            318
                        </div>
                        <div className="text-[11px] md:text-[12px] text-figma-grayBrown font-medium">
                            <span className="hidden md:inline">{t("landing.regularCustomers")}</span>
                            <span className="md:hidden">{t("landing.customersShort")}</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <div className="font-bricolage font-extrabold text-[24px] md:text-[28px] text-figma-dark leading-none mb-1">
                            12
                        </div>
                        <div className="text-[11px] md:text-[12px] text-figma-grayBrown font-medium">
                            <span className="hidden md:inline">{t("landing.garmentsTypes")}</span>
                            <span className="md:hidden">{t("landing.garmentsShort")}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Sign In */}
                <div className="md:hidden mt-auto pb-6 text-center">
                    <div className="text-[14px] text-figma-grayBrown">
                        {t("landing.shopStaff")}{" "}
                        <button
                            onClick={() => router.push("/login")}
                            className="font-extrabold text-[#8A5A1E]"
                        >
                            {t("common.signIn")}
                        </button>
                    </div>
                    <a
                        href="#services"
                        aria-label={t("nav.services")}
                        className="inline-block text-[#8A5A1E]/40 mt-4 animate-bounce hover:text-[#8A5A1E]"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </a>
                </div>
            </main>

            {/* ━━━ SECTION 1: SERVICES ━━━ */}
            <section
                id="services"
                className="scroll-mt-24 py-20 px-6 md:px-12 border-t border-[#EADFCF] bg-[#FBF7F0] relative z-10"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#F7EEDC] text-[#8A5A1E] text-[11.5px] font-extrabold tracking-[1.4px] mb-3">
                            {t("home.services.badge")}
                        </span>
                        <h2 className="font-bricolage font-extrabold tracking-tight text-[32px] md:text-[46px] text-figma-dark leading-tight mb-4">
                            {t("home.services.title")}
                        </h2>
                        <p className="text-[15px] md:text-[17px] text-figma-grayBrown leading-relaxed">
                            {t("home.services.subtitle")}
                        </p>
                    </div>

                    {/* 4 Core Service Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {services.map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                                <div
                                    key={idx}
                                    className="bg-white border border-[#EADFCF] rounded-[22px] p-6 shadow-[0_4px_16px_rgba(42,29,20,0.04)] hover:shadow-[0_12px_32px_rgba(42,29,20,0.08)] hover:-translate-y-1 transition-all flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <div
                                                className={`w-[48px] h-[48px] rounded-[14px] ${item.color} flex items-center justify-center`}
                                            >
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            <span className="text-[11px] font-bold text-[#8A5A1E] bg-[#F7EEDC] px-2.5 py-1 rounded-full">
                                                {item.highlight}
                                            </span>
                                        </div>
                                        <h3 className="font-bricolage font-extrabold text-[20px] text-figma-dark mb-2.5">
                                            {t(item.titleKey)}
                                        </h3>
                                        <p className="text-[13.5px] text-figma-grayBrown leading-relaxed">
                                            {t(item.descKey)}
                                        </p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-[#F1EBE3] flex items-center text-[13px] font-bold text-[#8A5A1E]">
                                        <span>{t("home.services.masterCrafted")}</span>
                                        <Check className="w-4 h-4 ml-auto" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Popular Garment Prices Showcase */}
                    <div className="bg-white border border-[#EADFCF] rounded-[24px] p-7 md:p-8 shadow-[0_4px_20px_rgba(42,29,20,0.05)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#F1EBE3]">
                            <div>
                                <h3 className="font-bricolage font-extrabold text-[22px] text-figma-dark">
                                    {t("home.pricing.title")}
                                </h3>
                                <p className="text-[13px] text-figma-grayBrown mt-1">
                                    {t("home.services.pricingNote")}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push("/track")}
                                className="h-[42px] px-5 rounded-xl bg-[#F7EEDC] hover:bg-[#EEDBB8] text-[#8A5A1E] text-[13.5px] font-bold flex items-center gap-2 self-start md:self-auto transition-colors"
                            >
                                <span>{t("nav.trackOrder")}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                            {popularGarments.map((g, i) => (
                                <div
                                    key={i}
                                    className="bg-[#FBF7F0] border border-[#EADFCF] rounded-[16px] p-3.5 text-center flex flex-col justify-center"
                                >
                                    <span className="text-[12px] font-semibold text-figma-muted truncate">
                                        {t(g.nameKey)}
                                    </span>
                                    <span className="font-bricolage font-extrabold text-[18px] text-figma-dark mt-1">
                                        {g.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ SECTION 2: HOW IT WORKS ━━━ */}
            <section
                id="how-it-works"
                className="scroll-mt-24 py-20 px-6 md:px-12 bg-[#F7EEDC]/40 border-t border-[#EADFCF] relative z-10"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#EADFCF] text-[#5E4A38] text-[11.5px] font-extrabold tracking-[1.4px] mb-3">
                            {t("home.howItWorks.badge")}
                        </span>
                        <h2 className="font-bricolage font-extrabold tracking-tight text-[32px] md:text-[46px] text-figma-dark leading-tight mb-4">
                            {t("home.howItWorks.title")}
                        </h2>
                        <p className="text-[15px] md:text-[17px] text-figma-grayBrown leading-relaxed">
                            {t("home.howItWorks.subtitle")}
                        </p>
                    </div>

                    {/* 4 Step Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-[#EADFCF] rounded-[22px] p-6 shadow-[0_4px_16px_rgba(42,29,20,0.04)] relative flex flex-col"
                            >
                                <div className="font-bricolage font-extrabold text-[36px] text-[#C8912F]/40 leading-none mb-4">
                                    {step.stepNum}
                                </div>
                                <h3 className="font-bricolage font-extrabold text-[18px] text-figma-dark mb-2 leading-snug">
                                    {t(step.titleKey)}
                                </h3>
                                <p className="text-[13.5px] text-figma-grayBrown leading-relaxed mt-1">
                                    {t(step.descKey)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Order Tracking Callout Banner */}
                    <div className="bg-[#2A1D14] rounded-[24px] p-7 md:p-10 text-[#F7EEDC] shadow-[0_16px_40px_rgba(42,29,20,0.25)] flex flex-col md:flex-row items-center justify-between gap-6 border border-[#5E4A38]">
                        <div className="max-w-xl text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-[#C8912F] text-[12px] font-extrabold tracking-[1.5px]">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{t("home.howItWorks.liveUpdates")}</span>
                            </div>
                            <h3 className="font-bricolage font-extrabold text-[24px] md:text-[30px] leading-tight text-white mb-2">
                                {t("home.howItWorks.trackBannerTitle")}
                            </h3>
                            <p className="text-[14px] text-[#B9A48A] leading-relaxed">
                                {t("home.howItWorks.trackBannerDesc")}
                            </p>
                        </div>

                        <button
                            onClick={() => router.push("/track")}
                            className="h-[52px] px-8 rounded-xl bg-[#C8912F] hover:bg-[#B87A1E] text-[#2A1D14] font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all flex-shrink-0"
                        >
                            <span>{t("home.howItWorks.trackBannerBtn")}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ━━━ SECTION 3: VISIT US ━━━ */}
            <section
                id="visit-us"
                className="scroll-mt-24 py-20 px-6 md:px-12 border-t border-[#EADFCF] bg-[#FBF7F0] relative z-10"
            >
                {/* Aliases for alternate anchor tags */}
                <span id="visit" className="absolute -top-24" />
                <span id="contact" className="absolute -top-24" />

                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#F7EEDC] text-[#8A5A1E] text-[11.5px] font-extrabold tracking-[1.4px] mb-3">
                            {t("home.visitUs.badge")}
                        </span>
                        <h2 className="font-bricolage font-extrabold tracking-tight text-[32px] md:text-[46px] text-figma-dark leading-tight mb-4">
                            {t("home.visitUs.title")}
                        </h2>
                        <p className="text-[15px] md:text-[17px] text-figma-grayBrown leading-relaxed">
                            {t("home.visitUs.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Shop Details Card */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            {/* Address Card */}
                            <div className="bg-white border border-[#EADFCF] rounded-[22px] p-6 shadow-[0_4px_16px_rgba(42,29,20,0.04)] flex gap-4">
                                <div className="w-12 h-12 rounded-[14px] bg-[#F7EEDC] text-[#8A5A1E] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[11px] font-extrabold tracking-[1px] text-figma-muted uppercase">
                                        {t("home.contact.address")}
                                    </span>
                                    <div className="font-bricolage font-bold text-[17px] text-figma-dark mt-1 leading-snug">
                                        {t("home.contact.addressValue")}
                                    </div>
                                    <p className="text-[12.5px] text-figma-grayBrown mt-1.5">
                                        {t("home.visitUs.landmark")}
                                    </p>
                                </div>
                            </div>

                            {/* Working Hours Card */}
                            <div className="bg-white border border-[#EADFCF] rounded-[22px] p-6 shadow-[0_4px_16px_rgba(42,29,20,0.04)] flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-[14px] bg-[#EAF0E4] text-[#41603A] flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-extrabold tracking-[1px] text-figma-muted uppercase">
                                            {t("home.contact.hours")}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#41603A] bg-[#EAF0E4] px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#41603A] animate-pulse" />
                                            {t("home.visitUs.openHours")}
                                        </span>
                                    </div>
                                    <div className="font-bricolage font-bold text-[17px] text-figma-dark mt-1">
                                        {t("home.contact.hoursValue")}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Methods Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href="tel:+919442898544"
                                    className="bg-white border border-[#EADFCF] rounded-[22px] p-5 shadow-[0_4px_16px_rgba(42,29,20,0.04)] hover:border-[#C8912F] hover:shadow-md transition-all flex items-center gap-3.5 group"
                                >
                                    <div className="w-11 h-11 rounded-[12px] bg-[#F7EEDC] text-[#8A5A1E] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-figma-muted uppercase">
                                            {t("home.contact.phone")}
                                        </div>
                                        <div className="font-bold text-[15px] text-figma-dark mt-0.5">
                                            {t("home.contact.phoneValue")}
                                        </div>
                                    </div>
                                </a>

                                <a
                                    href="mailto:skumarantailorscuddalore@gmail.com"
                                    className="bg-white border border-[#EADFCF] rounded-[22px] p-5 shadow-[0_4px_16px_rgba(42,29,20,0.04)] hover:border-[#C8912F] hover:shadow-md transition-all flex items-center gap-3.5 group"
                                >
                                    <div className="w-11 h-11 rounded-[12px] bg-[#F1EBE3] text-figma-dark flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-[11px] font-bold text-figma-muted uppercase">
                                            {t("home.contact.email")}
                                        </div>
                                        <div className="font-bold text-[13.5px] text-figma-dark mt-0.5 truncate">
                                            skumarantailors...
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Interactive Direction & Action Card */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-[#2A1D14] to-[#1A120C] rounded-[24px] p-8 text-white flex flex-col justify-between shadow-[0_16px_40px_rgba(42,29,20,0.2)] border border-[#5E4A38]">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C8912F] text-[12px] font-bold mb-5">
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>{t("home.visitUs.locationTag")}</span>
                                </div>
                                <h3 className="font-bricolage font-extrabold text-[26px] text-[#F7EEDC] leading-snug mb-3">
                                    {t("home.visitUs.atelierHeritage")}
                                </h3>
                                <p className="text-[14px] text-[#B9A48A] leading-relaxed mb-6">
                                    {t("home.visitUs.atelierDesc")}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <a
                                    href="https://maps.app.goo.gl/JRro36KmqkzCneSS6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-[50px] w-full rounded-xl bg-[#C8912F] hover:bg-[#B87A1E] text-[#2A1D14] font-extrabold text-[14.5px] flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                                >
                                    <Navigation className="w-4 h-4" />
                                    <span>{t("home.visitUs.getDirections")}</span>
                                </a>

                                <a
                                    href="https://wa.me/919442898544?text=Hello%20S%20Kumaran%20Tailors,%20I%20have%20an%20inquiry"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-[50px] w-full rounded-xl bg-white/10 hover:bg-white/15 text-[#F7EEDC] font-bold text-[14.5px] flex items-center justify-center gap-2 border border-white/10 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                                    <span>{t("home.visitUs.whatsappUs")}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
