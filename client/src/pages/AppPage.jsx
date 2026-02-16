import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLists } from '../hooks/useLists';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { MainContent } from '../components/layout/MainContent';

export const AppPage = () => {
  const { user } = useAuth();

  // UI layout state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // List state and operations
  const {
    lists,
    selectedListId,
    setSelectedListId,
    selectedList,
    resolveListId,
    createList,
    updateList,
    deleteList,
    error,
    setError,
  } = useLists();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <Header
        username={user?.username}
        currentListName={selectedList?.name}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      <div className="flex flex-1 overflow-hidden pt-14 sm:pt-16">
        <Sidebar
          lists={lists}
          selectedListId={selectedListId}
          onSelectList={setSelectedListId}
          onCreateList={createList}
          onUpdateList={updateList}
          onDeleteList={deleteList}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        <MainContent
          selectedListId={selectedListId}
          listName={selectedList?.name}
          resolveListId={resolveListId}
        />
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
          <button onClick={() => setError('')} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
