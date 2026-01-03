// frontend/src/pages/ActivityPage.js
import React, { useState, useEffect } from 'react';
import { Activity, Filter, Download, Search, Calendar, Server, FileText, AlertTriangle } from 'lucide-react';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterServer, setFilterServer] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        timestamp: '2024-03-15 14:32:15',
        server: 'Production Server 1',
        type: 'file_modified',
        action: 'File Modified',
        details: 'index.php was modified',
        user: 'system',
        severity: 'critical',
        restored: true,
      },
      {
        id: 2,
        timestamp: '2024-03-15 14:15:08',
        server: 'Production Server 1',
        type: 'permission_changed',
        action: 'Permission Changed',
        details: 'config.php permissions changed from 644 to 777',
        user: 'admin',
        severity: 'warning',
        restored: false,
      },
      {
        id: 3,
        timestamp: '2024-03-15 13:45:22',
        server: 'Staging Server',
        type: 'file_added',
        action: 'File Added',
        details: 'shell.php was added',
        user: 'unknown',
        severity: 'critical',
        restored: true,
      },
      {
        id: 4,
        timestamp: '2024-03-15 13:20:45',
        server: 'Development Server',
        type: 'file_deleted',
        action: 'File Deleted',
        details: 'backup.sql was deleted',
        user: 'developer',
        severity: 'info',
        restored: false,
      },
      {
        id: 5,
        timestamp: '2024-03-15 12:50:33',
        server: 'Production Server 1',
        type: 'backup_created',
        action: 'Backup Created',
        details: 'Automatic backup completed successfully',
        user: 'system',
        severity: 'info',
        restored: false,
      },
      {
        id: 6,
        timestamp: '2024-03-15 12:18:09',
        server: 'Production Server 1',
        type: 'file_restored',
        action: 'File Restored',
        details: 'index.php restored from backup',
        user: 'system',
        severity: 'info',
        restored: false,
      },
      {
        id: 7,
        timestamp: '2024-03-15 11:45:15',
        server: 'Staging Server',
        type: 'permission_changed',
        action: 'Permission Changed',
        details: 'uploads/ directory permissions changed to 755',
        user: 'admin',
        severity: 'warning',
        restored: false,
      },
      {
        id: 8,
        timestamp: '2024-03-15 10:30:22',
        server: 'Development Server',
        type: 'file_modified',
        action: 'File Modified',
        details: 'app.js was modified',
        user: 'developer',
        severity: 'info',
        restored: false,
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

  // Filter activities
  useEffect(() => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        activity =>
          activity.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by server
    if (filterServer !== 'all') {
      filtered = filtered.filter(activity => activity.server === filterServer);
    }

    setFilteredActivities(filtered);
  }, [searchTerm, filterType, filterServer, activities]);

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || colors.info;
  };

  const getTypeIcon = (type) => {
    const icons = {
      file_modified: FileText,
      file_added: FileText,
      file_deleted: FileText,
      permission_changed: AlertTriangle,
      backup_created: Server,
      file_restored: FileText,
    };
    return icons[type] || Activity;
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Server', 'Action', 'Details', 'User', 'Severity'],
      ...filteredActivities.map(a => [
        a.timestamp,
        a.server,
        a.action,
        a.details,
        a.user,
        a.severity,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const servers = [...new Set(activities.map(a => a.server))];

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Activity Log
            </h2>
            <p className="text-gray-600 mt-1">
              Monitor all server activities and changes
            </p>
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              <option value="file_modified">File Modified</option>
              <option value="file_added">File Added</option>
              <option value="file_deleted">File Deleted</option>
              <option value="permission_changed">Permission Changed</option>
              <option value="backup_created">Backup Created</option>
              <option value="file_restored">File Restored</option>
            </select>
          </div>

          {/* Server Filter */}
          <div className="relative">
            <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterServer}
              onChange={(e) => setFilterServer(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Servers</option>
              {servers.map(server => (
                <option key={server} value={server}>{server}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredActivities.length} of {activities.length} activities</span>
          {(searchTerm || filterType !== 'all' || filterServer !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterServer('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activities...</p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No activities found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const IconComponent = getTypeIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(activity.severity)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{activity.action}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Server className="w-3 h-3" />
                              {activity.server}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {activity.timestamp}
                            </span>
                            <span>User: {activity.user}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(activity.severity)}`}>
                            {activity.severity}
                          </span>
                          {activity.restored && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              Restored
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
