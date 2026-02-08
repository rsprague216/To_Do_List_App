import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../components/Sidebar';

describe('Sidebar Component', () => {
  const mockProps = {
    lists: [
      { id: 1, name: 'Work', is_default: false },
      { id: 2, name: 'Personal', is_default: false },
    ],
    selectedListId: 'my-day',
    onSelectList: vi.fn(),
    onCreateList: vi.fn(),
    onUpdateList: vi.fn(),
    onDeleteList: vi.fn(),
    isOpen: true,
    onClose: vi.fn(),
    isMobile: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render default and custom lists', () => {
    render(<Sidebar {...mockProps} />);
    
    // Default lists are always shown
    expect(screen.getAllByText('My Day').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Important Tasks').length).toBeGreaterThan(0);
    
    // Custom lists
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('should highlight selected list', () => {
    render(<Sidebar {...mockProps} />);
    
    // My Day should be highlighted (selected list ID is 'my-day')
    // Check that at least one "My Day" element has the highlighted parent div
    const myDayElements = screen.getAllByText('My Day');
    
    // Find the parent div and check its classes
    let found = false;
    myDayElements.forEach(el => {
      const parentDiv = el.closest('div.bg-blue-50');
      if (parentDiv) {
        found = true;
      }
    });
    
    expect(found).toBe(true);
  });

  it('should call onSelectList when a list is clicked', async () => {
    render(<Sidebar {...mockProps} />);
    const user = userEvent.setup();
    
    await user.click(screen.getByText('Work'));
    
    expect(mockProps.onSelectList).toHaveBeenCalledWith(1);
  });

  it('should show New List button', () => {
    render(<Sidebar {...mockProps} />);
    
    expect(screen.getByRole('button', { name: /new list/i })).toBeInTheDocument();
  });

  it('should create new list when form is submitted', async () => {
    render(<Sidebar {...mockProps} />);
    const user = userEvent.setup();
    
    // Click New List button
    await user.click(screen.getByRole('button', { name: /new list/i }));
    
    // Should show input field
    const input = screen.getByPlaceholderText(/enter list name/i);
    expect(input).toBeInTheDocument();
    
    // Type a list name
    await user.type(input, 'Shopping{Enter}');
    
    // Should call onCreateList
    expect(mockProps.onCreateList).toHaveBeenCalledWith('Shopping');
  });

  it('should not show edit/delete buttons for default lists', () => {
    render(<Sidebar {...mockProps} />);
    
    // Get all "My Day" text elements
    const myDayElements = screen.getAllByText('My Day');
    
    // The first "My Day" is the fixed default list (shouldn't have edit/delete buttons)
    const firstMyDayItem = myDayElements[0].closest('li');
    const editButtons = firstMyDayItem?.querySelectorAll('button[aria-label="Edit list"]');
    
    // Default lists should not have edit buttons
    expect(editButtons?.length || 0).toBe(0);
  });
});
