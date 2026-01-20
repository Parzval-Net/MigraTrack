# Bolt's Journal

## 2023-10-27 - Calendar Render Optimization
**Learning:** Rendering calendars with `filter()` inside the render loop for every day cell is a massive performance killer (O(N*M)).
**Action:** Always pre-calculate date-to-data maps using `useMemo` when rendering grids or lists that depend on filtered subsets of a larger dataset.
