/**
 * Database Migration Script
 * 
 * This script migrates the database schema by adding new columns needed for
 * data privacy and management features. It uses a safe approach to check if
 * columns exist before attempting to add them.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configure Neon to use the ws package
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Set of columns to add to the users table
const columnsToAdd = [
  { name: 'email', type: 'TEXT' },
  { name: 'allow_analytics', type: 'BOOLEAN', default: 'TRUE' },
  { name: 'allow_demographics', type: 'BOOLEAN', default: 'TRUE' },
  { name: 'allow_location_data', type: 'BOOLEAN', default: 'FALSE' },
  { name: 'allow_content_analysis', type: 'BOOLEAN', default: 'TRUE' },
  { name: 'allow_third_party', type: 'BOOLEAN', default: 'FALSE' },
  { name: 'allow_marketing', type: 'BOOLEAN', default: 'FALSE' }
];

async function migrateDatabase() {
  console.log("Starting database migration...");
  
  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Get the list of existing columns in the users table
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `);
      
      const existingColumns = columnsResult.rows.map(row => row.column_name);
      console.log("Existing columns:", existingColumns);
      
      // Add each column if it doesn't exist
      for (const column of columnsToAdd) {
        if (!existingColumns.includes(column.name)) {
          console.log(`Adding column ${column.name} to users table...`);
          let query = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`;
          
          // Add default value if provided
          if (column.default !== undefined) {
            query += ` DEFAULT ${column.default}`;
          }
          
          await client.query(query);
          console.log(`Column ${column.name} added successfully.`);
        } else {
          console.log(`Column ${column.name} already exists in users table.`);
        }
      }
      
      // Create consent_logs table if it doesn't exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'consent_logs'
      `);
      
      if (tablesResult.rows.length === 0) {
        console.log("Creating consent_logs table...");
        await client.query(`
          CREATE TABLE consent_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            detail TEXT,
            privacy_policy_version TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("consent_logs table created successfully.");
      } else {
        console.log("consent_logs table already exists.");
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log("Database migration completed successfully.");
    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error("Error during migration:", error);
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
migrateDatabase()
  .then(() => {
    console.log("Migration script completed.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Migration failed:", error);
    process.exit(1);
  });