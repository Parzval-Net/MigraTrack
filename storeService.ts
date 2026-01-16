
import { Crisis, UserProfile } from './types';

const STORAGE_KEY = 'alivio_crises_v1';
const PROFILE_KEY = 'alivio_profile_v1';

export const storeService = {
  getCrises: (): Crisis[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCrisis;
  },

  updateCrisis: (id: string, updates: Partial<Crisis>) => {
    const crises = storeService.getCrises();
    const updated = crises.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteCrisis: (id: string) => {
    const crises = storeService.getCrises();
    const updated = crises.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },

  getStats: () => {
    const crises = storeService.getCrises();
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const thirtyDaysAgoTime = thirtyDaysAgo.getTime();

    let recentCount = 0;
    let recentIntensitySum = 0;
    let latestDate: number | null = null;

    for (const c of crises) {
      const cTime = Date.parse(c.date);
      if (isNaN(cTime)) continue;

      if (cTime >= thirtyDaysAgoTime) {
        recentCount++;
        recentIntensitySum += c.intensity;
      }

      if (latestDate === null || cTime > latestDate) {
        latestDate = cTime;
      }
    }

    const avgIntensity = recentCount > 0
      ? (recentIntensitySum / recentCount).toFixed(1)
      : "0";

    let daysFree = 0;
    if (latestDate !== null) {
      daysFree = Math.floor((now.getTime() - latestDate) / (1000 * 3600 * 24));
    }

    return {
      totalRecent: recentCount,
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

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.crises));
      if (data.profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
      }
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      return false;
    }
  }
};
