import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CycleTrackingScreen from '../screens/CycleTrackingScreen';
import MedicationTrackingScreen from '../screens/MedicationTrackingScreen';
import MedicineAdherenceScreen from '../screens/MedicineAdherenceScreen';
import FlowersScreen from '../screens/FlowersScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CycleTracking" 
        component={CycleTrackingScreen}
        options={{ title: 'Cycle Tracking' }}
      />
      <Stack.Screen 
        name="MedicationTracking" 
        component={MedicationTrackingScreen}
        options={{ title: 'Medication Tracking' }}
      />
      <Stack.Screen 
        name="MedicineAdherence" 
        component={MedicineAdherenceScreen}
        options={{ title: 'Medicine Adherence' }}
      />
      <Stack.Screen 
        name="Flowers" 
        component={FlowersScreen}
        options={{ title: 'Flowers' }}
      />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline'; // default icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2A9D8F',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ headerShown: false }}
      />
      {/* Add other tab screens here */}
    </Tab.Navigator>
  );
}
