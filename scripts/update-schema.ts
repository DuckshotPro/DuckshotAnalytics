/**
 * Database Schema Update Script
 * 
 * This script updates the database schema based on the latest schema definitions.
 * It adds missing columns and tables to the existing database schema.
 */

import { db, pool } from "../server/db";
import { users, oauthTokens, consentLogs } from "../shared/schema";
import { sql } from "drizzle-orm";

async function updateSchema() {
  console.log("Updating database schema...");

  try {
    // Add consent-related columns to users table
    await db.execute(sql`
      ALTER TABLE ${users}
      ADD COLUMN IF NOT EXISTS data_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT
    `);
    console.log("Added consent-related columns to users table.");

    // Create consent_logs table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${consentLogs} (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        detail TEXT,
        privacy_policy_version TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `);
    console.log("Created consent_logs table if it didn't exist.");

    console.log("Database schema update completed successfully!");
  } catch (error) {
    console.error("Error updating database schema:", error);
  } finally {
    await pool.end();
  }
}

updateSchema();