import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { format, addDays, subMonths } from 'date-fns';

interface PhaseData {
  start_date: string;
  end_date: string;
}

interface PhasePrediction {
  early_luteal: PhaseData;
  follicular: PhaseData;
  late_luteal: PhaseData;
  luteal: PhaseData;
  ovulation: PhaseData;
  period: PhaseData;
}

interface PredictionResponse {
  prediction: PhasePrediction;
  warnings: string[];
}

const BASE_URL = "https://womens-health-menstrual-cycle-phase-predictions-insights.p.rapidapi.com";
const API_KEY = "0ed55b5365msh30e7b2d8d6c1f93p1816b2jsn5dce893c3552";

const PHASE_DESCRIPTIONS = {
  period: "Menstruation Phase",
  follicular: "Follicular Phase",
  ovulation: "Ovulation Phase",
  early_luteal: "Early Luteal Phase",
  luteal: "Luteal Phase",
  late_luteal: "Late Luteal Phase"
};

const PredictPeriodsScreen = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { cycleSettings } = useApp();
  const [prediction, setPrediction] = useState<PhasePrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generatePastCycleData = () => {
    if (!cycleSettings?.lastPeriodDate) return [];
    
    const lastPeriodDate = new Date(cycleSettings.lastPeriodDate);
    const pastData = [];
    let currentDate = lastPeriodDate;
    
    // Generate 5 past cycle entries
    for (let i = 0; i < 5; i++) {
      pastData.unshift({
        cycle_start_date: format(currentDate, 'yyyy-MM-dd'),
        period_length: cycleSettings.menstrualDays || 5
      });
      currentDate = subMonths(currentDate, 1); // Approximate monthly cycles for past data
    }
    
    return pastData;
  };

  const fetchPredictions = async () => {
    if (!cycleSettings?.lastPeriodDate) {
      setError('Please set your last period date in cycle settings');
      setLoading(false);
      return;
    }

    const headers = {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': 'womens-health-menstrual-cycle-phase-predictions-insights.p.rapidapi.com',
      'Content-Type': 'application/json'
    };

    try {
      // Step 1: Process cycle data
      const pastDataPayload = {
        current_date: format(new Date(), 'yyyy-MM-dd'),
        past_cycle_data: generatePastCycleData(),
        max_cycle_predictions: 6
      };

      console.log('Past Data Payload:', pastDataPayload);

      const processResponse = await fetch(`${BASE_URL}/process_cycle_data`, {
        method: 'POST',
        headers,
        body: JSON.stringify(pastDataPayload)
      });
      
      const processResult = await processResponse.json();
      console.log('Process Result:', processResult);
      const requestId = processResult.request_id;

      if (!requestId) {
        throw new Error('Failed to process cycle data');
      }

      // Step 2: Get predicted starts and average period length
      const predicatedStartsResponse = await fetch(
        `${BASE_URL}/get_data/${requestId}/predicted_cycle_starts`,
        { headers }
      );
      const predictedStarts = (await predicatedStartsResponse.json()).predicted_cycle_starts;
      console.log('Predicted Starts:', predictedStarts);

      const avgPeriodLengthResponse = await fetch(
        `${BASE_URL}/get_data/${requestId}/average_period_length`,
        { headers }
      );
      const avgPeriodLengthData = await avgPeriodLengthResponse.json();
      console.log('Average Period Length Data:', avgPeriodLengthData);
      const avgPeriodLength = Math.round(
        parseFloat(avgPeriodLengthData.average_period_length)
      );

      // Step 3: Predict cycle phases
      const phasePayload = {
        cycle_start_date: predictedStarts[0],
        next_cycle_start_date: predictedStarts[1],
        period_length: avgPeriodLength
      };

      console.log('Phase Payload:', phasePayload);

      const phaseResponse = await fetch(`${BASE_URL}/predict_cycle_phases`, {
        method: 'POST',
        headers,
        body: JSON.stringify(phasePayload)
      });

      const phaseResult: PredictionResponse = await phaseResponse.json();
      console.log('Phase Result:', phaseResult);
      
      if (!phaseResult.prediction) {
        throw new Error('No phase predictions received');
      }

      setPrediction(phaseResult.prediction);
      setError(null);

    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch predictions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [cycleSettings]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.text, { color: theme.text }]}>Analyzing your cycle data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {prediction && Object.entries(prediction)
        .sort(([ , phaseA], [ , phaseB]) => new Date(phaseA.start_date).getTime() - new Date(phaseB.start_date).getTime())
        .map(([phaseKey, phaseData]) => (
        <View key={phaseKey} style={[styles.phaseCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.phaseTitle, { color: theme.text }]}>
            {PHASE_DESCRIPTIONS[phaseKey] || phaseKey}
          </Text>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {`${format(new Date(phaseData.start_date), 'dd-MM-yyyy')} - ${format(new Date(phaseData.end_date), 'dd-MM-yyyy')}`}
          </Text>
        </View>
      ))}
      
      <Text style={[styles.disclaimer, { color: theme.text }]}>
        These predictions are based on your cycle data and may vary. Consult a healthcare provider for medical advice.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 48,
    marginTop: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E63946',
  },
  phaseCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});

export default PredictPeriodsScreen;
