#!/usr/bin/env pwsh
# Quick redeploy script for dev.duckshotanalytics.com

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

# Step 1: Git operations
Write-Host "`n📦 Committing and pushing changes..." -ForegroundColor Yellow
git add -A
git commit -m "Site deployment update - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green

# Step 2: SSH and pull on server
Write-Host "`n🔄 Pulling latest code on server..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "cd /home/cira/dev-DuckSnapAnalytics && git pull origin main"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to pull code on server" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code pulled on server" -ForegroundColor Green

# Step 3: Rebuild and restart container
Write-Host "`n🔨 Rebuilding container..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "cd /home/cira && podman-compose -f docker-compose.new.yml up -d --build site-duckshotanalytics-dev"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Container rebuild failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Container rebuilt and restarted" -ForegroundColor Green

# Step 4: Verify deployment
Write-Host "`n🔍 Checking deployment status..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "podman ps | grep duckshotanalytics-dev"

Write-Host "`n✨ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Site: https://dev.duckshotanalytics.com/" -ForegroundColor Cyan
Write-Host "`nChecking logs with:" -ForegroundColor Gray
Write-Host "  ssh cira@74.208.227.161 'podman logs -f site-duckshotanalytics-dev'" -ForegroundColor Gray
