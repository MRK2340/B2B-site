import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import type { User } from '../../types';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
  user: User | null;
  onLogout: () => void;
}

export function DashboardSidebar({ navItems, activeTab, onTabChange, pendingCount, user, onLogout }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-base">i</span>
          </div>
          <span className="font-bold text-xl text-white">Whistle</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            data-testid={`sidebar-nav-${item.id}`}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-white text-iwhistle-deep shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
            {item.id === 'applications' && pendingCount > 0 && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                activeTab === item.id ? 'bg-amber-100 text-amber-700' : 'bg-amber-400/30 text-amber-200'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/60 truncate">{user?.organization}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          data-testid="partner-logout-btn"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
