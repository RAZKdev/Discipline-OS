import { describe, it, expect } from 'vitest';
import { isQuietHours, canSendNotification } from '../notification';
import { UserPreference } from '../types';

describe('Notification Domain Engine (Quiet Hours Compliance)', () => {
  const defaultPref: UserPreference = {
    userId: 'u1',
    theme: 'system',
    reducedMotion: false,
    streakEnabled: true,
    notificationsEnabled: true,
    soundEnabled: true,
    quietHoursStart: '21:00',
    quietHoursEnd: '07:00',
    updatedAt: '2026-09-25T00:00:00.000Z',
  };

  it('correctly detects quiet hours across midnight', () => {
    // 22:30 is between 21:00 and 07:00
    expect(isQuietHours('22:30', '21:00', '07:00')).toBe(true);
    // 03:00 is between 21:00 and 07:00
    expect(isQuietHours('03:00', '21:00', '07:00')).toBe(true);
    // 06:59 is between 21:00 and 07:00
    expect(isQuietHours('06:59', '21:00', '07:00')).toBe(true);
    // 07:00 is outside
    expect(isQuietHours('07:00', '21:00', '07:00')).toBe(false);
    // 14:00 is outside
    expect(isQuietHours('14:00', '21:00', '07:00')).toBe(false);
  });

  it('correctly detects quiet hours within the same day', () => {
    expect(isQuietHours('14:00', '13:00', '15:00')).toBe(true);
    expect(isQuietHours('12:59', '13:00', '15:00')).toBe(false);
    expect(isQuietHours('15:01', '13:00', '15:00')).toBe(false);
  });

  it('blocks notification when inside quiet hours', () => {
    const res = canSendNotification(defaultPref, '23:00');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('Jam Tenang');
  });

  it('allows notification during daytime', () => {
    const res = canSendNotification(defaultPref, '10:00');
    expect(res.allowed).toBe(true);
  });

  it('blocks notification when notificationsEnabled is false', () => {
    const disabledPref = { ...defaultPref, notificationsEnabled: false };
    const res = canSendNotification(disabledPref, '10:00');
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain('dinonaktifkan');
  });
});
