## 2026-01-28 - [O(N*M) Rendering Loops]
**Learning:** Calendar rendering used nested filtering (crises.filter inside day mapping), causing O(N*M) complexity.
**Action:** Use useMemo to create a O(1) lookup map (Record<string, T[]>) before rendering grids.
