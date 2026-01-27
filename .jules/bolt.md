## 2024-05-24 - [Synchronous LocalStorage Bottleneck]
**Learning:** `localStorage` access is synchronous and blocking. Reading and parsing JSON from `localStorage` on every access causes significant performance degradation (~2.6ms per call vs ~0.004ms with caching) even with moderate data sizes.
**Action:** Implement a write-through in-memory cache for frequently accessed data stored in `localStorage` to avoid repetitive JSON parsing and disk I/O.
