# Figma Design System & Layout Plan — Discipline-OS

Aligned with `DESIGN.md` and `IMAGE_PLAN.md`.

## 1. File Structure
- **Page 1: Foundations (Design Tokens)**
  - Variables Collection: `Color` (Modes: Light, Dark)
    - `--background`, `--surface`, `--surface-subtle`, `--border`
    - Semantic Accents: `--accent-foundation`, `--accent-workout`, `--accent-discipline`, `--accent-rewards`, `--accent-rest`
    - Feedback: Success, Warning, Info, Neutral
  - Typography Scales:
    - Display (`text-3xl`, 32px / bold)
    - Section Heading (`text-xl`, 20px / semibold)
    - Body (`text-base`, 16px / regular)
    - Caption / Meta (`text-sm`, 14px / regular)
    - Tabular Digits (`font-mono`)
  - Spacing & Touch Ergonomics:
    - 4px baseline grid
    - Minimum interactive target: 48x48px

- **Page 2: Component Library**
  - Buttons (Primary, Secondary, Ghost, Icon-Only with `sr-only` labels)
  - Task & Routine Card (States: `pending`, `in_progress`, `completed`, `skipped`, `rescheduled`)
  - Category Badge (Foundation, Workout, Discipline, Rewards)
  - Streak Widget (Gentle, pause-respecting, toggleable)
  - Modal / Dialog (Keyboard trapped, accessible dismiss)
  - State Containers (Loading skeleton, Empty state with encouragement, Error alert)

- **Page 3: Landing & Entry Page**
  - Hero Section: Calm, focused study/desk workspace atmosphere (no aggressive hype or body-focused imagery).
  - Core Value Proposition: Structured consistency without punishment or guilt.
  - Interactive Preview / Call to Action.

- **Page 4: Core Workflow: Today Dashboard**
  - Header: Current Date, Timezone indicator, Gentle Streak badge (if enabled).
  - Routine & Task Pipeline: Morning, Afternoon, Evening, Anytime.
  - Interactive Actions: Check off (complete), Reschedule to tomorrow, Skip with neutral reason, Pause routine.
  - Entertainment Gate Indicator: Transparent unlock status based on completed tasks.

- **Page 5: Responsive Breakpoints & States**
  - Mobile: 375px (Single column, sticky bottom navigation or easy tap controls)
  - Tablet: 768px (Side rail navigation)
  - Desktop: 1200px+ (Balanced workspace layout with side details)
  - States: Default, Hover, Focus-visible, Loading, Empty, Error, Success toast.
