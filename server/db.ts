/**
 * Database Connection Configuration
 * 
 * This file initializes and exports the database connection for the application.
 * It uses the `@neondatabase/serverless` package with Drizzle ORM to connect to a PostgreSQL database.
 * 
 * The database URL is expected to be provided via the DATABASE_URL environment variable.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

/**
 * Configure WebSocket for Neon Database
 * 
 * Neon requires a WebSocket constructor for establishing connections.
 * This configuration enables proper connection pooling and handling.
 */
neonConfig.webSocketConstructor = ws;

/**
 * Validate Database Configuration
 * 
 * This check ensures that the DATABASE_URL environment variable is set.
 * If it's missing, the application will fail early with a clear error message.
 */
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Create Connection Pool
 * 
 * The connection pool manages multiple database connections efficiently.
 * It automatically handles connection creation, pooling, and cleanup.
 */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Initialize Drizzle ORM
 * 
 * Drizzle provides a type-safe ORM interface for interacting with the database.
 * It uses the connection pool and schema definition to create a database client.
 * 
 * @property client - The database client pool for connection management
 * @property schema - The database schema imported from shared/schema.ts
 */
export const db = drizzle({ client: pool, schema });