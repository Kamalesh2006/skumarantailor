"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { logger } from "@/lib/logger";
import TailorIcon from "@/components/TailorIcon";
import {
    Phone,
    Lock,
    ArrowRight,
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

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user && role) {
            router.replace(role === "admin" ? "/dashboard" : "/tracking");
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
            // Redirect is handled by the useEffect above
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
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
            {/* Ambient Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-sky-500/[0.07] blur-[150px]" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-sky-700/[0.05] blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Brand */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient shadow-2xl shadow-sky-500/30">
                            <TailorIcon className="text-white" size={32} />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <Sparkles className="h-4 w-4 text-sky-300 animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-themed-primary">{t("login.welcome")}</h1>
                    <p className="mt-1.5 text-sm text-themed-secondary">{t("login.subtitle")}</p>
                </div>

                {/* Card */}
                <div className="glass-card p-6 sm:p-8 brand-glow">
                    <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-themed-secondary">
                                {t("login.phoneLabel")}
                            </label>
                            <div className="flex gap-2">
                                <div
                                    className="flex items-center rounded-xl px-3 text-sm font-medium min-w-[72px] justify-center text-themed-secondary"
                                    style={{ background: "var(--input-bg)", border: "1px solid var(--glass-border)" }}
                                >
                                    {countryCode}
                                </div>
                                <div className="relative flex-1">
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
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-themed-secondary">
                                கடவுச்சொல் / Password
                            </label>
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

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 animate-fade-in">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || phone.replace(/\s/g, "").length < 10 || !password}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />உள்நுழைகிறது... / Signing in...</>
                            ) : (
                                <>உள்நுழை / Sign In<ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-themed-muted">
                    {t("login.terms")}
                </p>
            </div>
        </div>
    );
}
