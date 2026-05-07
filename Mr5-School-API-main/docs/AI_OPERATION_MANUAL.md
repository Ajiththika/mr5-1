# Webe Advanst LMS - AI Operation Manual

## Overview
This document outlines the operational procedures for the AI features in the LMS, including the AI Coach, Auto-Grading, and Course Summaries.

## 1. Security & Infrastructure

### API Keys
- The system uses a single server-side `OPENAI_API_KEY`.
- **NEVER** commit this key to version control.
- Keys should be rotated every 90 days or immediately upon suspected compromise.
- Use `scripts/rotate-keys.sh` to update the key in the `.env` file.

### Rate Limiting
- The `/api/ai/*` endpoints are protected by a rate limiter to prevent abuse.
- Monitoring logs should be checked for `429 Too Many Requests` errors to adjust limits if needed.

## 2. API Endpoints (OpenAPI Spec)

### POST /api/ai/chat
- **Description**: Proxy for OpenAI Chat Completion.
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "messages": [{"role": "user", "content": "Hello"}],
    "options": {"model": "gpt-4"}
  }
  ```

### POST /api/ai/grade
- **Description**: Auto-grade text against a rubric.
- **Body**:
  ```json
  {
    "answer": "Student answer text...",
    "rubric": "Rubric details..."
  }
  ```
- **Response**: Returns score, strengths, weaknesses, and manual review flag.

### POST /api/ai/summary
- **Description**: Generate summary and quiz from content.
- **Access**: Instructor/Admin only.

## 3. Monitoring & Billing
- **Usage Logging**: Check server logs (`npm run logs` or standard output) for `[AI Service]` entries.
- **Cost Control**: Set a hard monthly limit in your OpenAI Dashboard (https://platform.openai.com/account/billing/limits).
- **Alerts**: Configure OpenAI to email admins at 50% and 80% usage thresholds.

## 4. Troubleshooting
- **500 Errors**: Check if the `OPENAI_API_KEY` is valid and has credit.
- **401 Unauthorized**: Ensure the user is logged in and the JWT is valid.
- **Streaming Issues**: Ensure the client handles Server-Sent Events (SSE) correctly.
