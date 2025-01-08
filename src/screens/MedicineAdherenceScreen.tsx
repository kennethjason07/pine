import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  MedicineAdherence: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function MedicineAdherenceScreen({ navigation }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherenceStats, setAdherenceStats] = useState({
    overall: 0,
    byMedication: [] as { name: string; adherence: number; totalDays: number; takenDays: number }[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const savedMeds = await AsyncStorage.getItem('medications');
      if (savedMeds) {
        const meds = JSON.parse(savedMeds);
        setMedications(meds);
        calculateAdherence(meds);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAdherence = (meds: Medication[]) => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    let totalAdherence = 0;
    const medicationStats = [];

    for (const med of meds) {
      let requiredDays = 0;
      let takenDays = 0;

      // Calculate required days based on frequency
      switch (med.frequency.type) {
        case 'daily':
          requiredDays = 30; // Assuming 30 days month
          break;
        case 'every_n_days':
          requiredDays = Math.floor(30 / (med.frequency.interval || 1));
          break;
        case 'weekly':
          if (med.frequency.daysOfWeek?.length) {
            requiredDays = Math.floor(30 / 7) * med.frequency.daysOfWeek.length;
          }
          break;
        case 'monthly':
          requiredDays = 1;
          break;
      }

      // Count taken days
      if (med.lastTaken) {
        const lastTakenDate = new Date(med.lastTaken);
        if (isWithinInterval(lastTakenDate, { start: monthStart, end: monthEnd })) {
          takenDays++;
        }
      }

      const adherence = requiredDays > 0 ? (takenDays / requiredDays) * 100 : 0;
      medicationStats.push({
        name: med.name,
        adherence,
        totalDays: requiredDays,
        takenDays
      });

      totalAdherence += adherence;
    }

    const overallAdherence = meds.length > 0 ? totalAdherence / meds.length : 0;

    setAdherenceStats({
      overall: overallAdherence,
      byMedication: medicationStats,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.title}>Medicine Adherence</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Overall Adherence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Adherence</Text>
          <View style={styles.adherenceCircle}>
            <Text style={styles.adherencePercentage}>
              {Math.round(adherenceStats.overall)}%
            </Text>
          </View>
        </View>

        {/* Individual Medication Adherence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Medication</Text>
          {adherenceStats.byMedication.map((stat, index) => (
            <View key={index} style={styles.medicationStat}>
              <Text style={styles.medicationName}>{stat.name}</Text>
              <View style={styles.statDetails}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min(100, stat.adherence)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.adherenceText}>
                  {Math.round(stat.adherence)}% ({stat.takenDays}/{stat.totalDays} days)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    height: 60,
  },
  backButton: {
    padding: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 16,
  },
  adherenceCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  adherencePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  medicationStat: {
    marginBottom: 16,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A9D8F',
    marginBottom: 8,
  },
  statDetails: {
    flexDirection: 'column',
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2A9D8F',
    borderRadius: 4,
  },
  adherenceText: {
    fontSize: 14,
    color: '#666',
  },
}); 