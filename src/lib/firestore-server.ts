// ─────────────────────────────────────────────────────────────
// Firestore Server-Side Module — For use in API routes (no "use client")
// Re-exports key functions using the same Firebase client SDK,
// but without the "use client" directive so Next.js API routes can import it.
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    query,
    where,
    increment,
    arrayUnion
} from "firebase/firestore";

// ── Types (mirrored from firestore.ts) ──────────────────────

export interface QueryHistoryItem {
    timestamp: number;
    source: "WhatsApp" | "Tracker";
    text?: string;
}

export interface OrderData {
    orderId: string;
    customerPhone: string;
    customerName: string;
    status: "Pending" | "Cutting" | "Stitching" | "Alteration" | "Ready" | "Delivered";
    binLocation: string;
    submissionDate: string;
    targetDeliveryDate: string;
    basePrice: number;
    numberOfSets: number;
    totalAmount: number;
    rushFee: number;
    isApprovedRushed: boolean;
    garmentType: string;
    notes: string;
}

// ── Collection references ───────────────────────────────────

const ordersCol = collection(db, "orders");
const usersCol = collection(db, "users");

// ── Orders by Phone ─────────────────────────────────────────

export async function getOrdersByPhone(phone: string): Promise<OrderData[]> {
    try {
        const q = query(ordersCol, where("customerPhone", "==", phone));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => d.data() as OrderData);
    } catch (error) {
        console.error("Error fetching orders by phone (server)", error);
        return [];
    }
}

// ── Increment User Query Count ──────────────────────────────

export async function incrementUserQueryCount(phone: string, source: "WhatsApp" | "Tracker" = "WhatsApp", text?: string): Promise<boolean> {
    try {
        const q = query(usersCol, where("phoneNumber", "==", phone));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const queryItem: Partial<QueryHistoryItem> = { timestamp: Date.now(), source };
            if (text) queryItem.text = text;

            await updateDoc(snapshot.docs[0].ref, {
                queryCount: increment(1),
                lastQueryAt: Date.now(),
                queryHistory: arrayUnion(queryItem),
            });
            return false; // Existing user
        } else {
            // New user from WhatsApp unknown
            const uid = "user_" + Date.now().toString() + Math.random().toString(36).substring(2, 7);
            const queryItem: Partial<QueryHistoryItem> = { timestamp: Date.now(), source };
            if (text) queryItem.text = text;

            await setDoc(doc(db, "users", uid), {
                uid,
                phoneNumber: phone,
                role: "customer",
                name: "Unknown (WhatsApp)",
                createdAt: Date.now(),
                queryCount: 1,
                lastQueryAt: Date.now(),
                measurements: {},
                queryHistory: [queryItem],
            });
            return true; // New user
        }
    } catch (error) {
        console.error("Error incrementing user query count (server)", error);
        return false;
    }
}
