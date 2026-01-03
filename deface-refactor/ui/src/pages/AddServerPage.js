// frontend/src/pages/AddServerPage.js
import React, { useState } from 'react';
import { Server, Globe, FolderOpen, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

// InputField component defined outside to prevent recreation on each render
const InputField = ({ icon: Icon, label, name, type = 'text', placeholder, required = false, error, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

const AddServerPage = ({ onNavigate }) => {
  const { addServer } = useDashboard();
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    path: '/var/www/html',
    ssh_port: '22',
    ssh_user: 'root',
    ssh_password: '',
    ssh_key: '',
    monitor_interval: '300',
    auto_restore: true,
    alert_email: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'key'

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip)) {
      newErrors.ip = 'Invalid IP address format';
    }

    if (!formData.path.trim()) {
      newErrors.path = 'Path is required';
    }

    if (!formData.ssh_port || isNaN(formData.ssh_port)) {
      newErrors.ssh_port = 'Valid SSH port is required';
    }

    if (!formData.ssh_user.trim()) {
      newErrors.ssh_user = 'SSH user is required';
    }

    if (authMethod === 'password' && !formData.ssh_password) {
      newErrors.ssh_password = 'SSH password is required';
    }

    if (authMethod === 'key' && !formData.ssh_key) {
      newErrors.ssh_key = 'SSH key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // Map frontend field names to backend API field names
      const serverData = {
        name: formData.name,
        host: formData.ip,
        port: parseInt(formData.ssh_port),
        username: formData.ssh_user,
        password: authMethod === 'password' ? formData.ssh_password : null,
        key_path: authMethod === 'key' ? formData.ssh_key : null,
        path: formData.path,
        mode: formData.auto_restore ? 'active' : 'passive',
        backup_path: null, // Can be added later if needed
        interval: parseInt(formData.monitor_interval) || 300,
      };

      await addServer(serverData);

      setSuccess(true);
      
      // Reset form after 2 seconds and navigate back
      setTimeout(() => {
        onNavigate('servers');
      }, 2000);

    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add server' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Server className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Server</h2>
            <p className="text-gray-600">Configure a new server for monitoring</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 font-semibold">Server added successfully!</p>
              <p className="text-green-600 text-sm">Redirecting to servers page...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Basic Information
            </h3>
            
            <InputField
              icon={Server}
              label="Server Name"
              name="name"
              placeholder="Production Server 1"
              required
              error={errors.name}
              value={formData.name}
              onChange={handleChange}
            />

            <InputField
              icon={Globe}
              label="IP Address"
              name="ip"
              placeholder="192.168.1.100"
              required
              error={errors.ip}
              value={formData.ip}
              onChange={handleChange}
            />

            <InputField
              icon={FolderOpen}
              label="Monitor Path"
              name="path"
              placeholder="/var/www/html"
              required
              error={errors.path}
              value={formData.path}
              onChange={handleChange}
            />
          </div>

          {/* SSH Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              SSH Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InputField
                icon={Key}
                label="SSH Port"
                name="ssh_port"
                type="number"
                placeholder="22"
                required
                error={errors.ssh_port}
                value={formData.ssh_port}
                onChange={handleChange}
              />

              <InputField
                icon={Key}
                label="SSH User"
                name="ssh_user"
                placeholder="root"
                required
                error={errors.ssh_user}
                value={formData.ssh_user}
                onChange={handleChange}
              />
            </div>

            {/* Authentication Method */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Authentication Method <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="auth_method"
                    value="password"
                    checked={authMethod === 'password'}
                    onChange={(e) => setAuthMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Password</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="auth_method"
                    value="key"
                    checked={authMethod === 'key'}
                    onChange={(e) => setAuthMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">SSH Key</span>
                </label>
              </div>
            </div>

            {authMethod === 'password' ? (
              <InputField
                icon={Key}
                label="SSH Password"
                name="ssh_password"
                type="password"
                placeholder="••••••••"
                required
                error={errors.ssh_password}
                value={formData.ssh_password}
                onChange={handleChange}
              />
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SSH Private Key <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="ssh_key"
                  value={formData.ssh_key}
                  onChange={handleChange}
                  rows="6"
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                    errors.ssh_key ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ssh_key && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.ssh_key}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Monitoring Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Monitoring Settings
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monitor Interval (seconds)
              </label>
              <input
                type="number"
                name="monitor_interval"
                value={formData.monitor_interval}
                onChange={handleChange}
                min="60"
                max="3600"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                How often to check for changes (minimum 60 seconds)
              </p>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="auto_restore"
                  checked={formData.auto_restore}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700 font-medium">
                  Enable Auto-Restore
                </span>
              </label>
              <p className="mt-1 ml-6 text-sm text-gray-500">
                Automatically restore files when unauthorized changes are detected
              </p>
            </div>

            <InputField
              icon={AlertCircle}
              label="Alert Email (Optional)"
              name="alert_email"
              type="email"
              placeholder="admin@example.com"
              value={formData.alert_email}
              onChange={handleChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Server...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Add Server
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('servers')}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Important Information
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure SSH access is configured on the target server</li>
          <li>• The monitoring path should be readable and writable</li>
          <li>• Auto-restore will backup files before restoring</li>
          <li>• Lower monitor intervals may increase server load</li>
        </ul>
      </div>
    </div>
  );
};

export default AddServerPage;
