# CI/CD Governance: OrbitTasks Engineering

These rules protect the speed improvements from Workshops 1-6 without weakening release safety.

## Required

- Every pull request must run `.github/workflows/ci.yml` before merge.
- Required CI includes lint, typecheck, API tests, web tests, and both application builds.
- Dependency caching must be enabled where applicable.
- Pull-request tests use deterministic SDK mocks; a scheduled integration workflow protects against provider-contract drift.
- Deployment remains blocked until all required checks pass.
- `main` requires passing CI and review before merge.

## Recommended

- Use parallel jobs or a test matrix when total runtime exceeds five minutes.
- Keep long-running real-provider tests outside the routine PR workflow.
- Measure median and p95 CI duration over at least 10 runs before claiming an improvement.
- Compare equivalent environments and label cold-cache, warm-cache, local, and CI measurements.

## Forbidden

- Force-pushing directly to `main` to bypass review or checks.
- Merging while required checks are failing.
- Using `xit`, `xdescribe`, `.skip`, or equivalent without a tracked issue and owner.
- Disabling coverage, security, or contract validation without an approved replacement.
- Reporting a failed or non-equivalent run as a successful end-to-end improvement.

## Enforcement

- The pull-request template requires verification evidence and AI disclosure.
- GitHub Actions is the source of truth for required checks.
- Branch protection on `main` should require the CI jobs and review.
- Violations are corrected in review and discussed in retrospective when systemic.

## Current measurable targets

- Green median CI duration: 360 seconds or less over 10 PR runs.
- CI p95 duration: 480 seconds or less.
- API Jest time with deterministic mocks: under 10 seconds across 20 repeated runs.
- Full setup and verified working application: under 10 minutes for three unfamiliar developers.
