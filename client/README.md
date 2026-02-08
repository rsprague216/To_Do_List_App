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
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx       # App header with logout
│   │   ├── MainContent.jsx  # Main task view with CRUD
│   │   ├── ProtectedRoute.jsx
│   │   └── Sidebar.jsx      # List navigation and creation
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── pages/
│   │   ├── AppLayout.jsx    # Main app layout
│   │   └── AuthPage.jsx     # Login/signup page
│   ├── __tests__/           # Component and integration tests
│   ├── App.jsx              # Root component with routing
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind directives
│   └── App.css              # Additional styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── vitest.config.js         # Vitest configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json             # Dependencies and scripts
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

The frontend communicates with the backend API. Make sure the backend server is running on `http://localhost:3000` or update the API base URL in the components.

## API Integration

The frontend makes requests to the following backend endpoints:

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login existing user

### Lists
- `GET /api/lists` - Get all lists for user
- `POST /api/lists` - Create new list
- `PUT /api/lists/:id` - Update list name
- `DELETE /api/lists/:id` - Delete list

### Tasks
- `GET /api/tasks/:listId` - Get all tasks for a list
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/complete` - Toggle task completion
- `PUT /api/tasks/:id/important` - Toggle task importance
- `PUT /api/tasks/reorder` - Update task order
- `DELETE /api/tasks/:id` - Delete task

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
