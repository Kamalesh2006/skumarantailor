"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// ──────────────────────────────────────────────
// Admin phone numbers (add your admin phones here)
// In demo mode: any phone starting with +91999 is admin
// ──────────────────────────────────────────────
const ADMIN_PHONES: string[] = [
    // "+919876543210",
];

export type UserRole = "admin" | "customer";

// Demo user shape (mimics Firebase User partially)
interface DemoUser {
    uid: string;
    phoneNumber: string;
    displayName: string | null;
}

interface AuthContextType {
    user: User | DemoUser | null;
    role: UserRole | null;
    loading: boolean;
    demoMode: boolean;
    setDemoMode: (v: boolean) => void;
    demoLogin: (phone: string) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    demoMode: true,
    setDemoMode: () => { },
    demoLogin: () => { },
    logout: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

// Helper: determine role from phone
function roleFromPhone(phone: string): UserRole {
    if (ADMIN_PHONES.includes(phone)) return "admin";
    // Demo convention: +91999... = admin
    if (phone.startsWith("+91999")) return "admin";
    return "customer";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | DemoUser | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [demoMode, setDemoModeState] = useState(true);

    // Restore demo mode preference from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("sk_demo_mode");
        if (stored !== null) {
            setDemoModeState(stored === "true");
        }

        // Restore demo session
        const demoSession = localStorage.getItem("sk_demo_user");
        if (demoSession) {
            try {
                const parsed = JSON.parse(demoSession);
                setUser(parsed.user);
                setRole(parsed.role);
            } catch {
                // ignore invalid JSON
            }
        }

        setLoading(false);
    }, []);

    // Firebase auth listener (only when NOT in demo mode)
    useEffect(() => {
        if (demoMode) return;

        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const phone = firebaseUser.phoneNumber || "";
                let userRole: UserRole = "customer";

                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        userRole = userDoc.data().role as UserRole;
                    } else {
                        userRole = roleFromPhone(phone);
                        await setDoc(userDocRef, {
                            uid: firebaseUser.uid,
                            phoneNumber: phone,
                            role: userRole,
                            measurements: {},
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    userRole = roleFromPhone(phone);
                }

                setRole(userRole);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [demoMode]);

    const setDemoMode = useCallback((v: boolean) => {
        setDemoModeState(v);
        localStorage.setItem("sk_demo_mode", String(v));
        if (!v) {
            // Clear demo session when switching to real mode
            localStorage.removeItem("sk_demo_user");
            setUser(null);
            setRole(null);
        }
    }, []);

    const demoLogin = useCallback((phone: string) => {
        const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;
        const userRole = roleFromPhone(fullPhone);
        const demoUser: DemoUser = {
            uid: `demo_${fullPhone.replace(/\+/g, "")}`,
            phoneNumber: fullPhone,
            displayName: null,
        };
        setUser(demoUser);
        setRole(userRole);
        localStorage.setItem(
            "sk_demo_user",
            JSON.stringify({ user: demoUser, role: userRole })
        );
    }, []);

    const logout = useCallback(async () => {
        if (demoMode) {
            localStorage.removeItem("sk_demo_user");
            setUser(null);
            setRole(null);
        } else {
            await signOut(auth);
            setUser(null);
            setRole(null);
        }
    }, [demoMode]);

    return (
        <AuthContext.Provider
            value={{ user, role, loading, demoMode, setDemoMode, demoLogin, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
