import { Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User } from "../shared/schema.js";

// Promisify crypto functions
const scryptAsync = promisify(scrypt);

/**
 * Authentication and authorization service
 * Provides utilities for user authentication, session management, and password handling
 */
export class AuthService {
  /**
   * Hash a password using scrypt with salt
   * @param password Plain text password
   * @returns Hashed password with salt
   */
  async hashPassword(password: string): Promise<string> {
    // Generate a random salt
    const salt = randomBytes(16).toString("hex");
    // Hash the password with the salt
    const hash = await scryptAsync(password, salt, 64) as Buffer;
    // Return the hash and salt joined by a dot
    return `${hash.toString("hex")}.${salt}`;
  }

  /**
   * Verify a password against a stored hash
   * @param password Plain text password to verify
   * @param storedHash Stored hash from the database
   * @returns True if password matches, false otherwise
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Split the stored hash into hash and salt
    const [hash, salt] = storedHash.split(".");
    // Hash the supplied password with the salt
    const hashBuffer = Buffer.from(hash, "hex");
    const suppliedBuffer = await scryptAsync(password, salt, 64) as Buffer;
    // Compare the hashes in constant time to prevent timing attacks
    return timingSafeEqual(hashBuffer, suppliedBuffer);
  }

  /**
   * Authenticate a user using username and password
   * @param username Username to authenticate
   * @param password Password to authenticate
   * @returns User object if authentication is successful, null otherwise
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    // Get user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      // console.log(`Authentication failed: User '${username}' not found`);
      return null;
    }

    // Verify password
    const passwordValid = await this.verifyPassword(password, user.password);
    if (!passwordValid) {
      // console.log(`Authentication failed: Invalid password for user '${username}'`);
      return null;
    }

    // console.log(`Authentication successful for user '${username}'`);
    return user;
  }

  /**
   * Middleware to check if a user is authenticated
   */
  isAuthenticated(req: Request, res: Response, next: NextFunction) {
    // For debugging purposes
    // console.log('[AUTH] Checking authentication...');
    // console.log('[AUTH] Session ID:', req.session.id);
    console.log('[AUTH] Session data:', {
      userId: req.session.userId,
      username: req.session.username,
      role: req.session.role
    });

    if (!req.session.userId) {
      // console.log('[AUTH] No user ID in session, authentication failed');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // console.log('[AUTH] User authenticated, continuing...');
    next();
  }

  /**
   * Middleware to check if a user is an admin
   */
  isAdmin(req: Request, res: Response, next: NextFunction) {
    // Check if authenticated
    if (!req.session.userId) {
      // console.log('[AUTH] No user ID in session, authentication failed');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if admin
    if (req.session.role !== 'admin') {
      // console.log('[AUTH] User is not admin, access denied');
      return res.status(403).json({ message: 'Admin access required' });
    }

    // console.log('[AUTH] Admin access granted');
    next();
  }

  /**
   * Login a user and create a session
   * @param req Express request
   * @param res Express response
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Check if username and password are provided
      if (!username || !password) {
        // console.log('[AUTH] Login failed: Username or password missing');
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Fixed test user for development
      const TEST_USERNAME = 'testuser';
      const TEST_PASSWORD = 'password123';

      // Authenticate user
      let user = null;
      if (username === TEST_USERNAME) {
        // Special case for test user
        user = await storage.getUserByUsername(TEST_USERNAME);

        // Create test user if not exists
        if (!user) {
          // console.log(`[AUTH] Creating test user: ${TEST_USERNAME}`);
          try {
            user = await storage.createUser({
              username: TEST_USERNAME,
              password: TEST_PASSWORD, // In a real app, this would be hashed
              email: `${TEST_USERNAME}@example.com`,
              fullName: 'Test User',
              role: 'user',
              active: true
            });
          } catch (error) {
            console.error('[AUTH] Error creating test user:', error);
            return res.status(500).json({ message: 'Error creating test user' });
          }
        }

        // Use test password for verification
        if (password !== TEST_PASSWORD) {
          // console.log('[AUTH] Invalid password for test user');
          return res.status(401).json({ message: 'Invalid username or password' });
        }
      } else {
        // Regular authentication
        user = await this.authenticate(username, password);
        if (!user) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
      }

      // Create session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.isAuthenticated = true;

      // Save session
      req.session.save((err) => {
        if (err) {
          console.error('[AUTH] Error saving session:', err);
          return res.status(500).json({ message: 'Error creating session' });
        }

        // console.log('[AUTH] Session created:', req.session.id);
        console.log('[AUTH] Session data:', {
          userId: req.session.userId,
          username: req.session.username,
          role: req.session.role
        });

        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Logout a user and destroy the session
   * @param req Express request
   * @param res Express response
   */
  logout(req: Request, res: Response) {
    if (!req.session.userId) {
      return res.status(200).json({ message: 'Not logged in' });
    }

    const username = req.session.username;

    req.session.destroy((err) => {
      if (err) {
        console.error('[AUTH] Error destroying session:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }

      // console.log(`[AUTH] User '${username}' logged out`);
      res.clearCookie('bartertap'); // Clear the session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  }

  /**
   * Get current user from session
   * @param req Express request
   * @param res Express response
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // Debug session data
      // console.log('[AUTH] Checking current user...');
      // console.log('[AUTH] Session ID:', req.session.id);
      console.log('[AUTH] Session data:', {
        userId: req.session.userId,
        username: req.session.username,
        role: req.session.role,
        isAuthenticated: req.session.isAuthenticated
      });

      if (!req.session.userId) {
        // console.log('[AUTH] No user ID in session');
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // console.log('[AUTH] Getting current user:', req.session.userId);
      const user = await storage.getUser(req.session.userId);

      if (!user) {
        // console.log('[AUTH] User not found:', req.session.userId);
        return res.status(404).json({ message: 'User not found' });
      }

      // console.log('[AUTH] User found:', user.username);

      // Return user data without password - explicitly set content type
      const { password, ...userWithoutPassword } = user;
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('[AUTH] Error getting current user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

// Export middlewares for convenience
export const isAuthenticated = authService.isAuthenticated.bind(authService);
export const isAdmin = authService.isAdmin.bind(authService);