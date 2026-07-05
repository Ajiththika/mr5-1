#!/usr/bin/env bash
# Align GOOGLE_CALLBACK_URL with backend PORT (default 5000).
set -euo pipefail

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
PORT="${PORT:-5000}"
CALLBACK="http://localhost:${PORT}/api/auth/google/callback"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "No .env at $ENV_FILE"
  exit 1
fi

if grep -q '^GOOGLE_CALLBACK_URL=' "$ENV_FILE"; then
  sed -i.bak "s|^GOOGLE_CALLBACK_URL=.*|GOOGLE_CALLBACK_URL=${CALLBACK}|" "$ENV_FILE"
  echo "Set GOOGLE_CALLBACK_URL=${CALLBACK}"
else
  echo "GOOGLE_CALLBACK_URL=${CALLBACK}" >> "$ENV_FILE"
  echo "Appended GOOGLE_CALLBACK_URL=${CALLBACK}"
fi

if grep -q '^PORT=' "$ENV_FILE"; then
  sed -i.bak "s|^PORT=.*|PORT=${PORT}|" "$ENV_FILE"
else
  echo "PORT=${PORT}" >> "$ENV_FILE"
fi

rm -f "${ENV_FILE}.bak"
