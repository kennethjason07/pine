import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { saveDayDetails, getDayDetails, DayData, MoodType } from '../utils/storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  DayDetails: { date: string };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'DayDetails'>;
};

const SYMPTOMS = [
  'Cramps',
  'Bloating',
  'Headache',
  'Fatigue',
  'Breast Tenderness',
  'Mood Swings',
  'Back Pain',
  'Nausea',
];

const MOODS = [
  { label: 'Happy', icon: '😊', value: 'happy' },
  { label: 'Neutral', icon: '😐', value: 'neutral' },
  { label: 'Sad', icon: '😔', value: 'sad' },
];

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function DayDetailsScreen({ route, navigation }: Props) {
  const { date } = route.params;
  const [dayData, setDayData] = useState<DayData>({
    date,
    symptoms: [],
    medication: false,
    mood: 'neutral',
    notes: '',
  });

  useEffect(() => {
    loadDayData();
  }, []);

  const loadDayData = async () => {
    const savedData = await getDayDetails(date);
    if (savedData) {
      setDayData(savedData);
    }
  };

  const handleSave = async () => {
    await saveDayDetails(date, dayData);
    navigation.goBack();
  };

  const toggleSymptom = (symptom: string) => {
    setDayData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const CustomCheckbox = ({ value, onValueChange }: CheckboxProps) => (
    <TouchableOpacity 
      onPress={() => onValueChange(!value)}
      style={[styles.checkbox, value && styles.checkboxChecked]}
    >
      {value && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {format(new Date(date), 'MMMM d, yyyy')}
        </Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Symptoms Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms</Text>
          <View style={styles.symptomsGrid}>
            {SYMPTOMS.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  dayData.symptoms.includes(symptom) && styles.symptomButtonActive
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text style={[
                  styles.symptomText,
                  dayData.symptoms.includes(symptom) && styles.symptomTextActive
                ]}>
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication</Text>
          <View style={styles.medicationRow}>
            <CustomCheckbox
              value={dayData.medication}
              onValueChange={(value) => setDayData(prev => ({ ...prev, medication: value }))}
            />
            <Text style={styles.medicationText}>Medication taken today</Text>
          </View>
        </View>

        {/* Mood Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood</Text>
          <View style={styles.moodContainer}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  dayData.mood === mood.value && styles.moodButtonActive
                ]}
                onPress={() => setDayData(prev => ({ ...prev, mood: mood.value as MoodType }))}
              >
                <Text style={styles.moodEmoji}>{mood.icon}</Text>
                <Text style={[
                  styles.moodText,
                  dayData.mood === mood.value && styles.moodTextActive
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            value={dayData.notes}
            onChangeText={(text) => setDayData(prev => ({ ...prev, notes: text }))}
            placeholder="Add any notes about your day..."
            textAlignVertical="top"
          />
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 12,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  symptomButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  symptomButtonActive: {
    backgroundColor: '#2A9D8F',
    borderColor: '#2A9D8F',
  },
  symptomText: {
    color: '#666',
    fontSize: 14,
  },
  symptomTextActive: {
    color: '#FFFFFF',
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#2A9D8F',
  },
  medicationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#264653',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 80,
  },
  moodButtonActive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#2A9D8F',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 14,
    color: '#666',
  },
  moodTextActive: {
    color: '#264653',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 14,
    color: '#264653',
  },
}); 