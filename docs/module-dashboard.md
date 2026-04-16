# Module: Dashboard

## Overview
The admin dashboard is the primary workspace. It's a single-page tabbed view served at `/dashboard`.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | Route entry point; reads `?tab=` query param and passes `activeTab` to DashboardContent |
| `src/app/dashboard/DashboardContent.tsx` | **Main component** — all tab rendering, state management, data fetching |
| `src/app/dashboard/components/` | Sub-components used inside the dashboard (see below) |

---

## Tabs

| Tab | Key | Description |
|-----|-----|-------------|
| Overview | `overview` | KPI cards, garment distribution pie chart, today's schedule |
| Orders | `orders` | Full order management (list/grid, search, filters, new order) |
| Customers | `customers` | Customer list/grid, search, measurement editing |
| Monitoring | `monitoring` | Real-time order status board per customer |
| Settings | `settings` | Garment prices, daily stitch capacity config |
| Logs | `logs` | Query history logs for customers |

---

## Sub-Components (`src/app/dashboard/components/`)

| Component | Used In | Purpose |
|-----------|---------|---------|
| `CreateOrderModal.tsx` | Orders tab | New order form (phone autocomplete, measurements, date picker) |
| `MeasurementForm.tsx` | Customers tab | Edit customer info + per-garment measurements |
| `MeasurementVisualizer.tsx` | MeasurementForm, CreateOrderModal | SVG mannequin wireframe showing measurement values |

---

## Global Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `QuickAddModal.tsx` | Top-navbar `+ Quick Add` — fast multi-set order creation with voice input |
| `TailorIcon.tsx` | SVG brand icon (sewing machine) |

---

## Data Loading Strategy

- `loadData()` fetches orders + all users + settings on mount and after mutations
- `allUsers` is kept in state so `CreateOrderModal` can do client-side phone prefix search without extra Firestore calls
- Orders and customers use separate paginated/cursor states for list vs grid views

---

## Auth Guard

DashboardContent redirects to `/` if:
- Auth is still loading, OR
- User is not logged in, OR
- Role is not `"admin"`
