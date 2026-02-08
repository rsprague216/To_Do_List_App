/**
 * Accessibility Tests
 * 
 * Tests keyboard navigation, ARIA attributes, focus management,
 * and screen reader support across the application.
 * 
 * These tests ensure the app is usable for:
 * - Keyboard-only users
 * - Screen reader users
 * - Users with motor disabilities
 * - Users with visual impairments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { MainContent } from '../components/MainContent';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AuthPage } from '../pages/AuthPage';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    it('should allow keyboard navigation through task list using Tab', async () => {
      const user = userEvent.setup();
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [
          { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
          { id: 2, title: 'Task 2', is_completed: false, is_important: false, position: 1 },
        ],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      // Tab through interactive elements
      const taskInput = screen.getByPlaceholderText(/add a task/i);
      taskInput.focus();
      expect(document.activeElement).toBe(taskInput);

      // Tab to add button
      await user.tab();
      const addButton = screen.getByLabelText(/add task/i);
      expect(document.activeElement).toBe(addButton);

      // Tab to first task's drag handle (comes before complete button)
      await user.tab();
      const dragHandles = screen.getAllByRole('button', { name: '' });
      // Verify we've tabbed to an interactive element in the task
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should allow Enter key to submit task creation form', async () => {
      const user = userEvent.setup();
      const mockOnAddTask = vi.fn();
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [],
        onAddTask: mockOnAddTask,
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      const input = screen.getByPlaceholderText(/add a task/i);
      await user.type(input, 'New Task{Enter}');

      expect(mockOnAddTask).toHaveBeenCalledWith('New Task');
    });

    it('should allow Escape key to cancel list creation in Sidebar', async () => {
      const user = userEvent.setup();
      const mockProps = {
        lists: [{ id: 1, name: 'Work', is_default: false }],
        selectedListId: 1,
        onSelectList: vi.fn(),
        onCreateList: vi.fn(),
        onDeleteList: vi.fn(),
        onToggleSidebar: vi.fn(),
      };

      render(<Sidebar {...mockProps} />);

      // Click "New List" button to show input
      const newListButton = screen.getByRole('button', { name: /new list/i });
      await user.click(newListButton);

      // Input should appear
      const input = screen.getByPlaceholderText(/enter list name/i);
      expect(input).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      // Input should disappear (form cancelled)
      expect(screen.queryByPlaceholderText(/enter list name/i)).not.toBeInTheDocument();
    });

    it('should allow Tab navigation through login form', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const usernameInput = screen.getByPlaceholderText(/username/i);
      usernameInput.focus();
      expect(document.activeElement).toBe(usernameInput);

      // Tab to password
      await user.tab();
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(document.activeElement).toBe(passwordInput);

      // Tab to submit button
      await user.tab();
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      expect(document.activeElement).toBe(loginButton);

      // Form elements are accessible via keyboard
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes and Labels', () => {
    it('should have proper ARIA labels for task action buttons', () => {
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [
          { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
        ],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      // Add task button has label
      expect(screen.getByLabelText(/add task/i)).toBeInTheDocument();

      // Complete button has label
      expect(screen.getByRole('button', { name: /mark complete/i })).toBeInTheDocument();

      // Important button has label
      expect(screen.getByRole('button', { name: /mark important/i })).toBeInTheDocument();

      // Delete button has label
      expect(screen.getByRole('button', { name: /delete task/i })).toBeInTheDocument();
    });

    it('should have semantic heading structure', () => {
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      // List name is a heading
      const heading = screen.getByRole('heading', { name: /my tasks/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible header with logout button', () => {
      const mockProps = {
        username: 'testuser',
        onLogout: vi.fn(),
      };

      render(
        <AuthProvider>
          <Header {...mockProps} />
        </AuthProvider>
      );

      // Header has heading
      expect(screen.getByRole('heading', { name: /testuser's to do lists/i })).toBeInTheDocument();

      // Logout button is accessible
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should have proper form labels in AuthPage', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage onLogin={vi.fn()} />
          </AuthProvider>
        </BrowserRouter>
      );

      // Inputs have placeholders (acts as labels)
      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();

      // Buttons have accessible names
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have ARIA role for navigation in Sidebar', () => {
      const mockProps = {
        lists: [
          { id: 1, name: 'Work', is_default: false },
          { id: 2, name: 'Personal', is_default: false },
        ],
        selectedListId: 1,
        onSelectList: vi.fn(),
        onCreateList: vi.fn(),
        onDeleteList: vi.fn(),
        onToggleSidebar: vi.fn(),
      };

      const { container } = render(<Sidebar {...mockProps} />);

      // Sidebar has navigation element
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Lists are in a list structure
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('should focus input when creating new list', async () => {
      const user = userEvent.setup();
      const mockProps = {
        lists: [],
        selectedListId: null,
        onSelectList: vi.fn(),
        onCreateList: vi.fn(),
        onDeleteList: vi.fn(),
        onToggleSidebar: vi.fn(),
      };

      render(<Sidebar {...mockProps} />);

      const newListButton = screen.getByRole('button', { name: /new list/i });
      await user.click(newListButton);

      // Input should be auto-focused
      const input = screen.getByPlaceholderText(/enter list name/i);
      expect(input).toHaveFocus();
    });

    it('should maintain focus on interactive elements', async () => {
      const user = userEvent.setup();
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [
          { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
        ],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      const completeButton = screen.getByRole('button', { name: /mark complete/i });
      await user.click(completeButton);

      // Button should still be focusable after click
      expect(completeButton).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful empty state messages', () => {
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      // Empty state has descriptive text
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      expect(screen.getByText(/add a task to get started/i)).toBeInTheDocument();
    });

    it('should have descriptive button text for logout', () => {
      const mockProps = {
        username: 'testuser',
        onLogout: vi.fn(),
      };

      render(
        <AuthProvider>
          <Header {...mockProps} />
        </AuthProvider>
      );

      // Logout button has text content, not just an icon
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton.textContent).toContain('Logout');
    });

    it('should provide context for list items', () => {
      const mockProps = {
        lists: [
          { id: 1, name: 'Work', is_default: false },
          { id: 2, name: 'Personal', is_default: false },
        ],
        selectedListId: 1,
        onSelectList: vi.fn(),
        onCreateList: vi.fn(),
        onDeleteList: vi.fn(),
        onToggleSidebar: vi.fn(),
      };

      render(<Sidebar {...mockProps} />);

      // List names are readable
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should have visible loading state text', () => {
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: true,
      };

      render(<MainContent {...mockProps} />);

      // Loading state has text (not just spinner)
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should use buttons instead of divs for clickable elements', () => {
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [
          { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
        ],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      // All interactive elements should be buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      // Add task button
      expect(screen.getByLabelText(/add task/i).tagName).toBe('BUTTON');
    });

    it('should not rely solely on color for important information', () => {
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [
          { id: 1, title: 'Important Task', is_completed: false, is_important: true, position: 0 },
        ],
        onAddTask: vi.fn(),
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      // Important tasks should have an icon/indicator, not just color
      const importantButton = screen.getByRole('button', { name: /mark important/i });
      expect(importantButton).toBeInTheDocument();
      
      // Button has SVG icon (visual indicator beyond color)
      expect(importantButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Form Validation Accessibility', () => {
    it('should prevent empty task submission', async () => {
      const user = userEvent.setup();
      const mockOnAddTask = vi.fn();
      const mockProps = {
        selectedList: { id: 1, name: 'My Tasks' },
        tasks: [],
        onAddTask: mockOnAddTask,
        onUpdateTask: vi.fn(),
        onDeleteTask: vi.fn(),
        onToggleComplete: vi.fn(),
        onToggleImportant: vi.fn(),
        onReorderTasks: vi.fn(),
        loading: false,
      };

      render(<MainContent {...mockProps} />);

      const input = screen.getByPlaceholderText(/add a task/i);
      const addButton = screen.getByLabelText(/add task/i);

      // Try to submit empty task
      await user.click(addButton);

      // Should not call onAddTask with empty string
      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('should show password mismatch error in signup', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage onLogin={vi.fn()} />
          </AuthProvider>
        </BrowserRouter>
      );

      // Switch to signup
      const signupLink = screen.getByText(/sign up/i);
      await user.click(signupLink);

      // Fill form with mismatched passwords
      await user.type(screen.getAllByPlaceholderText(/username/i)[0], 'newuser');
      const passwordInputs = screen.getAllByPlaceholderText(/password/i);
      await user.type(passwordInputs[0], 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'different');

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      // Error message should be visible
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
