import { useState } from 'react';
import { ListItem } from '../lists/ListItem';
import { NewListButton } from '../lists/NewListButton';

export const Sidebar = ({
  lists,
  selectedListId,
  onSelectList,
  onCreateList,
  onUpdateList,
  onDeleteList,
  isOpen,
  onClose,
  isMobile,
}) => {
  const [editingListId, setEditingListId] = useState(null);

  const handleSelectList = (listId) => {
    onSelectList(listId);
    if (isMobile) {
      onClose();
    }
  };

  const handleSaveEdit = (listId, newName) => {
    onUpdateList(listId, newName);
    setEditingListId(null);
  };

  const sidebarContent = (
    <nav className="flex flex-col h-full">
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {/* My Day - permanent default list */}
        <ListItem
          list={{ id: 'my-day', name: 'My Day' }}
          isSelected={selectedListId === 'my-day'}
          isSpecial={true}
          isEditing={false}
          onSelect={handleSelectList}
          onEdit={() => {}}
          onSave={() => {}}
          onDelete={() => {}}
        />

        {/* Important Tasks - special aggregator */}
        <ListItem
          list={{ id: 'important', name: 'Important Tasks' }}
          isSelected={selectedListId === 'important'}
          isSpecial={true}
          isEditing={false}
          onSelect={handleSelectList}
          onEdit={() => {}}
          onSave={() => {}}
          onDelete={() => {}}
        />

        {/* Divider */}
        <li className="my-2">
          <div className="border-t border-gray-300"></div>
        </li>

        {/* User custom lists */}
        {lists &&
          lists.map((list) => (
            <ListItem
              key={list.id}
              list={list}
              isSelected={selectedListId === list.id}
              isSpecial={false}
              isEditing={editingListId === list.id}
              onSelect={handleSelectList}
              onEdit={(id) => setEditingListId(id)}
              onSave={handleSaveEdit}
              onDelete={onDeleteList}
            />
          ))}
      </ul>

      {/* Add new list */}
      <NewListButton onCreate={onCreateList} />
    </nav>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={onClose}
          />
        )}

        <aside
          className={`
            fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white z-50 p-4 transform transition-transform duration-300
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
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
