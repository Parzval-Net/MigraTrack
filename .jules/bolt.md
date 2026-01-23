## 2024-05-22 - Calendar Rendering Performance
**Learning:** Rendering calendar grids often involves checking a list of events for each day. Doing `events.filter(e => e.date === day)` inside the render loop creates an O(N*M) complexity (N days * M events), which causes frame drops when M is large.
**Action:** Always pre-calculate a `date -> events[]` lookup map (O(M)) using `useMemo` before rendering. This reduces the per-day check to O(1).
