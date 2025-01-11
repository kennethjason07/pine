import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  MainTabs: undefined;
  CycleSettings: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavigationProp;
}

export default function CycleSettingsScreen({ navigation }: Props) {
  const { cycleSettings, updateCycleSettings } = useApp();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [settings, setSettings] = useState({
    menstrualDays: cycleSettings?.menstrualDays?.toString() || '7',
    cycleDays: cycleSettings?.cycleDays?.toString() || '28',
    lastPeriodDate: cycleSettings?.lastPeriodDate || new Date(),
    notificationsEnabled: cycleSettings?.notificationsEnabled || false,
  });

  useEffect(() => {
    loadMostRecentPeriodDate();
  }, []);

  const loadMostRecentPeriodDate = async () => {
    try {
      const savedDates = await AsyncStorage.getItem('@period_dates');
      if (savedDates) {
        const dates = JSON.parse(savedDates).map((date: string) => new Date(date));
        // Sort dates in descending order and get the most recent one
        const sortedDates = dates.sort((a: Date, b: Date) => b.getTime() - a.getTime());
        if (sortedDates.length > 0) {
          setSettings(prev => ({
            ...prev,
            lastPeriodDate: new Date(sortedDates[0]),
          }));
        }
      }
    } catch (error) {
      console.error('Error loading most recent period date:', error);
    }
  };

  const validateSettings = () => {
    const menstrualDays = parseInt(settings.menstrualDays);
    const cycleDays = parseInt(settings.cycleDays);

    if (isNaN(menstrualDays) || menstrualDays < 1 || menstrualDays > 10) {
      Alert.alert('Invalid Input', 'Menstrual days should be between 1 and 10');
      return false;
    }

    if (isNaN(cycleDays) || cycleDays < 21 || cycleDays > 35) {
      Alert.alert('Invalid Input', 'Cycle days should be between 21 and 35');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      if (!validateSettings()) {
        return;
      }

      const updatedSettings = {
        menstrualDays: parseInt(settings.menstrualDays),
        cycleDays: parseInt(settings.cycleDays),
        lastPeriodDate: settings.lastPeriodDate,
        notificationsEnabled: settings.notificationsEnabled,
      };

      await updateCycleSettings(updatedSettings);
      console.log('Settings saved:', updatedSettings); // Debug log
      navigation.goBack();
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert(
        'Error',
        'Failed to save settings. Please try again.'
      );
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSettings(prev => ({
        ...prev,
        lastPeriodDate: selectedDate,
      }));
    }
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
        <Text style={styles.title}>Cycle Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Menstrual Days */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            How many days does your period usually last?
          </Text>
          <TextInput
            style={styles.input}
            value={settings.menstrualDays}
            onChangeText={(text) => setSettings(prev => ({
              ...prev,
              menstrualDays: text.replace(/[^0-9]/g, ''),
            }))}
            keyboardType="numeric"
            maxLength={2}
            placeholder="7"
          />
          <Text style={styles.helpText}>Default: 7 days</Text>
        </View>

        {/* Cycle Length */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            How many days between your periods?
          </Text>
          <TextInput
            style={styles.input}
            value={settings.cycleDays}
            onChangeText={(text) => setSettings(prev => ({
              ...prev,
              cycleDays: text.replace(/[^0-9]/g, ''),
            }))}
            keyboardType="numeric"
            maxLength={2}
            placeholder="28"
          />
          <Text style={styles.helpText}>Default: 28 days</Text>
        </View>

        {/* Last Period Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            When did your last period start?
          </Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {(typeof settings.lastPeriodDate === 'string' 
                ? new Date(settings.lastPeriodDate) 
                : settings.lastPeriodDate).toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={20} color="#264653" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={typeof settings.lastPeriodDate === 'string' 
            ? new Date(settings.lastPeriodDate) 
            : settings.lastPeriodDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#2A9D8F',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#264653',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#264653',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#264653',
  },
});