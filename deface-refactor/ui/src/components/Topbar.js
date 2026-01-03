// frontend/src/components/Topbar.js
import React from 'react';
import { RefreshCw, LogOut, User as UserIcon } from 'lucide-react';

const Topbar = ({ title, onRefresh, systemStatus = 'active', user, onLogout }) => {
  const formatTitle = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'operator':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white px-8 py-4 border-b border-gray-200 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          {formatTitle(title)}
        </h2>
        <div className="flex gap-4 items-center">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">{user.username}</div>
                  <div className={`text-xs font-medium px-2 py-0.5 rounded ${getRoleBadgeColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          <div
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold ${
              systemStatus === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === 'active' ? 'bg-green-600 animate-pulse' : 'bg-red-600'
            }`}></span>
            {systemStatus === 'active' ? 'All Systems Active' : 'System Error'}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;