import { useState } from 'react';

export const ListItem = ({
  list,
  isSelected,
  isSpecial = false,
  isEditing,
  onSelect,
  onEdit,
  onSave,
  onDelete,
}) => {
  const [editedName, setEditedName] = useState(list.name);

  const handleSaveClick = () => {
    if (editedName.trim()) {
      onSave(list.id, editedName.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    } else if (e.key === 'Escape') {
      setEditedName(list.name);
      onSave(list.id, list.name);
    }
  };

  return (
    <li>
      <div
        className={`
          group flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition
          ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
        `}
        onClick={() => !isEditing && onSelect(list.id)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isSpecial && list.id === 'important' && (
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}

          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveClick}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
              {list.name}
            </span>
          )}
        </div>

        {!isSpecial && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditedName(list.name);
                onEdit(list.id);
              }}
              className="p-1.5 hover:bg-gray-200 rounded transition"
              aria-label="Edit list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete list "${list.name}"?`)) {
                  onDelete(list.id);
                }
              }}
              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
              aria-label="Delete list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </li>
  );
};
