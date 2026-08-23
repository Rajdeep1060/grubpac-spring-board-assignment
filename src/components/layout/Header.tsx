import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { NotificationBell } from '../notifications/NotificationBell';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Sun, Moon, LogOut, Shield, Menu } from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 px-4 md:px-8 backdrop-blur-md transition-colors duration-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight hidden sm:inline">
              SprintDesk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Toggle theme mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

          {user && (
            <div className="flex items-center gap-2.5 pl-1">
              <img
                src={user.image || 'https://i.pravatar.cc/150?img=47'}
                alt={user.firstName || user.username}
                className="w-8 h-8 rounded-full ring-2 ring-brand-500/20 object-cover"
              />
              <div className="hidden lg:flex flex-col text-xs">
                <span className="font-bold text-gray-900 dark:text-white">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">@{user.username}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 dark:hover:text-red-300 border border-red-200/80 dark:border-red-900/50 transition-all duration-150 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Sign out of SprintDesk"
            title="Sign out of SprintDesk"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of your SprintDesk workspace session?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </>
  );
};
