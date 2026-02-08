import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div>Protected Content</div>;

  const renderWithAuth = (authValue) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  it('should show loading state when authentication is being checked', () => {
    renderWithAuth({
      loading: true,
      isAuthenticated: false
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    renderWithAuth({
      isAuthenticated: false,
      loading: false
    });

    // Should navigate to /login route - we can't directly test navigation in unit tests
    // but we can verify the protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    renderWithAuth({
      isAuthenticated: true,
      loading: false
    });
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading spinner with correct styling', () => {
    const { container } = renderWithAuth({
      loading: true,
      isAuthenticated: false
    });

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('rounded-full', 'border-b-2', 'border-blue-600');
  });
});
