import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';
import { ITaskRepository } from './task-repository';
import {
  Task,
  TaskInstance,
  Streak,
  UserPreference,
  EntertainmentRule,
  ISODateString,
  TaskStatus,
  Completion,
  CategoryType,
  TaskPriority,
  Reward,
} from '@/domain/types';
import { calculateNextStreak } from '@/domain/streak';

export class SupabaseTaskRepository implements ITaskRepository {
  constructor(private client: SupabaseClient<Database>) {}

  private async getAuthenticatedUserId(): Promise<string> {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error || !user) {
      throw new Error('Pengguna belum terautentikasi');
    }
    return user.id;
  }

  async getTasks(): Promise<Task[]> {
    const userId = await this.getAuthenticatedUserId();
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Gagal mengambil data tasks: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      goalId: row.goal_id || undefined,
      routineId: row.routine_id || undefined,
      title: row.title,
      description: row.description || undefined,
      category: row.category as CategoryType,
      priority: row.priority as TaskPriority,
      estimatedMinutes: row.estimated_minutes || undefined,
      isArchived: row.is_archived,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getTaskInstances(dateStr: ISODateString): Promise<TaskInstance[]> {
    const userId = await this.getAuthenticatedUserId();

    const { data: existing, error } = await this.client
      .from('task_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('scheduled_date', dateStr);

    if (error) throw new Error(`Gagal mengambil task instances: ${error.message}`);

    if (existing && existing.length > 0) {
      return existing.map((row) => ({
        id: row.id,
        taskId: row.task_id,
        userId: row.user_id,
        scheduledDate: row.scheduled_date,
        scheduledTime: row.scheduled_time || undefined,
        status: row.status as TaskStatus,
        rescheduledToDate: row.rescheduled_to_date || undefined,
        skippedReason: row.skipped_reason || undefined,
        completedAt: row.completed_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }

    // Materialize instances for today from active tasks
    const tasks = await this.getTasks();
    if (tasks.length === 0) return [];

    const toInsert = tasks.map((task) => ({
      task_id: task.id,
      user_id: userId,
      scheduled_date: dateStr,
      status: 'pending',
    }));

    const { data: created, error: insertError } = await this.client
      .from('task_instances')
      .insert(toInsert)
      .select('*');

    if (insertError) throw new Error(`Gagal membuat task instances: ${insertError.message}`);

    return (created || []).map((row) => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      scheduledDate: row.scheduled_date,
      scheduledTime: row.scheduled_time || undefined,
      status: row.status as TaskStatus,
      rescheduledToDate: row.rescheduled_to_date || undefined,
      skippedReason: row.skipped_reason || undefined,
      completedAt: row.completed_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async updateTaskInstanceStatus(
    instanceId: string,
    status: TaskStatus,
    skippedReason?: string,
    rescheduledToDate?: ISODateString
  ): Promise<{ instance: TaskInstance; completion?: Completion; updatedStreak?: Streak }> {
    const userId = await this.getAuthenticatedUserId();
    const updatePayload: {
      status: string;
      completed_at?: string | null;
      skipped_reason?: string | null;
      rescheduled_to_date?: string | null;
    } = { status };

    let completedAt: string | undefined;

    if (status === 'completed') {
      completedAt = new Date().toISOString();
      updatePayload.completed_at = completedAt;
    } else if (status === 'skipped') {
      updatePayload.skipped_reason = skippedReason || 'Istirahat / Dijeda dengan bijak';
      updatePayload.completed_at = null;
    } else if (status === 'rescheduled') {
      updatePayload.rescheduled_to_date = rescheduledToDate || null;
      updatePayload.completed_at = null;
    } else {
      updatePayload.completed_at = null;
      updatePayload.skipped_reason = null;
      updatePayload.rescheduled_to_date = null;
    }

    const { data: updated, error } = await this.client
      .from('task_instances')
      .update(updatePayload)
      .eq('id', instanceId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !updated) throw new Error(`Gagal mengupdate instance: ${error?.message}`);

    const instance: TaskInstance = {
      id: updated.id,
      taskId: updated.task_id,
      userId: updated.user_id,
      scheduledDate: updated.scheduled_date,
      scheduledTime: updated.scheduled_time || undefined,
      status: updated.status as TaskStatus,
      rescheduledToDate: updated.rescheduled_to_date || undefined,
      skippedReason: updated.skipped_reason || undefined,
      completedAt: updated.completed_at || undefined,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    let completion: Completion | undefined;
    let updatedStreak: Streak | undefined;

    if (status === 'completed') {
      const { data: compRow, error: compError } = await this.client
        .from('completions')
        .insert({
          user_id: userId,
          entity_type: 'task',
          entity_id: instance.taskId,
          task_instance_id: instance.id,
          completed_at: completedAt!,
          provenance: 'user_click',
        })
        .select('*')
        .single();

      if (!compError && compRow) {
        completion = {
          id: compRow.id,
          userId: compRow.user_id,
          entityType: 'task',
          entityId: compRow.entity_id,
          taskInstanceId: compRow.task_instance_id || undefined,
          completedAt: compRow.completed_at,
          provenance: 'user_click',
        };
      }

      // Update streak
      const currentStreak = await this.getStreak(userId);
      const pref = await this.getUserPreference(userId);
      const nextStreak = calculateNextStreak(currentStreak, instance.scheduledDate, pref.streakEnabled);

      const { data: streakRow } = await this.client
        .from('streaks')
        .update({
          current_streak: nextStreak.currentStreak,
          longest_streak: nextStreak.longestStreak,
          last_active_date: nextStreak.lastActiveDate,
        })
        .eq('id', currentStreak.id)
        .select('*')
        .single();

      if (streakRow) {
        updatedStreak = {
          id: streakRow.id,
          userId: streakRow.user_id,
          entityType: streakRow.entity_type as 'habit' | 'goal' | 'overall',
          currentStreak: streakRow.current_streak,
          longestStreak: streakRow.longest_streak,
          lastActiveDate: streakRow.last_active_date || undefined,
          isPaused: streakRow.is_paused,
          pausedUntil: streakRow.paused_until || undefined,
          updatedAt: streakRow.updated_at,
        };
      }
    }

    return { instance, completion, updatedStreak };
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): Promise<Task> {
    const userId = await this.getAuthenticatedUserId();

    const { data: created, error } = await this.client
      .from('tasks')
      .insert({
        user_id: userId,
        goal_id: task.goalId || null,
        routine_id: task.routineId || null,
        title: task.title,
        description: task.description || null,
        category: task.category,
        priority: task.priority,
        estimated_minutes: task.estimatedMinutes || null,
      })
      .select('*')
      .single();

    if (error || !created) throw new Error(`Gagal membuat task: ${error?.message}`);

    // Create instance for today as well
    const today = new Date().toISOString().split('T')[0];
    await this.client.from('task_instances').insert({
      task_id: created.id,
      user_id: userId,
      scheduled_date: today,
      status: 'pending',
    });

    return {
      id: created.id,
      userId: created.user_id,
      goalId: created.goal_id || undefined,
      routineId: created.routine_id || undefined,
      title: created.title,
      description: created.description || undefined,
      category: created.category as CategoryType,
      priority: created.priority as TaskPriority,
      estimatedMinutes: created.estimated_minutes || undefined,
      isArchived: created.is_archived,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  }

  async getStreak(userId: string): Promise<Streak> {
    const { data, error } = await this.client
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('entity_type', 'overall')
      .maybeSingle();

    if (error || !data) {
      return {
        id: 'streak-default',
        userId,
        entityType: 'overall',
        currentStreak: 0,
        longestStreak: 0,
        isPaused: false,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: data.id,
      userId: data.user_id,
      entityType: data.entity_type as 'habit' | 'goal' | 'overall',
      entityId: data.entity_id || undefined,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActiveDate: data.last_active_date || undefined,
      isPaused: data.is_paused,
      pausedUntil: data.paused_until || undefined,
      updatedAt: data.updated_at,
    };
  }

  async setStreakPaused(userId: string, isPaused: boolean): Promise<Streak> {
    const { data, error } = await this.client
      .from('streaks')
      .update({ is_paused: isPaused })
      .eq('user_id', userId)
      .eq('entity_type', 'overall')
      .select('*')
      .single();

    if (error || !data) throw new Error(`Gagal mengubah jeda streak: ${error?.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      entityType: data.entity_type as 'habit' | 'goal' | 'overall',
      entityId: data.entity_id || undefined,
      currentStreak: data.current_streak,
      longestStreak: data.longest_streak,
      lastActiveDate: data.last_active_date || undefined,
      isPaused: data.is_paused,
      pausedUntil: data.paused_until || undefined,
      updatedAt: data.updated_at,
    };
  }

  async getUserPreference(userId: string): Promise<UserPreference> {
    const { data, error } = await this.client
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return {
        userId,
        theme: 'system',
        reducedMotion: false,
        streakEnabled: true,
        notificationsEnabled: true,
        soundEnabled: false,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      userId: data.user_id,
      theme: data.theme as 'system' | 'light' | 'dark',
      reducedMotion: data.reduced_motion,
      streakEnabled: data.streak_enabled,
      notificationsEnabled: data.notifications_enabled,
      soundEnabled: data.sound_enabled,
      quietHoursStart: data.quiet_hours_start || undefined,
      quietHoursEnd: data.quiet_hours_end || undefined,
      updatedAt: data.updated_at,
    };
  }

  async updateUserPreference(userId: string, pref: Partial<UserPreference>): Promise<UserPreference> {
    const updatePayload: {
      theme?: 'system' | 'light' | 'dark';
      reduced_motion?: boolean;
      streak_enabled?: boolean;
      notifications_enabled?: boolean;
      sound_enabled?: boolean;
      quiet_hours_start?: string | null;
      quiet_hours_end?: string | null;
    } = {};

    if (pref.theme !== undefined) updatePayload.theme = pref.theme;
    if (pref.reducedMotion !== undefined) updatePayload.reduced_motion = pref.reducedMotion;
    if (pref.streakEnabled !== undefined) updatePayload.streak_enabled = pref.streakEnabled;
    if (pref.notificationsEnabled !== undefined) updatePayload.notifications_enabled = pref.notificationsEnabled;
    if (pref.soundEnabled !== undefined) updatePayload.sound_enabled = pref.soundEnabled;
    if (pref.quietHoursStart !== undefined) updatePayload.quiet_hours_start = pref.quietHoursStart;
    if (pref.quietHoursEnd !== undefined) updatePayload.quiet_hours_end = pref.quietHoursEnd;

    const { data, error } = await this.client
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...updatePayload,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(`Gagal memperbarui preferensi: ${error?.message}`);

    return {
      userId: data.user_id,
      theme: data.theme as 'system' | 'light' | 'dark',
      reducedMotion: data.reduced_motion,
      streakEnabled: data.streak_enabled,
      notificationsEnabled: data.notifications_enabled,
      soundEnabled: data.sound_enabled,
      quietHoursStart: data.quiet_hours_start || undefined,
      quietHoursEnd: data.quiet_hours_end || undefined,
      updatedAt: data.updated_at,
    };
  }

  async getEntertainmentRule(userId: string): Promise<EntertainmentRule> {
    const { data, error } = await this.client
      .from('entertainment_rules')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        id: 'rule-default',
        userId,
        title: 'Gerbang Hiburan Harian',
        platformName: 'YouTube & Game Santai',
        requiredCompletedTasks: 3,
        isGated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      platformName: data.platform_name,
      requiredCompletedTasks: data.required_completed_tasks,
      requiredPoints: data.required_points || undefined,
      isGated: data.is_gated,
      unlockedUntil: data.unlocked_until || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async unlockEntertainmentGate(userId: string, durationMinutes: number = 60): Promise<EntertainmentRule> {
    const until = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const { data, error } = await this.client
      .from('entertainment_rules')
      .update({
        unlocked_until: until,
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) throw new Error(`Gagal membuka akses gerbang hiburan: ${error?.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      platformName: data.platform_name,
      requiredCompletedTasks: data.required_completed_tasks,
      requiredPoints: data.required_points || undefined,
      isGated: data.is_gated,
      unlockedUntil: data.unlocked_until || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getRewards(userId: string): Promise<Reward[]> {
    const { data, error } = await this.client
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Gagal mengambil daftar hadiah: ${error.message}`);

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || undefined,
      category: row.category as 'entertainment' | 'rest' | 'treat' | 'personal',
      costPoints: row.cost_points,
      isRedeemed: row.is_redeemed,
      redeemedAt: row.redeemed_at || undefined,
      createdAt: row.created_at,
    }));
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt' | 'isRedeemed' | 'redeemedAt'>): Promise<Reward> {
    const userId = await this.getAuthenticatedUserId();
    const { data, error } = await this.client
      .from('rewards')
      .insert({
        user_id: userId,
        title: reward.title,
        description: reward.description || null,
        category: reward.category,
        cost_points: reward.costPoints,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(`Gagal membuat hadiah: ${error?.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description || undefined,
      category: data.category as 'entertainment' | 'rest' | 'treat' | 'personal',
      costPoints: data.cost_points,
      isRedeemed: data.is_redeemed,
      redeemedAt: data.redeemed_at || undefined,
      createdAt: data.created_at,
    };
  }

  async redeemReward(userId: string, rewardId: string): Promise<{ reward: Reward; newPointsBalance: number }> {
    const currentPoints = await this.getPointsBalance(userId);

    const { data: currentReward, error: fetchError } = await this.client
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentReward) throw new Error('Hadiah tidak ditemukan.');
    if (currentPoints < currentReward.cost_points) {
      throw new Error(`Poin konsistensi tidak mencukupi (diperlukan ${currentReward.cost_points} poin).`);
    }

    const { data: updated, error: updateError } = await this.client
      .from('rewards')
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', rewardId)
      .select('*')
      .single();

    if (updateError || !updated) throw new Error(`Gagal menukarkan hadiah: ${updateError?.message}`);

    const newPointsBalance = currentPoints - updated.cost_points;
    return {
      reward: {
        id: updated.id,
        userId: updated.user_id,
        title: updated.title,
        description: updated.description || undefined,
        category: updated.category as 'entertainment' | 'rest' | 'treat' | 'personal',
        costPoints: updated.cost_points,
        isRedeemed: updated.is_redeemed,
        redeemedAt: updated.redeemed_at || undefined,
        createdAt: updated.created_at,
      },
      newPointsBalance,
    };
  }

  async getPointsBalance(userId: string): Promise<number> {
    const { count: completedTasksCount, error: countError } = await this.client
      .from('completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw new Error(`Gagal menghitung poin: ${countError.message}`);

    const { data: redeemedRewards, error: rewardsError } = await this.client
      .from('rewards')
      .select('cost_points')
      .eq('user_id', userId)
      .eq('is_redeemed', true);

    if (rewardsError) throw new Error(`Gagal menghitung penggunaan poin: ${rewardsError.message}`);

    const earned = 50 + (completedTasksCount || 0) * 10;
    const spent = (redeemedRewards || []).reduce((sum, r) => sum + r.cost_points, 0);

    return Math.max(0, earned - spent);
  }
}
