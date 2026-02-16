import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthPage } from '../pages/AuthPage';

// Mock AuthContext
const mockLogin = vi.fn();
const mockSignup = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    error: null,
  }),
}));

describe('AuthPage Component', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    mockSignup.mockClear();
  });

  const renderAuthPage = () => {
    return render(
      <BrowserRouter>
        <AuthPage />
      </BrowserRouter>
    );
  };

  it('should render login page by default', () => {
    renderAuthPage();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('should toggle to signup mode when Sign Up button is clicked', async () => {
    renderAuthPage();
    const user = userEvent.setup();
    
    // Click the toggle button
    const toggleButton = screen.getByRole('button', { name: /^sign up$/i });
    await user.click(toggleButton);
    
    // Should now show signup heading
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    
    // Should show confirm password field
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
  });

  it('should call login when form is submitted in login mode', async () => {
    renderAuthPage();
    const user = userEvent.setup();
    
    // Fill in the form
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser');
    await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    // Should call login
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should call signup when form is submitted in signup mode', async () => {
    renderAuthPage();
    const user = userEvent.setup();
    
    // Switch to signup mode
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));
    
    // Fill in the form
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'newuser');
    await user.type(screen.getAllByPlaceholderText(/enter your password/i)[0], 'password123');
    await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);
    
    // Should call signup
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('newuser', 'password123');
    });
  });

  it('should not submit if passwords do not match in signup mode', async () => {
    renderAuthPage();
    const user = userEvent.setup();
    
    // Switch to signup mode
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));
    
    // Fill in with mismatched passwords
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'newuser');
    await user.type(screen.getAllByPlaceholderText(/enter your password/i)[0], 'password123');
    await user.type(screen.getByPlaceholderText(/confirm your password/i), 'different');
    
    // Try to submit
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);
    
    // Should not call signup
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should clear form when toggling between login and signup', async () => {
    renderAuthPage();
    const user = userEvent.setup();

    // Fill in login form
    await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser');

    // Toggle to signup (LoginForm unmounts, SignUpForm mounts fresh)
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));

    // Re-query the input in the new SignUpForm — it should be empty
    const newUsernameInput = screen.getByPlaceholderText(/enter your username/i);
    expect(newUsernameInput).toHaveValue('');
  });
});
