/**
 * Hostinger server verification and setup script
 * Run this script on the Hostinger server to verify that everything is correctly set up
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import http from 'http';

// Load environment variables
dotenv.config();

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async const verifyHostingerSetup = () {
  // console.log('BarterTap Hostinger Verification Script');
  // console.log('=======================================');

  // Check Node.js version
  const nodeVersion = process.version;
  // console.log(`\n✓ Node.js version: ${nodeVersion}`);
  if (nodeVersion.startsWith('v18') || nodeVersion.startsWith('v20')) {
    // console.log('  ✓ Node.js version is compatible');
  } else {
    // console.log('  ⚠ WARNING: Node.js version may not be compatible. We recommend using v18.x or v20.x');
  }

  // Check environment variables
  // console.log('\nEnvironment variables:');
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    // console.log(`  ✓ DATABASE_URL is set: ${maskSensitiveInfo(databaseUrl)}`);
  } else {
    // console.log('  ✗ DATABASE_URL is not set');
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret) {
    // console.log(`  ✓ SESSION_SECRET is set: ${maskString(sessionSecret)}`);
  } else {
    // console.log('  ✗ SESSION_SECRET is not set');
  }

  // Check required files
  // console.log('\nRequired files:');
  const requiredFiles = [
    '.env',
    '.htaccess',
    'index.html',
    'index.php',
    'package.json',
    'server/index.js',
    'shared/schema.js'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      // console.log(`  ✓ ${file} exists`);
    } else {
      // console.log(`  ✗ ${file} does not exist`);
    }
  }

  // Check MySQL connection
  // console.log('\nTesting MySQL connection:');
  try {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL
    });

    await connection.execute('SELECT 1');
    // console.log('  ✓ MySQL connection successful');

    // Check if tables exist
    try {
      const [rows] = await connection.execute('SHOW TABLES');
      // console.log(`  ✓ Found ${rows.length} tables in the database`);

      // Print table names
      for (const row of rows) {
        const tableName = Object.values(row)[0];
        // console.log(`    - ${tableName}`);
      }
    } catch (e) {
      // console.log(`  ✗ Failed to list tables: ${e.message}`);
    }

    await connection.end();
  } catch (e) {
    // console.log(`  ✗ MySQL connection failed: ${e.message}`);
  }

  // Check if the server port is available
  const port = process.env.PORT || 8080;
  // console.log(`\nTesting port ${port} availability:`);

  try {
    const server = http.createServer();
    await new Promise((resolve, reject) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} is already in use`));
        } else {
          reject(err);
        }
      });

      server.once('listening', () => {
        resolve();
        server.close();
      });

      server.listen(port);
    });

    // console.log(`  ✓ Port ${port} is available`);
  } catch (e) {
    // console.log(`  ✗ Port availability check failed: ${e.message}`);
  }

  // Print summary
  // console.log('\nVerification summary:');
  // console.log('  Node.js environment appears to be working');
  // console.log('  Make sure your MySQL database is properly set up');
  // console.log('  Make sure your web server is configured correctly');
  // console.log('\nIf there are any issues, please check the error messages above');
  // console.log('or contact support for assistance.');
}

const maskSensitiveInfo = (url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.password) {
      parsedUrl.password = '***';
    }
    return parsedUrl.toString();
  } catch (e) {
    return 'Invalid URL format';
  }
}

const maskString = (str) {
  if (!str) return '';
  if (str.length <= 4) return '****';
  return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
}

// Run the const verifyHostingerSetup = ();