/**
 * Main App Component
 * 
 * Sets up routing and authentication for the to-do list application.
 * 
 * Routes:
 * - / : Redirects to /app or /login based on auth status
 * - /login : Authentication page (login/signup)
 * - /app : Protected main application
 * 
 * The app is wrapped in:
 * - BrowserRouter: Enables client-side routing
 * - AuthProvider: Provides authentication context
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { AppLayout } from './pages/AppLayout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root route - redirect to app or login */}
          <Route 
            path="/" 
            element={<Navigate to="/app" replace />} 
          />

          {/* Login/Signup page */}
          <Route 
            path="/login" 
            element={<AuthPage />} 
          />

          {/* Protected app routes */}
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route - redirect to root */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
