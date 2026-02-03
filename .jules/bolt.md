## 2025-02-18 - LocalStorage Access Pattern
**Learning:** Frequent synchronous calls to `localStorage.getItem` followed by `JSON.parse` created a performance bottleneck (O(N) parsing cost on every read).
**Action:** Implement an in-memory write-through cache for data storage services to ensure O(1) read access after initial load.

## 2025-02-18 - Logic Optimization: O(N) vs O(N log N)
**Learning:** Using `Array.sort` to find a single max value (e.g. most recent date) is computationally expensive (O(N log N)).
**Action:** Replace sort + filter chains with a single-pass O(N) loop when aggregating statistics or finding min/max values.
