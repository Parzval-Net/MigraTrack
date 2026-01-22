## 2024-05-22 - Calendar Rendering Optimization
**Learning:** Found O(N*M) filtering logic inside the main render loop of CalendarScreen, causing performance degradation as data grows (verified ~70x slowdown in benchmark).
**Action:** Always pre-calculate lookup maps (e.g., date -> items) using `useMemo` for grid-based rendering components to ensure O(1) access inside render loops.
