"use client";

import { useState } from "react";
import { seedFirestore } from "@/lib/seed";

export default function SeedPage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        setStatus("Seeding...");
        try {
            const result = await seedFirestore();
            setStatus(result);
        } catch (error) {
            setStatus(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>🌱 Seed Firestore Database</h1>
            <p style={{ marginBottom: "20px", color: "#666" }}>
                Click the button below to populate Firestore with initial demo data
                (15 orders, 6 users, settings with pricing).
            </p>
            <button
                onClick={handleSeed}
                disabled={loading}
                style={{
                    padding: "12px 24px",
                    fontSize: "16px",
                    backgroundColor: loading ? "#ccc" : "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "Seeding..." : "Seed Database"}
            </button>
            {status && (
                <pre style={{
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "8px",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                }}>
                    {status}
                </pre>
            )}
            <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
                After seeding, go to <a href="/dashboard" style={{ color: "#0ea5e9" }}>/dashboard</a> to see the data.
            </p>
        </div>
    );
}
