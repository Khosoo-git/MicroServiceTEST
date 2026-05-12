'use client';

import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Save, Bell, Database, Shield, Globe, Zap } from 'lucide-react';

export default function SettingsPage() {
  const [sidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage your system configuration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Settings Navigation */}
              <div className="md:col-span-1">
                <div className="card p-2">
                  <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'general'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    General
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('database')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'database'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Database className="w-5 h-5" />
                    Database
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'security'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab('integrations')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'integrations'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    Integrations
                  </button>
                </div>
              </div>

              {/* Settings Content */}
              <div className="md:col-span-3">
                {activeTab === 'general' && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">
                      General Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          defaultValue="My Organization"
                          className="input-modern"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Timezone
                        </label>
                        <select className="input-modern" defaultValue="UTC">
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">
                            Eastern Time (ET)
                          </option>
                          <option value="America/Los_Angeles">
                            Pacific Time (PT)
                          </option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Date Format
                        </label>
                        <select className="input-modern" defaultValue="YYYY-MM-DD">
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">
                      Notification Settings
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Email Notifications
                          </div>
                          <div className="text-sm text-slate-500">
                            Receive email alerts for critical incidents
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Slack Notifications
                          </div>
                          <div className="text-sm text-slate-500">
                            Send alerts to Slack channel
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'database' && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">
                      Database Configuration
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Host
                        </label>
                        <input
                          type="text"
                          defaultValue="localhost:5432"
                          className="input-modern"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Database Name
                        </label>
                        <input
                          type="text"
                          defaultValue="observability"
                          className="input-modern"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          defaultValue="postgres"
                          className="input-modern"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">
                      Security Settings
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="input-modern"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="input-modern"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="input-modern"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="card">
                    <h2 className="text-lg font-semibold text-slate-900 mb-6">
                      Integrations
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Prometheus
                          </div>
                          <div className="text-sm text-slate-500">
                            http://localhost:9090
                          </div>
                        </div>
                        <div className="text-green-600 text-sm font-medium">
                          Connected
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">Loki</div>
                          <div className="text-sm text-slate-500">
                            http://localhost:3100
                          </div>
                        </div>
                        <div className="text-green-600 text-sm font-medium">
                          Connected
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">
                            Tempo
                          </div>
                          <div className="text-sm text-slate-500">
                            http://localhost:3200
                          </div>
                        </div>
                        <div className="text-green-600 text-sm font-medium">
                          Connected
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
