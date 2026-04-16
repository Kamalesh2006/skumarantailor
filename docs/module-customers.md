# Module: Customers

## Overview
Manages customer profiles, measurements, and the measurement visualizer UI.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/dashboard/DashboardContent.tsx` | Customers tab — list/grid view, search, add/edit/delete |
| `src/app/dashboard/components/MeasurementForm.tsx` | Full modal for editing customer info + measurements per garment type |
| `src/app/dashboard/components/MeasurementVisualizer.tsx` | SVG wireframe mannequin that shows measurement values visually |
| `src/lib/measurements.ts` | `GARMENT_TYPES`, `GARMENT_CONFIGS`, `GARMENT_GENDER_MAP` constants |
| `src/lib/firestore.ts` | `createUser`, `updateUser`, `deleteUser`, `getUsers`, `getUserByPhone` |

---

## Customer Data Shape (`UserData`)

```ts
{
  uid: string;
  phoneNumber: string;         // e.g. "+919876543210"
  name: string;
  role: "admin" | "customer";
  gender?: "male" | "female";
  measurements: Record<          // key = garment type
    string,
    Record<string, number>       // key = field id (e.g. "chest"), value = inches
  >;
  createdAt?: number;
  queryCount?: number;
  queryHistory?: QueryHistory[];
}
```

---

## Garment Types (`GARMENT_TYPES`)

```
Shirt | Pant | Girl's Dress | School Uniform (Boy) | School Uniform (Girl)
Police Uniform | Blouse | Salwar Kameez | General
```

Gender mapping lives in `GARMENT_GENDER_MAP` — used to filter dropdown options by customer gender.

---

## MeasurementForm

Two-column layout:
- **Left**: customer info (name, phone, gender) + tabbed garment profiles with field inputs
- **Right**: live `MeasurementVisualizer` that updates as fields are typed

Garment profiles can be added/removed. Fields are defined per type in `GARMENT_CONFIGS`.

---

## MeasurementVisualizer

Renders a wireframe SVG mannequin for the selected garment type:

| Garment | SVG Component |
|---------|--------------|
| Shirt, Police Uniform, School Uniform (Boy) | `WireframeShirt` — shows chest, waist, shoulder, sleeve, length |
| Pant | `WireframePant` — shows waist, length, inseam |
| Girl's Dress, School Uniform (Girl) | `WireframeDress` — shows chest, waist, length |
| Blouse, Salwar Kameez, General | Generic placeholder |

Measurement lines appear only when the corresponding value is non-zero/non-empty.

---

## Measurement Fields by Garment

| Garment | Fields |
|---------|--------|
| Shirt | chest, waist, shoulder, length, sleeve, neck |
| Pant | waist, length, inseam, thigh, groin, bottom |
| Girl's Dress | chest, waist, shoulder, length, armhole, neck |
| School Uniform (Boy) | shirtChest, shirtLength, pantWaist, pantLength |
| School Uniform (Girl) | chest, waist, skirtLength, shoulder |
| Police Uniform | chest, waist, shoulder, shirtLength, pantLength, bicep |
| Blouse | chest, waist, shoulder, length, sleeve, frontNeck, backNeck, armhole |
| Salwar Kameez | topLength, chest, waist, hip, shoulder, sleeve, bottomLength, bottomWaist |
| General | chest, waist, length |
