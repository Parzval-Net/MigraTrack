
export type EntryType = 'Migraña' | 'Dolor' | 'Medicina' | 'Periodo' | 'Descanso';
export type FunctionalImpact = 'Nada' | 'Limitado' | 'Postración';

export interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
  time: string;
  relief: 'Ninguno' | 'Moderado' | 'Total';
}

export interface UserProfile {
  name: string;
  age?: number;
  migraineType: string;
  joinedDate: string;
  avatar?: string; // URL o Base64 del avatar
}

export interface Crisis {
  id: string;
  date: string;
  type: EntryType;
  startTime: string;
  endTime?: string;
  duration?: string;
  intensity: number;
  localization: string[];
  painQuality: string[];
  symptoms: string[];
  medications: MedicationEntry[];
  functionalImpact: FunctionalImpact;
  notes: string;
  isPeriod?: boolean;
  medicationName?: string;
  medicationAmount?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface TriggerFactor {
  id: string;
  label: string;
  icon: string;
  level: 'Alta' | 'Moderada' | 'Baja';
  correlation: number;
}
