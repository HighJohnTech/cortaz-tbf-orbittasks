# OrbitTasks

OrbitTasks is a sample project-management application used
for CI/CD and developer-experience engineering in the
Build Fellowship.

## Technology Stack

- API: Node.js, Express, TypeScript
- Web: React, Vite, TypeScript
- Database: File-backed JSON
- Testing: Jest and Vitest
- CI/CD: GitHub Actions

## Requirements

- Node.js 20 or newer
- npm
- Bash
- GNU Make (recommended)

## Setup

Clone the repository:

```bash
git clone https://github.com/HighJohnTech/cortaz-tbf-orbittasks.git
cd cortaz-tbf-orbittasks
```

Run setup:

```bash
make setup
```

If Make is unavailable:

```bash
bash scripts/setup.sh
```

Setup creates the local environment configuration,
installs dependencies, and seeds a missing database.

## Environment Variables

The application uses:

- PORT: Local API port, default 3001
- NODE_ENV: Application environment
- JWT_SECRET: Secret for authentication tokens
- DATABASE_URL: JSON database location

Copy .env.example to .env for local development.

Replace the sample JWT secret before deployment.
Do not commit your .env file.

## Start Development

```bash
make dev
```

This starts the API and web servers.

API: http://localhost:3001
API health check: http://localhost:3001/health
Web: http://localhost:5173

## Demo Data

The setup process initializes a missing local database.

Demo email: demo@orbittasks.local
Demo password: Password123

These credentials are only for the sample application.

To manually reset demo data, load the environment and run:

```bash
set -a
source .env
set +a
npm run seed --workspace=apps/api
```

Warning: Reseeding resets the sample database.

## Tests

```bash
make test
```

Some workshop tests intentionally include timing-related
failures that require further investigation.

## Local CI Checks

```bash
make ci
```

GitHub Actions runs additional checks for repository
pushes and pull requests.

## Coverage

Detailed coverage is configured separately in:

.github/workflows/coverage.yml

## Simulated Deployment

```bash
npm run deploy
```

This runs the workshop's simulated deployment process.

## Architecture

See docs/architecture.md.
