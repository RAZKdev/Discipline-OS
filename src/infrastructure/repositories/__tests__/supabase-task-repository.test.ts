import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseTaskRepository } from '../supabase-task-repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../supabase/types';

describe('SupabaseTaskRepository', () => {
  let mockSupabase: any;
  let repo: SupabaseTaskRepository;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
      },
      from: vi.fn(),
    };
    repo = new SupabaseTaskRepository(mockSupabase as unknown as SupabaseClient<Database>);
  });

  it('throws an error if user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Session missing'),
    });

    await expect(repo.getTasks()).rejects.toThrow('Pengguna belum terautentikasi');
  });

  it('fetches tasks and maps from snake_case to domain model', async () => {
    const mockDbTasks = [
      {
        id: 't-1',
        user_id: 'test-user-id',
        goal_id: null,
        routine_id: null,
        title: 'Latihan Peregangan',
        description: '15 menit pagi hari',
        category: 'workout',
        priority: 'medium',
        estimated_minutes: 15,
        is_archived: false,
        created_at: '2026-09-25T00:00:00.000Z',
        updated_at: '2026-09-25T00:00:00.000Z',
      },
    ];

    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockDbTasks, error: null }),
    };

    mockSupabase.from.mockReturnValue(selectChain);

    const tasks = await repo.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('t-1');
    expect(tasks[0].category).toBe('workout');
    expect(tasks[0].estimatedMinutes).toBe(15);
    expect(tasks[0].title).toBe('Latihan Peregangan');
  });

  it('returns default streak if none exists in database', async () => {
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockSupabase.from.mockReturnValue(selectChain);

    const streak = await repo.getStreak('test-user-id');
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(0);
    expect(streak.isPaused).toBe(false);
  });

  it('updates user preferences in Supabase', async () => {
    const mockPrefRow = {
      id: 'pref-1',
      user_id: 'test-user-id',
      theme: 'dark',
      reduced_motion: true,
      streak_enabled: false,
      notifications_enabled: true,
      sound_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '06:00',
      updated_at: '2026-09-25T12:00:00.000Z',
    };

    const upsertChain = {
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPrefRow, error: null }),
    };

    mockSupabase.from.mockReturnValue(upsertChain);

    const result = await repo.updateUserPreference('test-user-id', {
      theme: 'dark',
      reducedMotion: true,
      streakEnabled: false,
    });

    expect(result.theme).toBe('dark');
    expect(result.reducedMotion).toBe(true);
    expect(result.streakEnabled).toBe(false);
    expect(result.quietHoursStart).toBe('22:00');
  });
});
