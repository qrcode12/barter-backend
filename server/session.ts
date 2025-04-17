import session from 'express-session';
import memoryStore from 'memorystore';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

// Load .env file in production
dotenv.config();

/**
 * Create a better, secure and fixed session secret for development
 * that won't be regenerated on restart
 */
const generateFixedSecret = () => {
  // In crypto terms, this isn't perfect but good enough for development
  return '3Jn32d8aHx9kQmP5sT7wYzR4vF6gC1pE2022BakterTap';
};

const SESSION_SECRET = generateFixedSecret();
const MemoryStore = memoryStore(session);

// Declare global session types for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId: number | null;
    username: string | null;
    role: string | null;
    isAdmin?: boolean;
    isAuthenticated?: boolean;
  }
}

// Configure session with stronger settings, absolute path, and debug information
export const configureSession = () => {
  // Use environment variable in production or fixed secret in development
  const sessionSecret = process.env.SESSION_SECRET || SESSION_SECRET;

  // console.log('Session configuration:');
  // console.log('- Secret length:', sessionSecret.length);
  // console.log('- Session cookie name: bartertap');

  // Default to in-memory session store for development
  const sessionOptions: session.SessionOptions = {
    name: 'bartertap', // Most important! Single consistent name
    secret: sessionSecret,
    resave: false, // Only save when session is modified
    saveUninitialized: false, // Don't create sessions for non-authenticated users
    rolling: true, // Reset expiration on each response
    unset: 'destroy', // Remove session when req.session is nulled
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Only use secure in production
      httpOnly: true, // Prevent JavaScript access to cookie
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax", // Relaxed cross-origin policy, adjusted based on env
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days for longer sessions
      path: '/', // Available on entire site
    },
    store: new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
      stale: false, // Don't return expired sessions
    })
  };

  // In production with DATABASE_URL, use PostgreSQL session store
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      const pgSession = require('connect-pg-simple')(session);

      // Use DATABASE_URL directly for PostgreSQL
      const sessionStore = new pgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production'
        },
        tableName: 'sessions',
        createTableIfMissing: true
      });

      sessionOptions.store = sessionStore;
      // console.log('Using PostgreSQL session store');
    } catch (error) {
      console.error('Failed to initialize PostgreSQL session store, fallback to Memory store:', error);
    }
  } else {
    // console.log('Using Memory session store');
  }

  // Create the session middleware with our configuration
  return session(sessionOptions);
}