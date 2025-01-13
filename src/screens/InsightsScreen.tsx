import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

// Define the type for navigation props
type RootStackParamList = {
  MedicineAdherence: undefined;
  MoodStatistics: undefined;
  Journal: undefined;
  Flowers: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function InsightsScreen({ navigation }: Props) {
  const { isDarkMode, toggleTheme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF',  
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
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#000000',  
    },
    themeToggle: {
      padding: 8,
      marginRight: 8,
    },
    scrollView: {
      flex: 1,
    },
    insightContainer: {
      padding: 16,
    },
    card: {
      backgroundColor: isDarkMode ? '#1F1F1F' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333333' : '#E9ECEF',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? '#FFD700' : '#264653',
      marginLeft: 12,
    },
    valueText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFD700' : '#264653',
      marginBottom: 8,
    },
    descriptionText: {
      fontSize: 14,
      color: isDarkMode ? '#AAAAAA' : '#666666',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Insights</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
          <Ionicons 
            name={isDarkMode ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={isDarkMode ? "#FFD700" : "#264653"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.insightContainer}>
          {/* Medicine Adherence Card */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('MedicineAdherence')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={24} color={isDarkMode ? "#FFD700" : "#2A9D8F"} />
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
              <Ionicons name="stats-chart" size={24} color={isDarkMode ? "#FFD700" : "#F4A261"} />
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
              <Ionicons name="book" size={24} color={isDarkMode ? "#FFD700" : "#E76F51"} />
              <Text style={styles.cardTitle}>Journal</Text>
            </View>
            <Text style={styles.valueText}>Write & View</Text>
            <Text style={styles.descriptionText}>
              Keep track of your thoughts and feelings
            </Text>
          </TouchableOpacity>

          {/* Flowers Card */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Flowers')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="flower" size={24} color={isDarkMode ? "#FFD700" : "#8BC34A"} />
              <Text style={styles.cardTitle}>Flowers</Text>
            </View>
            <Text style={styles.valueText}>View Flowers</Text>
            <Text style={styles.descriptionText}>
              View your favorite flowers
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
