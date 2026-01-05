// frontend/src/pages/ServersPage.js
import React, { useState } from 'react';
import { Plus, Trash2, Activity } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

const ServerCard = ({ server, onDelete, onToggleMode }) => {
  const initials = server.name.substring(0, 2).toUpperCase();
  const [togglingMode, setTogglingMode] = useState(false);

  const handleToggleMode = async () => {
    const newMode = server.mode === 'active' ? 'passive' : 'active';
    setTogglingMode(true);
    try {
      await onToggleMode(server.id, newMode);
    } catch (error) {
      console.error('Failed to toggle mode:', error);
      alert('Failed to update server mode. Please try again.');
    } finally {
      setTogglingMode(false);
    }
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-500 transition-all flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
          {initials}
        </div>
        <div>
          <h4 className="font-semibold text-lg">{server.name}</h4>
          <p className="text-sm text-gray-600">
            {server.ip} • {server.path}
          </p>
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">✓</div>
          <div className="text-xs text-gray-600 uppercase">Status</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{server.changes || 0}</div>
          <div className="text-xs text-gray-600 uppercase">Changes</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{server.alerts || 0}</div>
          <div className="text-xs text-gray-600 uppercase">Alerts</div>
        </div>
        <button
          onClick={handleToggleMode}
          disabled={togglingMode}
          className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
            server.mode === 'active'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          } ${togglingMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={`Currently: ${server.mode}. Click to toggle.`}
        >
          <Activity className="w-4 h-4" />
          {togglingMode ? 'Updating...' : server.mode === 'active' ? 'Active' : 'Passive'}
        </button>
        <button
          onClick={() => onDelete(server.id)}
          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

const ServersPage = ({ onNavigate }) => {
  const { servers, deleteServer, updateServerMode } = useDashboard();
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (serverId) => {
    if (!window.confirm('Are you sure you want to delete this server?')) {
      return;
    }

    setDeleting(serverId);
    try {
      await deleteServer(serverId);
    } catch (error) {
      console.error('Failed to delete server:', error);
      alert('Failed to delete server. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleMode = async (serverId, newMode) => {
    await updateServerMode(serverId, newMode);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Monitored Servers</h3>
        <button
          onClick={() => onNavigate('add-server')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Server
        </button>
      </div>
      <div className="space-y-4">
        {servers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No servers configured</p>
            <p className="text-sm">Click "Add Server" to start monitoring</p>
          </div>
        ) : (
          servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onDelete={handleDelete}
              onToggleMode={handleToggleMode}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ServersPage;
