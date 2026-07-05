#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ENV="$ROOT/Mr5-School-API-main/.env"
API_PORT="${PORT:-5001}"
WEB_PORT="${WEB_PORT:-3000}"

echo "==> MR5 School — Google OAuth verification"
echo ""

if [[ ! -f "$API_ENV" ]]; then
  echo "Missing Mr5-School-API-main/.env — run: cp Mr5-School-API-main/.env.example Mr5-School-API-main/.env"
  exit 1
fi

# shellcheck disable=SC1090
source /dev/null 2>/dev/null || true

has_id=false
has_secret=false
grep -q '^GOOGLE_CLIENT_ID=.\+' "$API_ENV" 2>/dev/null && has_id=true
grep -q '^GOOGLE_CLIENT_SECRET=.\+' "$API_ENV" 2>/dev/null && has_secret=true

if [[ "$has_id" != true || "$has_secret" != true ]]; then
  echo "⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set in Mr5-School-API-main/.env"
  echo "    See docs/GOOGLE_OAUTH_SETUP.md"
  echo ""
  echo "Running automated OAuth route tests (disabled mode)..."
  cd "$ROOT/Mr5-School-API-main" && npm test -- --testPathPatterns=oauth.test.js
  cd "$ROOT/client-main" && npm test -- lib/api-proxy.test.ts --passWithNoTests
  echo ""
  echo "Configure Google credentials, restart API, then re-run this script."
  exit 1
fi

callback_url=$(grep '^GOOGLE_CALLBACK_URL=' "$API_ENV" | cut -d= -f2- || true)
if [[ -z "$callback_url" ]]; then
  callback_url="http://localhost:${WEB_PORT}/api/auth/google/callback"
fi

echo "Configured callback: $callback_url"
echo "Google Console redirect URI must match exactly."
echo ""

echo "==> API unit tests (OAuth routes)"
cd "$ROOT/Mr5-School-API-main"
npm test -- --testPathPatterns=oauth.test.js

echo ""
echo "==> Web proxy unit tests"
cd "$ROOT/client-main"
npm test -- lib/api-proxy.test.ts --passWithNoTests

echo ""
echo "==> Live API checks (requires running API on port $API_PORT)"
if curl -sf "http://127.0.0.1:${API_PORT}/health" >/dev/null 2>&1; then
  providers=$(curl -sf "http://127.0.0.1:${API_PORT}/api/auth/providers")
  echo "Providers: $providers"
  if echo "$providers" | grep -q '"google":true'; then
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${API_PORT}/api/auth/google")
    echo "GET /api/auth/google → HTTP $status (expect 302)"
    if [[ "$status" != "302" ]]; then
      echo "❌ OAuth start did not redirect to Google"
      exit 1
    fi
    echo "✅ OAuth start redirects to Google"
  else
    echo "❌ API reports google provider disabled — restart API after setting .env"
    exit 1
  fi
else
  echo "API not running — start with: cd Mr5-School-API-main && npm run dev"
fi

echo ""
echo "✅ OAuth verification complete"
