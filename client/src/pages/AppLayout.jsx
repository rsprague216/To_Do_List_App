/**
 * AppLayout Component
 * 
 * Main application layout after authentication.
 * Manages the overall structure and state for the app.
 * 
 * Features:
 * - Responsive layout (mobile, tablet, desktop)
 * - List management (CRUD operations)
 * - Task management (CRUD operations)
 * - Mobile sidebar toggle
 * - API integration with backend
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { MainContent } from '../components/MainContent';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AppLayout = () => {
  const { user, token } = useAuth();
  
  // UI state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data state
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState('my-day');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Handle window resize for responsive layout
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Fetch user's lists on mount
   */
  useEffect(() => {
    fetchLists();
  }, []);

  /**
   * Fetch tasks when selected list changes
   */
  useEffect(() => {
    if (selectedListId && selectedListId !== 'important') {
      fetchTasks(selectedListId);
    } else if (selectedListId === 'important') {
      fetchImportantTasks();
    }
  }, [selectedListId]);

  /**
   * API call to fetch all lists
   */
  const fetchLists = async () => {
    try {
      const response = await fetch(`${API_URL}/lists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch lists');

      const data = await response.json();
      setLists(data.filter(list => !list.is_default)); // Filter out "My Day" from custom lists
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * API call to fetch tasks for a specific list
   */
  const fetchTasks = async (listId) => {
    setLoading(true);
    try {
      // If it's "my-day", we need to find the actual default list ID
      let actualListId = listId;
      if (listId === 'my-day') {
        const response = await fetch(`${API_URL}/lists`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch lists');
        const allLists = await response.json();
        const myDayList = allLists.find(l => l.is_default);
        actualListId = myDayList?.id;
      }

      const response = await fetch(`${API_URL}/lists/${actualListId}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * API call to fetch all important tasks
   */
  const fetchImportantTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/important`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch important tasks');

      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Create a new list
   */
  const handleCreateList = async (name) => {
    try {
      const response = await fetch(`${API_URL}/lists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) throw new Error('Failed to create list');

      const newList = await response.json();
      setLists([...lists, newList]);
      setSelectedListId(newList.id);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Update list name
   */
  const handleUpdateList = async (listId, newName) => {
    try {
      const response = await fetch(`${API_URL}/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) throw new Error('Failed to update list');

      const updatedList = await response.json();
      setLists(lists.map(list => list.id === listId ? updatedList : list));
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Delete a list
   */
  const handleDeleteList = async (listId) => {
    try {
      const response = await fetch(`${API_URL}/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete list');

      setLists(lists.filter(list => list.id !== listId));
      
      // If deleted list was selected, switch to My Day
      if (selectedListId === listId) {
        setSelectedListId('my-day');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Add a new task
   */
  const handleAddTask = async (title) => {
    try {
      // Get the actual list ID for "my-day"
      let actualListId = selectedListId;
      if (selectedListId === 'my-day') {
        const response = await fetch(`${API_URL}/lists`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allLists = await response.json();
        const myDayList = allLists.find(l => l.is_default);
        actualListId = myDayList?.id;
      }

      // Can't add tasks to "Important" view
      if (selectedListId === 'important') {
        setError('Cannot add tasks to Important view. Please select a specific list.');
        return;
      }

      const response = await fetch(`${API_URL}/lists/${actualListId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) throw new Error('Failed to add task');

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Update a task
   */
  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Delete a task
   */
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Toggle task completion
   */
  const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await handleUpdateTask(taskId, { is_completed: !task.is_completed });
    }
  };

  /**
   * Toggle task important flag
   */
  const handleToggleImportant = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await handleUpdateTask(taskId, { is_important: !task.is_important });
      
      // If we're in the Important view and unmarking, remove from view
      if (selectedListId === 'important' && task.is_important) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    }
  };

  /**
   * Reorder tasks
   */
  const handleReorderTasks = async (taskOrders) => {
    try {
      // Get the actual list ID for "my-day"
      let actualListId = selectedListId;
      if (selectedListId === 'my-day') {
        const response = await fetch(`${API_URL}/lists`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allLists = await response.json();
        const myDayList = allLists.find(l => l.is_default);
        actualListId = myDayList?.id;
      }

      const response = await fetch(`${API_URL}/lists/${actualListId}/tasks/reorder`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskOrders })
      });

      if (!response.ok) throw new Error('Failed to reorder tasks');

      // Refresh tasks to get updated positions
      fetchTasks(selectedListId);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Get current selected list object
   */
  const getSelectedList = () => {
    if (selectedListId === 'my-day') {
      return { id: 'my-day', name: 'My Day', isDefault: true };
    } else if (selectedListId === 'important') {
      return { id: 'important', name: 'Important Tasks', isSpecial: true };
    } else {
      return lists.find(l => l.id === selectedListId);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <Header
        username={user?.username}
        currentListName={getSelectedList()?.name}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden pt-14 sm:pt-16">
        {/* Sidebar */}
        <Sidebar
          lists={lists}
          selectedListId={selectedListId}
          onSelectList={setSelectedListId}
          onCreateList={handleCreateList}
          onUpdateList={handleUpdateList}
          onDeleteList={handleDeleteList}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Main content */}
        <MainContent
          selectedList={getSelectedList()}
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
          onToggleImportant={handleToggleImportant}
          onReorderTasks={handleReorderTasks}
          loading={loading}
        />
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
