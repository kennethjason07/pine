import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { differenceInDays, startOfDay } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

export type PhaseType = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

interface CycleSettings {
  lastPeriodDate: string;
  cycleDays: number;
  periodLength: number;
}

const PHASE_COLORS = {
  menstruation: { color: '#FF7F7F', label: 'Menstruation' },
  follicular: { color: '#E9C46A', label: 'Follicular' },
  ovulation: { color: '#2A9D8F', label: 'Ovulation' },
  luteal: { color: '#F4A261', label: 'Luteal' },
} as const;

interface CycleInfo {
  currentDay: number;
  totalDays: number;
  phase: PhaseType;
}

const DEFAULT_CYCLE_INFO: CycleInfo = {
  currentDay: 0,
  totalDays: 28,
  phase: 'menstruation',
};

export default function CycleProgress() {
  const { cycleSettings } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [cycleInfo, setCycleInfo] = React.useState<CycleInfo>(DEFAULT_CYCLE_INFO);

  const updateCycleInfo = React.useCallback(() => {
    if (!cycleSettings?.lastPeriodDate) {
      setCycleInfo(DEFAULT_CYCLE_INFO);
      return;
    }

    const { lastPeriodDate, cycleDays = 28, menstrualDays = 5 } = cycleSettings;
    const today = startOfDay(new Date());
    const lastPeriod = startOfDay(new Date(lastPeriodDate));

    // Validate dates
    if (isNaN(lastPeriod.getTime())) {
      console.error('Invalid lastPeriodDate');
      setCycleInfo(DEFAULT_CYCLE_INFO);
      return;
    }

    // Find the start of the current cycle
    let currentCycleStart = new Date(lastPeriod);
    while (currentCycleStart <= today) {
      const nextCycle = new Date(currentCycleStart);
      nextCycle.setDate(nextCycle.getDate() + cycleDays);
      if (nextCycle > today) {
        break;
      }
      currentCycleStart = nextCycle;
    }

    // Calculate current day in cycle
    const currentDay = Math.max(1, differenceInDays(today, currentCycleStart) + 1);

    // Determine the current phase
    let phase: PhaseType;
    const periodLength = menstrualDays;
    if (currentDay <= periodLength) {
      phase = 'menstruation';
    } else if (currentDay <= Math.floor(cycleDays * 0.4)) {
      phase = 'follicular';
    } else if (currentDay <= Math.floor(cycleDays * 0.5)) {
      phase = 'ovulation';
    } else {
      phase = 'luteal';
    }

    setCycleInfo({
      currentDay,
      totalDays: cycleDays,
      phase,
    });
  }, [cycleSettings]);

  useFocusEffect(
    React.useCallback(() => {
      updateCycleInfo();
    }, [updateCycleInfo])
  );

  const progress = Math.min(100, (cycleInfo.currentDay / cycleInfo.totalDays) * 100);
  const phaseColor = PHASE_COLORS[cycleInfo.phase].color;

  const handlePress = React.useCallback(() => {
    navigation.navigate('Cycle');
  }, [navigation]);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.cardTitle}>Current Cycle</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progress, 
              { width: `${progress}%`, backgroundColor: phaseColor }
            ]} 
          />
        </View>
        <Text style={styles.cycleText}>
          Day {cycleInfo.currentDay} of {cycleInfo.totalDays}
        </Text>
        <Text style={[styles.phaseText, { color: phaseColor }]}>
          {PHASE_COLORS[cycleInfo.phase].label} Phase
        </Text>
      </View>

      <View style={styles.indicatorsContainer}>
        {Object.entries(PHASE_COLORS).map(([phaseName, { color, label }]) => (
          <View key={phaseName} style={styles.indicatorRow}>
            <View style={[styles.colorDot, { backgroundColor: color }]} />
            <Text style={styles.indicatorText}>{label}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  cycleText: {
    fontSize: 16,
    color: '#264653',
    marginBottom: 4,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '500',
  },
  indicatorsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 14,
    color: '#264653',
  },
});