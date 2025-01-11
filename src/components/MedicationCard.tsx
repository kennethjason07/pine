import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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

interface MedicationCardProps {
  medication: Medication;
  onUpdate: () => void;
  onPress?: () => void;
}

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

export default function MedicationCard({ medication, onUpdate, onPress }: MedicationCardProps) {
  const calculateNextReminder = (med: Medication): Date => {
    const [hours, minutes] = med.reminderTime.split(':').map(Number);
    let nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);

    switch (med.frequency.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'every_n_days':
        nextDate.setDate(nextDate.getDate() + (med.frequency.interval || 1));
        break;
      case 'weekly':
        if (med.frequency.daysOfWeek?.length) {
          const today = nextDate.getDay();
          const nextDays = med.frequency.daysOfWeek
            .sort((a, b) => a - b)
            .find(day => day > today);
          
          if (nextDays !== undefined) {
            nextDate.setDate(nextDate.getDate() + (nextDays - today));
          } else {
            nextDate.setDate(nextDate.getDate() + (7 - today + med.frequency.daysOfWeek[0]));
          }
        }
        break;
      case 'monthly':
        if (med.frequency.dayOfMonth) {
          nextDate.setDate(med.frequency.dayOfMonth);
          if (nextDate <= new Date()) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
        }
        break;
    }

    return nextDate;
  };

  const isTakenToday = () => {
    if (!medication.lastTaken) return false;
    const lastTaken = new Date(medication.lastTaken);
    const now = new Date();
    return (
      lastTaken.getDate() === now.getDate() &&
      lastTaken.getMonth() === now.getMonth() &&
      lastTaken.getFullYear() === now.getFullYear()
    );
  };

  const handleMarkAsTaken = async () => {
    try {
      console.log('Marking medication as taken:', medication.name);
      
      // Get current medications
      const savedMeds = await AsyncStorage.getItem('medications');
      if (!savedMeds) {
        console.log('No medications found in storage');
        return;
      }

      const medications: Medication[] = JSON.parse(savedMeds);
      console.log('Current medications:', medications.length);
      
      // Update the medication
      const updatedMeds = medications.map(med => {
        if (med.id === medication.id) {
          const now = new Date();
          const nextReminder = calculateNextReminder(med);
          
          console.log('Updating medication:', med.name);
          console.log('Next reminder set to:', nextReminder);
          
          return {
            ...med,
            lastTaken: now.toISOString(),
            nextReminder: nextReminder.toISOString(),
          };
        }
        return med;
      });

      console.log('Saving updated medications');
      // Save updated medications
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMeds));
      
      // Show success message
      Alert.alert(
        'Success',
        'Medication marked as taken!',
        [{ text: 'OK', onPress: () => {
          console.log('Triggering update');
          onUpdate();
        }}]
      );
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      Alert.alert('Error', 'Failed to mark medication as taken. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.medicationCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.medicationHeader}>
        <View style={styles.medicationInfo}>
          <Ionicons name="medical" size={24} color="#2A9D8F" />
          <View style={styles.medicationDetails}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.medicationDosage}>
              Dose: {medication.dosage}
            </Text>
            <Text style={styles.frequencyText}>
              {getFrequencyText(medication.frequency)}
            </Text>
            <Text style={styles.reminderText}>
              Reminder: {format(new Date(`2000-01-01T${medication.reminderTime}`), 'h:mm a')}
            </Text>
            {medication.lastTaken && (
              <Text style={styles.lastTakenText}>
                Last taken: {format(new Date(medication.lastTaken), 'MMM d, h:mm a')}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.takeButton, isTakenToday() && styles.takenButton]}
          onPress={handleMarkAsTaken}
          disabled={isTakenToday()}
        >
          <Text style={styles.takeButtonText}>
            {isTakenToday() ? 'Taken' : 'Take'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  medicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  medicationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 16,
    color: '#2A9D8F',
    marginBottom: 4,
  },
  frequencyText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  reminderText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  lastTakenText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  takeButton: {
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  takenButton: {
    backgroundColor: '#90C8C2',
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
