export const GARMENT_TYPES = [
    "Shirt",
    "Pant",
    "Girl's Dress",
    "School Uniform (Boy)",
    "School Uniform (Girl)",
    "Police Uniform",
    "Blouse",
    "Salwar Kameez",
    "General"
] as const;

export type GarmentType = typeof GARMENT_TYPES[number];

export interface MeasurementField {
    id: string;
    labelKey: string; // Translation key
    placeholder: string;
}

export const GARMENT_CONFIGS: Record<GarmentType, MeasurementField[]> = {
    "Shirt": [
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., 40" },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., 34" },
        { id: "shoulder", labelKey: "measure.shoulder", placeholder: "e.g., 18" },
        { id: "length", labelKey: "measure.length", placeholder: "e.g., 28" },
        { id: "sleeve", labelKey: "measure.sleeve", placeholder: "e.g., 25" },
        { id: "neck", labelKey: "measure.neck", placeholder: "e.g., 15.5" },
    ],
    "Pant": [
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., 34" },
        { id: "length", labelKey: "measure.length", placeholder: "e.g., 42" },
        { id: "inseam", labelKey: "measure.inseam", placeholder: "e.g., 30" },
        { id: "thigh", labelKey: "measure.thigh", placeholder: "e.g., 24" },
        { id: "groin", labelKey: "measure.groin", placeholder: "e.g., 12" },
        { id: "bottom", labelKey: "measure.bottom", placeholder: "e.g., 16" },
    ],
    "Girl's Dress": [
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., 34" },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., 28" },
        { id: "shoulder", labelKey: "measure.shoulder", placeholder: "e.g., 14" },
        { id: "length", labelKey: "measure.length", placeholder: "e.g., 40" },
        { id: "armhole", labelKey: "measure.armhole", placeholder: "e.g., 16" },
        { id: "neck", labelKey: "measure.neck", placeholder: "e.g., 13" },
    ],
    "School Uniform (Boy)": [
        { id: "shirtChest", labelKey: "measure.shirtChest", placeholder: "e.g., 32" },
        { id: "shirtLength", labelKey: "measure.shirtLength", placeholder: "e.g., 24" },
        { id: "pantWaist", labelKey: "measure.pantWaist", placeholder: "e.g., 28" },
        { id: "pantLength", labelKey: "measure.pantLength", placeholder: "e.g., 36" },
    ],
    "School Uniform (Girl)": [
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., 30" },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., 26" },
        { id: "skirtLength", labelKey: "measure.skirtLength", placeholder: "e.g., 22" },
        { id: "shoulder", labelKey: "measure.shoulder", placeholder: "e.g., 13" },
    ],
    "Police Uniform": [
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., 42" },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., 36" },
        { id: "shoulder", labelKey: "measure.shoulder", placeholder: "e.g., 19" },
        { id: "shirtLength", labelKey: "measure.shirtLength", placeholder: "e.g., 29" },
        { id: "pantLength", labelKey: "measure.pantLength", placeholder: "e.g., 41" },
        { id: "bicep", labelKey: "measure.bicep", placeholder: "e.g., 15" },
    ],
    "Blouse": [
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., " },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., " },
        { id: "shoulder", labelKey: "measure.shoulder", placeholder: "e.g., " },
        { id: "length", labelKey: "measure.length", placeholder: "e.g., " },
        { id: "sleeve", labelKey: "measure.sleeve", placeholder: "e.g., " },
        { id: "frontNeck", labelKey: "measure.frontNeck", placeholder: "e.g., " },
        { id: "backNeck", labelKey: "measure.backNeck", placeholder: "e.g., " },
        { id: "armhole", labelKey: "measure.armhole", placeholder: "e.g., " },
    ],
    "Salwar Kameez": [
        { id: "topLength", labelKey: "measure.topLength", placeholder: "e.g., 40" },
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., 36" },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., 30" },
        { id: "hip", labelKey: "measure.hip", placeholder: "e.g., 38" },
        { id: "shoulder", labelKey: "measure.shoulder", placeholder: "e.g., 15" },
        { id: "sleeve", labelKey: "measure.sleeve", placeholder: "e.g., 18" },
        { id: "bottomLength", labelKey: "measure.bottomLength", placeholder: "e.g., 42" },
        { id: "bottomWaist", labelKey: "measure.bottomWaist", placeholder: "e.g., 34" },
    ],
    "General": [
        { id: "chest", labelKey: "measure.chest", placeholder: "e.g., " },
        { id: "waist", labelKey: "measure.waist", placeholder: "e.g., " },
        { id: "length", labelKey: "measure.length", placeholder: "e.g., " },
    ]
};
