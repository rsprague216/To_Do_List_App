import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainContent } from '../components/layout/MainContent';

const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockToggleComplete = vi.fn();
const mockToggleImportant = vi.fn();
const mockReorderTasks = vi.fn();
const mockSetError = vi.fn();

vi.mock('../hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: [
      { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
      { id: 2, title: 'Task 2', is_completed: false, is_important: true, position: 1 },
      { id: 3, title: 'Completed Task', is_completed: true, is_important: false, position: 2 },
    ],
    setTasks: vi.fn(),
    isLoading: false,
    error: '',
    setError: mockSetError,
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    toggleComplete: mockToggleComplete,
    toggleImportant: mockToggleImportant,
    reorderTasks: mockReorderTasks,
  }),
}));

describe('MainContent Component', () => {
  const defaultProps = {
    selectedListId: 'my-day',
    listName: 'My Day',
    resolveListId: (id) => (id === 'my-day' ? 1 : id),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list name as heading', () => {
    render(<MainContent {...defaultProps} />);
    expect(screen.getByRole('heading', { name: 'My Day' })).toBeInTheDocument();
  });

  it('should render all incomplete tasks', () => {
    render(<MainContent {...defaultProps} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should render completed tasks separately', () => {
    render(<MainContent {...defaultProps} />);
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.getByText(/completed \(1\)/i)).toBeInTheDocument();
  });

  it('should show important star icon for important tasks', () => {
    render(<MainContent {...defaultProps} />);
    const task2 = screen.getByText('Task 2').closest('li');
    const starButton = task2?.querySelector('button[aria-label*="important"]');
    expect(starButton).toBeInTheDocument();
  });

  it('should call createTask when adding a new task', async () => {
    render(<MainContent {...defaultProps} />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/add a task/i);
    await user.type(input, 'New Task{Enter}');

    expect(mockCreateTask).toHaveBeenCalledWith('New Task');
  });

  it('should not create empty tasks', async () => {
    render(<MainContent {...defaultProps} />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/add a task/i);
    await user.type(input, '   {Enter}');

    expect(mockCreateTask).not.toHaveBeenCalled();
  });
});
