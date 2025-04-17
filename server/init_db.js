import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createMySqlConnection } from "./db_mysql_adapter.js";

// Load environment variables
dotenv.config();

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database with tables and default data
 */
async const initializeDatabase = () {
  // console.log("Starting database initialization...");

  try {
    // Connect to database
    const db = await createMySqlConnection();
    // console.log("Database connection established");

    // Read SQL from file
    const sqlPath = path.join(__dirname, "../create_tables.sql");
    let sql;

    try {
      sql = fs.readFileSync(sqlPath, "utf8");
      // console.log("SQL file read successfully");
    } catch (fileError) {
      console.error("Failed to read SQL file:", fileError.message);
      // console.log("Creating tables using embedded SQL...");
      sql = getEmbeddedSQL();
    }

    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    // console.log(`Found ${statements.length} SQL statements to execute`);

    for (const [index, statement] of statements.entries()) {
      try {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          // Use raw connection to execute SQL
          const connection = db.driver.connection;

          // console.log(`Executing statement ${index + 1}/${statements.length}...`);
          await connection.execute(trimmedStatement + ';');
        }
      } catch (sqlError) {
        // Check if error is "table already exists"
        if (sqlError.code === 'ER_TABLE_EXISTS_ERROR') {
          // console.log(`Table already exists, skipping: ${sqlError.message}`);
        } else {
          console.error(`Error executing SQL statement ${index + 1}:`, sqlError.message);
        }
      }
    }

    // Create default user if no users exist
    try {
      const [users] = await db.driver.connection.execute('SELECT COUNT(*) as count FROM users');

      if (users[0].count === 0) {
        // console.log("No users found, creating default user...");
        await createDefaultUser(db);
      } else {
        // console.log(`Found ${users[0].count} existing users, skipping default user creation`);
      }
    } catch (userError) {
      console.error("Error checking/creating default user:", userError.message);
    }

    // console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

/**
 * Create a default admin user for initial login
 */
async const createDefaultUser = (db) {
  try {
    // Use scrypt or similar from your auth service to hash password
    // This is a simplified example - in production, use proper password hashing
    const defaultUsername = "admin";
    const defaultPassword = "$2b$10$9YmCTvz8SkqK2JD77xze8OMiuLB1YWjOyj45qPxSxci36eJLHG5A6"; // admin123
    const defaultEmail = "admin@bartertap.az";

    const query = `
      INSERT INTO users (username, password, email, role, active)
      VALUES (?, ?, ?, 'admin', true)
    `;

    await db.driver.connection.execute(query, [defaultUsername, defaultPassword, defaultEmail]);
    // console.log("Default admin user created successfully");
  } catch (error) {
    console.error("Failed to create default user:", error.message);
    // Continue even if default user creation fails
  }
}

/**
 * Get embedded SQL for table creation in case the SQL file is not found
 */
const getEmbeddedSQL = () {
  return `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  fullName VARCHAR(255),
  avatar VARCHAR(255),
  bio TEXT,
  phone VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  condition VARCHAR(50) NOT NULL,
  city VARCHAR(255),
  location VARCHAR(255),
  coordinates TEXT,
  userId INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  filePath VARCHAR(255) NOT NULL,
  isMain BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastMessageAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE SET NULL
);

-- Conversation Participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  userId INT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  senderId INT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'sent',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversationId INT NOT NULL,
  fromUserId INT NOT NULL,
  toUserId INT NOT NULL,
  fromItemId INT NOT NULL,
  toItemId INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  message TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (fromItemId) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (toItemId) REFERENCES items(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN NOT NULL DEFAULT FALSE,
  referenceId INT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  itemId INT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE (userId, itemId)
);

-- Push Subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fromUserId INT NOT NULL,
  toUserId INT NOT NULL,
  offerId INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (offerId) REFERENCES offers(id) ON DELETE CASCADE,
  UNIQUE (fromUserId, offerId)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(36) NOT NULL PRIMARY KEY,
  expires TIMESTAMP(6) NOT NULL,
  data TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
  `;
}

// Run the function if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };