/**
 * Database connection module
 * This is a JavaScript version of db.ts for use with the seed scripts
 */
import { drizzle } from 'drizzle-orm/postgres';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create database connection
export async const createDbConnection = () {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create a new Postgres pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Test the connection
  try {
    const client = await pool.connect();
    // console.log('Connected to PostgreSQL database!');
    client.release();

    // Create and return Drizzle instance
    return drizzle(pool);
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    throw error;
  }
}

// Export a default db instance for convenience
let db = null;

export async const getDb = () {
  if (!db) {
    db = await createDbConnection();
  }
  return db;
}