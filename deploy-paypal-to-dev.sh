#!/bin/bash
# Deploy PayPal Integration to Dev Server
# This script updates the dev server with the latest PayPal integration

set -e  # Exit on error

echo "🚀 Deploying PayPal Integration to Dev Server..."
echo ""

# Step 1: Navigate to dev directory
echo "📁 Step 1: Checking dev directory..."
cd /home/cira/dev-DuckSnapAnalytics

# Step 2: Reset any local changes and pull latest
echo "📥 Step 2: Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
git pull origin main

# Step 3: Update .env with PayPal credentials
echo "🔐 Step 3: Updating environment variables..."
cat > .env.paypal << 'EOF'
# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
PAYPAL_CLIENT_SECRET=EG0EXtyBr0uqjT6g_OmYTgS9vTp05rt0_BmdV37r4QzFrMg7PjtLp9QekUXNH7myH921MR31LDrRsF_E
PAYPAL_MODE=sandbox
PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ

# PayPal Client-Side Keys
VITE_PAYPAL_CLIENT_ID=AQuPla_v-nyUoP7R9DASWT3GQgTOn-vSb40MyB_4G2llS0fFMhH199cU1pCHUFZZltAuX70odwwPoRQR
VITE_PAYPAL_MONTHLY_PLAN_ID=P-7CG40635HU801524CNE5EHHI
VITE_PAYPAL_YEARLY_PLAN_ID=P-9A17911506902021RNE5EHHQ
EOF

# Append PayPal config to existing .env if it exists, or create new one
if [ -f .env ]; then
    # Remove old PayPal config if exists
    sed -i '/^PAYPAL_/d' .env
    sed -i '/^VITE_PAYPAL_/d' .env
    # Append new config
    cat .env.paypal >> .env
else
    mv .env.paypal .env
fi

rm -f .env.paypal

echo "✅ Environment variables updated"

# Step 4: Restart the dev container
echo "🔄 Step 4: Restarting dev container..."
cd /home/cira
podman restart site-duckshotanalytics-dev

# Step 5: Wait for container to start
echo "⏳ Step 5: Waiting for container to start..."
sleep 5

# Step 6: Check logs
echo "📋 Step 6: Checking container logs..."
podman logs --tail 20 site-duckshotanalytics-dev

echo ""
echo "=" * 60
echo "✅ Deployment Complete!"
echo "=" * 60
echo ""
echo "Test the integration at:"
echo "  https://dev.duckshotanalytics.com/pricing-page"
echo ""
echo "To view live logs:"
echo "  podman logs -f site-duckshotanalytics-dev"
