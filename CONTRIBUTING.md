# Contributing to To-Do List App

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- MySQL v8.0 or higher
- Git

### Initial Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/to_do_list.git
   cd to_do_list
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd client
   npm install
   
   # Backend
   cd ../server
   npm install
   
   # E2E tests (root directory)
   cd ..
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your local MySQL credentials
   ```

4. **Set up the database**
   ```bash
   cd server
   npm run setup-db
   ```

5. **Run the development servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## Code Style & Standards

### JavaScript/React

- Use ES6+ features
- Follow React hooks best practices
- Use functional components over class components
- Prefer named exports for components
- Use meaningful variable and function names

### CSS/Styling

- Use TailwindCSS utility classes
- Avoid custom CSS unless absolutely necessary
- Follow mobile-first responsive design
- Ensure accessibility (ARIA labels, semantic HTML)

### File Organization

```
client/src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── context/         # React context providers
├── __tests__/       # Test files
└── assets/          # Static assets

server/
├── db/              # Database utilities
├── middleware/      # Express middleware
├── routes/          # API route handlers
└── __tests__/       # Component tests
```

## Testing Requirements

All contributions must include appropriate tests:

### Frontend Tests

```bash
cd client
npm test
```

Required test types:
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **Accessibility Tests**: Verify WCAG compliance

Guidelines:
- Test user interactions with @testing-library/user-event
- Verify accessibility with semantic queries (getByRole, getByLabelText)
- Test keyboard navigation
- Test screen reader support (ARIA labels)

### E2E Tests

```bash
npm run test:e2e
```

- Test critical user flows end-to-end
- Test authentication flows
- Test CRUD operations
- Test mobile interactions (when applicable)

### Before Submitting

Run the full test suite:
```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test

# E2E
cd .. && npm run test:e2e
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   - Run all tests locally
   - Verify in browser manually
   - Test on mobile viewport

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Adding or updating tests
   - `refactor:` Code refactoring
   - `style:` Formatting changes
   - `chore:` Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all CI checks pass

## Code Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## Accessibility Guidelines

This project is committed to WCAG 2.1 Level AA compliance:

- ✅ All interactive elements must be keyboard accessible
- ✅ Provide ARIA labels for screen readers
- ✅ Use semantic HTML elements
- ✅ Ensure color contrast ratios meet standards
- ✅ Support keyboard navigation (Tab, Enter, Escape)
- ✅ Provide focus indicators
- ✅ Test with screen readers

## Database Schema Changes

When modifying the database schema:

1. **Update migration script** in `server/setup-db.js`
2. **Document changes** in comments
3. **Update seed data** if needed
4. **Test migration** on fresh database
5. **Update API tests** to reflect schema changes

## API Endpoints

When adding new endpoints:

- Follow RESTful conventions
- Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Implement authentication where needed
- Validate all inputs
- Return consistent error responses
- Document in README.md

## Security Considerations

- Never commit `.env` files
- Validate all user inputs
- Use prepared statements for database queries
- Hash passwords with bcrypt
- Use secure JWT secrets
- Implement rate limiting for production
- Sanitize error messages (don't leak system info)

## Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
