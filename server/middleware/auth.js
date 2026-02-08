/**
 * Authentication Middleware
 * 
 * This middleware protects routes by verifying JWT tokens.
 * It ensures that only authenticated users can access protected endpoints.
 * 
 * Usage:
 * Add to any route that requires authentication:
 * router.get('/protected', authenticateToken, (req, res) => { ... });
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables for JWT_SECRET
dotenv.config();

/**
 * JWT Authentication Middleware
 * 
 * Verifies the JWT token sent in the Authorization header.
 * 
 * Expected Header Format:
 * Authorization: Bearer <token>
 * 
 * How it works:
 * 1. Extracts token from Authorization header
 * 2. Verifies token signature and expiration using JWT_SECRET
 * 3. Decodes token payload (contains user id and username)
 * 4. Attaches decoded user info to req.user for use in route handlers
 * 5. Calls next() to proceed to the route handler
 * 
 * Security:
 * - Returns 401 if no token provided (Unauthorized)
 * - Returns 403 if token is invalid or expired (Forbidden)
 * - Token must be signed with the same JWT_SECRET used during login
 * - Tokens expire after 7 days (set during token creation)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticateToken = (req, res, next) => {
  // Extract Authorization header (format: "Bearer TOKEN")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token after "Bearer "

  // If no token provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  /**
   * Verify JWT Token
   * 
   * jwt.verify() checks:
   * - Token signature is valid (not tampered with)
   * - Token hasn't expired
   * - Token was signed with our JWT_SECRET
   */
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired, return 403 Forbidden
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    /**
     * Attach user info to request object
     * 
     * The decoded token payload contains:
     * - id: User's database ID
     * - username: User's username
     * - iat: Issued at timestamp
     * - exp: Expiration timestamp
     * 
     * This makes user info available in all subsequent route handlers
     * via req.user.id and req.user.username
     */
    req.user = user;
    
    // Token is valid, proceed to the route handler
    next();
  });
};
