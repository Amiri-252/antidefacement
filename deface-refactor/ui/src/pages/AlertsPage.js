// frontend/src/pages/AlertsPage.js
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, XCircle, CheckCircle, Filter, Trash2, Eye } from 'lucide-react';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filter, setFilter] = useState('all'); // all, critical, warning, info
  const [selectedAlerts, setSelectedAlerts] = useState([]);

  // Mock data
  useEffect(() => {
    const mockAlerts = [
      {
        id: 1,
        timestamp: '2024-03-15 14:32:15',
        server: 'Production Server 1',
        type: 'File Modified',
        severity: 'critical',
        message: 'Suspicious file modification detected',
        details: 'index.php was modified outside maintenance window',
        status: 'active',
        autoRestored: true,
      },
      {
        id: 2,
        timestamp: '2024-03-15 14:15:08',
        server: 'Production Server 1',
        type: 'Permission Changed',
        severity: 'warning',
        message: 'File permissions changed',
        details: 'config.php permissions changed from 644 to 777',
        status: 'active',
        autoRestored: false,
      },
      {
        id: 3,
        timestamp: '2024-03-15 13:45:22',
        server: 'Staging Server',
        type: 'Malicious File',
        severity: 'critical',
        message: 'Potential malware detected',
        details: 'shell.php contains suspicious code patterns',
        status: 'resolved',
        autoRestored: true,
      },
      {
        id: 4,
        timestamp: '2024-03-15 13:20:45',
        server: 'Development Server',
        type: 'File Deleted',
        severity: 'warning',
        message: 'Important file deleted',
        details: 'backup.sql was deleted',
        status: 'active',
        autoRestored: false,
      },
      {
        id: 5,
        timestamp: '2024-03-15 12:50:33',
        server: 'Production Server 1',
        type: 'Directory Modified',
        severity: 'info',
        message: 'Directory permissions changed',
        details: 'uploads/ directory permissions set to 755',
        status: 'resolved',
        autoRestored: false,
      },
      {
        id: 6,
        timestamp: '2024-03-15 12:18:09',
        server: 'Production Server 1',
        type: 'Unknown Access',
        severity: 'critical',
        message: 'Unauthorized access attempt',
        details: 'Multiple failed login attempts detected',
        status: 'active',
        autoRestored: false,
      },
      {
        id: 7,
        timestamp: '2024-03-15 11:45:15',
        server: 'Staging Server',
        type: 'Configuration Change',
        severity: 'warning',
        message: 'Configuration file modified',
        details: '.htaccess rules modified',
        status: 'resolved',
        autoRestored: true,
      },
      {
        id: 8,
        timestamp: '2024-03-15 10:30:22',
        server: 'Development Server',
        type: 'New File',
        severity: 'info',
        message: 'New file added',
        details: 'test.php was added to root directory',
        status: 'resolved',
        autoRestored: false,
      },
    ];

    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
  }, []);

  // Filter alerts
  useEffect(() => {
    if (filter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.severity === filter));
    }
  }, [filter, alerts]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Bell;
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    return colors[severity] || colors.info;
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || colors.info;
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const handleSelectAlert = (alertId) => {
    setSelectedAlerts(prev =>
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(a => a.id));
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Delete ${selectedAlerts.length} selected alert(s)?`)) {
      setAlerts(prev => prev.filter(a => !selectedAlerts.includes(a.id)));
      setSelectedAlerts([]);
    }
  };

  const handleResolveSelected = () => {
    setAlerts(prev =>
      prev.map(a =>
        selectedAlerts.includes(a.id) ? { ...a, status: 'resolved' } : a
      )
    );
    setSelectedAlerts([]);
  };

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    active: alerts.filter(a => a.status === 'active').length,
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Info</p>
              <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
            </div>
            <Info className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Critical ({stats.critical})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Warning ({stats.warning})
            </button>
            <button
              onClick={() => setFilter('info')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'info'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Info ({stats.info})
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedAlerts.length} selected
              </span>
              <button
                onClick={handleResolveSelected}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No alerts found</p>
            <p className="text-gray-500 text-sm mt-2">All systems are running smoothly</p>
          </div>
        ) : (
          <div>
            {/* Select All Header */}
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAlerts.length === filteredAlerts.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredAlerts.length})
                </span>
              </label>
            </div>

            {/* Alerts */}
            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      selectedAlerts.includes(alert.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={() => handleSelectAlert(alert.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getSeverityColor(alert.severity)}`}>
                        <SeverityIcon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">
                              {alert.message}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.details}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <span className="font-medium">{alert.type}</span>
                          <span>•</span>
                          <span>{alert.server}</span>
                          <span>•</span>
                          <span>{alert.timestamp}</span>
                          {alert.autoRestored && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">Auto-Restored</span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            View Details
                          </button>
                          {alert.status === 'active' && (
                            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Resolve
                            </button>
                          )}
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
