import React from 'react';
import { AppScreen } from '../types';

interface SidebarProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  onLogout: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen, onLogout }) => {

  const mainMenuItems = [
    { screen: AppScreen.DASHBOARD, label: 'Dashboard', icon: 'grid_view' },
    { screen: AppScreen.TRANSACTIONS, label: 'Transações', icon: 'receipt_long' },
    { screen: AppScreen.GOALS, label: 'Metas', icon: 'track_changes' },
    { screen: AppScreen.INVESTMENTS, label: 'Investimentos', icon: 'show_chart' },
  ];

  const bottomMenuItems = [
    { screen: AppScreen.SETTINGS, label: 'Configuração', icon: 'settings' },
  ];

  const SidebarButton = ({ item, isBottom = false }: { item: { screen: AppScreen; label: string; icon: string }, isBottom?: boolean, key?: any }) => (

    <div className="relative group flex items-center justify-center w-full">
      <button
        onClick={() => setScreen(item.screen)}
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${currentScreen === item.screen
          ? 'bg-white text-primary shadow-lg scale-105'
          : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
      >
        <span className="material-symbols-outlined !text-[28px]">
          {item.icon}
        </span>
      </button>

      {/* Tooltip */}
      <div className="absolute left-full ml-5 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-xl">
        {item.label}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
      </div>
    </div>
  );

  return (
    <aside className="fixed left-6 top-24 bottom-6 z-40 hidden md:flex flex-col justify-between bg-primary dark:bg-purple-900 shadow-2xl shadow-primary/40 rounded-3xl py-8 px-4 w-24 transition-all animate-in slide-in-from-left-6 duration-700">
      <div className="flex flex-col items-center w-full gap-6">
        {/* Logo or Top Spacer */}
        <div className="mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
        </div>

        <nav className="flex flex-col gap-6 w-full items-center">
          {mainMenuItems.map((item) => (
            <SidebarButton key={item.screen} item={item} />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-6 w-full items-center">
        <div className="w-12 h-px bg-white/20"></div>
        {bottomMenuItems.map((item) => (
          <SidebarButton key={item.screen} item={item} isBottom />
        ))}

        <button
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white/70 hover:text-red-300 hover:bg-white/10 transition-all duration-300 relative group"
          onClick={onLogout}
        >
          <span className="material-symbols-outlined !text-[28px]">logout</span>
          {/* Tooltip for Logout */}
          <div className="absolute left-full ml-5 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none shadow-xl">
            Sair
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
          </div>
        </button>

      </div>
    </aside >
  );
};

export default Sidebar;
