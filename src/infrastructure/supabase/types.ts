export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: 'system' | 'light' | 'dark';
          reduced_motion: boolean;
          streak_enabled: boolean;
          notifications_enabled: boolean;
          sound_enabled: boolean;
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'system' | 'light' | 'dark';
          reduced_motion?: boolean;
          streak_enabled?: boolean;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'system' | 'light' | 'dark';
          reduced_motion?: boolean;
          streak_enabled?: boolean;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          status: string;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          status?: string;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          status?: string;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          routine_id: string | null;
          title: string;
          description: string | null;
          category: string;
          priority: string;
          estimated_minutes: number | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_id?: string | null;
          routine_id?: string | null;
          title: string;
          description?: string | null;
          category: string;
          priority?: string;
          estimated_minutes?: number | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_id?: string | null;
          routine_id?: string | null;
          title?: string;
          description?: string | null;
          category?: string;
          priority?: string;
          estimated_minutes?: number | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      task_instances: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          scheduled_date: string;
          scheduled_time: string | null;
          status: string;
          rescheduled_to_date: string | null;
          skipped_reason: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          scheduled_date: string;
          scheduled_time?: string | null;
          status?: string;
          rescheduled_to_date?: string | null;
          skipped_reason?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          scheduled_date?: string;
          scheduled_time?: string | null;
          status?: string;
          rescheduled_to_date?: string | null;
          skipped_reason?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      completions: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          task_instance_id: string | null;
          completed_at: string;
          value: number | null;
          notes: string | null;
          provenance: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          task_instance_id?: string | null;
          completed_at?: string;
          value?: number | null;
          notes?: string | null;
          provenance?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          entity_id?: string;
          task_instance_id?: string | null;
          completed_at?: string;
          value?: number | null;
          notes?: string | null;
          provenance?: string;
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          entity_id: string | null;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          is_paused: boolean;
          paused_until: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type?: string;
          entity_id?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          is_paused?: boolean;
          paused_until?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          entity_id?: string | null;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          is_paused?: boolean;
          paused_until?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      entertainment_rules: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          platform_name: string;
          required_completed_tasks: number;
          required_points: number | null;
          is_gated: boolean;
          unlocked_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          platform_name: string;
          required_completed_tasks?: number;
          required_points?: number | null;
          is_gated?: boolean;
          unlocked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          platform_name?: string;
          required_completed_tasks?: number;
          required_points?: number | null;
          is_gated?: boolean;
          unlocked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          cost_points: number;
          is_redeemed: boolean;
          redeemed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category: string;
          cost_points?: number;
          is_redeemed?: boolean;
          redeemed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          cost_points?: number;
          is_redeemed?: boolean;
          redeemed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
