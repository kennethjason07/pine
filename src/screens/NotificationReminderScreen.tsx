import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MainTabs: undefined;
  NotificationReminder: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavigationProp;
}

interface NotificationSettings {
  enableAll: boolean;
  menstrualReminder: boolean;
  ovulationReminder: boolean;
  ovulationDayReminder: boolean;
  ovulationEndReminder: boolean;
  reminderTime: Date;
}

export default function NotificationReminderScreen({ navigation }: Props) {
  const { updateNotificationSettings, notificationSettings } = useApp();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enableAll: notificationSettings?.enableAll || false,
    menstrualReminder: notificationSettings?.menstrualReminder || false,
    ovulationReminder: notificationSettings?.ovulationReminder || false,
    ovulationDayReminder: notificationSettings?.ovulationDayReminder || false,
    ovulationEndReminder: notificationSettings?.ovulationEndReminder || false,
    reminderTime: notificationSettings?.reminderTime || new Date(),
  });

  const handleToggleAll = (value: boolean) => {
    setSettings(prev => ({
      ...prev,
      enableAll: value,
      menstrualReminder: value,
      ovulationReminder: value,
      ovulationDayReminder: value,
      ovulationEndReminder: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateNotificationSettings(settings);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Only hide picker on Android
    
    if (selectedTime) {
      // Keep the current date but update the time
      const newDateTime = new Date(settings.reminderTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      
      setSettings(prev => ({
        ...prev,
        reminderTime: newDateTime,
      }));
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
        <Text style={styles.title}>Notification Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Enable All */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Enable All</Text>
            <Switch
              value={settings.enableAll}
              onValueChange={handleToggleAll}
              trackColor={{ false: '#E9ECEF', true: '#2A9D8F' }}
              thumbColor={settings.enableAll ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Menstrual Reminder */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View>
              <Text style={styles.settingTitle}>Menstrual Reminder</Text>
              <Text style={styles.settingDescription}>
                Reminder day before predicted period
              </Text>
            </View>
            <Switch
              value={settings.menstrualReminder}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                menstrualReminder: value,
              }))}
              trackColor={{ false: '#E9ECEF', true: '#2A9D8F' }}
              thumbColor={settings.menstrualReminder ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Ovulation Reminder */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View>
              <Text style={styles.settingTitle}>Ovulation Reminder</Text>
              <Text style={styles.settingDescription}>
                Reminder day before ovulation period
              </Text>
            </View>
            <Switch
              value={settings.ovulationReminder}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                ovulationReminder: value,
              }))}
              trackColor={{ false: '#E9ECEF', true: '#2A9D8F' }}
              thumbColor={settings.ovulationReminder ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Ovulation Day Reminder */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View>
              <Text style={styles.settingTitle}>Ovulation Day Reminder</Text>
              <Text style={styles.settingDescription}>
                Reminder when ovulation peak starts
              </Text>
            </View>
            <Switch
              value={settings.ovulationDayReminder}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                ovulationDayReminder: value,
              }))}
              trackColor={{ false: '#E9ECEF', true: '#2A9D8F' }}
              thumbColor={settings.ovulationDayReminder ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Ovulation End Reminder */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <View>
              <Text style={styles.settingTitle}>Ovulation End Reminder</Text>
              <Text style={styles.settingDescription}>
                Reminder when ovulation period ends
              </Text>
            </View>
            <Switch
              value={settings.ovulationEndReminder}
              onValueChange={(value) => setSettings(prev => ({
                ...prev,
                ovulationEndReminder: value,
              }))}
              trackColor={{ false: '#E9ECEF', true: '#2A9D8F' }}
              thumbColor={settings.ovulationEndReminder ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Reminder Time */}
        <View style={styles.settingItem}>
          <TouchableOpacity 
            style={styles.settingContent}
            onPress={() => setShowTimePicker(true)}
          >
            <View>
              <Text style={styles.settingTitle}>Reminder Time</Text>
              <Text style={styles.settingDescription}>
                Notifications will be sent at this time
              </Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {settings.reminderTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </Text>
              <Ionicons name="time-outline" size={20} color="#2A9D8F" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={settings.reminderTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          style={Platform.OS === 'ios' ? styles.iosTimePicker : undefined}
        />
      )}

      {Platform.OS === 'ios' && showTimePicker && (
        <View style={styles.iosTimePickerContainer}>
          <TouchableOpacity 
            style={styles.iosTimePickerButton}
            onPress={() => setShowTimePicker(false)}
          >
            <Text style={styles.iosTimePickerButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
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
  content: {
    flex: 1,
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#264653',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#2A9D8F',
    fontWeight: '500',
  },
  iosTimePickerContainer: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    padding: 8,
  },
  iosTimePicker: {
    backgroundColor: '#fff',
    height: 200,
  },
  iosTimePickerButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  iosTimePickerButtonText: {
    color: '#2A9D8F',
    fontSize: 16,
    fontWeight: '600',
  },
}); 