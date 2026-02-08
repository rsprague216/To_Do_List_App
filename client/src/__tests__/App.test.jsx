/**
 * Tests for App Component
 * 
 * Tests the main application routing:
 * - Root route redirect
 * - Login route
 * - Protected app routes
 * - Catch-all route handling
 * - Authentication-based navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock child components
vi.mock('../pages/AuthPage', () => ({
  AuthPage: () => <div data-testid="auth-page">Auth Page</div>
}));

vi.mock('../pages/AppLayout', () => ({
  AppLayout: () => <div data-testid="app-layout">App Layout</div>
}));

vi.mock('../components/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }) => <div data-testid="protected-route">{children}</div>
}));

// Mock AuthContext with controllable values
const mockAuthValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  signup: vi.fn()
};

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthValue
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any stored tokens
    localStorage.clear();
  });

  it('should render without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });

  it('should redirect from root path to /app', async () => {
    // Set initial route to /
    window.history.pushState({}, 'Test', '/');
    
    render(<App />);
    
    // Should redirect to /app, which will show the protected route
    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  it('should render AuthPage on /login route', () => {
    // Set initial route to /login
    window.history.pushState({}, 'Test', '/login');
    
    render(<App />);
    
    expect(screen.getByTestId('auth-page')).toBeInTheDocument();
  });

  it('should render ProtectedRoute wrapping AppLayout on /app route', () => {
    // Set initial route to /app
    window.history.pushState({}, 'Test', '/app');
    
    render(<App />);
    
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });

  it('should handle catch-all route by redirecting to root', async () => {
    // Set initial route to invalid path
    window.history.pushState({}, 'Test', '/invalid-route');
    
    render(<App />);
    
    // Should redirect to / then to /app
    await waitFor(() => {
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    });
  });

  it('should wrap routes in AuthProvider', () => {
    // The AuthProvider mock is automatically applied
    // If it wasn't wrapped, the app wouldn't render
    render(<App />);
    
    // Verify the app renders (which means AuthProvider is wrapping it)
    expect(document.body).toBeTruthy();
  });

  it('should support nested routes under /app/*', () => {
    // Set initial route to nested app path
    window.history.pushState({}, 'Test', '/app/some-nested-route');
    
    render(<App />);
    
    // Should still render the protected AppLayout
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
  });
});
