/**
 * Tasks Routes
 * 
 * This module handles all task operations:
 * - Get tasks for a list (GET /api/lists/:listId/tasks)
 * - Get all important tasks (GET /api/tasks/important)
 * - Create new task (POST /api/lists/:listId/tasks)
 * - Update task (PATCH /api/tasks/:id)
 * - Delete task (DELETE /api/tasks/:id)
 * - Reorder tasks (PATCH /api/lists/:listId/tasks/reorder)
 * 
 * Security:
 * - All routes require JWT authentication
 * - Users can only access tasks in their own lists
 * - Task ownership is verified for all operations
 * 
 * Business Rules:
 * - Tasks are ordered by position (for drag-and-drop)
 * - Task titles are 1-500 characters
 * - Completing a task sets completed_at timestamp
 * - Uncompleting a task clears completed_at timestamp
 * - Tasks can be marked as important for special filtering
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
// GET /api/lists/:listId/tasks - Get All Tasks for List
// ============================================

/**
 * Get all tasks within a specific list
 * 
 * URL Parameters:
 * - listId: List ID containing the tasks
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * [
 *   {
 *     "id": number,
 *     "title": "string",
 *     "is_completed": 0 or 1,
 *     "is_important": 0 or 1,
 *     "position": number (for ordering),
 *     "completed_at": "ISO timestamp" or null,
 *     "created_at": "ISO timestamp",
 *     "updated_at": "ISO timestamp"
 *   },
 *   ...
 * ]
 * 
 * Sorting:
 * - Tasks are ordered by position (ASC)
 * - Position is used for drag-and-drop ordering
 * 
 * Security:
 * - Verifies list belongs to authenticated user
 * - Returns 404 if list doesn't exist or unauthorized
 * 
 * Error Responses:
 * - 401: No token or invalid token
 * - 404: List not found or unauthorized
 * - 500: Server error
 */
router.get('/lists/:listId/tasks', async (req, res) => {
  const { listId } = req.params;

  try {
    // ========== VERIFY LIST OWNERSHIP ==========
    
    /**
     * Check if list exists and belongs to authenticated user
     * This prevents users from accessing tasks in other users' lists
     */
    const [lists] = await pool.query(
      'SELECT id FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    // ========== RETRIEVE TASKS ==========
    
    /**
     * Get all tasks for the list, ordered by position
     * Position field enables drag-and-drop reordering
     * Lower position numbers appear first in the list
     */
    const [tasks] = await pool.query(
      'SELECT id, title, is_completed, is_important, position, completed_at, created_at, updated_at FROM tasks WHERE list_id = ? ORDER BY position ASC',
      [listId]
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// ============================================
// GET /api/tasks/important - Get All Important Tasks
// ============================================

/**
 * Get all tasks marked as important across all user's lists
 * 
 * This is used for the "Important" view that shows flagged tasks
 * from all lists in one place.
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * [
 *   {
 *     "id": number,
 *     "title": "string",
 *     "is_completed": 0 or 1,
 *     "is_important": 1,
 *     "position": number,
 *     "completed_at": "ISO timestamp" or null,
 *     "created_at": "ISO timestamp",
 *     "updated_at": "ISO timestamp",
 *     "list_id": number,
 *     "list_name": "string" (name of parent list)
 *   },
 *   ...
 * ]
 * 
 * Features:
 * - Joins with lists table to include list name
 * - Only returns tasks where is_important = 1
 * - Ordered by creation date (newest first)
 * 
 * Error Responses:
 * - 401: No token or invalid token
 * - 500: Server error
 */
router.get('/tasks/important', async (req, res) => {
  try {
    /**
     * Query important tasks across all user's lists
     * 
     * SQL JOIN explanation:
     * - tasks t: Main table
     * - lists l: Joined to get list name
     * - WHERE t.user_id = ?: Filter by authenticated user
     * - AND t.is_important = 1: Only flagged tasks
     * - ORDER BY t.created_at DESC: Newest first
     */
    const [tasks] = await pool.query(
      `SELECT t.id, t.title, t.is_completed, t.is_important, t.position, t.completed_at, t.created_at, t.updated_at, 
              l.id as list_id, l.name as list_name
       FROM tasks t
       JOIN lists l ON t.list_id = l.id
       WHERE t.user_id = ? AND t.is_important = 1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get important tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch important tasks' });
  }
});

// ============================================
// POST /api/lists/:listId/tasks - Create New Task
// ============================================

/**
 * Create a new task within a specific list
 * 
 * URL Parameters:
 * - listId: List ID where task will be created
 * 
 * Request Body:
 * {
 *   "title": "string" (1-500 chars, will be trimmed)
 * }
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (201 Created):
 * {
 *   "id": number,
 *   "title": "string",
 *   "is_completed": 0,
 *   "is_important": 0,
 *   "position": number (auto-calculated),
 *   "completed_at": null,
 *   "created_at": "ISO timestamp",
 *   "updated_at": "ISO timestamp"
 * }
 * 
 * Business Logic:
 * - Position is auto-calculated as MAX(position) + 1
 * - New tasks are added to the end of the list
 * - Default values: is_completed=0, is_important=0
 * 
 * Validation:
 * - Title is required and cannot be empty/whitespace
 * - Title is trimmed before storage
 * - Title must be 1-500 characters
 * 
 * Error Responses:
 * - 400: Invalid title (empty or too long)
 * - 401: No token or invalid token
 * - 404: List not found or unauthorized
 * - 500: Server error
 */
router.post('/lists/:listId/tasks', async (req, res) => {
  const { listId } = req.params;
  const { title } = req.body;

  try {
    // ========== INPUT VALIDATION ==========
    
    // Check if title is provided and not just whitespace
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Trim whitespace from title
    const trimmedTitle = title.trim();

    // Check maximum length (database column limit)
    if (trimmedTitle.length > 500) {
      return res.status(400).json({ error: 'Task title must not exceed 500 characters' });
    }

    // ========== VERIFY LIST OWNERSHIP ==========
    
    /**
     * Check if list exists and belongs to authenticated user
     * This prevents users from creating tasks in other users' lists
     */
    const [lists] = await pool.query(
      'SELECT id FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    // ========== CALCULATE POSITION ==========
    
    /**
     * Get the highest position number in this list
     * New task will be positioned at max_position + 1
     * 
     * COALESCE handles case when list has no tasks:
     * - If list is empty: MAX(position) returns NULL
     * - COALESCE(NULL, -1) returns -1
     * - -1 + 1 = 0 (first position)
     */
    const [maxPos] = await pool.query(
      'SELECT COALESCE(MAX(position), -1) as max_position FROM tasks WHERE list_id = ?',
      [listId]
    );

    const newPosition = maxPos[0].max_position + 1;

    // ========== CREATE TASK ==========
    
    /**
     * Insert new task into database
     * - list_id: Links task to parent list
     * - user_id: Links task to authenticated user (for easy querying)
     * - title: Trimmed task title
     * - position: Calculated position for ordering
     * - Default values set by database:
     *   - is_completed: 0
     *   - is_important: 0
     *   - completed_at: NULL
     *   - created_at: CURRENT_TIMESTAMP
     *   - updated_at: CURRENT_TIMESTAMP
     */
    const [result] = await pool.query(
      'INSERT INTO tasks (list_id, user_id, title, position) VALUES (?, ?, ?, ?)',
      [listId, req.user.id, trimmedTitle, newPosition]
    );

    const taskId = result.insertId;

    // ========== RETRIEVE CREATED TASK ==========
    
    /**
     * Fetch the newly created task to return complete data
     * Includes auto-generated ID and timestamps
     */
    const [tasks] = await pool.query(
      'SELECT id, title, is_completed, is_important, position, completed_at, created_at, updated_at FROM tasks WHERE id = ?',
      [taskId]
    );

    res.status(201).json(tasks[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ============================================
// PATCH /api/tasks/:id - Update Task
// ============================================

/**
 * Update a task's properties
 * 
 * This endpoint supports partial updates - only send the fields you want to change.
 * 
 * URL Parameters:
 * - id: Task ID to update
 * 
 * Request Body (all fields optional):
 * {
 *   "title": "string" (1-500 chars, will be trimmed),
 *   "is_completed": boolean (true/false),
 *   "is_important": boolean (true/false)
 * }
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * {
 *   "id": number,
 *   "title": "string",
 *   "is_completed": 0 or 1,
 *   "is_important": 0 or 1,
 *   "position": number,
 *   "completed_at": "ISO timestamp" or null,
 *   "created_at": "ISO timestamp",
 *   "updated_at": "ISO timestamp"
 * }
 * 
 * Business Logic:
 * - Completing (is_completed: true) sets completed_at timestamp
 * - Uncompleting (is_completed: false) clears completed_at
 * - Can update multiple fields in one request
 * - If no fields provided, returns task unchanged
 * 
 * Error Responses:
 * - 400: Invalid title (empty or too long)
 * - 401: No token or invalid token
 * - 404: Task not found or unauthorized
 * - 500: Server error
 */
router.patch('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, is_completed, is_important } = req.body;

  try {
    // ========== VERIFY TASK OWNERSHIP ==========
    
    /**
     * Check if task exists and belongs to authenticated user
     * This prevents users from updating other users' tasks
     */
    const [tasks] = await pool.query(
      'SELECT id, title, is_completed, is_important FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];
    
    // ========== BUILD DYNAMIC UPDATE QUERY ==========
    
    /**
     * Arrays to build SQL UPDATE statement dynamically
     * - updates: SQL fragments like "title = ?"
     * - values: Corresponding values for placeholders
     * 
     * This allows partial updates (only specified fields)
     */
    const updates = [];
    const values = [];

    // ========== HANDLE TITLE UPDATE ==========
    
    if (title !== undefined) {
      // Validate title if provided
      if (!title.trim()) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const trimmedTitle = title.trim();

      // Check maximum length
      if (trimmedTitle.length > 500) {
        return res.status(400).json({ error: 'Task title must not exceed 500 characters' });
      }

      updates.push('title = ?');
      values.push(trimmedTitle);
    }

    // ========== HANDLE COMPLETION STATUS UPDATE ==========
    
    if (is_completed !== undefined) {
      /**
       * Update is_completed flag (convert boolean to 1/0)
       * MySQL TINYINT(1) uses 1 for true, 0 for false
       */
      updates.push('is_completed = ?');
      values.push(is_completed ? 1 : 0);

      /**
       * Manage completed_at timestamp
       * - If completing: Set to current timestamp
       * - If uncompleting: Clear (set to NULL)
       */
      if (is_completed) {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      } else {
        updates.push('completed_at = NULL');
      }
    }

    // ========== HANDLE IMPORTANT FLAG UPDATE ==========
    
    if (is_important !== undefined) {
      /**
       * Update is_important flag (convert boolean to 1/0)
       * Used for filtering important tasks across all lists
       */
      updates.push('is_important = ?');
      values.push(is_important ? 1 : 0);
    }

    // ========== EXECUTE UPDATE ==========
    
    // If no fields to update, return current task unchanged
    if (updates.length === 0) {
      return res.json(task);
    }

    /**
     * Execute dynamic UPDATE query
     * - Join all update fragments with commas
     * - Add task ID to values array for WHERE clause
     * 
     * Example: UPDATE tasks SET title = ?, is_completed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?
     */
    values.push(id);
    await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // ========== RETRIEVE UPDATED TASK ==========
    
    /**
     * Fetch the updated task to return complete data
     * Includes updated_at timestamp (auto-updated by MySQL)
     */
    const [updatedTasks] = await pool.query(
      'SELECT id, title, is_completed, is_important, position, completed_at, created_at, updated_at FROM tasks WHERE id = ?',
      [id]
    );

    res.json(updatedTasks[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// ============================================
// DELETE /api/tasks/:id - Delete Task
// ============================================

/**
 * Delete a task permanently
 * 
 * URL Parameters:
 * - id: Task ID to delete
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (204 No Content):
 * (empty body)
 * 
 * Security:
 * - Verifies task belongs to authenticated user
 * 
 * Note:
 * - This is a permanent deletion
 * - Task position numbers are NOT automatically adjusted
 *   (gaps in position sequence are acceptable)
 * 
 * Error Responses:
 * - 401: No token or invalid token
 * - 404: Task not found or unauthorized
 * - 500: Server error
 */
router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // ========== VERIFY TASK OWNERSHIP ==========
    
    /**
     * Check if task exists and belongs to authenticated user
     * This prevents users from deleting other users' tasks
     */
    const [tasks] = await pool.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // ========== DELETE TASK ==========
    
    /**
     * Permanently remove task from database
     * Position gaps are acceptable - we don't need to reorder
     */
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    // Return 204 No Content (successful deletion, no response body)
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================
// PATCH /api/lists/:listId/tasks/reorder - Reorder Tasks
// ============================================

/**
 * Reorder tasks within a list (drag-and-drop)
 * 
 * This endpoint updates the position field for multiple tasks at once,
 * enabling drag-and-drop reordering in the UI.
 * 
 * URL Parameters:
 * - listId: List containing the tasks to reorder
 * 
 * Request Body:
 * {
 *   "taskOrders": [
 *     { "id": number, "position": number },
 *     { "id": number, "position": number },
 *     ...
 *   ]
 * }
 * 
 * Headers Required:
 * Authorization: Bearer <token>
 * 
 * Response (200 OK):
 * [
 *   {
 *     "id": number,
 *     "title": "string",
 *     "is_completed": 0 or 1,
 *     "is_important": 0 or 1,
 *     "position": number (updated),
 *     "completed_at": "ISO timestamp" or null,
 *     "created_at": "ISO timestamp",
 *     "updated_at": "ISO timestamp"
 *   },
 *   ...
 * ]
 * 
 * Business Logic:
 * - Each task in taskOrders has its position updated
 * - All tasks in the array are verified to belong to the user and list
 * - If any task is invalid, entire operation fails (no partial updates)
 * - Returns all tasks in the list (sorted by position) after reorder
 * 
 * Example Usage:
 * User drags task from position 2 to position 0:
 * {
 *   "taskOrders": [
 *     { "id": 5, "position": 0 },  // Moved task (was at 2)
 *     { "id": 3, "position": 1 },  // Shifted down (was at 0)
 *     { "id": 4, "position": 2 },  // Shifted down (was at 1)
 *     { "id": 6, "position": 3 }   // Unchanged (was at 3)
 *   ]
 * }
 * 
 * Error Responses:
 * - 400: Invalid taskOrders (empty array or wrong format)
 * - 401: No token or invalid token
 * - 404: List not found, or task not found/unauthorized
 * - 500: Server error
 */
router.patch('/lists/:listId/tasks/reorder', async (req, res) => {
  const { listId } = req.params;
  const { taskOrders } = req.body;

  try {
    // ========== INPUT VALIDATION ==========
    
    /**
     * Validate taskOrders is a non-empty array
     * Each element should have: { id: number, position: number }
     */
    if (!Array.isArray(taskOrders) || taskOrders.length === 0) {
      return res.status(400).json({ error: 'Task orders array is required' });
    }

    // ========== VERIFY LIST OWNERSHIP ==========
    
    /**
     * Check if list exists and belongs to authenticated user
     * This prevents users from reordering tasks in other users' lists
     */
    const [lists] = await pool.query(
      'SELECT id FROM lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (lists.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    // ========== UPDATE TASK POSITIONS ==========
    
    /**
     * Loop through each task and update its position
     * 
     * Security checks for each task:
     * 1. Task exists (id matches)
     * 2. Task belongs to authenticated user
     * 3. Task belongs to the specified list
     * 
     * If any task fails these checks, entire operation fails
     */
    for (const { id: taskId, position } of taskOrders) {
      // Verify task belongs to user and list
      const [tasks] = await pool.query(
        'SELECT id FROM tasks WHERE id = ? AND user_id = ? AND list_id = ?',
        [taskId, req.user.id, listId]
      );

      if (tasks.length === 0) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
      }

      // Update position for this task
      await pool.query(
        'UPDATE tasks SET position = ? WHERE id = ?',
        [position, taskId]
      );
    }

    // ========== RETRIEVE UPDATED TASKS ==========
    
    /**
     * Get all tasks in the list after reordering
     * Sorted by position to reflect new order
     * Returns complete task data for UI update
     */
    const [updatedTasks] = await pool.query(
      'SELECT id, title, is_completed, is_important, position, completed_at, created_at, updated_at FROM tasks WHERE list_id = ? ORDER BY position ASC',
      [listId]
    );

    res.json(updatedTasks);
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});

export default router;
