
import { storeService } from '../storeService';
import { Crisis, UserProfile } from '../types';

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

// Ensure crypto
if (!global.crypto) {
    try {
        const { webcrypto } = await import('node:crypto');
        // @ts-ignore
        global.crypto = webcrypto;
    } catch (e) {
         // @ts-ignore
        global.crypto = { randomUUID: () => 'uuid-' + Math.random() };
    }
}

const runVerification = () => {
  console.log("Starting verification...");

  // 1. Initial State
  storeService.clearAllData();
  if (storeService.getCrises().length !== 0) throw new Error("Expected empty crises");
  if (storeService.getProfile() !== null) throw new Error("Expected null profile");

  // 2. Save Crisis
  const crisisData = {
    date: new Date().toISOString(),
    type: 'Migraña' as const,
    startTime: '12:00',
    intensity: 8,
    localization: ['Temporal'],
    painQuality: ['Pulsating'],
    symptoms: ['Light sensitivity'],
    medications: [],
    functionalImpact: 'Limitado' as const,
    notes: 'Test',
    isPeriod: false
  };

  const savedCrisis = storeService.saveCrisis(crisisData);
  console.log("Crisis saved:", savedCrisis.id);

  // Check memory cache
  const crises = storeService.getCrises();
  if (crises.length !== 1) throw new Error("Expected 1 crisis in memory");
  if (crises[0].id !== savedCrisis.id) throw new Error("Crisis ID mismatch in memory");

  // Check persistence
  const storedRaw = localStorage.getItem('alivio_crises_v1');
  if (!storedRaw) throw new Error("Crisis not in localStorage");
  const storedCrises = JSON.parse(storedRaw);
  if (storedCrises.length !== 1) throw new Error("Expected 1 crisis in storage");

  // 3. Update Crisis
  storeService.updateCrisis(savedCrisis.id, { intensity: 9 });
  const updatedCrises = storeService.getCrises();
  if (updatedCrises[0].intensity !== 9) throw new Error("Crisis update failed in memory");

  const storedUpdated = JSON.parse(localStorage.getItem('alivio_crises_v1')!);
  if (storedUpdated[0].intensity !== 9) throw new Error("Crisis update failed in storage");
  console.log("Crisis updated successfully");

  // 4. Delete Crisis
  storeService.deleteCrisis(savedCrisis.id);
  if (storeService.getCrises().length !== 0) throw new Error("Crisis deletion failed in memory");
  if (JSON.parse(localStorage.getItem('alivio_crises_v1')!).length !== 0) throw new Error("Crisis deletion failed in storage");
  console.log("Crisis deleted successfully");

  // 5. Profile
  const profile: UserProfile = {
    name: "Test User",
    migraineType: "Chronic",
    joinedDate: new Date().toISOString()
  };
  storeService.saveProfile(profile);

  if (storeService.getProfile()?.name !== "Test User") throw new Error("Profile save failed in memory");
  const storedProfile = JSON.parse(localStorage.getItem('alivio_profile_v1')!);
  if (storedProfile.name !== "Test User") throw new Error("Profile save failed in storage");
  console.log("Profile verified");

  // 6. Import Data
  const importData = {
    version: 1,
    crises: [savedCrisis],
    profile: profile
  };
  storeService.importData(JSON.stringify(importData));

  if (storeService.getCrises().length !== 1) throw new Error("Import failed to update crises memory");
  if (storeService.getProfile()?.name !== "Test User") throw new Error("Import failed to update profile memory");
  console.log("Import verified");

  console.log("Verification passed!");
};

runVerification();
