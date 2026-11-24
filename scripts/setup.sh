#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[setup] Starting OrbitTasks setup..."

mkdir -p logs

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[setup] Created .env"
else
  echo "[setup] Existing .env preserved"
fi

set -a
source .env
set +a

: "${JWT_SECRET:?JWT_SECRET is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"

echo "[setup] Installing dependencies..."
npm ci --no-audit --no-fund

DB_PATH="${DATABASE_URL#file:}"

if [[ "$DB_PATH" = /* ]]; then
  DB_FILE="$DB_PATH"
else
  DB_FILE="$ROOT_DIR/apps/api/$DB_PATH"
fi

if [[ ! -f "$DB_FILE" ]]; then
  echo "[setup] Seeding database..."
  npm run seed --workspace=apps/api
else
  echo "[setup] Existing database preserved"
fi

echo "[setup] OrbitTasks setup complete!"
