import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Reply,
  Copy,
  Trash2,
  Check,
  CheckCheck,
  Sparkles,
  ArrowLeft,
  Search,
  MoreVertical,
  X,
  FileQuestion,
  Image as ImageIcon,
  Download,
  AlertCircle,
  Pin,
} from 'lucide-react';
import { Contact, Message, UserProfile } from '../types';
import { IconResolver } from './IconResolver';
import { speakText, stopSpeaking, SpeechRecognitionService, playNotificationSound } from '../utils/speech';

interface ChatAreaProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string, imageBase64?: string, replyTo?: Message['replyTo']) => void;
  onDeleteMessage: (id: string) => void;
  onClearChat: () => void;
  onBackMobile?: () => void;
  profile: UserProfile;
  isGenerating?: boolean;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '💡', '🚀', '✨'];

export const ChatArea: React.FC<ChatAreaProps> = ({
  contact,
  messages,
  onSendMessage,
  onDeleteMessage,
  onClearChat,
  onBackMobile,
  profile,
  isGenerating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [previewLightboxImage, setPreviewLightboxImage] = useState<string | null>(null);
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textbookInputRef = useRef<HTMLInputElement>(null);
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    speechServiceRef.current = new SpeechRecognitionService();
    return () => {
      stopSpeaking();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Send
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed && !attachedImage) return;

    if (profile.soundEffects) {
      playNotificationSound('send');
    }

    onSendMessage(
      trimmed,
      attachedImage || undefined,
      replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text.slice(0, 80),
          }
        : undefined
    );

    setInputText('');
    setAttachedImage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle Image File Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isTextbook = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedImage(result);
      if (isTextbook && !inputText) {
        setInputText(
          'Please examine this textbook question/diagram and provide a step-by-step solution.'
        );
      }
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Toggle Voice Input
  const toggleSpeechRecognition = () => {
    if (!speechServiceRef.current?.isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isRecording) {
      speechServiceRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechServiceRef.current.start(
        (transcript, _isFinal) => {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  // Text-To-Speech Playback
  const handleToggleSpeak = (msg: Message) => {
    if (activeSpeakingMsgId === msg.id) {
      stopSpeaking();
      setActiveSpeakingMsgId(null);
    } else {
      setActiveSpeakingMsgId(msg.id);
      speakText(
        msg.text,
        profile.speechRate,
        'Kore',
        () => setActiveSpeakingMsgId(msg.id),
        () => setActiveSpeakingMsgId(null)
      );
    }
  };

  // Copy Message Text
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Message Reaction Toggle
  const handleReact = (msg: Message, emoji: string) => {
    if (!msg.reactions) msg.reactions = {};
    if (msg.userReaction === emoji) {
      delete msg.reactions[emoji];
      msg.userReaction = undefined;
    } else {
      if (msg.userReaction && msg.reactions[msg.userReaction]) {
        msg.reactions[msg.userReaction]--;
      }
      msg.reactions[emoji] = (msg.reactions[emoji] || 0) + 1;
      msg.userReaction = emoji;
    }
  };

  // Filter messages if search is active
  const filteredMessages = searchQuery
    ? messages.filter((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full bg-[#0B141A] dark:bg-[#0B141A] text-[#E9EDEF] relative overflow-hidden select-text">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, false)}
      />
      <input
        ref={textbookInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageUpload(e, true)}
      />

      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#111B21] border-b border-[#202C33] z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 -ml-1 text-[#8696A0] hover:text-white rounded-lg"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Contact Avatar */}
          <div className="relative shrink-0">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00A884]"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-tr ${contact.avatarBg} flex items-center justify-center text-white shadow-sm ring-2 ring-[#00A884]/40`}
              >
                <IconResolver name={contact.avatarIcon} className="w-5 h-5" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
          </div>

          {/* Contact Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-white text-base truncate">{contact.name}</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30 shrink-0">
                AI
              </span>
            </div>
            <p className="text-xs text-[#8696A0] truncate">
              {isGenerating ? (
                <span className="text-[#00A884] animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Thinking & typing...
                </span>
              ) : (
                `${contact.category} • AI Assistant`
              )}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 text-[#8696A0]">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:text-white hover:bg-[#202C33] transition"
            title="Search Messages"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="p-2 rounded-lg hover:text-white hover:bg-[#202C33] transition"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenuDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#202C33] border border-[#2A3942] rounded-xl shadow-xl py-1.5 z-50 text-sm">
                <button
                  onClick={() => {
                    onClearChat();
                    setShowMenuDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#111B21] text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear Chat History
                </button>
                <button
                  onClick={() => {
                    const text = messages.map((m) => `[${m.timestamp}] ${m.senderName}: ${m.text}`).join('\n');
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${contact.name}-chat-export.txt`;
                    a.click();
                    setShowMenuDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#111B21] text-[#E9EDEF] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export Conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* In-chat Search Bar */}
      {showSearch && (
        <div className="bg-[#111B21] px-4 py-2 border-b border-[#202C33] flex items-center gap-2 z-10">
          <Search className="w-4 h-4 text-[#8696A0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this chat..."
            className="flex-1 bg-transparent text-sm text-[#E9EDEF] outline-none"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#8696A0] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Body with WhatsApp Subtle Texture */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3.5 relative"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.03) 0%, transparent 60%)',
        }}
      >
        {/* Contact Info Welcome Banner */}
        <div className="max-w-md mx-auto my-3 p-4 rounded-2xl bg-[#111B21]/90 border border-[#202C33] text-center shadow-md">
          <div className="inline-flex p-2.5 rounded-full bg-emerald-500/10 text-[#00A884] mb-2">
            <IconResolver name={contact.avatarIcon} className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">{contact.name}</h3>
          <p className="text-xs text-[#8696A0] mt-1 leading-relaxed">{contact.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {contact.capabilities.map((cap, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#202C33] text-[#00A884] border border-[#2A3942]"
              >
                {cap}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-[#8696A0] mt-2 italic flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#00A884]" /> AI Assistant • Messages are generated
            by intelligence models.
          </p>
        </div>

        {/* Quick Starters */}
        {messages.length <= 1 && contact.starters.length > 0 && (
          <div className="max-w-lg mx-auto space-y-2 my-2">
            <p className="text-xs font-semibold text-[#8696A0] text-center">
              Suggested conversation starters:
            </p>
            <div className="flex flex-col gap-1.5">
              {contact.starters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputText(starter);
                  }}
                  className="text-left text-xs bg-[#202C33]/70 hover:bg-[#202C33] text-[#00A884] hover:text-[#25D366] px-3.5 py-2.5 rounded-xl border border-[#2A3942] transition shadow-sm flex items-center justify-between group"
                >
                  <span>{starter}</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Messages */}
        {filteredMessages.map((msg) => {
          const isUser = msg.senderId === 'user';
          const isSpeaking = activeSpeakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group relative`}
            >
              {/* Message Bubble Container */}
              <div
                className={`relative max-w-[85%] md:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm text-sm transition ${
                  isUser
                    ? 'bg-[#005C4B] text-white rounded-tr-none'
                    : 'bg-[#202C33] text-[#E9EDEF] rounded-tl-none border border-[#2A3942]/50'
                }`}
              >
                {/* Reply Quoted Preview */}
                {msg.replyTo && (
                  <div
                    className={`mb-2 p-2 rounded-lg text-xs border-l-4 ${
                      isUser
                        ? 'bg-[#025141] border-emerald-300 text-emerald-100'
                        : 'bg-[#111B21] border-[#00A884] text-[#8696A0]'
                    }`}
                  >
                    <p className="font-bold text-[#00A884]">{msg.replyTo.senderName}</p>
                    <p className="truncate text-white/90">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Attached Image if any */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden cursor-pointer">
                    <img
                      src={msg.imageUrl}
                      alt="Attachment"
                      className="max-h-72 w-full object-cover rounded-xl hover:opacity-95 transition"
                      onClick={() => setPreviewLightboxImage(msg.imageUrl || null)}
                    />
                  </div>
                )}

                {/* Message Text with basic markdown rendering */}
                <div className="whitespace-pre-wrap leading-relaxed break-words font-normal">
                  {msg.text}
                </div>

                {/* Timestamp & Ticks */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 select-none ${
                    isUser ? 'text-emerald-200/80' : 'text-[#8696A0]'
                  }`}
                >
                  {isSpeaking && (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold mr-1">
                      <Volume2 className="w-3 h-3 animate-pulse" /> Playing
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                  {isUser && (
                    <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] inline-block ml-0.5" />
                  )}
                </div>

                {/* Reactions Display */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="absolute -bottom-3 right-3 flex items-center gap-0.5 bg-[#111B21] border border-[#202C33] rounded-full px-1.5 py-0.5 shadow-md text-xs">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <span key={emoji} className="flex items-center">
                        {emoji} {count > 1 && <span className="text-[10px] ml-0.5">{count}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar on Hover */}
              {hoveredMsgId === msg.id && (
                <div
                  className={`flex items-center gap-1 bg-[#111B21]/95 border border-[#202C33] rounded-full px-2 py-1 shadow-lg mt-1 z-10 transition ${
                    isUser ? 'mr-1' : 'ml-1'
                  }`}
                >
                  {/* Quick Reactions */}
                  {['👍', '❤️', '💡'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(msg, emoji)}
                      className="hover:scale-125 transition px-1 text-xs"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}

                  <div className="w-px h-3 bg-[#2A3942] mx-0.5" />

                  {/* Reply Button */}
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 hover:text-[#00A884] text-[#8696A0] rounded"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  {/* TTS Audio Speak */}
                  <button
                    onClick={() => handleToggleSpeak(msg)}
                    className={`p-1 rounded ${
                      isSpeaking ? 'text-[#00A884]' : 'text-[#8696A0] hover:text-white'
                    }`}
                    title={isSpeaking ? 'Stop Audio' : 'Listen with AI Voice'}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-[#00A884]" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(msg.text)}
                    className="p-1 hover:text-white text-[#8696A0] rounded"
                    title="Copy Text"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1 hover:text-rose-400 text-[#8696A0] rounded"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator bubble */}
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

      {/* Replying Banner */}
      {replyingTo && (
        <div className="bg-[#111B21] border-t border-[#202C33] px-4 py-2 flex items-center justify-between text-xs">
          <div className="border-l-2 border-[#00A884] pl-2 min-w-0">
            <p className="font-bold text-[#00A884]">Replying to {replyingTo.senderName}</p>
            <p className="text-[#8696A0] truncate">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-[#8696A0] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Preview Banner before sending */}
      {attachedImage && (
        <div className="bg-[#111B21] border-t border-[#202C33] px-4 py-2 flex items-center gap-3">
          <div className="relative">
            <img
              src={attachedImage}
              alt="Ready to send"
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#00A884]"
            />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-xs text-[#8696A0]">
            <p className="font-semibold text-white">Image attached for AI analysis</p>
            <p>Will be processed multimodal by Gemini</p>
          </div>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 bg-[#202C33] border border-[#2A3942] rounded-2xl p-3 shadow-2xl z-40 max-w-xs">
          <div className="grid grid-cols-5 gap-2 text-xl">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="hover:scale-125 transition p-1.5 rounded-lg hover:bg-[#111B21]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Sheet Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-20 left-12 bg-[#202C33] border border-[#2A3942] rounded-2xl p-3 shadow-2xl z-40 w-64 space-y-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#111B21] text-left transition group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-[#00A884]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Photos & Images</p>
              <p className="text-xs text-[#8696A0]">Send photo for AI review</p>
            </div>
          </button>

          <button
            onClick={() => textbookInputRef.current?.click()}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#111B21] text-left transition group"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Textbook Question</p>
              <p className="text-xs text-[#8696A0]">Math equation, diagram, exercise</p>
            </div>
          </button>
        </div>
      )}

      {/* Input Composer Bar */}
      <footer className="p-3 bg-[#111B21] border-t border-[#202C33] z-20">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 rounded-xl text-[#8696A0] hover:text-white hover:bg-[#202C33] transition shrink-0"
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment button */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2.5 rounded-xl transition shrink-0 ${
              showAttachMenu
                ? 'bg-[#00A884] text-white'
                : 'text-[#8696A0] hover:text-white hover:bg-[#202C33]'
            }`}
            title="Attach Document or Image"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Area */}
          <div className="flex-1 bg-[#202C33] rounded-2xl px-3.5 py-2 border border-[#2A3942] focus-within:border-[#00A884]/60 transition flex items-center">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${contact.name}...`}
              rows={1}
              className="w-full bg-transparent text-sm text-[#E9EDEF] outline-none resize-none max-h-32 placeholder-[#8696A0]"
            />
          </div>

          {/* Voice Input Mic Button */}
          <button
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : 'text-[#8696A0] hover:text-white hover:bg-[#202C33]'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Voice Input (Dictate)'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() && !attachedImage}
            className={`p-2.5 rounded-full transition shrink-0 shadow-md ${
              inputText.trim() || attachedImage
                ? 'bg-[#00A884] hover:bg-[#009170] text-white cursor-pointer active:scale-95'
                : 'bg-[#202C33] text-[#8696A0] cursor-not-allowed opacity-50'
            }`}
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>

      {/* Image Lightbox Modal */}
      {previewLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewLightboxImage}
              alt="Full Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewLightboxImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
