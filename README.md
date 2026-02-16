# Full-Stack To-Do List Application

A modern to-do list application built with React, Vite, TailwindCSS on the frontend and Node.js with Express on the backend.

## Features

### Core Functionality
- ✅ User authentication (JWT-based)
- ✅ Multiple task lists with custom names
- ✅ Full CRUD operations for lists and tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Flag tasks as important
- ✅ Drag-and-drop task reordering with @dnd-kit
- ✅ Real-time task counter per list

### User Experience
- ✅ Clean and responsive UI with TailwindCSS
- ✅ Mobile-optimized with swipe gestures:
  - Swipe right to complete
  - Swipe left to delete
- ✅ Touch-friendly interface with larger tap targets
- ✅ Hamburger menu navigation for mobile

### Accessibility
- ✅ Full keyboard navigation support
- ✅ Screen reader compatible
- ✅ ARIA labels and semantic HTML
- ✅ WCAG 2.1 compliant

### Backend
- ✅ RESTful API with Express
- ✅ MySQL database with connection pooling
- ✅ JWT authentication and authorization
- ✅ Input validation and error handling

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **@dnd-kit** - Drag-and-drop library
- **Vitest** - Unit and integration testing
- **@testing-library/react** - Component testing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MySQL** - Relational database
- **mysql2** - MySQL client with connection pooling
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **cors** - Cross-origin resource sharing

### E2E Testing
- **Playwright** - Browser automation and testing

## Project Structure

```
.
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── auth/          # Authentication components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── SignUpForm.jsx
│   │   │   ├── layout/        # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── MainContent.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── lists/         # List components
│   │   │   │   ├── ListItem.jsx
│   │   │   │   └── NewListButton.jsx
│   │   │   └── tasks/         # Task components
│   │   │       ├── AddTaskInput.jsx
│   │   │       ├── CompletedTasksSection.jsx
│   │   │       ├── TaskItem.jsx
│   │   │       └── TaskList.jsx
│   │   ├── context/           # React context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useLists.js
│   │   │   └── useTasks.js
│   │   ├── pages/             # Page components
│   │   │   ├── AppPage.jsx
│   │   │   └── AuthPage.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── localStorage.js
│   │   │   └── validation.js
│   │   ├── __tests__/         # Component tests
│   │   ├── App.jsx            # Main app component with routing
│   │   ├── App.css            # Additional styles
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Tailwind directives
│   ├── public/                # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vitest.config.js       # Testing configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── eslint.config.js
│
├── server/                     # Backend application
│   ├── db/                    # Database
│   │   ├── connection.js      # MySQL connection pool
│   │   └── schema.sql         # Database schema
│   ├── middleware/            # Express middleware
│   │   └── auth.js            # JWT authentication
│   ├── routes/                # API routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── lists.js           # Lists CRUD
│   │   └── tasks.js           # Tasks CRUD
│   ├── index.js               # Express server entry point
│   ├── setup-db.js            # Database setup script
│   ├── verify-db.js           # Database verification script
│   └── package.json
│
├── e2e/                        # End-to-end tests
│   ├── auth.spec.js
│   ├── lists.spec.js
│   └── tasks.spec.js
│
├── README.md                   # Main documentation
├── PROJECT_SUMMARY.md          # Project overview
├── QUICK_REFERENCE.md          # Common commands
├── CODE_DOCUMENTATION.md       # Code commenting standards
├── DEVELOPMENT_PROCESS.md      # Development journey
├── DESIGN_PROCESS.md           # Design methodology
├── PRODUCTION_CHECKLIST.md     # Production deployment guide
├── CONTRIBUTING.md             # Contribution guidelines
├── FRONTEND_TEST_RESULTS.md    # Frontend test results
├── E2E_TEST_RESULTS.md         # E2E test results
├── FINAL_REPORT.md             # Project final report
└── playwright.config.js        # Playwright configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL (v8.0 or higher)

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_app
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secure_random_secret_key_here

# Server Configuration
PORT=3000
```

⚠️ **Security Note**: Never commit the `.env` file to version control. Use strong, randomly generated values for `JWT_SECRET` in production.

### Installation

1. Install frontend dependencies:
```bash
cd client
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
```

### Database Setup

1. Ensure MySQL is running on your system

2. Create the database and tables:
```bash
cd server
npm run setup-db
```

This will create the `todo_app` database with the following tables:
- `users` - User accounts with hashed passwords
- `lists` - Task lists owned by users
- `tasks` - Individual tasks within lists

### Running the Application

You can run the application using VS Code tasks or manually:

#### Using VS Code Tasks

1. Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Tasks: Run Task"
3. Select "Start Frontend" to run the React app
4. Repeat and select "Start Backend" to run the Express server

#### Manual Start

1. Start the backend server:
```bash
cd server
npm run dev
```
The server will run on http://localhost:3000

2. In a new terminal, start the frontend:
```bash
cd client
npm run dev
```
The app will run on http://localhost:5173

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current authenticated user

#### Lists
- `GET /api/lists` - Get all lists for authenticated user
- `GET /api/lists/:id` - Get single list by ID
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id` - Update list name
- `DELETE /api/lists/:id` - Delete list and all its tasks

#### Tasks
- `GET /api/lists/:listId/tasks` - Get all tasks for a list
- `GET /api/tasks/important` - Get all important tasks across all lists
- `POST /api/lists/:listId/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update task (title, is_completed, is_important)
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/lists/:listId/tasks/reorder` - Reorder tasks via drag-and-drop

## Usage

1. Open http://localhost:5173 in your browser
2. Add tasks using the input field
3. Click checkboxes to mark tasks as complete
4. Click "Delete" to remove tasks
5. View remaining tasks counter at the bottom

## Development

- Frontend runs with hot module replacement (HMR) for instant updates
- Backend uses Node's `--watch` flag for auto-restart on file changes
- Data persists in MySQL database

### Testing

The application has comprehensive test coverage at the frontend and E2E layers:

#### Frontend Tests (66 tests)
```bash
cd client
npm test
```
Includes:
- **Unit Tests** (42): Individual component testing
- **Integration Tests** (5): Component interaction flows
- **Accessibility Tests** (19): WCAG compliance, keyboard navigation, screen readers

#### E2E Tests (29 tests passing, 9 skipped)
```bash
npm run test:e2e
```
End-to-end tests using Playwright covering full user workflows.

**Total: 95 tests (66 frontend + 29 E2E)**

See [FRONTEND_TEST_RESULTS.md](./FRONTEND_TEST_RESULTS.md) and [E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md) for detailed results.

### Code Coverage

Run tests with coverage reports:
```bash
cd client
npm test -- --coverage

cd server
npm test -- --coverage
```

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` (64+ random characters)
- [ ] Use production MySQL database (not localhost)
- [ ] Enable MySQL SSL/TLS connections
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific `.env` files
- [ ] Enable rate limiting on API endpoints
- [ ] Configure CORS for specific origins (not `*`)
- [ ] Set up database backups
- [ ] Enable HTTPS/TLS for all connections
- [ ] Use a reverse proxy (nginx) in front of Node.js
- [ ] Set up monitoring and logging
- [ ] Configure database connection pooling limits

### Deployment Options

#### Frontend
- **Vercel**: `cd client && vercel deploy`
- **Netlify**: `cd client && npm run build` then deploy `dist/`
- **AWS S3 + CloudFront**: Static hosting

#### Backend
- **Railway**: MySQL + Node.js hosting
- **Render**: Web service with MySQL database
- **AWS EC2 + RDS**: Full control, scalable
- **DigitalOcean**: App Platform + Managed Database

#### Database
- Use managed MySQL services for production:
  - AWS RDS for MySQL
  - Google Cloud SQL
  - PlanetScale
  - DigitalOcean Managed Database

### Environment Variables (Production)

Update `.env` for production:
```env
DB_HOST=your-production-db-host
DB_USER=app_user
DB_PASSWORD=strong_random_password
DB_NAME=todo_app_prod
DB_PORT=3306
JWT_SECRET=very_long_random_string_64_plus_characters
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

## License

MIT

## Documentation

This project includes comprehensive documentation:

- **[README.md](./README.md)** - This file: Main project documentation
- **[FINAL_REPORT.md](./FINAL_REPORT.md)** - Complete project summary and achievements
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview and statistics
- **[DESIGN_PROCESS.md](./DESIGN_PROCESS.md)** - Pre-development design methodology and AI collaboration
- **[DEVELOPMENT_PROCESS.md](./DEVELOPMENT_PROCESS.md)** - Implementation journey and lessons learned
- **[CODE_DOCUMENTATION.md](./CODE_DOCUMENTATION.md)** - Code commenting standards and examples
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Production deployment checklist
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common commands and troubleshooting
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to this project
- **[FRONTEND_TEST_RESULTS.md](./FRONTEND_TEST_RESULTS.md)** - Frontend test documentation (66 tests)
- **[E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md)** - E2E test results (29 tests)
- **[todo_app_design_document.md](./todo_app_design_document.md)** - Original design specifications
- **[wireframe_specification.md](./wireframe_specification.md)** - UI wireframes and specifications

---

**Project Status**: 🚀 Production Ready | **Tests**: 95 (66 Frontend + 29 E2E) | **Accessibility**: WCAG 2.1 AA ✅
