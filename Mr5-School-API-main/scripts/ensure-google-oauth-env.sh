#!/usr/bin/env bash
# Ensures Google OAuth env keys exist in Mr5-School-API-main/.env (does not print secrets).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
EXAMPLE="$ROOT/.env.example"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$EXAMPLE" "$ENV_FILE"
  echo "Created .env from .env.example"
fi

# Migrate legacy callback on port 5001 → 3000 (Next.js proxy)
if grep -q 'GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback' "$ENV_FILE" 2>/dev/null; then
  sed -i.bak 's|GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback|GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback|' "$ENV_FILE"
  rm -f "$ENV_FILE.bak"
  echo "Updated GOOGLE_CALLBACK_URL to use port 3000"
fi

append_if_missing() {
  local key="$1"
  local value="$2"
  if ! grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    echo "${key}=${value}" >> "$ENV_FILE"
    echo "Added ${key} to .env (set your value in the file)"
  fi
}

append_if_missing "GOOGLE_CLIENT_ID" ""
append_if_missing "GOOGLE_CLIENT_SECRET" ""
append_if_missing "GOOGLE_CALLBACK_URL" "http://localhost:3000/api/auth/google/callback"

echo "Done. Add Google credentials to .env — see docs/GOOGLE_OAUTH_SETUP.md"
