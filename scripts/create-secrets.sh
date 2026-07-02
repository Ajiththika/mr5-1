#!/usr/bin/env bash
# =============================================================================
# MR5 School — AWS Secrets Manager bootstrap
# =============================================================================
# Usage:
#   ./scripts/create-secrets.sh prod
#   ./scripts/create-secrets.sh staging
#   ./scripts/create-secrets.sh dev
#
# NEVER paste real secrets into this script or commit them.
# You will be prompted to enter values interactively OR pass REPLACE_ME placeholders
# and update via AWS Console / CLI later.
# =============================================================================
set -euo pipefail

ENVIRONMENT="${1:-}"
if [[ -z "${ENVIRONMENT}" ]] || [[ ! "${ENVIRONMENT}" =~ ^(prod|staging|dev)$ ]]; then
  echo "Usage: $0 <prod|staging|dev>"
  exit 1
fi

PREFIX="mr5-school/${ENVIRONMENT}"
REGION="${AWS_REGION:-us-east-1}"

create_secret() {
  local name="$1"
  local description="$2"
  local full_name="${PREFIX}/${name}"

  if aws secretsmanager describe-secret --secret-id "${full_name}" --region "${REGION}" &>/dev/null; then
    echo "SKIP (exists): ${full_name}"
    return 0
  fi

  aws secretsmanager create-secret \
    --region "${REGION}" \
    --name "${full_name}" \
    --description "${description}" \
    --secret-string "REPLACE_ME"

  echo "CREATED: ${full_name} — update value before deploying"
}

echo "==> Creating MR5 School secrets under ${PREFIX}/ (region: ${REGION})"
echo "    Replace REPLACE_ME values before production use."
echo ""

# API secrets
create_secret "mongo-uri" "MongoDB Atlas connection string"
create_secret "jwt-secret" "JWT signing secret (min 32 chars)"
create_secret "gemini-api-key" "Google Gemini API key"
create_secret "openai-api-key" "OpenAI API key (optional)"
create_secret "weather-api-key" "OpenWeather API key"
create_secret "stripe-secret-key" "Stripe secret key"
create_secret "stripe-webhook-secret" "Stripe webhook signing secret"
create_secret "cloudinary-api-secret" "Cloudinary API secret"
create_secret "cloudinary-api-key" "Cloudinary API key"
create_secret "google-client-secret" "Google OAuth client secret"
create_secret "livekit-api-secret" "LiveKit API secret"
create_secret "email-pass" "SMTP / email app password"
create_secret "smtp-pass" "SMTP password (if separate)"
create_secret "azure-speech-key" "Azure Cognitive Services speech key"
create_secret "avathor-secret-token" "Avathor integration token"
create_secret "consent-ip-salt" "Salt for consent IP hashing"

echo ""
echo "==> Done. Update secrets:"
echo "    aws secretsmanager put-secret-value --secret-id ${PREFIX}/jwt-secret --secret-string 'YOUR_NEW_VALUE'"
echo ""
echo "See docs/AWS_SECRETS_MIGRATION.md for ECS task definition ARNs."
