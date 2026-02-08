/**
 * Authentication Routes
 * 
 * This module handles all user authentication operations:
 * - User registration (POST /api/auth/register)
 * - User login (POST /api/auth/login)
 * - Token verification (GET /api/auth/me)
 * 
 * Security Features:
 * - Passwords are hashed using bcrypt (10 salt rounds)
 * - JWT tokens expire after 7 days
 * - Input validation on all fields
 * - SQL injection protection via parameterized queries
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

/**
 * bcrypt Salt Rounds
 * Higher number = more secure but slower
 * 10 is a good balance between security and performance
 */
const SALT_ROUNDS = 10;

// ============================================
// POST /api/auth/register - Register New User
// ============================================

/**
 * Register a new user account
 * 
 * Request Body:
 * {
 *   "username": "string" (3-255 chars),
 *   "password": "string" (6+ chars)
 * }
 * 
 * Response (201 Created):
 * {
 *   "user": { "id": number, "username": "string" },
 *   "token": "string" (JWT token valid for 7 days)
 * }
 * 
 * Automatic Actions:
 * - Creates "My Day" default list for new user
 * - Hashes password before storing
 * - Generates JWT token for immediate login
 * 
 * Error Responses:
 * - 400: Missing or invalid fields
 * - 409: Username already exists
 * - 500: Server error
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // ========== INPUT VALIDATION ==========
    
    // Check required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Username length validation (minimum)
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Username length validation (maximum - database limit)
    if (username.length > 255) {
      return res.status(400).json({ error: 'Username must not exceed 255 characters' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // ========== CHECK FOR DUPLICATE USERNAME ==========
    
    /**
     * Query database to see if username already exists
     * This prevents duplicate accounts and provides clear error message
     */
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // ========== HASH PASSWORD ==========
    
    /**
     * Hash password using bcrypt
     * - Salt is automatically generated
     * - Original password is never stored in database
     * - Hash is one-way (cannot be decrypted)
     * - Same password will produce different hashes (due to salt)
     */
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ========== CREATE USER ==========
    
    /**
     * Insert new user into database
     * created_at timestamp is automatically set by MySQL
     */
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    const userId = result.insertId;

    // ========== RETRIEVE CREATED USER ==========
    
    /**
     * Fetch the newly created user
     * Excludes password_hash for security
     */
    const [users] = await pool.query(
      'SELECT id, username, created_at FROM users WHERE id = ?',
      [userId]
    );

    const newUser = users[0];

    // ========== CREATE DEFAULT LIST ==========
    
    /**
     * Automatically create "My Day" list for new user
     * This is a protected default list that:
     * - Cannot be renamed
     * - Cannot be deleted
     * - Always appears first in the user's lists
     */
    await pool.query(
      'INSERT INTO lists (user_id, name, is_default) VALUES (?, ?, ?)',
      [newUser.id, 'My Day', true]
    );

    // ========== GENERATE JWT TOKEN ==========
    
    /**
     * Create JWT token for immediate authentication
     * Token includes:
     * - id: User's database ID
     * - username: User's username
     * - iat: Issued at timestamp (added automatically)
     * - exp: Expiration timestamp (7 days from now)
     */
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ========== RETURN SUCCESS RESPONSE ==========
    
    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ============================================
// POST /api/auth/login - User Login
// ============================================

/**
 * Authenticate existing user and generate JWT token
 * 
 * Request Body:
 * {
 *   "username": "string",
 *   "password": "string"
 * }
 * 
 * Response (200 OK):
 * {
 *   "user": { "id": number, "username": "string" },
 *   "token": "string" (JWT token valid for 7 days)
 * }
 * 
 * Security:
 * - Uses bcrypt.compare() to verify password hash
 * - Returns generic error message for both invalid username and password
 *   (prevents attackers from determining valid usernames)
 * 
 * Error Responses:
 * - 400: Missing fields
 * - 401: Invalid credentials
 * - 500: Server error
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // ========== INPUT VALIDATION ==========
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // ========== FIND USER ==========
    
    /**
     * Look up user by username
     * Retrieve password_hash for verification
     */
    const [users] = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );

    // If user doesn't exist, return generic error (security best practice)
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // ========== VERIFY PASSWORD ==========
    
    /**
     * Compare provided password with stored hash
     * bcrypt.compare() handles the hashing and comparison internally
     * Returns true if password matches, false otherwise
     */
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    // If password is wrong, return generic error (security best practice)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // ========== GENERATE JWT TOKEN ==========
    
    /**
     * Create new JWT token for this login session
     * Token payload contains user ID and username
     * Token expires in 7 days
     */
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ========== RETURN SUCCESS RESPONSE ==========
    
    res.json({
      user: {
        id: user.id,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ============================================
// GET /api/auth/me - Verify Token & Get Current User
// ============================================

/**
 * Verify JWT token and return current user info
 * 
 * This endpoint is used by the frontend to:
 * - Check if a stored token is still valid
 * - Get current user information
 * - Verify authentication status
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * {
 *   "id": number,
 *   "username": "string"
 * }
 * 
 * Error Responses:
 * - 401: No token provided
 * - 403: Invalid or expired token
 * - 404: User not found (token valid but user deleted)
 * - 500: Server error
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    /**
     * The authenticateToken middleware has already:
     * - Verified the JWT token
     * - Decoded the token payload
     * - Attached user info to req.user
     * 
     * We still query the database to ensure:
     * - User account still exists
     * - Get latest user information
     */
    const [users] = await pool.query(
      'SELECT id, username, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    // If user was deleted after token was issued
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info (excluding sensitive data)
    res.json({
      id: users[0].id,
      username: users[0].username
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
