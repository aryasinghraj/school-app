import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, MapPin, Bell, User as UserIcon, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
            JPS
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base lg:text-lg leading-tight">
              Jaipur Public School
            </h1>
            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
              <MapPin className="w-3 h-3 text-brand-600" />
              <span>Shri Dungargarh, Rajasthan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{user?.role.replace('_', ' ')}</span>
        </div>

        <button className="relative p-2 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
