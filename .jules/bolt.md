## 2024-05-22 - React Component Definition & Sync Storage
**Learning:** Defining components inside other components forces React to remount them on every render, destroying state and DOM nodes. This is a significant performance killer often overlooked.
**Action:** Always define components outside, or memoize them if they must be inline (but better to extract).

**Learning:** Synchronous `localStorage` reads with `JSON.parse` are expensive. Calling them multiple times in a single render/effect cycle multiplies the cost.
**Action:** Fetch once, pass as dependency.
