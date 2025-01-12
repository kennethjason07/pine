import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Import your screens
import HomeScreen from './src/screens/HomeScreen';
import CycleTrackingScreen from './src/screens/CycleTrackingScreen';
import MedicationTrackingScreen from './src/screens/MedicationTrackingScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import CycleSettingsScreen from './src/screens/CycleSettingsScreen';
import TrackPeriodsScreen from './src/screens/TrackPeriodsScreen';
import DayDetailsScreen from './src/screens/DayDetailsScreen';
import MoodStatisticsScreen from './src/screens/MoodStatisticsScreen';
import MedicineAdherenceScreen from './src/screens/MedicineAdherenceScreen';
import JournalScreen from './src/screens/JournalScreen';
import PredictPeriodsScreen from './src/screens/PredictPeriodsScreen';

// Define your navigation types
type RootStackParamList = {
  MainTabs: undefined;
  CycleSettings: undefined;
  PredictPeriods: undefined;
  Journal: undefined;
  MoodStatistics: undefined;
  MedicineAdherence: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2A9D8F',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Cycle" 
        component={CycleTrackingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Medications" 
        component={MedicationTrackingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator 
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen 
                name="MainTabs" 
                component={TabNavigator} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="CycleSettings" 
                component={CycleSettingsScreen}
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen 
                name="PredictPeriods" 
                component={PredictPeriodsScreen}
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen 
                name="MoodStatistics" 
                component={MoodStatisticsScreen}
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen 
                name="MedicineAdherence" 
                component={MedicineAdherenceScreen}
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen 
                name="Journal" 
                component={JournalScreen}
                options={{
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen 
                name="TrackPeriods" 
                component={TrackPeriodsScreen}
                options={{
                  headerShown: false,
                  presentation: 'card',
                }}
              />
              <Stack.Screen 
                name="DayDetails" 
                component={DayDetailsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="MedicationTracking" 
                component={MedicationTrackingScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}