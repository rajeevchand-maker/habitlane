# Habitlane Domain Model

Habitlane presents recurring work as a shared operating lane rather than a pile of chores. The demo workspace in this repo is intentionally fictional, but the model is designed to feel realistic enough that someone can adapt it for a home, studio, clinic, or small team.

## Members

- `lead`: owns the handoff layer and weekly planning moments
- `member`: carries recurring prep and maintenance work
- `support`: handles resets, restocks, and cleanup passes

Each member has:

- a default weekly schedule
- optional one-off schedule exceptions
- a focus area used in the UI to explain why certain routines belong to them

## Routines

Routines are defined as templates. Each template includes:

- an owner
- a lane (`reset`, `prep`, `care`, or `support`)
- a priority (`anchor`, `standard`, `flex`)
- a frequency (`daily`, `specific_days`, or `interval`)
- an expected outcome instead of just a task title

That outcome-first framing helps the demo read like a real operating system and gives AI coding agents a clearer adaptation surface when someone wants to swap in their own routines.

## Events

The demo uses lightweight status events to show believable variation:

- a few misses
- a few blocked tasks
- early completions on anchor routines

Everything else can be derived by the workflow engine. That keeps the seed data small while still giving the product enough texture to feel alive.
