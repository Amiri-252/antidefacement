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

      // Mock activity data - replace with real API call
      setActivityData([
        { name: 'Mon', fileChanges: 12, permChanges: 8, restores: 5 },
        { name: 'Tue', fileChanges: 19, permChanges: 12, restores: 8 },
        { name: 'Wed', fileChanges: 15, permChanges: 10, restores: 6 },
        { name: 'Thu', fileChanges: 25, permChanges: 15, restores: 10 },
        { name: 'Fri', fileChanges: 22, permChanges: 13, restores: 9 },
        { name: 'Sat', fileChanges: 18, permChanges: 11, restores: 7 },
        { name: 'Sun', fileChanges: 15, permChanges: 9, restores: 6 },
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
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
