// ─────────────────────────────────────────────────────────────
// Firestore Server-Side Module — For use in API routes (no "use client")
// Re-exports key functions using the same Firebase client SDK,
// but without the "use client" directive so Next.js API routes can import it.
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase";
import {
    collection,
    getDocs,
    updateDoc,
    query,
    where,
    increment,
} from "firebase/firestore";

// ── Types (mirrored from firestore.ts) ──────────────────────

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

export async function incrementUserQueryCount(phone: string): Promise<void> {
    try {
        const q = query(usersCol, where("phoneNumber", "==", phone));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            await updateDoc(snapshot.docs[0].ref, {
                queryCount: increment(1),
                lastQueryAt: Date.now(),
            });
        }
    } catch (error) {
        console.error("Error incrementing user query count (server)", error);
    }
}
