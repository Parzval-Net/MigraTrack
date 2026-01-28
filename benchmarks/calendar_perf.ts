
import { performance } from 'perf_hooks';

interface Crisis {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
}

const N = 5000; // Number of crises
const DAYS_IN_MONTH = 31;
const YEAR = 2024;
const MONTH = 5; // June

// Generate mock data
const crises: Crisis[] = [];
for (let i = 0; i < N; i++) {
  const day = (i % DAYS_IN_MONTH) + 1;
  const dateStr = `${YEAR}-${String(MONTH + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  crises.push({
    id: `id-${i}`,
    date: dateStr,
    type: 'Migraña'
  });
}

const dayArray = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
const dateStrings = dayArray.map(d => `${YEAR}-${String(MONTH + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);

// Benchmark 1: Current O(N*M) Approach
const start1 = performance.now();
let count1 = 0;
for (const dateStr of dateStrings) {
  const dailyEntries = crises.filter(c => c.date === dateStr);
  count1 += dailyEntries.length;
}
const end1 = performance.now();
const time1 = end1 - start1;

// Benchmark 2: Optimized O(N+M) Approach
const start2 = performance.now();
// Step 1: Pre-calculate map
const crisesByDate: Record<string, Crisis[]> = {};
for (const c of crises) {
  if (!crisesByDate[c.date]) crisesByDate[c.date] = [];
  crisesByDate[c.date].push(c);
}

// Step 2: Lookup
let count2 = 0;
for (const dateStr of dateStrings) {
  const dailyEntries = crisesByDate[dateStr] || [];
  count2 += dailyEntries.length;
}
const end2 = performance.now();
const time2 = end2 - start2;

console.log(`\n⚡ Calendar Logic Benchmark (N=${N} crises, M=${DAYS_IN_MONTH} days)`);
console.log('--------------------------------------------------');
console.log(`Current (Filter in Loop): ${time1.toFixed(4)} ms`);
console.log(`Optimized (Map Lookup):   ${time2.toFixed(4)} ms`);
console.log(`Speedup:                  ${(time1 / time2).toFixed(1)}x`);
console.log('--------------------------------------------------');

if (count1 !== count2) {
    console.error(`ERROR: Counts do not match! ${count1} vs ${count2}`);
    process.exit(1);
}
