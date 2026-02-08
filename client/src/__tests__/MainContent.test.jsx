import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MainContent } from '../components/MainContent';

describe('MainContent Component', () => {
  const mockProps = {
    selectedList: { id: 'my-day', name: 'My Day' },
    tasks: [
      { id: 1, title: 'Task 1', is_completed: false, is_important: false, position: 0 },
      { id: 2, title: 'Task 2', is_completed: false, is_important: true, position: 1 },
      { id: 3, title: 'Completed Task', is_completed: true, is_important: false, position: 2 },
    ],
    onAddTask: vi.fn(),
    onUpdateTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onToggleComplete: vi.fn(),
    onToggleImportant: vi.fn(),
    onReorderTasks: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list name as heading', () => {
    render(<MainContent {...mockProps} />);
    
    expect(screen.getByRole('heading', { name: 'My Day' })).toBeInTheDocument();
  });

  it('should render all incomplete tasks', () => {
    render(<MainContent {...mockProps} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should render completed tasks separately', () => {
    render(<MainContent {...mockProps} />);
    
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.getByText(/completed \(1\)/i)).toBeInTheDocument();
  });

  it('should show important star icon for important tasks', () => {
    render(<MainContent {...mockProps} />);
    
    // Find Task 2 which is important
    const task2 = screen.getByText('Task 2').closest('li');
    const starButton = task2?.querySelector('button[aria-label*="important"]');
    
    expect(starButton).toBeInTheDocument();
  });

  it('should call onAddTask when adding a new task', async () => {
    render(<MainContent {...mockProps} />);
    const user = userEvent.setup();
    
    const input = screen.getByPlaceholderText(/add a task/i);
    await user.type(input, 'New Task{Enter}');
    
    expect(mockProps.onAddTask).toHaveBeenCalledWith('New Task');
  });

  it('should not create empty tasks', async () => {
    render(<MainContent {...mockProps} />);
    const user = userEvent.setup();
    
    const input = screen.getByPlaceholderText(/add a task/i);
    await user.type(input, '   {Enter}');
    
    expect(mockProps.onAddTask).not.toHaveBeenCalled();
  });

  it('should show empty state when no tasks', () => {
    const emptyProps = { ...mockProps, tasks: [] };
    render(<MainContent {...emptyProps} />);
    
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });
});
