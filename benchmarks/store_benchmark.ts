
import { webcrypto } from 'node:crypto';

// Mock Browser Environment
if (!global.crypto) {
  // @ts-ignore
  global.crypto = webcrypto;
}

const store = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  key: (index: number) => Array.from(store.keys())[index] || null,
  length: 0
};

Object.defineProperty(localStorageMock, 'length', {
  get: () => store.size
});

// @ts-ignore
global.localStorage = localStorageMock;

// Dynamic import to ensure globals are set
async function runBenchmark() {
  const { storeService } = await import('../storeService');

  // Generate data
  const data = [];
  for (let i = 0; i < 1000; i++) {
    data.push({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'Migraña',
      intensity: Math.floor(Math.random() * 10),
      symptoms: ['Nausea', 'Light Sensitivity'],
      medications: [],
      localization: ['Left'],
      painQuality: ['Pulsing'],
      functionalImpact: 'Limitado',
      notes: 'Benchmark test'
    });
  }

  localStorage.setItem('alivio_crises_v1', JSON.stringify(data));

  console.log('Starting benchmark...');
  const start = performance.now();

  // Read 1000 times
  for (let i = 0; i < 1000; i++) {
    storeService.getCrises();
  }

  const end = performance.now();
  console.log(`Time for 1000 reads: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
