import { useState } from 'react';

export const NewListButton = ({ onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreate(newListName.trim());
      setNewListName('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setNewListName('');
    setIsCreating(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isCreating) {
    return (
      <form onSubmit={handleSubmit} className="mt-2 px-2">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          placeholder="Enter list name..."
          className="w-full px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsCreating(true)}
      className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium mt-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      New List
    </button>
  );
};
