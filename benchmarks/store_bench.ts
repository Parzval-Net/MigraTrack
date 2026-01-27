
import { storeService } from '../storeService';
import { Crisis } from '../types';

// Mock LocalStorage
const store = new Map<string, string>();
global.localStorage = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  length: 0,
  key: (index: number) => null,
} as Storage;

// Ensure crypto is available
if (!global.crypto) {
    try {
        const { webcrypto } = await import('node:crypto');
        // @ts-ignore
        global.crypto = webcrypto;
    } catch (e) {
        console.warn("Crypto not found, mocking randomUUID");
         // @ts-ignore
        global.crypto = { randomUUID: () => 'uuid-' + Math.random() };
    }
}

// Generate dummy crises
const generateCrises = (count: number): Crisis[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `crisis-${i}`,
    date: new Date().toISOString(),
    type: 'Migraña',
    startTime: '10:00',
    intensity: 5,
    localization: ['Frontal'],
    painQuality: ['Pulsating'],
    symptoms: ['Nausea'],
    medications: [],
    functionalImpact: 'Limitado',
    notes: 'Test notes',
    isPeriod: false
  }));
};

const RUNS = 1000;
const DATA_SIZE = 1000;

console.log(`Setup: Populating storage with ${DATA_SIZE} crises...`);
const crises = generateCrises(DATA_SIZE);
localStorage.setItem('alivio_crises_v1', JSON.stringify(crises));

console.log(`Benchmark: Running storeService.getCrises() ${RUNS} times...`);
const start = performance.now();

for (let i = 0; i < RUNS; i++) {
  storeService.getCrises();
}

const end = performance.now();
const totalTime = end - start;
const avgTime = totalTime / RUNS;

console.log(`Total time: ${totalTime.toFixed(2)}ms`);
console.log(`Average time per call: ${avgTime.toFixed(4)}ms`);
