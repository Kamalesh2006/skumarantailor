# Module: Orders

## Overview
Handles the full lifecycle of tailoring orders — creation, status progression, and display.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/dashboard/DashboardContent.tsx` | Main dashboard; hosts the Orders tab with list/grid views, search, filters, and the New Order button |
| `src/app/dashboard/components/CreateOrderModal.tsx` | **New Order modal** — rich form with phone autocomplete, measurement visualizer, date picker, and auto-pricing |
| `src/components/QuickAddModal.tsx` | Quick-add shortcut (top navbar `+ Quick Add`) — multi-set order creation with voice input |
| `src/lib/firestore.ts` | `createOrder`, `updateOrder`, `deleteOrder`, `getOrders`, `searchOrdersPaginated`, `searchOrdersCursor` |

---

## Order Data Shape (`OrderData`)

```ts
{
  orderId: string;           // e.g. "ORD-001"
  customerPhone: string;     // e.g. "+919876543210"
  customerName: string;
  status: "Pending" | "Cutting" | "Stitching" | "Alteration" | "Ready" | "Delivered";
  garmentType: string;       // from GARMENT_TYPES
  numberOfSets: number;
  basePrice: number;
  totalAmount: number;       // basePrice * numberOfSets
  rushFee: number;
  isApprovedRushed: boolean;
  submissionDate: string;    // ISO date "YYYY-MM-DD"
  targetDeliveryDate: string;
  binLocation: string;
  notes: string;
}
```

---

## CreateOrderModal — Feature Summary

- **Phone autocomplete**: Shows matching customers when 3+ digits are typed (filtered from `allUsers` prop). Selecting a customer pre-fills name and measurements.
- **Garment type dropdown**: Uses `GARMENT_TYPES` constant; selecting a type triggers measurement fields + visualizer.
- **Measurement visualizer**: Renders `MeasurementVisualizer` SVG beside the input fields. Pre-fills from the customer's stored measurements if they exist.
- **Delivery date picker**: `<input type="date">` defaulting to today + 10 days.
- **Auto-pricing**: Base price auto-populated from `settings.garmentPrices[garmentType]`; total shown as `price × sets`.
- **On submit**: Creates/updates the customer record (saves measurements), then creates the order.

---

## Status Flow

```
Pending → Cutting → Stitching → Alteration → Ready → Delivered
```

Status can be updated inline in both list and grid views via a `<select>` dropdown.

---

## Search & Filters (Orders tab)

- Text search: name, order ID, garment type
- Date range filter: `submissionDate`
- Status filter chips
- List view: paginated (5 per page)
- Grid view: cursor-based lazy-load (6 per batch)
