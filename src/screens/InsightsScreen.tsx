import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define the type for navigation props
type RootStackParamList = {
  MedicineAdherence: undefined;
  MoodStatistics: undefined;
  Journal: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function InsightsScreen({ navigation }: Props) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.header, darkMode && styles.headerDark]}>
        <Text style={[styles.headerText, darkMode && styles.headerTextDark]}>Insights</Text>
        <TouchableOpacity onPress={toggleDarkMode} style={[styles.darkModeButton, styles.darkModeButtonMargin]}>
          <Ionicons name={darkMode ? "sunny-outline" : "moon-outline"} size={24} color={darkMode ? "#FFD700" : "#264653"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.insightContainer}>
          {/* Medicine Adherence Card */}
          <TouchableOpacity 
            style={[styles.card, darkMode && styles.cardDark]}
            onPress={() => navigation.navigate('MedicineAdherence')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={24} color={darkMode ? "#FFD700" : "#2A9D8F"} />
              <Text style={[styles.cardTitle, darkMode && styles.cardTitleDark]}>Medicine Adherence</Text>
            </View>
            <Text style={[styles.valueText, darkMode && styles.valueTextDark]}>View Report</Text>
            <Text style={[styles.descriptionText, darkMode && styles.descriptionTextDark]}>
              Track your medication compliance
            </Text>
          </TouchableOpacity>

          {/* Mood Statistics Card */}
          <TouchableOpacity 
            style={[styles.card, darkMode && styles.cardDark]}
            onPress={() => navigation.navigate('MoodStatistics')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="stats-chart" size={24} color={darkMode ? "#FFD700" : "#F4A261"} />
              <Text style={[styles.cardTitle, darkMode && styles.cardTitleDark]}>Mood Statistics</Text>
            </View>
            <Text style={[styles.valueText, darkMode && styles.valueTextDark]}>View Analysis</Text>
            <Text style={[styles.descriptionText, darkMode && styles.descriptionTextDark]}>
              Track your mood patterns over time
            </Text>
          </TouchableOpacity>

          {/* Journal Card */}
          <TouchableOpacity 
            style={[styles.card, darkMode && styles.cardDark]}
            onPress={() => navigation.navigate('Journal')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="book" size={24} color={darkMode ? "#FFD700" : "#E76F51"} />
              <Text style={[styles.cardTitle, darkMode && styles.cardTitleDark]}>Journal</Text>
            </View>
            <Text style={[styles.valueText, darkMode && styles.valueTextDark]}>Write & View</Text>
            <Text style={[styles.descriptionText, darkMode && styles.descriptionTextDark]}>
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
  containerDark: {
    backgroundColor: '#121212',
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
  headerDark: {
    backgroundColor: '#1F1F1F',
    borderBottomColor: '#333333',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
  },
  headerTextDark: {
    color: '#FFD700',
  },
  darkModeButton: {
    padding: 8,
  },
  darkModeButtonMargin: {
    marginRight: 8,
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
  cardDark: {
    backgroundColor: '#1F1F1F',
    borderColor: '#333333',
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
  cardTitleDark: {
    color: '#FFD700',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
    marginBottom: 8,
  },
  valueTextDark: {
    color: '#FFD700',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  descriptionTextDark: {
    color: '#AAAAAA',
  },
});
