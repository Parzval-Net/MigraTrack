
import { storeService } from '../storeService';
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

// Mock crypto
if (!global.crypto) {
    // @ts-ignore
    global.crypto = crypto;
}
if (!global.crypto.randomUUID) {
     // @ts-ignore
    global.crypto.randomUUID = () => crypto.randomUUID();
}

const dummyCrisis = {
  date: new Date().toISOString(),
  type: 'Migraña',
  startTime: '10:00',
  intensity: 8,
  localization: ['Frontal'],
  painQuality: ['Pulsátil'],
  symptoms: ['Náuseas'],
  medications: [],
  functionalImpact: 'Limitado',
  notes: 'Test crisis'
};

// @ts-ignore
storeService.saveCrisis(dummyCrisis);

const stats = storeService.getStats();
console.log('Stats:', stats);

if (stats.totalHistory !== 1) throw new Error('Stats totalHistory should be 1');

const insights = storeService.getClinicalInsights();
console.log('Insights:', insights);

if (!insights) throw new Error('Insights should not be null');

console.log('Integration check passed');
