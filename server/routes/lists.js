/**
 * Lists Routes
 * 
 * This module handles all to-do list operations:
 * - Get all lists (GET /api/lists)
 * - Get specific list (GET /api/lists/:id)
 * - Create new list (POST /api/lists)
 * - Update/rename list (PUT /api/lists/:id)
 * - Delete list (DELETE /api/lists/:id)
 * 
 * Security:
 * - All routes require JWT authentication
 * - Users can only access their own lists
 * - Default "My Day" list is protected from rename/delete
 * 
 * Business Rules:
 * - Each user gets a "My Day" default list on registration
 * - List names must be unique per user
 * - List names are 1-255 characters
 * - Deleting a list cascades to delete all its tasks
 */

import express from 'express';
import pool from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Apply authentication middleware to ALL routes in this module
 * Every endpoint requires a valid JWT token
 */
router.use(authenticateToken);

// ============================================
// GET /api/lists - Get All Lists
// ============================================

/**
 * Get all lists for the authenticated user
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * [
 *   {
 *     "id": number,
 *     "name": "string",
 *     "is_default": 0 or 1,
 *     "created_at": "ISO timestamp"
 *   },
 *   ...
 * ]
 * 
 * Sorting:
 * - Default lists first (is_default DESC)
 * - Then by creation date (created_at ASC)
 * - Ensures "My Day" always appears first
 * 
 * Error Responses:
 * - 401: No token or invalid token
 * - 500: Server error
 */
router.get('/', async (req, res) => {
  try {
    /**
     * Query user's lists with security filter
     * WHERE user_id = ? ensures users only see their own lists
     * req.user.id comes from the authenticateToken middleware
     */
    const [lists] = await pool.query(
      'SELECT id, name, is_default, created_at FROM lists WHERE user_id = ? ORDER BY is_default DESC, created_at ASC',
      [req.user.id]
    );

    res.json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

// ============================================
// GET /api/lists/:id - Get Specific List
// ============================================

/**
 * Get details for a specific list
 * 
 * URL Parameters:
 * - id: List ID
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * {
 *   "id": number,
 *   "name": "string",
 *   "is_default": 0 or 1,
 *   "created_at": "ISO timestamp"
 * }
 * 
 * Security:
 * - Verifies list belongs to authenticated user
 * - Returns 404 if list doesn't exist or belongs to another user
 * 
 * Error Responses:
 * - 401: No token or invalid token
 * - 404: List not found or unauthorized
 * - 500: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    /**
     * Query list with dual security filter:
     * 1. id = ? - Match the requested list
     * 2. user_id = ? - Ensure it belongs to authenticated user
     * 
     * This prevents users from accessing other users' lists
     */
    const [lists] = await pool.query(
      'SELECT id, name, is_default, created_at FROM lists WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    // If no results, either list doesn't exist or belongs to another user
    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json(lists[0]);
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// ============================================
// POST /api/lists - Create New List
// ============================================

/**
 * Create a new to-do list
 * 
 * Request Body:
 * {
 *   "name": "string" (1-255 chars, will be trimmed)
 * }
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (201 Created):
 * {
 *   "id": number,
 *   "name": "string",
 *   "is_default": 0,
 *   "created_at": "ISO timestamp"
 * }
 * 
 * Validation:
 * - Name is required and cannot be empty/whitespace
 * - Name is trimmed before storage
 * - Name must be 1-255 characters
 * - Name must be unique for this user
 * 
 * Error Responses:
 * - 400: Invalid name (empty or too long)
 * - 401: No token or invalid token
 * - 409: List name already exists for this user
 * - 500: Server error
 */
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    // ========== INPUT VALIDATION ==========
    
    // Check if name is provided and not just whitespace
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }

    // Trim whitespace from name
    const trimmedName = name.trim();

    // Check maximum length (database column limit)
    if (trimmedName.length > 255) {
      return res.status(400).json({ error: 'List name must not exceed 255 characters' });
    }

    // ========== CHECK FOR DUPLICATE NAME ==========
    
    /**
     * Ensure list name is unique for this user
     * Different users can have lists with the same name
     */
    const [existing] = await pool.query(
      'SELECT id FROM lists WHERE user_id = ? AND name = ?',
      [req.user.id, trimmedName]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'List with this name already exists' });
    }

    // ========== CREATE LIST ==========
    
    /**
     * Insert new list into database
     * - user_id: Links list to authenticated user
     * - name: Trimmed list name
     * - is_default: false (only "My Day" is default)
     */
    const [result] = await pool.query(
      'INSERT INTO lists (user_id, name, is_default) VALUES (?, ?, ?)',
      [req.user.id, trimmedName, false]
    );

    const listId = result.insertId;

    // ========== RETRIEVE CREATED LIST ==========
    
    /**
     * Fetch the newly created list to return complete data
     * Includes auto-generated ID and timestamp
     */
    const [lists] = await pool.query(
      'SELECT id, name, is_default, created_at FROM lists WHERE id = ?',
      [listId]
    );

    res.status(201).json(lists[0]);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// ============================================
// PUT /api/lists/:id - Update/Rename List
// ============================================

/**
 * Update a list's name (rename)
 * 
 * URL Parameters:
 * - id: List ID to update
 * 
 * Request Body:
 * {
 *   "name": "string" (1-255 chars, will be trimmed)
 * }
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * {
 *   "id": number,
 *   "name": "string" (new name),
 *   "is_default": 0 or 1,
 *   "created_at": "ISO timestamp"
 * }
 * 
 * Business Rules:
 * - Cannot rename default "My Day" list
 * - New name must be unique for this user
 * - Name is trimmed before validation
 * 
 * Error Responses:
 * - 400: Invalid name (empty or too long)
 * - 401: No token or invalid token
 * - 403: Attempting to rename default list
 * - 404: List not found or unauthorized
 * - 409: New name already exists for this user
 * - 500: Server error
 */
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  const listId = req.params.id;

  try {
    // ========== INPUT VALIDATION ==========
    
    // Check if name is provided and not just whitespace
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }

    // Trim whitespace from name
    const trimmedName = name.trim();

    // Check maximum length (database column limit)
    if (trimmedName.length > 255) {
      return res.status(400).json({ error: 'List name must not exceed 255 characters' });
    }

    // ========== VERIFY LIST EXISTS AND OWNERSHIP ==========
    
    /**
     * Check if list exists and belongs to authenticated user
     * Also retrieve is_default flag to check protection
     */
    const [lists] = await pool.query(
      'SELECT id, is_default FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    // ========== CHECK DEFAULT LIST PROTECTION ==========
    
    /**
     * Protect default "My Day" list from being renamed
     * This ensures users always have their default list
     */
    if (lists[0].is_default) {
      return res.status(403).json({ error: 'Cannot rename default list' });
    }

    // ========== CHECK FOR DUPLICATE NAME ==========
    
    /**
     * Ensure new name is unique for this user
     * Exclude current list from duplicate check (id != ?)
     */
    const [existing] = await pool.query(
      'SELECT id FROM lists WHERE user_id = ? AND name = ? AND id != ?',
      [req.user.id, trimmedName, listId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'List with this name already exists' });
    }

    // ========== UPDATE LIST NAME ==========
    
    /**
     * Update the list name in database
     * updated_at timestamp is automatically updated by MySQL trigger
     */
    await pool.query(
      'UPDATE lists SET name = ? WHERE id = ?',
      [trimmedName, listId]
    );

    // ========== RETRIEVE UPDATED LIST ==========
    
    /**
     * Fetch the updated list to return complete data
     */
    const [updatedLists] = await pool.query(
      'SELECT id, name, is_default, created_at FROM lists WHERE id = ?',
      [listId]
    );

    res.json(updatedLists[0]);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// ============================================
// DELETE /api/lists/:id - Delete List
// ============================================

/**
 * Delete a to-do list and all its tasks
 * 
 * URL Parameters:
 * - id: List ID to delete
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (204 No Content):
 * (empty body)
 * 
 * Business Rules:
 * - Cannot delete default "My Day" list
 * - Deleting a list cascades to delete all its tasks (database foreign key)
 * 
 * Security:
 * - Verifies list belongs to authenticated user
 * 
 * Error Responses:
 * - 401: No token or invalid token
 * - 403: Attempting to delete default list
 * - 404: List not found or unauthorized
 * - 500: Server error
 */
router.delete('/:id', async (req, res) => {
  const listId = req.params.id;

  try {
    // ========== VERIFY LIST EXISTS AND OWNERSHIP ==========
    
    /**
     * Check if list exists and belongs to authenticated user
     * Also retrieve is_default flag to check protection
     */
    const [lists] = await pool.query(
      'SELECT id, is_default FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    // ========== CHECK DEFAULT LIST PROTECTION ==========
    
    /**
     * Protect default "My Day" list from deletion
     * This ensures users always have at least one list
     */
    if (lists[0].is_default) {
      return res.status(403).json({ error: 'Cannot delete default list' });
    }

    // ========== DELETE LIST ==========
    
    /**
     * Delete the list from database
     * 
     * CASCADE behavior (defined in database schema):
     * When a list is deleted, all tasks in that list are automatically deleted
     * This is enforced by the foreign key constraint on tasks.list_id
     */
    await pool.query(
      'DELETE FROM lists WHERE id = ?',
      [listId]
    );

    // Return 204 No Content (successful deletion, no response body)
    res.status(204).send();
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

export default router;
