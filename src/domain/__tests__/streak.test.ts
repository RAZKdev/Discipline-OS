import { describe, it, expect } from 'vitest';
import { calculateNextStreak } from '../streak';
import { Streak } from '../types';

describe('Streak Domain Logic (Gentle & Pause-respecting)', () => {
  const initialStreak: Streak = {
    id: 'streak-1',
    userId: 'user-1',
    entityType: 'overall',
    currentStreak: 5,
    longestStreak: 10,
    lastActiveDate: '2026-09-24',
    isPaused: false,
    updatedAt: '2026-09-24T10:00:00.000Z',
  };

  it('increments streak on consecutive day completion', () => {
    const updated = calculateNextStreak(initialStreak, '2026-09-25');
    expect(updated.currentStreak).toBe(6);
    expect(updated.longestStreak).toBe(10);
    expect(updated.lastActiveDate).toBe('2026-09-25');
  });

  it('does not double-count completion on the same day', () => {
    const updated = calculateNextStreak(initialStreak, '2026-09-24');
    expect(updated.currentStreak).toBe(5);
  });

  it('preserves streak without penalty when streak is paused', () => {
    const pausedStreak: Streak = {
      ...initialStreak,
      isPaused: true,
      lastActiveDate: '2026-09-20', // several days ago
    };
    const updated = calculateNextStreak(pausedStreak, '2026-09-25');
    // Streak count remains intact, not zeroed
    expect(updated.currentStreak).toBe(5);
  });

  it('respects user preference when streak tracking is disabled', () => {
    const updated = calculateNextStreak(initialStreak, '2026-09-25', false);
    expect(updated.currentStreak).toBe(0);
    expect(updated.longestStreak).toBe(0);
  });
});
