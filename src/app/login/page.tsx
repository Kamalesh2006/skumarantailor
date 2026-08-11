"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { logger } from "@/lib/logger";

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

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const cleanedPhone = phone.replace(/\s+/g, "");
        if (cleanedPhone.length < 10) {
            setError(t("login.error.invalidPhone"));
            return;
        }
        if (!password) {
            setError("Please enter your password");
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
                setError("Invalid password. Please try again.");
            } else if (fbErr.code === "auth/user-not-found") {
                setError("No account found for this number.");
            } else if (fbErr.code === "auth/too-many-requests") {
                setError("Too many attempts. Please try again later.");
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-figma-bg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-figma-gold" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-figma-bg flex items-center justify-center p-4">
            <div className="w-full max-w-[412px] bg-figma-dark rounded-[34px] overflow-hidden shadow-[0_18px_50px_rgba(42,29,20,0.22)] border border-figma-border flex flex-col animate-slide-up">
                {/* Header Top */}
                <div className="pt-[34px] px-[26px] pb-[26px] flex flex-col items-center gap-[10px]">
                    <div className="w-[92px] h-[92px] relative">
                        <Image src="/sk-mark.png" alt="S Kumaran" fill className="object-contain" priority />
                    </div>
                    <div className="text-center">
                        <div className="font-bricolage font-extrabold tracking-tight text-[27px] text-figma-cream leading-[1.15]">S Kumaran Tailors</div>
                        <div className="text-[13px] tracking-[2.5px] text-[#B9A48A] mt-[7px] font-semibold">SINCE 1994 &middot; CUDDALORE</div>
                    </div>
                </div>

                {/* Form Container */}
                <div className="flex-1 bg-figma-bg rounded-t-[30px] p-[28px_24px] flex flex-col gap-[16px]">
                    <div>
                        <div className="font-bricolage font-extrabold tracking-tight text-[22px] text-figma-dark">Sign in</div>
                        <div className="text-[13px] text-figma-grayBrown mt-1">Use your shop phone number</div>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-[16px]">
                        <div>
                            <div className="text-[12px] font-extrabold tracking-[1.2px] text-[#9A8874] mb-[8px]">PHONE NUMBER</div>
                            <div className="bg-white border-2 border-figma-gold rounded-[14px] p-[15px_16px] flex items-center gap-[12px]">
                                <span className="text-[17px] text-[#8A5A1E]">✆</span>
                                <span className="text-[16px] font-bold text-figma-grayBrown pr-[11px] border-r border-figma-border">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="98431 20055"
                                    className="flex-1 text-[18px] font-bold text-figma-dark tracking-[0.6px] bg-transparent outline-none placeholder:text-figma-muted"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="text-[12px] font-extrabold tracking-[1.2px] text-[#9A8874] mb-[8px] flex justify-between">
                                <span>PASSWORD</span>
                            </div>
                            <div className="bg-white border border-figma-border rounded-[14px] p-[15px_16px] flex items-center gap-[12px]">
                                <span className="text-[16px] text-figma-muted">🔒</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="flex-1 text-[18px] text-figma-dark tracking-[4px] bg-transparent outline-none placeholder:text-figma-muted placeholder:tracking-normal"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[16px] text-[#8A5A1E]">
                                    👁
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-[11px] mt-[2px]">
                            <button
                                type="button"
                                onClick={() => setKeepSignedIn(!keepSignedIn)}
                                className={`w-[24px] h-[24px] rounded-[7px] flex items-center justify-center text-[13px] transition-colors ${keepSignedIn ? 'bg-figma-dark text-figma-gold' : 'bg-white border border-figma-border text-transparent'}`}
                            >
                                ✓
                            </button>
                            <span className="flex-1 text-[14px] font-semibold text-[#5E4A38]">Keep me signed in</span>
                            <button type="button" className="text-[13.5px] font-bold text-[#8A5A1E]">Forgot?</button>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm mt-1">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-[56px] rounded-[16px] bg-figma-gold flex items-center justify-center text-[16.5px] font-extrabold text-figma-dark mt-[6px] shadow-[0_8px_20px_rgba(200,145,47,0.32)] active:scale-95 transition-transform disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="flex gap-[6px] bg-[#F1EBE3] rounded-[13px] p-[4px] mt-[4px]">
                        <button className="flex-1 h-[40px] rounded-[10px] bg-white border border-figma-border text-figma-dark text-[14px] font-bold flex items-center justify-center">English</button>
                        <button className="flex-1 h-[40px] rounded-[10px] text-[#5E4A38] text-[15px] font-bold flex items-center justify-center font-noto">தமிழ்</button>
                    </div>

                    <div className="mt-auto text-center text-[12.5px] text-figma-muted pt-4">
                        Staff account? Ask the owner to add your number.
                    </div>
                </div>
            </div>
        </div>
    );
}
