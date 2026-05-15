import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Icon from './Icon';
import logo from '../assets/logo_webapp.png';

function getNavItems(user) {
  if (user?.role === 'shopper') {
    return [
      { label: 'Dashboard',       path: '/dashboard',    icon: 'dashboard' },
      { label: 'Browse Requests', path: '/browse',       icon: 'list'      },
      { label: 'Active Tasks',    path: '/active-tasks', icon: 'box'       },
      { label: 'Messages',        path: '/messages',     icon: 'messages'  },
      { label: 'History',         path: '/history',      icon: 'history'   },
      { label: 'Settings',        path: '/settings',     icon: 'settings'  },
    ];
  }
  return [
    { label: 'Dashboard',    path: '/dashboard',    icon: 'dashboard' },
    { label: 'Post Request', path: '/post-request', icon: 'post'      },
    { label: 'My Requests',  path: '/my-requests',  icon: 'requests'  },
    { label: 'Messages',     path: '/messages',     icon: 'messages'  },
    { label: 'History',      path: '/history',      icon: 'history'   },
    { label: 'Settings',     path: '/settings',     icon: 'settings'  },
  ];
}

const adminNavItem = { label: 'Admin Panel', path: '/admin', icon: 'settings' };

const Sidebar = ({ user }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [hasNewAccepted, setHasNewAccepted] = useState(false);
  const [hasNewMessage,  setHasNewMessage]  = useState(false);

  useEffect(() => {
    if (!user?.uid || user.role === 'shopper') return;
    const q = query(
      collection(db, 'requests'),
      where('requesterId', '==', user.uid),
      where('status', '==', 'Accepted')
    );
    const unsub = onSnapshot(q, (snap) => setHasNewAccepted(!snap.empty));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'messages'), where('receiverId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => setHasNewMessage(!snap.empty));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/my-requests') setHasNewAccepted(false);
    if (location.pathname === '/messages')    setHasNewMessage(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const dotFor = (path) => {
    if (path === '/my-requests' && hasNewAccepted) return true;
    if (path === '/messages'    && hasNewMessage)  return true;
    return false;
  };

  const navItems = getNavItems(user);

  return (
    // CHANGED: min-h-screen → h-screen sticky top-0, added overflow-y-auto
    <aside className="w-60 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm overflow-y-auto">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <img src={logo} alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
        <div>
          <div className="font-bold text-gray-900 text-sm tracking-tight">Bilixpress</div>
          <div className="text-xs text-gray-400 truncate max-w-[120px]">{user?.name || 'User'}</div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-4 pb-2">
        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full
          ${user?.role === 'shopper'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
          {user?.role === 'shopper' ? 'Shopper' : 'Requester'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <span className={active ? 'text-white' : 'text-gray-400'}>
                <Icon name={item.icon} />
              </span>
              {item.label}
              {dotFor(item.path) && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </Link>
          );
        })}

        {user?.isAdmin && (
          <Link
            to={adminNavItem.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${location.pathname === adminNavItem.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Icon name={adminNavItem.icon} />
            {adminNavItem.label}
          </Link>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.email || ''}</div>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition font-medium"
        >
          <Icon name="logout" />
          Sign out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
