"use client";

import React, { useState, useEffect, useCallback } from "react";
import SplashScreen from "./SplashScreen";

/**
 * AppShell shows a splash screen on first visit per session,
 * then reveals the page content with the splash fading away.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = useState(false);
    const [contentReady, setContentReady] = useState(true); // start visible to prevent flash

    useEffect(() => {
        // Only show splash once per browser session
        const seen = sessionStorage.getItem("sk_splash_seen");
        if (!seen) {
            setShowSplash(true);
            setContentReady(false); // hide content only when splash is playing
        }
    }, []);

    const handleSplashComplete = useCallback(() => {
        setShowSplash(false);
        setContentReady(true);
        sessionStorage.setItem("sk_splash_seen", "true");
    }, []);

    // Failsafe: if splash hasn't completed after 4s, force it off
    useEffect(() => {
        if (!showSplash) return;
        const failsafe = setTimeout(() => {
            setShowSplash(false);
            setContentReady(true);
            sessionStorage.setItem("sk_splash_seen", "true");
        }, 4000);
        return () => clearTimeout(failsafe);
    }, [showSplash]);

    return (
        <>
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            <div style={{ opacity: contentReady ? 1 : 0, transition: "opacity 400ms ease" }}>
                {children}
            </div>
        </>
    );
}
