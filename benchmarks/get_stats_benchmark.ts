
import { performance } from 'perf_hooks';
import * as crypto from 'crypto';

// Mock localStorage
const store = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  key: (index: number) => Array.from(store.keys())[index] || null,
  length: 0
} as Storage;

// Mock crypto
if (!global.crypto) {
    // @ts-ignore
    global.crypto = crypto;
}
if (!global.crypto.randomUUID) {
     // @ts-ignore
    global.crypto.randomUUID = () => crypto.randomUUID();
}

import { storeService } from '../storeService';
import { Crisis } from '../types';

function generateDummyCrises(count: number): Crisis[] {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    // Random date within last 365 days
    date: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    type: 'Migraña',
    startTime: '10:00',
    intensity: Math.floor(Math.random() * 10),
    localization: ['Frontal'],
    painQuality: ['Pulsátil'],
    symptoms: ['Náuseas'],
    medications: [],
    functionalImpact: 'Limitado',
    notes: `Crisis number ${i}`
  }));
}

async function runBenchmark() {
  const DATA_SIZE = 5000;
  console.log(`Starting getStats benchmark with ${DATA_SIZE} items...`);

  // Setup data
  const dummyData = generateDummyCrises(DATA_SIZE);
  localStorage.setItem('alivio_crises_v1', JSON.stringify(dummyData));

  // Warm up
  storeService.getStats();

  // Benchmark
  const ITERATIONS = 1000;
  const start = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    storeService.getStats();
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / ITERATIONS;

  console.log(`\nResults for ${DATA_SIZE} items over ${ITERATIONS} iterations:`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per call: ${avgTime.toFixed(3)}ms`);
}

runBenchmark().catch(console.error);
