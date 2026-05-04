
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';

const tabs = [
  { label: 'Profile', icon: 'dashboard' },
  { label: 'Security', icon: 'settings' },
  { label: 'Notifications', icon: 'messages' },
  { label: 'Payment', icon: 'history' },
];

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 p-10 flex flex-col items-center">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-2">Account Settings</h2>
          <div className="text-gray-500 mb-6">Manage your account preferences</div>
          <div className="flex gap-2 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition border ${activeTab === tab.label ? 'bg-gray-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
              >
                <Icon name={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'Profile' && (
            <div className="mb-6">
              <div className="font-semibold mb-2">Profile Information</div>
              <div className="mb-2 flex items-center"><span className="mr-2"><Icon name="dashboard" /></span> Full Name: <span className="font-semibold ml-2">{user?.name || ''}</span></div>
              <div className="mb-2 flex items-center"><span className="mr-2"><Icon name="messages" /></span> Email Address: <span className="font-semibold ml-2">{user?.email || ''}</span></div>
              <div className="mb-2 flex items-center"><span className="mr-2"><Icon name="history" /></span> Phone Number: <span className="font-semibold ml-2">{user?.phoneNumber || ''}</span></div>
              <button className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Save Changes</button>
            </div>
          )}
          {activeTab === 'Security' && (
            <div className="mb-6">
              <div className="font-semibold mb-2 flex items-center"><Icon name="settings" className="mr-2" /> Security Settings</div>
              <input type="password" placeholder="Enter current password" className="w-full mb-3 p-2 border rounded bg-gray-100" />
              <input type="password" placeholder="Enter new password" className="w-full mb-3 p-2 border rounded bg-gray-100" />
              <input type="password" placeholder="Confirm new password" className="w-full mb-3 p-2 border rounded bg-gray-100" />
              <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Update Password</button>
            </div>
          )}
          {activeTab === 'Notifications' && (
            <div className="mb-6">
              <div className="font-semibold mb-2 flex items-center"><Icon name="messages" className="mr-2" /> Notification Preferences</div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-blue-600" /> Email Notifications</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-blue-600" /> Push Notifications</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-blue-600" /> SMS Notifications</label>
              </div>
              <button className="mt-6 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Save Preferences</button>
            </div>
          )}
          {activeTab === 'Payment' && (
            <div className="mb-6">
              <div className="font-semibold mb-2 flex items-center"><Icon name="history" className="mr-2" /> Payment Methods</div>
              <div className="bg-gray-100 rounded p-4 mb-2">Visa •••• 4242 <span className="ml-2 text-xs text-gray-500">Expires 12/26</span></div>
              <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Add New Payment Method</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
