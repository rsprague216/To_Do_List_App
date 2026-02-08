import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppLayout } from '../pages/AppLayout';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'testuser', id: 1 },
    token: 'fake-jwt-token'
  })
}));

// Mock child components
vi.mock('../components/Header', () => ({
  Header: ({ username, currentListName }) => (
    <div data-testid="header">
      Header: {username} - {currentListName}
    </div>
  )
}));

vi.mock('../components/Sidebar', () => ({
  Sidebar: ({ lists, selectedListId, onSelectList }) => (
    <div data-testid="sidebar">
      Sidebar
      {lists.map(list => (
        <button key={list.id} onClick={() => onSelectList(list.id)}>
          {list.name}
        </button>
      ))}
      <div>Selected: {selectedListId}</div>
    </div>
  )
}));

vi.mock('../components/MainContent', () => ({
  MainContent: ({ selectedList, tasks }) => (
    <div data-testid="main-content">
      MainContent - {selectedList?.name}
      <div>Tasks: {tasks.length}</div>
    </div>
  )
}));

describe('AppLayout Component', () => {
  let fetchMock;

  beforeEach(() => {
    // Mock fetch globally
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render Header, Sidebar, and MainContent components', async () => {
    // Mock successful API responses
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'My Day', is_default: true },
        { id: 2, name: 'Work', is_default: false }
      ]
    });

    render(<AppLayout />);

    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });

  it('should fetch lists on mount', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'My Day', is_default: true },
        { id: 2, name: 'Work', is_default: false },
        { id: 3, name: 'Personal', is_default: false }
      ]
    });

    render(<AppLayout />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/lists'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-jwt-token'
          })
        })
      );
    });
  });

  it('should filter out default lists from sidebar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: 'My Day', is_default: true },
        { id: 2, name: 'Work', is_default: false },
        { id: 3, name: 'Personal', is_default: false }
      ]
    });

    render(<AppLayout />);

    await waitFor(() => {
      // Should show Work and Personal buttons (custom lists)
      expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Personal' })).toBeInTheDocument();
      
      // Should NOT show My Day button (it's a default list)
      expect(screen.queryByRole('button', { name: 'My Day' })).not.toBeInTheDocument();
    });
  });

  it('should have default selected list as "my-day"', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<AppLayout />);

    await waitFor(() => {
      expect(screen.getByText('Selected: my-day')).toBeInTheDocument();
    });
  });

  it('should detect mobile viewport on small screens', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500 // Mobile width
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<AppLayout />);

    // The component should render (testing that isMobile state is set correctly)
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  it('should handle window resize events', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<AppLayout />);

    // Trigger resize event
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });
    
    window.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API response
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    render(<AppLayout />);

    await waitFor(() => {
      // Component should still render even with error
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});
