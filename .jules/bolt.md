## 2025-02-18 - LocalStorage Access Pattern
**Learning:** Frequent synchronous calls to `localStorage.getItem` followed by `JSON.parse` created a performance bottleneck (O(N) parsing cost on every read).
**Action:** Implement an in-memory write-through cache for data storage services to ensure O(1) read access after initial load.

## 2025-02-18 - Sorted Cache for Read Optimization
**Learning:** Maintaining a pre-sorted list in the store cache eliminates the need for repetitive O(N log N) sorts in UI components and enables O(k) early-exit optimizations for statistical calculations (37ms -> 0.02ms).
**Action:** Enforce sort order at the "Write" boundary (save/update) to make "Read" operations (stats/render) zero-cost.
