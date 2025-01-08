import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type PhaseType = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

interface CycleProgressProps {
  currentDay: number;
  totalDays: number;
  phase: PhaseType;
}

const PHASE_COLORS = {
  menstruation: { color: '#E76F51', label: 'Menstruation' },
  follicular: { color: '#E9C46A', label: 'Follicular' },
  ovulation: { color: '#2A9D8F', label: 'Ovulation' },
  luteal: { color: '#F4A261', label: 'Luteal' },
};

export default function CycleProgress({ currentDay, totalDays, phase }: CycleProgressProps) {
  const progress = (currentDay / totalDays) * 100;
  const phaseColor = PHASE_COLORS[phase].color;

  return (
    <View style={styles.card}>
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
        <Text style={styles.cycleText}>Day {currentDay} of {totalDays}</Text>
        <Text style={[styles.phaseText, { color: phaseColor }]}>
          {PHASE_COLORS[phase].label} Phase
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
    </View>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginBottom: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 12,
    color: '#666',
  },
});