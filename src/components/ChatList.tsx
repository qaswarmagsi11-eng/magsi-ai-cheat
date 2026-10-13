import React, { useState } from 'react';
import {
  Search,
  Filter,
  Pin,
  Bot,
  Sparkles,
  Users2,
  Plus,
} from 'lucide-react';
import { Contact, Group, NavigationTab } from '../types';
import { IconResolver } from './IconResolver';

interface ChatListProps {
  contacts: Contact[];
  groups: Group[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  onSelectTab: (tab: NavigationTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

type FilterType = 'all' | 'unread' | 'pinned' | 'groups';

export const ChatList: React.FC<ChatListProps> = ({
  contacts,
  groups,
  activeContactId,
  onSelectContact,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'pinned') return c.pinned;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#111B21] border-r border-[#202C33] select-none text-[#E9EDEF]">
      {/* Top Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">Chats</h1>
            <span className="text-xs bg-[#202C33] text-[#00A884] font-bold px-2 py-0.5 rounded-full border border-[#2A3942]">
              {contacts.length} AI
            </span>
          </div>
          <button
            onClick={() => onSelectTab('contacts')}
            className="p-2 rounded-xl text-[#00A884] hover:bg-[#202C33] transition"
            title="Browse All 60 AI Contacts"
          >
            <Bot className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#202C33] border border-[#2A3942] focus-within:border-[#00A884]/60 transition">
          <Search className="w-4 h-4 text-[#8696A0] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or ask AI..."
            className="w-full bg-transparent text-sm text-[#E9EDEF] outline-none placeholder-[#8696A0]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'pinned', label: 'Pinned' },
            { id: 'groups', label: 'Groups' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as FilterType)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                activeFilter === pill.id
                  ? 'bg-[#00A884] text-white shadow-sm'
                  : 'bg-[#202C33] text-[#8696A0] hover:text-white hover:bg-[#2A3942]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flagship META MAGSI Highlight Card */}
      <div className="px-3 py-1">
        <button
          onClick={() => onSelectTab('metamagsi')}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#112822] to-[#111B21] border border-emerald-500/30 hover:border-emerald-400 transition text-left group shadow-sm"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-400/50">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                META MAGSI
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500 text-black">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">Flagship AI</span>
            </div>
            <p className="text-xs text-emerald-200/80 truncate mt-0.5">
              Multimodal reasoning, study helper & voice conversation
            </p>
          </div>
        </button>
      </div>

      {/* Group Quick Row if filter is all or groups */}
      {(activeFilter === 'all' || activeFilter === 'groups') && groups.length > 0 && (
        <div className="px-3 pt-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectTab('groups')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#202C33]/70 transition text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-900 flex items-center justify-center text-white ring-2 ring-[#00A884]/40 shrink-0">
                <Users2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm truncate flex items-center gap-1.5">
                    {group.name}
                    <Pin className="w-3 h-3 text-[#00A884]" />
                  </span>
                  <span className="text-[11px] text-[#8696A0]">{group.lastMessageTime}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-[#8696A0] truncate">{group.lastMessage}</p>
                  {group.unreadCount > 0 && (
                    <span className="bg-[#00A884] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                      {group.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-2 divide-y divide-[#202C33]/40">
        {filteredContacts.map((contact) => {
          const isActive = contact.id === activeContactId;

          return (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left group my-0.5 ${
                isActive
                  ? 'bg-[#202C33] shadow-sm'
                  : 'hover:bg-[#202C33]/50'
              }`}
            >
              {/* Avatar with Status Ring */}
              <div className="relative shrink-0">
                {contact.avatarUrl ? (
                  <img
                    src={contact.avatarUrl}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00A884]/50"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-tr ${contact.avatarBg} flex items-center justify-center text-white ring-2 ring-[#2A3942] shadow-sm`}
                  >
                    <IconResolver name={contact.avatarIcon} className="w-6 h-6" />
                  </div>
                )}
                {contact.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-white text-sm truncate">
                      {contact.name}
                    </span>
                    {contact.pinned && <Pin className="w-3 h-3 text-[#00A884] shrink-0" />}
                  </div>
                  <span className="text-[11px] text-[#8696A0] shrink-0">
                    {contact.lastMessageTime || 'Online'}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-[#8696A0] truncate group-hover:text-[#AEBAC1]">
                    {contact.lastMessage || contact.tagline}
                  </p>
                  {contact.unreadCount > 0 && (
                    <span className="bg-[#00A884] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center ml-2 shrink-0">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button (New Chat / Camera) */}
      <div className="p-3 border-t border-[#202C33] flex items-center justify-between text-xs text-[#8696A0]">
        <span>60 AI Contacts Loaded</span>
        <button
          onClick={() => onSelectTab('contacts')}
          className="flex items-center gap-1 bg-[#00A884] hover:bg-[#009170] text-white font-semibold px-3 py-1.5 rounded-full shadow-md transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New AI Chat</span>
        </button>
      </div>
    </div>
  );
};
