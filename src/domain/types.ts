/**
 * Discipline-OS Domain Types
 * Source of Truth: DATA_MODEL.md, SKILL.md, ARCHITECTURE.md
 *
 * Principles:
 * - Deterministic states and explicit provenance
 * - Canonical facts separate from derived/indexed projections
 * - No punishment / shaming: skip, pause, edit, reschedule are first-class transitions
 * - Streaks are strictly optional and respectful
 */

export type EntityId = string;
export type ISODateString = string; // YYYY-MM-DD
export type ISOTimestamp = string;  // ISO 8601 string (e.g. 2026-09-25T12:00:00.000Z)

export type ThemePreference = 'system' | 'light' | 'dark';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type TaskPriority = 'low' | 'medium' | 'high';
export type CategoryType = 'foundation' | 'workout' | 'discipline' | 'mindset' | 'rest' | 'personal';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';
export type RecurrenceType = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom_interval';
export type ProvenanceType = 'user_click' | 'scheduled_batch' | 'sync_event' | 'timer';
export type NotificationChannel = 'in_app' | 'web_push';
export type NotificationStatus = 'pending' | 'delivered' | 'dismissed' | 'failed';

// 1. User
export interface User {
  id: EntityId;
  email: string;
  displayName: string;
  timezone: string; // e.g. "Asia/Jakarta"
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 2. UserPreference
export interface UserPreference {
  userId: EntityId;
  theme: ThemePreference;
  reducedMotion: boolean;
  streakEnabled: boolean; // Streaks are optional (per SKILL.md)
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;   // HH:mm format
  updatedAt: ISOTimestamp;
}

// 3. Goal
export interface Goal {
  id: EntityId;
  userId: EntityId;
  title: string;
  description?: string;
  category: CategoryType;
  status: GoalStatus;
  targetDate?: ISODateString;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 4. Routine
export interface Routine {
  id: EntityId;
  userId: EntityId;
  title: string;
  description?: string;
  timeOfDay: TimeOfDay;
  isActive: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 5. RoutineItem
export interface RoutineItem {
  id: EntityId;
  routineId: EntityId;
  title: string;
  orderIndex: number;
  durationMinutes: number;
  category: CategoryType;
  taskTemplateId?: EntityId;
  createdAt: ISOTimestamp;
}

// 6. Habit
export interface Habit {
  id: EntityId;
  userId: EntityId;
  goalId?: EntityId;
  title: string;
  description?: string;
  category: CategoryType;
  targetPerDay: number; // e.g., 1 (once a day) or target units
  unitName?: string;    // e.g. "pages", "glasses", "minutes"
  isActive: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 7. ScheduleRule (Recurrence rule)
export interface ScheduleRule {
  id: EntityId;
  userId: EntityId;
  entityType: 'task' | 'habit' | 'routine';
  entityId: EntityId;
  recurrence: RecurrenceType;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  intervalDays?: number; // for custom_interval
  preferredTime?: string; // HH:mm
  timezone: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  createdAt: ISOTimestamp;
}

// 8. Task
export interface Task {
  id: EntityId;
  userId: EntityId;
  goalId?: EntityId;
  routineId?: EntityId;
  title: string;
  description?: string;
  category: CategoryType;
  priority: TaskPriority;
  estimatedMinutes?: number;
  isArchived: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 9. TaskInstance (Materialized schedule projection for a specific date)
export interface TaskInstance {
  id: EntityId;
  taskId: EntityId;
  userId: EntityId;
  scheduledDate: ISODateString; // YYYY-MM-DD
  scheduledTime?: string;       // HH:mm
  status: TaskStatus;
  rescheduledToDate?: ISODateString;
  skippedReason?: string;
  completedAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 10. Completion (Canonical fact recording task or habit fulfillment)
export interface Completion {
  id: EntityId;
  userId: EntityId;
  entityType: 'task' | 'habit' | 'routine_item';
  entityId: EntityId;
  taskInstanceId?: EntityId;
  completedAt: ISOTimestamp;
  value?: number;
  notes?: string;
  provenance: ProvenanceType;
}

// 11. Streak (Derived state: optional, pauseable, never shaming)
export interface Streak {
  id: EntityId;
  userId: EntityId;
  entityType: 'habit' | 'goal' | 'overall';
  entityId?: EntityId;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: ISODateString;
  isPaused: boolean; // User can pause without penalty
  pausedUntil?: ISODateString;
  updatedAt: ISOTimestamp;
}

// 12. Reward (Constructive reinforcement)
export interface Reward {
  id: EntityId;
  userId: EntityId;
  title: string;
  description?: string;
  category: 'entertainment' | 'rest' | 'treat' | 'personal';
  costPoints: number;
  isRedeemed: boolean;
  redeemedAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
}

// 13. EntertainmentRule (Entertainment Gate)
export interface EntertainmentRule {
  id: EntityId;
  userId: EntityId;
  title: string;
  platformName: string; // e.g., "YouTube", "Gaming", "Social Media"
  requiredCompletedTasks: number; // e.g. 3 tasks before unlocking
  requiredPoints?: number;
  isGated: boolean;
  unlockedUntil?: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

// 14. Notification
export interface Notification {
  id: EntityId;
  userId: EntityId;
  title: string;
  body: string;
  channel: NotificationChannel;
  scheduledFor: ISOTimestamp;
  status: NotificationStatus;
  sentAt?: ISOTimestamp;
  readAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
}

// 15. SyncEvent (For offline PWA & server reconciliation)
export interface SyncEvent {
  id: EntityId;
  userId: EntityId;
  clientMutationId: string;
  action: 'insert' | 'update' | 'delete' | 'complete' | 'skip' | 'reschedule';
  entityType: string;
  entityId: EntityId;
  payload: Record<string, unknown>;
  createdAt: ISOTimestamp;
  syncedAt?: ISOTimestamp;
}
