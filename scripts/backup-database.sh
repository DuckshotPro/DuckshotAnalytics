#!/bin/bash

# ==============================================================================
# DuckShots SnapAlytics - Database Backup Script
# ==============================================================================
#
# This script creates a backup of the PostgreSQL database used by the application.
# It exports all database tables and data to a SQL file that can be used for
# restoration in case of data loss or migration to another server.
#
# Usage:
#   bash scripts/backup-database.sh [backup_name]
#
# If backup_name is not provided, a timestamp will be used.
#
# Requirements:
#   - PostgreSQL client tools (pg_dump)
#   - Database connection environment variables must be set
#
# Author: DuckShots SnapAlytics Team
# ==============================================================================

# Exit immediately if a command fails
set -e

# Location for backup files
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Get current date and time for the backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Allow custom backup name if provided
if [ -z "$1" ]; then
  BACKUP_FILENAME="duckshots_backup_${TIMESTAMP}.sql"
else
  BACKUP_FILENAME="$1.sql"
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# Check if database environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable not set."
  echo "Please set the required database connection variables."
  exit 1
fi

echo "Starting database backup..."
echo "Backup location: $BACKUP_PATH"

# Create backup using pg_dump
pg_dump "$DATABASE_URL" > "$BACKUP_PATH"

BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)

echo "Backup completed successfully."
echo "Backup size: $BACKUP_SIZE"
echo "Backup file: $BACKUP_PATH"
echo ""
echo "To restore this backup, run:"
echo "  bash scripts/restore-database.sh $BACKUP_PATH"