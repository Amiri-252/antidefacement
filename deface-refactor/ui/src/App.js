// frontend/src/App.js
import React, { useState, useEffect } from 'react';
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



const AppContent = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { loadDashboardData, loading, error } = useDashboard();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  // Show login page if not authenticated
  if (!isAuthenticated()) {
    return <LoginPage />;
  }

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleLogout = () => {
    logout();
    setActivePage('dashboard');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'servers':
        return <ServersPage onNavigate={setActivePage} />;
      case 'activity':
        return <ActivityPage />;
      case 'add-server':
        return <AddServerPage onNavigate={setActivePage} />;
      case 'permissions':
        return <div className="bg-white p-6 rounded-xl">Permissions Page - Coming Soon</div>;
      case 'backups':
        return <div className="bg-white p-6 rounded-xl">Backups Page - Coming Soon</div>;
      case 'alert-config':
        return <div className="bg-white p-6 rounded-xl">Alert Configuration - Coming Soon</div>;
      case 'settings':
        return <div className="bg-white p-6 rounded-xl">General Settings - Coming Soon</div>;
      case 'alerts':
        return <AlertsPage />;
      case 'files':
        return <FilesPage />;
      default:
        return <DashboardPage />;
    }
  };

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
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
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
            renderPage()
          )}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DashboardProvider>
        <AppContent />
      </DashboardProvider>
    </AuthProvider>
  );
};

export default App;
