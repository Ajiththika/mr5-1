#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> MR5 School — local Docker production stack"
echo ""

API_ENV="$ROOT/Mr5-School-API-main/.env"
if [ ! -f "$API_ENV" ]; then
  echo "Creating Mr5-School-API-main/.env from .env.example ..."
  cp "$ROOT/Mr5-School-API-main/.env.example" "$API_ENV"
  echo ""
  echo "⚠️  Edit Mr5-School-API-main/.env — set MONGO_URI and JWT_SECRET (32+ chars) before login works."
  echo "    For quick local test without Atlas, leave MONGO_URI empty (in-memory DB)."
  echo ""
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop and retry."
  exit 1
fi

echo "==> Building and starting containers ..."
docker compose up --build -d

echo ""
echo "Waiting for health checks ..."
sleep 5

API_HEALTH=$(curl -sf "http://localhost:5000/health" 2>/dev/null || echo "pending")
WEB_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "http://localhost:3000/" 2>/dev/null || echo "000")

echo ""
echo "✅ Stack started"
echo "   Web:  http://localhost:3000  (HTTP $WEB_CODE)"
echo "   API:  http://localhost:5000/health"
echo "   Logs: npm run docker:logs"
echo ""
echo "Stop: npm run docker:down"
