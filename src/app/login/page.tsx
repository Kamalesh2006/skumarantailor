"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { logger } from "@/lib/logger";
import TailorIcon from "@/components/TailorIcon";
import {
    Phone,
    Lock,
    Loader2,
    Sparkles,
    AlertCircle,
    Eye,
    EyeOff,
} from "lucide-react";

export default function LoginPage() {
    const { user, role, loading: authLoading, login } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [countryCode] = useState("+91");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [keepSignedIn, setKeepSignedIn] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user && role) {
            router.replace("/dashboard");
        }
    }, [user, role, authLoading, router]);

    // ─── Handle Login ───
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const cleanedPhone = phone.replace(/\s+/g, "");
        if (cleanedPhone.length < 10) {
            setError(t("login.error.invalidPhone"));
            return;
        }

        if (!password) {
            setError("கடவுச்சொல்லை உள்ளிடவும் / Please enter your password");
            return;
        }

        setLoading(true);
        try {
            const fullPhone = `${countryCode}${cleanedPhone}`;
            await login(fullPhone, password);
        } catch (err: unknown) {
            logger.error("Login error:", err);
            const fbErr = err as { code?: string; message?: string };
            if (fbErr.code === "auth/invalid-credential" || fbErr.code === "auth/wrong-password") {
                setError("தவறான கடவுச்சொல் / Invalid password. Please try again.");
            } else if (fbErr.code === "auth/user-not-found") {
                setError("பயனர் கணக்கு இல்லை / No account found for this number.");
            } else if (fbErr.code === "auth/too-many-requests") {
                setError("பல முறை முயற்சி செய்யப்பட்டது / Too many attempts. Please try again later.");
            } else if (fbErr.code === "auth/invalid-email") {
                setError(t("login.error.invalidPhone"));
            } else {
                setError("உள்நுழைவு தோல்வி / Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-primary)" }}>
                <Loader2 className="h-8 w-8 text-gold-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen overflow-hidden">
            {/* ─── Left Side: Hero Image Panel (Desktop) ─── */}
            <div className="hidden lg:block lg:w-[50%] relative">
                {/* Full-bleed image */}
                <Image
                    src="/tailor-hero.png"
                    alt="Master tailor at work"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/70" />
                {/* Gold accent line on the right edge */}
                <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-gold-400/40 to-transparent" />

                {/* Overlay brand content — centered logo */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <TailorIcon invertForDark size={80} />
                    <h1 className="font-serif text-3xl xl:text-4xl font-bold text-white tracking-tight mt-4">
                        S. Kumaran Tailors
                    </h1>
                    <p className="text-xs text-gold-400/90 uppercase tracking-[0.3em] mt-2">
                        Since 1986
                    </p>
                </div>
            </div>

            {/* ─── Mobile Background Image (shown only on mobile/tablet) ─── */}
            <div className="lg:hidden absolute inset-0 z-0">
                <Image
                    src="/tailor-hero.png"
                    alt="Master tailor at work"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Dark overlay to make form readable */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            </div>

            {/* ─── Right Side: Login Form ─── */}
            <div
                className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 lg:bg-[var(--bg-primary)]"
            >
                <div className="w-full max-w-md animate-slide-up">
                    {/* Mobile Brand — only visible on mobile */}
                    <div className="mb-8 flex flex-col items-center text-center lg:hidden">
                        <div className="relative mb-4">
                            <TailorIcon
                                invertForDark
                                size={56}
                            />
                        </div>
                        <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
                            S. Kumaran Tailors
                        </h1>
                        <p className="text-[10px] text-gold-400/80 uppercase tracking-[0.25em] mt-1">
                            Established 1986
                        </p>
                    </div>

                    {/* Welcome heading */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-themed-primary lg:text-themed-primary text-white">{t("login.welcome")}</h2>
                        <p className="mt-1.5 text-sm text-white/70 lg:text-themed-secondary">{t("login.subtitle")}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone" className="mb-2 block text-xs font-semibold text-white/80 lg:text-themed-secondary uppercase tracking-wider">
                                {t("login.phoneLabel")}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder={t("login.phonePlaceholder")}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="form-input pl-10"
                                    maxLength={10}
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-xs font-semibold text-white/80 lg:text-themed-secondary uppercase tracking-wider">
                                    கடவுச்சொல் / PASSWORD
                                </label>
                                <button type="button" className="text-xs text-white/50 hover:text-gold-400 lg:text-themed-muted lg:hover:text-gold-400 transition-colors">
                                    FORGOT?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-themed-muted" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input pl-10 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-themed-muted hover:text-themed-primary transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Keep signed in */}
                        <label className="flex items-center gap-2 text-sm text-white/70 lg:text-themed-secondary cursor-pointer">
                            <input
                                type="checkbox"
                                checked={keepSignedIn}
                                onChange={(e) => setKeepSignedIn(e.target.checked)}
                                className="rounded border-gold-400/30 accent-gold-400"
                            />
                            Keep me signed in for this session
                        </label>

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 animate-fade-in">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading || phone.replace(/\s/g, "").length < 10 || !password}
                            className="btn-primary w-full !py-3.5 !text-base"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />உள்நுழைகிறது... / Signing in...</>
                            ) : (
                                <>உள்நுழை / SIGN IN <Sparkles className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Track Order Button */}
                    <div className="mt-6">
                        <button
                            onClick={() => router.push("/tracking")}
                            className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                            style={{ border: "1px dashed rgba(212, 175, 55, 0.5)", color: "#D4AF37", background: "rgba(212, 175, 55, 0.05)" }}
                        >
                            <Sparkles className="h-4 w-4" />
                            ஆர்டர் பின்தொடர் / TRACK ORDER
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-1">
                        <p className="text-[11px] text-white/40 lg:text-themed-muted">
                            Authorized Access Only. All transactions and measurements are recorded for quality assurance.
                        </p>
                        <p className="text-[11px] text-white/40 lg:text-themed-muted">
                            © 2024 S. Kumaran Tailors. Measured Precision.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
