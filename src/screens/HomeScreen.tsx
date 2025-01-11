import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import CycleProgress from '../components/CycleProgress';
import MedicationCard from '../components/MedicationCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: {
    type: 'daily' | 'every_n_days' | 'weekly' | 'monthly';
    interval?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
  reminderTime: string;
  lastTaken?: string;
  nextReminder?: string;
}

type RootStackParamList = {
  Settings: undefined;
  Medications: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function HomeScreen({ navigation }: Props) {
  const { 
    currentCycle, 
    cycleStats,
    getCycleStats,
    getMedicationAdherence,
    refreshStats,
    cycleSettings
  } = useApp();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [nextMedication, setNextMedication] = useState<Medication | null>(null);
  const [stats, setStats] = useState(getCycleStats());
  const [adherence, setAdherence] = useState(getMedicationAdherence());
  const [nextPeriodInfo, setNextPeriodInfo] = useState<string>('');

  // Update data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused - updating data');
      loadMedications();
      updateStats();
      calculateNextPeriod();
      return () => {
        // Optional cleanup
      };
    }, [])
  );

  const updateStats = async () => {
    if (refreshStats) {
      await refreshStats();
    }
    setStats(getCycleStats());
    const newAdherence = await getMedicationAdherence();
    setAdherence(newAdherence);
  };

  const loadMedications = async () => {
    try {
      const savedMeds = await AsyncStorage.getItem('medications');
      if (savedMeds) {
        const meds: Medication[] = JSON.parse(savedMeds);
        setMedications(meds);
        
        // Find the next medication due that hasn't been taken today
        const now = new Date();
        const nextMed = meds
          .filter(med => {
            if (!med.lastTaken) return true;
            const lastTaken = new Date(med.lastTaken);
            return !(
              lastTaken.getDate() === now.getDate() &&
              lastTaken.getMonth() === now.getMonth() &&
              lastTaken.getFullYear() === now.getFullYear()
            );
          })
          .sort((a, b) => {
            const dateA = new Date(a.nextReminder || '');
            const dateB = new Date(b.nextReminder || '');
            return dateA.getTime() - dateB.getTime();
          })[0];
        
        setNextMedication(nextMed || null);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const calculateNextPeriod = () => {
    if (!cycleSettings) return;

    const { lastPeriodDate, cycleDays } = cycleSettings;
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    
    // Find the next period date after today
    let nextPeriod = new Date(lastPeriod);
    while (nextPeriod <= today) {
      nextPeriod.setDate(nextPeriod.getDate() + cycleDays);
    }
    
    // Format the next period date
    const nextPeriodFormatted = format(nextPeriod, 'MMMM d, yyyy');
    setNextPeriodInfo(`Expected on ${nextPeriodFormatted}`);
  };

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
        {nextMedication ? (
          <MedicationCard
            medication={nextMedication}
            onUpdate={loadMedications}
            onPress={() => navigation.navigate('Medications')}
          />
        ) : (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Medications')}
            activeOpacity={0.7}
          >
            <Text style={styles.cardTitle}>Next Medication</Text>
            <Text style={styles.emptyText}>No medications scheduled</Text>
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Next Period</Text>
              <Text style={styles.statValue}>{nextPeriodInfo || 'Not available'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Medication Adherence</Text>
              <Text style={styles.statValue}>{adherence}% this week</Text>
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
