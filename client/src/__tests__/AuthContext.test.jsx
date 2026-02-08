import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

describe('AuthContext', () => {
  it('should provide login, logout, and signup functions', () => {
    let authValue;
    const TestComponent = () => {
      authValue = useAuth();
      return <div>Test</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(authValue).toHaveProperty('login');
    expect(authValue).toHaveProperty('logout');
    expect(authValue).toHaveProperty('signup');
    expect(authValue).toHaveProperty('user');
  });

  it('should initialize with no user when no token in localStorage', () => {
    // Clear localStorage
    localStorage.clear();

    let authValue;
    const TestComponent = () => {
      authValue = useAuth();
      return <div>Test</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(authValue.user).toBeNull();
  });
});
