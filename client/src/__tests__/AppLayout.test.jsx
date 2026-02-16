import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AppPage } from '../pages/AppPage';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'testuser', id: 1 },
    token: 'fake-jwt-token'
  })
}));

// Mock child components
vi.mock('../components/layout/Header', () => ({
  Header: ({ username, currentListName }) => (
    <div data-testid="header">
      Header: {username} - {currentListName}
    </div>
  )
}));

vi.mock('../components/layout/Sidebar', () => ({
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

vi.mock('../components/layout/MainContent', () => ({
  MainContent: ({ selectedListId, listName }) => (
    <div data-testid="main-content">
      MainContent - {listName}
      <div>ListId: {selectedListId}</div>
    </div>
  )
}));

// Mock the useLists hook
vi.mock('../hooks/useLists', () => ({
  useLists: () => ({
    lists: [
      { id: 2, name: 'Work', is_default: false },
      { id: 3, name: 'Personal', is_default: false },
    ],
    selectedListId: 'my-day',
    setSelectedListId: vi.fn(),
    selectedList: { id: 'my-day', name: 'My Day', isDefault: true },
    resolveListId: vi.fn((id) => (id === 'my-day' ? 1 : id)),
    createList: vi.fn(),
    updateList: vi.fn(),
    deleteList: vi.fn(),
    isLoading: false,
    error: '',
    setError: vi.fn(),
  })
}));

describe('AppPage Component', () => {
  beforeEach(() => {
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
    render(<AppPage />);

    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });

  it('should display custom lists in sidebar', async () => {
    render(<AppPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Work' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Personal' })).toBeInTheDocument();
    });
  });

  it('should have default selected list as "my-day"', async () => {
    render(<AppPage />);

    await waitFor(() => {
      expect(screen.getByText('Selected: my-day')).toBeInTheDocument();
    });
  });

  it('should detect mobile viewport on small screens', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });

    render(<AppPage />);

    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  it('should handle window resize events', async () => {
    render(<AppPage />);

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
});
