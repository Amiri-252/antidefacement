// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import ServersPage from './pages/ServersPage';
import ActivityPage from './pages/ActivityPage';
import AddServerPage from './pages/AddServerPage';
import AlertsPage from './pages/AlertsPage';
import FilesPage from './pages/FilesPage';
import BackupsPage from './pages/BackupsPage';
import AlertConfigPage from './pages/AlertConfigPage';
import SettingsPage from './pages/SettingsPage';
import PermissionsPage from './pages/PermissionsPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const { loadDashboardData, loading, error } = useDashboard();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePageChange = (page) => {
    navigate(`/${page}`);
  };

  // Get active page from location
  const activePage = location.pathname.substring(1) || 'dashboard';

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <main className="ml-64 flex-1">
        <Topbar
          title={activePage}
          onRefresh={handleRefresh}
          systemStatus="active"
          user={user}
          onLogout={handleLogout}
        />
        <div className="p-8">
          {loading && activePage === 'dashboard' ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/servers" element={<ServersPage onNavigate={handlePageChange} />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/add-server" element={<AddServerPage onNavigate={handlePageChange} />} />
              <Route path="/permissions" element={<PermissionsPage />} />
              <Route path="/backups" element={<BackupsPage />} />
              <Route path="/alert-config" element={<AlertConfigPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/files" element={<FilesPage />} />
            </Routes>
          )}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
