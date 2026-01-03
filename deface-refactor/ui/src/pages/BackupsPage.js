// frontend/src/pages/BackupsPage.js
import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, RefreshCw, Trash2, HardDrive } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BackupsPage = () => {
  const { hasRole } = useAuth();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBackups();
      setBackups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (serverId) => {
    setActionLoading(`create-${serverId}`);
    setMessage(null);
    try {
      await api.createBackup(serverId);
      setMessage({ type: 'success', text: 'Backup created successfully!' });
      await loadBackups();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore from this backup? This will overwrite current files.')) {
      return;
    }
    
    setActionLoading(`restore-${backupId}`);
    setMessage(null);
    try {
      await api.restoreBackup(backupId);
      setMessage({ type: 'success', text: 'Restore initiated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Backup Management</h2>
          <p className="text-gray-600">Manage server backups and restore points</p>
        </div>
        <button
          onClick={loadBackups}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {backups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Backups Found</h3>
          <p className="text-gray-600">Configure backup paths on servers to enable backups</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {backups.map((backup) => (
            <div key={backup.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <HardDrive className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{backup.server}</h3>
                    <p className="text-sm text-gray-600">{backup.backup_path}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="font-medium">{backup.last_backup}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{backup.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Files:</span>
                  <span className="font-medium">{backup.files}</span>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2">
                {hasRole('operator') && (
                  <>
                    <button
                      onClick={() => handleCreateBackup(backup.id)}
                      disabled={actionLoading === `create-${backup.id}`}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {actionLoading === `create-${backup.id}` ? 'Creating...' : 'Create Backup'}
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={actionLoading === `restore-${backup.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {actionLoading === `restore-${backup.id}` ? 'Restoring...' : 'Restore'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Backup Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About Backups</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Backups are stored on the remote server in the configured backup path</li>
          <li>In active mode, initial backups are created automatically</li>
          <li>Manual backups can be created at any time by operators and admins</li>
          <li>Restore operations will overwrite current files with backup versions</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupsPage;
