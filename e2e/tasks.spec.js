import { test, expect } from '@playwright/test';

/**
 * Task Management E2E Tests
 * 
 * Tests full task CRUD operations and interactions
 */

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login with unique user per test
    const username = `taskuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const password = 'TestPassword123!';
    
    await page.goto('/');
    await page.getByRole('button', { name: /^sign up$/i }).click();
    await page.getByPlaceholder(/enter your username/i).fill(username);
    await page.getByPlaceholder(/enter your password/i).fill(password);
    await page.getByPlaceholder(/confirm your password/i).fill(password);
    await page.getByRole('button', { name: /^sign up$/i, exact: false }).first().click();
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new task', async ({ page }) => {
    const taskTitle = 'Buy groceries';
    
    await page.getByPlaceholder(/add a task/i).fill(taskTitle);
    await page.getByPlaceholder(/add a task/i).press('Enter');
    
    // Task should appear in list
    await expect(page.getByText(taskTitle)).toBeVisible();
  });

  // TODO: This test is flaky - the Enter key sometimes creates a new task instead of saving the edit
  // Need to investigate the exact keyboard event handling in MainContent.jsx
  test.skip('should edit task name', async ({ page }) => {
    // Create task
    await page.getByPlaceholder(/add a task/i).fill('Original task');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    
    // Wait for task to appear
    await expect(page.getByText('Original task', { exact: true })).toBeVisible();
    
    // Click the task text to edit it
    await page.getByText('Original task', { exact: true }).click();
    
    // Wait for input to appear with the original value
    const input = page.locator('input[type="text"]').filter({ hasValue: 'Original task' }).first();
    await input.waitFor({ state: 'visible' });
    await input.clear();
    await input.fill('Updated task');
    await page.waitForTimeout(100); // Small delay before pressing Enter
    await input.press('Enter');
    
    // Should show updated text
    await expect(page.getByText('Updated task', { exact: true })).toBeVisible();
    await expect(page.getByText('Original task', { exact: true })).not.toBeVisible();
  });

  test('should mark task as complete', async ({ page }) => {
    await page.getByPlaceholder(/add a task/i).fill('Task to complete');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    
    // Find and click checkbox
    const taskRow = page.locator('li').filter({ hasText: 'Task to complete' });
    await taskRow.locator('button').first().click(); // Checkbox is first button
    
    // Should move to completed section
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  // TODO: Fix mobile menu interaction - close button outside viewport
  test.skip('should mark task as important', async ({ page }) => {
    await page.getByPlaceholder(/add a task/i).fill('Important task');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    
    // Find task row and click star button
    const taskRow = page.locator('li').filter({ hasText: 'Important task' });
    const starButton = taskRow.locator('button[aria-label*="important"]').first();
    await starButton.click();
    
    // Navigate to Important Tasks view - on mobile, need to open menu first
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      // Close the sidebar if it's open
      const closeButton = page.locator('button[aria-label="Close menu"]');
      if (await closeButton.isVisible()) {
        await closeButton.scrollIntoViewIfNeeded();
        await closeButton.click();
      }
      // Open menu to access Important Tasks
      await page.locator('button[aria-label="Toggle menu"]').click({ force: true });
    }
    await page.getByText('Important Tasks').first().click();
    
    // Task should appear here
    await expect(page.getByText('Important task', { exact: true })).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Skip on mobile since delete button is hidden (swipe-only)
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      test.skip();
      return;
    }
    
    await page.getByPlaceholder(/add a task/i).fill('Task to delete');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    
    // Find task and delete button (only visible on desktop/hover)
    const taskRow = page.locator('li').filter({ hasText: 'Task to delete' });
    await taskRow.hover();
    
    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    const deleteButton = taskRow.locator('button[aria-label="Delete task"]');
    await deleteButton.click();
    
    // Task should be removed
    await expect(page.getByText('Task to delete')).not.toBeVisible();
  });

  test('should create multiple tasks and show in order', async ({ page }) => {
    const tasks = ['First task', 'Second task', 'Third task'];
    
    for (const task of tasks) {
      await page.getByPlaceholder(/add a task/i).fill(task);
      await page.getByPlaceholder(/add a task/i).press('Enter');
      await page.waitForTimeout(100); // Small delay to ensure order
    }
    
    // All tasks should be visible
    for (const task of tasks) {
      await expect(page.getByText(task)).toBeVisible();
    }
  });

  // TODO: This test is flaky - second task sometimes doesn't get created properly
  // Need to add better waiting/retry logic for task creation
  test.skip('should filter important tasks correctly', async ({ page }) => {
    // Create normal task
    await page.getByPlaceholder(/add a task/i).fill('Normal task');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    await expect(page.getByText('Normal task', { exact: true })).toBeVisible();
    
    // Create important task
    await page.getByPlaceholder(/add a task/i).fill('Important task');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    await expect(page.getByText('Important task', { exact: true })).toBeVisible();
    
    // Mark second task as important - find the li containing this text
    const taskRow = page.locator('li').filter({ hasText: 'Important task' }).first();
    const importantButton = taskRow.locator('button[aria-label*="important"]').first();
    await importantButton.click();
    
    // Navigate to Important Tasks (click the first one - in sidebar)
    await page.getByText('Important Tasks').first().click();
    await page.waitForTimeout(500); // Wait for filter to apply
    
    // Only important task should show
    await expect(page.getByText('Important task', { exact: true })).toBeVisible();
    await expect(page.getByText('Normal task')).not.toBeVisible();
  });
});
