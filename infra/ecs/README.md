# ECS Fargate — MR5 School

Production task definitions for AWS ECS Fargate behind an Application Load Balancer.

## Files

| File | Service | Port | CPU / Memory |
|------|---------|------|--------------|
| `mr5-api-task-definition.json` | Express API | 5001 | 512 / 1024 MB |
| `mr5-web-task-definition.json` | Next.js (optional) | 3000 | 1024 / 2048 MB |

> **Recommended:** Host Next.js on **Vercel** and run only `mr5-api` on ECS. See `docs/VERCEL_ENVIRONMENT.md`.

## Prerequisites

1. Replace placeholders: `ACCOUNT_ID`, `REGION`, ECR image URIs.
2. Create secrets: `./scripts/create-secrets.sh prod`
3. Attach IAM policy `infra/iam/ecs-secrets-policy.json` to `mr5-ecs-execution-role`.
4. Create CloudWatch log groups `/ecs/mr5-api` and `/ecs/mr5-web`.

## Register task definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://infra/ecs/mr5-api-task-definition.json

aws ecs register-task-definition \
  --cli-input-json file://infra/ecs/mr5-web-task-definition.json
```

## ALB integration

```
Internet → ALB (HTTPS :443)
  ├── Target group: mr5-api-tg → ECS service mr5-api (port 5001)
  │     Health check: GET /health (200)
  └── Target group: mr5-web-tg → ECS service mr5-web (port 3000) [optional]
        Health check: GET / (200)
```

### Recommended health checks

| Service | Path | Interval | Healthy threshold |
|---------|------|----------|-------------------|
| API | `/health` | 30s | 2 |
| API (container) | `/ready` | 30s | 2 |
| Web | `/` | 30s | 2 |

## Security groups

### ALB (`sg-alb`)

| Direction | Port | Source | Purpose |
|-----------|------|--------|---------|
| Inbound | 443 | 0.0.0.0/0 | HTTPS |
| Inbound | 80 | 0.0.0.0/0 | Redirect to 443 |
| Outbound | 5001 | `sg-ecs-api` | API tasks |
| Outbound | 3000 | `sg-ecs-web` | Web tasks |

### ECS API (`sg-ecs-api`)

| Direction | Port | Source | Purpose |
|-----------|------|--------|---------|
| Inbound | 5001 | `sg-alb` | ALB only |
| Outbound | 443 | 0.0.0.0/0 | Atlas, Stripe, Gemini APIs |
| Outbound | 27017 | Atlas SG / peering | MongoDB (if private) |

### ECS Web (`sg-ecs-web`)

| Direction | Port | Source | Purpose |
|-----------|------|--------|---------|
| Inbound | 3000 | `sg-alb` | ALB only |
| Outbound | 443 | 0.0.0.0/0 | API, CDN |

**No public IPs on tasks** — use private subnets + NAT gateway.

## Auto scaling

```bash
# API service — target tracking on CPU
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/mr5-production/mr5-api \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --policy-name mr5-api-cpu-target \
  --service-namespace ecs \
  --resource-id service/mr5-production/mr5-api \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

## Secrets

All sensitive values use `valueFrom` ARNs — see `docs/AWS_SECRETS_MIGRATION.md`.

Legacy examples remain in `infra/aws/ecs/` for backward compatibility.
