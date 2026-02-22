"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useLanguage } from "@/lib/LanguageContext";
import TailorIcon from "@/components/TailorIcon";
import {
    Menu,
    X,
    LayoutDashboard,
    PackageSearch,
    LogOut,
    User,
    Sun,
    Moon,
    Languages,
} from "lucide-react";

export default function Navbar() {
    const { user, role, loading, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Show minimal navbar (brand + language/theme) for unauthenticated users
    if (loading || !user) {
        return (
            <nav className="fixed top-0 left-0 right-0 z-50 border-b nav-bg backdrop-blur-xl" style={{ borderColor: "var(--border-color)" }}>
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                            <TailorIcon className="text-white" size={20} />
                        </div>
                        <span
                            className="text-lg font-bold tracking-tight"
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
                    </Link>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleLang} className="nav-icon-btn" title="Language">
                            <Languages className="h-4 w-4" />
                            <span className="text-xs">{lang === "en" ? "தமிழ்" : "English"}</span>
                        </button>
                        <button onClick={toggleTheme} className="nav-icon-btn" title="Theme">
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </nav>
        );
    }

    const navLinks =
        role === "admin"
            ? [
                { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
                { href: "/tracking", label: t("nav.orders"), icon: PackageSearch },
            ]
            : [{ href: "/tracking", label: t("nav.myOrders"), icon: PackageSearch }];

    const handleLogout = async () => {
        setMobileOpen(false);
        await logout();
    };

    const phoneDisplay = user.phoneNumber || "User";
    const roleLabel = role === "admin" ? t("common.admin") : t("common.customer");

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 border-b nav-bg backdrop-blur-xl" style={{ borderColor: "var(--border-color)" }}>
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                    {/* Logo */}
                    <Link
                        href={role === "admin" ? "/dashboard" : "/tracking"}
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                            <TailorIcon className="text-white" size={20} />
                        </div>
                        <span
                            className="text-lg font-bold tracking-tight"
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
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-sky-500/10 text-sky-500"
                                        : "text-themed-secondary hover:text-themed-primary"
                                        }`}
                                    style={!isActive ? { background: "transparent" } : {}}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.background = "var(--hover-bg)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLang}
                            className="flex items-center gap-1.5 h-9 rounded-lg px-2.5 text-themed-secondary transition-all duration-200"
                            style={{ background: "transparent" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            aria-label="Toggle language"
                            title={lang === "ta" ? "Switch to English" : "தமிழுக்கு மாற்று"}
                        >
                            <Languages className="h-4 w-4" />
                            <span className="text-xs font-semibold">
                                {lang === "ta" ? "EN" : "தமிழ்"}
                            </span>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center h-9 w-9 rounded-lg text-themed-secondary transition-all duration-200"
                            style={{ background: "transparent" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>

                        {/* User Info */}
                        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-themed-secondary" style={{ background: "var(--hover-bg)" }}>
                            <User className="h-4 w-4" />
                            <span className="max-w-[120px] truncate">{phoneDisplay}</span>
                            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-500 capitalize">
                                {roleLabel}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-themed-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                        >
                            <LogOut className="h-4 w-4" />
                            {t("common.logout")}
                        </button>
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="flex items-center gap-1 md:hidden">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLang}
                            className="flex items-center justify-center h-10 w-10 rounded-lg text-themed-secondary transition-colors"
                            aria-label="Toggle language"
                        >
                            <span className="text-xs font-bold">{lang === "ta" ? "EN" : "தமி"}</span>
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center h-10 w-10 rounded-lg text-themed-secondary transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="flex items-center justify-center h-10 w-10 rounded-lg text-themed-secondary transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Slide-in Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-72 shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{ background: "var(--bg-primary)", borderLeft: "1px solid var(--border-color)" }}
            >
                <div className="flex flex-col h-full pt-20 px-4 pb-6">
                    <div className="flex flex-col gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-sky-500/10 text-sky-500"
                                        : "text-themed-secondary"
                                        }`}
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex-1" />

                    <div className="pt-4 space-y-3" style={{ borderTop: "1px solid var(--border-color)" }}>
                        <div className="flex items-center gap-2 px-2 text-sm text-themed-secondary">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{phoneDisplay}</span>
                            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs font-medium text-sky-500 capitalize ml-auto">
                                {roleLabel}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            {t("common.logout")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-16" />
        </>
    );
}
