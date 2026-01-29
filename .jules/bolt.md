## 2024-05-24 - [StoreService Caching]
**Learning:** `storeService` methods were directly accessing `localStorage` and parsing JSON on every call, leading to significant overhead (1896ms for 1000 reads).
**Action:** Implemented in-memory caching in `storeService` to reduce read time to ~2ms. Ensure future data services implement caching layers.
