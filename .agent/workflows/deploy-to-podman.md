---
description: Deploy DuckSnapAnalytics to Podman server with all features
---

# 🚀 Full Server Deployment

Deploy complete DuckSnapAnalytics stack to Podman server at `74.208.227.161`.

## Features Being Deployed

- PayPal subscription payments (sandbox)
- Email verification system
- All existing analytics features
- Dev environment setup

## Prerequisites

1. SSH access to server: `cira@74.208.227.161`
2. Podman/podman-compose installed
3. DNS configured: `dev.duckshotanalytics.com` → `74.208.227.161`

## Deployment Steps

// turbo-all

### 1. SSH into Server

```bash
ssh cira@74.208.227.161
```

### 2. Create Environment File

```bash
cat > /home/cira/.env.podman << 'EOF'
# Database
POSTGRES_USER=duckshot
POSTGRES_PASSWORD=change_this_password

# Redis
REDIS_PASSWORD=change_this_redis_password

# Admin
ADMIN_EMAIL=admin@duckshotanalytics.com

# PayPal Sandbox (Development)
PAYPAL_SANDBOX_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_SANDBOX_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_DEV_MONTHLY_PLAN=P-7CG40635HU801524CNE5EHHI
PAYPAL_DEV_YEARLY_PLAN=P-9A17911506902021RNE5EHHQ

# Snapchat Staging
SNAPCHAT_STAGING_CLIENT_ID=45b2bc0d-7cf4-406c-8c59-11363c9bcd54
SNAPCHAT_STAGING_SECRET=bd68124e-bf81-42ea-8650-668529465ebb

# Session (Dev)
DEV_SESSION_SECRET=dev_session_12345_change_me
EOF
```

### 3. Clone Dev Repository

```bash
cd /home/cira
git clone https://github.com/DuckshotPro/DuckSnapAnalytics.git dev-DuckSnapAnalytics
cd dev-DuckSnapAnalytics
```

### 4. Create Dev Database

```bash
sudo -u postgres psql << 'SQL'
CREATE DATABASE duckshot_dev;
GRANT ALL PRIVILEGES ON DATABASE duckshot_dev TO duckshot;
\q
SQL
```

### 5. Add Dev Container to docker-compose.new.yml

```bash
cat >> /home/cira/docker-compose.new.yml <<'YAML'

  # ═════════════════════════════════════════════════════  
  # DuckShot Analytics - DEV Environment
  # ═════════════════════════════════════════════════════
  site-duckshotanalytics-dev:
    build:
      context:  /home/cira/dev-DuckSnapAnalytics
      dockerfile: Dockerfile
    container_name: site-duckshotanalytics-dev
    restart: always
    networks:
      - web-net
      - services-net
    depends_on:
      - dp1-db01
      - dp1-redis01
    environment:
      - VIRTUAL_HOST=dev.duckshotanalytics.com
      - VIRTUAL_PORT=5000
      - LETSENCRYPT_HOST=dev.duckshotanalytics.com
      - LETSENCRYPT_EMAIL=${ADMIN_EMAIL}
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@dp1-db01:5432/duckshot_dev
      - REDIS_URL=redis://:${REDIS_PASSWORD}@dp1-redis01:6379/1
      - NODE_ENV=development
      - PORT=5000
      - APP_URL=https://dev.duckshotanalytics.com
      - SESSION_SECRET=${DEV_SESSION_SECRET}
      - PAYPAL_CLIENT_ID=${PAYPAL_SANDBOX_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_SANDBOX_SECRET}
      - PAYPAL_MODE=sandbox
      - PAYPAL_MONTHLY_PLAN_ID=${PAYPAL_DEV_MONTHLY_PLAN}
      - PAYPAL_YEARLY_PLAN_ID=${PAYPAL_DEV_YEARLY_PLAN}
      - VITE_PAYPAL_CLIENT_ID=${PAYPAL_SANDBOX_CLIENT_ID}
      - VITE_PAYPAL_MONTHLY_PLAN_ID=${PAYPAL_DEV_MONTHLY_PLAN}
      - VITE_PAYPAL_YEARLY_PLAN_ID=${PAYPAL_DEV_YEARLY_PLAN}
      - SMTP_HOST=localhost
      - SMTP_PORT=1025
      - EMAIL_FROM=DuckShot Analytics <noreply@dev.duckshotanalytics.com>
      - SNAPCHAT_CLIENT_ID=${SNAPCHAT_STAGING_CLIENT_ID}
      - SNAPCHAT_CLIENT_SECRET=${SNAPCHAT_STAGING_SECRET}
YAML
```

### 6. Deploy Container

```bash
cd /home/cira
podman-compose -f docker-compose.new.yml --env-file .env.podman up -d --build site-duckshotanalytics-dev
```

### 7. Verify Deployment

```bash
# Check container
podman ps | grep duckshotanalytics-dev

# Check logs
podman logs -f site-duckshotanalytics-dev

# Test URL
curl -I https://dev.duckshotanalytics.com
```

## Expected Results

- ✅ Container running
- ✅ HTTPS accessible at `https://dev.duckshotanalytics.com`
- ✅ PayPal buttons visible on `/pricing`
- ✅ No errors in logs

## Troubleshooting

**Container won't start:**
```bash
podman logs site-duckshotanalytics-dev
```

**Rebuild needed:**
```bash
podman-compose -f docker-compose.new.yml build --no-cache site-duckshotanalytics-dev
podman-compose -f docker-compose.new.yml up -d site-duckshotanalytics-dev
```

**Test locally first:**
```bash
cd dev-DuckSnapAnalytics
npm install
npm run dev
```

## Update Deployment

After pushing code changes:

```bash
cd /home/cira/dev-DuckSnapAnalytics
git pull origin main
podman restart site-duckshotanalytics-dev
```
