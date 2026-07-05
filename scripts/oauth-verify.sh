#!/usr/bin/env bash
# Verify Google OAuth redirect_uri matches .env and Google Console requirements.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_ENV="$ROOT/Mr5-School-API-main/.env"
WEB_ENV="$ROOT/client-main/.env"

PORT=$(grep -E '^PORT=' "$API_ENV" | cut -d= -f2- | tr -d '\r' || echo "5000")
CALLBACK=$(grep -E '^GOOGLE_CALLBACK_URL=' "$API_ENV" | cut -d= -f2- | tr -d '\r')
API_URL=$(grep -E '^NEXT_PUBLIC_API_URL=' "$WEB_ENV" | cut -d= -f2- | tr -d '\r' || echo "http://localhost:5000")
EXPECTED="http://localhost:${PORT}/api/auth/google/callback"

echo "PORT=$PORT"
echo "GOOGLE_CALLBACK_URL=$CALLBACK"
echo "NEXT_PUBLIC_API_URL=$API_URL"
echo "EXPECTED=$EXPECTED"

if [[ "$CALLBACK" != "$EXPECTED" ]]; then
  echo "FAIL: GOOGLE_CALLBACK_URL must equal $EXPECTED"
  exit 1
fi

if [[ "$API_URL" != "http://localhost:${PORT}" ]]; then
  echo "FAIL: NEXT_PUBLIC_API_URL must equal http://localhost:${PORT}"
  exit 1
fi

if ! curl -sf "http://127.0.0.1:${PORT}/api/auth/providers" >/dev/null; then
  echo "FAIL: API not reachable on port $PORT (disable AirPlay Receiver if port is 5000)"
  exit 1
fi

LOC=$(curl -sI "http://127.0.0.1:${PORT}/api/auth/google" | grep -i '^location:' | sed 's/[Ll]ocation: //' | tr -d '\r')
REDIRECT_URI=$(python3 -c "import urllib.parse,sys; print(urllib.parse.unquote(urllib.parse.parse_qs(urllib.parse.urlparse(sys.argv[1]).query).get('redirect_uri',[''])[0]))" "$LOC")

echo "RUNTIME redirect_uri=$REDIRECT_URI"

if [[ "$REDIRECT_URI" != "$EXPECTED" ]]; then
  echo "FAIL: runtime redirect_uri mismatch"
  exit 1
fi

echo "PASS: OAuth redirect_uri is correct"
echo "Google Console must list exactly: $EXPECTED"
