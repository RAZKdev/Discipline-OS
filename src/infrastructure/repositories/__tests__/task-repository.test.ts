import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskRepository } from '../task-repository';

describe('LocalTaskRepository (Vertical Slice Workflow)', () => {
  let repo: LocalTaskRepository;

  beforeEach(() => {
    repo = new LocalTaskRepository();
  });

  it('loads default seeded tasks correctly', async () => {
    const tasks = await repo.getTasks();
    expect(tasks.length).toBeGreaterThanOrEqual(3);
    const categories = tasks.map((t) => t.category);
    expect(categories).toContain('foundation');
    expect(categories).toContain('workout');
    expect(categories).toContain('discipline');
  });

  it('generates task instances for a given date', async () => {
    const instances = await repo.getTaskInstances('2026-09-25');
    expect(instances.length).toBeGreaterThanOrEqual(3);
    expect(instances.every((i) => i.status === 'pending')).toBe(true);
  });

  it('transitions a task instance to completed with completion record and streak calculation', async () => {
    const instances = await repo.getTaskInstances('2026-09-25');
    const first = instances[0];

    const result = await repo.updateTaskInstanceStatus(first.id, 'completed');
    expect(result.instance.status).toBe('completed');
    expect(result.completion).toBeDefined();
    expect(result.completion?.entityId).toBe(first.taskId);
    expect(result.completion?.provenance).toBe('user_click');
    expect(result.updatedStreak).toBeDefined();
  });

  it('transitions a task instance to skipped with a gentle reason', async () => {
    const instances = await repo.getTaskInstances('2026-09-25');
    const target = instances[1];

    const result = await repo.updateTaskInstanceStatus(
      target.id,
      'skipped',
      'Energi sedang rendah'
    );
    expect(result.instance.status).toBe('skipped');
    expect(result.instance.skippedReason).toBe('Energi sedang rendah');
  });

  it('supports pausing streak without penalty', async () => {
    const paused = await repo.setStreakPaused('user-demo', true);
    expect(paused.isPaused).toBe(true);

    const resumed = await repo.setStreakPaused('user-demo', false);
    expect(resumed.isPaused).toBe(false);
  });

  it('allows adding a new custom task', async () => {
    const newTask = await repo.createTask({
      userId: 'user-demo',
      title: 'Belajar Next.js App Router 30 Menit',
      category: 'discipline',
      priority: 'high',
      estimatedMinutes: 30,
    });

    expect(newTask.id).toBeDefined();
    const tasks = await repo.getTasks();
    expect(tasks.some((t) => t.id === newTask.id)).toBe(true);
  });

  it('updates and persists user preferences correctly', async () => {
    const updated = await repo.updateUserPreference('user-demo', {
      theme: 'dark',
      streakEnabled: false,
      reducedMotion: true,
      quietHoursStart: '22:00',
    });

    expect(updated.theme).toBe('dark');
    expect(updated.streakEnabled).toBe(false);
    expect(updated.reducedMotion).toBe(true);
    expect(updated.quietHoursStart).toBe('22:00');

    const retrieved = await repo.getUserPreference('user-demo');
    expect(retrieved.theme).toBe('dark');
    expect(retrieved.streakEnabled).toBe(false);
  });
});
