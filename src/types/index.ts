export interface Cycle {
  startDate: string;
  endDate?: string;
  symptoms: string[];
  mood?: 'happy' | 'neutral' | 'sad';
  medicationsTaken: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  taken: boolean;
}

export interface CycleStats {
  averageLength: number;
  regularity: string;
  commonSymptoms: string[];
}

export interface MoodDistribution {
  happy: number;
  neutral: number;
  sad: number;
}

export interface CycleSettings {
  menstrualDays: number;
  cycleDays: number;
  lastPeriodDate: Date;
  notificationsEnabled: boolean;
}

export interface AppContextType {
  cycles: Cycle[];
  currentCycle: Cycle | null;
  medications: Medication[];
  isLoading: boolean;
  cycleSettings: CycleSettings | null;
  
  // Methods
  addCycle: (cycle: Cycle) => Promise<void>;
  updateCurrentCycle: (updates: Partial<Cycle>) => Promise<void>;
  addMedication: (medication: Medication) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  getCycleStats: () => CycleStats;
  getMedicationAdherence: () => number;
  getMoodDistribution: () => MoodDistribution;
  updateCycleSettings: (settings: CycleSettings) => Promise<void>;
} 