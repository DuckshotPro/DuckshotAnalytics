# 🎯 PayPal Integration Deployment Guide

## ✅ Completed Tasks

### 1. PayPal Subscription Plans Created
- **Monthly Plan:** `P-7CG40635HU801524CNE5EHHI` - $19.99/month
- **Yearly Plan:** `P-9A17911506902021RNE5EHHQ` - $191.90/year  
- **Product ID:** `PROD-1U316450TW459990L`

### 2. Code Changes
- ✅ PayPal integration complete
- ✅ Environment variables configured
- ✅ All code pushed to GitHub (`main` branch)
- ✅ Tested locally - working perfectly

### 3. Local Testing
- ✅ Server runs successfully
- ✅ Pricing page displays PayPal buttons
- ✅ Ready for production deployment

---

## 🚀 Deploy to Server (74.208.227.161)

### Option A: Manual Deployment (Recommended - Server Not Set Up Yet)

Since the Podman containers aren't created yet, follow the full setup:

```bash
# 1. SSH into server
ssh cira@74.208.227.161

# 2. Clone or update repository
cd /home/cira
if [ ! -d "dev-DuckSnapAnalytics" ]; then
    git clone https://github.com/DuckshotPro/DuckSnapAnalytics.git dev-DuckSnapAnalytics
fi
cd dev-DuckSnapAnalytics
git pull origin main

# 3. Create complete .env file
cat > .env << 'EOF'
# Database - Will be injected by Docker Compose
# DATABASE_URL will be set by container environment

# Session Secret (Auto-generated)
SESSION_SECRET=4IDb15HHFBOw8M/sh3Yr2OmYW2/35hBGDmDrC2+EuSI=

# App URL
APP_URL=https://dev.duckshotanalytics.com

# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_CLIENT_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_MODE=sandbox
PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

# PayPal Client-Side Keys (VITE_ prefix for frontend)
VITE_PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
VITE_PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
VITE_PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

# Optional: Snapchat (leave blank for mock data in dev)
# SNAPCHAT_CLIENT_ID=
# SNAPCHAT_CLIENT_SECRET=
EOF

# 4. Follow SETUP_DEV_NOW.md to create container
# This requires editing docker-compose.new.yml and creating the container
# See: /home/cira/DuckSnapAnalytics/SETUP_DEV_NOW.md
```

### Option B: Quick Script Deployment (When Container Exists)

```bash
ssh cira@74.208.227.161 << 'ENDSSH'
cd /home/cira/dev-DuckSnapAnalytics
git pull origin main
podman restart site-duckshotanalytics-dev
ENDSSH
```

---

## 🔍 Verify Deployment

### 1. Check DNS
```bash
nslookup dev.duckshotanalytics.com
# Should return: 74.208.227.161
```

### 2. Check Container
```bash
ssh cira@74.208.227.161
podman logs -f site-duckshotanalytics-dev
```

### 3. Test in Browser
Visit: **https://dev.duckshotanalytics.com/pricing-page**

You should see:
- ✅ Beautiful pricing page
- ✅ PayPal Subscribe buttons on Premium plan
- ✅ SSL certificate valid
- ✅ No console errors

---

## 📋 Environment Variables Reference

### Required for Server:
```env
DATABASE_URL=<injected by docker-compose>
SESSION_SECRET=4IDb15HHFBOw8M/sh3Yr2OmYW2/35hBGDmDrC2+EuSI=
APP_URL=https://dev.duckshotanalytics.com

PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_CLIENT_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_MODE=sandbox
PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

VITE_PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
VITE_PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
VITE_PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ
```

---

## 🐛 Troubleshooting

### Container Not Found
The dev container hasn't been created yet. Follow **SETUP_DEV_NOW.md** to:
1. Edit `/home/cira/docker-compose.new.yml`
2. Add the dev container configuration
3. Create the container with `podman-compose`

### DNS Not Resolving
1. Check DNS A record is set: `dev.duckshotanalytics.com` → `74.208.227.161`
2. Wait for DNS propagation (up to 48 hours, usually faster)
3. Clear local DNS cache

### SSL Certificate Issues
1. Ensure Let's Encrypt is configured in docker-compose
2. Run: `sudo certbot --nginx -d dev.duckshotanalytics.com`
3. Check nginx-proxy container logs

### PayPal Buttons Not Showing
1. Check browser console for errors
2. Verify all `VITE_PAYPAL_*` variables are set
3. Check that plan IDs are correct
4. Ensure PayPal SDK loads (check Network tab)

---

## 📞 Next Steps

1. **Set up development container** using SETUP_DEV_NOW.md
2. **Test PayPal subscription flow** with sandbox credentials
3. **Monitor for errors** in container logs
4. **Move to Q1 2025 Roadmap items:**
   - Redis Queue Management
   - Email Integration
   - Performance Optimization

---

## 📝 Notes

- All PayPal plan IDs are for **SANDBOX** environment
- For production, create new plans in PayPal Live mode
- Keep plan IDs secret - never commit to Git
- The code in `dev-DuckSnapAnalytics` is ready to deploy
- Local testing confirms everything works perfectly

---

**Created:** 2025-12-10  
**Status:** ✅ Ready for Server Deployment  
**Local Testing:** ✅ Complete and Working
