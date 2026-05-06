import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Icon from './Icon';
import logo from '../assets/logo_webapp.png';

function getNavItems(user) {
  // ✅ FIX: Check both the user object AND localStorage as a backup
  const role = user?.role || localStorage.getItem('active_user_role');

  if (role === 'shopper') {
    return [
      { label: 'Dashboard',       path: '/dashboard',    icon: 'dashboard' },
      { label: 'Browse Requests', path: '/browse',       icon: 'list'      },
      { label: 'Active Tasks',    path: '/active-tasks', icon: 'box'       },
      { label: 'Messages',        path: '/messages',     icon: 'messages'  },
      { label: 'History',         path: '/history',      icon: 'history'   },
      { label: 'Settings',        path: '/settings',     icon: 'settings'  },
    ];
  } else {
    return [
      { label: 'Dashboard',    path: '/dashboard',    icon: 'dashboard' },
      { label: 'Post Request', path: '/post-request',  icon: 'post'      },
      { label: 'My Requests',  path: '/my-requests',   icon: 'requests'  },
      { label: 'Messages',     path: '/messages',      icon: 'messages'  },
      { label: 'History',      path: '/history',       icon: 'history'   },
      { label: 'Settings',     path: '/settings',      icon: 'settings'  },
    ];
  }
}

const adminNavItem = { label: 'Admin', path: '/admin', icon: 'settings' };

const Sidebar = ({ user }) => {
  const location = useLocation();
  const navigate  = useNavigate();

  // Notification state
  const [hasNewAccepted, setHasNewAccepted] = useState(false);
  const [hasNewMessage,  setHasNewMessage]  = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const role = user?.role || localStorage.getItem('active_user_role');

    if (role !== 'shopper') {
      const q = query(
        collection(db, 'requests'),
        where('requesterId', '==', user.uid),
        where('status', '==', 'Accepted')
      );
      const unsub = onSnapshot(q, (snap) => {
        setHasNewAccepted(!snap.empty);
      });
      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setHasNewMessage(!snap.empty);
    });
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

  // ✅ Get the correct name and role for the UI
  const displayName = user?.name || user?.displayName || localStorage.getItem('active_user_name') || 'User';
  const displayRole = user?.role || localStorage.getItem('active_user_role') || 'requester';

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      {/* Brand Section */}
      <div className="flex items-center px-6 py-6 border-b">
        <img src={logo} alt="Bilixpress Logo" className="w-10 h-10 rounded-xl mr-3" />
        <div>
          <div className="font-semibold text-gray-900 truncate w-32">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {displayRole === 'shopper' ? 'Shopper' : user?.isAdmin ? 'Admin' : 'Requester'}
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {getNavItems(user).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`relative flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-50 font-medium transition-colors
              ${location.pathname === item.path
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700'}`}
          >
            <Icon name={item.icon} />
            {item.label}

            {/* Notification dot */}
            {dotFor(item.path) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </Link>
        ))}

        {user?.isAdmin && (
          <Link
            to={adminNavItem.path}
            className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-50 font-medium transition-colors
              ${location.pathname === adminNavItem.path
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700'}`}
          >
            <Icon name={adminNavItem.icon} />
            {adminNavItem.label}
          </Link>
        )}
      </nav>

      {/* Logout Section */}
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