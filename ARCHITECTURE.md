# ARCHITECTURE.md — Discipline-OS

Next.js UI + deterministic scheduling engine + notification service + repository/sync → Postgres/Supabase → optional PWA/offline cache.

Keep UI, domain/application services, persistence, external adapters, security and tests separated. Integrations stay behind adapters.
