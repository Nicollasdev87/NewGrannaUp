import React from 'react';
import { AppScreen } from '../types';

interface SidebarProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen, onLogout, isCollapsed, setIsCollapsed }) => {

  const menuItems = [
    { screen: AppScreen.DASHBOARD, label: 'Dashboard', icon: 'grid_view' },
    { screen: AppScreen.TRANSACTIONS, label: 'Transações', icon: 'receipt_long' },
    { screen: AppScreen.GOALS, label: 'Metas', icon: 'track_changes' },
    { screen: AppScreen.INVESTMENTS, label: 'Investimentos', icon: 'show_chart' },
    { screen: AppScreen.CALENDAR, label: 'Calendário', icon: 'calendar_month' },
  ];

  const configItems = [
    { screen: AppScreen.SETTINGS, label: 'Configurações', icon: 'settings' },
  ];

  const MenuItem = ({ item }: { item: { screen: AppScreen; label: string; icon: string } }) => {
    const isActive = currentScreen === item.screen;

    return (
      <button
        onClick={() => setScreen(item.screen)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''} ${isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
      >
        <span className={`material-symbols-outlined !text-[22px] ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <>
            <span className="text-[15px] whitespace-nowrap">{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Sidebar - z-40 so footer (z-50) can overlay */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >

        {/* Logo Header */}
        <div className={`flex items-center h-20 px-4 border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <span className="material-symbols-outlined text-white !text-xl">account_balance_wallet</span>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Granaup</span>
          )}
        </div>

        {/* Scrollable Menu Container */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">

          {/* Menu Section */}
          <div className="mb-6">
            {!isCollapsed && (
              <p className="px-4 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Menu</p>
            )}
            {isCollapsed && <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-auto mb-3"></div>}
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <div key={item.screen}>
                  <MenuItem item={item} />
                </div>
              ))}
            </nav>
          </div>

          {/* Config Section */}
          <div className="mb-6">
            {!isCollapsed && (
              <p className="px-4 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Configurações</p>
            )}
            {isCollapsed && <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 mx-auto mb-3"></div>}
            <nav className="flex flex-col gap-1">
              {configItems.map((item) => (
                <div key={item.screen}>
                  <MenuItem item={item} />
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section - Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined !text-[22px] group-hover:text-red-500">logout</span>
            {!isCollapsed && <span className="text-[15px]">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
