"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { getSettings, SettingsData } from "@/lib/firestore";
import TailorIcon from "@/components/TailorIcon";
import {
  Sparkles,
  Scissors,
  Wrench,
  GemIcon,
  Zap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Navigation,
  ChevronDown,
  IndianRupee,
} from "lucide-react";

/* ── Floating tailoring SVG elements ────────────────────── */
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Animated thread lines */}
      <svg className="home-thread home-thread-1" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,100 Q50,10 100,80 T190,100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="8 6" />
      </svg>
      <svg className="home-thread home-thread-2" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10,50 Q60,150 100,60 T190,120" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="6 8" />
      </svg>
      <svg className="home-thread home-thread-3" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20,180 Q80,20 140,100 T200,60" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" strokeDasharray="4 10" />
      </svg>

      {/* Floating scissors */}
      <div className="home-float home-float-scissors-1">
        <Scissors className="h-8 w-8" />
      </div>
      <div className="home-float home-float-scissors-2">
        <Scissors className="h-6 w-6" />
      </div>

      {/* Floating needle/pin */}
      <svg className="home-float home-float-needle" viewBox="0 0 24 60" width="20" height="50">
        <line x1="12" y1="0" x2="12" y2="45" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="50" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="3" r="2" fill="currentColor" />
      </svg>

      {/* Floating thread spool */}
      <svg className="home-float home-float-spool" viewBox="0 0 40 50" width="32" height="40">
        <rect x="8" y="5" width="24" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="12" x2="32" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="8" y1="38" x2="32" y2="38" stroke="currentColor" strokeWidth="1" />
        <line x1="8" y1="18" x2="32" y2="18" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" />
        <line x1="8" y1="24" x2="32" y2="24" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" />
        <line x1="8" y1="30" x2="32" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 2" />
      </svg>

      {/* Floating ruler */}
      <svg className="home-float home-float-ruler" viewBox="0 0 120 20" width="100" height="16">
        <rect x="0" y="0" width="120" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110].map((x) => (
          <line key={x} x1={x + 5} y1="0" x2={x + 5} y2={x % 20 === 0 ? 10 : 6} stroke="currentColor" strokeWidth="0.8" />
        ))}
      </svg>

      {/* Floating buttons */}
      <div className="home-float home-float-button-1">
        <svg viewBox="0 0 20 20" width="14" height="14">
          <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="7" cy="8" r="1.2" fill="currentColor" />
          <circle cx="13" cy="8" r="1.2" fill="currentColor" />
          <circle cx="7" cy="13" r="1.2" fill="currentColor" />
          <circle cx="13" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </div>
      <div className="home-float home-float-button-2">
        <svg viewBox="0 0 20 20" width="12" height="12">
          <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="7" cy="8" r="1.2" fill="currentColor" />
          <circle cx="13" cy="8" r="1.2" fill="currentColor" />
          <circle cx="7" cy="13" r="1.2" fill="currentColor" />
          <circle cx="13" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </div>

      {/* Stitch pattern along diagonal */}
      <svg className="home-stitch home-stitch-diagonal" viewBox="0 0 400 400" fill="none">
        <path d="M0,400 L400,0" stroke="currentColor" strokeWidth="0.6" strokeDasharray="12 8" />
        {Array.from({ length: 20 }, (_, i) => {
          const x = (i * 400) / 20;
          const y = 400 - x;
          return <line key={i} x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} stroke="currentColor" strokeWidth="0.8" />;
        })}
      </svg>
    </div>
  );
}

export default function Home() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const services = [
    { icon: Scissors, title: t("home.services.custom"), desc: t("home.services.customDesc"), gradient: "from-sky-500 to-blue-600" },
    { icon: Wrench, title: t("home.services.alteration"), desc: t("home.services.alterationDesc"), gradient: "from-violet-500 to-purple-600" },
    { icon: GemIcon, title: t("home.services.wedding"), desc: t("home.services.weddingDesc"), gradient: "from-amber-500 to-orange-600" },
    { icon: Zap, title: t("home.services.express"), desc: t("home.services.expressDesc"), gradient: "from-emerald-500 to-green-600" },
  ];

  const handleGetStarted = () => {
    if (user && role) {
      router.push(role === "admin" ? "/dashboard" : "/tracking");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      {/* Scoped CSS for home page animations */}
      <style jsx global>{`
                .home-brand-title {
                    background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 40%, #a855f7 70%, #0ea5e9 100%);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: homeGradientShift 4s ease-in-out infinite;
                }
                @keyframes homeGradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                /* Floating elements base */
                .home-float {
                    position: absolute;
                    color: var(--text-muted, #94a3b8);
                    opacity: 0.12;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                .home-float-scissors-1 {
                    top: 15%; left: 8%;
                    animation: homeFloat1 8s ease-in-out infinite;
                    transform: rotate(-30deg);
                }
                .home-float-scissors-2 {
                    top: 60%; right: 6%;
                    animation: homeFloat2 10s ease-in-out infinite;
                    opacity: 0.08;
                    transform: rotate(15deg);
                }
                .home-float-needle {
                    position: absolute;
                    top: 25%; right: 12%;
                    color: var(--text-muted, #94a3b8);
                    opacity: 0.1;
                    animation: homeFloat3 9s ease-in-out infinite;
                    transform: rotate(25deg);
                }
                .home-float-spool {
                    position: absolute;
                    bottom: 20%; left: 5%;
                    color: var(--text-muted, #94a3b8);
                    opacity: 0.1;
                    animation: homeFloat4 11s ease-in-out infinite;
                }
                .home-float-ruler {
                    position: absolute;
                    top: 70%; left: 15%;
                    color: var(--text-muted, #94a3b8);
                    opacity: 0.07;
                    animation: homeFloat5 12s ease-in-out infinite;
                    transform: rotate(-10deg);
                }
                .home-float-button-1 {
                    top: 40%; left: 20%;
                    animation: homeFloat6 7s ease-in-out infinite;
                    opacity: 0.15;
                }
                .home-float-button-2 {
                    top: 35%; right: 20%;
                    animation: homeFloat7 9s ease-in-out infinite;
                    opacity: 0.12;
                }

                /* Thread animations */
                .home-thread {
                    position: absolute;
                    color: var(--text-muted, #94a3b8);
                    opacity: 0.06;
                }
                .home-thread-1 {
                    top: 10%; left: 0; width: 350px; height: 200px;
                    animation: homeThreadDraw1 6s linear infinite;
                }
                .home-thread-2 {
                    bottom: 15%; right: 0; width: 300px; height: 200px;
                    animation: homeThreadDraw2 8s linear infinite;
                }
                .home-thread-3 {
                    top: 50%; left: 30%; width: 250px; height: 150px;
                    animation: homeThreadDraw3 10s linear infinite;
                    opacity: 0.04;
                }

                /* Stitch pattern */
                .home-stitch {
                    position: absolute;
                    color: var(--text-muted, #94a3b8);
                    opacity: 0.04;
                }
                .home-stitch-diagonal {
                    top: 0; right: 0; width: 350px; height: 350px;
                    animation: homeStitchMove 15s linear infinite;
                }

                @keyframes homeFloat1 {
                    0%, 100% { transform: rotate(-30deg) translate(0, 0); }
                    25% { transform: rotate(-20deg) translate(12px, -18px); }
                    50% { transform: rotate(-35deg) translate(-8px, -10px); }
                    75% { transform: rotate(-25deg) translate(6px, 15px); }
                }
                @keyframes homeFloat2 {
                    0%, 100% { transform: rotate(15deg) translate(0, 0); }
                    33% { transform: rotate(25deg) translate(-15px, 12px); }
                    66% { transform: rotate(10deg) translate(10px, -18px); }
                }
                @keyframes homeFloat3 {
                    0%, 100% { transform: rotate(25deg) translateY(0); }
                    50% { transform: rotate(30deg) translateY(-20px); }
                }
                @keyframes homeFloat4 {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                @keyframes homeFloat5 {
                    0%, 100% { transform: rotate(-10deg) translate(0, 0); }
                    50% { transform: rotate(-5deg) translate(10px, -12px); }
                }
                @keyframes homeFloat6 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(8px, -12px) scale(1.1); }
                }
                @keyframes homeFloat7 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-10px, -8px) scale(1.15); }
                }
                @keyframes homeThreadDraw1 {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -100; }
                }
                @keyframes homeThreadDraw2 {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 80; }
                }
                @keyframes homeThreadDraw3 {
                    0% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -60; }
                }
                @keyframes homeStitchMove {
                    0% { transform: translate(0, 0); }
                    50% { transform: translate(-10px, 10px); }
                    100% { transform: translate(0, 0); }
                }

                /* Shimmer on service cards */
                .home-service-card {
                    position: relative;
                    overflow: hidden;
                }
                .home-service-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%);
                    animation: homeShimmer 6s ease-in-out infinite;
                    pointer-events: none;
                }
                @keyframes homeShimmer {
                    0%, 100% { transform: translate(-30%, -30%) rotate(0deg); }
                    50% { transform: translate(30%, 30%) rotate(0deg); }
                }

                /* Pulse ring around logo */
                .home-logo-ring {
                    position: absolute;
                    inset: -8px;
                    border-radius: 1.75rem;
                    border: 2px solid rgba(14, 165, 233, 0.2);
                    animation: homeRingPulse 3s ease-in-out infinite;
                }
                .home-logo-ring-2 {
                    position: absolute;
                    inset: -16px;
                    border-radius: 2.25rem;
                    border: 1px solid rgba(14, 165, 233, 0.1);
                    animation: homeRingPulse 3s ease-in-out infinite 0.5s;
                }
                @keyframes homeRingPulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.08); opacity: 0.8; }
                }

                /* Entrance animation stagger */
                .home-stagger-1 { animation: homeFadeUp 0.8s ease-out 0.1s both; }
                .home-stagger-2 { animation: homeFadeUp 0.8s ease-out 0.25s both; }
                .home-stagger-3 { animation: homeFadeUp 0.8s ease-out 0.4s both; }
                .home-stagger-4 { animation: homeFadeUp 0.8s ease-out 0.55s both; }
                @keyframes homeFadeUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>

      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        {/* ━━━ HERO SECTION ━━━ */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Gradient background blobs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-sky-500/8 blur-[180px]" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
            <div className="absolute top-0 right-0 h-[350px] w-[400px] rounded-full bg-violet-500/5 blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/4 h-[200px] w-[200px] rounded-full bg-amber-500/4 blur-[80px]" />
          </div>

          {/* Floating tailoring elements */}
          <FloatingElements />

          <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-3xl mx-auto pointer-events-none">
            {/* Animated logo with rings */}
            <div className="relative home-stagger-1 pointer-events-auto">
              <div className="home-logo-ring" />
              <div className="home-logo-ring-2" />
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl brand-gradient shadow-2xl shadow-sky-500/30"
                style={{ animation: "splashIconFloat 4s ease-in-out infinite" }}>
                <TailorIcon className="text-white" size={48} />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-sky-400 animate-pulse" />
              </div>
            </div>

            {/* Brand Title — Gradient */}
            <div className="home-stagger-2">
              <h1 className="home-brand-title text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                {t("app.name")}
              </h1>
              <p className="mt-3 text-sm font-semibold tracking-widest uppercase text-sky-500/80">
                {t("app.tagline")}
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-themed-secondary leading-relaxed max-w-xl home-stagger-3">
              {t("home.hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center home-stagger-4 pointer-events-auto">
              <button onClick={handleGetStarted} className="btn-primary text-base !px-8 !py-3 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow">
                {t("home.hero.cta")} <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 rounded-xl px-8 py-3 text-base font-semibold text-themed-primary transition-all hover:scale-[1.03]"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--glass-border)" }}
              >
                {t("home.hero.trackOrder")}
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-themed-muted" />
          </div>
        </section>

        {/* ━━━ SERVICES SECTION ━━━ */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-themed-primary text-center mb-4">
              {t("home.services.title")}
            </h2>
            <div className="w-16 h-1 rounded-full brand-gradient mx-auto mb-12" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {services.map((s) => (
                <div key={s.title} className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300 home-service-card">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-themed-primary mb-2">{s.title}</h3>
                  <p className="text-sm text-themed-secondary leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ ABOUT SECTION ━━━ */}
        <section className="py-20 px-6 relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
          {/* Subtle background stitch pattern */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ opacity: 0.03 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="stitch-pattern" patternUnits="userSpaceOnUse" width="40" height="40">
                  <line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
                  <line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#stitch-pattern)" />
            </svg>
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-themed-primary mb-4">
              {t("home.about.title")}
            </h2>
            <div className="w-16 h-1 rounded-full brand-gradient mx-auto mb-8" />
            <p className="text-base sm:text-lg text-themed-secondary leading-relaxed">
              {t("home.about.text")}
            </p>

            <div className="grid grid-cols-3 gap-6 mt-12">
              {[
                { num: "30+", label: t("home.about.title") === "About Us" ? "Years" : "ஆண்டுகள்" },
                { num: "5000+", label: t("home.about.title") === "About Us" ? "Happy Customers" : "வாடிக்கையாளர்கள்" },
                { num: "100%", label: t("home.about.title") === "About Us" ? "Handcrafted" : "கைவினை" },
              ].map((s) => (
                <div key={s.num}>
                  <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}>
                    {s.num}
                  </p>
                  <p className="text-sm text-themed-secondary mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ PRICING SECTION ━━━ */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-themed-primary text-center mb-4">
              {t("home.pricing.title")}
            </h2>
            <div className="w-16 h-1 rounded-full brand-gradient mx-auto mb-12" />

            {settings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(settings.garmentPrices || {}).map(([gType, price]) => (
                  <div key={gType} className="glass-card p-5 group hover:scale-[1.02] transition-transform flex items-center justify-between">
                    <span className="font-semibold text-themed-primary">{t(`garment.${gType}`) || gType}</span>
                    <span className="flex items-center text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      <IndianRupee className="h-3.5 w-3.5 mr-0.5" />{price}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center flex-wrap gap-4 opacity-50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card p-5 h-16 w-full max-w-[280px] animate-pulse rounded-2xl" style={{ background: "var(--bg-secondary)" }}></div>
                ))}
              </div>
            )}
            <p className="text-center text-sm text-themed-secondary mt-8">
              * Base prices. Final cost may vary based on materials, complex alterations, or rush requests.
            </p>
          </div>
        </section>

        {/* ━━━ CONTACT SECTION ━━━ */}
        <section className="py-20 px-6 relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
          {/* Subtle background stitch pattern */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ opacity: 0.03 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="stitch-pattern-contact" patternUnits="userSpaceOnUse" width="40" height="40">
                  <line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
                  <line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#stitch-pattern-contact)" />
            </svg>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-themed-primary text-center mb-4">
              {t("home.contact.title")}
            </h2>
            <div className="w-16 h-1 rounded-full brand-gradient mx-auto mb-12" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <a href="tel:+919442898544" className="glass-card p-5 flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-themed-muted font-medium uppercase tracking-wider">{t("home.contact.phone")}</p>
                    <p className="text-base font-semibold text-themed-primary mt-0.5">+91 94428 98544</p>
                  </div>
                </a>

                <a href="mailto:skumarantailorscuddalore@gmail.com" className="glass-card p-5 flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-themed-muted font-medium uppercase tracking-wider">{t("home.contact.email")}</p>
                    <p className="text-sm font-semibold text-themed-primary mt-0.5 break-all">skumarantailorscuddalore@gmail.com</p>
                  </div>
                </a>

                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg flex-shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-themed-muted font-medium uppercase tracking-wider">{t("home.contact.hours")}</p>
                    <p className="text-base font-semibold text-themed-primary mt-0.5">{t("home.contact.hoursValue")}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-5 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg flex-shrink-0 mt-1">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-themed-muted font-medium uppercase tracking-wider">{t("home.contact.address")}</p>
                    <p className="text-base font-semibold text-themed-primary mt-0.5 leading-relaxed">
                      174/57/1, Sivasakthi Complex,<br />
                      Vallikandhan Nagar, Main Rd,<br />
                      Pudupalayam, Cuddalore,<br />
                      Tamil Nadu 607001
                    </p>
                  </div>
                </div>

                <a href="https://maps.app.goo.gl/JRro36KmqkzCneSS6" target="_blank" rel="noopener noreferrer"
                  className="glass-card p-5 flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Navigation className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-sky-500">{t("home.contact.directions")}</p>
                    <p className="text-xs text-themed-muted mt-0.5">Google Maps →</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-sky-500 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
