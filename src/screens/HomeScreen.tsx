import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import CycleProgress from '../components/CycleProgress';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Settings: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function HomeScreen({ navigation }: Props) {
  const { 
    currentCycle, 
    cycleStats,
    getCycleStats,
    getMedicationAdherence 
  } = useApp();

  const stats = getCycleStats();
  const adherence = getMedicationAdherence();

  // Calculate current cycle day
  const getCurrentCycleDay = () => {
    if (!currentCycle?.startDate) {
      console.log('No start date available');
      return 1;
    }
    
    const start = new Date(currentCycle.startDate);
    const today = new Date();
    
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays || 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>HarmoniCare</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#E76F51" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Current Cycle Card */}
        <CycleProgress 
          currentDay={getCurrentCycleDay()}
          totalDays={stats.averageLength}
          phase={currentCycle.phase}
        />

        {/* Medication Reminder Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Medication</Text>
          <Text style={styles.emptyText}>No medications scheduled</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cycle Length</Text>
              <Text style={styles.statValue}>{stats.averageLength} days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Medication Adherence</Text>
              <Text style={styles.statValue}>{adherence}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
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
  medicationContent: {
    gap: 12,
  },
  medicationText: {
    fontSize: 16,
    color: '#264653',
  },
  primaryButton: {
    backgroundColor: '#2A9D8F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  statsContainer: {
    gap: 16,
  },
  statItem: {
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    color: '#264653',
    fontWeight: '500',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

