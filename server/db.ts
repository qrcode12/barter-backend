
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the connection string from environment or use default
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/bartertap';

// Create the PostgreSQL client
const client = postgres(connectionString);

// Create and export the Drizzle ORM instance
const db = drizzle(client);

export { db };
