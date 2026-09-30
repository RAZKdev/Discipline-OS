import { describe, it, expect } from 'vitest';
import { isRuleActiveOnDate, canTransitionStatus } from '../scheduler';
import { ScheduleRule } from '../types';

describe('Scheduler Domain Logic', () => {
  const baseRule: ScheduleRule = {
    id: 'rule-1',
    userId: 'user-1',
    entityType: 'routine',
    entityId: 'routine-1',
    recurrence: 'daily',
    timezone: 'Asia/Jakarta',
    startDate: '2026-09-01',
    createdAt: '2026-09-01T00:00:00.000Z',
  };

  it('correctly matches daily recurrence within window', () => {
    expect(isRuleActiveOnDate(baseRule, '2026-09-25')).toBe(true);
    expect(isRuleActiveOnDate(baseRule, '2026-08-31')).toBe(false); // Before start date
  });

  it('correctly matches weekday recurrence (Mon-Fri)', () => {
    const weekdayRule: ScheduleRule = {
      ...baseRule,
      recurrence: 'weekdays',
    };
    // 2026-09-25 is Friday
    expect(isRuleActiveOnDate(weekdayRule, '2026-09-25')).toBe(true);
    // 2026-09-26 is Saturday
    expect(isRuleActiveOnDate(weekdayRule, '2026-09-26')).toBe(false);
    // 2026-09-27 is Sunday
    expect(isRuleActiveOnDate(weekdayRule, '2026-09-27')).toBe(false);
    // 2026-09-28 is Monday
    expect(isRuleActiveOnDate(weekdayRule, '2026-09-28')).toBe(true);
  });

  it('correctly matches custom days of week', () => {
    const customRule: ScheduleRule = {
      ...baseRule,
      recurrence: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    };
    // 2026-09-25 is Friday (5)
    expect(isRuleActiveOnDate(customRule, '2026-09-25')).toBe(true);
    // 2026-09-24 is Thursday (4)
    expect(isRuleActiveOnDate(customRule, '2026-09-24')).toBe(false);
  });

  it('validates allowed and deterministic status transitions', () => {
    expect(canTransitionStatus('pending', 'in_progress')).toBe(true);
    expect(canTransitionStatus('pending', 'completed')).toBe(true);
    expect(canTransitionStatus('pending', 'skipped')).toBe(true);
    expect(canTransitionStatus('pending', 'rescheduled')).toBe(true);
    expect(canTransitionStatus('completed', 'pending')).toBe(true); // undo
    expect(canTransitionStatus('skipped', 'completed')).toBe(true);
  });
});
