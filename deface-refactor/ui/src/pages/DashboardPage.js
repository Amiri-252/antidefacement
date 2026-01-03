// frontend/src/pages/DashboardPage.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Server, Eye, Bell, RefreshCw, Plus, Settings, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useDashboard } from '../context/DashboardContext';

const DashboardPage = () => {
  const { stats, recentAlerts, activityData } = useDashboard();

  const statCards = [
    {
      title: 'Total Servers',
      value: stats.totalServers,
      change: '↑ 2 new this month',
      icon: Server,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Monitors',
      value: stats.activeMonitors,
      change: '↑ All online',
      icon: Eye,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Alerts Today',
      value: stats.alertsToday,
      change: '↓ 3 critical',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Restored Files',
      value: stats.restoredFiles,
      change: '↓ 23% from yesterday',
      icon: RefreshCw,
      color: 'bg-green-100 text-green-600',
    },
  ];

  const quickActions = [
    { label: 'Add New Server', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Force Restore All', icon: RefreshCw, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Test Alerts', icon: Settings, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Generate Report', icon: Activity, color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  const getSeverityClass = (severity) => {
    const classes = {
      critical: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
    };
    return classes[severity] || classes.info;
  };

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Activity Overview (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="fileChanges"
              stroke="#2563eb"
              strokeWidth={2}
              name="File Changes"
            />
            <Line
              type="monotone"
              dataKey="permChanges"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Permission Changes"
            />
            <Line
              type="monotone"
              dataKey="restores"
              stroke="#10b981"
              strokeWidth={2}
              name="Restores"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Alerts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Server
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">{alert.time}</td>
                    <td className="px-4 py-4 text-sm">{alert.server}</td>
                    <td className="px-4 py-4 text-sm">{alert.type}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityClass(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className={`px-4 py-3 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${action.color}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
