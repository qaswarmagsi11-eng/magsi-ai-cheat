import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Moon,
  Sun,
  Volume2,
  Lock,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onClearAllChats,
}) => {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [speechRate, setSpeechRate] = useState(profile.speechRate);
  const [soundEffects, setSoundEffects] = useState(profile.soundEffects);
  const [readReceipts, setReadReceipts] = useState(profile.readReceipts);
  const [lastSeen, setLastSeen] = useState(profile.lastSeenPrivacy);
  const [apiStatus, setApiStatus] = useState<{ hasApiKey: boolean; model: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus({ hasApiKey: false, model: 'gemini-3.8-flash' }));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile({
      name,
      bio,
      avatarUrl,
      speechRate,
      soundEffects,
      readReceipts,
      lastSeenPrivacy: lastSeen,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportAll = () => {
    const data = {
      user: { name, bio, phone: profile.phone },
      exportedAt: new Date().toISOString(),
      appName: 'MAGSI AI',
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAGSI-AI-Export-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#111B21] border border-[#202C33] rounded-3xl p-6 text-[#E9EDEF] space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#202C33]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">App Settings & Profile</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00A884]/20 text-[#00A884]">
              Demo Mode
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8696A0] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#202C33]/60 border border-[#2A3942]">
          <div className="relative group cursor-pointer">
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#00A884]/60 shadow-lg"
              onError={(e) => {
                (e.target as any).src =
                  'https://i.ibb.co/r2dgF4wW/Traditional-Shawl-Portrait-Against-Blue-Sky.png';
              }}
            />
          </div>

          <div className="w-full space-y-2">
            <div>
              <label className="text-xs text-[#8696A0] block font-semibold mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111B21] border border-[#2A3942] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8696A0] block font-semibold mb-1">
                About / Bio
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#111B21] border border-[#2A3942] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8696A0] block font-semibold mb-1">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-[#111B21] border border-[#2A3942] rounded-xl px-3 py-2 text-xs text-[#AEBAC1] outline-none focus:border-[#00A884]"
              />
            </div>
          </div>
        </div>

        {/* Voice Speech Settings */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#202C33]/40 border border-[#2A3942]">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Volume2 className="w-4 h-4 text-[#00A884]" />
            <span>AI Voice & Speech Settings</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-[#8696A0] mb-1.5">
              <span>Speech Rate Speed ({speechRate}x)</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition ${
                    speechRate === rate
                      ? 'bg-[#00A884] border-[#00A884] text-white'
                      : 'bg-[#111B21] border-[#2A3942] text-[#AEBAC1] hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#AEBAC1]">Audio Notification Chimes</span>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="accent-[#00A884] w-4 h-4"
            />
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#202C33]/40 border border-[#2A3942]">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Lock className="w-4 h-4 text-[#00A884]" />
            <span>Privacy & Delivery</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#AEBAC1]">Read Receipts (Blue Checks)</span>
            <input
              type="checkbox"
              checked={readReceipts}
              onChange={(e) => setReadReceipts(e.target.checked)}
              className="accent-[#00A884] w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#AEBAC1]">Last Seen Visibility</span>
            <select
              value={lastSeen}
              onChange={(e) => setLastSeen(e.target.value as any)}
              className="bg-[#111B21] border border-[#2A3942] rounded-xl px-2.5 py-1 text-xs text-white outline-none"
            >
              <option value="everyone">Everyone</option>
              <option value="my_contacts">Contacts Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>

        {/* Backend & AI Integration Status */}
        <div className="p-4 rounded-2xl bg-[#182229] border border-[#26353E] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI Backend Integration
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                apiStatus?.hasApiKey
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {apiStatus?.hasApiKey ? 'Connected (Gemini)' : 'Local Demo Intelligence'}
            </span>
          </div>
          <p className="text-[#8696A0] leading-relaxed">
            Multimodal reasoning model: <code className="text-emerald-400">gemini-3.8-flash</code>.
            Image generation model: <code className="text-emerald-400">gemini-3.1-flash-lite-image</code>.
          </p>
        </div>

        {/* Data Management Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#00A884] transition"
          >
            <Download className="w-4 h-4" /> Export All Data
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all conversation history?')) {
                onClearAllChats();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-semibold text-rose-300 transition"
          >
            <Trash2 className="w-4 h-4" /> Clear All Chats
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-[#00A884] hover:bg-[#009170] text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" /> Saved Successfully!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};
