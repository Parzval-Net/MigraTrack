
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

// Mock types
interface Crisis {
  id: string;
  date: string;
  type: string;
}

// Generate data
const generateCrises = (count: number): Crisis[] => {
  const crises: Crisis[] = [];
  const baseDate = new Date('2023-01-01');

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + Math.floor(Math.random() * 365));
    crises.push({
      id: randomUUID(),
      date: date.toISOString().split('T')[0],
      type: 'Migraña'
    });
  }
  return crises;
};

const runBenchmark = () => {
  const crisisCount = 2000;
  const daysInMonth = 31;
  const iterations = 1000; // Run the month render loop 1000 times to get stable numbers

  const crises = generateCrises(crisisCount);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date('2023-01-01');
    d.setDate(i + 1);
    return d.toISOString().split('T')[0];
  });

  console.log(`Running benchmark with ${crisisCount} crises over ${daysInMonth} days, ${iterations} iterations.`);

  // Baseline: O(N*M) - Filter inside loop
  const startBaseline = performance.now();
  for (let i = 0; i < iterations; i++) {
    for (const day of days) {
      const daily = crises.filter(c => c.date === day);
      // simulate checking properties
      const hasPain = daily.some(c => c.type === 'Migraña');
    }
  }
  const endBaseline = performance.now();
  const timeBaseline = endBaseline - startBaseline;

  // Optimized: O(N+M) - Pre-calculate map
  const startOptimized = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Build map (this happens once per render/memo)
    const map: Record<string, Crisis[]> = {};
    crises.forEach(c => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });

    // Lookup (happens inside loop)
    for (const day of days) {
      const daily = map[day] || [];
      const hasPain = daily.some(c => c.type === 'Migraña');
    }
  }
  const endOptimized = performance.now();
  const timeOptimized = endOptimized - startOptimized;

  console.log(`Baseline (Filter): ${timeBaseline.toFixed(2)}ms`);
  console.log(`Optimized (Map):   ${timeOptimized.toFixed(2)}ms`);
  console.log(`Improvement:       ${(timeBaseline / timeOptimized).toFixed(2)}x faster`);
};

runBenchmark();
