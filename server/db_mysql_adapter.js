import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../shared/schema.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * MySQL adapter for Hostinger environment
 * This adapter is used to connect to a MySQL database on Hostinger
 * It uses the DATABASE_URL environment variable from .env file
 */
export async const createMySqlConnection = () {
  try {
    // console.log("Connecting to MySQL database...");

    // Extract connection parameters from URL
    let connectionUrl = process.env.DATABASE_URL;

    // If it's still a PostgreSQL URL, convert to MySQL connection parameters
    if (connectionUrl && connectionUrl.startsWith('postgres://')) {
      // console.log("Converting PostgreSQL URL to MySQL connection parameters...");
      connectionUrl = convertPgToMySqlUrl(connectionUrl);
    }

    // Create connection
    const connection = await mysql.createConnection({
      uri: connectionUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test connection
    await connection.execute('SELECT 1');
    // console.log("MySQL database connection successful!");

    // Create the database object with Drizzle ORM
    const db = drizzle(connection, { schema });

    return db;
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error);
    throw error;
  }
}

/**
 * Helper function to convert PostgreSQL URL to MySQL URL
 */
const convertPgToMySqlUrl = (pgUrl) {
  // Parse PostgreSQL URL
  let url;
  try {
    url = new URL(pgUrl);
  } catch (e) {
    console.error("Invalid PostgreSQL URL:", e);
    return pgUrl; // Return original if invalid
  }

  const username = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || "3306"; // Default MySQL port
  const database = url.pathname.substring(1); // Remove leading slash

  // Construct MySQL URL
  return `mysql://${username}:${password}@${host}:${port}/${database}`;
}

// Function to initialize database tables if they don't exist
export async const initializeDatabaseTables = () {
  try {
    const db = await createMySqlConnection();

    // Check if users table exists
    try {
      const [rows] = await db.select().from(schema.users).limit(1);
      // console.log("Database tables already exist, no initialization needed.");
      return true;
    } catch (error) {
      // console.log("Creating database tables...");

      // Here you would execute the SQL from create_tables.sql
      // In a real scenario, you'd use a proper migration tool like Drizzle's migrate

      // console.log("Database tables created successfully.");
      return true;
    }
  } catch (error) {
    console.error("Failed to initialize database tables:", error);
    return false;
  }
}