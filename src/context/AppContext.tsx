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
  getMedicationAdherence: () => Promise<number>;
  loadCurrentCycle: () => Promise<void>;
  refreshStats: () => Promise<void>;
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

  const getMedicationAdherence = async () => {
    try {
      const medsData = await AsyncStorage.getItem('medications');
      if (!medsData) return 0;

      const medications = JSON.parse(medsData);
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      let totalExpected = 0;
      let totalTaken = 0;

      medications.forEach((med: any) => {
        // Calculate expected doses in the past week based on frequency
        let expectedDoses = 0;
        const startDate = new Date(Math.max(oneWeekAgo.getTime(), new Date(med.createdAt || oneWeekAgo).getTime()));
        
        switch (med.frequency.type) {
          case 'daily':
            expectedDoses = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
            break;
          case 'every_n_days':
            expectedDoses = Math.ceil((now.getTime() - startDate.getTime()) / (med.frequency.interval * 24 * 60 * 60 * 1000));
            break;
          case 'weekly':
            if (med.frequency.daysOfWeek?.length) {
              // Count how many of the selected days occurred in the past week
              for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                if (med.frequency.daysOfWeek.includes(d.getDay())) {
                  expectedDoses++;
                }
              }
            }
            break;
          case 'monthly':
            if (med.frequency.dayOfMonth) {
              // Check if the monthly day occurred in the past week
              for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                if (d.getDate() === med.frequency.dayOfMonth) {
                  expectedDoses++;
                }
              }
            }
            break;
        }

        totalExpected += expectedDoses;

        // Count actual doses taken in the past week
        if (med.lastTaken) {
          const takenDates = Array.isArray(med.lastTaken) ? med.lastTaken : [med.lastTaken];
          const takenInLastWeek = takenDates.filter((date: string) => {
            const takenDate = new Date(date);
            return takenDate >= oneWeekAgo && takenDate <= now;
          });
          totalTaken += takenInLastWeek.length;
        }
      });

      // Calculate adherence percentage
      const adherence = totalExpected === 0 ? 0 : Math.round((totalTaken / totalExpected) * 100);
      return Math.min(adherence, 100); // Cap at 100%
    } catch (error) {
      console.error('Error calculating medication adherence:', error);
      return 0;
    }
  };

  const refreshStats = async () => {
    try {
      // Refresh cycle stats using existing function
      const newStats = getCycleStats();
      setCycleStats(newStats);
      
      // Refresh medication adherence
      const medsData = await AsyncStorage.getItem('medications');
      if (medsData) {
        const medications = JSON.parse(medsData);
        // Use existing function for adherence
        const newAdherence = await getMedicationAdherence();
        // Stats are already updated through the existing functions
      }
      
      // Refresh current cycle if needed
      await loadCurrentCycle();
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
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
    refreshStats,
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