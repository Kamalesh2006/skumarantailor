"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    signInWithPhoneNumber,
    ConfirmationResult,
} from "firebase/auth";
import { auth, setupRecaptcha } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import TailorIcon from "@/components/TailorIcon";
import {
    Phone,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Sparkles,
    AlertCircle,
    ArrowLeft,
    Zap,
} from "lucide-react";

type Step = "phone" | "otp";

export default function LoginPage() {
    const { user, role, loading: authLoading, demoMode, setDemoMode, demoLogin } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [countryCode] = useState("+91");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmationResult, setConfirmationResult] =
        useState<ConfirmationResult | null>(null);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const recaptchaVerifierRef = useRef<ReturnType<typeof setupRecaptcha> | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user && role) {
            router.replace(role === "admin" ? "/dashboard" : "/tracking");
        }
    }, [user, role, authLoading, router]);

    // ─── Send OTP ───
    const handleSendOTP = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const cleanedPhone = phone.replace(/\s+/g, "");
        if (cleanedPhone.length < 10) {
            setError(t("login.error.invalidPhone"));
            return;
        }

        // DEMO MODE: skip Firebase, go straight to OTP step
        if (demoMode) {
            setLoading(true);
            await new Promise((r) => setTimeout(r, 800)); // simulate delay
            setStep("otp");
            setLoading(false);
            return;
        }

        // REAL Firebase mode
        setLoading(true);
        try {
            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container");
            }
            const fullPhone = `${countryCode}${cleanedPhone}`;
            const result = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifierRef.current);
            setConfirmationResult(result);
            setStep("otp");
        } catch (err: unknown) {
            console.error("OTP send error:", err);
            const fbErr = err as { code?: string };
            if (fbErr.code === "auth/too-many-requests") {
                setError(t("login.error.tooMany"));
            } else if (fbErr.code === "auth/invalid-phone-number") {
                setError(t("login.error.invalidPhoneFormat"));
            } else {
                setError(t("login.error.sendFailed"));
            }
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Verify OTP ───
    const handleVerifyOTP = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
            setError(t("login.error.incompleteOtp"));
            return;
        }

        // DEMO MODE: accept "123456"
        if (demoMode) {
            if (otpCode !== "123456") {
                setError(t("login.error.demoOtp"));
                return;
            }
            setLoading(true);
            await new Promise((r) => setTimeout(r, 600));
            const cleanedPhone = phone.replace(/\s+/g, "");
            demoLogin(`${countryCode}${cleanedPhone}`);
            setLoading(false);
            return;
        }

        // REAL Firebase verify
        if (!confirmationResult) {
            setError(t("login.error.sessionExpired"));
            setStep("phone");
            return;
        }

        setLoading(true);
        try {
            await confirmationResult.confirm(otpCode);
        } catch (err: unknown) {
            console.error("OTP verify error:", err);
            const fbErr = err as { code?: string };
            if (fbErr.code === "auth/invalid-verification-code") {
                setError(t("login.error.invalidOtp"));
            } else if (fbErr.code === "auth/code-expired") {
                setError(t("login.error.otpExpired"));
            } else {
                setError(t("login.error.verifyFailed"));
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── OTP Input Handlers ───
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            const digits = value.replace(/\D/g, "").slice(0, 6).split("");
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 6) newOtp[index + i] = digit;
            });
            setOtp(newOtp);
            otpRefs.current[Math.min(index + digits.length, 5)]?.focus();
            return;
        }
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleBackToPhone = () => {
        setStep("phone");
        setOtp(["", "", "", "", "", ""]);
        setError("");
        setConfirmationResult(null);
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

                {/* Demo Mode Toggle */}
                <div className="mb-4 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setDemoMode(!demoMode)}
                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${demoMode
                            ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                            : "text-themed-muted border"
                            }`}
                        style={!demoMode ? { borderColor: "var(--border-color)" } : {}}
                    >
                        <Zap className="h-3 w-3" />
                        {t("login.demoMode")} {demoMode ? t("login.demoOn") : t("login.demoOff")}
                    </button>
                </div>

                {demoMode && (
                    <div className="mb-4 rounded-xl p-3 text-xs text-center text-themed-secondary" style={{ background: "var(--hover-bg)", border: "1px solid var(--border-color)" }}>
                        <span className="font-semibold text-amber-500">Demo:</span> {t("login.demoHint")} <span className="font-mono font-bold text-themed-primary">123456</span>
                        <br />
                        <span className="font-mono text-sky-500">999xxxxxxx</span> {t("login.demoAdminHint")}
                    </div>
                )}

                {/* Card */}
                <div className="glass-card p-6 sm:p-8 brand-glow">
                    {/* STEP 1: Phone Number */}
                    {step === "phone" && (
                        <form onSubmit={handleSendOTP} className="space-y-5 animate-fade-in">
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

                            {error && (
                                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 animate-fade-in">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || phone.replace(/\s/g, "").length < 10}
                                className="btn-primary w-full"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />{t("login.sendingOtp")}</>
                                ) : (
                                    <>{t("login.sendOtp")}<ArrowRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: OTP Verification */}
                    {step === "otp" && (
                        <div className="space-y-5 animate-fade-in">
                            <button onClick={handleBackToPhone} className="flex items-center gap-1 text-sm text-themed-secondary hover:text-themed-primary transition-colors">
                                <ArrowLeft className="h-3.5 w-3.5" />{t("login.changeNumber")}
                            </button>

                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-sky-500/10 mb-3">
                                    <ShieldCheck className="h-6 w-6 text-sky-500" />
                                </div>
                                <p className="text-sm text-themed-secondary">{t("login.otpSentTo")}</p>
                                <p className="mt-0.5 font-semibold text-themed-primary">{countryCode} {phone}</p>
                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div className="flex justify-center gap-2 sm:gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl text-center text-lg font-bold transition-all duration-200 text-themed-primary"
                                            style={{
                                                background: "var(--input-bg)",
                                                border: "1px solid var(--glass-border)",
                                            }}
                                            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--glass-border)")}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 animate-fade-in">
                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading || otp.join("").length !== 6} className="btn-primary w-full">
                                    {loading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" />{t("login.verifying")}</>
                                    ) : (
                                        <>{t("login.verifySignIn")}<ShieldCheck className="h-4 w-4" /></>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-xs text-themed-muted">
                                {t("login.didntReceive")}{" "}
                                <button onClick={handleBackToPhone} className="text-sky-500 hover:text-sky-400 font-medium transition-colors">
                                    {t("login.resendOtp")}
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-themed-muted">
                    {t("login.terms")}
                </p>
            </div>

            <div id="recaptcha-container" />
        </div >
    );
}
