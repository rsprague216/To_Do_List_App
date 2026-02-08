import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * 
 * Tests user registration, login, logout, and token persistence
 */

test.describe('Authentication', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'TestPassword123!'
  };

  test('should show login page on initial load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByPlaceholder(/enter your username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/');
    
    // Switch to signup mode
    await page.getByRole('button', { name: /^sign up$/i }).click();
    
    // Fill registration form
    await page.getByPlaceholder(/enter your username/i).fill(testUser.username);
    await page.getByPlaceholder(/enter your password/i).fill(testUser.password);
    await page.getByPlaceholder(/confirm your password/i).fill(testUser.password);
    
    // Submit
    await page.getByRole('button', { name: /^sign up$/i, exact: false }).first().click();
    
    // Should redirect to app
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should login with existing user', async ({ page }) => {
    // First create a user
    await page.goto('/');
    await page.getByRole('button', { name: /^sign up$/i }).first().click();
    const username = `logintest_${Date.now()}`;
    const password = 'TestPassword123!';
    await page.getByPlaceholder(/enter your username/i).fill(username);
    await page.getByPlaceholder(/enter your password/i).fill(password);
    await page.getByPlaceholder(/confirm your password/i).fill(password);
    await page.getByRole('button', { name: /sign up/i }).first().click();
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
    
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    
    // Now login with the same user
    await page.getByPlaceholder(/enter your username/i).fill(username);
    await page.getByPlaceholder(/enter your password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).first().click();
    
    // Should redirect to app
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    await page.getByPlaceholder(/enter your username/i).fill('nonexistent');
    await page.getByPlaceholder(/enter your password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    
    // Should show error (exact text depends on your implementation)
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({ timeout: 3000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First create and login a user
    await page.goto('/');
    await page.getByRole('button', { name: /^sign up$/i }).first().click();
    const username = `logouttest_${Date.now()}`;
    const password = 'TestPassword123!';
    await page.getByPlaceholder(/enter your username/i).fill(username);
    await page.getByPlaceholder(/enter your password/i).fill(password);
    await page.getByPlaceholder(/confirm your password/i).fill(password);
    await page.getByRole('button', { name: /sign up/i }).first().click();
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
    
    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should return to login page
    await expect(page.getByPlaceholder(/enter your username/i)).toBeVisible();
  });

  test('should persist authentication on page reload', async ({ page }) => {
    // First create and login a user
    await page.goto('/');
    await page.getByRole('button', { name: /^sign up$/i }).first().click();
    const username = `persisttest_${Date.now()}`;
    const password = 'TestPassword123!';
    await page.getByPlaceholder(/enter your username/i).fill(username);
    await page.getByPlaceholder(/enter your password/i).fill(password);
    await page.getByPlaceholder(/confirm your password/i).fill(password);
    await page.getByRole('button', { name: /sign up/i }).first().click();
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page.getByText(/my day/i).first()).toBeVisible({ timeout: 5000 });
  });
});
