# Backend Documentation

## Overview

This is a fully documented Node.js/Express.js backend for a to-do list application with comprehensive inline code comments explaining every aspect of the system.

## Documentation Standards

All backend files have been thoroughly documented with:

### 1. **File-level Documentation**
Every file starts with a comprehensive header explaining:
- Purpose of the module
- Main responsibilities
- Security features
- Business rules
- Usage examples

### 2. **Function-level Documentation**
Every route/function includes:
- Description of what it does
- Request/response formats
- URL parameters and headers
- Validation rules
- Error responses
- Business logic explanation
- Security considerations

### 3. **Code-level Comments**
Complex code sections include:
- Step-by-step explanations
- SQL query explanations
- Security reasoning
- Edge case handling
- Database design decisions

## Documented Files

### Core Server Files

#### `index.js`
- Server initialization and configuration
- Middleware setup (CORS, JSON parsing)
- Route mounting with detailed explanations
- Health check endpoint
- Route ordering (critical for proper operation)

#### `db/connection.js`
- MySQL connection pool configuration
- Connection pool benefits explained
- Configuration parameters documented
- Connection testing logic
- Error handling

#### `middleware/auth.js`
- JWT token verification middleware
- Token extraction from headers
- Security validation process
- Error handling (401 vs 403)
- User info attachment to requests

### Route Files

#### `routes/auth.js`
**Endpoints:**
- `POST /api/auth/register` - User registration with auto-list creation
- `POST /api/auth/login` - User authentication with JWT generation
- `GET /api/auth/me` - Token verification and user info retrieval

**Documentation includes:**
- Password hashing with bcrypt (10 salt rounds)
- JWT token generation (7-day expiry)
- Input validation logic
- Duplicate username checking
- Default "My Day" list creation
- Security best practices (generic error messages)

#### `routes/lists.js`
**Endpoints:**
- `GET /api/lists` - Get all user's lists
- `GET /api/lists/:id` - Get specific list
- `POST /api/lists` - Create new list
- `PUT /api/lists/:id` - Update/rename list
- `DELETE /api/lists/:id` - Delete list and cascade tasks

**Documentation includes:**
- User isolation (WHERE user_id filtering)
- Default list protection (cannot rename/delete "My Day")
- Duplicate name checking
- Whitespace trimming
- Cascade deletion explanation
- Sorting logic (default lists first)

#### `routes/tasks.js`
**Endpoints:**
- `GET /api/lists/:listId/tasks` - Get all tasks in a list
- `GET /api/tasks/important` - Get all important tasks across lists
- `POST /api/lists/:listId/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task (title, completion, importance)
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/lists/:listId/tasks/reorder` - Reorder tasks (drag-and-drop)

**Documentation includes:**
- Position-based ordering system
- Automatic position calculation (MAX + 1)
- Dynamic update query building
- Completion timestamp management
- Important task filtering with JOIN
- Drag-and-drop reordering logic
- Partial update support

## Security Documentation

Every security feature is documented:

### Authentication
- JWT token creation and verification
- Password hashing with bcrypt
- Token expiration (7 days)
- Bearer token format

### Authorization
- User isolation (all queries filter by user_id)
- List ownership verification
- Task ownership verification
- Cross-user access prevention

### Input Validation
- Required field checking
- Length limits (usernames: 255 chars, list names: 255 chars, task titles: 500 chars)
- Whitespace trimming
- Empty value rejection

### SQL Injection Prevention
- Parameterized queries (? placeholders)
- No string concatenation in SQL
- mysql2 library automatic escaping

## Business Logic Documentation

All business rules are clearly explained:

### User Management
- Username uniqueness per application
- Password minimum 6 characters
- Username minimum 3 characters
- Automatic "My Day" list creation on registration

### List Management
- List names unique per user (not globally)
- Default list protection (cannot rename/delete "My Day")
- Lists sorted: default first, then by creation date
- Deleting list cascades to delete all tasks

### Task Management
- Tasks ordered by position field (0, 1, 2...)
- New tasks added to end (position = MAX + 1)
- Completing sets completed_at timestamp
- Uncompleting clears completed_at
- Important flag for cross-list filtering
- Position gaps acceptable (no reordering after delete)

## Database Design Documentation

All database interactions are explained:

### Connection Pool
- 10 concurrent connections
- Automatic connection reuse
- Queue management for high load
- utf8mb4 charset for emoji support

### Query Patterns
- SELECT with user_id filtering for security
- INSERT with RETURNING pattern (get created record)
- UPDATE with WHERE user_id for security
- DELETE with CASCADE behavior
- COALESCE for NULL handling
- JOIN for cross-table queries

### Timestamps
- created_at: Auto-set on INSERT
- updated_at: Auto-updated on UPDATE
- completed_at: Manually managed (NULL or timestamp)

## Error Handling Documentation

Every error response is documented:

### HTTP Status Codes
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - No token or invalid token
- `403 Forbidden` - Valid token but forbidden action
- `404 Not Found` - Resource doesn't exist or unauthorized
- `409 Conflict` - Duplicate username/list name
- `500 Internal Server Error` - Database or server error

### Error Messages
- User-friendly messages (not technical database errors)
- Generic messages for security (username vs password)
- Specific validation errors (what's wrong and limits)
- Consistent error format: `{ "error": "message" }`

## How to Read the Code

1. **Start with file headers** - Understand module purpose
2. **Read endpoint documentation** - Understand API contract
3. **Follow code sections** - Marked with `==========` separators
4. **Read inline comments** - Understand complex logic
5. **Check security notes** - Understand protection mechanisms

## Testing Against Documentation

All documented features have been tested:
- 49 total tests passed
- All validation rules verified
- All security features confirmed
- All edge cases handled

See `TEST_RESULTS.md` for complete test documentation.

## Maintenance Notes

When modifying this backend:

1. **Update documentation** if changing behavior
2. **Follow existing patterns** for consistency
3. **Maintain security checks** (user_id filtering)
4. **Keep comments in sync** with code changes
5. **Test thoroughly** after changes

## Example: Reading a Route

```javascript
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
 * ...
 */
router.post('/lists/:listId/tasks', async (req, res) => {
  // ========== INPUT VALIDATION ==========
  
  // Check if title is provided and not just whitespace
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  // ... more code with explanations
});
```

Every section is clearly labeled and explained!

## Next Steps

The backend is complete and production-ready. Next phase is frontend development using this well-documented API.
