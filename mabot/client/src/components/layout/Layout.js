import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../services/api';
import {
  HomeIcon, ClipboardDocumentListIcon, ShoppingCartIcon,
  CreditCardIcon, WrenchScrewdriverIcon, UserCircleIcon,
  BellIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { path: '/tasks', icon: ClipboardDocumentListIcon, label: 'Tasks' },
  { path: '/groceries', icon: ShoppingCartIcon, label: 'Groceries' },
  { path: '/bills', icon: CreditCardIcon, label: 'Bills' },
  { path: '/services', icon: WrenchScrewdriverIcon, label: 'Services' },
  { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.getAll();
        setNotifications(res.data.notifications || []);
        setUnread(res.data.unread || 0);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read_status: true })));
    } catch {}
  };

  const severityColor = (s) => ({
    urgent: 'border-l-red-500 bg-red-500/5',
    warning: 'border-l-yellow-500 bg-yellow-500/5',
    success: 'border-l-green-500 bg-green-500/5',
    info: 'border-l-teal-500 bg-teal-500/5'
  }[s] || 'border-l-slate-500 bg-slate-500/5');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
          <SparklesIcon className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white tracking-tight">MaBot</span>
      </div>

      {/* Family info */}
      {user?.family_id && (
        <div className="mx-3 mt-3 px-3 py-2.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
          <p className="text-xs text-teal-400 font-medium">🏠 {user.family_id.family_name || 'My Family'}</p>
          <p className="text-xs text-slate-400 mt-0.5">Code: {user.family_id.invite_code}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'}`
            }>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-slate-700 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-800 border-r border-slate-700 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <XMarkIcon className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1">
              <Bars3Icon className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-300 capitalize">
              {location.pathname.replace('/', '') || 'dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                <BellIcon className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                    <span className="font-semibold text-white text-sm">Notifications</span>
                    {unread > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-teal-400 hover:text-teal-300">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-500 py-6 text-sm">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div key={n.id}
                          className={`px-4 py-3 border-l-2 border-b border-slate-700/50 ${severityColor(n.severity)} ${!n.read_status ? 'opacity-100' : 'opacity-50'}`}>
                          <p className="text-xs text-slate-200">{n.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(n.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Notification backdrop */}
      {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}
    </div>
  );
};

export default Layout;
