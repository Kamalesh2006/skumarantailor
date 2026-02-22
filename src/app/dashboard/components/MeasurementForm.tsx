"use client";

import React, { useState } from "react";
import { UserData } from "@/lib/firestore";
import { GARMENT_TYPES, GarmentType, GARMENT_CONFIGS, GARMENT_GENDER_MAP } from "@/lib/measurements";
import { useLanguage } from "@/lib/LanguageContext";
import MeasurementVisualizer from "./MeasurementVisualizer";
import { X, Plus, Trash2, Ruler } from "lucide-react";

interface MeasurementFormProps {
    user: UserData;
    onClose: () => void;
    onSave: (uid: string, name: string, phone: string, gender: "male" | "female" | undefined, measurements: Record<string, Record<string, number>>) => void;
}

export default function MeasurementForm({ user, onClose, onSave }: MeasurementFormProps) {
    const { t } = useLanguage();

    // Local state for edits
    const [name, setName] = useState(user.name);
    const [nameError, setNameError] = useState(false);
    const [phone, setPhone] = useState(user.phoneNumber || "");
    const [gender, setGender] = useState<"male" | "female" | undefined>(user.gender);
    // Deep copy to prevent mutating prop
    const [measurements, setMeasurements] = useState<Record<string, Record<string, number>>>(
        JSON.parse(JSON.stringify(user.measurements || {}))
    );

    // UI state
    const existingTypes = Object.keys(measurements) as GarmentType[];
    const [activeGarment, setActiveGarment] = useState<GarmentType>(
        existingTypes.length > 0 ? existingTypes[0] : "Shirt"
    );
    const [isAddingNew, setIsAddingNew] = useState(existingTypes.length === 0);

    const handleMeasurementChange = (fieldId: string, value: string) => {
        const numVal = parseFloat(value);
        setMeasurements(prev => ({
            ...prev,
            [activeGarment]: {
                ...(prev[activeGarment] || {}),
                [fieldId]: isNaN(numVal) ? 0 : numVal
            }
        }));
    };

    const handleAddGarment = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as GarmentType;
        if (!type || type === activeGarment) return;

        if (!measurements[type]) {
            setMeasurements(prev => ({ ...prev, [type]: {} }));
        }
        setActiveGarment(type);
        setIsAddingNew(false);
    };

    const handleDeleteGarment = (type: GarmentType) => {
        const newMeasurements = { ...measurements };
        delete newMeasurements[type];
        setMeasurements(newMeasurements);

        const remaining = Object.keys(newMeasurements) as GarmentType[];
        if (remaining.length > 0) {
            setActiveGarment(remaining[0]);
        } else {
            setIsAddingNew(true);
        }
    };

    const currentGarmentData = measurements[activeGarment] || {};
    const config = GARMENT_CONFIGS[activeGarment] || GARMENT_CONFIGS["General"];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
            <div className="glass-card flex flex-col w-full max-w-5xl max-h-[90vh] animate-slide-up" style={{ background: "var(--bg-secondary)" }}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <div>
                        <h3 className="text-xl font-bold text-themed-primary flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-sky-500" />
                            {t("dash.editCustomer")}
                        </h3>
                        <p className="text-sm text-themed-secondary mt-1">{user.phoneNumber || "New Customer"}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-themed-muted hover:text-themed-primary transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body - Two Columns */}
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[400px]">

                    {/* Left Col: Form & Tabs */}
                    <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r overflow-y-auto" style={{ borderColor: "var(--glass-border)" }}>
                        <div className="p-5 space-y-6">

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-themed-muted mb-2 block">
                                        {t("dash.name")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setNameError(false); }}
                                        className={`form-input text-sm w-full font-medium ${nameError ? "border-red-500 bg-red-500/5 focus:ring-red-500/20" : ""}`}
                                        placeholder="Customer Name"
                                    />
                                    {nameError && <p className="text-[10px] text-red-500 mt-1">Name is required.</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-themed-muted mb-2 block">Phone Number</label>
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="form-input text-sm w-full font-medium"
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-themed-muted mb-2 block">Gender</label>
                                        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/5">
                                            <button
                                                onClick={() => setGender("male")}
                                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${gender === "male" ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                onClick={() => setGender("female")}
                                                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${gender === "female" ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white" : "text-themed-secondary hover:text-themed-primary"}`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Garment Tabs */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-themed-muted">{t("dash.measurements")}</label>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {existingTypes.map(type => (
                                        <div key={type} className="flex items-center">
                                            <button
                                                onClick={() => { setActiveGarment(type); setIsAddingNew(false); }}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-l-lg border transition-colors ${activeGarment === type && !isAddingNew ? 'bg-sky-500/10 text-sky-500 border-sky-500/30' : 'text-themed-secondary border-transparent hover:bg-white/5'}`}
                                            >
                                                {type}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGarment(type)}
                                                className={`px-2 py-1.5 border-y border-r rounded-r-lg transition-colors ${activeGarment === type && !isAddingNew ? 'bg-sky-500/10 text-sky-500 border-y-sky-500/30 border-r-sky-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' : 'text-themed-muted border-transparent hover:text-red-400 hover:bg-red-500/10'}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {!isAddingNew && (
                                        <button
                                            onClick={() => setIsAddingNew(true)}
                                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-themed-secondary hover:text-sky-500 hover:bg-sky-500/10 transition-colors flex items-center gap-1 border border-dashed"
                                            style={{ borderColor: "var(--glass-border)" }}
                                        >
                                            <Plus className="h-4 w-4" /> Add Profile
                                        </button>
                                    )}
                                </div>

                                {/* Active Form Area */}
                                <div className="bg-black/10 rounded-xl p-4 border" style={{ borderColor: "var(--glass-border)" }}>
                                    {isAddingNew ? (
                                        <div className="py-4">
                                            <label className="block text-sm font-medium text-themed-primary mb-2">Select Garment Profile to Add:</label>
                                            <select
                                                className="form-input text-sm w-full cursor-pointer"
                                                value=""
                                                onChange={handleAddGarment}
                                            >
                                                <option value="" disabled>-- Select Garment Type --</option>
                                                {GARMENT_TYPES.filter(t => {
                                                    // Hide already added
                                                    if (existingTypes.includes(t)) return false;
                                                    // If a gender is selected, restrict.
                                                    if (gender) {
                                                        const docGender = GARMENT_GENDER_MAP[t];
                                                        return docGender === "unisex" || docGender === gender;
                                                    }
                                                    // If no gender, show all
                                                    return true;
                                                }).map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {config.map(field => (
                                                <div key={field.id}>
                                                    <label className="text-xs text-themed-secondary capitalize mb-1.5 block">
                                                        {t(field.labelKey) !== field.labelKey ? t(field.labelKey) : field.id}
                                                    </label>
                                                    <div className="flex gap-1 relative">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="number"
                                                                value={(() => {
                                                                    const v = currentGarmentData[field.id];
                                                                    return v !== undefined && !isNaN(v) ? Math.floor(v) || (v === 0 ? 0 : "") : "";
                                                                })()}
                                                                onChange={(e) => {
                                                                    const v = currentGarmentData[field.id] || 0;
                                                                    const frac = v - Math.floor(v);
                                                                    const w = e.target.value === "" ? 0 : parseInt(e.target.value);
                                                                    handleMeasurementChange(field.id, (w + frac).toString());
                                                                }}
                                                                className="form-input text-sm w-full pr-8 font-medium"
                                                                placeholder={field.placeholder}
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-themed-muted font-medium select-none pointer-events-none">in</span>
                                                        </div>
                                                        <select
                                                            value={(() => {
                                                                const v = currentGarmentData[field.id];
                                                                return v !== undefined && !isNaN(v) ? (v - Math.floor(v)).toString() : "0";
                                                            })()}
                                                            onChange={(e) => {
                                                                const v = currentGarmentData[field.id] || 0;
                                                                const w = Math.floor(v);
                                                                const frac = parseFloat(e.target.value);
                                                                handleMeasurementChange(field.id, (w + frac).toString());
                                                            }}
                                                            className="form-input text-sm w-16 px-1 appearance-none cursor-pointer bg-black/5 dark:bg-white/5 text-center font-medium"
                                                        >
                                                            <option value="0">.0</option>
                                                            <option value="0.25">¼</option>
                                                            <option value="0.5">½</option>
                                                            <option value="0.75">¾</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Visualizer */}
                    <div className="hidden lg:flex flex-1 lg:max-w-[40%] bg-black/20 p-6 flex-col">
                        <h4 className="text-sm font-semibold text-themed-secondary mb-4 text-center tracking-wider uppercase">
                            {isAddingNew ? "Preview" : `${activeGarment} Visualizer`}
                        </h4>
                        <div className="flex-1 min-h-[300px]">
                            {!isAddingNew ? (
                                <MeasurementVisualizer
                                    garmentType={activeGarment}
                                    measurements={currentGarmentData}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10 border-dashed">
                                    <p className="text-themed-muted text-sm text-center">Select a profile<br />to view diagram</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: "var(--glass-border)", background: "var(--hover-bg)" }}>
                    <button onClick={onClose} className="btn-secondary">
                        {t("common.cancel")}
                    </button>
                    <button
                        onClick={() => {
                            if (!name.trim()) {
                                setNameError(true);
                                return;
                            }
                            onSave(user.uid, name, phone, gender, measurements);
                        }}
                        className="btn-primary"
                    >
                        {t("dash.saveChanges")}
                    </button>
                </div>
            </div>
        </div>
    );
}
