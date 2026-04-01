# Habitlane Architecture

Habitlane is intentionally small. The goal is to make the recurring-work model teachable and adaptable before layering on storage, auth, or integrations.

## Flow

1. `src/lib/demo/workspace.ts`
   Creates a fictional workspace with members, schedules, routines, and status events.
2. `src/lib/habitlane/engine.ts`
   Decides which routines materialize on a date, whether a member is working, and where unfinished work rolls next.
3. `src/lib/habitlane/insights.ts`
   Computes completion pace, streaks, carryovers, and blocked-work pressure from the materialized day plans.
4. `src/lib/habitlane/demo.ts`
   Builds the UI-facing snapshot used by the routes.
5. `src/app/*`
   Renders the daily agenda, routine library, and insight views.

## Core Ideas

- schedules matter
  A routine only appears if the assigned member is actually working that day.
- carryovers stay explicit
  Unfinished work rolls forward to the next working day unless the base routine would already re-create it.
- blocked work is visible, not invisible
  The product shows blocked tasks without treating them exactly the same as a true miss.
- the demo is data, not hardcoded markup
  The UI is driven by a domain model that someone can replace with their own fixture set.

## Why There Is No Database Yet

The first public version is meant to teach the product shape and adaptation path. Persistence can come later without changing the mental model:

- members and schedules
- recurring routines
- status events
- materialized day plans

Those are the seams a future database layer would need to back.
