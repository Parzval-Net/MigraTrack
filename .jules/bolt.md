## 2026-01-31 - LocalStorage Performance Bottleneck
**Learning:** `localStorage` access is synchronous and parsing JSON is expensive. In data-heavy apps using it as a DB, this causes significant UI jank if not cached in memory.
**Action:** Implement a write-through in-memory cache for any `localStorage` data accessed frequently (like lists of records).
