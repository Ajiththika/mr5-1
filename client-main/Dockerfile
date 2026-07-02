FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:5001
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

ENV DOCKER_BUILD=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Static assets: flat standalone (.next/static) or monorepo nested (client-main/.next/static)
COPY --from=builder /app/.next/static /tmp/next-static
RUN if [ -d "./client-main" ]; then \
      mkdir -p ./client-main/.next/static ./client-main/public && \
      cp -r /tmp/next-static/* ./client-main/.next/static/ && \
      cp -r ./public/* ./client-main/public/ 2>/dev/null || true; \
    else \
      mkdir -p ./.next/static && \
      cp -r /tmp/next-static/* ./.next/static/; \
    fi && \
    rm -rf /tmp/next-static && \
    chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>process.exit(r.statusCode<500&&d.includes('MR5')?0:1))}).on('error',()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
