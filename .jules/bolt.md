# Bolt's Journal ⚡

This journal tracks critical performance learnings, anti-patterns, and insights specific to this codebase.

## 2024-05-22 - [React Performance Patterns]
**Learning:** Defining React components inside other components is a strictly forbidden anti-pattern in this codebase due to performance costs (unnecessary unmount/remount cycles).
**Action:** Always define components at the top level or in separate files.
