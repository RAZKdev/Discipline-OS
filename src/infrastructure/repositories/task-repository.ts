import {
  Task,
  TaskInstance,
  Streak,
  UserPreference,
  EntertainmentRule,
  ISODateString,
  TaskStatus,
  Completion,
  Reward,
} from '@/domain/types';
import { calculateNextStreak } from '@/domain/streak';

export interface ITaskRepository {
  getTasks(): Promise<Task[]>;
  getTaskInstances(dateStr: ISODateString): Promise<TaskInstance[]>;
  updateTaskInstanceStatus(
    instanceId: string,
    status: TaskStatus,
    skippedReason?: string,
    rescheduledToDate?: ISODateString
  ): Promise<{ instance: TaskInstance; completion?: Completion; updatedStreak?: Streak }>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): Promise<Task>;
  getStreak(userId: string): Promise<Streak>;
  setStreakPaused(userId: string, isPaused: boolean): Promise<Streak>;
  getUserPreference(userId: string): Promise<UserPreference>;
  updateUserPreference(userId: string, pref: Partial<UserPreference>): Promise<UserPreference>;
  getEntertainmentRule(userId: string): Promise<EntertainmentRule>;
  unlockEntertainmentGate(userId: string, durationMinutes?: number): Promise<EntertainmentRule>;
  getRewards(userId: string): Promise<Reward[]>;
  createReward(reward: Omit<Reward, 'id' | 'createdAt' | 'isRedeemed' | 'redeemedAt'>): Promise<Reward>;
  redeemReward(userId: string, rewardId: string): Promise<{ reward: Reward; newPointsBalance: number }>;
  getPointsBalance(userId: string): Promise<number>;
}

// Initial default seed demonstrating the core Foundation → Workout → Discipline routine
const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-foundation-1',
    userId: 'user-demo',
    title: 'Hidrasi & Penataan 3 Prioritas Utama',
    description: 'Minum 500ml air dan tentukan tiga prioritas fokus hari ini.',
    category: 'foundation',
    priority: 'high',
    estimatedMinutes: 10,
    isArchived: false,
    createdAt: '2026-09-25T06:00:00.000Z',
    updatedAt: '2026-09-25T06:00:00.000Z',
  },
  {
    id: 'task-workout-1',
    userId: 'user-demo',
    title: 'Peregangan Tubuh & Jalan Kaki 20 Menit',
    description: 'Aktivasi sirkulasi darah tanpa intensitas ekstrem yang membebani.',
    category: 'workout',
    priority: 'medium',
    estimatedMinutes: 20,
    isArchived: false,
    createdAt: '2026-09-25T06:00:00.000Z',
    updatedAt: '2026-09-25T06:00:00.000Z',
  },
  {
    id: 'task-discipline-1',
    userId: 'user-demo',
    title: 'Sesi Fokus Mendalam (Deep Work) 45 Menit',
    description: 'Kerjakan pekerjaan esensial dalam mode senyap tanpa gangguan media sosial.',
    category: 'discipline',
    priority: 'high',
    estimatedMinutes: 45,
    isArchived: false,
    createdAt: '2026-09-25T06:00:00.000Z',
    updatedAt: '2026-09-25T06:00:00.000Z',
  },
];

const DEFAULT_PREFERENCE: UserPreference = {
  userId: 'user-demo',
  theme: 'system',
  reducedMotion: false,
  streakEnabled: true,
  notificationsEnabled: true,
  soundEnabled: false,
  updatedAt: '2026-09-25T06:00:00.000Z',
};

const DEFAULT_STREAK: Streak = {
  id: 'streak-demo',
  userId: 'user-demo',
  entityType: 'overall',
  currentStreak: 3,
  longestStreak: 7,
  lastActiveDate: '2026-09-24',
  isPaused: false,
  updatedAt: '2026-09-24T18:00:00.000Z',
};

const DEFAULT_ENTERTAINMENT_RULE: EntertainmentRule = {
  id: 'ent-rule-demo',
  userId: 'user-demo',
  title: 'Buka Akses Hiburan Sore',
  platformName: 'YouTube & Game Santai',
  requiredCompletedTasks: 3,
  isGated: true,
  createdAt: '2026-09-25T06:00:00.000Z',
  updatedAt: '2026-09-25T06:00:00.000Z',
};

const DEFAULT_REWARDS: Reward[] = [
  {
    id: 'reward-1',
    userId: 'user-demo',
    title: 'Istirahat Santai 30 Menit',
    description: 'Rebahkan diri, relaksasi tanpa memikirkan tugas atau pekerjaan.',
    category: 'rest',
    costPoints: 20,
    isRedeemed: false,
    createdAt: '2026-09-25T06:00:00.000Z',
  },
  {
    id: 'reward-2',
    userId: 'user-demo',
    title: 'Nonton 1 Episode Serial / Anime',
    description: 'Waktu santai menonton konten hiburan dengan tenang.',
    category: 'entertainment',
    costPoints: 30,
    isRedeemed: false,
    createdAt: '2026-09-25T06:00:00.000Z',
  },
  {
    id: 'reward-3',
    userId: 'user-demo',
    title: 'Mendengarkan Musik / Album Favorit',
    description: 'Sesi mendengarkan musik santai tanpa terburu-buru.',
    category: 'personal',
    costPoints: 15,
    isRedeemed: false,
    createdAt: '2026-09-25T06:00:00.000Z',
  },
  {
    id: 'reward-4',
    userId: 'user-demo',
    title: 'Sesi Gaming Santai 45 Menit',
    description: 'Bermain game favorit setelah fokus tuntas.',
    category: 'entertainment',
    costPoints: 40,
    isRedeemed: false,
    createdAt: '2026-09-25T06:00:00.000Z',
  },
];

export class LocalTaskRepository implements ITaskRepository {
  private storageKey = 'discipline_os_data_v1';
  private inMemoryData: any = null;

  private loadData() {
    if (this.inMemoryData) {
      return this.inMemoryData;
    }

    if (typeof window === 'undefined') {
      this.inMemoryData = {
        tasks: [...DEFAULT_TASKS],
        instances: DEFAULT_TASKS.map((t) => ({
          id: `inst-${t.id}-today`,
          taskId: t.id,
          userId: t.userId,
          scheduledDate: '2026-09-25',
          status: 'pending' as TaskStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        streak: { ...DEFAULT_STREAK },
        preference: { ...DEFAULT_PREFERENCE },
        rule: { ...DEFAULT_ENTERTAINMENT_RULE },
        rewards: [...DEFAULT_REWARDS],
        pointsSpent: 0,
      };
      return this.inMemoryData;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.inMemoryData = JSON.parse(stored);
        if (!this.inMemoryData.rewards) {
          this.inMemoryData.rewards = [...DEFAULT_REWARDS];
        }
        return this.inMemoryData;
      }
    } catch {
      // fallback
    }

    this.inMemoryData = {
      tasks: [...DEFAULT_TASKS],
      instances: DEFAULT_TASKS.map((t) => ({
        id: `inst-${t.id}-today`,
        taskId: t.id,
        userId: t.userId,
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'pending' as TaskStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      streak: { ...DEFAULT_STREAK },
      preference: { ...DEFAULT_PREFERENCE },
      rule: { ...DEFAULT_ENTERTAINMENT_RULE },
      rewards: [...DEFAULT_REWARDS],
      pointsSpent: 0,
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.inMemoryData));
    } catch {
      // ignore in SSR
    }
    return this.inMemoryData;
  }

  private saveData(data: any) {
    this.inMemoryData = data;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
    }
  }

  async getTasks(): Promise<Task[]> {
    const data = this.loadData();
    return data.tasks;
  }

  async getTaskInstances(dateStr: ISODateString): Promise<TaskInstance[]> {
    const data = this.loadData();
    const existing = data.instances.filter((inst: TaskInstance) => inst.scheduledDate === dateStr);
    if (existing.length > 0) return existing;

    // Create instances for today based on active tasks
    const newInstances: TaskInstance[] = data.tasks.map((task: Task) => ({
      id: `inst-${task.id}-${dateStr}`,
      taskId: task.id,
      userId: task.userId,
      scheduledDate: dateStr,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    data.instances.push(...newInstances);
    this.saveData(data);
    return newInstances;
  }

  async updateTaskInstanceStatus(
    instanceId: string,
    status: TaskStatus,
    skippedReason?: string,
    rescheduledToDate?: ISODateString
  ): Promise<{ instance: TaskInstance; completion?: Completion; updatedStreak?: Streak }> {
    const data = this.loadData();
    const instIndex = data.instances.findIndex((i: TaskInstance) => i.id === instanceId);
    if (instIndex === -1) {
      throw new Error(`Instance with id ${instanceId} not found`);
    }

    const inst = data.instances[instIndex];
    inst.status = status;
    inst.updatedAt = new Date().toISOString();

    let completion: Completion | undefined;
    let updatedStreak: Streak | undefined;

    if (status === 'completed') {
      inst.completedAt = new Date().toISOString();
      completion = {
        id: `comp-${Date.now()}`,
        userId: inst.userId,
        entityType: 'task',
        entityId: inst.taskId,
        taskInstanceId: inst.id,
        completedAt: inst.completedAt,
        provenance: 'user_click',
      };

      // Check if all today's tasks completed to update streak
      const today = inst.scheduledDate;
      data.streak = calculateNextStreak(data.streak, today, data.preference.streakEnabled);
      updatedStreak = data.streak;
    } else if (status === 'skipped') {
      inst.skippedReason = skippedReason || 'Istirahat / Dijeda dengan bijak';
      inst.completedAt = undefined;
    } else if (status === 'rescheduled') {
      inst.rescheduledToDate = rescheduledToDate || '2026-09-26';
      inst.completedAt = undefined;
    } else if (status === 'pending') {
      inst.completedAt = undefined;
      inst.skippedReason = undefined;
      inst.rescheduledToDate = undefined;
    }

    data.instances[instIndex] = inst;
    this.saveData(data);

    return { instance: inst, completion, updatedStreak };
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>): Promise<Task> {
    const data = this.loadData();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.tasks.push(newTask);

    // Also add to today's instances
    const today = new Date().toISOString().split('T')[0];
    const newInstance: TaskInstance = {
      id: `inst-${newTask.id}-${today}`,
      taskId: newTask.id,
      userId: newTask.userId,
      scheduledDate: today,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.instances.push(newInstance);

    this.saveData(data);
    return newTask;
  }

  async getStreak(userId: string): Promise<Streak> {
    const data = this.loadData();
    return data.streak || { ...DEFAULT_STREAK, userId };
  }

  async setStreakPaused(userId: string, isPaused: boolean): Promise<Streak> {
    const data = this.loadData();
    data.streak.isPaused = isPaused;
    data.streak.updatedAt = new Date().toISOString();
    this.saveData(data);
    return data.streak;
  }

  async getUserPreference(userId: string): Promise<UserPreference> {
    const data = this.loadData();
    return data.preference || { ...DEFAULT_PREFERENCE, userId };
  }

  async updateUserPreference(userId: string, pref: Partial<UserPreference>): Promise<UserPreference> {
    const data = this.loadData();
    const current = data.preference || { ...DEFAULT_PREFERENCE, userId };
    const updated: UserPreference = {
      ...current,
      ...pref,
      updatedAt: new Date().toISOString(),
    };
    data.preference = updated;
    this.saveData(data);
    return updated;
  }

  async getEntertainmentRule(userId: string): Promise<EntertainmentRule> {
    const data = this.loadData();
    return data.rule || { ...DEFAULT_ENTERTAINMENT_RULE, userId };
  }

  async unlockEntertainmentGate(userId: string, durationMinutes: number = 60): Promise<EntertainmentRule> {
    const data = this.loadData();
    const until = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const updated: EntertainmentRule = {
      ...(data.rule || { ...DEFAULT_ENTERTAINMENT_RULE, userId }),
      unlockedUntil: until,
      updatedAt: new Date().toISOString(),
    };
    data.rule = updated;
    this.saveData(data);
    return updated;
  }

  async getRewards(userId: string): Promise<Reward[]> {
    const data = this.loadData();
    return data.rewards || [...DEFAULT_REWARDS];
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt' | 'isRedeemed' | 'redeemedAt'>): Promise<Reward> {
    const data = this.loadData();
    const newReward: Reward = {
      ...reward,
      id: `reward-${Date.now()}`,
      isRedeemed: false,
      createdAt: new Date().toISOString(),
    };
    if (!data.rewards) data.rewards = [...DEFAULT_REWARDS];
    data.rewards.push(newReward);
    this.saveData(data);
    return newReward;
  }

  async redeemReward(userId: string, rewardId: string): Promise<{ reward: Reward; newPointsBalance: number }> {
    const data = this.loadData();
    if (!data.rewards) data.rewards = [...DEFAULT_REWARDS];
    const rewardIndex = data.rewards.findIndex((r: Reward) => r.id === rewardId);
    if (rewardIndex === -1) {
      throw new Error(`Hadiah dengan id ${rewardId} tidak ditemukan.`);
    }

    const reward = data.rewards[rewardIndex];
    const currentPoints = await this.getPointsBalance(userId);

    if (currentPoints < reward.costPoints) {
      throw new Error(
        `Poin konsistensi tidak mencukupi (diperlukan ${reward.costPoints} poin, saat ini ${currentPoints} poin).`
      );
    }

    reward.isRedeemed = true;
    reward.redeemedAt = new Date().toISOString();
    data.rewards[rewardIndex] = { ...reward };

    data.pointsSpent = (data.pointsSpent || 0) + reward.costPoints;
    this.saveData(data);

    const newPointsBalance = currentPoints - reward.costPoints;
    return { reward: { ...reward }, newPointsBalance };
  }

  async getPointsBalance(userId: string): Promise<number> {
    const data = this.loadData();
    const completionsCount = (data.instances || []).filter(
      (i: TaskInstance) => i.status === 'completed'
    ).length;
    const earnedPoints = 50 + completionsCount * 10;
    const spentPoints = data.pointsSpent || 0;
    return Math.max(0, earnedPoints - spentPoints);
  }
}
