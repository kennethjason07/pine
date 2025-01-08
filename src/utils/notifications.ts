import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  return true;
}

export async function schedulePeriodNotification(predictedDate: Date) {
  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule notification 2 days before
  const notificationDate = new Date(predictedDate);
  notificationDate.setDate(notificationDate.getDate() - 2);

  // Only schedule if the date is in the future
  if (notificationDate > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Period Reminder",
        body: "Your period is expected to start in 2 days",
        data: { type: 'period_reminder' },
      },
      trigger: {
        date: notificationDate,
      },
    });
  }
}

export async function configurePushNotifications() {
  // Configure notification behavior
  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
} 