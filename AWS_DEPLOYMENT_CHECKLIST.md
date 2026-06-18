# AWS Production Deployment Checklist

## Pre-deployment

- [ ] AWS account with billing alerts configured
- [ ] Domain registered (or transferred to Route 53)
- [ ] MongoDB Atlas cluster provisioned (production tier)
- [ ] Atlas network access: VPC peering or IP allowlist for NAT egress
- [ ] Third-party keys ready: Gemini, Stripe, Cloudinary, OpenWeather, LiveKit (as needed)
- [ ] GitHub repo secrets configured for OIDC deploy role

## IAM & secrets

- [ ] Create `mr5-ecs-execution-role` (ECR, logs, secrets read)
- [ ] Create `mr5-api-task-role` and `mr5-web-task-role` (minimal)
- [ ] Create GitHub OIDC provider + deploy role (ECR push, ECS update)
- [ ] Store secrets in Secrets Manager under `mr5/production/api` and `mr5/production/web`
- [ ] Never commit `.env` with real values

## Container registry

- [ ] Create ECR repositories: `mr5-api`, `mr5-web`
- [ ] Enable image scanning on push
- [ ] Lifecycle policy: keep last 10 images

## Networking

- [ ] VPC with public + private subnets (2 AZ minimum)
- [ ] NAT Gateway for private subnet egress
- [ ] Security groups: ALB → ECS only; ECS → outbound 443
- [ ] ALB target groups: web `:3000`, api `:5001`
- [ ] Health checks: `/` (web), `/health` (api)

## SSL & DNS

- [ ] ACM certificate for `app.mr5school.com` (regional)
- [ ] ACM certificate in **us-east-1** if using CloudFront
- [ ] Route 53 A/AAAA alias → ALB or CloudFront
- [ ] `api.mr5school.com` → API target group

## ECS

- [ ] Fargate cluster created
- [ ] Task definitions registered from `infra/aws/ecs/*.json.example` (customized)
- [ ] Services: `mr5-web` (desired count ≥ 1), `mr5-api` (desired count ≥ 1)
- [ ] Auto scaling policies (CPU 70% target)
- [ ] CloudWatch log groups: `/ecs/mr5-api`, `/ecs/mr5-web`

## Application config

- [ ] `NEXT_PUBLIC_API_URL=https://api.mr5school.com` (baked at Docker build)
- [ ] `NEXT_PUBLIC_SITE_URL=https://app.mr5school.com`
- [ ] `CORS_ORIGIN` and `CLIENT_URL` match frontend URL
- [ ] Stripe webhook URL: `https://api.mr5school.com/api/payments/webhook`
- [ ] Google OAuth callback matches `GOOGLE_CALLBACK_URL`

## CI/CD

- [ ] `.github/workflows/ci.yml` passes on `main`
- [ ] `.github/workflows/aws-deploy.yml` secrets set:
  - `AWS_ROLE_ARN`, `AWS_REGION`, `ECR_REPOSITORY_*`, `ECS_CLUSTER`, `ECS_SERVICE_*`
- [ ] Repository variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`
- [ ] First deploy: `workflow_dispatch` manual trigger

## Monitoring & reliability

- [ ] CloudWatch alarm: ALB 5xx > 10 in 5 min
- [ ] CloudWatch alarm: ECS unhealthy targets > 0
- [ ] CloudWatch alarm: API `/health` synthetic (optional Route 53 health check)
- [ ] Log retention set (30–90 days)
- [ ] Optional: WAF on ALB or CloudFront

## Post-deploy verification

- [ ] `curl https://api.mr5school.com/health` → 200
- [ ] Homepage loads over HTTPS
- [ ] Login flow works (cookies, CORS)
- [ ] Student dashboard routes load
- [ ] Classroom scene + weather panel
- [ ] `/sitemap.xml`, `/robots.txt` accessible
- [ ] No secrets in browser bundle (view source / network)
- [ ] Stripe test payment (if enabled)

## Rollback ready

- [ ] Previous ECR image tag documented
- [ ] ECS task definition revision noted before deploy
- [ ] `ROLLBACK.md` reviewed with team
