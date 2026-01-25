
import { storeService } from '../storeService';
import { Crisis } from '../types';
import crypto from 'node:crypto';

// Mock localStorage
const store = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  key: (index: number) => null,
  length: 0
} as Storage;

// Mock crypto.randomUUID if needed
if (!global.crypto) {
    // @ts-ignore
    global.crypto = crypto;
}
if (!global.crypto.randomUUID) {
    // @ts-ignore
    global.crypto.randomUUID = crypto.randomUUID;
}

// Generate dummy data
const generateCrises = (count: number): Crisis[] => {
  const crises: Crisis[] = [];
  for (let i = 0; i < count; i++) {
    crises.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'Migraña',
      startTime: '10:00',
      intensity: Math.floor(Math.random() * 10),
      localization: ['Frontal'],
      painQuality: ['Pulsátil'],
      symptoms: ['Náuseas'],
      medications: [],
      functionalImpact: 'Limitado',
      notes: 'Benchmark test'
    });
  }
  return crises;
};

const runBenchmark = () => {
  console.log('Starting benchmark...');

  // Setup data
  const count = 1000;
  const data = generateCrises(count);
  localStorage.setItem('alivio_crises_v1', JSON.stringify(data));
  console.log(`Populated store with ${count} crises.`);

  // Benchmark getCrises
  const startGet = performance.now();
  for (let i = 0; i < 1000; i++) {
    storeService.getCrises();
  }
  const endGet = performance.now();
  console.log(`getCrises() x 1000 calls: ${(endGet - startGet).toFixed(2)}ms`);

  // Benchmark getStats (which calls getCrises)
  const startStats = performance.now();
  for (let i = 0; i < 100; i++) { // getStats is heavier, running 100 times
    storeService.getStats();
  }
  const endStats = performance.now();
  console.log(`getStats() x 100 calls: ${(endStats - startStats).toFixed(2)}ms`);
};

runBenchmark();
