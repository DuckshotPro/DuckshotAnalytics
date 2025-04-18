/**
 * Database Schema Update Script
 * 
 * This script updates the database schema based on the latest schema definitions.
 * It adds missing columns and tables to the existing database schema.
 */

import { db, pool } from "../server/db";
import { users, oauthTokens } from "../shared/schema";
import { sql } from "drizzle-orm";

async function updateSchema() {
  console.log("Updating database schema...");

  try {
    // Add profile_picture_url column to users table if it doesn't exist
    await db.execute(sql`
      ALTER TABLE ${users}
      ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
      ADD COLUMN IF NOT EXISTS display_name TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now() NOT NULL,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now() NOT NULL
    `);
    console.log("Updated users table schema.");

    // Create oauth_tokens table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${oauthTokens} (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        provider_user_id TEXT NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        scope TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        updated_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `);
    console.log("Created oauth_tokens table if it didn't exist.");

    console.log("Database schema update completed successfully!");
  } catch (error) {
    console.error("Error updating database schema:", error);
  } finally {
    await pool.end();
  }
}

updateSchema();