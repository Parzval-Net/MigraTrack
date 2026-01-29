
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

async function runVerification() {
  const { storeService } = await import('../storeService');

  console.log('Starting verification...');

  // 1. Initial State
  const initial = storeService.getCrises();
  if (initial.length !== 0) throw new Error('Initial state not empty');

  // 2. Save Crisis
  const c1 = storeService.saveCrisis({
    date: '2023-01-01',
    type: 'Migraña',
    intensity: 8,
    symptoms: [],
    medications: [],
    localization: [],
    painQuality: [],
    functionalImpact: 'Nada',
    notes: '',
    startTime: '12:00'
  });

  const afterSave = storeService.getCrises();
  if (afterSave.length !== 1) throw new Error('Cache not updated after save');
  if (afterSave[0].id !== c1.id) throw new Error('ID mismatch');

  const stored = JSON.parse(localStorage.getItem('alivio_crises_v1') || '[]');
  if (stored.length !== 1) throw new Error('Storage not updated after save');

  // 3. Update Crisis
  storeService.updateCrisis(c1.id, { intensity: 9 });
  const afterUpdate = storeService.getCrises();
  if (afterUpdate[0].intensity !== 9) throw new Error('Cache not updated after update');

  const storedUpdate = JSON.parse(localStorage.getItem('alivio_crises_v1') || '[]');
  if (storedUpdate[0].intensity !== 9) throw new Error('Storage not updated after update');

  // 4. Delete Crisis
  storeService.deleteCrisis(c1.id);
  const afterDelete = storeService.getCrises();
  if (afterDelete.length !== 0) throw new Error('Cache not updated after delete');

  const storedDelete = JSON.parse(localStorage.getItem('alivio_crises_v1') || '[]');
  if (storedDelete.length !== 0) throw new Error('Storage not updated after delete');

  // 5. Profile
  const profile = { name: 'Test', migraineType: 'Aura', joinedDate: '2023-01-01' };
  storeService.saveProfile(profile);
  const fetchedProfile = storeService.getProfile();
  if (fetchedProfile?.name !== 'Test') throw new Error('Profile cache/storage failed');

  // 6. Clear Data
  storeService.clearAllData();
  if (storeService.getCrises().length !== 0) throw new Error('Clear failed (crises)');
  if (storeService.getProfile() !== null) throw new Error('Clear failed (profile)');

  // 7. Import Data
  const importJson = JSON.stringify({
    version: 1,
    crises: [{ id: 'import1', date: '2023-01-02', intensity: 5 }],
    profile: { name: 'Imported' }
  });
  storeService.importData(importJson);

  if (storeService.getCrises().length !== 1) throw new Error('Import failed (crises)');
  if (storeService.getProfile()?.name !== 'Imported') throw new Error('Import failed (profile)');

  console.log('✅ Verification PASSED');
}

runVerification().catch(e => {
  console.error('❌ Verification FAILED', e);
  process.exit(1);
});
