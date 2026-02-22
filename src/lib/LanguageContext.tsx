"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, Language } from "./translations";

interface LanguageContextType {
    lang: Language;
    toggleLang: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: "ta",
    toggleLang: () => { },
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>("ta");

    useEffect(() => {
        const saved = localStorage.getItem("sk-lang") as Language | null;
        if (saved && (saved === "en" || saved === "ta")) {
            setLang(saved);
        }
    }, []);

    const toggleLang = useCallback(() => {
        setLang((prev) => {
            const next = prev === "en" ? "ta" : "en";
            localStorage.setItem("sk-lang", next);
            return next;
        });
    }, []);

    const t = useCallback(
        (key: string): string => {
            return translations[key]?.[lang] || key;
        },
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
