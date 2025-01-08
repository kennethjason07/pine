import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickStatsProps {
  currentMood?: 'happy' | 'neutral' | 'sad';
  activeSymptoms?: string[];
}

const getMoodIcon = (mood: 'happy' | 'neutral' | 'sad') => {
  switch (mood) {
    case 'happy':
      return 'happy-outline';
    case 'neutral':
      return 'remove-outline';
    case 'sad':
      return 'sad-outline';
    default:
      return 'happy-outline';
  }
};

export default function QuickStats({ 
  currentMood = 'neutral', 
  activeSymptoms = [] 
}: QuickStatsProps) {
  return (
    <View style={styles.container}>
      {/* Mood Section */}
      <View style={styles.statCard}>
        <Text style={styles.label}>Mood</Text>
        <View style={styles.moodContainer}>
          <Ionicons 
            name={getMoodIcon(currentMood)} 
            size={24} 
            color="#2A9D8F" 
          />
        </View>
      </View>

      {/* Symptoms Section */}
      <View style={styles.statCard}>
        <Text style={styles.label}>Active Symptoms</Text>
        <View style={styles.symptomsContainer}>
          {activeSymptoms.length > 0 ? (
            activeSymptoms.map((symptom, index) => (
              <View key={index} style={styles.symptomBadge}>
                <Text style={styles.symptomText}>{symptom}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSymptomsText}>No active symptoms</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    padding: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 8,
  },
  moodContainer: {
    alignItems: 'center',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  symptomBadge: {
    backgroundColor: '#E9C46A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  symptomText: {
    color: '#264653',
    fontSize: 12,
  },
  noSymptomsText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
