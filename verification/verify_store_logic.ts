
import { storeService } from '../storeService';
import { Crisis, UserProfile } from '../types';
import assert from 'assert';
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

// Mock crypto
if (!global.crypto) {
    // @ts-ignore
    global.crypto = crypto;
}
if (!global.crypto.randomUUID) {
    // @ts-ignore
    global.crypto.randomUUID = crypto.randomUUID;
}

const runVerification = () => {
  console.log('Starting verification...');

  // 1. Initial State
  storeService.clearAllData();
  assert.deepStrictEqual(storeService.getCrises(), [], 'Should start empty');
  assert.strictEqual(storeService.getProfile(), null, 'Profile should be null');

  // 2. Save Crisis
  const crisisData: Omit<Crisis, 'id'> = {
    date: new Date().toISOString(),
    type: 'Migraña',
    startTime: '12:00',
    intensity: 8,
    localization: ['Temple'],
    painQuality: ['Pulsing'],
    symptoms: ['Nausea'],
    medications: [],
    functionalImpact: 'Limitado',
    notes: 'Test crisis'
  };

  const saved = storeService.saveCrisis(crisisData);
  assert.ok(saved.id, 'Should have generated ID');

  // Verify cache
  const crises = storeService.getCrises();
  assert.strictEqual(crises.length, 1, 'Should have 1 crisis in cache');
  assert.deepStrictEqual(crises[0], saved, 'Cache should match saved item');

  // Verify storage
  const storedRaw = localStorage.getItem('alivio_crises_v1');
  const stored = JSON.parse(storedRaw!);
  assert.strictEqual(stored.length, 1, 'Storage should have 1 crisis');
  assert.deepStrictEqual(stored[0], saved, 'Storage should match saved item');

  console.log('✅ Save Crisis verified');

  // 3. Update Crisis
  storeService.updateCrisis(saved.id, { intensity: 5 });

  const updatedCrises = storeService.getCrises();
  assert.strictEqual(updatedCrises[0].intensity, 5, 'Cache should be updated');

  const storedUpdated = JSON.parse(localStorage.getItem('alivio_crises_v1')!);
  assert.strictEqual(storedUpdated[0].intensity, 5, 'Storage should be updated');

  console.log('✅ Update Crisis verified');

  // 4. Delete Crisis
  storeService.deleteCrisis(saved.id);

  assert.strictEqual(storeService.getCrises().length, 0, 'Cache should be empty after delete');
  assert.strictEqual(JSON.parse(localStorage.getItem('alivio_crises_v1')!).length, 0, 'Storage should be empty after delete');

  console.log('✅ Delete Crisis verified');

  // 5. Save Profile
  const profile: UserProfile = {
    name: 'Bolt',
    migraineType: 'Aura',
    joinedDate: new Date().toISOString()
  };

  storeService.saveProfile(profile);
  assert.deepStrictEqual(storeService.getProfile(), profile, 'Cache should have profile');
  assert.deepStrictEqual(JSON.parse(localStorage.getItem('alivio_profile_v1')!), profile, 'Storage should have profile');

  console.log('✅ Save Profile verified');

  // 6. Import Data
  const backup = {
    version: 1,
    crises: [saved], // reusing the saved one
    profile: profile
  };

  storeService.importData(JSON.stringify(backup));

  assert.strictEqual(storeService.getCrises().length, 1, 'Import should update cache');
  assert.strictEqual(storeService.getProfile()?.name, 'Bolt', 'Import should update profile cache');

  console.log('✅ Import Data verified');

  // 7. Clear All
  storeService.clearAllData();
  assert.strictEqual(storeService.getCrises().length, 0, 'Cache should be cleared');
  assert.strictEqual(storeService.getProfile(), null, 'Profile cache should be cleared');
  assert.strictEqual(localStorage.getItem('alivio_crises_v1'), null, 'Storage should be cleared');

  console.log('✅ Clear Data verified');
};

try {
    runVerification();
    console.log('🎉 All verifications passed!');
} catch (e) {
    console.error('❌ Verification failed:', e);
    process.exit(1);
}
