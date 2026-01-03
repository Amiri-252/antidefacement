// frontend/src/components/Topbar.js
import React from 'react';
import { RefreshCw } from 'lucide-react';

const Topbar = ({ title, onRefresh, systemStatus = 'active' }) => {
  const formatTitle = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-white px-8 py-4 border-b border-gray-200 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          {formatTitle(title)}
        </h2>
        <div className="flex gap-4 items-center">
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
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;