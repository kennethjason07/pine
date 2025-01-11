import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MedicineAdherence: undefined;
  MoodStatistics: undefined;
  Journal: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function InsightsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Insights</Text>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.insightContainer}>
          {/* Medicine Adherence Card */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('MedicineAdherence')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={24} color="#2A9D8F" />
              <Text style={styles.cardTitle}>Medicine Adherence</Text>
            </View>
            <Text style={styles.valueText}>View Report</Text>
            <Text style={styles.descriptionText}>
              Track your medication compliance
            </Text>
          </TouchableOpacity>

          {/* Mood Statistics Card */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('MoodStatistics')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color="#F4A261" />
              <Text style={styles.cardTitle}>Mood Statistics</Text>
            </View>
            <Text style={styles.valueText}>View Analysis</Text>
            <Text style={styles.descriptionText}>
              Track your mood patterns over time
            </Text>
          </TouchableOpacity>

          {/* Journal Card */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Journal')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="book" size={24} color="#E76F51" />
              <Text style={styles.cardTitle}>Journal</Text>
            </View>
            <Text style={styles.valueText}>Write & View</Text>
            <Text style={styles.descriptionText}>
              Keep track of your thoughts and feelings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  insightContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#264653',
    marginLeft: 12,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
