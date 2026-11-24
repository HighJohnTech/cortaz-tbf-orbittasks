# Coding Standards: OrbitTasks Engineering

Automate objective rules and keep judgment-heavy rules in review.

## Auto-enforced

- Linting: the repository ESLint configuration must pass.
- Type safety: `tsc --noEmit` must pass for each workspace.
- Tests: relevant API and web tests must pass in CI.
- Builds: both application builds must complete before deployment.
- Skipped tests are rejected unless linked to a tracked issue.

Coverage remains a measured target until the scheduled coverage workflow is verified; it must not be presented as an enforced gate before then.

## Review-enforced conventions

### Naming

- Files use `kebab-case.ts` or the established framework convention.
- Variables and functions use `camelCase`.
- Types and interfaces use `PascalCase`.
- Configuration constants use `SCREAMING_SNAKE_CASE`.

### Structure

- Pure transformations are extracted into helpers named for what they produce.
- Side effects such as database writes and notifications are isolated.
- Comments explain why, assumptions, or risk rather than restating the code.
- Errors are explicit in behavior and types.

### Tests

- Tests describe behavior and include relevant failure paths.
- Generated tests must include at least one error path per function.
- Deterministic mocks may replace network calls on the PR path, but real-contract coverage must exist separately.
- A passing unrelated test is not evidence for an untested route or behavior.

## Deliberately not enforced

- Arbitrary file-length or function-length limits.
- A fixed comment density.
- Formatting rules not yet backed by a repository formatter.
