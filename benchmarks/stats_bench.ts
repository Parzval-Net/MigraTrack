
import { performance } from 'perf_hooks';
import { randomUUID } from 'crypto';

// Mock types
interface Crisis {
  id: string;
  date: string;
  intensity: number;
  // Minimal fields needed for stats
}

// Generate mock data
const generateCrises = (count: number): Crisis[] => {
  const crises: Crisis[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    // Random date within last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(now.getDate() - daysAgo);

    crises.push({
      id: randomUUID(),
      date: date.toISOString(),
      intensity: Math.floor(Math.random() * 10) + 1
    });
  }
  return crises;
};

// Original implementation
const originalGetStats = (crises: Crisis[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recent = crises.filter(c => new Date(c.date) >= thirtyDaysAgo);
    const avgIntensity = recent.length > 0
      ? (recent.reduce((acc, c) => acc + c.intensity, 0) / recent.length).toFixed(1)
      : "0";

    const sorted = [...crises].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let daysFree = 0;
    if (sorted.length > 0) {
      const lastDate = new Date(sorted[0].date);
      daysFree = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    }

    return {
      totalRecent: recent.length,
      avgIntensity,
      totalHistory: crises.length,
      daysFree: Math.max(0, daysFree)
    };
};

// Optimized implementation
const optimizedGetStats = (crises: Crisis[]) => {
    const now = new Date().getTime();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    let recentCount = 0;
    let recentIntensitySum = 0;
    let mostRecentDate = 0;

    for (const c of crises) {
        const cDate = new Date(c.date).getTime();

        if (cDate > mostRecentDate) {
            mostRecentDate = cDate;
        }

        if (cDate >= thirtyDaysAgo) {
            recentCount++;
            recentIntensitySum += c.intensity;
        }
    }

    const avgIntensity = recentCount > 0
      ? (recentIntensitySum / recentCount).toFixed(1)
      : "0";

    let daysFree = 0;
    if (mostRecentDate > 0) {
      daysFree = Math.floor((now - mostRecentDate) / (1000 * 3600 * 24));
    }

    return {
      totalRecent: recentCount,
      avgIntensity,
      totalHistory: crises.length,
      daysFree: Math.max(0, daysFree)
    };
};

const runBenchmark = () => {
  const counts = [100, 1000, 5000, 10000];

  console.log('Running benchmark...');
  console.log('--------------------------------------------------');
  console.log('Count | Original (ms) | Optimized (ms) | Speedup');
  console.log('--------------------------------------------------');

  for (const count of counts) {
    const crises = generateCrises(count);

    // Warmup
    originalGetStats(crises);
    optimizedGetStats(crises);

    const iterations = 100;

    const startOriginal = performance.now();
    for (let i = 0; i < iterations; i++) {
        originalGetStats(crises);
    }
    const endOriginal = performance.now();
    const timeOriginal = (endOriginal - startOriginal) / iterations;

    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
        optimizedGetStats(crises);
    }
    const endOptimized = performance.now();
    const timeOptimized = (endOptimized - startOptimized) / iterations;

    const speedup = timeOriginal / timeOptimized;

    console.log(`${count.toString().padEnd(5)} | ${timeOriginal.toFixed(4).padEnd(13)} | ${timeOptimized.toFixed(4).padEnd(14)} | ${speedup.toFixed(2)}x`);
  }
};

runBenchmark();
