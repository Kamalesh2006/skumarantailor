"use client";

// ─────────────────────────────────────────────────────────────
// Firestore Data Layer — Real Firebase CRUD Operations
// Now that Firestore API is enabled + security rules allow access,
// all operations go directly to Firestore (no polling, no demo data).
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase";
import { logger } from "./logger";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    increment,
    writeBatch,
} from "firebase/firestore";

// ── Types ───────────────────────────────────────────────────

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

export interface UserData {
    uid: string;
    phoneNumber: string;
    role: "admin" | "customer";
    name: string;
    gender?: "male" | "female";
    createdAt?: number;
    queryCount?: number;
    lastQueryAt?: number;
    measurements: Record<string, Record<string, number>>;
}

export interface SettingsData {
    dailyStitchCapacity: number;
    currentLoad: Record<string, number>;
    garmentPrices: Record<string, number>;
}

// ── Default Settings (fallback if Firestore is empty) ───────

const DEFAULT_SETTINGS: SettingsData = {
    dailyStitchCapacity: 50,
    garmentPrices: {
        Shirt: 1200,
        Pant: 1500,
        "Girl's Dress": 2500,
        "School Uniform (Boy)": 2000,
        "School Uniform (Girl)": 2200,
        "Police Uniform": 3500,
        Blouse: 850,
        "Salwar Kameez": 3000,
        General: 1000,
    },
    currentLoad: {},
};

// ── Collection references ───────────────────────────────────

const ordersCol = collection(db, "orders");
const usersCol = collection(db, "users");
const settingsDocRef = doc(db, "settings", "global");

// ── Internal Helper: get settings via collection query ──────

async function fetchSettingsData(): Promise<Record<string, unknown>> {
    const settingsCol = collection(db, "settings");
    const snapshot = await getDocs(settingsCol);
    const globalDoc = snapshot.docs.find((d) => d.id === "global");
    return globalDoc ? globalDoc.data() : {};
}

// ── Orders ──────────────────────────────────────────────────

export async function getOrders(): Promise<OrderData[]> {
    try {
        const snapshot = await getDocs(ordersCol);
        return snapshot.docs.map((d) => d.data() as OrderData);
    } catch (error) {
        logger.error("Error fetching orders", error);
        return [];
    }
}

export async function getOrdersByPhone(phone: string): Promise<OrderData[]> {
    try {
        const q = query(ordersCol, where("customerPhone", "==", phone));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => d.data() as OrderData);
    } catch (error) {
        logger.error("Error fetching orders by phone", error);
        return [];
    }
}

export interface OrderSearchFilters {
    query?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: OrderStatus;
}

function applyFilters(items: OrderData[], filters: OrderSearchFilters): OrderData[] {
    let results = items;
    if (filters.query && filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
        results = results.filter(
            (o) =>
                o.customerName.toLowerCase().includes(q) ||
                o.orderId.toLowerCase().includes(q) ||
                o.garmentType.toLowerCase().includes(q)
        );
    }
    if (filters.dateFrom) results = results.filter((o) => o.submissionDate >= filters.dateFrom!);
    if (filters.dateTo) results = results.filter((o) => o.submissionDate <= filters.dateTo!);
    if (filters.status) results = results.filter((o) => o.status === filters.status);
    return results;
}

export async function searchOrders(filters: OrderSearchFilters): Promise<OrderData[]> {
    return applyFilters(await getOrders(), filters);
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function searchOrdersPaginated(
    filters: OrderSearchFilters,
    page: number = 1,
    pageSize: number = 5
): Promise<PaginatedResult<OrderData>> {
    const all = applyFilters(await getOrders(), filters);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total, page: safePage, pageSize, totalPages };
}

export interface CursorResult<T> {
    items: T[];
    total: number;
    nextCursor: number | null;
    hasMore: boolean;
}

export async function searchOrdersCursor(
    filters: OrderSearchFilters,
    cursor: number = 0,
    batchSize: number = 6
): Promise<CursorResult<OrderData>> {
    const all = applyFilters(await getOrders(), filters);
    const total = all.length;
    const items = all.slice(cursor, cursor + batchSize);
    const nextCursor = cursor + batchSize < total ? cursor + batchSize : null;
    return { items, total, nextCursor, hasMore: nextCursor !== null };
}

export async function createOrder(order: Omit<OrderData, "orderId">): Promise<OrderData> {
    // Get current counter from settings
    const settingsData = await fetchSettingsData();
    const currentCounter = (settingsData.orderCounter as number) || 0;
    const newCounter = currentCounter + 1;
    const orderId = `ORD-${String(newCounter).padStart(3, "0")}`;

    const newOrder: OrderData = { ...order, orderId };

    // Batch write: create order + update counter + update load
    const batch = writeBatch(db);
    batch.set(doc(db, "orders", orderId), newOrder);
    batch.set(settingsDocRef, {
        orderCounter: newCounter,
        [`currentLoad.${order.targetDeliveryDate}`]: increment(1),
    }, { merge: true });
    await batch.commit();

    // Refresh cached settings
    cachedSettings = null;
    return newOrder;
}

export async function updateOrder(
    orderId: string,
    updates: Partial<OrderData>
): Promise<OrderData | null> {
    try {
        const orderRef = doc(db, "orders", orderId);
        await setDoc(orderRef, updates, { merge: true });
        // Re-read the updated document
        const all = await getOrders();
        return all.find((o) => o.orderId === orderId) || null;
    } catch (error) {
        logger.error("Error updating order", error);
        return null;
    }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, "orders", orderId));
        return true;
    } catch (error) {
        logger.error("Error deleting order", error);
        return false;
    }
}

// ── Users ───────────────────────────────────────────────────

export interface UserSearchFilters {
    query?: string;
    sortBy?: "newest" | "oldest" | "nameaz";
}

function applyUserFilters(items: UserData[], filters: UserSearchFilters): UserData[] {
    let result = items.filter((u) => u.role === "customer");
    if (filters.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(
            (u) =>
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.phoneNumber && u.phoneNumber.includes(q))
        );
    }
    if (filters.sortBy === "newest") result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    else if (filters.sortBy === "oldest") result.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    else if (filters.sortBy === "nameaz") result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return result;
}

export async function searchUsersPaginated(
    filters: UserSearchFilters,
    page: number = 1,
    pageSize: number = 5
): Promise<PaginatedResult<UserData>> {
    const all = applyUserFilters(await getUsers(), filters);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total, page: safePage, pageSize, totalPages };
}

export async function searchUsersCursor(
    filters: UserSearchFilters,
    cursor: number = 0,
    batchSize: number = 6
): Promise<CursorResult<UserData>> {
    const all = applyUserFilters(await getUsers(), filters);
    const total = all.length;
    const items = all.slice(cursor, cursor + batchSize);
    const nextCursor = cursor + batchSize < total ? cursor + batchSize : null;
    return { items, total, nextCursor, hasMore: nextCursor !== null };
}

export async function getUsers(): Promise<UserData[]> {
    try {
        const snapshot = await getDocs(usersCol);
        return snapshot.docs.map((d) => d.data() as UserData);
    } catch (error) {
        logger.error("Error fetching users", error);
        return [];
    }
}

export async function getUserByPhone(phone: string): Promise<UserData | null> {
    try {
        const q = query(usersCol, where("phoneNumber", "==", phone));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return snapshot.docs[0].data() as UserData;
    } catch (error) {
        logger.error("Error fetching user by phone", error);
        return null;
    }
}

export async function updateUser(
    uid: string,
    updates: Partial<UserData>
): Promise<UserData | null> {
    try {
        await setDoc(doc(db, "users", uid), updates, { merge: true });
        const all = await getUsers();
        return all.find((u) => u.uid === uid) || null;
    } catch (error) {
        logger.error("Error updating user", error);
        return null;
    }
}

export async function createUser(user: Omit<UserData, "uid">): Promise<UserData> {
    const uid = "user_" + Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const newUser: UserData = { ...user, createdAt: user.createdAt || Date.now(), uid };
    await setDoc(doc(db, "users", uid), newUser);
    return newUser;
}

// ── Settings ────────────────────────────────────────────────

export async function getSettings(): Promise<SettingsData> {
    try {
        const data = await fetchSettingsData();
        if (!data || Object.keys(data).length === 0) {
            // First run: create default settings
            try {
                await setDoc(settingsDocRef, { ...DEFAULT_SETTINGS, orderCounter: 0 });
            } catch (e) {
                logger.warn("Could not create default settings", e);
            }
            return { ...DEFAULT_SETTINGS };
        }
        return {
            dailyStitchCapacity: (data.dailyStitchCapacity as number) ?? DEFAULT_SETTINGS.dailyStitchCapacity,
            currentLoad: (data.currentLoad as Record<string, number>) ?? {},
            garmentPrices: (data.garmentPrices as Record<string, number>) ?? DEFAULT_SETTINGS.garmentPrices,
        };
    } catch (error) {
        logger.error("Error fetching settings", error);
        return { ...DEFAULT_SETTINGS };
    }
}

export async function updateSettings(
    updates: Partial<SettingsData>
): Promise<SettingsData> {
    try {
        await setDoc(settingsDocRef, updates, { merge: true });
        cachedSettings = null;
        return getSettings();
    } catch (error) {
        logger.error("Error updating settings", error);
        return getSettings();
    }
}

// ── Helpers ─────────────────────────────────────────────────

let cachedSettings: SettingsData | null = null;

export function getCapacityForDate(date: string): { load: number; capacity: number; available: boolean } {
    const s = cachedSettings || DEFAULT_SETTINGS;
    const load = s.currentLoad[date] || 0;
    return { load, capacity: s.dailyStitchCapacity, available: load < s.dailyStitchCapacity };
}

export async function refreshSettingsCache(): Promise<void> {
    cachedSettings = await getSettings();
}

if (typeof window !== "undefined") {
    refreshSettingsCache();
}

export const ORDER_STATUSES = [
    "Pending", "Cutting", "Stitching", "Alteration", "Ready", "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const incrementUserQueryCount = async (phone: string) => {
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
        logger.error("Error incrementing user query count", error);
    }
};
