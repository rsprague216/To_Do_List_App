import { useAuth } from '../../context/AuthContext';

export const Header = ({ username, currentListName, onMenuToggle, isMobile }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-gray-800 truncate flex-1 text-center px-2">
          {currentListName || 'My Day'}
        </h1>

        <button
          onClick={handleLogout}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Logout"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40">
      <h1 className="text-xl font-semibold text-gray-800">
        {username}'s To Do Lists
      </h1>

      <button
        onClick={handleLogout}
        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </header>
  );
};
