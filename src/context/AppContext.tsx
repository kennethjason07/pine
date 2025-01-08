import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays, differenceInDays, parseISO, isValid } from 'date-fns';
import { STORAGE_KEYS } from '../utils/constants';
import { PhaseType } from '../components/CycleProgress';

interface CycleStats {
  averageLength: number;
  periodLength: number;
  nextPeriodDate: string;
  currentPhase: string;
  daysUntilNextPeriod: number;
  commonSymptoms: string[];
}

interface NotificationSettings {
  enableAll: boolean;
  menstrualReminder: boolean;
  ovulationReminder: boolean;
  ovulationDayReminder: boolean;
  ovulationEndReminder: boolean;
  reminderTime: Date;
}

interface AppContextType {
  currentCycle: {
    startDate: string | null;
    endDate: string | null;
    currentDay: number;
    totalDays: number;
    phase: PhaseType;
  };
  cycleStats: CycleStats;
  getCycleStats: () => CycleStats;
  getMedicationAdherence: () => number;
  loadCurrentCycle: () => Promise<void>;
  cycleSettings: {
    lastPeriodDate: string;
    cycleDays: number;
    menstrualDays: number;
    notificationsEnabled: boolean;
  } | null;
  updateCycleSettings: (settings: {
    lastPeriodDate: Date | string;
    cycleDays: number;
    menstrualDays: number;
    notificationsEnabled: boolean;
  }) => Promise<void>;
  notificationSettings: {
    enableAll: boolean;
    menstrualReminder: boolean;
    ovulationReminder: boolean;
    ovulationDayReminder: boolean;
    ovulationEndReminder: boolean;
    reminderTime: Date;
  } | null;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentCycle, setCurrentCycle] = useState<AppContextType['currentCycle']>({
    startDate: null,
    endDate: null,
    currentDay: 1,
    totalDays: 28,
    phase: 'menstruation'
  });

  const [cycleStats, setCycleStats] = useState<CycleStats>({
    averageLength: 28,
    periodLength: 5,
    nextPeriodDate: '',
    currentPhase: '',
    daysUntilNextPeriod: 0,
    commonSymptoms: []
  });

  const [cycleSettings, setCycleSettings] = useState<AppContextType['cycleSettings']>(null);

  const [notificationSettings, setNotificationSettings] = useState<AppContextType['notificationSettings']>(null);

  const loadCurrentCycle = async () => {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.CYCLE_SETTINGS);
      const settings = settingsData ? JSON.parse(settingsData) : null;

      const periodDatesData = await AsyncStorage.getItem(STORAGE_KEYS.PERIOD_DATES);
      console.log('Period dates data:', periodDatesData);
      
      let dates: string[] = [];
      if (periodDatesData) {
        dates = JSON.parse(periodDatesData)
          .map((date: string) => format(new Date(date), 'yyyy-MM-dd'))
          .sort();
      }
      console.log('Processed dates:', dates);

      if (settings && dates.length > 0) {
        const lastPeriodDate = dates[dates.length - 1];
        console.log('Last period date:', lastPeriodDate);
        
        const startDate = parseISO(lastPeriodDate);
        if (!isValid(startDate)) {
          console.error('Invalid start date:', lastPeriodDate);
          return;
        }

        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const cycleLength = settings.cycleDays || 28;
        const currentDay = ((daysSinceStart % cycleLength) + 1);
        const periodLength = settings.menstrualDays || 5;

        // Calculate phase thresholds
        const thresholds = {
          menstruation: periodLength,
          follicular: Math.floor(cycleLength * 0.375),
          ovulation: Math.floor(cycleLength * 0.5),
          luteal: cycleLength
        };

        // Determine current phase
        let phase: PhaseType = 'menstruation';
        if (currentDay > thresholds.menstruation) {
          phase = 'follicular' as PhaseType;
        }
        if (currentDay > thresholds.follicular) {
          phase = 'ovulation' as PhaseType;
        }
        if (currentDay > thresholds.ovulation) {
          phase = 'luteal' as PhaseType;
        }

        console.log('Phase calculation:', {
          currentDay,
          cycleLength,
          periodLength,
          phase,
          thresholds
        });

        const nextPeriodDate = addDays(startDate, cycleLength);
        const daysUntilNextPeriod = differenceInDays(nextPeriodDate, today);

        setCurrentCycle({
          startDate: lastPeriodDate,
          endDate: null,
          currentDay,
          totalDays: cycleLength,
          phase
        });

        setCycleStats({
          averageLength: cycleLength,
          periodLength,
          nextPeriodDate: format(nextPeriodDate, 'MMM d, yyyy'),
          currentPhase: phase,
          daysUntilNextPeriod,
          commonSymptoms: []
        });

        console.log('Updated cycle data:', {
          currentDay,
          phase,
          cycleLength,
          daysUntilNextPeriod,
          nextPeriodDate: format(nextPeriodDate, 'MMM d, yyyy')
        });

        if (settings) {
          setCycleSettings({
            lastPeriodDate: settings.lastPeriodDate,
            cycleDays: settings.cycleDays,
            menstrualDays: settings.menstrualDays,
            notificationsEnabled: settings.notificationsEnabled
          });
        }
      }
    } catch (error) {
      console.error('Error loading current cycle:', error);
    }
  };

  const getCycleStats = () => {
    return cycleStats;
  };

  const getMedicationAdherence = () => {
    return 85; // Default value for now
  };

  const updateCycleSettings = async (settings: {
    lastPeriodDate: Date | string;
    cycleDays: number;
    menstrualDays: number;
    notificationsEnabled: boolean;
  }) => {
    try {
      const settingsToSave = {
        ...settings,
        lastPeriodDate: settings.lastPeriodDate instanceof Date ? settings.lastPeriodDate.toISOString() : settings.lastPeriodDate
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CYCLE_SETTINGS, JSON.stringify(settingsToSave));
      setCycleSettings(settingsToSave);
      await loadCurrentCycle();
    } catch (error) {
      console.error('Error updating cycle settings:', error);
      throw error;
    }
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    setNotificationSettings(settings);
  };

  useEffect(() => {
    loadCurrentCycle();
  }, []);

  const value = {
    currentCycle,
    cycleStats,
    getCycleStats,
    getMedicationAdherence,
    loadCurrentCycle,
    cycleSettings,
    updateCycleSettings,
    notificationSettings,
    updateNotificationSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 