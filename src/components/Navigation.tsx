import React from 'react';
import {
  MessageSquare,
  Users,
  Sparkles,
  CircleDot,
  Users2,
  Radio,
  Bot,
  Settings,
  Moon,
  Sun,
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';
import { MagsiLogo } from './IconResolver';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  unreadChatsCount: number;
  unreadStoriesCount: number;
  profile: UserProfile;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export const DesktopSidebar: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadChatsCount,
  unreadStoriesCount,
  profile,
  onToggleTheme,
  onOpenSettings,
}) => {
  const navItems = [
    {
      id: 'chats' as NavigationTab,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadChatsCount > 0 ? unreadChatsCount : null,
    },
    {
      id: 'metamagsi' as NavigationTab,
      label: 'META MAGSI',
      icon: Bot,
      highlight: true,
      badge: 'PRO',
    },
    {
      id: 'contacts' as NavigationTab,
      label: 'AI Contacts',
      icon: Users,
      badge: '60',
    },
    {
      id: 'studio' as NavigationTab,
      label: 'MAGSI Studio',
      icon: Sparkles,
      badge: '15',
    },
    {
      id: 'status' as NavigationTab,
      label: 'Status',
      icon: CircleDot,
      hasDot: unreadStoriesCount > 0,
    },
    {
      id: 'groups' as NavigationTab,
      label: 'Groups',
      icon: Users2,
    },
    {
      id: 'channels' as NavigationTab,
      label: 'Channels',
      icon: Radio,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-[#111B21] dark:bg-[#111B21] border-r border-[#202C33] text-[#AEBAC1] select-none shrink-0 transition-all duration-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#202C33]">
        <MagsiLogo size={40} />
        <div className="hidden lg:block">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-wider text-white">MAGSI AI</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30">
              v1.0
            </span>
          </div>
          <p className="text-xs text-[#8696A0]">Next-Gen Intelligence</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#202C33] text-white shadow-sm'
                  : 'text-[#8696A0] hover:bg-[#202C33]/60 hover:text-[#E9EDEF]'
              }`}
              title={item.label}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <div
                  className={`p-1.5 rounded-lg transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-[#00A884] text-white'
                      : 'group-hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {item.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
                )}
              </div>

              <span className="hidden lg:inline-block flex-1 text-left truncate font-semibold">
                {item.label}
              </span>

              {item.badge && (
                <span
                  className={`hidden lg:inline-flex items-center justify-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.highlight
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : typeof item.badge === 'number'
                      ? 'bg-[#00A884] text-white min-w-[20px]'
                      : 'bg-[#202C33] text-[#AEBAC1] border border-[#2A3942]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User & Settings Bar */}
      <div className="p-3 border-t border-[#202C33] space-y-2">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-[#8696A0] hover:text-white hover:bg-[#202C33] transition"
            title="Toggle Theme"
          >
            {profile.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition ${
              currentTab === 'settings'
                ? 'text-[#00A884] bg-[#202C33]'
                : 'text-[#8696A0] hover:text-white hover:bg-[#202C33]'
            }`}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#202C33] transition text-left group"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00A884]/40 shrink-0"
            onError={(e) => {
              (e.target as any).src =
                'https://i.ibb.co/r2dgF4wW/Traditional-Shawl-Portrait-Against-Blue-Sky.png';
            }}
          />
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
            <p className="text-xs text-[#00A884] truncate">Online • Demo Mode</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export const MobileBottomBar: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadChatsCount,
  unreadStoriesCount,
}) => {
  const tabs = [
    {
      id: 'chats' as NavigationTab,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadChatsCount > 0 ? unreadChatsCount : null,
    },
    {
      id: 'status' as NavigationTab,
      label: 'Updates',
      icon: CircleDot,
      hasDot: unreadStoriesCount > 0,
    },
    {
      id: 'metamagsi' as NavigationTab,
      label: 'META AI',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'contacts' as NavigationTab,
      label: 'Contacts',
      icon: Users,
    },
    {
      id: 'studio' as NavigationTab,
      label: 'Studio',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="md:hidden flex items-center justify-around bg-[#111B21] border-t border-[#202C33] px-2 py-1.5 z-40 select-none">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition ${
              isActive ? 'text-[#00A884]' : 'text-[#8696A0]'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1 rounded-lg ${
                  isActive && tab.highlight
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full p-1.5 -translate-y-1 shadow-lg shadow-emerald-500/30'
                    : isActive
                    ? 'bg-[#202C33]'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {tab.badge && (
                <span className="absolute -top-1 -right-1.5 bg-[#00A884] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                  {tab.badge}
                </span>
              )}
              {tab.hasDot && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 ${
                isActive ? 'font-bold text-[#00A884]' : 'font-medium text-[#8696A0]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
