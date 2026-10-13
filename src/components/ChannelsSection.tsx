import React, { useState } from 'react';
import {
  Radio,
  Check,
  Plus,
  Share2,
  ThumbsUp,
  Heart,
  Flame,
  Lightbulb,
  Sparkles,
  Eye,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Channel, ChannelPost } from '../types';
import { IconResolver } from './IconResolver';

interface ChannelsSectionProps {
  channels: Channel[];
  onToggleFollow: (channelId: string) => void;
  onReactPost: (channelId: string, postId: string, emoji: string) => void;
}

export const ChannelsSection: React.FC<ChannelsSectionProps> = ({
  channels,
  onToggleFollow,
  onReactPost,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');
  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0B141A] text-[#E9EDEF] overflow-hidden select-none">
      {/* Channels List Drawer (Left 4 cols on desktop) */}
      <div className="w-full md:w-80 bg-[#111B21] border-r border-[#202C33] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#202C33]">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-lg font-bold text-white">Channels</h2>
          </div>
          <p className="text-xs text-[#8696A0] mt-1">
            Stay updated on topics you care about.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((ch) => {
            const isSelected = ch.id === selectedChannel.id;
            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                  isSelected ? 'bg-[#202C33]' : 'hover:bg-[#202C33]/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-tr ${ch.avatarBg} flex items-center justify-center text-white ring-2 ring-[#2A3942] shrink-0 shadow-sm`}
                  >
                    <IconResolver name={ch.avatarIcon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-white text-sm truncate">{ch.name}</p>
                      {ch.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00A884] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#8696A0] truncate">
                      {ch.followersCount.toLocaleString()} followers
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(ch.id);
                  }}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition shrink-0 ${
                    ch.isFollowing
                      ? 'bg-[#202C33] text-[#AEBAC1] border border-[#2A3942]'
                      : 'bg-[#00A884] text-white hover:bg-[#009170]'
                  }`}
                >
                  {ch.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Feed View (Right on desktop) */}
      <div className="flex-1 flex flex-col h-full bg-[#0B141A] overflow-hidden">
        {selectedChannel && (
          <>
            {/* Channel Profile Header */}
            <header className="p-4 bg-[#111B21] border-b border-[#202C33] flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-tr ${selectedChannel.avatarBg} flex items-center justify-center text-white ring-2 ring-[#00A884] shadow-md`}
                >
                  <IconResolver name={selectedChannel.avatarIcon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-base">{selectedChannel.name}</h3>
                    {selectedChannel.verified && (
                      <ShieldCheck className="w-4 h-4 text-[#00A884]" />
                    )}
                  </div>
                  <p className="text-xs text-[#8696A0]">
                    {selectedChannel.followersCount.toLocaleString()} followers •{' '}
                    {selectedChannel.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggleFollow(selectedChannel.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
                  selectedChannel.isFollowing
                    ? 'bg-[#202C33] text-[#E9EDEF] border border-[#2A3942]'
                    : 'bg-[#00A884] text-white hover:bg-[#009170]'
                }`}
              >
                {selectedChannel.isFollowing ? 'Following' : 'Follow Channel'}
              </button>
            </header>

            {/* Channel Description Ribbon */}
            <div className="px-5 py-2.5 bg-[#182229] border-b border-[#26353E] text-xs text-[#AEBAC1]">
              <p>{selectedChannel.description}</p>
            </div>

            {/* Posts Feed */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
              <div className="max-w-3xl mx-auto space-y-4">
                {selectedChannel.posts.map((post) => (
                  <article
                    key={post.id}
                    className="p-5 rounded-3xl bg-[#111B21] border border-[#202C33] shadow-md space-y-3 transition hover:border-[#00A884]/40"
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between text-xs text-[#8696A0]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{selectedChannel.name}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                      {post.views && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Eye className="w-3.5 h-3.5" /> {post.views.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Post Title */}
                    {post.title && (
                      <h4 className="text-base font-bold text-white leading-snug">{post.title}</h4>
                    )}

                    {/* Post Body */}
                    <div className="text-sm text-[#E9EDEF] leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </div>

                    {/* Post Image */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-[#2A3942]">
                        <img
                          src={post.imageUrl}
                          alt="Post attachment"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Emoji Reaction Bar */}
                    <div className="pt-2 border-t border-[#202C33] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(post.reactions).map(([emoji, count]) => {
                          const isReacted = post.userReaction === emoji;
                          return (
                            <button
                              key={emoji}
                              onClick={() => onReactPost(selectedChannel.id, post.id, emoji)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition text-xs font-semibold ${
                                isReacted
                                  ? 'bg-[#00A884]/20 border-[#00A884] text-[#00A884]'
                                  : 'bg-[#202C33] border-[#2A3942] text-[#AEBAC1] hover:text-white'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </button>
                          );
                        })}

                        {/* Extra Reaction shortcuts */}
                        {['👍', '❤️', '🔥', '💡'].map((quickEmoji) => {
                          if (post.reactions[quickEmoji]) return null;
                          return (
                            <button
                              key={quickEmoji}
                              onClick={() => onReactPost(selectedChannel.id, post.id, quickEmoji)}
                              className="px-2 py-1 rounded-full bg-[#202C33] text-[#8696A0] hover:text-white border border-[#2A3942] hover:border-emerald-500/40 text-xs transition"
                            >
                              {quickEmoji}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(post.content);
                          alert('Post content copied to clipboard!');
                        }}
                        className="p-1.5 rounded-lg text-[#8696A0] hover:text-white hover:bg-[#202C33] transition"
                        title="Share post"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
