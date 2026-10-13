import React, { useState } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Bot,
  GraduationCap,
  BookMarked,
  HeartPulse,
  Briefcase,
  Clapperboard,
  Languages,
  Check,
} from 'lucide-react';
import { Contact } from '../types';
import { IconResolver } from './IconResolver';

interface ContactsDirectoryProps {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
}

const CATEGORIES = [
  'All',
  'General & Personal',
  'Education & Study',
  'Islamic Knowledge',
  'Health & Wellness',
  'Business & Productivity',
  'Stories & Entertainment',
  'Specialized Assistants',
];

export const ContactsDirectory: React.FC<ContactsDirectoryProps> = ({
  contacts,
  onSelectContact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = contacts.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col h-full bg-[#0B141A] text-[#E9EDEF] overflow-hidden select-none">
      {/* Header */}
      <header className="p-4 md:p-6 bg-[#111B21] border-b border-[#202C33] shrink-0">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white">AI Contacts Directory</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30">
                  {contacts.length} Assistants
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#8696A0] mt-1">
                Explore specialized AI personas with custom system prompts, category intelligence & capabilities.
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#202C33] border border-[#2A3942] w-full md:w-80 focus-within:border-[#00A884]/60 transition">
              <Search className="w-4 h-4 text-[#8696A0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, subject, or skill..."
                className="w-full bg-transparent text-sm text-[#E9EDEF] outline-none placeholder-[#8696A0]"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === 'All' ? contacts.length : contacts.filter((c) => c.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#00A884] text-white shadow-sm'
                      : 'bg-[#202C33] text-[#8696A0] hover:text-white hover:bg-[#2A3942]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-[#111B21] text-[#8696A0]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Directory Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Category Special Banner */}
          {selectedCategory === 'Education & Study' && (
            <div className="mb-4 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Image-Question Vision Solver Enabled</p>
                <p>
                  Upload textbook exercises, handwritten equations, or exam diagrams directly in chat for step-by-step solutions!
                </p>
              </div>
            </div>
          )}

          {selectedCategory === 'Islamic Knowledge' && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3">
              <BookMarked className="w-6 h-6 text-[#00A884] shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Verified Quran & Hadith References</p>
                <p>
                  Responses cite authentic references respectfully, distinguishing established sources from general explanations.
                </p>
              </div>
            </div>
          )}

          {selectedCategory === 'Health & Wellness' && (
            <div className="mb-4 p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-teal-200 text-xs flex items-center gap-3">
              <HeartPulse className="w-6 h-6 text-teal-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Educational Health Information</p>
                <p>
                  Health assistants provide evidence-based guidance with safety disclaimers and do not substitute for licensed doctors.
                </p>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="flex flex-col justify-between p-4 rounded-2xl bg-[#111B21] border border-[#202C33] hover:border-[#00A884]/40 hover:shadow-lg transition group"
              >
                <div>
                  {/* Top card row */}
                  <div className="flex items-start gap-3">
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
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm truncate group-hover:text-[#00A884] transition">
                          {contact.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#202C33] text-[#00A884] border border-[#2A3942] shrink-0">
                          {contact.category.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-[#00A884] font-medium truncate mt-0.5">
                        {contact.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#8696A0] mt-3 line-clamp-2 leading-relaxed">
                    {contact.description}
                  </p>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {contact.capabilities.slice(0, 3).map((cap, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#202C33] text-[#AEBAC1]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-3 border-t border-[#202C33]/60 flex items-center justify-between">
                  <span className="text-[11px] text-[#8696A0]">Available 24/7</span>
                  <button
                    onClick={() => onSelectContact(contact.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#009170] text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Bot className="w-12 h-12 mx-auto text-[#8696A0] mb-2" />
              <p className="text-base font-semibold text-white">No AI contacts found</p>
              <p className="text-xs text-[#8696A0] mt-1">
                Try searching for another topic or switch category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
