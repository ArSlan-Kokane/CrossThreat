"use client";

import { useState } from "react";
import { Shield, Key, User, Clock, Database, Bell, Lock, Eye, EyeOff, Save, RefreshCw } from "lucide-react";

export function SettingsContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = (section: string) => {
    setSaveMessage(`${section} settings saved successfully!`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
        <p className="text-gray-400 mt-1">Configure admin panel security and preferences</p>
      </div>

      {saveMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
          {saveMessage}
        </div>
      )}

      {/* Security Settings */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1a1a2e] p-2 rounded-lg">
            <Shield className="text-[#4f9eff]" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Security Settings</h3>
            <p className="text-sm text-gray-400">Manage authentication and access control</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Username</label>
            <div className="flex items-center gap-2">
              <User className="text-gray-500" size={18} />
              <input
                type="text"
                defaultValue="techdirector"
                className="flex-1 bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Change Passkey</label>
            <div className="flex items-center gap-2">
              <Key className="text-gray-500" size={18} />
              <div className="relative flex-1">
                <input
                  type={showPasskey ? "text" : "password"}
                  placeholder="Enter new passkey"
                  className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPasskey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Passkey</label>
            <div className="flex items-center gap-2">
              <Key className="text-gray-500" size={18} />
              <div className="relative flex-1">
                <input
                  type={showPasskey ? "text" : "password"}
                  placeholder="Confirm new passkey"
                  className="w-full bg-[#12121a] border border-[#1a1a2e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff] pr-10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="text-gray-400" size={20} />
              <div>
                <p className="text-white font-medium">Session Timeout</p>
                <p className="text-sm text-gray-400">Auto-logout after inactivity</p>
              </div>
            </div>
            <select defaultValue="30" className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#4f9eff]">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="0">Never</option>
            </select>
          </div>

          <button
            onClick={() => handleSave("Security")}
            className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save size={18} />
            Save Security Settings
          </button>
        </div>
      </div>

      {/* Access Settings */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1a1a2e] p-2 rounded-lg">
            <Lock className="text-[#4f9eff]" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Access Control</h3>
            <p className="text-sm text-gray-400">Configure access restrictions and monitoring</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div>
              <p className="text-white font-medium">IP Restriction</p>
              <p className="text-sm text-gray-400">Limit access to specific IP addresses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f9eff]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div>
              <p className="text-white font-medium">Login Attempt Logging</p>
              <p className="text-sm text-gray-400">Record all login attempts for security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f9eff]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">Require 2FA for admin access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f9eff]"></div>
            </label>
          </div>

          <button
            onClick={() => handleSave("Access Control")}
            className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save size={18} />
            Save Access Settings
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1a1a2e] p-2 rounded-lg">
            <Database className="text-[#4f9eff]" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Data Management</h3>
            <p className="text-sm text-gray-400">Backup, restore, and data maintenance</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">Last Backup</p>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Automatic daily backups are enabled</p>
            <button className="flex items-center gap-2 text-[#4f9eff] hover:underline">
              <RefreshCw size={16} />
              Create Manual Backup
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg hover:bg-[#2a2a3e] transition-colors">
              <Database size={18} />
              <span className="text-white">Export All Data</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg hover:bg-[#2a2a3e] transition-colors">
              <Database size={18} />
              <span className="text-white">Import Data</span>
            </button>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 font-medium mb-2">Danger Zone</p>
            <p className="text-sm text-gray-400 mb-3">Reset all admin settings to default values</p>
            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1a1a2e] p-2 rounded-lg">
            <Bell className="text-[#4f9eff]" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="text-sm text-gray-400">Configure admin alerts and notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div>
              <p className="text-white font-medium">New Team Member Alerts</p>
              <p className="text-sm text-gray-400">Notify when team members are added</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f9eff]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div>
              <p className="text-white font-medium">Event Registration Alerts</p>
              <p className="text-sm text-gray-400">Notify when event registrations occur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f9eff]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#12121a] border border-[#1a1a2e] rounded-lg">
            <div>
              <p className="text-white font-medium">Security Alerts</p>
              <p className="text-sm text-gray-400">Notify of failed login attempts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f9eff]"></div>
            </label>
          </div>

          <button
            onClick={() => handleSave("Notifications")}
            className="flex items-center gap-2 bg-[#4f9eff] hover:bg-[#3a8aee] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save size={18} />
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}