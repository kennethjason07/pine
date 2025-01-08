import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface DayDetails {
  date: Date;
  symptoms: string[];
  medication: boolean;
  mood: 'happy' | 'neutral' | 'sad';
}

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

const STORAGE_KEY = '@period_dates';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const CustomCheckbox = ({ value, onValueChange }: CheckboxProps) => (
  <TouchableOpacity 
    onPress={() => onValueChange(!value)}
    style={[styles.checkbox, value && styles.checkboxChecked]}
  >
    {value && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
  </TouchableOpacity>
);

type RootStackParamList = {
  DayDetails: { date: string };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function TrackPeriodsScreen({ navigation }: Props) {
  const [periodDates, setPeriodDates] = useState<Date[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<DayDetails | null>(null);
  const [dayDetails, setDayDetails] = useState<{ [key: string]: DayDetails }>({});

  useEffect(() => {
    loadPeriodDates();
    loadDayDetails();
  }, []);

  const loadPeriodDates = async () => {
    try {
      const savedDates = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedDates) {
        const dates = JSON.parse(savedDates).map((date: string) => new Date(date));
        setPeriodDates(dates.sort((a: Date, b: Date) => b.getTime() - a.getTime()));
      }
    } catch (error) {
      console.error('Error loading period dates:', error);
    }
  };

  const savePeriodDates = async (dates: Date[]) => {
    try {
      const datesString = JSON.stringify(dates.map(date => date.toISOString()));
      await AsyncStorage.setItem(STORAGE_KEY, datesString);
    } catch (error) {
      console.error('Error saving period dates:', error);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'android') {
        if (editingIndex !== null) {
          updateDate(date, editingIndex);
        } else {
          addNewDate(date);
        }
      }
    }
  };

  const addNewDate = async (date: Date) => {
    const newDates = [...periodDates, date].sort((a, b) => b.getTime() - a.getTime());
    setPeriodDates(newDates);
    await savePeriodDates(newDates);
    setShowIOSPicker(false);
  };

  const updateDate = async (date: Date, index: number) => {
    const newDates = [...periodDates];
    newDates[index] = date;
    const sortedDates = newDates.sort((a, b) => b.getTime() - a.getTime());
    setPeriodDates(sortedDates);
    await savePeriodDates(sortedDates);
    setEditingIndex(null);
    setShowIOSPicker(false);
  };

  const handleDatePress = (date: Date, index: number) => {
    setSelectedDate(date);
    setEditingIndex(index);
    
    if (Platform.OS === 'ios') {
      setShowIOSPicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDeleteDate = (index: number) => {
    Alert.alert(
      "Delete Date",
      "Are you sure you want to delete this date?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const newDates = periodDates.filter((_, i) => i !== index);
            setPeriodDates(newDates);
            await savePeriodDates(newDates);
          }
        }
      ]
    );
  };

  const loadDayDetails = async () => {
    try {
      const savedDetails = await AsyncStorage.getItem('day_details');
      if (savedDetails) {
        const parsed = JSON.parse(savedDetails);
        // Convert date strings back to Date objects
        const converted = Object.entries(parsed).reduce((acc: { [key: string]: DayDetails }, [key, value]: [string, any]) => {
          acc[key] = { ...value as DayDetails, date: new Date(value.date) };
          return acc;
        }, {});
        setDayDetails(converted);
      }
    } catch (error) {
      console.error('Error loading day details:', error);
    }
  };

  const saveDayDetails = async (details: { [key: string]: DayDetails }) => {
    try {
      await AsyncStorage.setItem('day_details', JSON.stringify(details));
    } catch (error) {
      console.error('Error saving day details:', error);
    }
  };

  const handleDayPress = (date: Date) => {
    const dateString = date.toISOString();
    const details = dayDetails[dateString] || {
      date,
      symptoms: [],
      medication: false,
      mood: 'neutral',
    };
    setSelectedDayDetails(details);
    setShowDetailsModal(true);
  };

  const handleSymptomToggle = (symptom: string) => {
    if (!selectedDayDetails) return;

    const symptoms = selectedDayDetails.symptoms.includes(symptom)
      ? selectedDayDetails.symptoms.filter(s => s !== symptom)
      : [...selectedDayDetails.symptoms, symptom];

    setSelectedDayDetails({ ...selectedDayDetails, symptoms });
  };

  const handleSaveDetails = async () => {
    if (!selectedDayDetails) return;

    const dateString = selectedDayDetails.date.toISOString();
    const newDetails = {
      ...dayDetails,
      [dateString]: selectedDayDetails,
    };

    setDayDetails(newDetails);
    await saveDayDetails(newDetails);
    setShowDetailsModal(false);
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
        <Text style={styles.title}>Period History</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            if (Platform.OS === 'ios') {
              setShowIOSPicker(true);
            } else {
              setShowDatePicker(true);
            }
          }}
        >
          <Ionicons name="add" size={24} color="#264653" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.historyContainer}>
          {periodDates.length > 0 ? (
            periodDates.map((date, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.historyItem}
                onPress={() => navigation.navigate('DayDetails', { date: date.toISOString() })}
              >
                <View style={styles.cardContent}>
                  <View style={styles.dateSection}>
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar" size={24} color="#E76F51" />
                      <Text style={styles.dateText}>
                        {format(date, 'MMMM d, yyyy')}
                      </Text>
                    </View>
                    <View style={styles.cycleContainer}>
                      <Ionicons name="sync" size={16} color="#666" />
                      <Text style={styles.cycleText}>
                        Cycle {periodDates.length - index}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDeleteDate(index)}
                    style={styles.deleteButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E76F51" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>
                No period dates added yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the + button to add your period dates
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker for Android */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Modal Date Picker for iOS */}
      <Modal
        visible={showIOSPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  setShowIOSPicker(false);
                  setEditingIndex(null);
                }}
              >
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  if (editingIndex !== null) {
                    updateDate(selectedDate, editingIndex);
                  } else {
                    addNewDate(selectedDate);
                  }
                }}
              >
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={styles.iosDatePicker}
            />
          </View>
        </View>
      </Modal>

      {/* Day Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsHeader}>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.detailsTitle}>
                {selectedDayDetails && format(selectedDayDetails.date, 'MMMM d, yyyy')}
              </Text>
              <TouchableOpacity 
                onPress={handleSaveDetails}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContent}>
              {/* Symptoms Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Symptoms</Text>
                <View style={styles.symptomsGrid}>
                  {SYMPTOMS.map((symptom) => (
                    <TouchableOpacity
                      key={symptom}
                      style={[
                        styles.symptomButton,
                        selectedDayDetails?.symptoms.includes(symptom) && styles.symptomButtonActive
                      ]}
                      onPress={() => handleSymptomToggle(symptom)}
                    >
                      <Text style={[
                        styles.symptomText,
                        selectedDayDetails?.symptoms.includes(symptom) && styles.symptomTextActive
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
                    value={selectedDayDetails?.medication ?? false}
                    onValueChange={(value) => 
                      setSelectedDayDetails(prev => prev ? { ...prev, medication: value } : null)
                    }
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
                        selectedDayDetails?.mood === mood.value && styles.moodButtonActive
                      ]}
                      onPress={() => 
                        setSelectedDayDetails(prev => prev ? { ...prev, mood: mood.value as 'happy' | 'neutral' | 'sad' } : null)
                      }
                    >
                      <Text style={styles.moodEmoji}>{mood.icon}</Text>
                      <Text style={[
                        styles.moodText,
                        selectedDayDetails?.mood === mood.value && styles.moodTextActive
                      ]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
    marginLeft: 8,
  },
  addButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  historyContainer: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dateSection: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginLeft: 12,
  },
  cycleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 36,
  },
  cycleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FFF8F6',
    borderRadius: 8,
    marginLeft: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalCancel: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalDone: {
    color: '#2A9D8F',
    fontSize: 16,
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 216,
    backgroundColor: '#FFFFFF',
  },
  detailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  closeButton: {
    padding: 8,
  },
  detailsTitle: {
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
  detailsContent: {
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
}); 