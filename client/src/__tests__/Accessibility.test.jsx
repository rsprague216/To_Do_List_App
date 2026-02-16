/**
 * Accessibility Tests
 *
 * Tests keyboard navigation, ARIA attributes, focus management,
 * and screen reader support across the application.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { MainContent } from '../components/layout/MainContent';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { AuthPage } from '../pages/AuthPage';

// Mock useTasks for MainContent tests
const mockCreateTask = vi.fn();

vi.mock('../hooks/useTasks', () => ({
  useTasks: (selectedListId) => {
    // Return loading state when called with loading prop context
    const isLoading = selectedListId === 'loading-test';
    return {
      tasks: isLoading ? [] : [
        { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
        { id: 2, title: 'Important Task', is_completed: false, is_important: true, position: 1 },
      ],
      setTasks: vi.fn(),
      isLoading,
      error: '',
      setError: vi.fn(),
      createTask: mockCreateTask,
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      toggleComplete: vi.fn(),
      toggleImportant: vi.fn(),
      reorderTasks: vi.fn(),
    };
  },
}));

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    it('should allow keyboard navigation through task list using Tab', async () => {
      const user = userEvent.setup();

      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const taskInput = screen.getByPlaceholderText(/add a task/i);
      taskInput.focus();
      expect(document.activeElement).toBe(taskInput);

      await user.tab();
      const addButton = screen.getByLabelText(/add task/i);
      expect(document.activeElement).toBe(addButton);

      await user.tab();
      expect(document.activeElement).toBeInTheDocument();
    });

    it('should allow Enter key to submit task creation form', async () => {
      const user = userEvent.setup();

      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const input = screen.getByPlaceholderText(/add a task/i);
      await user.type(input, 'New Task{Enter}');

      expect(mockCreateTask).toHaveBeenCalledWith('New Task');
    });

    it('should allow Escape key to cancel list creation in Sidebar', async () => {
      const user = userEvent.setup();
      const mockProps = {
        lists: [{ id: 1, name: 'Work', is_default: false }],
        selectedListId: 1,
        onSelectList: vi.fn(),
        onCreateList: vi.fn(),
        onUpdateList: vi.fn(),
        onDeleteList: vi.fn(),
        isOpen: true,
        onClose: vi.fn(),
        isMobile: false,
      };

      render(<Sidebar {...mockProps} />);

      const newListButton = screen.getByRole('button', { name: /new list/i });
      await user.click(newListButton);

      const input = screen.getByPlaceholderText(/enter list name/i);
      expect(input).toBeInTheDocument();

      await user.keyboard('{Escape}');

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

      await user.tab();
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      expect(document.activeElement).toBe(passwordInput);

      await user.tab();
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      expect(document.activeElement).toBe(loginButton);

      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes and Labels', () => {
    it('should have proper ARIA labels for task action buttons', () => {
      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      expect(screen.getByLabelText(/add task/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /mark complete/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('button', { name: /mark important/i }).length).toBeGreaterThan(0);
    });

    it('should have semantic heading structure', () => {
      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const heading = screen.getByRole('heading', { name: /my tasks/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible header with logout button', () => {
      const mockProps = {
        username: 'testuser',
        currentListName: 'My Day',
        onMenuToggle: vi.fn(),
        isMobile: false,
      };

      render(
        <AuthProvider>
          <Header {...mockProps} />
        </AuthProvider>
      );

      expect(screen.getByRole('heading', { name: /testuser's to do lists/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    it('should have proper form labels in AuthPage', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
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
        onUpdateList: vi.fn(),
        onDeleteList: vi.fn(),
        isOpen: true,
        onClose: vi.fn(),
        isMobile: false,
      };

      const { container } = render(<Sidebar {...mockProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

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
        onUpdateList: vi.fn(),
        onDeleteList: vi.fn(),
        isOpen: true,
        onClose: vi.fn(),
        isMobile: false,
      };

      render(<Sidebar {...mockProps} />);

      const newListButton = screen.getByRole('button', { name: /new list/i });
      await user.click(newListButton);

      const input = screen.getByPlaceholderText(/enter list name/i);
      expect(input).toHaveFocus();
    });

    it('should maintain focus on interactive elements', async () => {
      const user = userEvent.setup();

      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const completeButton = screen.getAllByRole('button', { name: /mark complete/i })[0];
      await user.click(completeButton);

      expect(completeButton).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive button text for logout', () => {
      const mockProps = {
        username: 'testuser',
        currentListName: 'My Day',
        onMenuToggle: vi.fn(),
        isMobile: false,
      };

      render(
        <AuthProvider>
          <Header {...mockProps} />
        </AuthProvider>
      );

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
        onUpdateList: vi.fn(),
        onDeleteList: vi.fn(),
        isOpen: true,
        onClose: vi.fn(),
        isMobile: false,
      };

      render(<Sidebar {...mockProps} />);

      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should have visible loading state text', () => {
      render(
        <MainContent
          selectedListId="loading-test"
          listName="My Tasks"
          resolveListId={(id) => id}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should use buttons instead of divs for clickable elements', () => {
      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);

      expect(screen.getByLabelText(/add task/i).tagName).toBe('BUTTON');
    });

    it('should not rely solely on color for important information', () => {
      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const importantButtons = screen.getAllByRole('button', { name: /important/i });
      expect(importantButtons.length).toBeGreaterThan(0);

      expect(importantButtons[0].querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Form Validation Accessibility', () => {
    it('should prevent empty task submission', async () => {
      const user = userEvent.setup();

      render(
        <MainContent
          selectedListId="my-day"
          listName="My Tasks"
          resolveListId={(id) => (id === 'my-day' ? 1 : id)}
        />
      );

      const addButton = screen.getByLabelText(/add task/i);
      await user.click(addButton);

      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it('should show password mismatch error in signup', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const signupLink = screen.getByText(/sign up/i);
      await user.click(signupLink);

      await user.type(screen.getByPlaceholderText(/enter your username/i), 'newuser');
      await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'different');

      const signupButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signupButton);

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
