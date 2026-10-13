import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  Brain,
  Calculator,
  Compass,
  FileText,
  Lightbulb,
  Languages,
  CheckCheck,
  X,
  AlertCircle,
  Copy,
  Download,
} from 'lucide-react';
import { Message, UserProfile } from '../types';
import { speakText, stopSpeaking, SpeechRecognitionService, playNotificationSound } from '../utils/speech';

interface MetaMagsiScreenProps {
  messages: Message[];
  onSendMessage: (text: string, imageBase64?: string) => void;
  profile: UserProfile;
  isGenerating?: boolean;
}

export const MetaMagsiScreen: React.FC<MetaMagsiScreenProps> = ({
  messages,
  onSendMessage,
  profile,
  isGenerating = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceChatMode, setVoiceChatMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechServiceRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    speechServiceRef.current = new SpeechRecognitionService();
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    const trimmed = text.trim();
    if (!trimmed && !attachedImage) return;

    if (profile.soundEffects) playNotificationSound('send');

    onSendMessage(trimmed, attachedImage || undefined);

    setInputText('');
    setAttachedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
      if (!inputText) {
        setInputText('Analyze this image and explain what is depicted with step-by-step clarity.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleMic = () => {
    if (!speechServiceRef.current?.isSupported) {
      alert('Speech recognition is not available in this browser. Try Chrome or Edge.');
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
          console.warn('Speech err:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

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

  const capabilities = [
    {
      title: 'Step-by-Step Math & STEM',
      icon: Calculator,
      prompt: 'Solve this step by step: Find the roots and vertex of f(x) = 2x^2 - 8x + 6',
      badge: 'Reasoning',
    },
    {
      title: 'Vision Question Solver',
      icon: Brain,
      prompt: 'How can I analyze textbook diagrams and handwritten questions using your vision engine?',
      badge: 'Multimodal',
    },
    {
      title: 'Urdu & Sindhi Translation',
      icon: Languages,
      prompt: 'Translate this into literary Urdu and traditional Sindhi: "Wisdom begins with listening, character is built through action."',
      badge: 'Multilingual',
    },
    {
      title: 'Business & Startup Strategy',
      icon: Lightbulb,
      prompt: 'Provide an actionable 30-day go-to-market plan for a new digital AI agency.',
      badge: 'Strategy',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0B141A] text-[#E9EDEF] relative overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-[#111B21] border-b border-[#202C33] z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/60">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00A884] ring-2 ring-[#111B21]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-lg tracking-wide">META MAGSI</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-400 to-teal-300 text-black">
                FLAGSHIP AI
              </span>
            </div>
            <p className="text-xs text-[#8696A0]">
              {isGenerating ? (
                <span className="text-[#00A884] font-medium animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Synthesizing answer...
                </span>
              ) : (
                'Multilingual Multimodal Intelligence • English, Urdu, Sindhi'
              )}
            </p>
          </div>
        </div>

        {/* Audio conversation toggle */}
        <button
          onClick={() => setVoiceChatMode(!voiceChatMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            voiceChatMode
              ? 'bg-[#00A884] text-white shadow-md'
              : 'bg-[#202C33] text-[#AEBAC1] hover:text-white hover:bg-[#2A3942]'
          }`}
          title="Voice Conversation Mode"
        >
          <Volume2 className="w-4 h-4" />
          <span>{voiceChatMode ? 'Voice Mode Active' : 'Voice Mode'}</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(0, 168, 132, 0.05) 0%, transparent 70%)',
        }}
      >
        {/* Welcome Hero when few messages */}
        {messages.length <= 1 && (
          <div className="max-w-xl mx-auto my-4 p-6 rounded-3xl bg-gradient-to-b from-[#111B21] to-[#0E161C] border border-emerald-500/20 text-center shadow-xl">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-3">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-white">Welcome to META MAGSI</h2>
            <p className="text-sm text-[#8696A0] mt-2 max-w-md mx-auto leading-relaxed">
              Your personalized flagship AI engine inside MAGSI AI. Capable of multimodal vision
              analysis, math problem solving, creative drafting, and strategic reasoning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-5 text-left">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(cap.prompt)}
                    className="p-3 rounded-2xl bg-[#202C33]/60 hover:bg-[#202C33] border border-[#2A3942] hover:border-emerald-500/40 transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className="w-4 h-4 text-[#00A884]" />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {cap.badge}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-emerald-300">
                      {cap.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.senderId === 'user';
          const isSpeaking = activeSpeakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-md text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#005C4B] text-white rounded-tr-none'
                    : 'bg-[#182229] border border-[#26353E] text-[#E9EDEF] rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>META MAGSI</span>
                  </div>
                )}

                {msg.imageUrl && (
                  <div className="mb-2.5 rounded-xl overflow-hidden border border-[#2A3942]">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded query"
                      className="max-h-72 w-full object-cover"
                    />
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="flex items-center justify-end gap-2 text-[10px] text-[#8696A0] mt-2">
                  <button
                    onClick={() => handleToggleSpeak(msg)}
                    className="hover:text-emerald-400 transition flex items-center gap-0.5"
                    title="Audio playback"
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="hover:text-white transition"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />}
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 max-w-[140px] bg-[#182229] border border-[#26353E] rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" />
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: '0.15s' }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: '0.3s' }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Thumbnail before sending */}
      {attachedImage && (
        <div className="bg-[#111B21] border-t border-[#202C33] px-4 py-2 flex items-center gap-3">
          <div className="relative">
            <img
              src={attachedImage}
              alt="Query preview"
              className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-400"
            />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-[#8696A0]">
            Photo attached • META MAGSI will analyze image content & provide solutions
          </p>
        </div>
      )}

      {/* Composer */}
      <footer className="p-3 bg-[#111B21] border-t border-[#202C33] z-20">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          {/* Vision upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-[#8696A0] hover:text-emerald-400 hover:bg-[#202C33] transition shrink-0"
            title="Upload image or textbook question"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 bg-[#202C33] rounded-2xl px-4 py-2 border border-[#2A3942] focus-within:border-emerald-400/70 transition flex items-center">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask META MAGSI anything (education, strategy, vision)..."
              rows={1}
              className="w-full bg-transparent text-sm text-[#E9EDEF] outline-none resize-none max-h-32 placeholder-[#8696A0]"
            />
          </div>

          {/* Mic */}
          <button
            onClick={toggleMic}
            className={`p-2.5 rounded-xl transition shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : 'text-[#8696A0] hover:text-white hover:bg-[#202C33]'
            }`}
            title={isRecording ? 'Listening...' : 'Voice Dictate'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send */}
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() && !attachedImage}
            className={`p-2.5 rounded-full transition shrink-0 shadow-lg ${
              inputText.trim() || attachedImage
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 hover:opacity-90 text-white cursor-pointer active:scale-95'
                : 'bg-[#202C33] text-[#8696A0] cursor-not-allowed opacity-50'
            }`}
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};
