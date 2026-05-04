import React from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import Icon from './Icon';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
  { label: 'Users', path: '/admin/users', icon: 'users' },
  { label: 'Requests', path: '/admin/requests', icon: 'requests' },
  { label: 'Transactions', path: '/admin/transactions', icon: 'history' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="flex items-center px-6 py-6 border-b">
        <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center mr-3">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb"/></svg>
        </div>
        <div>
          <div className="font-bold text-lg text-gray-900">Bilixpress Admin</div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-50 font-medium ${location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 justify-center bg-black hover:bg-gray-800 text-white py-2 rounded font-medium transition-colors duration-150"
        >
          <Icon name="logout" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
