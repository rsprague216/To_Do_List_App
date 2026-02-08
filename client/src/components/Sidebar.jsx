/**
 * Sidebar Component
 * 
 * Navigation sidebar for list selection and management.
 * 
 * Features:
 * - Default lists: "My Day" (permanent), "Important Tasks" (permanent)
 * - User custom lists (editable, deletable)
 * - Add new list button
 * - List selection and highlighting
 * - Mobile: Slides in as overlay
 * - Desktop/Tablet: Fixed sidebar column
 * 
 * Props:
 * - lists: Array of user's custom lists
 * - selectedListId: ID of currently selected list
 * - onSelectList: Callback when list is selected
 * - onCreateList: Callback to create new list
 * - onUpdateList: Callback to update list name
 * - onDeleteList: Callback to delete list
 * - isOpen: Boolean for mobile overlay state
 * - onClose: Callback to close mobile sidebar
 * - isMobile: Boolean for mobile layout
 */

import { useState } from 'react';

export const Sidebar = ({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
  onUpdateList,
  onDeleteList,
  isOpen,
  onClose,
  isMobile
}) => {
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  /**
   * Handle list name editing
   */
  const startEditing = (list) => {
    setEditingListId(list.id);
    setEditingName(list.name);
  };

  const saveEdit = () => {
    if (editingName.trim() && editingListId) {
      onUpdateList(editingListId, editingName.trim());
    }
    setEditingListId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingListId(null);
    setEditingName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  /**
   * Handle list selection
   */
  const handleSelectList = (listId) => {
    onSelectList(listId);
    if (isMobile) {
      onClose();
    }
  };

  /**
   * Handle new list creation
   */
  const handleCreateNewList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
      setIsCreatingList(false);
    }
  };

  const cancelCreateList = () => {
    setNewListName('');
    setIsCreatingList(false);
  };

  const handleNewListKeyDown = (e) => {
    if (e.key === 'Escape') {
      cancelCreateList();
    }
  };

  /**
   * Render individual list item
   */
  const renderListItem = (list, isSpecial = false) => {
    const isSelected = selectedListId === list.id;
    const isEditing = editingListId === list.id;

    return (
      <li key={list.id}>
        <div
          className={`
            group flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition
            ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
          `}
          onClick={() => !isEditing && handleSelectList(list.id)}
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
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={saveEdit}
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
                  startEditing(list);
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
                    onDeleteList(list.id);
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

  const sidebarContent = (
    <nav className="flex flex-col h-full">
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {/* My Day - permanent default list */}
        {renderListItem({ id: 'my-day', name: 'My Day' }, true)}
        
        {/* Important Tasks - special aggregator */}
        {renderListItem({ id: 'important', name: 'Important Tasks' }, true)}
        
        {/* Divider */}
        <li className="my-2">
          <div className="border-t border-gray-300"></div>
        </li>
        
        {/* User custom lists */}
        {lists && lists.map(list => renderListItem(list, false))}
      </ul>

      {/* Add new list section */}
      {isCreatingList ? (
        <form onSubmit={handleCreateNewList} className="mt-2 px-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onBlur={handleCreateNewList}
            onKeyDown={handleNewListKeyDown}
            placeholder="Enter list name..."
            className="w-full px-3 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </form>
      ) : (
        <button
          onClick={() => setIsCreatingList(true)}
          className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium mt-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New List
        </button>
      )}
    </nav>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={onClose}
          />
        )}

        {/* Sidebar overlay */}
        <aside
          className={`
            fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white z-50 p-4 transform transition-transform duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop/Tablet fixed sidebar
  return (
    <aside className="w-64 lg:w-72 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      {sidebarContent}
    </aside>
  );
};
