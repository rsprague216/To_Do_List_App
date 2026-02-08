# Quick Reference Guide

## Common Commands

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd to_do_list

# 2. Install all dependencies
cd client && npm install
cd ../server && npm install
cd .. && npm install

# 3. Configure environment
cd server
cp .env.example .env
# Edit .env with your MySQL credentials

# 4. Set up database
npm run setup-db

# 5. Start development servers
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

### Development

```bash
# Start backend server (http://localhost:3000)
cd server && npm run dev

# Start frontend dev server (http://localhost:5173)
cd client && npm run dev

# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run E2E tests (requires both servers running)
npm run test:e2e

# Watch mode for tests
cd client && npm test -- --watch
cd server && npm test:watch
```

### Testing

```bash
# Run all backend tests
cd server && npm test

# Run backend tests with coverage
cd server && npm test:coverage

# Run all frontend tests
cd client && npm test -- --run

# Run specific frontend test file
cd client && npm test -- --run Accessibility.test

# Run frontend tests with coverage
cd client && npm test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e -- --ui

# Run specific E2E test file
npm run test:e2e -- tests/auth.spec.js
```

### Database

```bash
# Set up database (creates tables)
cd server && npm run setup-db

# Verify database connection
cd server && node verify-db.js

# Connect to MySQL CLI
mysql -u root -p

# Use the database
USE todo_app;

# View tables
SHOW TABLES;

# View users
SELECT * FROM users;

# View lists
SELECT * FROM lists;

# View tasks
SELECT * FROM tasks;
```

### Build & Production

```bash
# Build frontend for production
cd client && npm run build

# Preview production build locally
cd client && npm run preview

# Start backend in production mode
cd server && NODE_ENV=production npm start

# Run security audit
npm audit

# Update dependencies
npm update
```

### Code Quality

```bash
# Lint frontend code
cd client && npm run lint

# Fix linting issues
cd client && npm run lint -- --fix
```

### Useful Utilities

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Check server health
curl http://localhost:3000/api/health

# Test API endpoints (with JWT)
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.token')

# 2. Use token in requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/lists
```

## VS Code Tasks

Use the built-in VS Code tasks for convenience:

1. **Open Command Palette**: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Type**: `Tasks: Run Task`
3. **Select**:
   - `Start Frontend` - Runs React dev server
   - `Start Backend` - Runs Express server

## Environment Variables

### Development (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_app
DB_PORT=3306
JWT_SECRET=your_secret_key
PORT=3000
NODE_ENV=development
```

### Production (.env)
```env
DB_HOST=production-db-host
DB_USER=app_user
DB_PASSWORD=strong_password_here
DB_NAME=todo_app_prod
DB_PORT=3306
JWT_SECRET=64_plus_character_random_string
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend Dev | 5173 | http://localhost:5173 |
| Backend API | 3000 | http://localhost:3000 |
| MySQL | 3306 | localhost:3306 |

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql --version
mysql -u root -p -e "SELECT 1;"

# Reset database
cd server
mysql -u root -p -e "DROP DATABASE IF EXISTS todo_app;"
npm run setup-db
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process (Mac/Linux)
kill -9 <PID>

# Find process using port 5173
lsof -i :5173
```

### Clear Node Modules
```bash
# Frontend
cd client
rm -rf node_modules package-lock.json
npm install

# Backend
cd server
rm -rf node_modules package-lock.json
npm install
```

### Test Failures
```bash
# Clear test cache
cd client && npm test -- --clearCache
cd server && npm test -- --clearCache

# Run tests in sequence (not parallel)
cd server && npm test -- --runInBand
```

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123"}'
```

### Get Lists (with token)
```bash
TOKEN="your_jwt_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/lists
```

### Create List
```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My New List"}'
```

### Create Task
```bash
curl -X POST http://localhost:3000/api/lists/1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My new task"}'
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
```

## Performance Monitoring

```bash
# Check frontend bundle size
cd client && npm run build
du -sh dist/

# Analyze backend memory usage
node --inspect index.js

# Monitor database connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

## Quick Links

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Health: http://localhost:3000/api/health
- Playwright Report: Run `npx playwright show-report` after E2E tests
- Test Coverage: Available after running `npm test:coverage`

## Documentation

- [README.md](./README.md) - Main documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview
- [FRONTEND_TEST_RESULTS.md](./FRONTEND_TEST_RESULTS.md) - Frontend test details
- [E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md) - E2E test details
