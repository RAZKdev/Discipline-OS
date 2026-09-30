import { UserPreference } from './types';

/**
 * Checks if a given HH:mm time falls within the configured quiet hours.
 * Supports intervals spanning across midnight (e.g., 21:00 to 07:00)
 * as well as single-day intervals (e.g., 13:00 to 15:00).
 */
export function isQuietHours(
  currentTime: string, // "HH:mm"
  quietStart?: string,  // "HH:mm"
  quietEnd?: string     // "HH:mm"
): boolean {
  if (!quietStart || !quietEnd || quietStart === quietEnd) {
    return false;
  }

  // Convert HH:mm to minutes from start of day
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const currentMinutes = toMinutes(currentTime);
  const startMinutes = toMinutes(quietStart);
  const endMinutes = toMinutes(quietEnd);

  if (startMinutes < endMinutes) {
    // Single day window (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Spans across midnight (e.g. 21:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Evaluates whether a notification is allowed to be dispatched
 * according to user preference and quiet hours compliance.
 */
export function canSendNotification(
  preference: UserPreference,
  currentTimeHHMM?: string
): { allowed: boolean; reason?: string } {
  if (!preference.notificationsEnabled) {
    return { allowed: false, reason: 'Notifikasi dinonaktifkan oleh pengguna.' };
  }

  const timeToCheck =
    currentTimeHHMM ||
    new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  if (isQuietHours(timeToCheck, preference.quietHoursStart, preference.quietHoursEnd)) {
    return {
      allowed: false,
      reason: `Waktu saat ini (${timeToCheck}) berada dalam rentang Jam Tenang (${preference.quietHoursStart} - ${preference.quietHoursEnd}).`,
    };
  }

  return { allowed: true };
}
