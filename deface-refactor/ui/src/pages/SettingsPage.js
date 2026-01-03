// frontend/src/pages/SettingsPage.js
import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { hasRole } = useAuth();
  const [settings, setSettings] = useState({
    monitoring_interval: 1,
    default_mode: 'active',
    redis_host: 'localhost',
    redis_port: 6379,
    redis_password: '',
    redis_enabled: false,
    log_retention_days: 30,
    log_level: 'INFO',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getGeneralSettings();
      if (Object.keys(data).length > 0) {
        // Convert key-value pairs from backend
        const parsedSettings = {};
        Object.keys(data).forEach(key => {
          const cleanKey = key.replace('general_', '');
          parsedSettings[cleanKey] = data[key];
        });
        setSettings({ ...settings, ...parsedSettings });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateGeneralSettings(settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">General Settings</h2>
        <p className="text-gray-600">Configure system-wide settings</p>
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

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Monitoring Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monitoring Interval (seconds)
            </label>
            <input
              type="number"
              value={settings.monitoring_interval}
              onChange={(e) => handleChange('monitoring_interval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Monitoring Mode
            </label>
            <select
              value={settings.default_mode}
              onChange={(e) => handleChange('default_mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            >
              <option value="passive">Passive (Log Only)</option>
              <option value="active">Active (Auto-Restore)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Retention (days)
            </label>
            <input
              type="number"
              value={settings.log_retention_days}
              onChange={(e) => handleChange('log_retention_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Level
            </label>
            <select
              value={settings.log_level}
              onChange={(e) => handleChange('log_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            >
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Redis Configuration</h3>
        
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.redis_enabled}
              onChange={(e) => handleChange('redis_enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600"
              disabled={!hasRole('admin')}
            />
            <span className="text-sm font-medium text-gray-700">Enable Redis</span>
          </label>
        </div>

        {settings.redis_enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redis Host
              </label>
              <input
                type="text"
                value={settings.redis_host}
                onChange={(e) => handleChange('redis_host', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hasRole('admin')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redis Port
              </label>
              <input
                type="number"
                value={settings.redis_port}
                onChange={(e) => handleChange('redis_port', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!hasRole('admin')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redis Password (optional)
              </label>
              <input
                type="password"
                value={settings.redis_password}
                onChange={(e) => handleChange('redis_password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty if no password"
                disabled={!hasRole('admin')}
              />
            </div>
          </div>
        )}
      </div>

      {hasRole('admin') && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
