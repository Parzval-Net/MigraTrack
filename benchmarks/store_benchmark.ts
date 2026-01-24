
import { storeService } from '../storeService';
import { Crisis } from '../types';
import crypto from 'node:crypto';

// Mock localStorage
const store = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
};

// Polyfill globals
(global as any).localStorage = localStorageMock;

// Helper to generate a random crisis
function generateCrisis(id: string): Crisis {
  return {
    id,
    date: new Date().toISOString(),
    type: 'Migraña',
    startTime: '10:00',
    intensity: Math.floor(Math.random() * 10),
    localization: ['Frontal'],
    painQuality: ['Pulsátil'],
    symptoms: ['Náuseas'],
    medications: [],
    functionalImpact: 'Limitado',
    notes: 'Generated for benchmark',
  };
}

// Populate
const COUNT = 1000;
const ITERATIONS = 100;

console.log(`Generating ${COUNT} crises...`);
const crises: Crisis[] = [];
for (let i = 0; i < COUNT; i++) {
  crises.push(generateCrisis(crypto.randomUUID()));
}

// Write directly to storage to skip saveCrisis overhead during setup
localStorageMock.setItem('alivio_crises_v1', JSON.stringify(crises));

console.log('Running benchmark...');

// Measure getCrises
const startCrises = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  storeService.getCrises();
}
const endCrises = performance.now();
const timeCrises = endCrises - startCrises;

// Measure getStats
const startStats = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  storeService.getStats();
}
const endStats = performance.now();
const timeStats = endStats - startStats;

console.log(`getCrises x ${ITERATIONS}: ${timeCrises.toFixed(2)}ms`);
console.log(`getStats x ${ITERATIONS}: ${timeStats.toFixed(2)}ms`);

// Correctness check
console.log('Verifying correctness...');
const inputCrisis = {
    date: new Date().toISOString(),
    type: 'Migraña' as const,
    startTime: '12:00',
    intensity: 5,
    localization: ['Temporal'],
    painQuality: ['Opresivo'],
    symptoms: ['Fotofobia'],
    medications: [],
    functionalImpact: 'Nada' as const,
    notes: 'Correctness Check',
};
const savedCrisis = storeService.saveCrisis(inputCrisis);
const fetchedCrises = storeService.getCrises();
const isPresent = fetchedCrises.some(c => c.id === savedCrisis.id);

if (isPresent) {
    console.log('Correctness: PASS (New crisis found)');
} else {
    console.error('Correctness: FAIL (New crisis NOT found)');
    process.exit(1);
}

// Check if stats updated (count should increase)
const stats = storeService.getStats();
if (stats.totalHistory === COUNT + 1) {
    console.log('Correctness: PASS (Stats updated)');
} else {
    console.error(`Correctness: FAIL (Stats not updated: expected ${COUNT + 1}, got ${stats.totalHistory})`);
    process.exit(1);
}
