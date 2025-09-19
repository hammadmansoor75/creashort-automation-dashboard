'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Settings, 
  Database, 
  Bell, 
  RefreshCw, 
  Save,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true,
    emailAlerts: false,
    webhookUrl: '',
    maxRetries: 3,
    timeoutMinutes: 60
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would save to a database or localStorage
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your dashboard preferences and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                General Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Auto-refresh
                    </label>
                    <p className="text-sm text-gray-500">
                      Automatically refresh data every few seconds
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Refresh Interval (seconds)
                  </label>
                  <select
                    value={settings.refreshInterval}
                    onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Show browser notifications for important events
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Alert Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Send email notifications for critical issues
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={settings.webhookUrl}
                    onChange={(e) => handleChange('webhookUrl', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Send alerts to external services
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxRetries}
                    onChange={(e) => handleChange('maxRetries', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum number of retries for failed video generations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={settings.timeoutMinutes}
                    onChange={(e) => handleChange('timeoutMinutes', parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum time to wait for video generation before timing out
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Database Connection
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Connection Status
                    </label>
                    <p className="text-sm text-gray-500">
                      MongoDB connection health
                    </p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value="creashort"
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Collection
                  </label>
                  <input
                    type="text"
                    value="useragents"
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              System Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">API Server</p>
                  <p className="text-sm text-gray-500">Running</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Database</p>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduler</p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Video Service</p>
                  <p className="text-sm text-gray-500">Degraded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
