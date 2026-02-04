## 2025-02-18 - LocalStorage Access Pattern
**Learning:** Frequent synchronous calls to `localStorage.getItem` followed by `JSON.parse` created a performance bottleneck (O(N) parsing cost on every read).
**Action:** Implement an in-memory write-through cache for data storage services to ensure O(1) read access after initial load.

## 2025-02-18 - Algorithmic Optimization in storeService
**Learning:** Replacing O(N log N) sorting with O(N) single-pass iteration for calculating statistics yielded a ~20x performance improvement (53ms to 2.4ms for 5000 items).
**Action:** When calculating aggregate statistics (max, avg) from a list, prefer single-pass loops over chaining .filter(), .map(), and .sort().
