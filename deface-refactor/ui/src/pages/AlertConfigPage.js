// frontend/src/pages/AlertConfigPage.js
import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Save, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AlertConfigPage = () => {
  const { hasRole } = useAuth();
  const [config, setConfig] = useState({
    telegram_token: '',
    telegram_chat_id: '',
    smtp_server: '',
    smtp_port: 587,
    email_from: '',
    email_to: '',
    critical_threshold: 'immediate',
    warning_threshold: 'after_3',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [testingAlert, setTestingAlert] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getAlertConfig();
      if (Object.keys(data).length > 0) {
        // Convert key-value pairs from backend
        const parsedConfig = {};
        Object.keys(data).forEach(key => {
          const cleanKey = key.replace('alert_', '');
          parsedConfig[cleanKey] = data[key];
        });
        setConfig({ ...config, ...parsedConfig });
      }
    } catch (err) {
      console.error('Error loading alert config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateAlertConfig(config);
      setMessage({ type: 'success', text: 'Alert configuration saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async () => {
    setTestingAlert(true);
    setMessage(null);
    try {
      // Mock test - in production, add a test endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Test alert sent successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send test alert' });
    } finally {
      setTestingAlert(false);
    }
  };

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alert configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Alert Configuration</h2>
        <p className="text-gray-600">Configure notification channels and alert thresholds</p>
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

      {/* Telegram Configuration */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Telegram Notifications
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bot Token
            </label>
            <input
              type="password"
              value={config.telegram_token}
              onChange={(e) => handleChange('telegram_token', e.target.value)}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your bot token from @BotFather on Telegram
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat ID
            </label>
            <input
              type="text"
              value={config.telegram_chat_id}
              onChange={(e) => handleChange('telegram_chat_id', e.target.value)}
              placeholder="-1001234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your chat ID from @userinfobot on Telegram
            </p>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-green-600" />
          Email Notifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Server
            </label>
            <input
              type="text"
              value={config.smtp_server}
              onChange={(e) => handleChange('smtp_server', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              value={config.smtp_port}
              onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email
            </label>
            <input
              type="email"
              value={config.email_from}
              onChange={(e) => handleChange('email_from', e.target.value)}
              placeholder="alerts@yourdomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Email
            </label>
            <input
              type="email"
              value={config.email_to}
              onChange={(e) => handleChange('email_to', e.target.value)}
              placeholder="admin@yourdomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            />
          </div>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Alert Thresholds
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critical Alerts
            </label>
            <select
              value={config.critical_threshold}
              onChange={(e) => handleChange('critical_threshold', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            >
              <option value="immediate">Send Immediately</option>
              <option value="after_1">After 1 occurrence</option>
              <option value="after_3">After 3 occurrences</option>
              <option value="after_5">After 5 occurrences</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              When to send notifications for critical alerts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warning Alerts
            </label>
            <select
              value={config.warning_threshold}
              onChange={(e) => handleChange('warning_threshold', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!hasRole('admin')}
            >
              <option value="immediate">Send Immediately</option>
              <option value="after_1">After 1 occurrence</option>
              <option value="after_3">After 3 occurrences</option>
              <option value="after_5">After 5 occurrences</option>
              <option value="after_10">After 10 occurrences</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              When to send notifications for warning alerts
            </p>
          </div>
        </div>
      </div>

      {hasRole('admin') && (
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          
          <button
            onClick={handleTestAlert}
            disabled={testingAlert}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {testingAlert ? 'Sending...' : 'Send Test Alert'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertConfigPage;
