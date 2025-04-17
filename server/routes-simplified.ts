import express, { Request, Response } from 'express';
import { dbStorage } from './db_postgres.js';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import http from 'http';

// WebSocket clients collection
const clients = new Map<number, WebSocket>();

// Helper to send WebSocket notifications
const notifyClients = (data: any) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Setup WebSocket server
export const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket & { userId?: number }) => {
    const id = Date.now();
    clients.set(id, ws);

    console.log(`New WebSocket connection: ${id}`);

    ws.on('message', (message: WebSocket.Data) => {
      try {
        // For Buffer objects, convert to string first
        const messageString = message.toString();
        const data = JSON.parse(messageString);

        console.log(`Received message: ${JSON.stringify(data)}`);

        // Handle different message types
        if (data.type === 'auth') {
          // Authenticate user
          ws.userId = data.userId;
          console.log(`User ${data.userId} authenticated on WebSocket`);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(id);
      console.log(`WebSocket connection closed: ${id}`);
    });
  });

  console.log('WebSocket server is running');
  return wss;
};

// Simplified routes
export const registerSimplifiedRoutes = (app: express.Application) => {
  // Health check endpoint
  app.get('/api/healthcheck', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Basic user routes
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string | undefined;
      const users = await dbStorage.getAllUsers(search);
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await dbStorage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  });

  // Return the server for WebSocket setup
  return http.createServer(app);
};

// Main routes
export const registerRoutes = async (app: express.Application) => {
  // Create HTTP server for WebSocket support
  const server = http.createServer(app);

  // Setup simplified routes
  // registerSimplifiedRoutes(app);

  // Return the server so it can be used for WebSocket
  return server;
};