import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'testuser' },
    logout: vi.fn(),
  }),
}));

describe('Header Component', () => {
  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <Header 
          username="testuser" 
          currentListName="My Day"
          onMenuToggle={vi.fn()}
          isMobile={false}
        />
      </BrowserRouter>
    );
  };

  it('should render the app title', () => {
    renderHeader();
    expect(screen.getByText(/to do lists/i)).toBeInTheDocument();
  });

  it('should display the username when user is logged in', () => {
    renderHeader();
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  });

  it('should render the logout button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
