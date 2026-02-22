"use client";

// ─────────────────────────────────────────────────────────────
// Firestore Data Layer — with Demo Mode (in-memory store)
// ─────────────────────────────────────────────────────────────

export interface OrderData {
    orderId: string;
    customerPhone: string;
    customerName: string;
    status: "Pending" | "Cutting" | "Stitching" | "Alteration" | "Ready" | "Delivered";
    binLocation: string;
    submissionDate: string; // ISO date
    targetDeliveryDate: string; // ISO date
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
    measurements: Record<string, Record<string, number>>; // GarmentType -> { field: value }
}

export interface SettingsData {
    dailyStitchCapacity: number;
    currentLoad: Record<string, number>; // date string -> count
}

// ── DEMO SEED DATA ──────────────────────────────────────────

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
};

const todayStr = fmt(today);

let demoOrders: OrderData[] = [
    { orderId: "ORD-001", customerPhone: "+919876543210", customerName: "Ravi Kumar", status: "Stitching", binLocation: "A-12", submissionDate: fmt(addDays(today, -2)), targetDeliveryDate: fmt(addDays(today, 3)), basePrice: 1500, numberOfSets: 1, totalAmount: 1500, rushFee: 0, isApprovedRushed: false, garmentType: "Shirt", notes: "Extra slim fit" },
    { orderId: "ORD-002", customerPhone: "+919812345678", customerName: "Priya Sharma", status: "Pending", binLocation: "B-04", submissionDate: fmt(addDays(today, -1)), targetDeliveryDate: fmt(addDays(today, 5)), basePrice: 2200, numberOfSets: 2, totalAmount: 4400, rushFee: 500, isApprovedRushed: true, garmentType: "Girl's Dress", notes: "Knee length" },
    { orderId: "ORD-003", customerPhone: "+919845678901", customerName: "Arun Prakash", status: "Ready", binLocation: "C-01", submissionDate: fmt(addDays(today, -5)), targetDeliveryDate: fmt(addDays(today, 0)), basePrice: 1800, numberOfSets: 1, totalAmount: 1800, rushFee: 0, isApprovedRushed: false, garmentType: "Pant", notes: "No cuffs" },
    { orderId: "ORD-004", customerPhone: "+919834567890", customerName: "Meena Devi", status: "Cutting", binLocation: "A-08", submissionDate: todayStr, targetDeliveryDate: fmt(addDays(today, 7)), basePrice: 3500, numberOfSets: 1, totalAmount: 3500, rushFee: 0, isApprovedRushed: false, garmentType: "Salwar Kameez", notes: "Cotton fabric" },
    { orderId: "ORD-005", customerPhone: "+919823456789", customerName: "Sanjay Gupta", status: "Alteration", binLocation: "D-02", submissionDate: fmt(addDays(today, -10)), targetDeliveryDate: fmt(addDays(today, -1)), basePrice: 1200, numberOfSets: 1, totalAmount: 1200, rushFee: 0, isApprovedRushed: false, garmentType: "Shirt", notes: "Sleeves too long" },
    { orderId: "ORD-006", customerPhone: "+919890123456", customerName: "Anita Desai", status: "Delivered", binLocation: "Delivered", submissionDate: fmt(addDays(today, -15)), targetDeliveryDate: fmt(addDays(today, -5)), basePrice: 4000, numberOfSets: 2, totalAmount: 8000, rushFee: 0, isApprovedRushed: false, garmentType: "School Uniform", notes: "Include badges" },
    { orderId: "ORD-007", customerPhone: "+919889012345", customerName: "Vikram Singh", status: "Pending", binLocation: "B-09", submissionDate: todayStr, targetDeliveryDate: fmt(addDays(today, 10)), basePrice: 2800, numberOfSets: 1, totalAmount: 2800, rushFee: 0, isApprovedRushed: false, garmentType: "Pant", notes: "Pleated" },
    { orderId: "ORD-008", customerPhone: "+919878901234", customerName: "Neha Kapoor", status: "Stitching", binLocation: "C-05", submissionDate: fmt(addDays(today, -3)), targetDeliveryDate: fmt(addDays(today, 4)), basePrice: 1600, numberOfSets: 1, totalAmount: 1600, rushFee: 0, isApprovedRushed: false, garmentType: "Blouse", notes: "Deep back neck" },
    { orderId: "ORD-009", customerPhone: "+919867890123", customerName: "Karthik Subramanian", status: "Ready", binLocation: "A-03", submissionDate: fmt(addDays(today, -4)), targetDeliveryDate: fmt(addDays(today, 2)), basePrice: 5000, numberOfSets: 1, totalAmount: 5000, rushFee: 0, isApprovedRushed: false, garmentType: "Blazer", notes: "Navy blue, brass buttons" },
    { orderId: "ORD-010", customerPhone: "+919856789012", customerName: "Sneha Reddy", status: "Cutting", binLocation: "D-10", submissionDate: fmt(addDays(today, -1)), targetDeliveryDate: fmt(addDays(today, 6)), basePrice: 2000, numberOfSets: 1, totalAmount: 2000, rushFee: 0, isApprovedRushed: false, garmentType: "Girl's Dress", notes: "A-line" },
    { orderId: "ORD-011", customerPhone: "+919876543210", customerName: "Ravi Kumar", status: "Pending", binLocation: "B-11", submissionDate: todayStr, targetDeliveryDate: fmt(addDays(today, 8)), basePrice: 1500, numberOfSets: 1, totalAmount: 1500, rushFee: 0, isApprovedRushed: false, garmentType: "Pant", notes: "Slim fit" },
    { orderId: "ORD-012", customerPhone: "+919812345678", customerName: "Priya Sharma", status: "Stitching", binLocation: "A-15", submissionDate: fmt(addDays(today, -2)), targetDeliveryDate: fmt(addDays(today, 5)), basePrice: 2200, numberOfSets: 1, totalAmount: 2200, rushFee: 500, isApprovedRushed: true, garmentType: "Salwar Kameez", notes: "Silk, intricate embroidery" },
    { orderId: "ORD-013", customerPhone: "+919845678901", customerName: "Arun Prakash", status: "Alteration", binLocation: "C-08", submissionDate: fmt(addDays(today, -8)), targetDeliveryDate: fmt(addDays(today, -2)), basePrice: 1800, numberOfSets: 1, totalAmount: 1800, rushFee: 0, isApprovedRushed: false, garmentType: "Shirt", notes: "Collar too tight" },
    { orderId: "ORD-014", customerPhone: "+919834567890", customerName: "Meena Devi", status: "Delivered", binLocation: "Delivered", submissionDate: fmt(addDays(today, -20)), targetDeliveryDate: fmt(addDays(today, -10)), basePrice: 3500, numberOfSets: 1, totalAmount: 3500, rushFee: 0, isApprovedRushed: false, garmentType: "Blouse", notes: "Puff sleeves" },
    { orderId: "ORD-015", customerPhone: "+919867890123", customerName: "Karthik Subramanian", status: "Cutting", binLocation: "B-06", submissionDate: fmt(addDays(today, -1)), targetDeliveryDate: fmt(addDays(today, 9)), basePrice: 6000, numberOfSets: 1, totalAmount: 6000, rushFee: 1000, isApprovedRushed: true, garmentType: "Blazer", notes: "Custom fit, charcoal" },
];

let demoUsers: UserData[] = [
    { uid: "demo_919876543210", phoneNumber: "+919876543210", role: "customer", name: "Ravi Kumar", measurements: { "Shirt": { chest: 40, waist: 34, shoulder: 18, sleeve: 25, neck: 15.5 }, "Pant": { waist: 34, inseam: 30, length: 42 } } },
    { uid: "demo_919812345678", phoneNumber: "+919812345678", role: "customer", name: "Priya Sharma", measurements: { "Shirt": { chest: 34, waist: 28, shoulder: 15, sleeve: 22, neck: 13 }, "Girl's Dress": { chest: 34, waist: 28, length: 38 } } },
    { uid: "demo_919845678901", phoneNumber: "+919845678901", role: "customer", name: "Arun Prakash", measurements: { "Shirt": { chest: 42, waist: 36, shoulder: 19, sleeve: 26, neck: 16 } } },
    { uid: "demo_919856789012", phoneNumber: "+919856789012", role: "customer", name: "Meena Devi", measurements: { "Girl's Dress": { chest: 35, waist: 29, shoulder: 14.5, length: 40 } } },
    { uid: "demo_919867890123", phoneNumber: "+919867890123", role: "customer", name: "Karthik Subramanian", measurements: { "Shirt": { chest: 44, waist: 38, shoulder: 20, sleeve: 27, neck: 17 } } },
    { uid: "demo_919990000001", phoneNumber: "+919990000001", role: "admin", name: "Admin (S Kumaran)", measurements: {} },
];

let demoSettings: SettingsData = {
    dailyStitchCapacity: 50,
    currentLoad: {
        [fmt(today)]: 35,
        [fmt(addDays(today, 1))]: 42,
        [fmt(addDays(today, 2))]: 48,
        [fmt(addDays(today, 3))]: 50,
        [fmt(addDays(today, 4))]: 30,
        [fmt(addDays(today, 5))]: 20,
        [fmt(addDays(today, 6))]: 15,
        [fmt(addDays(today, 7))]: 10,
        [fmt(addDays(today, 8))]: 5,
        [fmt(addDays(today, 9))]: 2,
    },
};

let orderCounter = 15;

// ── DEMO DATA ACCESS FUNCTIONS ──────────────────────────────

// Orders
export async function getOrders(): Promise<OrderData[]> {
    return [...demoOrders];
}

export async function getOrdersByPhone(phone: string): Promise<OrderData[]> {
    return demoOrders.filter((o) => o.customerPhone === phone);
}

export interface OrderSearchFilters {
    query?: string;          // search by customer name (partial, case-insensitive)
    dateFrom?: string;       // ISO date — filter orders submitted on or after
    dateTo?: string;         // ISO date — filter orders submitted on or before
    status?: OrderStatus;    // filter by status
}

// Core filter logic — shared by all search variants
function applyFilters(orders: OrderData[], filters: OrderSearchFilters): OrderData[] {
    let results = orders;

    if (filters.query && filters.query.trim()) {
        const q = filters.query.trim().toLowerCase();
        results = results.filter(
            (o) =>
                o.customerName.toLowerCase().includes(q) ||
                o.orderId.toLowerCase().includes(q) ||
                o.garmentType.toLowerCase().includes(q)
        );
    }
    if (filters.dateFrom) {
        results = results.filter((o) => o.submissionDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
        results = results.filter((o) => o.submissionDate <= filters.dateTo!);
    }
    if (filters.status) {
        results = results.filter((o) => o.status === filters.status);
    }
    return results;
}

// Non-paginated search (backward compat)
export async function searchOrders(filters: OrderSearchFilters): Promise<OrderData[]> {
    return applyFilters([...demoOrders], filters);
}

// ── Paginated search (for List View) ────────────────────────
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
    const all = applyFilters([...demoOrders], filters);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return { items, total, page: safePage, pageSize, totalPages };
}

// ── Cursor-based search (for Grid View lazy loading) ────────
export interface CursorResult<T> {
    items: T[];
    total: number;
    nextCursor: number | null;  // index to resume from, null = no more
    hasMore: boolean;
}

export async function searchOrdersCursor(
    filters: OrderSearchFilters,
    cursor: number = 0,
    batchSize: number = 6
): Promise<CursorResult<OrderData>> {
    const all = applyFilters([...demoOrders], filters);
    const total = all.length;
    const items = all.slice(cursor, cursor + batchSize);
    const nextCursor = cursor + batchSize < total ? cursor + batchSize : null;

    return { items, total, nextCursor, hasMore: nextCursor !== null };
}

export async function createOrder(order: Omit<OrderData, "orderId">): Promise<OrderData> {
    orderCounter++;
    const newOrder: OrderData = {
        ...order,
        orderId: `ORD-${String(orderCounter).padStart(3, "0")}`,
    };
    demoOrders = [newOrder, ...demoOrders];

    // Update capacity load for target date
    const existing = demoSettings.currentLoad[order.targetDeliveryDate] || 0;
    demoSettings.currentLoad[order.targetDeliveryDate] = existing + 1;

    return newOrder;
}

export async function updateOrder(
    orderId: string,
    updates: Partial<OrderData>
): Promise<OrderData | null> {
    const idx = demoOrders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return null;
    demoOrders[idx] = { ...demoOrders[idx], ...updates };
    return demoOrders[idx];
}

export async function deleteOrder(orderId: string): Promise<boolean> {
    const before = demoOrders.length;
    demoOrders = demoOrders.filter((o) => o.orderId !== orderId);
    return demoOrders.length < before;
}

// Users
export interface UserSearchFilters {
    query?: string;
}

function applyUserFilters(users: UserData[], filters: UserSearchFilters): UserData[] {
    let result = users.filter((u) => u.role === "customer");
    if (filters.query) {
        const q = filters.query.toLowerCase();
        result = result.filter(
            (u) =>
                (u.name && u.name.toLowerCase().includes(q)) ||
                (u.phoneNumber && u.phoneNumber.includes(q))
        );
    }
    return result;
}

export async function searchUsersPaginated(
    filters: UserSearchFilters,
    page: number = 1,
    pageSize: number = 5
): Promise<PaginatedResult<UserData>> {
    const all = applyUserFilters([...demoUsers], filters);
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
    const all = applyUserFilters([...demoUsers], filters);
    const total = all.length;
    const items = all.slice(cursor, cursor + batchSize);
    const nextCursor = cursor + batchSize < total ? cursor + batchSize : null;

    return { items, total, nextCursor, hasMore: nextCursor !== null };
}

export async function getUsers(): Promise<UserData[]> {
    return [...demoUsers];
}

export async function getUserByPhone(phone: string): Promise<UserData | null> {
    return demoUsers.find((u) => u.phoneNumber === phone) || null;
}

export async function updateUser(
    uid: string,
    updates: Partial<UserData>
): Promise<UserData | null> {
    const idx = demoUsers.findIndex((u) => u.uid === uid);
    if (idx === -1) return null;
    demoUsers[idx] = { ...demoUsers[idx], ...updates };
    return demoUsers[idx];
}

export async function createUser(user: Omit<UserData, "uid">): Promise<UserData> {
    const newUser: UserData = {
        ...user,
        uid: "user_" + Date.now().toString() + Math.random().toString(36).substr(2, 5),
    };
    demoUsers = [newUser, ...demoUsers];
    return newUser;
}

// Settings
export async function getSettings(): Promise<SettingsData> {
    return { ...demoSettings, currentLoad: { ...demoSettings.currentLoad } };
}

export async function updateSettings(
    updates: Partial<SettingsData>
): Promise<SettingsData> {
    demoSettings = { ...demoSettings, ...updates };
    return demoSettings;
}

// Helpers
export function getCapacityForDate(date: string): { load: number; capacity: number; available: boolean } {
    const load = demoSettings.currentLoad[date] || 0;
    return {
        load,
        capacity: demoSettings.dailyStitchCapacity,
        available: load < demoSettings.dailyStitchCapacity,
    };
}

export const ORDER_STATUSES = [
    "Pending",
    "Cutting",
    "Stitching",
    "Alteration",
    "Ready",
    "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
