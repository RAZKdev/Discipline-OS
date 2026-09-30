import { UserPreference } from '@/domain/types';
import { canSendNotification } from '@/domain/notification';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  return await Notification.requestPermission();
}

export function sendBrowserNotification(
  title: string,
  body: string,
  preference: UserPreference,
  currentTimeHHMM?: string
): { sent: boolean; reason?: string } {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { sent: false, reason: 'Web Notifications tidak didukung di browser ini.' };
  }

  const check = canSendNotification(preference, currentTimeHHMM);
  if (!check.allowed) {
    return { sent: false, reason: check.reason };
  }

  if (Notification.permission !== 'granted') {
    return { sent: false, reason: 'Izin notifikasi browser belum diberikan.' };
  }

  try {
    new Notification(title, {
      body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      silent: !preference.soundEnabled,
    });
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: `Gagal menampilkan notifikasi: ${err}` };
  }
}
