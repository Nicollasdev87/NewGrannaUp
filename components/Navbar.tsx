
import React from 'react';
import { AppScreen } from '../types';

interface NavbarProps {
  setScreen: (screen: AppScreen) => void;
  userAvatar: string;
  userName: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ setScreen, userAvatar, userName, sidebarCollapsed, onToggleSidebar }) => {
  return (
    <header className={`h-20 fixed top-0 right-0 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 shadow-sm transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'} hidden md:block`}>
      <div className="w-full h-full px-5 flex items-center justify-between">

        {/* Left Section: Toggle + Divider + Search */}
        <div className="flex items-center gap-5">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined !text-xl">
              {sidebarCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>

          {/* Divider */}
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-white/5 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 h-5 p-0 ml-2"
              placeholder="Buscar..."
              type="text"
            />
          </div>
        </div>

        {/* Right Section: Notifications + User */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 relative">
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <button className="flex items-center gap-2 group" onClick={() => setScreen(AppScreen.PROFILE)}>
            <div
              className="w-9 h-9 rounded-full bg-slate-200 bg-cover bg-center ring-2 ring-transparent group-hover:ring-primary transition-all"
              style={{ backgroundImage: `url('${userAvatar}')` }}
            />
            <div className="hidden md:flex flex-col items-start text-right">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Premium</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-sm hidden md:block">expand_more</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
