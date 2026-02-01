
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
};

// Mock crypto if needed (Node 18+ has global crypto, but just in case)
if (!global.crypto) {
    // @ts-ignore
    global.crypto = crypto;
}
if (!global.crypto.randomUUID) {
     // @ts-ignore
    global.crypto.randomUUID = () => crypto.randomUUID();
}


// Import storeService after mocking
// We need to use dynamic import or require to ensure mocks are in place if the module had top-level side effects using them.
// But storeService is safe.
import { storeService } from '../storeService';
import { Crisis } from '../types';

function generateDummyCrises(count: number): Crisis[] {
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    type: 'Migraña',
    startTime: '10:00',
    intensity: 5,
    localization: ['Frontal'],
    painQuality: ['Pulsátil'],
    symptoms: ['Náuseas'],
    medications: [],
    functionalImpact: 'Limitado',
    notes: `Crisis number ${i}`
  }));
}

async function runBenchmark() {
  console.log('Starting benchmark...');

  // Setup data
  const DATA_SIZE = 1000;
  const dummyData = generateDummyCrises(DATA_SIZE);
  localStorage.setItem('alivio_crises_v1', JSON.stringify(dummyData));

  // Benchmark getCrises
  const ITERATIONS = 1000;
  const start = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    const data = storeService.getCrises();
    // Simulate some simple access
    if (data.length !== DATA_SIZE) throw new Error('Data mismatch');
  }

  const end = performance.now();
  const totalTime = end - start;
  const avgTime = totalTime / ITERATIONS;

  console.log(`\nResults for ${DATA_SIZE} items over ${ITERATIONS} iterations:`);
  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per call: ${avgTime.toFixed(3)}ms`);
}

runBenchmark().catch(console.error);
