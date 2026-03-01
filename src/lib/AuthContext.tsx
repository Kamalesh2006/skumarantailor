"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// ──────────────────────────────────────────────
// Admin phone numbers
// ──────────────────────────────────────────────
const ADMIN_PHONES: string[] = [
    "+919788436339",
    "+919442898544",
    "+917639606258",
];

export type UserRole = "admin" | "customer";

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    login: (phone: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

// Helper: determine role from phone
function roleFromPhone(phone: string): UserRole {
    if (ADMIN_PHONES.includes(phone)) return "admin";
    // Also check without country code
    const stripped = phone.replace(/^\+91/, "");
    if (ADMIN_PHONES.some((p) => p.replace(/^\+91/, "") === stripped)) return "admin";
    return "customer";
}

// Helper: convert phone to the email format used in Firebase Auth
export function phoneToEmail(phone: string): string {
    const digits = phone.replace(/[^0-9]/g, "");
    // Ensure we have 91 prefix
    const withCode = digits.startsWith("91") ? digits : `91${digits}`;
    return `${withCode}@skumarantailor.app`;
}

// Helper: extract phone from email
function emailToPhone(email: string): string {
    const match = email.match(/^91(\d+)@/);
    return match ? `+91${match[1]}` : "";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    // Firebase auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const phone = firebaseUser.email ? emailToPhone(firebaseUser.email) : "";
                let userRole: UserRole = "customer";

                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        userRole = userDoc.data().role as UserRole;
                    } else {
                        // First login — create user doc
                        userRole = roleFromPhone(phone);
                        await setDoc(userDocRef, {
                            uid: firebaseUser.uid,
                            phoneNumber: phone,
                            role: userRole,
                            name: userRole === "admin" ? "Admin" : "",
                            measurements: {},
                            createdAt: Date.now(),
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
    }, []);

    const login = useCallback(async (phone: string, password: string) => {
        const email = phoneToEmail(phone);
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the rest
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        setUser(null);
        setRole(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
