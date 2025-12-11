# Quick .env Setup - Copy This

## Generated Session Secret (Use This!)
```
SESSION_SECRET=4IDb15HHFBOw8M/sh3Yr2OmYW2/35hBGDmDrC2+EuSI=
```

## Complete .env File Template

Copy everything below and save to your `.env` file:

```env
# Database - UPDATE THIS WITH YOUR POSTGRESQL INFO
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/duckshots

# Session Secret (GENERATED - READY TO USE)
SESSION_SECRET=4IDb15HHFBOw8M/sh3Yr2OmYW2/35hBGDmDrC2+EuSI=

# App URL
APP_URL=http://localhost:5000

# PayPal Configuration (Already Set Up)
PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_CLIENT_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_MODE=sandbox
PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

# PayPal Client-Side Keys
VITE_PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
VITE_PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
VITE_PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ
```

---

## What to Update

### DATABASE_URL
The default assumes:
- Username: `postgres`
- Password: `postgres`
- Host: `localhost`
- Port: `5432`
- Database: `duckshots`

**Update this line** if your PostgreSQL credentials are different:
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/duckshots
```

---

## Next Steps

1. **Copy the template above to your `.env` file**
2. **Update the DATABASE_URL** with your PostgreSQL credentials
3. **Create the database** (if it doesn't exist):
   - Option A: Using pgAdmin (graphical interface)
   - Option B: Using command line: `createdb duckshots`
4. **Run database migrations**:
   ```bash
   npm run db:push
   ```
5. **Start the dev server**:
   ```bash
   npm run dev
   ```

---

## Common PostgreSQL Credentials

Try these common defaults:

**Option 1 (Most Common):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/duckshots
```

**Option 2 (No Password):**
```env
DATABASE_URL=postgresql://postgres@localhost:5432/duckshots
```

**Option 3 (Custom User):**
```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/duckshots
```

---

## Can't Find PostgreSQL?

If PostgreSQL isn't installed or you can't access it, you have options:

1. **Use Docker** (easiest):
   ```bash
   docker run --name duckshots-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=duckshots -p 5432:5432 -d postgres
   ```
   Then use: `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/duckshots`

2. **Install PostgreSQL** from: https://www.postgresql.org/download/windows/

3. **Use your remote server database** (if you have one set up)
