import { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { AddTaskInput } from '../tasks/AddTaskInput';
import { TaskList } from '../tasks/TaskList';
import { CompletedTasksSection } from '../tasks/CompletedTasksSection';

export const MainContent = ({
  selectedListId,
  listName,
  resolveListId,
}) => {
  const {
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
  } = useTasks(selectedListId, resolveListId);

  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const incompleteTasks = localTasks.filter((task) => !task.is_completed);
  const completedTasks = localTasks.filter((task) => task.is_completed);

  const handleLocalReorder = (reordered) => {
    const completed = localTasks.filter((task) => task.is_completed);
    setLocalTasks([...reordered, ...completed]);
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading tasks...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* List title */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {listName || 'My Day'}
        </h2>
      </div>

      {/* Add task input */}
      <AddTaskInput onAddTask={createTask} />

      {/* Error display */}
      {error && (
        <div className="px-4 sm:px-6 py-2 bg-red-50 text-red-600 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto bg-white">
        {localTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg">No tasks yet</p>
            <p className="text-sm">Add a task to get started</p>
          </div>
        ) : (
          <>
            {incompleteTasks.length > 0 && (
              <TaskList
                tasks={incompleteTasks}
                onToggleComplete={toggleComplete}
                onToggleImportant={toggleImportant}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onReorderTasks={reorderTasks}
                onLocalReorder={handleLocalReorder}
              />
            )}

            <CompletedTasksSection
              tasks={completedTasks}
              onToggleComplete={toggleComplete}
              onToggleImportant={toggleImportant}
              onDelete={deleteTask}
            />
          </>
        )}
      </div>
    </main>
  );
};
