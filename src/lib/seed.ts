"use client";

// ─────────────────────────────────────────────────────────────
// One-time Seed Script — Populates Firestore with initial data
// Run seedFirestore() from browser console or a temp button
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
};

const todayStr = fmt(today);

const SEED_ORDERS = [
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

const SEED_USERS = [
    { uid: "demo_919876543210", phoneNumber: "+919876543210", role: "customer", name: "Ravi Kumar", gender: "male", createdAt: Date.now() - 86400000 * 5, measurements: { "Shirt": { chest: 40, waist: 34, shoulder: 18, sleeve: 25, neck: 15.5 }, "Pant": { waist: 34, inseam: 30, length: 42 } } },
    { uid: "demo_919812345678", phoneNumber: "+919812345678", role: "customer", name: "Priya Sharma", gender: "female", createdAt: Date.now() - 86400000 * 3, measurements: { "Shirt": { chest: 34, waist: 28, shoulder: 15, sleeve: 22, neck: 13 }, "Girl's Dress": { chest: 34, waist: 28, length: 38 } } },
    { uid: "demo_919845678901", phoneNumber: "+919845678901", role: "customer", name: "Arun Prakash", gender: "male", createdAt: Date.now() - 86400000 * 10, measurements: { "Shirt": { chest: 42, waist: 36, shoulder: 19, sleeve: 26, neck: 16 } } },
    { uid: "demo_919856789012", phoneNumber: "+919856789012", role: "customer", name: "Meena Devi", gender: "female", createdAt: Date.now() - 86400000 * 1, measurements: { "Girl's Dress": { chest: 35, waist: 29, shoulder: 14.5, length: 40 } } },
    { uid: "demo_919867890123", phoneNumber: "+919867890123", role: "customer", name: "Karthik Subramanian", gender: "male", createdAt: Date.now() - 86400000 * 20, measurements: { "Shirt": { chest: 44, waist: 38, shoulder: 20, sleeve: 27, neck: 17 } } },
    { uid: "demo_919990000001", phoneNumber: "+919990000001", role: "admin", name: "Admin (S Kumaran)", createdAt: Date.now() - 86400000 * 100, measurements: {} },
];

const SEED_SETTINGS = {
    dailyStitchCapacity: 50,
    orderCounter: 15,
    garmentPrices: {
        "Shirt": 1200,
        "Pant": 1500,
        "Girl's Dress": 2500,
        "School Uniform (Boy)": 2000,
        "School Uniform (Girl)": 2200,
        "Police Uniform": 3500,
        "Blouse": 850,
        "Salwar Kameez": 3000,
        "General": 1000,
    },
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

export async function seedFirestore(): Promise<string> {
    // Check if already seeded by looking at the settings collection
    const settingsCol = collection(db, "settings");
    const settingsSnap = await getDocs(settingsCol);
    const globalDoc = settingsSnap.docs.find(d => d.id === "global");
    if (globalDoc) {
        return "⚠️ Firestore already has settings data. Skipping seed to avoid duplicates. Delete the 'settings' doc first to re-seed.";
    }

    let count = 0;

    // Seed orders
    for (const order of SEED_ORDERS) {
        await setDoc(doc(db, "orders", order.orderId), order);
        count++;
    }

    // Seed users
    for (const user of SEED_USERS) {
        await setDoc(doc(db, "users", user.uid), user);
        count++;
    }

    // Seed settings
    await setDoc(doc(db, "settings", "global"), SEED_SETTINGS);
    count++;

    return `✅ Firestore seeded successfully! Created ${count} documents (${SEED_ORDERS.length} orders, ${SEED_USERS.length} users, 1 settings).`;
}
