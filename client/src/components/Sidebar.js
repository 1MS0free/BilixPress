import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import Icon from './Icon';



function getNavItems(user) {
  if (user?.role === 'shopper') {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { label: 'Browse Requests', path: '/browse', icon: 'list' },
      { label: 'Active Tasks', path: '/active-tasks', icon: 'box' },
      { label: 'Messages', path: '/messages', icon: 'messages' },
      { label: 'History', path: '/history', icon: 'history' },
      { label: 'Settings', path: '/settings', icon: 'settings' },
    ];
  } else {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { label: 'Post Request', path: '/post-request', icon: 'post' },
      { label: 'My Requests', path: '/my-requests', icon: 'requests' },
      { label: 'Messages', path: '/messages', icon: 'messages' },
      { label: 'History', path: '/history', icon: 'history' },
      { label: 'Settings', path: '/settings', icon: 'settings' },
    ];
  }
}

const adminNavItem = { label: 'Admin', path: '/admin', icon: 'settings' };
const Sidebar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="flex items-center px-6 py-6 border-b">
        <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-lg mr-3">
          {user?.name ? user.name[0].toUpperCase() : 'D'}
        </div>
        <div>
          <div className="font-semibold text-gray-900">Bilixpress</div>
          <div className="text-xs text-gray-500">{user?.name || 'Requester'}</div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {getNavItems(user).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-50 font-medium ${location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        ))}
        {user?.isAdmin && (
          <Link
            key={adminNavItem.path}
            to={adminNavItem.path}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-50 font-medium ${location.pathname === adminNavItem.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
          >
            <Icon name={adminNavItem.icon} />
            {adminNavItem.label}
          </Link>
        )}
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

export default Sidebar;
