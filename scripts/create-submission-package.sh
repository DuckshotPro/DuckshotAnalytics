
#!/bin/bash

# DuckShots Analytics - Snapchat Submission Package Creator
# This script creates a comprehensive zip package for Snapchat API review submission

echo "🦆 Creating DuckShots Analytics Submission Package..."

# Create temporary directory for packaging
TEMP_DIR="submission_package_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$TEMP_DIR"

echo "📦 Copying core application files..."

# Copy main application structure
cp -r client "$TEMP_DIR/"
cp -r server "$TEMP_DIR/"
cp -r shared "$TEMP_DIR/"

# Copy configuration files
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp tsconfig.json "$TEMP_DIR/"
cp tailwind.config.ts "$TEMP_DIR/"
cp vite.config.ts "$TEMP_DIR/"
cp drizzle.config.ts "$TEMP_DIR/"
cp postcss.config.js "$TEMP_DIR/"
cp .replit "$TEMP_DIR/"
cp replit.nix "$TEMP_DIR/"

# Copy documentation
cp -r docs "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp LICENSE "$TEMP_DIR/"
cp replit.md "$TEMP_DIR/"

echo "📋 Creating submission checklist..."

# Create submission info file
cat > "$TEMP_DIR/SUBMISSION_INFO.txt" << EOF
DuckShots Analytics - Snapchat API Submission Package
=====================================================

Developer: Aric Yesel
App Name: DuckShots Analytics
Snapchat Username: duckshot
Website: https://duckshotanalytics.com
Support Email: duckshotproductions@gmail.com
Replit URL: https://duckshot-analytics-420duck1.replit.app

Package Contents:
- Complete source code (client/, server/, shared/)
- Configuration files
- Documentation (docs/)
- Technical specifications
- Privacy policy and terms
- Security documentation
- User testing results

Required Next Steps:
1. Create app icon (1024x1024px)
2. Take screenshots of key features
3. Record demo video (30-60 seconds)
4. Set up Snapchat Developer Console
5. Configure OAuth credentials
6. Submit for review

This package contains everything needed for Snapchat API review.
Refer to docs/SNAPCHAT_SUBMISSION_PACKAGE.md for detailed instructions.
EOF

echo "🔒 Creating deployment guide..."

# Create deployment instructions
cat > "$TEMP_DIR/DEPLOYMENT_GUIDE.md" << EOF
# Deployment Instructions for Reviewers

## Quick Start
1. Import this project into Replit
2. Set environment variables:
   - SNAPCHAT_CLIENT_ID
   - SNAPCHAT_CLIENT_SECRET
   - APP_URL=https://your-repl-url.replit.app
3. Click Run button
4. Access the application

## OAuth Configuration
- Callback URL: https://your-repl-url.replit.app/api/auth/snapchat/callback
- Scopes: snapchat-profile-read, snapchat-insights-read

## Key Features to Test
- Dashboard analytics
- Privacy controls (/data-management)
- AI insights
- User consent flows
- Data export functionality

## Documentation
- Technical specs: docs/assets/technical-specifications.md
- Privacy assessment: docs/assets/privacy-impact-assessment.md
- Submission checklist: docs/SUBMISSION_CHECKLIST.md
EOF

echo "🎨 Including visual assets..."

# Copy any existing visual assets
if [ -d "attached_assets" ]; then
    cp -r attached_assets "$TEMP_DIR/"
fi

# Copy icon if exists
if [ -f "generated-icon.png" ]; then
    cp generated-icon.png "$TEMP_DIR/"
fi

echo "📊 Creating feature summary..."

# Create feature summary for reviewers
cat > "$TEMP_DIR/FEATURES_OVERVIEW.md" << EOF
# DuckShots Analytics - Feature Overview

## Core Analytics Features ✅
- Real-time follower tracking
- Engagement rate analysis
- Story performance metrics
- Audience growth visualization
- Demographics breakdown

## Privacy & Security Features ✅
- Granular consent management
- GDPR compliance tools
- Data deletion capabilities
- Export functionality
- Audit logging

## AI-Powered Features ✅
- Content recommendations
- Performance predictions
- Competitor analysis
- Automated insights
- Trend identification

## Professional Features ✅
- Custom report generation
- Multi-format exports
- Brand partnership tools
- Performance benchmarks
- Advanced segmentation

## Technical Implementation ✅
- OAuth 2.0 integration
- Rate limiting compliance
- Error handling
- Mobile responsive design
- Dark mode support

## Compliance ✅
- GDPR compliant
- COPPA compliant (13+ age verification)
- SOC 2 security controls
- Privacy by design
- Data minimization
EOF

echo "🔍 Excluding unnecessary files..."

# Remove development files that shouldn't be in submission
rm -rf "$TEMP_DIR/node_modules" 2>/dev/null
rm -rf "$TEMP_DIR/.git" 2>/dev/null
rm -rf "$TEMP_DIR/logs" 2>/dev/null
rm -f "$TEMP_DIR/.env" 2>/dev/null
rm -f "$TEMP_DIR/.env.local" 2>/dev/null

echo "📦 Creating tar archive..."

# Create the final tar package (compressed)
TAR_NAME="DuckShots_Analytics_Snapchat_Submission_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$TAR_NAME" --exclude="*.log" --exclude="node_modules" --exclude=".git" -C . "$TEMP_DIR"

# Clean up temporary directory
rm -rf "$TEMP_DIR"

echo "✅ Submission package created successfully!"
echo "📦 Package: $TAR_NAME"
echo "📊 Size: $(du -h "$TAR_NAME" | cut -f1)"
echo ""
echo "🚀 Next Steps:"
echo "1. Download the zip file"
echo "2. Create visual assets (icon, screenshots, demo video)"
echo "3. Set up Snapchat Developer Console"
echo "4. Submit for review"
echo ""
echo "📋 All documentation is included in docs/ folder"
echo "🔧 Technical specs in docs/assets/technical-specifications.md"
echo "🔒 Privacy assessment in docs/assets/privacy-impact-assessment.md"
