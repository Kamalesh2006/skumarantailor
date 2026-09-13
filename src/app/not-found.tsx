"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function NotFound() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-[#FBF7F0] flex flex-col items-center justify-center px-6 text-center text-[#2A1D14]">
            <h1 className="font-bricolage font-extrabold text-6xl text-[#C8912F] mb-4">404</h1>
            <h2 className="font-bricolage font-bold text-2xl mb-2">
                {t("notfound.title")}
            </h2>
            <p className="text-sm text-[#7A6A5C] max-w-md mb-8">
                {t("notfound.desc")}
            </p>
            <Link
                href="/"
                className="h-[48px] px-7 rounded-xl bg-[#2A1D14] text-[#F7EEDC] font-bold text-sm flex items-center justify-center hover:bg-black transition-colors"
            >
                {t("notfound.backHome")}
            </Link>
        </div>
    );
}
