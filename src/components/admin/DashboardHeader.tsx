import React from 'react';
import { MoonIcon, SunIcon, UserCircle, X, Menu, LogOut } from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { useDispatch } from 'react-redux';
import { logoutAdmin } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';

interface DashboardHeaderProps {
  className?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  className,
  onMobileMenuToggle,
  isMobileMenuOpen 
}) => {
  const { theme, toggleTheme } = useThemeContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin() as any);
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-30 h-16 glass-morphism dark:glass-morphism-dark",
        "border-b border-surface-200/50 dark:border-surface-700/50",
        className
      )}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className={cn(
            "lg:hidden p-2 rounded-lg transition-colors duration-200",
            "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
            "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
          )}
        >
          <span className="sr-only">
            {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          </span>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Title */}
        <div className="flex-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-colors duration-200",
              "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
              "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
            )}
          >
            <span className="sr-only">Toggle theme</span>
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User menu */}
          <button
            type="button"
            className={cn(
              "p-2 rounded-lg transition-colors duration-200",
              "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
              "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
            )}
          >
            <span className="sr-only">Open user menu</span>
            <UserCircle className="h-5 w-5" />
          </button>

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
