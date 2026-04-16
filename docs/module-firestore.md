# Module: Firestore / Data Layer

## Overview
All Firestore reads/writes go through `src/lib/firestore.ts`. Never call Firebase directly from components.

---

## Collections

| Collection | Document ID | Description |
|------------|-------------|-------------|
| `orders` | `orderId` (e.g. "ORD-001") | All tailoring orders |
| `users` | `uid` (e.g. "user_<timestamp><rand>") | Customers and admins |
| `settings` | `"settings"` (singleton) | Shop config (capacity, garment prices) |

---

## Key Functions

### Orders
```ts
createOrder(data: Omit<OrderData, "orderId">): Promise<OrderData>
updateOrder(orderId, updates): Promise<OrderData | null>
deleteOrder(orderId): Promise<void>
getOrders(): Promise<OrderData[]>
searchOrdersPaginated(filters, page, pageSize): Promise<PaginatedResult<OrderData>>
searchOrdersCursor(filters, cursor, batchSize): Promise<CursorResult<OrderData>>
```

### Users
```ts
createUser(data: Omit<UserData, "uid">): Promise<UserData>
updateUser(uid, updates: Partial<UserData>): Promise<UserData | null>
deleteUser(uid): Promise<void>
getUsers(): Promise<UserData[]>
getUserByPhone(phone: string): Promise<UserData | null>   // exact match on phoneNumber
searchUsersPaginated(filters, page, pageSize): Promise<PaginatedResult<UserData>>
searchUsersCursor(filters, cursor, batchSize): Promise<CursorResult<UserData>>
```

### Settings
```ts
getSettings(): Promise<SettingsData>
updateSettings(updates: Partial<SettingsData>): Promise<SettingsData>
```

---

## Settings Shape (`SettingsData`)

```ts
{
  dailyStitchCapacity: number;
  currentLoad: Record<string, number>;   // key = "YYYY-MM-DD"
  garmentPrices: Record<string, number>; // key = garment type, value = ₹
}
```

Default garment prices: Shirt ₹1200, Pant ₹1500, Girl's Dress ₹2500, etc.

---

## Phone Number Format

All phone numbers are stored as `+91XXXXXXXXXX` (E.164 with India country code).  
The `+91` prefix is added before writing and stripped for display in the UI.

---

## Pagination Patterns

**List views** use offset-based pagination (`searchUsersPaginated`, `searchOrdersPaginated`).  
**Grid views** use cursor-based lazy-load (`searchUsersCursor`, `searchOrdersCursor`) — cursor is an array index.

---

## Settings Cache

Settings are cached in module-level `cachedSettings`. Call `refreshSettingsCache()` to bust it (called automatically on app load).
