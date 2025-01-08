import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MedicationCardProps {
  medication: string;
  time: string;
}

export default function MedicationCard({ medication, time }: MedicationCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Next Medication</Text>
        <Text style={styles.medicationText}>{medication}</Text>
        <Text style={styles.timeText}>at {time}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => alert('Marked as taken!')}>
        <Text style={styles.buttonText}>Mark as Taken</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  contentContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 8,
  },
  medicationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A9D8F',
  },
  timeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2A9D8F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
