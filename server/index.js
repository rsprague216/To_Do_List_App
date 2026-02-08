/**
 * To-Do List Application - Main Server File
 * 
 * This is the entry point for the Express.js backend server.
 * It handles:
 * - Server initialization and configuration
 * - Middleware setup (CORS, JSON parsing)
 * - Route mounting for authentication, lists, and tasks
 * - Health check endpoint
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import listsRoutes from './routes/lists.js';
import tasksRoutes from './routes/tasks.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * CORS (Cross-Origin Resource Sharing)
 * Allows the frontend (running on different port) to make requests to this API
 */
app.use(cors());

/**
 * JSON Body Parser
 * Automatically parses incoming JSON request bodies and makes data available in req.body
 */
app.use(express.json());

// ============================================
// API ROUTES
// ============================================

/**
 * Health Check Endpoint
 * Simple endpoint to verify the server is running
 * Used for monitoring and deployment verification
 * 
 * IMPORTANT: This must come BEFORE /api route to avoid being caught by auth middleware
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * Authentication Routes - /api/auth/*
 * Handles user registration, login, and token verification
 * See: routes/auth.js
 */
app.use('/api/auth', authRoutes);

/**
 * Lists Routes - /api/lists/*
 * Handles CRUD operations for to-do lists
 * See: routes/lists.js
 */
app.use('/api/lists', listsRoutes);

/**
 * Tasks Routes - /api/lists/:listId/tasks/* and /api/tasks/*
 * Handles CRUD operations for tasks within lists
 * See: routes/tasks.js
 * 
 * IMPORTANT: This uses /api/* which is very broad - must come after other /api routes
 */
app.use('/api', tasksRoutes);

// ============================================
// START SERVER
// ============================================

/**
 * Start the Express server on the specified port
 * Listens for incoming HTTP requests
 */
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
