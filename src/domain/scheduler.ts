import { ScheduleRule, ISODateString, TaskStatus } from './types';

/**
 * Checks if a given date falls within the schedule rule's validity window.
 */
export function isDateWithinWindow(
  dateStr: ISODateString,
  startDateStr: ISODateString,
  endDateStr?: ISODateString
): boolean {
  if (dateStr < startDateStr) return false;
  if (endDateStr && dateStr > endDateStr) return false;
  return true;
}

/**
 * Evaluates whether a ScheduleRule applies on a specific date (YYYY-MM-DD).
 * Deterministic and timezone-agnostic when given a localized dateStr.
 */
export function isRuleActiveOnDate(rule: ScheduleRule, targetDateStr: ISODateString): boolean {
  if (!isDateWithinWindow(targetDateStr, rule.startDate, rule.endDate)) {
    return false;
  }

  // Parse YYYY-MM-DD into a Date in UTC to get consistent day of week
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  switch (rule.recurrence) {
    case 'daily':
      return true;

    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;

    case 'weekly':
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return false;
      return rule.daysOfWeek.includes(dayOfWeek);

    case 'custom_interval': {
      if (!rule.intervalDays || rule.intervalDays <= 0) return true;
      const [sYear, sMonth, sDay] = rule.startDate.split('-').map(Number);
      const startDate = new Date(Date.UTC(sYear, sMonth - 1, sDay));
      const diffTime = targetDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays % rule.intervalDays === 0;
    }

    default:
      return false;
  }
}

/**
 * Deterministic task status transitions.
 * Ensures valid state movements per SKILL.md.
 */
export function canTransitionStatus(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;

  switch (from) {
    case 'pending':
      return ['in_progress', 'completed', 'skipped', 'rescheduled'].includes(to);
    case 'in_progress':
      return ['completed', 'skipped', 'rescheduled', 'pending'].includes(to);
    case 'completed':
      // Allow undoing completion back to pending or in_progress
      return ['pending', 'in_progress'].includes(to);
    case 'skipped':
      // Allow reopening a skipped task
      return ['pending', 'completed'].includes(to);
    case 'rescheduled':
      return ['pending'].includes(to);
    default:
      return false;
  }
}
