# Create .env file with all required variables

$content = @"
# Database - Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_3cMRdDbK7QkW@ep-odd-voice-a8zc65qg.eastus2.azure.neon.tech/neondb?sslmode=require

# Session Secret (Auto-generated)
SESSION_SECRET=4IDb15HHFBOw8M/sh3Yr2OmYW2/35hBGDmDrC2+EuSI=

# App URL
APP_URL=http://localhost:5000

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
"@

$content | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host "[OK] .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "The file contains:" -ForegroundColor Cyan
Write-Host "  - Neon Database URL" -ForegroundColor White
Write-Host "  - Generated Session Secret" -ForegroundColor White
Write-Host "  - PayPal Configuration" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. npm run db:push    # Initialize database" -ForegroundColor White
Write-Host "  2. npm run dev        # Start dev server" -ForegroundColor White
