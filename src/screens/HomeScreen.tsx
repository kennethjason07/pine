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
import { useTheme } from '../context/ThemeContext';

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

  const { isDarkMode, toggleTheme } = useTheme();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [nextMedication, setNextMedication] = useState<Medication | null>(null);
  const [stats, setStats] = useState(getCycleStats());
  const [adherence, setAdherence] = useState(getMedicationAdherence());
  const [nextPeriodInfo, setNextPeriodInfo] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      await refreshData();
    };
    fetchData();
  }, [refreshStats, cycleSettings]);

  const refreshData = async () => {
    await loadMedications();
    await updateStats();
    calculateNextPeriod();
  };

  const loadMedications = async () => {
    try {
      const savedMeds = await AsyncStorage.getItem('medications');
      if (savedMeds) {
        const meds: Medication[] = JSON.parse(savedMeds);
        setMedications(meds);
        
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

  const updateStats = async () => {
    try {
      if (refreshStats) {
        await refreshStats();
      }
      setStats(getCycleStats());
      const newAdherence = await getMedicationAdherence();
      setAdherence(newAdherence);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const calculateNextPeriod = () => {
    if (!cycleSettings || !cycleSettings.lastPeriodDate || !cycleSettings.cycleDays) return;
    if (!cycleSettings.lastPeriodDate || !cycleSettings.cycleDays) return;

    const { lastPeriodDate, cycleDays } = cycleSettings;
    
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    
    let nextPeriod = new Date(lastPeriod);
    while (nextPeriod <= today) {
      nextPeriod.setDate(nextPeriod.getDate() + cycleDays);
    }
    
    const nextPeriodFormatted = format(nextPeriod, 'MMMM d, yyyy');
    setNextPeriodInfo(`Expected on ${nextPeriodFormatted}`);
  };

  const getCurrentCycleDay = () => {
    if (!currentCycle?.startDate) {
      console.log('No start date available');
      return 1;
    }
    
    const start = new Date(currentCycle.startDate);
    const today = new Date();
    
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays || 1;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF',  // Main Background
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#000000',  // Title Text
    },
    themeToggle: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    card: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      backgroundColor: isDarkMode ? '#2F2F3F' : '#FFFFFF',
      borderColor: isDarkMode ? '#4F4F5F' : '#DADADA',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: isDarkMode ? '#FFFFFF' : '#000000',  // Title Text
    },
    statsContainer: {
      gap: 16,
    },
    statItem: {
      gap: 8,
    },
    statLabel: {
      fontSize: 14,
      color: isDarkMode ? '#FFFFFF' : '#000000',  // Title Text
    },
    statValue: {
      fontSize: 16,
      fontWeight: '500',
      color: isDarkMode ? '#4CAF50' : '#007BFF',  // Button background
    },
    emptyText: {
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 16,
      color: isDarkMode ? '#FFFFFF' : '#000000',  // Title Text
    },
    toggleButton: {
      backgroundColor: isDarkMode ? '#4CAF50' : '#007BFF',  // Button background
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      margin: 10,
    },
    toggleButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>HarmoniCare</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons 
            name={isDarkMode ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={isDarkMode ? "#FFD700" : "#264653"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <CycleProgress 
          currentDay={getCurrentCycleDay()}
          totalDays={stats.averageLength || 28} // Default value for totalDays
          phase={currentCycle?.phase || 'Unknown'}
        />

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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Next Period</Text>
              <Text style={styles.statValue}>{nextPeriodInfo || 'Not available'}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Medication Adherence</Text>
              <Text style={styles.statValue}>{adherence !== undefined && adherence !== null ? `${adherence}%` : 'N/A'} this week</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
