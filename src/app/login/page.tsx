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
        <div className="min-h-screen bg-figma-bg flex">
            {/* Desktop Left Side */}
            <div className="hidden md:flex flex-1 bg-figma-dark flex-col items-center justify-center p-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                    <Image src="/sewing-machine.png" alt="Vintage Sewing Machine" fill className="object-contain scale-[1.5]" style={{ filter: "brightness(0) saturate(100%) invert(72%) sepia(45%) saturate(600%) hue-rotate(10deg) brightness(95%) contrast(90%)" }} />
                </div>
                <div className="relative z-10 flex flex-col items-center text-center animate-slide-up">
                    <div className="w-[140px] h-[140px] relative mb-8">
                        <Image src="/sk-mark.png" alt="S Kumaran" fill className="object-contain" priority />
                    </div>
                    <h1 className="font-bricolage font-extrabold tracking-tight text-[56px] text-figma-cream leading-[1.1] mb-4 drop-shadow-lg">
                        S Kumaran<br/>Tailors
                    </h1>
                    <p className="text-[16px] tracking-[4px] text-figma-gold font-bold">
                        SINCE 1986 &middot; CUDDALORE
                    </p>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative z-10">
                <div className="w-full max-w-[440px] bg-figma-dark md:bg-transparent rounded-[34px] md:rounded-none overflow-hidden md:overflow-visible shadow-[0_18px_50px_rgba(42,29,20,0.22)] md:shadow-none border border-figma-border md:border-none flex flex-col animate-slide-up">
                    {/* Header Top - Mobile only */}
                    <div className="pt-[34px] px-[26px] pb-[26px] flex flex-col items-center gap-[10px] md:hidden">
                        <div className="w-[92px] h-[92px] relative">
                            <Image src="/sk-mark.png" alt="S Kumaran" fill className="object-contain" priority />
                        </div>
                        <div className="text-center">
                            <div className="font-bricolage font-extrabold tracking-tight text-[27px] text-figma-cream leading-[1.15]">S Kumaran Tailors</div>
                            <div className="text-[13px] tracking-[2.5px] text-[#B9A48A] mt-[7px] font-semibold">SINCE 1986 &middot; CUDDALORE</div>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="flex-1 bg-figma-bg md:bg-transparent rounded-t-[30px] md:rounded-none p-[28px_24px] md:p-0 flex flex-col gap-[16px]">
                        <div className="mb-2">
                            <div className="font-bricolage font-extrabold tracking-tight text-[32px] md:text-[40px] text-figma-dark mb-1">Welcome back</div>
                            <div className="text-[15px] text-figma-grayBrown font-medium">Please enter your details to sign in.</div>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-col gap-[20px]">
                            <div>
                                <div className="text-[12px] font-extrabold tracking-[1.2px] text-[#9A8874] mb-[8px]">PHONE NUMBER</div>
                                <div className="bg-white border-2 border-figma-gold rounded-[16px] p-[16px_18px] flex items-center gap-[12px] shadow-sm transition-all focus-within:shadow-md focus-within:border-[#B89430]">
                                    <span className="text-[18px] text-[#8A5A1E]">✆</span>
                                    <span className="text-[16px] font-bold text-figma-grayBrown pr-[12px] border-r border-figma-border">+91</span>
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
                                <div className="bg-white border border-figma-border rounded-[16px] p-[16px_18px] flex items-center gap-[12px] shadow-sm transition-all focus-within:border-[#9A8874]">
                                    <span className="text-[18px] text-figma-muted">🔒</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="flex-1 text-[18px] text-figma-dark tracking-[4px] bg-transparent outline-none placeholder:text-figma-muted placeholder:tracking-normal"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[18px] text-[#8A5A1E] hover:text-[#5E4A38] transition-colors">
                                        {showPassword ? "👁" : "👁‍🗨"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-[2px]">
                                <label className="flex items-center gap-[12px] cursor-pointer group">
                                    <button
                                        type="button"
                                        onClick={() => setKeepSignedIn(!keepSignedIn)}
                                        className={`w-[24px] h-[24px] rounded-[8px] flex items-center justify-center text-[13px] transition-all group-hover:shadow-sm ${keepSignedIn ? 'bg-figma-dark text-figma-gold' : 'bg-white border-2 border-figma-border text-transparent'}`}
                                    >
                                        ✓
                                    </button>
                                    <span className="text-[14.5px] font-semibold text-[#5E4A38]">Keep me signed in</span>
                                </label>
                                <button type="button" className="text-[14.5px] font-bold text-[#8A5A1E] hover:text-[#5E4A38] transition-colors">Forgot password?</button>
                            </div>

                            {error && (
                                <div className="text-red-500 text-[14px] font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-[60px] rounded-[18px] bg-figma-dark text-figma-gold hover:bg-[#1A1A1A] flex items-center justify-center text-[17px] font-extrabold mt-[8px] shadow-[0_8px_20px_rgba(42,29,20,0.15)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
                            >
                                {loading ? "Signing in..." : "Sign in to Dashboard"}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-figma-border">
                            <div className="text-[13px] font-bold tracking-[1px] text-[#9A8874] mb-[12px] text-center">LANGUAGE</div>
                            <div className="flex gap-[8px] bg-white p-[6px] rounded-[16px] shadow-sm border border-figma-border">
                                <button className="flex-1 h-[44px] rounded-[12px] bg-figma-bg text-figma-dark text-[15px] font-extrabold flex items-center justify-center shadow-sm">English</button>
                                <button className="flex-1 h-[44px] rounded-[12px] text-[#5E4A38] hover:bg-gray-50 text-[15.5px] font-bold flex items-center justify-center font-noto transition-colors">தமிழ்</button>
                            </div>
                        </div>

                        <div className="mt-auto md:mt-8 text-center text-[13.5px] text-figma-muted pt-4">
                            Staff account? Ask the owner to add your number.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
