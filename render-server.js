import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cors from 'cors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration (from original code)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://bartertap.az', 'https://www.bartertap.az', 'https://bartertap.onrender.com']
    : true,
  credentials: true
}));

// Enable compression
app.use(compression());


// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BarterTap API is running' });
});

// Create a simple API endpoint (from edited code)
app.get('/api/items', (req, res) => {
  res.json([]);
});

// Serve static files from the dist directory (from edited code, modified to include uploads)
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));


// Handle all routes - let client-side routing handle (from edited code, modified to include API redirects)
app.get('*', (req, res) => {
  // Check if the requested path is for an API route
  if (req.path.startsWith('/api/') && req.path !== '/api/healthcheck' && req.path !== '/api/items') {
    return res.redirect(`https://barter-api-8jr6.onrender.com${req.url}`);
  }

  // Otherwise, serve the index.html file for client-side routing
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  // console.log(`BarterTap server running on port ${PORT}`);
});