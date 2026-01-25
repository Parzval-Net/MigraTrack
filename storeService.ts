
import { Crisis, UserProfile } from './types';

const STORAGE_KEY = 'alivio_crises_v1';
const PROFILE_KEY = 'alivio_profile_v1';

// In-memory cache
let crisesCache: Crisis[] | null = null;
let profileCache: UserProfile | null = null;

export const storeService = {
  getCrises: (): Crisis[] => {
    if (crisesCache) return crisesCache;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      crisesCache = data ? JSON.parse(data) : [];
      return crisesCache!;
    } catch (e) {
      console.error("Error reading from storage", e);
      return [];
    }
  },

  saveCrisis: (crisis: Omit<Crisis, 'id'>) => {
    const crises = storeService.getCrises();
    const newCrisis = {
      ...crisis,
      id: crypto.randomUUID()
    };
    const updated = [...crises, newCrisis];
    crisesCache = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCrisis;
  },

  updateCrisis: (id: string, updates: Partial<Crisis>) => {
    const crises = storeService.getCrises();
    const updated = crises.map(c => c.id === id ? { ...c, ...updates } : c);
    crisesCache = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteCrisis: (id: string) => {
    const crises = storeService.getCrises();
    const updated = crises.filter(c => c.id !== id);
    crisesCache = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getProfile: (): UserProfile | null => {
    if (profileCache) return profileCache;
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      profileCache = data ? JSON.parse(data) : null;
      return profileCache;
    } catch (e) {
      console.error("Error reading profile", e);
      return null;
    }
  },

  saveProfile: (profile: UserProfile) => {
    profileCache = profile;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  clearAllData: () => {
    crisesCache = null;
    profileCache = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },

  getStats: () => {
    const crises = storeService.getCrises();
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recent = crises.filter(c => new Date(c.date) >= thirtyDaysAgo);
    const avgIntensity = recent.length > 0
      ? (recent.reduce((acc, c) => acc + c.intensity, 0) / recent.length).toFixed(1)
      : "0";

    const sorted = [...crises].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let daysFree = 0;
    if (sorted.length > 0) {
      const lastDate = new Date(sorted[0].date);
      daysFree = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    }

    return {
      totalRecent: recent.length,
      avgIntensity,
      totalHistory: crises.length,
      daysFree: Math.max(0, daysFree)
    };
  },

  getClinicalInsights: () => {
    const crises = storeService.getCrises();
    if (crises.length === 0) return null;

    const symptomsMap: Record<string, number> = {};
    const medsMap: Record<string, number> = {};
    const locMap: Record<string, number> = {};

    crises.forEach(c => {
      c.symptoms.forEach(s => symptomsMap[s] = (symptomsMap[s] || 0) + 1);
      c.localization.forEach(l => locMap[l] = (locMap[l] || 0) + 1);
      c.medications.forEach(m => {
        if (m.relief === 'Total' || m.relief === 'Moderado') {
          medsMap[m.name] = (medsMap[m.name] || 0) + 1;
        }
      });
    });

    const topSymptom = Object.entries(symptomsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ninguno';
    const topMed = Object.entries(medsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No registrado';
    const topLoc = Object.entries(locMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Difusa';

    return { topSymptom, topMed, topLoc };
  },

  exportData: () => {
    const crises = storeService.getCrises();
    const profile = storeService.getProfile();
    const exportObj = {
      version: 1,
      timestamp: new Date().toISOString(),
      profile,
      crises
    };
    return JSON.stringify(exportObj, null, 2);
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.version || !Array.isArray(data.crises)) {
        throw new Error("Invalid backup format");
      }

      crisesCache = data.crises;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.crises));

      if (data.profile) {
        profileCache = data.profile;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
      }
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      return false;
    }
  }
};
