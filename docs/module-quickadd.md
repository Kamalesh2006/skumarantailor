# Module: QuickAdd Modal

## Overview
The `+ Quick Add` button in the top navbar opens a lightweight modal for rapid order creation — optimised for the shop counter where the admin needs to place orders fast, including voice input support.

---

## File

`src/components/QuickAddModal.tsx`

---

## Features

- **Multi-set orders**: Add multiple garment types in one submission (each becomes a separate order document)
- **Voice input**: Mic buttons for phone number, customer name, and set counts (English + Tamil)
- **Auto-pricing**: Fetches `garmentPrices` from settings per garment type
- **WhatsApp confirmation**: After creating orders, opens `wa.me` with a bilingual Tamil/English order summary
- **Default delivery**: Always sets delivery to today + 10 days

---

## Difference from CreateOrderModal

| Feature | QuickAddModal | CreateOrderModal |
|---------|--------------|-----------------|
| Voice input | Yes | No |
| Phone autocomplete | No | Yes (3+ digits) |
| Measurement fields | No | Yes (per garment) |
| Measurement visualizer | No | Yes |
| Multiple garment sets | Yes | No (one per order) |
| Delivery picker | Fixed (+10 days) | Date picker |
| WhatsApp message | Yes | No |
| Price position | Auto (hidden) | Last section |

---

## Form Fields

1. Customer Phone (+91 prefix)
2. Customer Name
3. Order Sets — each with:
   - Garment type (dropdown from `GARMENT_TYPES`)
   - Count (stepper + voice)

---

## Submit Flow

1. Find or create customer in `users` collection
2. For each set: call `createOrder` with base price from settings
3. Build bilingual WhatsApp message
4. Open `wa.me/91<phone>?text=<message>` in new tab
5. Show success state, auto-close after 1.5s
