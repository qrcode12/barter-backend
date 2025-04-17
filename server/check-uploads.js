/**
 * This script checks if the uploads directory exists and creates it if it doesn't
 */
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    // console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  } else {
    // console.log(`Directory already exists: ${dirPath}`);
  }
};

// Main uploads directory
const uploadsDir = path.join(__dirname, '../public/uploads');
ensureDirectoryExists(uploadsDir);

// Subdirectories
const itemsDir = path.join(uploadsDir, 'items');
ensureDirectoryExists(itemsDir);

const avatarsDir = path.join(uploadsDir, 'avatars');
ensureDirectoryExists(avatarsDir);

// console.log('All upload directories created or verified.');