# To-Do List App - Frontend

The frontend for a modern, full-stack to-do list application built with React, Vite, and TailwindCSS.

## Tech Stack

- **React 19** - UI library with modern hooks
- **Vite 7** - Fast build tool and dev server with HMR
- **TailwindCSS 3** - Utility-first CSS framework
- **React Router Dom 7** - Client-side routing
- **@dnd-kit** - Modern drag-and-drop library for task reordering
- **Vitest** - Fast unit testing framework
- **@testing-library/react** - Component testing utilities

## Features

### Authentication
- User login and signup with JWT
- Protected routes with authentication context
- Password confirmation on signup
- Persistent authentication across sessions

### Task Management
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Flag important tasks
- Drag-and-drop task reordering within lists
- Real-time task counters

### List Management
- Multiple task lists with custom names
- Inline list creation in sidebar
- Delete lists with confirmation
- Switch between lists seamlessly

### Mobile Experience
- Responsive design for all screen sizes
- Touch-friendly interface with larger tap targets
- Swipe gestures:
  - Swipe right to complete tasks
  - Swipe left to delete tasks
- Hamburger menu navigation for mobile devices

### Accessibility
- Full keyboard navigation support
- Screen reader compatible with ARIA labels
- Semantic HTML structure
- WCAG 2.1 compliant

## Project Structure

```
client/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   ├── auth/                # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignUpForm.jsx
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.jsx       # App header with logout
│   │   │   ├── MainContent.jsx  # Main task view with CRUD
│   │   │   └── Sidebar.jsx      # List navigation and creation
│   │   ├── lists/               # List management components
│   │   │   ├── ListItem.jsx
│   │   │   └── NewListButton.jsx
│   │   └── tasks/               # Task components
│   │       ├── AddTaskInput.jsx
│   │       ├── CompletedTasksSection.jsx
│   │       ├── TaskItem.jsx
│   │       └── TaskList.jsx
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── hooks/                   # Custom React hooks
│   │   ├── useLists.js          # List management logic
│   │   └── useTasks.js          # Task management logic
│   ├── pages/
│   │   ├── AppPage.jsx          # Main app layout
│   │   └── AuthPage.jsx         # Login/signup page
│   ├── services/                # API services
│   │   └── api.js               # Axios client with interceptors
│   ├── utils/                   # Utility functions
│   │   ├── constants.js         # App constants
│   │   ├── localStorage.js      # Local storage helpers
│   │   └── validation.js        # Input validation
│   ├── __tests__/               # Component and integration tests
│   ├── test/                    # Test utilities
│   │   └── setup.js
│   ├── App.jsx                  # Root component with routing
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Tailwind directives
│   └── App.css                  # Additional styles
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── vitest.config.js             # Vitest configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see `/server` directory)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the dev server (runs on http://localhost:5173)
npm run dev
```

### Building for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Environment Variables

The frontend communicates with the backend API. Make sure the backend server is running on `http://localhost:3000` or update the API base URL in [src/utils/constants.js](src/utils/constants.js).

## API Integration

The frontend makes requests to the following backend endpoints:

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current authenticated user

### Lists
- `GET /api/lists` - Get all lists for user
- `GET /api/lists/:id` - Get single list by ID
- `POST /api/lists` - Create new list
- `PUT /api/lists/:id` - Update list name
- `DELETE /api/lists/:id` - Delete list

### Tasks
- `GET /api/lists/:listId/tasks` - Get all tasks for a list
- `GET /api/tasks/important` - Get all important tasks across all lists
- `POST /api/lists/:listId/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task (title, is_completed, is_important)
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/lists/:listId/tasks/reorder` - Update task order via drag-and-drop

## Key Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Routing

### Drag & Drop
- `@dnd-kit/core` - Drag-and-drop core
- `@dnd-kit/sortable` - Sortable utilities
- `@dnd-kit/utilities` - Helper utilities

### Styling
- `tailwindcss` - CSS framework
- `autoprefixer` - PostCSS plugin
- `postcss` - CSS transformations

### Testing
- `vitest` - Test runner
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Custom matchers
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM implementation for testing

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `eslint` - Code linting
- `eslint-plugin-react-hooks` - React Hooks linting
- `eslint-plugin-react-refresh` - React Refresh linting

## Browser Support

This application supports all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) in the project root.

## License

This project is part of a full-stack to-do list application. See the main README in the project root for more information.
