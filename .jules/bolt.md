## 2024-05-22 - [Optimizing Calendar List Rendering]
**Learning:** Rendering calendar grids where each cell filters a global list (O(N) filter inside O(M) loop) creates an O(N*M) bottleneck. Even with small datasets, this pattern blocks the main thread during navigation.
**Action:** Always pre-calculate lookups (maps/dictionaries) using `useMemo` for list-based data visualizations instead of filtering inside the render loop.
