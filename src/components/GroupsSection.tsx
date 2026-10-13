import React, { useState, useRef, useEffect } from 'react';
import {
  Users2,
  Send,
  Paperclip,
  Sparkles,
  Bot,
  AtSign,
  FileText,
  Shield,
  MoreVertical,
  CheckCheck,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Group, Message, Contact, UserProfile } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface GroupsSectionProps {
  group: Group;
  messages: Message[];
  contacts: Contact[];
  onSendMessage: (text: string, imageBase64?: string) => void;
  profile: UserProfile;
  isGenerating?: boolean;
}

export const GroupsSection: React.FC<GroupsSectionProps> = ({
  group,
  messages,
  contacts,
  onSendMessage,
  profile,
  isGenerating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [groupSummary, setGroupSummary] = useState<string | null>(null);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Mentionable participants
  const mentionableAssistants = [
    { name: 'META MAGSI', handle: '@META MAGSI' },
    { name: 'Qaswar Magsi AI', handle: '@Qaswar Magsi AI' },
    { name: 'Education Expert AI', handle: '@Education Expert AI' },
    { name: 'Health Information AI', handle: '@Health Information AI' },
    { name: 'Ali AI', handle: '@Ali AI' },
  ];

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInputText('');
    setShowMentionPicker(false);
  };

  const handleInsertMention = (handle: string) => {
    setInputText((prev) => (prev ? `${prev} ${handle} ` : `${handle} `));
    setShowMentionPicker(false);
  };

  // Generate Group Summary via AI API
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const recentContext = messages
        .slice(-10)
        .map((m) => `${m.senderName}: ${m.text}`)
        .join('\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: `Generate a crisp executive summary and 3 action items from this MAGSI GROUP conversation:\n\n${recentContext}`,
            },
          ],
          systemInstruction:
            'You are the executive summarizer for MAGSI GROUP. Extract core insights, distinct points from each AI participant, and next steps in high-impact format.',
        }),
      });

      const data = await res.json();
      setGroupSummary(data.text || 'Summary generated.');
    } catch (e) {
      setGroupSummary('Unable to generate summary at this moment.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const toggleSpeech = (msg: Message) => {
    if (activeAudioId === msg.id) {
      stopSpeaking();
      setActiveAudioId(null);
    } else {
      setActiveAudioId(msg.id);
      speakText(
        msg.text,
        profile.speechRate,
        'Kore',
        () => setActiveAudioId(msg.id),
        () => setActiveAudioId(null)
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B141A] text-[#E9EDEF] overflow-hidden select-none">
      {/* Group Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#111B21] border-b border-[#202C33] z-20 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setShowGroupInfo(true)}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center text-white ring-2 ring-[#00A884]">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-white text-base group-hover:text-[#00A884] transition">
                {group.name}
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#00A884]/20 text-[#00A884]">
                {group.participantIds.length} members
              </span>
            </div>
            <p className="text-xs text-[#8696A0] truncate">
              Qaswar, Health, Education, Ali, META MAGSI, You
            </p>
          </div>
        </div>

        {/* Action button: AI Group Summary */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] border border-[#2A3942] text-xs font-semibold text-emerald-400 hover:text-white transition"
            title="Generate AI summary of group chat"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingSummary ? 'Summarizing...' : 'AI Summary'}</span>
          </button>
        </div>
      </header>

      {/* Summary Banner if active */}
      {groupSummary && (
        <div className="bg-[#182229] border-b border-[#26353E] p-4 text-xs leading-relaxed z-10 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> MAGSI GROUP Executive AI Summary
            </span>
            <button onClick={() => setGroupSummary(null)} className="text-[#8696A0] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-white/90 whitespace-pre-wrap">{groupSummary}</div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.senderId === 'user';
          const isPlaying = activeAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm ${
                  isUser
                    ? 'bg-[#005C4B] text-white rounded-tr-none'
                    : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none border border-[#2A3942]/60'
                }`}
              >
                {!isUser && (
                  <p className="font-bold text-xs text-[#00A884] mb-1 flex items-center gap-1">
                    <Bot className="w-3 h-3 inline" />
                    <span>{msg.senderName}</span>
                  </p>
                )}

                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#8696A0] mt-1.5">
                  <button
                    onClick={() => toggleSpeech(msg)}
                    className="hover:text-emerald-400 transition"
                    title="Audio"
                  >
                    {isPlaying ? <VolumeX className="w-3 h-3 text-[#00A884]" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 max-w-[120px] bg-[#202C33] border border-[#2A3942]/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00A884] animate-bounce" />
            <span
              className="w-2 h-2 rounded-full bg-[#00A884] animate-bounce"
              style={{ animationDelay: '0.15s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-[#00A884] animate-bounce"
              style={{ animationDelay: '0.3s' }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mention Picker Popover */}
      {showMentionPicker && (
        <div className="bg-[#202C33] border-t border-[#2A3942] p-2 flex items-center gap-2 overflow-x-auto text-xs z-30">
          <span className="text-[#8696A0] font-bold pl-2">Mention:</span>
          {mentionableAssistants.map((ast) => (
            <button
              key={ast.handle}
              onClick={() => handleInsertMention(ast.handle)}
              className="px-2.5 py-1 rounded-full bg-[#111B21] hover:bg-[#00A884] text-[#00A884] hover:text-white font-semibold transition border border-[#2A3942] whitespace-nowrap"
            >
              {ast.handle}
            </button>
          ))}
        </div>
      )}

      {/* Group Input Footer */}
      <footer className="p-3 bg-[#111B21] border-t border-[#202C33] z-20">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          {/* Mention Tag Button */}
          <button
            onClick={() => setShowMentionPicker(!showMentionPicker)}
            className={`p-2.5 rounded-xl transition ${
              showMentionPicker
                ? 'bg-[#00A884] text-white'
                : 'text-[#8696A0] hover:text-white hover:bg-[#202C33]'
            }`}
            title="Mention an AI assistant"
          >
            <AtSign className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Message MAGSI GROUP (use @ to mention an assistant)..."
            className="flex-1 bg-[#202C33] border border-[#2A3942] rounded-2xl px-4 py-2.5 text-sm text-[#E9EDEF] outline-none placeholder-[#8696A0]"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-full bg-[#00A884] hover:bg-[#009170] text-white transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Group Info Drawer Modal */}
      {showGroupInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111B21] border border-[#202C33] rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Group Info</h3>
              <button onClick={() => setShowGroupInfo(false)} className="text-[#8696A0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-600 to-teal-800 flex items-center justify-center text-white ring-4 ring-[#00A884]/40 mb-3 shadow-lg">
                <Users2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">{group.name}</h4>
              <p className="text-xs text-[#8696A0] mt-1 max-w-xs mx-auto">{group.description}</p>
            </div>

            <div className="space-y-2 border-t border-[#202C33] pt-3">
              <p className="text-xs font-bold text-[#8696A0] uppercase">
                Group Participants ({group.participantIds.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#202C33]">
                  <span className="text-sm font-semibold text-white">{profile.name} (You)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-[#00A884]">
                    Group Admin
                  </span>
                </div>
                {mentionableAssistants.map((ast) => (
                  <div
                    key={ast.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#202C33]/60"
                  >
                    <span className="text-sm text-[#E9EDEF]">{ast.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#111B21] text-[#AEBAC1]">
                      AI Member
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
