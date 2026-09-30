# SKILL.md — Discipline-OS

## Purpose
Personal consistency/routine system: Foundation → Workout → Discipline → Notifications → Rewards → Entertainment Gate → Streak/Gamification.

## Goals
Build an auditable, production-minded system with clear domain boundaries, deterministic rules, real persistence where required, and explicit states.

## Non-goals
No punishment/shame, unsafe intensity escalation, deprivation/restriction, diagnosis, or health claims.

## Domain
User, Goal, Task, Habit, Routine, RoutineItem, ScheduleRule, TaskInstance, Completion, Streak, Reward, Notification, EntertainmentRule, UserPreference, optional SyncEvent.

## API
Tasks; habits; today; progress; rewards; notifications; settings; timezone-aware recurrence.

## Architecture
Next.js UI + deterministic scheduling engine + notification service + repository/sync → Postgres/Supabase → optional PWA/offline cache.

## Rules
User can pause/edit/skip/reschedule. Streaks optional and never shame users. Accessibility and reduced motion required.

## Workflow
Audit → domain model → smallest vertical slice → persistence → tests → security/privacy review → visual QA → delivery report.
