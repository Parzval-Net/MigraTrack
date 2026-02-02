## 2025-02-18 - LocalStorage Access Pattern
**Learning:** Frequent synchronous calls to `localStorage.getItem` followed by `JSON.parse` created a performance bottleneck (O(N) parsing cost on every read).
**Action:** Implement an in-memory write-through cache for data storage services to ensure O(1) read access after initial load.

## 2026-02-02 - Nested Component Definitions
**Learning:** Defining React components inside the render body of another component is a critical anti-pattern that causes unnecessary unmounting and remounting on every render.
**Action:** Extract nested components to their own files or define them outside the parent component to ensure stable identity and prevent DOM thrashing.
