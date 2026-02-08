/**
 * MySQL Database Connection Pool
 * 
 * This module creates and exports a MySQL connection pool that is shared
 * across the entire application. Using a connection pool is more efficient
 * than creating new connections for each query.
 * 
 * Connection Pool Benefits:
 * - Reuses existing connections instead of creating new ones
 * - Manages connection lifecycle automatically
 * - Handles concurrent requests efficiently
 * - Limits maximum number of simultaneous connections
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Create MySQL Connection Pool
 * 
 * Configuration:
 * - host: Database server address (default: localhost)
 * - user: Database username (default: root)
 * - password: Database password (from .env)
 * - database: Database name (default: todo_app)
 * - port: Database port (default: 3306)
 * - waitForConnections: Queue requests when all connections are in use
 * - connectionLimit: Maximum number of connections in pool (10)
 * - queueLimit: Maximum number of queued requests (0 = unlimited)
 * - charset: utf8mb4 for full Unicode support (emojis, etc.)
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Test Database Connection
 * 
 * Attempts to get a connection from the pool on startup to verify:
 * - Database server is running
 * - Credentials are correct
 * - Database exists and is accessible
 * 
 * This is a non-blocking test - server will still start even if it fails,
 * but errors will be logged for debugging.
 */
pool.getConnection()
  .then(connection => {
    console.log('✓ Connected to MySQL database');
    connection.release(); // Return connection to pool
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err.message);
  });

// Export pool for use throughout the application
export default pool;
