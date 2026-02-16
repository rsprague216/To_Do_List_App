import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { IMPORTANT_LIST_ID } from '../utils/constants';

export const useTasks = (selectedListId, resolveListId) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(
    async (listId) => {
      setIsLoading(true);
      try {
        const actualId = resolveListId(listId);
        if (!actualId) return;
        const data = await api.getTasks(actualId);
        setTasks(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [resolveListId]
  );

  const fetchImportantTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getImportantTasks();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedListId === IMPORTANT_LIST_ID) {
      fetchImportantTasks();
    } else if (selectedListId) {
      fetchTasks(selectedListId);
    }
  }, [selectedListId, fetchTasks, fetchImportantTasks]);

  const createTask = useCallback(
    async (title) => {
      if (selectedListId === IMPORTANT_LIST_ID) {
        setError('Cannot add tasks to Important view. Please select a specific list.');
        return;
      }
      try {
        const actualId = resolveListId(selectedListId);
        const newTask = await api.createTask(actualId, title);
        setTasks((prev) => [...prev, newTask]);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    },
    [selectedListId, resolveListId]
  );

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const updatedTask = await api.updateTask(taskId, updates);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updatedTask : task)));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const toggleComplete = useCallback(
    async (taskId) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (task) {
          api.updateTask(taskId, { is_completed: !task.is_completed }).then((updatedTask) => {
            setTasks((current) =>
              current.map((t) => (t.id === taskId ? updatedTask : t))
            );
          }).catch((err) => {
            setError(err.response?.data?.error || err.message);
          });
        }
        return prev;
      });
    },
    []
  );

  const toggleImportant = useCallback(
    async (taskId) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task) return prev;

        api.updateTask(taskId, { is_important: !task.is_important }).then((updatedTask) => {
          setTasks((current) => {
            // If in Important view and unmarking, remove from view
            if (selectedListId === IMPORTANT_LIST_ID && task.is_important) {
              return current.filter((t) => t.id !== taskId);
            }
            return current.map((t) => (t.id === taskId ? updatedTask : t));
          });
        }).catch((err) => {
          setError(err.response?.data?.error || err.message);
        });

        return prev;
      });
    },
    [selectedListId]
  );

  const reorderTasks = useCallback(
    async (taskOrders) => {
      try {
        const actualId = resolveListId(selectedListId);
        await api.reorderTasks(actualId, taskOrders);
        fetchTasks(selectedListId);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    },
    [selectedListId, resolveListId, fetchTasks]
  );

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    setError,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    toggleImportant,
    reorderTasks,
  };
};
