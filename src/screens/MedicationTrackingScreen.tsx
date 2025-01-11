import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

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

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Every N Days', value: 'every_n_days' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

type RootStackParamList = {
  MedicationTracking: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function MedicationTrackingScreen({ navigation }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newMedication, setNewMedication] = useState<Medication>({
    id: '',
    name: '',
    dosage: '',
    frequency: { type: 'daily' },
    reminderTime: format(new Date(), 'HH:mm'),
  });
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState('1');

  useFocusEffect(
    React.useCallback(() => {
      loadMedications();
    }, [])
  );

  const loadMedications = async () => {
    try {
      const saved = await AsyncStorage.getItem('medications');
      if (saved) {
        setMedications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const saveMedications = async (updatedMeds: Medication[]) => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMeds));
    } catch (error) {
      console.error('Error saving medications:', error);
    }
  };

  const calculateNextReminder = (medication: Medication): string => {
    const lastTaken = medication.lastTaken ? new Date(medication.lastTaken) : new Date();
    const [hours, minutes] = medication.reminderTime.split(':').map(Number);
    let nextDate = new Date(lastTaken);
    nextDate.setHours(hours, minutes, 0, 0);

    switch (medication.frequency.type) {
      case 'daily':
        if (nextDate <= new Date()) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        break;
      
      case 'every_n_days':
        const interval = medication.frequency.interval || 1;
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      
      case 'weekly':
        if (medication.frequency.daysOfWeek?.length) {
          const today = nextDate.getDay();
          const nextDays = medication.frequency.daysOfWeek
            .sort((a, b) => a - b)
            .find(day => day > today);
          
          if (nextDays !== undefined) {
            nextDate.setDate(nextDate.getDate() + (nextDays - today));
          } else {
            nextDate.setDate(nextDate.getDate() + (7 - today + medication.frequency.daysOfWeek[0]));
          }
        }
        break;
      
      case 'monthly':
        if (medication.frequency.dayOfMonth) {
          nextDate.setDate(medication.frequency.dayOfMonth);
          if (nextDate <= new Date()) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
        }
        break;
    }

    return nextDate.toISOString();
  };

  const handleAddMedication = () => {
    const medicationWithId = {
      ...newMedication,
      id: Date.now().toString(),
      frequency: {
        type: newMedication.frequency.type,
        interval: newMedication.frequency.type === 'every_n_days' ? Number(intervalDays) : undefined,
        daysOfWeek: newMedication.frequency.type === 'weekly' ? selectedDays : undefined,
        dayOfMonth: newMedication.frequency.type === 'monthly' ? Number(intervalDays) : undefined,
      },
    };
    
    medicationWithId.nextReminder = calculateNextReminder(medicationWithId);
    
    const updatedMedications = [...medications, medicationWithId];
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMedication({
      id: '',
      name: '',
      dosage: '',
      frequency: { type: 'daily' },
      reminderTime: format(new Date(), 'HH:mm'),
    });
    setSelectedDays([]);
    setIntervalDays('1');
  };

  const renderFrequencyInput = () => {
    switch (newMedication.frequency.type) {
      case 'every_n_days':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Interval (days)</Text>
            <TextInput
              style={styles.input}
              value={intervalDays}
              onChangeText={setIntervalDays}
              keyboardType="numeric"
              placeholder="Enter number of days"
            />
          </View>
        );
      
      case 'weekly':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Days</Text>
            <View style={styles.daysContainer}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(index) && styles.dayButtonSelected
                  ]}
                  onPress={() => {
                    setSelectedDays(prev => 
                      prev.includes(index)
                        ? prev.filter(d => d !== index)
                        : [...prev, index]
                    );
                  }}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDays.includes(index) && styles.dayButtonTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'monthly':
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Day of Month</Text>
            <TextInput
              style={styles.input}
              value={intervalDays}
              onChangeText={(text) => setIntervalDays(text)}
              keyboardType="numeric"
              placeholder="Enter day (1-31)"
              maxLength={2}
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  const handleTakeMedication = (medication: Medication) => {
    const updatedMedications = medications.map(med => {
      if (med.id === medication.id) {
        return {
          ...med,
          lastTaken: new Date().toISOString(),
        };
      }
      return med;
    });
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
  };

  const handleDeleteMedication = (medicationId: string) => {
    const updatedMedications = medications.filter(med => med.id !== medicationId);
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
  };

  const getFrequencyText = (frequency: any) => {
    switch (frequency.type) {
      case 'daily':
        return 'Daily';
      case 'every_n_days':
        return `Every ${frequency.interval} day${frequency.interval > 1 ? 's' : ''}`;
      case 'weekly':
        if (frequency.daysOfWeek?.length) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return `Weekly on ${frequency.daysOfWeek.map((d: number) => days[d]).join(', ')}`;
        }
        return 'Weekly';
      case 'monthly':
        return `Monthly on day ${frequency.dayOfMonth}`;
      default:
        return frequency.type;
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
        <Text style={styles.title}>Medications</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#264653" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {medications.map((medication) => (
          <View key={medication.id} style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <View style={styles.medicationInfo}>
                <Ionicons name="medical" size={24} color="#2A9D8F" />
                <View style={styles.medicationDetails}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>
                    Dose: {medication.dosage}
                  </Text>
                  <View style={styles.frequencyContainer}>
                    <Ionicons name="repeat" size={14} color="#2A9D8F" />
                    <Text style={styles.frequencyText}>
                      {getFrequencyText(medication.frequency)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.takeButton,
                    medication.lastTaken && styles.takeButtonTaken
                  ]}
                  onPress={() => handleTakeMedication(medication)}
                >
                  <Text style={[
                    styles.takeButtonText,
                    medication.lastTaken && styles.takeButtonTextTaken
                  ]}>
                    {medication.lastTaken ? 'Taken' : 'Take'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMedication(medication.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.medicationFooter}>
              <View style={styles.reminderInfo}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.reminderText}>
                  Next reminder at {medication.reminderTime}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>
              No medications added yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the + button to add your medications
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medication</Text>
              <TouchableOpacity 
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Medication Name</Text>
                <TextInput
                  style={styles.input}
                  value={newMedication.name}
                  onChangeText={(text) => setNewMedication(prev => ({ ...prev, name: text }))}
                  placeholder="Enter medication name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  value={newMedication.dosage}
                  onChangeText={(text) => setNewMedication(prev => ({ ...prev, dosage: text }))}
                  placeholder="e.g., 1 pill"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frequency</Text>
                <TouchableOpacity
                  style={styles.frequencyButton}
                  onPress={() => setShowFrequencyModal(true)}
                >
                  <Text style={styles.frequencyButtonText}>
                    {FREQUENCY_OPTIONS.find(opt => opt.value === newMedication.frequency.type)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {renderFrequencyInput()}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reminder Time</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {newMedication.reminderTime}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.addMedicationButton}
                onPress={handleAddMedication}
              >
                <Text style={styles.addMedicationButtonText}>
                  Add Medication
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setNewMedication(prev => ({
                ...prev,
                reminderTime: format(selectedDate, 'HH:mm'),
              }));
            }
          }}
        />
      )}

      <Modal
        visible={showFrequencyModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Frequency</Text>
              <TouchableOpacity 
                onPress={() => setShowFrequencyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.frequencyList}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    newMedication.frequency.type === option.value && styles.frequencyOptionSelected
                  ]}
                  onPress={() => {
                    setNewMedication(prev => ({
                      ...prev,
                      frequency: { type: option.value as any }
                    }));
                    setShowFrequencyModal(false);
                  }}
                >
                  <Text style={[
                    styles.frequencyOptionText,
                    newMedication.frequency.type === option.value && styles.frequencyOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {newMedication.frequency.type === option.value && (
                    <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#FFFFFF',
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
  addButton: {
    padding: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  medicationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A9D8F',
    marginBottom: 6,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  takeButton: {
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  takeButtonTaken: {
    backgroundColor: '#E9ECEF',
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  takeButtonTextTaken: {
    color: '#666',
  },
  medicationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F9F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  frequencyText: {
    fontSize: 13,
    color: '#2A9D8F',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  frequencyButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
  },
  frequencyButtonText: {
    fontSize: 16,
    color: '#264653',
  },
  timePickerButton: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
  },
  timePickerButtonText: {
    fontSize: 16,
    color: '#264653',
  },
  addMedicationButton: {
    backgroundColor: '#2A9D8F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addMedicationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 45,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#2A9D8F',
    borderColor: '#2A9D8F',
  },
  dayButtonText: {
    color: '#666',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  frequencyList: {
    maxHeight: 300,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  frequencyOptionSelected: {
    backgroundColor: '#2A9D8F',
  },
  frequencyOptionText: {
    fontSize: 16,
    color: '#264653',
  },
  frequencyOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E76F51',
  },
  deleteButtonText: {
    color: '#E76F51',
    fontWeight: '600',
    fontSize: 14,
  },
});
