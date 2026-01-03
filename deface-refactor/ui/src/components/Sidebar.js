// frontend/src/components/Sidebar.js
import React from 'react';
import { Server, Activity, Bell, FileText, Lock, HardDrive, Settings, Plus, Eye, Shield } from 'lucide-react';

const menuItems = [
  {
    section: 'Main',
    items: [
      { icon: Activity, label: 'Dashboard', page: 'dashboard' },
      { icon: Server, label: 'Servers', page: 'servers' },
      { icon: Eye, label: 'Activity Log', page: 'activity' },
      { icon: Bell, label: 'Alerts', page: 'alerts' },
    ],
  },
  {
    section: 'Monitoring',
    items: [
      { icon: FileText, label: 'File Changes', page: 'files' },
      { icon: Lock, label: 'Permissions', page: 'permissions' },
      { icon: HardDrive, label: 'Backups', page: 'backups' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { icon: Settings, label: 'Alert Config', page: 'alert-config' },
      { icon: Plus, label: 'Add Server', page: 'add-server' },
      { icon: Settings, label: 'General Settings', page: 'settings' },
    ],
  },
];

const MenuItem = ({ icon: Icon, label, page, active, onClick }) => (
  <div
    onClick={() => onClick(page)}
    className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-3 ${
      active
        ? 'bg-blue-900 bg-opacity-20 text-blue-500 border-blue-500'
        : 'text-gray-400 hover:bg-gray-800 border-transparent'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </div>
);

const Sidebar = ({ activePage, onPageChange }) => {
  return (
    <aside className="w-64 bg-gray-900 text-white fixed h-screen overflow-y-auto">
      <div className="p-5 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          Anti-Defacement
        </h1>
      </div>

      <nav className="py-5">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-8">
            <div className="px-5 pb-3 text-xs uppercase text-gray-500 font-semibold">
              {section.section}
            </div>
            {section.items.map((item) => (
              <MenuItem
                key={item.page}
                icon={item.icon}
                label={item.label}
                page={item.page}
                active={activePage === item.page}
                onClick={onPageChange}
              />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
