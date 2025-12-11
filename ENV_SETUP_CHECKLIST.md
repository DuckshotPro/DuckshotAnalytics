# Environment Variables Setup Checklist

## ✅ Required Variables (Must Be Set)

### 1. Database
```env
DATABASE_URL=postgresql://username:password@localhost:5432/duckshots
```
**Status:** ⚠️ Required - Update with your PostgreSQL credentials

### 2. Session Secret
```env
SESSION_SECRET=your_secure_random_string_here
```
**Status:** ⚠️ Required - Use a secure random string (generate with: `openssl rand -base64 32`)

### 3. App URL
```env
APP_URL=http://localhost:5000
```
**Status:** ⚠️ Required - Use `http://localhost:5000` for development

---

## ✅ PayPal Configuration (Already Set)

### Server-side
```env
PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_CLIENT_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_MODE=sandbox
PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ
```
**Status:** ✅ Set

### Client-side (VITE_ prefix)
```env
VITE_PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
VITE_PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
VITE_PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ
```
**Status:** ✅ Set

---

## 📦 Optional Variables

### Snapchat OAuth (Optional - for production)
```env
SNAPCHAT_CLIENT_ID=your_snapchat_client_id
SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret
```
**Status:** Optional - Leave unset to use mock data in development

### Redis (Optional - for production)
```env
REDIS_URL=redis://localhost:6379
```
**Status:** Optional - Uses in-memory queue in development if not set

---

## 🚀 Quick Setup Commands

### 1. Generate Session Secret
```bash
openssl rand -base64 32
```

### 2. Set up PostgreSQL Database
```bash
# Create database
createdb duckshots

# Or with psql
psql -c "CREATE DATABASE duckshots;"
```

### 3. Update DATABASE_URL
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/duckshots
```

### 4. Initialize Database Schema
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

---

## 📝 Complete .env Template

Copy this to your `.env` file and fill in the required values:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/duckshots

# Session
SESSION_SECRET=your_secure_random_string

# PayPal (Sandbox - Already Configured)
PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_CLIENT_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_MODE=sandbox
PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

# PayPal Client-side
VITE_PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
VITE_PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
VITE_PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

# App URL
APP_URL=http://localhost:5000

# Optional: Snapchat OAuth (leave blank for mock data)
# SNAPCHAT_CLIENT_ID=your_snapchat_client_id
# SNAPCHAT_CLIENT_SECRET=your_snapchat_client_secret

# Optional: Redis (uses in-memory if not set)
# REDIS_URL=redis://localhost:6379
```

---

## ⚠️ Current Issue

**Error:** `DATABASE_URL must be set`

**Solution:** Add these three required variables to your `.env` file:
1. `DATABASE_URL` - Your PostgreSQL connection string
2. `SESSION_SECRET` - A secure random string
3. `APP_URL` - Set to `http://localhost:5000` for development
