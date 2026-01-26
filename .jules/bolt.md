# Bolt's Journal - Critical Learnings

## 2024-05-22 - Calendar Rendering Optimization
**Learning:** The calendar component was re-filtering the entire `crises` array for every day cell during every render, leading to O(N*M) complexity.
**Action:** Use `useMemo` to pre-calculate a lookup map (O(N)) keyed by date. This reduces the render loop complexity to O(M) with O(1) lookups.
**Learning:** React state initialization with `new Date().toISOString()` results in UTC dates. Verification scripts must align with this timezone assumption to correctly match "today".
**Action:** When testing date-sensitive components, ensure the test script generates dates in the same timezone (UTC vs Local) as the component's logic.
