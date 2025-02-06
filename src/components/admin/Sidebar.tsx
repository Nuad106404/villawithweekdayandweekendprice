import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Home, 
  Hotel,
  Wallet 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      label: 'Villa',
      path: '/admin/villa',
      icon: Hotel,
    },
    {
      label: 'Bookings',
      path: '/admin/bookings',
      icon: CalendarDays,
    },
    {
      label: 'Bank',
      path: '/admin/bank',
      icon: Wallet,
    },
    {
      label: 'Back to Home',
      path: '/',
      icon: Home,
      exact: true
    }
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 shadow-xl',
        'transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        'flex flex-col',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/';
              
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium',
                  'transition-all duration-200 ease-in-out',
                  'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/50 dark:hover:text-amber-400',
                  'transform hover:translate-x-1 hover:shadow-md',
                  isActive
                    ? 'bg-amber-50 text-amber-600 shadow-sm dark:bg-amber-900/40 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && (
                    <item.icon 
                      className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        isActive ? "text-amber-600 dark:text-amber-400" : "text-gray-500 dark:text-gray-400",
                        "group-hover:scale-110"
                      )} 
                    />
                  )}
                  <span className="font-medium">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};
