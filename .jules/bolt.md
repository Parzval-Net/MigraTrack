## 2024-05-24 - [Calendar Rendering Optimization]
**Learning:** Rendering loops that filter large datasets (O(N*M)) inside `map` callback cause massive performance degradation as data grows.
**Action:** Always pre-calculate lookup maps (e.g. `Record<string, T[]>`) using `useMemo` outside the render loop to ensure O(1) access during iteration.
