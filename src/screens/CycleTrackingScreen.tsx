import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

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
  loggedPeriod: '#6B5B95',  // Purple for logged period dates
  menstruation: '#FF7F7F',  // Coral for predicted dates
};

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function CycleTrackingScreen({ navigation }: Props) {
  const { cycleSettings } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [nextPeriodInfo, setNextPeriodInfo] = useState<string>('');
  const [periodDates, setPeriodDates] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const initializeData = async () => {
        await loadPeriodDates();
      };
      initializeData();
    }, [])
  );

  useEffect(() => {
    if (cycleSettings && periodDates.length > 0) {
      calculateAndMarkDates();
      calculateNextPeriod();
    }
  }, [cycleSettings, periodDates]); // Depend on both cycleSettings and periodDates

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
    
    // Find the next period date after today
    let nextPeriod = new Date(lastPeriod);
    while (nextPeriod <= today) {
      nextPeriod.setDate(nextPeriod.getDate() + cycleDays);
    }
    
    // Format the next period date
    const nextPeriodFormatted = format(nextPeriod, 'MMMM d, yyyy');
    setNextPeriodInfo(`Next period expected on ${nextPeriodFormatted}`);
  };

  const calculateAndMarkDates = () => {
    if (!cycleSettings) return;

    const marked: MarkedDates = {};

    // Mark logged period dates in purple
    periodDates.forEach((date) => {
      const dateString = format(new Date(date), 'yyyy-MM-dd');
      marked[dateString] = {
        customStyles: {
          container: {
            backgroundColor: PHASE_COLORS.loggedPeriod,
          },
          text: {
            color: '#FFFFFF',
          },
        },
      };
    });

    // Mark predicted dates in coral
    const { lastPeriodDate, cycleDays } = cycleSettings;
    const startDate = new Date(lastPeriodDate);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // Show predictions for next 6 months

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      // Only mark if it's not already marked as a logged date
      if (!marked[dateString]) {
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

      // Move to the next predicted period date
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + cycleDays);
      currentDate = nextDate;
    }

    setMarkedDates(marked);
  };

  const handleDayPress = (day: { dateString: string }) => {
    navigation.navigate('DayDetails', { date: day.dateString });
  };

  const calendarTheme = useMemo(() => ({
    todayTextColor: isDarkMode ? '#FFD700' : '#2A9D8F',
    arrowColor: isDarkMode ? '#FFD700' : '#2A9D8F',
    monthTextColor: isDarkMode ? '#FFD700' : '#264653',
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '600' as const,
    backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
    calendarBackground: isDarkMode ? '#121212' : '#FFFFFF',
    dayTextColor: isDarkMode ? '#E0E0E0' : '#000000',
    textDisabledColor: isDarkMode ? '#5C5C5C' : '#D9E1E8',
    textSectionTitleColor: isDarkMode ? '#FFD700' : '#264653', // Adding this for day names
    selectedDayBackgroundColor: isDarkMode ? '#FFD700' : '#2A9D8F',
    selectedDayTextColor: isDarkMode ? '#121212' : '#FFFFFF',
  }), [isDarkMode]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF',  // Main Background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0',
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#264653',
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
      backgroundColor: isDarkMode ? '#333333' : '#E8F5F3',
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
      color: isDarkMode ? '#FFD700' : '#264653',
      fontSize: 14,
      fontWeight: '500',
    },
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      padding: 16,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#fff',
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
      color: isDarkMode ? '#FFD700' : '#264653',
    },
    menuItem: {
      padding: 16,
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
      borderTopWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#E0E0E0',
    },
    menuItemContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    menuText: {
      fontSize: 16,
      color: isDarkMode ? "#FFD700" : "#333333",
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
    themeToggle: {
      padding: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cycle Tracking</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons 
            name={isDarkMode ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={isDarkMode ? "#FFD700" : "#264653"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.predictionContainer}>
          <View style={styles.predictionBox}>
            <Ionicons name="calendar" size={20} color={isDarkMode ? "#FFD700" : "#2A9D8F"} style={styles.predictionIcon} />
            <Text style={styles.predictionText}>{nextPeriodInfo}</Text>
          </View>
        </View>

        <Calendar
          key={isDarkMode ? 'dark' : 'light'} // Force re-render when theme changes
          current={new Date().toISOString().split('T')[0]}
          markedDates={markedDates}
          markingType={'custom'}
          onDayPress={handleDayPress}
          theme={calendarTheme}
          style={{
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          }}
        />

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS.loggedPeriod }]} />
            <Text style={styles.legendText}>Logged Periods</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS.menstruation }]} />
            <Text style={styles.legendText}>Predicted Periods</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('PredictPeriods')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Predict Periods</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#FFD700" : "#264653"} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TrackPeriods')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Track Periods</Text>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#FFD700" : "#264653"} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}