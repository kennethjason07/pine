import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface MarkedDates {
  [date: string]: {
    customStyles: {
      container: {
        backgroundColor: string;
      };
      text: {
        color: string;
      };
    };
    marked?: boolean;
    dotColor?: string;
    text?: string;
  };
}

const PHASE_COLORS = {
  pastPeriod: '#6B5B95',  // Deep purple for past periods
  menstruation: '#FF7F7F', // Coral for next period
  fertile: '#2A9D8F',      // (unused)
  ovulation: '#E9C46A',    // (unused)
  luteal: '#F4A261',       // (unused)
};

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function CycleTrackingScreen({ navigation }: Props) {
  const { cycleSettings } = useApp();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [nextPeriodInfo, setNextPeriodInfo] = useState<string>('');
  const [periodDates, setPeriodDates] = useState<string[]>([]);

  useEffect(() => {
    loadPeriodDates();
    if (cycleSettings) {
      calculateAndMarkDates();
      calculateNextPeriod();
    }
  }, [cycleSettings, periodDates]);

  const loadPeriodDates = async () => {
    try {
      const savedDates = await AsyncStorage.getItem(STORAGE_KEYS.PERIOD_DATES);
      if (savedDates) {
        const dates = JSON.parse(savedDates);
        setPeriodDates(dates);
      }
    } catch (error) {
      console.error('Error loading period dates:', error);
    }
  };

  const calculateNextPeriod = () => {
    if (!cycleSettings) return;

    const { lastPeriodDate, cycleDays } = cycleSettings;
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    
    const daysSinceLastPeriod = Math.floor(
      (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cyclesElapsed = Math.floor(daysSinceLastPeriod / cycleDays);
    
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + ((cyclesElapsed + 1) * cycleDays));
    
    const daysUntilPeriod = Math.floor(
      (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilPeriod === 0) {
      setNextPeriodInfo('Your period is expected to start today');
    } else if (daysUntilPeriod === 1) {
      setNextPeriodInfo('Your period is expected to start tomorrow');
    } else if (daysUntilPeriod > 0) {
      setNextPeriodInfo(`Your period is expected to start in ${daysUntilPeriod} days`);
    } else {
      setNextPeriodInfo('Your period is currently late');
    }
  };

  const calculateAndMarkDates = () => {
    if (!cycleSettings) return;

    const marked: MarkedDates = {};
    
    // Mark all previous period dates
    periodDates.forEach((date) => {
      const dateString = format(new Date(date), 'yyyy-MM-dd');
      marked[dateString] = {
        customStyles: {
          container: {
            backgroundColor: PHASE_COLORS.pastPeriod,
          },
          text: {
            color: '#FFFFFF',
          },
        }
      };
    });

    // Mark only next period
    const { lastPeriodDate, menstrualDays, cycleDays } = cycleSettings;
    const lastPeriod = new Date(lastPeriodDate);
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleDays);

    // Mark menstruation days for next period
    for (let i = 0; i < menstrualDays; i++) {
      const date = new Date(nextPeriod);
      date.setDate(date.getDate() + i);
      const dateString = format(date, 'yyyy-MM-dd');
      marked[dateString] = {
        customStyles: {
          container: {
            backgroundColor: PHASE_COLORS.menstruation,
          },
          text: {
            color: '#FFFFFF',
          },
        },
      };
    }

    setMarkedDates(marked);
  };

  const handleDayPress = (day: { dateString: string }) => {
    navigation.navigate('DayDetails', { date: day.dateString });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cycle Tracking</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('CycleSettings')}
        >
          <Ionicons name="settings-outline" size={24} color="#264653" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Prediction Label */}
        <View style={styles.predictionContainer}>
          <View style={styles.predictionBox}>
            <Ionicons name="calendar" size={20} color="#2A9D8F" style={styles.predictionIcon} />
            <Text style={styles.predictionText}>{nextPeriodInfo}</Text>
          </View>
        </View>

        <Calendar
          current={new Date().toISOString().split('T')[0]}
          markedDates={markedDates}
          markingType={'custom'}
          onDayPress={handleDayPress}
          theme={{
            todayTextColor: '#2A9D8F',
            arrowColor: '#2A9D8F',
            monthTextColor: '#264653',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
          }}
        />

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS.pastPeriod }]} />
            <Text style={styles.legendText}>Past Periods</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS.menstruation }]} />
            <Text style={styles.legendText}>Next Period</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('NotificationReminder')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Notification Reminder</Text>
            <Ionicons name="chevron-forward" size={20} color="#264653" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TrackPeriods')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Track Periods</Text>
            <Ionicons name="chevron-forward" size={20} color="#264653" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  predictionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  predictionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    padding: 12,
    borderRadius: 8,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  predictionIcon: {
    marginRight: 8,
  },
  predictionText: {
    color: '#264653',
    fontSize: 14,
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    minWidth: '45%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#264653',
  },
  menuItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333333',
  },
});