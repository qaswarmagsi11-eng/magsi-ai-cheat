import React, { useState, useEffect } from 'react';
import {
  Plus,
  CircleDot,
  Sparkles,
  Bot,
  Eye,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Image as ImageIcon,
  Type,
  Share2,
} from 'lucide-react';
import { Story, StoryItem, UserProfile } from '../types';

interface StoriesSectionProps {
  stories: Story[];
  userProfile: UserProfile;
  onAddStory: (item: StoryItem) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  userProfile,
  onAddStory,
}) => {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStatusText, setNewStatusText] = useState('');
  const [newStatusBg, setNewStatusBg] = useState('#0E3A2F');
  const [newStatusCaption, setNewStatusCaption] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Status background color palette
  const BG_COLORS = ['#0E3A2F', '#1E3A8A', '#4C1D95', '#831843', '#1F2937', '#78350F'];

  // Story Timer
  useEffect(() => {
    if (!activeStory || isPaused) return;

    const timer = setTimeout(() => {
      if (activeItemIndex < activeStory.items.length - 1) {
        setActiveItemIndex((prev) => prev + 1);
      } else {
        // End of story
        setActiveStory(null);
        setActiveItemIndex(0);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStory, activeItemIndex, isPaused]);

  const handleOpenStory = (story: Story) => {
    setActiveStory(story);
    setActiveItemIndex(0);
  };

  const handleNextItem = () => {
    if (!activeStory) return;
    if (activeItemIndex < activeStory.items.length - 1) {
      setActiveItemIndex((prev) => prev + 1);
    } else {
      setActiveStory(null);
    }
  };

  const handlePrevItem = () => {
    if (!activeStory) return;
    if (activeItemIndex > 0) {
      setActiveItemIndex((prev) => prev - 1);
    }
  };

  const handleCreateStatus = () => {
    if (!newStatusText.trim()) return;

    const newItem: StoryItem = {
      id: `user-s-${Date.now()}`,
      type: 'text',
      content: newStatusText.trim(),
      caption: newStatusCaption.trim() || undefined,
      bgColor: newStatusBg,
      timestamp: 'Just now',
    };

    onAddStory(newItem);
    setNewStatusText('');
    setNewStatusCaption('');
    setShowAddModal(false);
  };

  const metaMagsiStory = stories.find((s) => s.isMetaMagsi);
  const contactStories = stories.filter((s) => !s.isMetaMagsi);

  return (
    <div className="flex flex-col h-full bg-[#0B141A] text-[#E9EDEF] overflow-y-auto select-none">
      {/* Header */}
      <header className="p-4 md:p-6 bg-[#111B21] border-b border-[#202C33] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CircleDot className="w-6 h-6 text-[#00A884]" />
              <h1 className="text-xl md:text-2xl font-black text-white">Status & Updates</h1>
            </div>
            <p className="text-xs md:text-sm text-[#8696A0] mt-1">
              Explore 24h status stories and official META MAGSI intelligence bulletins.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A884] hover:bg-[#009170] text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Status</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* Horizontal Status Preview Cards (WhatsApp style from screenshot) */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">
            Recent Status Stories
          </h2>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
            {/* My Status Card */}
            <div
              onClick={() => setShowAddModal(true)}
              className="w-28 h-44 rounded-2xl bg-[#111B21] border border-[#202C33] p-2 flex flex-col justify-between shrink-0 cursor-pointer hover:border-[#00A884]/60 transition group relative overflow-hidden"
            >
              <div className="relative">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00A884]"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00A884] flex items-center justify-center text-white ring-2 ring-[#111B21]">
                  <Plus className="w-3 h-3" />
                </span>
              </div>
              <div>
                <p className="font-bold text-white text-xs truncate">My status</p>
                <p className="text-[10px] text-[#8696A0]">Tap to add</p>
              </div>
            </div>

            {/* Stories Cards */}
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleOpenStory(story)}
                className={`w-28 h-44 rounded-2xl p-2.5 flex flex-col justify-between shrink-0 cursor-pointer border transition shadow-sm relative overflow-hidden group ${
                  story.isMetaMagsi
                    ? 'bg-gradient-to-b from-emerald-950 via-[#11241E] to-[#111B21] border-emerald-500/50 hover:border-emerald-400'
                    : 'bg-[#111B21] border-[#202C33] hover:border-[#00A884]/60'
                }`}
                style={{
                  backgroundColor: story.items[0]?.bgColor || undefined,
                }}
              >
                {/* Header ring avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full ring-2 ring-[#00A884] flex items-center justify-center text-white font-bold bg-[#111B21] overflow-hidden">
                    {story.authorAvatar ? (
                      <img
                        src={story.authorAvatar}
                        alt={story.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : story.isMetaMagsi ? (
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <span>{story.authorName[0]}</span>
                    )}
                  </div>
                </div>

                {/* Text excerpt preview */}
                <p className="text-[10px] text-white/90 line-clamp-3 leading-tight font-medium my-auto">
                  {story.items[0]?.content}
                </p>

                {/* Author footer */}
                <div>
                  <p className="font-bold text-white text-[11px] truncate">{story.authorName}</p>
                  <p className="text-[9px] text-[#8696A0] truncate">{story.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated META MAGSI STATUS Section */}
        {metaMagsiStory && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-[#11241E] to-[#111B21] border border-emerald-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/60">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">META MAGSI STATUS</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Daily Intelligence
                    </span>
                  </div>
                  <p className="text-xs text-[#8696A0]">
                    AI-generated daily tips, educational facts, creative sparks & feature updates
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenStory(metaMagsiStory)}
                className="px-3.5 py-1.5 rounded-xl bg-[#00A884] hover:bg-[#009170] text-white text-xs font-semibold shadow transition"
              >
                View Stories ({metaMagsiStory.items.length})
              </button>
            </div>

            {/* List of items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {metaMagsiStory.items.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveStory(metaMagsiStory);
                    setActiveItemIndex(index);
                  }}
                  className="p-3.5 rounded-2xl bg-[#111B21]/90 border border-[#202C33] hover:border-emerald-500/40 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400">{item.caption}</span>
                    <span className="text-[10px] text-[#8696A0]">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#E9EDEF] line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Status Updates List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8696A0]">
            All Contact Updates
          </h2>

          <div className="bg-[#111B21] rounded-2xl border border-[#202C33] divide-y divide-[#202C33]/60">
            {contactStories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleOpenStory(story)}
                className="p-4 flex items-center justify-between hover:bg-[#202C33]/40 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full ring-2 ring-[#00A884] flex items-center justify-center text-white bg-[#202C33] overflow-hidden">
                    {story.authorAvatar ? (
                      <img
                        src={story.authorAvatar}
                        alt={story.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold">{story.authorName[0]}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm group-hover:text-[#00A884] transition">
                      {story.authorName}
                    </h4>
                    <p className="text-xs text-[#8696A0] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {story.updatedAt} • {story.items.length} update
                      {story.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-[#00A884] font-medium">View</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none">
          <div
            className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl"
            style={{
              backgroundColor: activeStory.items[activeItemIndex]?.bgColor || '#0B141A',
            }}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Top Progress Bars */}
            <div className="p-4 space-y-3 z-20">
              <div className="flex items-center gap-1.5">
                {activeStory.items.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className={`h-full bg-white transition-all duration-100 ${
                        idx < activeItemIndex
                          ? 'w-full'
                          : idx === activeItemIndex
                          ? 'w-full animate-[progress_5s_linear]'
                          : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Author Row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-black/40 ring-2 ring-white flex items-center justify-center font-bold overflow-hidden">
                    {activeStory.authorAvatar ? (
                      <img
                        src={activeStory.authorAvatar}
                        alt={activeStory.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{activeStory.authorName[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-none">{activeStory.authorName}</p>
                    <p className="text-[10px] text-white/70 mt-0.5">
                      {activeStory.items[activeItemIndex]?.timestamp}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Click Nav overlays for left/right */}
            <div
              className="absolute left-0 top-16 bottom-20 w-1/3 z-10 cursor-pointer"
              onClick={handlePrevItem}
            />
            <div
              className="absolute right-0 top-16 bottom-20 w-2/3 z-10 cursor-pointer"
              onClick={handleNextItem}
            />

            {/* Content Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="max-w-xs space-y-4">
                <p className="text-xl md:text-2xl font-bold text-white leading-relaxed whitespace-pre-wrap drop-shadow-md">
                  {activeStory.items[activeItemIndex]?.content}
                </p>
                {activeStory.items[activeItemIndex]?.caption && (
                  <span className="inline-block px-3 py-1 rounded-full bg-black/40 text-xs font-semibold text-white/90 backdrop-blur-sm">
                    {activeStory.items[activeItemIndex]?.caption}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Reply Bar */}
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                <input
                  type="text"
                  placeholder="Reply to status..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/60 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      alert('Reply sent to chat!');
                      setActiveStory(null);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    alert('Reply sent to chat!');
                    setActiveStory(null);
                  }}
                  className="p-1 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Status Modal */}
      {showAddModal}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111B21] border border-[#202C33] rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Add New Status Update</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8696A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div
              className="h-48 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition"
              style={{ backgroundColor: newStatusBg }}
            >
              <textarea
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                placeholder="Type your status update..."
                className="w-full h-full bg-transparent text-white font-bold text-lg text-center outline-none resize-none placeholder-white/50"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs text-[#8696A0] block mb-1.5 font-semibold">
                Background Theme
              </label>
              <div className="flex items-center gap-2">
                {BG_COLORS.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setNewStatusBg(bg)}
                    className={`w-7 h-7 rounded-full transition ring-offset-2 ring-offset-[#111B21] ${
                      newStatusBg === bg ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: bg }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-[#8696A0] block mb-1 font-semibold">
                Caption / Topic (Optional)
              </label>
              <input
                type="text"
                value={newStatusCaption}
                onChange={(e) => setNewStatusCaption(e.target.value)}
                placeholder="e.g. Morning thoughts, Productivity hack..."
                className="w-full bg-[#202C33] border border-[#2A3942] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <button
              onClick={handleCreateStatus}
              disabled={!newStatusText.trim()}
              className="w-full py-3 rounded-xl bg-[#00A884] hover:bg-[#009170] text-white font-bold text-sm transition disabled:opacity-50"
            >
              Share Status (24 Hours)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
