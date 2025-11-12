import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  FileCode,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { IconButton } from './ui/Button';

interface SidebarProps {
  onOpenCommandPalette: () => void;
}

export const Sidebar = ({ onOpenCommandPalette }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboards',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Connections',
      path: '/connections',
      icon: Database,
    },
    {
      name: 'Queries',
      path: '/queries',
      icon: FileCode,
    },
    {
      name: 'Visualizations',
      path: '/visualizations',
      icon: BarChart3,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '4rem' : '16rem' }}
      className="sidebar flex flex-col"
    >
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Vizly</span>
          </motion.div>
        )}
        <IconButton
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </IconButton>
      </div>

      {/* Search Command */}
      <div className="px-3 py-4">
        <button
          onClick={onOpenCommandPalette}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl',
            'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
            'text-gray-500 dark:text-gray-400 text-sm transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <Search className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                isActive ? 'sidebar-item-active' : 'sidebar-item',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
        {/* Theme Toggle */}
        <IconButton
          variant="ghost"
          onClick={toggleDarkMode}
          className={cn(
            'w-full hover:bg-gray-100 dark:hover:bg-gray-800',
            collapsed ? 'justify-center' : 'justify-start'
          )}
          title={collapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {darkMode ? (
            <Sun className="h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="h-5 w-5 flex-shrink-0" />
          )}
          {!collapsed && (
            <span className="ml-2">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </IconButton>

        {/* User Info */}
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-error-600 dark:text-error-400',
            'hover:bg-error-50 dark:hover:bg-error-900/20',
            'transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};
