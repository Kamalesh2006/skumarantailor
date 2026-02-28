"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { GARMENT_TYPES } from "@/lib/measurements";
import {
    createOrder,
    createUser,
    getUserByPhone,
    getSettings,
} from "@/lib/firestore";
import {
    X,
    Plus,
    Trash2,
    Mic,
    MicOff,
    Loader2,
    Send,
    CheckCircle,
} from "lucide-react";


// ── Types ──
interface OrderSet {
    garmentType: string;
    count: number;
}

interface QuickAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated?: () => void;
}

// ── Voice number parsing ──
const NUMBER_WORDS: Record<string, number> = {
    // English
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50,
    // Tamil
    "பூஜ்ஜியம்": 0, "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "நான்கு": 4,
    "ஐந்து": 5, "ஆறு": 6, "ஏழு": 7, "எட்டு": 8, "ஒன்பது": 9, "பத்து": 10,
};

function parseSpokenNumber(text: string): number | null {
    const trimmed = text.trim().toLowerCase();

    // Direct digit string
    const digits = trimmed.replace(/[^0-9]/g, "");
    if (digits.length > 0) return parseInt(digits, 10);

    // Word lookup
    const words = trimmed.split(/\s+/);
    for (const word of words) {
        if (NUMBER_WORDS[word] !== undefined) return NUMBER_WORDS[word];
    }

    return null;
}

// ── Speech recognition helper ──
function useSpeechRecognition(
    lang: string,
    onResult: (text: string) => void,
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

        if (!SpeechRecognitionCtor) {
            setSupported(false);
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang === "ta" ? "ta-IN" : "en-IN";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript || "";
            onResult(transcript);
            setListening(false);
        };

        recognition.onerror = () => {
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.abort();
        };
    }, [lang, onResult]);

    const toggle = useCallback(() => {
        if (!recognitionRef.current) return;
        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
        } else {
            recognitionRef.current.start();
            setListening(true);
        }
    }, [listening]);

    return { listening, toggle, supported };
}

// ── Component ──
export default function QuickAddModal({ isOpen, onClose, onOrderCreated }: QuickAddModalProps) {
    const { t, lang } = useLanguage();

    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [sets, setSets] = useState<OrderSet[]>([{ garmentType: "", count: 1 }]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Track which count field is being voice-filled
    const [voiceTargetIndex, setVoiceTargetIndex] = useState<number | null>(null);

    // Voice for phone
    const phoneVoice = useSpeechRecognition(
        lang,
        useCallback((text: string) => {
            const digits = text.replace(/[^0-9]/g, "");
            if (digits) {
                setPhone((prev) => (prev + digits).slice(0, 10));
            }
        }, []),
    );

    // Voice for name
    const nameVoice = useSpeechRecognition(
        lang,
        useCallback((text: string) => {
            setName((prev) => (prev ? prev + " " + text : text));
        }, []),
    );

    // Voice for count (uses voiceTargetIndex)
    const countVoice = useSpeechRecognition(
        lang,
        useCallback(
            (text: string) => {
                const num = parseSpokenNumber(text);
                if (num !== null && voiceTargetIndex !== null) {
                    setSets((prev) => {
                        const updated = [...prev];
                        if (updated[voiceTargetIndex]) {
                            updated[voiceTargetIndex] = { ...updated[voiceTargetIndex], count: num };
                        }
                        return updated;
                    });
                }
            },
            [voiceTargetIndex],
        ),
    );

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhone("");
            setName("");
            setSets([{ garmentType: "", count: 1 }]);
            setSubmitting(false);
            setSuccess(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // ── Set management ──
    const addSet = () => setSets((prev) => [...prev, { garmentType: "", count: 1 }]);
    const removeSet = (idx: number) => setSets((prev) => prev.filter((_, i) => i !== idx));
    const updateSet = (idx: number, field: keyof OrderSet, value: string | number) => {
        setSets((prev) => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    // ── Validation ──
    const phoneClean = phone.replace(/\D/g, "");
    const isValid =
        phoneClean.length === 10 &&
        name.trim().length > 0 &&
        sets.length > 0 &&
        sets.every((s) => s.garmentType && s.count > 0);

    // ── Submit ──
    const handleSubmit = async () => {
        if (!isValid || submitting) return;
        setSubmitting(true);

        try {
            const fullPhone = `+91${phoneClean}`;

            // Create or find user
            let existingUser = await getUserByPhone(fullPhone);
            if (!existingUser) {
                existingUser = await createUser({
                    phoneNumber: fullPhone,
                    role: "customer",
                    name: name.trim(),
                    measurements: {},
                });
            }

            // Get garment prices
            const settings = await getSettings();
            const prices = settings.garmentPrices || {};

            const today = new Date();
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + 10);
            const todayStr = today.toISOString().split("T")[0];
            const targetStr = targetDate.toISOString().split("T")[0];

            // Create orders for each set
            const createdOrders: string[] = [];
            for (const s of sets) {
                const basePrice = prices[s.garmentType] || 1000;
                const order = await createOrder({
                    customerPhone: fullPhone,
                    customerName: name.trim(),
                    status: "Pending",
                    binLocation: "",
                    submissionDate: todayStr,
                    targetDeliveryDate: targetStr,
                    basePrice,
                    numberOfSets: s.count,
                    totalAmount: basePrice * s.count,
                    rushFee: 0,
                    isApprovedRushed: false,
                    garmentType: s.garmentType,
                    notes: "",
                });
                createdOrders.push(`${order.orderId}: ${s.garmentType} × ${s.count}`);
            }

            // Build WhatsApp message
            const orderSummary = sets
                .map((s) => `• ${t(`garment.${s.garmentType}`) || s.garmentType} × ${s.count}`)
                .join("\n");

            const message =
                `🧵 *S Kumaran Tailors*\n\n` +
                `Hello ${name.trim()}!\n\n` +
                `Your order has been placed:\n${orderSummary}\n\n` +
                `📅 Expected delivery: ${targetStr}\n` +
                `📞 For queries, call us.\n\n` +
                `Thank you! 🙏`;

            const whatsappUrl = `https://wa.me/91${phoneClean}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");

            setSuccess(true);
            onOrderCreated?.();

            // Auto-close after 1.5s
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Quick add failed:", err);
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
                style={{ background: "var(--bg-secondary)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-0">
                    <h3
                        className="text-lg font-bold"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9, #a855f7)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {t("quickAdd.title")}
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-themed-muted hover:text-themed-primary transition-colors"
                        style={{ background: "var(--hover-bg)" }}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Success state */}
                {success ? (
                    <div className="flex flex-col items-center justify-center py-12 px-5 gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                        </div>
                        <p className="text-sm font-medium text-emerald-500">{t("quickAdd.success")}</p>
                    </div>
                ) : (
                    <div className="p-5 space-y-5">
                        {/* Phone */}
                        <div>
                            <label className="text-xs font-semibold text-themed-secondary mb-1.5 block">
                                {t("quickAdd.phone")}
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-themed-muted">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    placeholder={t("quickAdd.phonePlaceholder")}
                                    className="form-input text-sm flex-1"
                                    maxLength={10}
                                />
                                {phoneVoice.supported && (
                                    <button
                                        type="button"
                                        onClick={phoneVoice.toggle}
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${phoneVoice.listening
                                                ? "bg-red-500/15 text-red-400 animate-pulse"
                                                : "text-themed-muted hover:text-sky-500 hover:bg-sky-500/10"
                                            }`}
                                        title={phoneVoice.listening ? t("quickAdd.voiceListening") : "Voice input"}
                                    >
                                        {phoneVoice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>
                            {phoneVoice.listening && (
                                <p className="text-xs text-red-400 mt-1 animate-pulse">{t("quickAdd.voiceListening")}</p>
                            )}
                        </div>

                        {/* Name with voice */}
                        <div>
                            <label className="text-xs font-semibold text-themed-secondary mb-1.5 block">
                                {t("quickAdd.name")}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("quickAdd.namePlaceholder")}
                                    className="form-input text-sm flex-1"
                                />
                                {nameVoice.supported && (
                                    <button
                                        type="button"
                                        onClick={nameVoice.toggle}
                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${nameVoice.listening
                                            ? "bg-red-500/15 text-red-400 animate-pulse"
                                            : "text-themed-muted hover:text-sky-500 hover:bg-sky-500/10"
                                            }`}
                                        title={nameVoice.listening ? t("quickAdd.voiceListening") : "Voice input"}
                                    >
                                        {nameVoice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>
                            {nameVoice.listening && (
                                <p className="text-xs text-red-400 mt-1 animate-pulse">{t("quickAdd.voiceListening")}</p>
                            )}
                        </div>

                        {/* Order Sets */}
                        <div>
                            <label className="text-xs font-semibold text-themed-secondary mb-2 block">
                                {t("quickAdd.sets")}
                            </label>
                            <div className="space-y-3">
                                {sets.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-2 p-3 rounded-xl"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}
                                    >
                                        {/* Garment type dropdown */}
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[10px] font-medium text-themed-muted uppercase tracking-wider block mb-1">
                                                {t("quickAdd.garmentType")}
                                            </label>
                                            <select
                                                value={s.garmentType}
                                                onChange={(e) => updateSet(idx, "garmentType", e.target.value)}
                                                className="w-full appearance-none rounded-lg px-2.5 py-2 text-sm font-medium cursor-pointer"
                                                style={{
                                                    background: "var(--input-bg)",
                                                    border: "1px solid var(--glass-border)",
                                                    color: s.garmentType ? "var(--text-primary)" : "var(--text-muted)",
                                                }}
                                            >
                                                <option value="">{t("quickAdd.selectGarment")}</option>
                                                {GARMENT_TYPES.map((g) => (
                                                    <option key={g} value={g}>
                                                        {t(`garment.${g}`) || g}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Count with voice */}
                                        <div className="w-24 flex-shrink-0">
                                            <label className="text-[10px] font-medium text-themed-muted uppercase tracking-wider block mb-1">
                                                {t("quickAdd.count")}
                                            </label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={99}
                                                    value={s.count}
                                                    onChange={(e) =>
                                                        updateSet(idx, "count", Math.max(1, parseInt(e.target.value) || 1))
                                                    }
                                                    className="w-full rounded-lg px-2 py-2 text-sm text-center"
                                                    style={{
                                                        background: "var(--input-bg)",
                                                        border: "1px solid var(--glass-border)",
                                                        color: "var(--text-primary)",
                                                    }}
                                                />
                                                {countVoice.supported && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setVoiceTargetIndex(idx);
                                                            countVoice.toggle();
                                                        }}
                                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${countVoice.listening && voiceTargetIndex === idx
                                                            ? "bg-red-500/15 text-red-400 animate-pulse"
                                                            : "text-themed-muted hover:text-sky-500 hover:bg-sky-500/10"
                                                            }`}
                                                        title="Voice"
                                                    >
                                                        {countVoice.listening && voiceTargetIndex === idx ? (
                                                            <MicOff className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <Mic className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Remove button */}
                                        {sets.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSet(idx)}
                                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-5"
                                                title={t("quickAdd.removeSet")}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add set button */}
                            <button
                                type="button"
                                onClick={addSet}
                                className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-500 hover:bg-sky-500/10 transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                {t("quickAdd.addSet")}
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid || submitting}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: isValid && !submitting
                                    ? "linear-gradient(135deg, #0ea5e9, #6366f1, #a855f7)"
                                    : "var(--bg-tertiary)",
                            }}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("quickAdd.submitting")}
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    {t("quickAdd.submit")}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
