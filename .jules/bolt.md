## 2024-05-23 - Component Definition Inside Component
**Learning:** Found `StatCard` component defined *inside* `HomeScreen` component. This causes the child component to be re-created (new function reference) on every render of the parent, leading to full unmount/remount cycles. In `HomeScreen`, a `setInterval` triggers a re-render every 8 seconds, exacerbating this issue.
**Action:** Always move component definitions to the top level or separate files to ensure stable component identity and allow React's reconciliation to work correctly.
