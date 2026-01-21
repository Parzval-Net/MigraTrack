
const { performance } = require('perf_hooks');

// Simulation parameters
const TOTAL_CRISES = 2000; // 5 years of data roughly
const DAYS_TO_RENDER = 42; // 6 weeks in calendar view
const ITERATIONS = 1000; // Simulate 1000 renders

// Generate mock data
const crises = [];
const startDate = new Date(2020, 0, 1);
for (let i = 0; i < TOTAL_CRISES; i++) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + Math.floor(Math.random() * 1000));
  crises.push({
    id: `id-${i}`,
    date: date.toISOString().split('T')[0],
    type: ['Migraña', 'Dolor', 'Medicina', 'Periodo', 'Descanso'][Math.floor(Math.random() * 5)],
    medications: Math.random() > 0.5 ? [{ name: 'Ibuprofeno' }] : [],
    isPeriod: Math.random() > 0.8
  });
}

// Dates to query (representing the visible month)
const queryDates = [];
const viewDate = new Date(2021, 5, 1);
for (let i = 0; i < DAYS_TO_RENDER; i++) {
  const d = new Date(viewDate);
  d.setDate(d.getDate() + i);
  queryDates.push(d.toISOString().split('T')[0]);
}

// Current Approach: Filter inside loop
function currentApproach() {
  let totalIcons = 0;
  for (const dateStr of queryDates) {
    // This represents getDayIcons
    const dailyEntries = crises.filter(c => c.date === dateStr);

    // Logic inside getDayIcons
    const hasPain = dailyEntries.some(e => e.type === 'Migraña' || e.type === 'Dolor');
    if (hasPain) totalIcons++;
  }
  return totalIcons;
}

// Optimized Approach: Pre-calculate Map
function optimizedApproachPrepare() {
  const iconMap = {};
  // Group by date
  const entriesByDate = {};
  for (const c of crises) {
    if (!entriesByDate[c.date]) entriesByDate[c.date] = [];
    entriesByDate[c.date].push(c);
  }

  // Calculate icons
  for (const date in entriesByDate) {
    const entries = entriesByDate[date];
    const hasPain = entries.some(e => e.type === 'Migraña' || e.type === 'Dolor');
    // ... other checks
    if (hasPain) iconMap[date] = true;
  }
  return iconMap;
}

function optimizedApproachRender(iconMap) {
  let totalIcons = 0;
  for (const dateStr of queryDates) {
    if (iconMap[dateStr]) totalIcons++;
  }
  return totalIcons;
}

console.log(`Benchmarking with ${TOTAL_CRISES} crises and ${DAYS_TO_RENDER} days to render...`);

// Measure Current
const startCurrent = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  currentApproach();
}
const endCurrent = performance.now();
const timeCurrent = endCurrent - startCurrent;

// Measure Optimized
// Note: In React, preparation happens once (useMemo), render happens many times.
// We should measure the "Render" phase cost primarily, but also the "Prep" phase to ensure it's not too heavy.

const startPrep = performance.now();
let iconMap;
// We prepare ONCE (simulating useMemo being cached)
iconMap = optimizedApproachPrepare();
const endPrep = performance.now();
const timePrep = endPrep - startPrep;

const startOptimizedRender = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  optimizedApproachRender(iconMap);
}
const endOptimizedRender = performance.now();
const timeOptimizedRender = endOptimizedRender - startOptimizedRender;


console.log(`\nResults over ${ITERATIONS} renders:`);
console.log(`Current Approach (Filter per cell): ${timeCurrent.toFixed(2)}ms`);
console.log(`Optimized Approach (Map Lookup):    ${timeOptimizedRender.toFixed(2)}ms`);
console.log(`Map Preparation Time (Once):        ${timePrep.toFixed(2)}ms`);

console.log(`\nImprovement Factor (Render): ${(timeCurrent / timeOptimizedRender).toFixed(1)}x faster`);
