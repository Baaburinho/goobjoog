import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function initNotificationChannels() {
  if (Capacitor.isNativePlatform()) {
    try {
      // Request Permission
      const permResult = await LocalNotifications.requestPermissions();
      console.log('Notification permission result:', permResult);

      // Create Android Notification Channel
      await LocalNotifications.createChannel({
        id: 'goobjoog_tours',
        name: 'House Viewing Tours & Applications',
        description: 'Notifications for new house viewing tours and rental requests',
        importance: 5, // High Importance for Heads-up Alert & Sound
        visibility: 1, // Public
        sound: 'res://platform_default',
        vibration: true
      });
    } catch (e) {
      console.warn('Failed to initialize Capacitor LocalNotifications channel:', e);
    }
  }
}

export async function sendTourNotification(tenantName: string, houseTitle: string, tourDate: string) {
  const title = '📅 Codsi Booqasho Guri Cusub (House Tour)';
  const body = `${tenantName} wuxuu koodsaday ballan booqasho guri: "${houseTitle}" taariikhda ${tourDate}`;

  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 1000) }, // Schedule 1 second in future
            sound: 'res://platform_default',
            actionTypeId: '',
            extra: { type: 'tour_request' },
            channelId: 'goobjoog_tours'
          }
        ]
      });
    } catch (err) {
      console.error('Error sending Capacitor native notification:', err);
    }
  } else {
    // Browser fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}

export async function sendApplicationNotification(tenantName: string, houseTitle: string) {
  const title = '📄 Codsi Kireysi Cusub (Rental Application)';
  const body = `${tenantName} wuxuu soo gubiyay codsi kireysi oo cusub guriga: "${houseTitle}"`;

  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannels();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'res://platform_default',
            actionTypeId: '',
            extra: { type: 'rental_application' },
            channelId: 'goobjoog_tours'
          }
        ]
      });
    } catch (err) {
      console.error('Error sending Capacitor native notification:', err);
    }
  } else {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }
}
