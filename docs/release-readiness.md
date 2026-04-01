# Habitlane Release Readiness

## Summary

`habitlane` is ready for a first tagged release candidate.

Recommended first public tag:
- `v0.1.0`

## What Is Ready

- Product framing is clear in the README.
- The daily agenda, routine library, and insights views are implemented.
- Demo mode uses a fictional workspace with publishable schedules and routines.
- Demo-safe poster and social-preview assets exist in `demo/`.
- `LICENSE`, `SECURITY.md`, and `CONTRIBUTING.md` are present.
- CI is defined in `.github/workflows/ci.yml`.
- Local verification passes:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `npm audit --json`

## Launch Assets

- Daily poster: `demo/habitlane-daily-poster.svg`
- Social preview asset: `demo/habitlane-social-preview.svg`

## Remaining Manual Steps Before Public Launch

1. Review the repo visibility decision one final time.
2. Upload the prepared social preview asset in GitHub settings.
3. Tag the release as `v0.1.0`.
4. Flip the repo public only after those steps are complete.

## Release Decision

Current recommendation:
- treat the repo as launch-ready pending the final manual GitHub settings pass
