# End-to-End Testing

This project uses Playwright for end-to-end testing of the full application stack.

## Setup

Playwright is already installed. Browsers (Chromium, Firefox, WebKit) have been downloaded.

## Running Tests

```bash
# Run all tests in headless mode
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step-by-step
npm run test:e2e:debug

# View test report
npm run test:report
```

## Test Suites

### Authentication Tests (`e2e/auth.spec.js`)
- ✓ Show login page on initial load
- ✓ Register a new user
- ✓ Login with existing user
- ✓ Show error for invalid credentials
- ✓ Logout successfully
- ✓ Persist authentication on page reload

### Task Management Tests (`e2e/tasks.spec.js`)
- ✓ Create a new task
- ✓ Edit task name
- ✓ Mark task as complete
- ✓ Mark task as important
- ✓ Delete a task
- ✓ Create multiple tasks in order
- ✓ Filter important tasks correctly

### List Management Tests (`e2e/lists.spec.js`)
- ✓ Show default lists on load
- ✓ Create a new custom list
- ✓ Switch between lists
- ✓ Edit list name
- ✓ Delete a custom list
- ✓ Prevent deletion of default lists

## Test Configuration

Tests run on:
- **Desktop**: Chromium (Chrome)
- **Mobile**: iPhone 12 viewport

The configuration automatically:
- Starts frontend dev server (http://localhost:5173)
- Starts backend dev server (http://localhost:3000)
- Takes screenshots on failure
- Records traces on retry

## Writing New Tests

Tests follow this pattern:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup (login, navigate, etc.)
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.getByRole('button').click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## CI/CD Integration

Tests are configured for CI with:
- Parallel execution disabled (workers: 1)
- 2 retries on failure
- HTML report generation

## Debugging Tips

1. Use `--debug` flag to step through tests
2. Use `page.pause()` to add breakpoints
3. Check `playwright-report/` for failure screenshots
4. Use `--ui` mode for interactive debugging

## Prerequisites

Both servers must be available:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

The config will start them automatically, or reuse existing servers if already running.
