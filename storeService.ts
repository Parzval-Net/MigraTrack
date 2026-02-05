
import { Crisis, UserProfile } from './types';

const STORAGE_KEY = 'alivio_crises_v1';
const PROFILE_KEY = 'alivio_profile_v1';

// Internal cache
let cachedCrises: Crisis[] | null = null;

// Helper: Sort crises by date descending (Newest first)
// optimizations: String comparison avoids Date object creation overhead
const sortCrises = (crises: Crisis[]) => {
  return crises.sort((a, b) => {
    if (b.date > a.date) return 1;
    if (b.date < a.date) return -1;
    return 0;
  });
};

export const storeService = {
  getCrises: (): Crisis[] => {
    if (cachedCrises) return cachedCrises;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      // Ensure sorted on load
      cachedCrises = sortCrises(parsed);
      return cachedCrises!;
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
    // Append and sort
    const updated = [...crises, newCrisis];
    sortCrises(updated);

    cachedCrises = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newCrisis;
  },

  updateCrisis: (id: string, updates: Partial<Crisis>) => {
    const crises = storeService.getCrises();
    const updated = crises.map(c => c.id === id ? { ...c, ...updates } : c);

    // Sort again as date might have changed
    sortCrises(updated);

    cachedCrises = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteCrisis: (id: string) => {
    const crises = storeService.getCrises();
    const updated = crises.filter(c => c.id !== id);
    cachedCrises = updated;
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
    cachedCrises = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },

  getStats: () => {
    const crises = storeService.getCrises(); // Guaranteed sorted descending
    const now = new Date();

    // Calculate 30 days ago date string (YYYY-MM-DD)
    const thirtyDaysAgoDate = new Date();
    thirtyDaysAgoDate.setDate(now.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgoDate.toISOString().split('T')[0];

    let totalRecent = 0;
    let totalIntensity = 0;

    // Single pass optimization:
    // Since list is sorted descending, we can iterate and stop once we pass the cutoff date.
    for (const c of crises) {
      if (c.date >= thirtyDaysAgoStr) {
        totalRecent++;
        totalIntensity += c.intensity;
      } else {
        // Optimization: Stop processing once we reach dates older than 30 days
        break;
      }
    }

    const avgIntensity = totalRecent > 0
      ? (totalIntensity / totalRecent).toFixed(1)
      : "0";

    let daysFree = 0;
    if (crises.length > 0) {
      // Most recent is at index 0 because of sorted order
      const lastDate = new Date(crises[0].date);
      daysFree = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    }

    return {
      totalRecent,
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

      // Sort imported data
      const sortedCrises = sortCrises(data.crises);
      cachedCrises = sortedCrises;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedCrises));
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
