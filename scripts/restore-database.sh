#!/bin/bash

# ==============================================================================
# DuckShots SnapAlytics - Database Restore Script
# ==============================================================================
#
# This script restores a PostgreSQL database from a backup file created by
# the backup-database.sh script. It imports all tables and data from the
# SQL file into the database.
#
# CAUTION: This will overwrite existing data in the database!
#
# Usage:
#   bash scripts/restore-database.sh <backup_file_path>
#
# Requirements:
#   - PostgreSQL client tools (psql)
#   - Database connection environment variables must be set
#   - The backup file must exist
#
# Author: DuckShots SnapAlytics Team
# ==============================================================================

# Exit immediately if a command fails
set -e

# Check if a backup file was specified
if [ -z "$1" ]; then
  echo "Error: No backup file specified."
  echo "Usage: bash scripts/restore-database.sh <backup_file_path>"
  exit 1
fi

BACKUP_FILE="$1"

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' does not exist."
  exit 1
fi

# Check if database environment variables are set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable not set."
  echo "Please set the required database connection variables."
  exit 1
fi

echo "======================================================"
echo "                DATABASE RESTORE WARNING               "
echo "======================================================"
echo "You are about to restore the database from a backup."
echo "This will OVERWRITE ALL EXISTING DATA in the database."
echo ""
echo "Backup file: $BACKUP_FILE"
echo "Target database: $DATABASE_URL"
echo ""
echo "Are you sure you want to continue? (yes/no)"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore canceled."
  exit 0
fi

echo "Starting database restore..."

# Restore from backup
psql "$DATABASE_URL" < "$BACKUP_FILE"

echo "Restore completed successfully!"
echo ""
echo "Note: You may need to restart the application to see the changes."