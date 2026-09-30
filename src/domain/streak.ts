import { Streak, ISODateString } from './types';

/**
 * Calculates days difference between two YYYY-MM-DD dates.
 */
export function getDaysDifference(earlierDateStr: ISODateString, laterDateStr: ISODateString): number {
  const [y1, m1, d1] = earlierDateStr.split('-').map(Number);
  const [y2, m2, d2] = laterDateStr.split('-').map(Number);
  const date1 = Date.UTC(y1, m1 - 1, d1);
  const date2 = Date.UTC(y2, m2 - 1, d2);
  return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
}

/**
 * Updates a streak record based on a newly completed action on `completionDate`.
 * Respects pause state: if paused, streak is frozen and preserved without penalty.
 */
export function calculateNextStreak(
  currentStreak: Streak,
  completionDate: ISODateString,
  streakEnabled: boolean = true
): Streak {
  if (!streakEnabled) {
    return {
      ...currentStreak,
      currentStreak: 0,
      longestStreak: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  // If currently paused, protect streak without penalty
  if (currentStreak.isPaused) {
    return {
      ...currentStreak,
      lastActiveDate: completionDate,
      updatedAt: new Date().toISOString(),
    };
  }

  if (!currentStreak.lastActiveDate) {
    // First completion ever
    return {
      ...currentStreak,
      currentStreak: 1,
      longestStreak: Math.max(1, currentStreak.longestStreak),
      lastActiveDate: completionDate,
      updatedAt: new Date().toISOString(),
    };
  }

  const daysDiff = getDaysDifference(currentStreak.lastActiveDate, completionDate);

  if (daysDiff === 0) {
    // Already counted for today
    return currentStreak;
  }

  if (daysDiff === 1) {
    // Consecutive day
    const nextCurrent = currentStreak.currentStreak + 1;
    return {
      ...currentStreak,
      currentStreak: nextCurrent,
      longestStreak: Math.max(nextCurrent, currentStreak.longestStreak),
      lastActiveDate: completionDate,
      updatedAt: new Date().toISOString(),
    };
  }

  // If a day was missed and not paused, restart gently without shaming
  return {
    ...currentStreak,
    currentStreak: 1,
    longestStreak: currentStreak.longestStreak,
    lastActiveDate: completionDate,
    updatedAt: new Date().toISOString(),
  };
}
