# OrbitTasks Architecture

## Overview

OrbitTasks is a TypeScript monorepo with two applications.

## Backend

Location: apps/api/

The API uses Node.js, Express, and TypeScript.

It provides endpoints for authentication, tasks,
projects, workspaces, and reports.

The local API normally runs on port 3001.

## Frontend

Location: apps/web/

The frontend uses React and Vite.

During development, Vite proxies API requests
to the backend.

The web server normally runs on port 5173.

## Database

OrbitTasks uses a file-backed JSON database.

DATABASE_URL controls its location.

Automated tests use an in-memory database.

Initial local development requires database seeding.

## Development

Setup: make setup

Start application: make dev

Run tests: make test

Run local checks: make ci

## CI/CD

GitHub Actions handles dependency caching,
linting, type-checking, builds, and tests.

API tests run in two shards.
Web tests run in a separate job.

Detailed coverage is configured separately.

## Deployment

scripts/deploy.sh runs a simulated deployment.

The local application does not require Postgres,
Prisma, Docker, or AWS infrastructure.
