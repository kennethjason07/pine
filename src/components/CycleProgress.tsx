import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { differenceInDays, startOfDay } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PhaseType = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_COLORS = {
  menstruation: { color: '#FF7F7F', label: 'Menstruation' },
  follicular: { color: '#E9C46A', label: 'Follicular' },
  ovulation: { color: '#2A9D8F', label: 'Ovulation' },
  luteal: { color: '#F4A261', label: 'Luteal' },
};

interface CycleInfo {
  currentDay: number;
  totalDays: number;
  phase: PhaseType;
}

export default function CycleProgress() {
  const { cycleSettings } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>({
    currentDay: 0,
    totalDays: 28,
    phase: 'menstruation',
  });

  useEffect(() => {
    updateCycleInfo();
  }, [cycleSettings]);

  const updateCycleInfo = () => {
    if (!cycleSettings?.lastPeriodDate) {
      setCycleInfo({
        currentDay: 0,
        totalDays: 28,
        phase: 'menstruation',
      });
      return;
    }

    const { lastPeriodDate, cycleDays = 28, periodLength = 5 } = cycleSettings;
    const today = startOfDay(new Date());
    const lastPeriod = startOfDay(new Date(lastPeriodDate));
    
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
    const currentDay = differenceInDays(today, currentCycleStart) + 1;
    
    // Determine the current phase
    let phase: PhaseType;
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
  };

  const progress = (cycleInfo.currentDay / cycleInfo.totalDays) * 100;
  const phaseColor = PHASE_COLORS[cycleInfo.phase].color;

  const handlePress = () => {
    navigation.navigate('Cycle');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.cardTitle}>Current Cycle</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progress, 
              { width: `${Math.min(progress, 100)}%`, backgroundColor: phaseColor }
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

      {/* Phase Indicators */}
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