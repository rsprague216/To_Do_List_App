# To-Do List App - Backend Server

A RESTful API backend for a to-do list application built with Node.js, Express, and MySQL. Features JWT authentication, comprehensive test coverage, and fully documented code.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express 4** - Web application framework
- **MySQL 8** - Relational database
- **mysql2** - MySQL client with connection pooling and Promises
- **jsonwebtoken** - JWT authentication
- **bcrypt 6** - Password hashing
- **dotenv** - Environment variable management
- **Jest** - Testing framework with 49 passing tests

## Features

### Authentication & Security
- JWT-based authentication with 7-day token expiry
- Bcrypt password hashing (10 salt rounds)
- Protected routes with authentication middleware
- User isolation (users can only access their own data)
- Generic error messages to prevent username enumeration

### Lists Management
- Full CRUD operations for to-do lists
- Automatic creation of default "My Day" list on signup
- Duplicate list name prevention per user
- Protection for default lists (cannot be deleted)
- Cascade deletion (deleting a list deletes all its tasks)

### Tasks Management
- Full CRUD operations for tasks
- Task completion tracking with timestamps
- Important task flagging
- Drag-and-drop task reordering with position tracking
- Filter tasks by importance across all lists
- User isolation (users can only access their own tasks)

### Database
- MySQL with InnoDB engine
- Foreign key constraints for data integrity
- Cascade deletion for related records
- Indexed columns for optimized queries
- UTF-8 character support (utf8mb4)

### Testing
- 49 comprehensive tests covering all endpoints
- Authentication tests
- Lists CRUD tests
- Tasks CRUD tests
- Authorization and edge case tests
- See [TEST_RESULTS.md](TEST_RESULTS.md) for detailed results

## Project Structure

```
server/
├── db/
│   ├── connection.js        # MySQL connection pool
│   └── schema.sql           # Database schema
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── lists.js             # List CRUD endpoints
│   └── tasks.js             # Task CRUD endpoints
├── index.js                 # Express server entry point
├── setup-db.js              # Database initialization script
├── verify-db.js             # Database verification script
├── package.json             # Dependencies and scripts
├── BACKEND_DOCUMENTATION.md # Detailed API documentation
└── TEST_RESULTS.md          # Test coverage results
```

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "johndoe"
}
```

#### Verify Token
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "userId": 1,
  "username": "johndoe"
}
```

### Lists (`/api/lists`)

All list endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

#### Get All Lists
```http
GET /api/lists
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "My Day",
    "is_default": 1,
    "task_count": 5
  },
  {
    "id": 2,
    "name": "Work",
    "is_default": 0,
    "task_count": 3
  }
]
```

#### Get Single List
```http
GET /api/lists/:id
```

#### Create List
```http
POST /api/lists
Content-Type: application/json

{
  "name": "Shopping"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "name": "Shopping",
  "is_default": 0
}
```

#### Update List
```http
PUT /api/lists/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete List
```http
DELETE /api/lists/:id
```

**Note:** Cannot delete default lists. Deleting a list also deletes all its tasks.

### Tasks (`/api/tasks`)

All task endpoints require authentication.

#### Get Tasks for a List
```http
GET /api/lists/:listId/tasks
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "is_completed": 0,
    "is_important": 1,
    "position": 0,
    "created_at": "2026-02-08T10:00:00Z"
  }
]
```

#### Get All Important Tasks
```http
GET /api/tasks/important
```

#### Create Task
```http
POST /api/lists/:listId/tasks
Content-Type: application/json

{
  "title": "New task"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated task title",
  "is_completed": true,
  "is_important": false
}
```

#### Toggle Task Completion
```http
PUT /api/tasks/:id/complete
```

#### Toggle Task Importance
```http
PUT /api/tasks/:id/important
```

#### Reorder Tasks
```http
PUT /api/tasks/reorder
Content-Type: application/json

{
  "listId": 1,
  "taskOrders": [
    { "id": 5, "position": 0 },
    { "id": 3, "position": 1 },
    { "id": 1, "position": 2 }
  ]
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `created_at` - Account creation timestamp

### Lists Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `name` - List name (unique per user)
- `is_default` - Flag for default lists
- `created_at` - List creation timestamp

### Tasks Table
- `id` - Primary key
- `list_id` - Foreign key to lists table
- `user_id` - Foreign key to users table
- `title` - Task description
- `is_completed` - Completion status
- `is_important` - Importance flag
- `position` - Order position for drag-and-drop
- `completed_at` - Completion timestamp
- `created_at` - Task creation timestamp
- `updated_at` - Last update timestamp

All tables use cascade deletion for data integrity.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Environment Variables

Create a `.env` file in the server directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=todo_app
DB_PORT=3306

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3000
```

**Security Note:** Use strong, random values for `JWT_SECRET` in production. Never commit the `.env` file to version control.

### Installation

```bash
# Install dependencies
npm install
```

### Database Setup

```bash
# Initialize the database
npm run setup-db
```

This will:
- Create the `todo_app` database
- Create all required tables (users, lists, tasks)
- Set up foreign key constraints
- Create indexes for performance

### Running the Server

```bash
# Development mode (with auto-restart on file changes)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Results:** 49 tests passing with comprehensive coverage. See [TEST_RESULTS.md](TEST_RESULTS.md) for detailed results.

### Verify Database Connection

```bash
# Test database connection
node verify-db.js
```

## Development

### Adding New Routes

1. Create a new route file in `routes/` directory
2. Import and use the `authenticateToken` middleware for protected routes
3. Mount the route in `index.js`
4. Add comprehensive inline documentation
5. Write tests for all endpoints

### Code Documentation

All code is fully documented with:
- File-level documentation explaining purpose and responsibilities
- Function-level documentation with request/response formats
- Inline comments explaining business logic and security decisions

See [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) for detailed documentation standards.

## Security Features

- **Password Hashing:** Bcrypt with 10 salt rounds
- **JWT Tokens:** 7-day expiry, signed with secret key
- **Authorization:** All routes check user ownership before allowing access
- **SQL Injection Protection:** Parameterized queries with mysql2
- **Input Validation:** All inputs validated before processing
- **Error Handling:** Generic error messages to prevent information leakage
- **CORS Configuration:** Controlled cross-origin access

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Valid token but insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., username exists)
- `500 Internal Server Error` - Server error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Performance Considerations

- **Connection Pooling:** MySQL connection pool (max 10 connections)
- **Database Indexes:** Optimized queries with indexes on foreign keys
- **Prepared Statements:** All queries use parameterized statements
- **Efficient Queries:** Minimal database round trips
- **Sorting:** Database-level sorting for better performance

## Production Deployment

Before deploying to production:

1. Set strong `JWT_SECRET` in environment variables
2. Use a production-grade MySQL server
3. Enable MySQL SSL connections
4. Set up database backups
5. Configure rate limiting
6. Enable HTTPS/TLS
7. Set appropriate CORS origins
8. Use environment-specific configuration
9. Set up logging and monitoring
10. Review security checklist

See [../PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md) for complete deployment guide.

## Testing

The backend has comprehensive test coverage with 49 passing tests covering:

- User registration and login
- JWT token generation and verification
- List creation, retrieval, updating, and deletion
- Task creation, retrieval, updating, and deletion
- Task completion and importance toggling
- Task reordering functionality
- Authorization checks
- Edge cases and error handling

Run tests with: `npm test`

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) in the project root.

## License

This project is part of a full-stack to-do list application. See the main README in the project root for more information.

## Additional Documentation

- [BACKEND_DOCUMENTATION.md](BACKEND_DOCUMENTATION.md) - Detailed API and code documentation
- [TEST_RESULTS.md](TEST_RESULTS.md) - Comprehensive test results and coverage
- [../README.md](../README.md) - Main project documentation
- [../PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md) - Production deployment guide
- [../SECURITY_CHECKLIST.md](../SECURITY_CHECKLIST.md) - Security best practices
