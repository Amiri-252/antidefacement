// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const USE_MOCK_DATA = true; // Set to false when backend is ready

// Mock data for development
const mockData = {
  stats: {
    totalServers: 12,
    activeMonitors: 12,
    alertsToday: 8,
    restoredFiles: 24,
  },
  servers: [
    {
      id: 1,
      name: 'Production Server 1',
      ip: '192.168.1.100',
      path: '/var/www/html',
      status: 'active',
      changes: 3,
      alerts: 1,
    },
    {
      id: 2,
      name: 'Development Server',
      ip: '192.168.1.101',
      path: '/var/www/dev',
      status: 'active',
      changes: 0,
      alerts: 0,
    },
    {
      id: 3,
      name: 'Staging Server',
      ip: '192.168.1.102',
      path: '/var/www/staging',
      status: 'active',
      changes: 5,
      alerts: 2,
    },
  ],
  alerts: [
    {
      id: 1,
      time: '2024-03-15 14:32:15',
      server: 'Production Server 1',
      type: 'File Modified',
      severity: 'critical',
      message: 'index.php was modified',
    },
    {
      id: 2,
      time: '2024-03-15 13:45:22',
      server: 'Staging Server',
      type: 'Permission Changed',
      severity: 'warning',
      message: 'config.php permissions changed to 777',
    },
    {
      id: 3,
      time: '2024-03-15 12:18:09',
      server: 'Production Server 1',
      type: 'New File Added',
      severity: 'info',
      message: 'shell.php detected',
    },
  ],
};

class ApiService {
  async request(endpoint, options = {}) {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      return this.mockRequest(endpoint, options);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  // Mock request handler
  async mockRequest(endpoint, options = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Mock API: ${options.method || 'GET'} ${endpoint}`);

    // Handle different endpoints
    if (endpoint === '/dashboard/stats') {
      return mockData.stats;
    }

    if (endpoint === '/servers') {
      if (options.method === 'POST') {
        const newServer = {
          id: Date.now(),
          ...JSON.parse(options.body),
          status: 'active',
          changes: 0,
          alerts: 0,
        };
        mockData.servers.push(newServer);
        return newServer;
      }
      return mockData.servers;
    }

    if (endpoint.startsWith('/servers/') && options.method === 'DELETE') {
      const serverId = parseInt(endpoint.split('/')[2]);
      mockData.servers = mockData.servers.filter(s => s.id !== serverId);
      return { success: true };
    }

    if (endpoint.startsWith('/alerts')) {
      return mockData.alerts;
    }

    if (endpoint.startsWith('/activity')) {
      return [];
    }

    if (endpoint.startsWith('/files')) {
      return [];
    }

    if (endpoint.startsWith('/permissions')) {
      return [];
    }

    if (endpoint.startsWith('/backups')) {
      return [];
    }

    if (endpoint.startsWith('/settings')) {
      return {};
    }

    throw new Error(`Mock endpoint not implemented: ${endpoint}`);
  }

  // Dashboard
  getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Servers
  getServers() {
    return this.request('/servers');
  }

  addServer(serverData) {
    return this.request('/servers', {
      method: 'POST',
      body: JSON.stringify(serverData),
    });
  }

  deleteServer(serverId) {
    return this.request(`/servers/${serverId}`, {
      method: 'DELETE',
    });
  }

  // Activity
  getActivity(limit = 50) {
    return this.request(`/activity?limit=${limit}`);
  }

  // Alerts
  getAlerts(filter = 'all') {
    return this.request(`/alerts?filter=${filter}`);
  }

  // File Changes
  getFileChanges(serverId = null) {
    const endpoint = serverId ? `/files?server_id=${serverId}` : '/files';
    return this.request(endpoint);
  }

  // Permission Changes
  getPermissionChanges(serverId = null) {
    const endpoint = serverId ? `/permissions?server_id=${serverId}` : '/permissions';
    return this.request(endpoint);
  }

  // Backups
  getBackups() {
    return this.request('/backups');
  }

  createBackup(serverId) {
    return this.request('/backups', {
      method: 'POST',
      body: JSON.stringify({ server_id: serverId }),
    });
  }

  restoreBackup(backupId) {
    return this.request(`/backups/${backupId}/restore`, {
      method: 'POST',
    });
  }

  // Settings
  getAlertConfig() {
    return this.request('/settings/alerts');
  }

  updateAlertConfig(config) {
    return this.request('/settings/alerts', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  getGeneralSettings() {
    return this.request('/settings/general');
  }

  updateGeneralSettings(settings) {
    return this.request('/settings/general', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export default new ApiService();
