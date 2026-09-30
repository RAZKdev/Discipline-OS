-- =============================================================================
-- DISCIPLINE-OS SUPABASE / POSTGRESQL SCHEMA MIGRATION
-- Source of Truth: DATA_MODEL.md, SKILL.md, ARCHITECTURE.md
-- Security Baseline: OWASP ASVS 5.0.0 & Granular Row Level Security (RLS)
-- =============================================================================

-- Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically manage updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 1. PROFILES (Domain User)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 2. USER PREFERENCES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  streak_enabled BOOLEAN NOT NULL DEFAULT true, -- Streaks are optional per SKILL.md
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_own"
  ON public.user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_modtime
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. GOALS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'workout', 'discipline', 'mindset', 'rest', 'personal')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(user_id, status);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "goals_select_own"
  ON public.goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "goals_insert_own"
  ON public.goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update_own"
  ON public.goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_delete_own"
  ON public.goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_modtime
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4. ROUTINES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_of_day TEXT NOT NULL DEFAULT 'anytime' CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_routines_user ON public.routines(user_id);
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routines_select_own"
  ON public.routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "routines_insert_own"
  ON public.routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_update_own"
  ON public.routines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines_delete_own"
  ON public.routines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_routines_modtime
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 5. ROUTINE ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routine_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'workout', 'discipline', 'mindset', 'rest', 'personal')),
  task_template_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_routine_items_routine ON public.routine_items(routine_id);
ALTER TABLE public.routine_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routine_items_select_own"
  ON public.routine_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_items.routine_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "routine_items_insert_own"
  ON public.routine_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_items.routine_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "routine_items_update_own"
  ON public.routine_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_items.routine_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_items.routine_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "routine_items_delete_own"
  ON public.routine_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_items.routine_id AND r.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 6. HABITS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'workout', 'discipline', 'mindset', 'rest', 'personal')),
  target_per_day INTEGER NOT NULL DEFAULT 1,
  unit_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select_own"
  ON public.habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "habits_insert_own"
  ON public.habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_update_own"
  ON public.habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_delete_own"
  ON public.habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_habits_modtime
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 7. SCHEDULE RULES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'habit', 'routine')),
  entity_id UUID NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('daily', 'weekdays', 'weekends', 'weekly', 'custom_interval')),
  days_of_week INTEGER[], -- Array of 0..6
  interval_days INTEGER,
  preferred_time TEXT, -- HH:mm
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_schedule_rules_user ON public.schedule_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_rules_entity ON public.schedule_rules(entity_id);
ALTER TABLE public.schedule_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_rules_select_own"
  ON public.schedule_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "schedule_rules_insert_own"
  ON public.schedule_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedule_rules_update_own"
  ON public.schedule_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedule_rules_delete_own"
  ON public.schedule_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. TASKS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('foundation', 'workout', 'discipline', 'mindset', 'rest', 'personal')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  estimated_minutes INTEGER,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_tasks_user ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(user_id, category);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_tasks_modtime
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 9. TASK INSTANCES (Schedule Projections)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'rescheduled')),
  rescheduled_to_date DATE,
  skipped_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_task_instances_user_date ON public.task_instances(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_task_instances_task ON public.task_instances(task_id);
ALTER TABLE public.task_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_instances_select_own"
  ON public.task_instances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "task_instances_insert_own"
  ON public.task_instances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "task_instances_update_own"
  ON public.task_instances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "task_instances_delete_own"
  ON public.task_instances FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_task_instances_modtime
  BEFORE UPDATE ON public.task_instances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 10. COMPLETIONS (Canonical Fact Ledger)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'habit', 'routine_item')),
  entity_id UUID NOT NULL,
  task_instance_id UUID REFERENCES public.task_instances(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  value NUMERIC,
  notes TEXT,
  provenance TEXT NOT NULL DEFAULT 'user_click' CHECK (provenance IN ('user_click', 'scheduled_batch', 'sync_event', 'timer'))
);

CREATE INDEX IF NOT EXISTS idx_completions_user_completed_at ON public.completions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_completions_entity ON public.completions(entity_id);
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "completions_select_own"
  ON public.completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "completions_insert_own"
  ON public.completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "completions_update_own"
  ON public.completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "completions_delete_own"
  ON public.completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 11. STREAKS (Derived & Pause-Respecting)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL DEFAULT 'overall' CHECK (entity_type IN ('habit', 'goal', 'overall')),
  entity_id UUID,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  is_paused BOOLEAN NOT NULL DEFAULT false, -- Supports pausing without guilt/penalty
  paused_until DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_streaks_user ON public.streaks(user_id);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "streaks_select_own"
  ON public.streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "streaks_insert_own"
  ON public.streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streaks_update_own"
  ON public.streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "streaks_delete_own"
  ON public.streaks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_streaks_modtime
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 12. REWARDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('entertainment', 'rest', 'treat', 'personal')),
  cost_points INTEGER NOT NULL DEFAULT 0,
  is_redeemed BOOLEAN NOT NULL DEFAULT false,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON public.rewards(user_id);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rewards_select_own"
  ON public.rewards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "rewards_insert_own"
  ON public.rewards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rewards_update_own"
  ON public.rewards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rewards_delete_own"
  ON public.rewards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 13. ENTERTAINMENT RULES (Entertainment Gate)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.entertainment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  required_completed_tasks INTEGER NOT NULL DEFAULT 3,
  required_points INTEGER,
  is_gated BOOLEAN NOT NULL DEFAULT true,
  unlocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_entertainment_rules_user ON public.entertainment_rules(user_id);
ALTER TABLE public.entertainment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entertainment_rules_select_own"
  ON public.entertainment_rules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "entertainment_rules_insert_own"
  ON public.entertainment_rules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entertainment_rules_update_own"
  ON public.entertainment_rules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entertainment_rules_delete_own"
  ON public.entertainment_rules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_entertainment_rules_modtime
  BEFORE UPDATE ON public.entertainment_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 14. NOTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'web_push')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'dismissed', 'failed')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON public.notifications(user_id, status);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 15. SYNC EVENTS (Offline Reconciliation)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_mutation_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'complete', 'skip', 'reschedule')),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_events_user ON public.sync_events(user_id);
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_events_select_own"
  ON public.sync_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "sync_events_insert_own"
  ON public.sync_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sync_events_update_own"
  ON public.sync_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sync_events_delete_own"
  ON public.sync_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- AUTOMATIC SIGNUP PROVISIONING TRIGGER
-- Automatically seeds profile, preferences, and initial streak when auth user registers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  INSERT INTO public.streaks (user_id, entity_type, current_streak, longest_streak)
  VALUES (NEW.id, 'overall', 0, 0);

  INSERT INTO public.entertainment_rules (user_id, title, platform_name, required_completed_tasks)
  VALUES (NEW.id, 'Gerbang Hiburan Harian', 'YouTube & Game Santai', 3);

  RETURN NEW;
END;
$$;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
