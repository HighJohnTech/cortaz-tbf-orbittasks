# AI Usage Policy: OrbitTasks Engineering

This policy keeps AI useful without transferring responsibility away from the engineer. It reflects the failures and gains measured in Workshop 5 and will be reviewed quarterly.

## Allowed without disclosure

- IDE autocomplete accepted inline while writing code.
- AI-assisted research that informs a design but does not produce shipped code.
- Refactoring suggestions that the engineer fully reviews, can explain, and verifies with tests.

## Requires disclosure in the pull request

Add an `ai-assisted` label and a one-line note describing the tool and scope when AI produces:

- Code blocks larger than approximately 10 lines.
- Test files or substantial test cases.
- Documentation, README, changelog, CI, or configuration changes.

## Requires an additional reviewer

- Authentication, authorization, security, secrets, or personal-data handling.
- CI/CD workflows, deployment logic, database migrations, or schema changes.
- Generated mocks that replace an external provider or contract.

## Not appropriate

Do not use AI to:

- Process or reproduce user-submitted secrets or personally identifiable information.
- Generate license headers, attribution, or legal text.
- Write commit messages or PR descriptions that misrepresent who understood and approved the work.
- Approve its own output or replace the accountable human reviewer.

## Required comprehension and verification

Before keeping AI-generated work, the engineer must:

1. State the assumptions and explain why the output works.
2. Run typecheck, lint, and the relevant tests.
3. Include at least one error-path test for generated logic.
4. Identify what could break if an input, dependency, or provider contract changes.
5. Keep deterministic mocks on the PR path and a smaller scheduled real-contract suite to detect mock drift.

AI-generated security-sensitive logic requires human-written or independently reviewed tests.

## Maintenance

Anyone may propose changes through a pull request. Material additions or removals require team agreement.
