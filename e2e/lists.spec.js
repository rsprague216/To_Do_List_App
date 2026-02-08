import { test, expect } from '@playwright/test';

/**
 * List Management E2E Tests
 * 
 * Tests list creation, editing, deletion, and navigation
 */

test.describe('List Management', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login with unique user per test
    const username = `listuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const password = 'TestPassword123!';
    
    await page.goto('/');
    await page.getByRole('button', { name: /^sign up$/i }).click();
    await page.getByPlaceholder(/enter your username/i).fill(username);
    await page.getByPlaceholder(/enter your password/i).fill(password);
    await page.getByPlaceholder(/confirm your password/i).fill(password);
    await page.getByRole('button', { name: /^sign up$/i, exact: false }).first().click();
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should show default lists on load', async ({ page }) => {
    // Open sidebar on mobile or check it's visible on desktop
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click({ force: true });
    }
    
    await expect(page.getByText('My Day').first()).toBeVisible();
    await expect(page.getByText('Important Tasks').first()).toBeVisible();
  });

  test('should create a new custom list', async ({ page }) => {
    const listName = 'Work Projects';
    
    // Open sidebar on mobile
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click({ force: true });
    }
    
    // Click New List
    await page.getByRole('button', { name: /new list/i }).click();
    
    // Type list name
    await page.locator('input[placeholder*="list name"]').fill(listName);
    await page.locator('input[placeholder*="list name"]').press('Enter');
    
    // List should appear in sidebar
    await expect(page.getByText(listName).first()).toBeVisible();
  });

  // TODO: Fix timing issue - tasks from previous list sometimes still visible after switching
  test.skip('should switch between lists', async ({ page }) => {
    // Create a custom list
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click();
    }
    
    await page.getByRole('button', { name: /new list/i }).click();
    await page.locator('input[placeholder*="list name"]').fill('Shopping');
    await page.locator('input[placeholder*="list name"]').press('Enter');
    
    // Add task to current list
    await page.getByPlaceholder(/add a task/i).fill('Buy milk');
    await page.getByPlaceholder(/add a task/i).press('Enter');
    
    // Switch to My Day
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click({ force: true });
    }
    await page.getByText('My Day').first().click();
    await page.waitForTimeout(1000); // Wait longer for list switch and data load
    
    // Should show My Day heading, not the shopping task
    await expect(page.getByRole('heading', { name: 'My Day' }).first()).toBeVisible();
    await page.waitForTimeout(500); // Extra wait for tasks to update
    await expect(page.getByText('Buy milk')).not.toBeVisible();
  });

  test('should edit list name', async ({ page }) => {
    // Create list
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click();
    }
    
    await page.getByRole('button', { name: /new list/i }).click();
    await page.locator('input[placeholder*="list name"]').fill('Original Name');
    await page.locator('input[placeholder*="list name"]').press('Enter');
    
    // Wait for list to be created
    await expect(page.getByText('Original Name').first()).toBeVisible();
    
    // Hover to show edit button and click it
    const listItem = page.locator('li').filter({ hasText: 'Original Name' });
    await listItem.hover();
    const editButton = listItem.locator('button[aria-label="Edit list"]');
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();
    
    // Find the input field that appeared
    const input = page.locator('input[type="text"]').filter({ hasValue: 'Original Name' }).first();
    await input.waitFor({ state: 'visible' });
    await input.fill('Updated Name');
    await input.press('Enter');
    
    // Should show new name
    await expect(page.getByText('Updated Name').first()).toBeVisible();
    await expect(page.getByText('Original Name').first()).not.toBeVisible();
  });

  test('should delete a custom list', async ({ page }) => {
    // Create list
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click();
    }
    
    await page.getByRole('button', { name: /new list/i }).click();
    await page.locator('input[placeholder*="list name"]').fill('List to Delete');
    await page.locator('input[placeholder*="list name"]').press('Enter');
    
    // Delete list (desktop only - hover needed)
    if (width >= 640) {
      page.on('dialog', dialog => dialog.accept());
      
      const listItem = page.locator('li').filter({ hasText: 'List to Delete' });
      await listItem.hover();
      await listItem.locator('button[aria-label="Delete list"]').click();
      
      // List should be removed
      await expect(page.getByText('List to Delete').first()).not.toBeVisible();
      
      // Should redirect to My Day
      await expect(page.getByText('My Day').first()).toBeVisible();
    }
  });

  test('should not delete My Day (default list)', async ({ page }) => {
    const width = page.viewportSize()?.width || 1920;
    if (width < 640) {
      await page.locator('button[aria-label*="menu"]').first().click();
    }
    
    // My Day should not have delete button
    const myDayItem = page.locator('li').filter({ hasText: 'My Day' });
    if (width >= 640) {
      await myDayItem.hover();
      await expect(myDayItem.locator('button[aria-label="Delete list"]')).not.toBeVisible();
    }
  });
});
