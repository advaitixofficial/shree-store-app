// ============================================================
// Shree Stores - Push Notification Handler & Registration
// Handles device token registration and heads-up banner alerts
// ============================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from '@/api/client';

// Configure notification behavior (show banner, sound, badge even in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(projectId?: string): Promise<string | null> {
  // Setup Android notification channel with MAX importance (blinkit style top status bar banner)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied by user');
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || '1f9f32f3-3384-46b4-a587-7f3f72615bad',
    });
    const token = tokenResponse.data;
    console.log('Expo Push Token registered:', token);

    // Register push token with backend API
    await apiClient.post('/customer/user/me/push-token', { pushToken: token }).catch(() => {});

    return token;
  } catch (error) {
    console.warn('Error fetching push token:', error);
    return null;
  }
}
