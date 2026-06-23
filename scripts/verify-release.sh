#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> MR5 School v2.0.0 — release verification"
echo ""

echo "==> API: lint + test"
cd Mr5-School-API-main
if [ ! -d node_modules ]; then npm ci --silent; fi
npm run lint
NODE_ENV=test JWT_SECRET="test-jwt-secret-for-ci-only-min-32-chars" MONGO_URI="mongodb://127.0.0.1:27017/mr5-test" npm test
cd "$ROOT"

echo ""
echo "==> Web: lint + test + build"
cd client-main
if [ ! -d node_modules ]; then npm ci --silent; fi
npm run lint
npm test -- --passWithNoTests
NEXT_PUBLIC_API_URL="https://api.example.com" NEXT_PUBLIC_SITE_URL="https://app.example.com" npm run build
cd "$ROOT"

echo ""
echo "==> Web: E2E (CI profile, in-memory API)"
cd client-main
CI=true npm run test:e2e
cd "$ROOT"

echo ""
echo "✅ Release verification passed — enterprise deploy ready"
echo "   Deploy guide: AWS_FINAL_DEPLOY.md"
