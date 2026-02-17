#!/usr/bin/env pwsh
# Emergency server diagnostic and recovery script

Write-Host "🚨 EMERGENCY SERVER DIAGNOSTIC" -ForegroundColor Red
Write-Host "================================`n" -ForegroundColor Red

# Step 1: Check if we can reach the server
Write-Host "📡 Step 1: Testing server connectivity..." -ForegroundColor Yellow
$ping = Test-Connection -ComputerName 74.208.227.161 -Count 2 -Quiet
if ($ping) {
    Write-Host "✅ Server is reachable" -ForegroundColor Green
}
else {
    Write-Host "❌ Server is NOT reachable - network issue!" -ForegroundColor Red
    exit 1
}

# Step 2: Check container status
Write-Host "`n📦 Step 2: Checking container status..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "podman ps -a | grep duckshot"

# Step 3: Check recent logs
Write-Host "`n📋 Step 3: Checking container logs (last 50 lines)..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "podman logs --tail 50 site-duckshotanalytics-dev 2>&1"

# Step 4: Check if docker-compose file exists
Write-Host "`n📄 Step 4: Checking docker-compose configuration..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "ls -la /home/cira/docker-compose*.yml"

# Step 5: Check if repository exists
Write-Host "`n📁 Step 5: Checking repository..." -ForegroundColor Yellow
ssh cira@74.208.227.161 "ls -la /home/cira/dev-DuckSnapAnalytics/"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "📊 Diagnostic complete. Review output above." -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. If container is stopped: run .\restart-dev-site.ps1" -ForegroundColor Gray
Write-Host "  2. If container doesn't exist: run .\initial-deploy.ps1" -ForegroundColor Gray
Write-Host "  3. If errors in logs: share them for troubleshooting" -ForegroundColor Gray
