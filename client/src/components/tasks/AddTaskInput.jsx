import { useState } from 'react';

export const AddTaskInput = ({ onAddTask }) => {
  const [taskTitle, setTaskTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      onAddTask(taskTitle.trim());
      setTaskTitle('');
    }
  };

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        <button
          type="submit"
          className="p-2.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 flex-shrink-0"
          aria-label="Add task"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>
    </div>
  );
};
