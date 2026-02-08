/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 * Shows loading state while checking authentication.
 * 
 * Usage:
 * <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authenticated
 * @returns {React.ReactNode} - Children if authenticated, Navigate to login if not, or loading state
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  /**
   * Show loading state while verifying authentication
   * Prevents flash of redirect before auth check completes
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Redirect to login if not authenticated
   * Uses Navigate component for declarative routing
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /**
   * Render protected content if authenticated
   */
  return children;
};
