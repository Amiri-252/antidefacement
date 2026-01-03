// frontend/src/context/DashboardContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import websocketService from '../services/websocket';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [servers, setServers] = useState([]);
  const [stats, setStats] = useState({
    totalServers: 0,
    activeMonitors: 0,
    alertsToday: 0,
    restoredFiles: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.connect();

    // Subscribe to real-time stats updates
    const unsubscribeStats = websocketService.on('stats_update', (data) => {
      console.log('Received real-time stats:', data);
      setStats({
        totalServers: data.totalServers,
        activeMonitors: data.activeMonitors,
        alertsToday: data.alertsToday,
        restoredFiles: data.restoredFiles,
      });
    });

    // Subscribe to activity updates
    const unsubscribeActivity = websocketService.on('activity_update', (data) => {
      console.log('Received activity update:', data);
      // Update activity data if needed
    });

    // Cleanup on unmount
    return () => {
      unsubscribeStats();
      unsubscribeActivity();
      websocketService.disconnect();
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, serversData, alertsData] = await Promise.all([
        api.getDashboardStats(),
        api.getServers(),
        api.getAlerts(),
      ]);

      setStats(statsData);
      setServers(serversData);
      setRecentAlerts(alertsData.slice(0, 3));

      // Activity chart data - currently showing zeros as placeholder
      // Backend endpoint for historical activity trends needs to be implemented
      // This will aggregate activity_logs by day for the chart visualization
      setActivityData([
        { name: 'Mon', fileChanges: 0, permChanges: 0, restores: 0 },
        { name: 'Tue', fileChanges: 0, permChanges: 0, restores: 0 },
        { name: 'Wed', fileChanges: 0, permChanges: 0, restores: 0 },
        { name: 'Thu', fileChanges: 0, permChanges: 0, restores: 0 },
        { name: 'Fri', fileChanges: 0, permChanges: 0, restores: 0 },
        { name: 'Sat', fileChanges: 0, permChanges: 0, restores: 0 },
        { name: 'Sun', fileChanges: 0, permChanges: 0, restores: 0 },
      ]);
    } catch (err) {
      setError(err.message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addServer = useCallback(async (serverData) => {
    try {
      const newServer = await api.addServer(serverData);
      setServers(prev => [...prev, newServer]);
      return newServer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteServer = useCallback(async (serverId) => {
    try {
      await api.deleteServer(serverId);
      setServers(prev => prev.filter(s => s.id !== serverId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateServerMode = useCallback(async (serverId, mode) => {
    try {
      await api.updateServerMode(serverId, mode);
      setServers(prev => prev.map(s => 
        s.id === serverId ? { ...s, mode } : s
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    servers,
    stats,
    recentAlerts,
    activityData,
    loading,
    error,
    loadDashboardData,
    addServer,
    deleteServer,
    updateServerMode,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
