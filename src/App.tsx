/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Contact,
  Message,
  Group,
  Channel,
  Story,
  StoryItem,
  UserProfile,
} from './types';
import { INITIAL_CONTACTS } from './data/contacts';
import { INITIAL_GROUPS, INITIAL_GROUP_MESSAGES } from './data/groups';
import { INITIAL_CHANNELS } from './data/channels';
import { INITIAL_STORIES } from './data/stories';
import { DesktopSidebar, MobileBottomBar } from './components/Navigation';
import { ChatList } from './components/ChatList';
import { ChatArea } from './components/ChatArea';
import { ContactsDirectory } from './components/ContactsDirectory';
import { MagsiStudio } from './components/MagsiStudio';
import { StoriesSection } from './components/StoriesSection';
import { GroupsSection } from './components/GroupsSection';
import { ChannelsSection } from './components/ChannelsSection';
import { MetaMagsiScreen } from './components/MetaMagsiScreen';
import { SettingsModal } from './components/SettingsModal';
import { playNotificationSound } from './utils/speech';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chats');
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string>('qaswar-magsi-ai');
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    'qaswar-magsi-ai': [
      {
        id: 'qm-1',
        senderId: 'qaswar-magsi-ai',
        senderName: 'Qaswar Magsi AI',
        text: 'Assalamu Alaikum! Welcome to MAGSI AI. I am your personal advisor and strategic thinking companion. How can I assist you with your plans, decisions, or reflections today?',
        timestamp: '10:42 AM',
        status: 'read',
        isAI: true,
      },
    ],
    'education-expert-ai': [
      {
        id: 'ee-1',
        senderId: 'education-expert-ai',
        senderName: 'Education Expert AI',
        text: 'Hello! I am your Education Expert. You can type academic questions or upload an image of any textbook page, exercise, or handwritten diagram for an instant step-by-step breakdown.',
        timestamp: '11:15 AM',
        status: 'read',
        isAI: true,
      },
    ],
    'metamagsi': [
      {
        id: 'mm-1',
        senderId: 'metamagsi',
        senderName: 'META MAGSI',
        text: 'Greetings! I am META MAGSI, your flagship multimodal intelligence partner. I assist with complex STEM reasoning, image analysis, business models, and multilingual conversations in English, Urdu, and Sindhi. What shall we achieve today?',
        timestamp: '09:00 AM',
        status: 'read',
        isAI: true,
      },
    ],
  });

  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [groupMessages, setGroupMessages] = useState<Record<string, Message[]>>(INITIAL_GROUP_MESSAGES);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // User Profile
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Qaswar Magsi',
    bio: 'Exploring intelligence with MAGSI AI 🚀',
    avatarUrl: 'https://i.ibb.co/r2dgF4wW/Traditional-Shawl-Portrait-Against-Blue-Sky.png',
    phone: '+92 300 MAGSI-AI',
    readReceipts: true,
    lastSeenPrivacy: 'everyone',
    profilePhotoPrivacy: 'everyone',
    speechRate: 1.0,
    soundEffects: true,
    darkMode: true,
  });

  // Apply dark class to html document
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.darkMode]);

  const activeContact =
    contacts.find((c) => c.id === activeContactId) || contacts[0];
  const activeMessages = chatMessages[activeContactId] || [];

  // Send Direct Message to Contact
  const handleSendMessage = async (
    text: string,
    imageBase64?: string,
    replyTo?: Message['replyTo']
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `usr-${Date.now()}`;

    const userMessage: Message = {
      id: userMsgId,
      senderId: 'user',
      senderName: profile.name,
      text,
      timestamp,
      status: 'sent',
      imageUrl: imageBase64,
      replyTo,
    };

    // Update conversation state with user message
    setChatMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), userMessage],
    }));

    // Update contact last message
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? { ...c, lastMessage: text || '[Image Question]', lastMessageTime: timestamp, unreadCount: 0 }
          : c
      )
    );

    setIsGenerating(true);

    try {
      // Build messages history payload for server
      const currentHistory = chatMessages[activeContactId] || [];
      const apiPayloadMessages = [
        ...currentHistory.slice(-6).map((m) => ({
          role: m.senderId === 'user' ? 'user' : 'model',
          text: m.text,
        })),
        {
          role: 'user',
          text,
        },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiPayloadMessages,
          systemInstruction: activeContact.systemPrompt,
          imageBase64: imageBase64,
        }),
      });

      const data = await res.json();
      const replyText = data.text || "I've reviewed your request.";

      if (profile.soundEffects) {
        playNotificationSound('receive');
      }

      const aiMsgId = `ai-${Date.now()}`;
      const aiMessage: Message = {
        id: aiMsgId,
        senderId: activeContact.id,
        senderName: activeContact.name,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        isAI: true,
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), aiMessage],
      }));

      // Update contact preview
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContactId
            ? { ...c, lastMessage: replyText.slice(0, 70), lastMessageTime: aiMessage.timestamp }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to get AI response:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send Message to META MAGSI
  const handleSendMetaMagsi = async (text: string, imageBase64?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `usr-mm-${Date.now()}`;

    const userMessage: Message = {
      id: userMsgId,
      senderId: 'user',
      senderName: profile.name,
      text,
      timestamp,
      status: 'sent',
      imageUrl: imageBase64,
    };

    setChatMessages((prev) => ({
      ...prev,
      metamagsi: [...(prev.metamagsi || []), userMessage],
    }));

    setIsGenerating(true);

    try {
      const history = chatMessages.metamagsi || [];
      const apiPayloadMessages = [
        ...history.slice(-6).map((m) => ({
          role: m.senderId === 'user' ? 'user' : 'model',
          text: m.text,
        })),
        { role: 'user', text },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiPayloadMessages,
          systemInstruction:
            'You are META MAGSI, the flagship intelligent, friendly, creative, and professional AI companion. You have deep mastery of STEM mathematics, image explanations, strategic business blueprints, and multilingual communication in English, Urdu, Roman Urdu, and Sindhi.',
          imageBase64,
        }),
      });

      const data = await res.json();
      const replyText = data.text || 'I am ready to assist you.';

      if (profile.soundEffects) {
        playNotificationSound('receive');
      }

      const aiMessage: Message = {
        id: `ai-mm-${Date.now()}`,
        senderId: 'metamagsi',
        senderName: 'META MAGSI',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        isAI: true,
      };

      setChatMessages((prev) => ({
        ...prev,
        metamagsi: [...(prev.metamagsi || []), aiMessage],
      }));
    } catch (err) {
      console.error('Meta Magsi error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send Message to MAGSI GROUP
  const handleSendGroupMessage = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      id: `grp-u-${Date.now()}`,
      senderId: 'user',
      senderName: profile.name,
      text,
      timestamp,
      status: 'sent',
    };

    setGroupMessages((prev) => ({
      ...prev,
      'magsi-group': [...(prev['magsi-group'] || []), userMessage],
    }));

    // Check if an assistant is mentioned or if it's general
    let targetAssistant: { name: string; prompt: string } | null = null;
    const lower = text.toLowerCase();

    if (lower.includes('@education')) {
      targetAssistant = {
        name: 'Education Expert AI',
        prompt: 'You are Education Expert AI responding inside MAGSI GROUP to an academic query.',
      };
    } else if (lower.includes('@health')) {
      targetAssistant = {
        name: 'Health Information AI',
        prompt: 'You are Health Information AI contributing evidence-based wellness tips inside MAGSI GROUP.',
      };
    } else if (lower.includes('@ali')) {
      targetAssistant = {
        name: 'Ali AI',
        prompt: 'You are Ali AI, a practical problem solver inside MAGSI GROUP.',
      };
    } else if (lower.includes('@qaswar')) {
      targetAssistant = {
        name: 'Qaswar Magsi AI',
        prompt: 'You are Qaswar Magsi AI, giving strategic reflections inside MAGSI GROUP.',
      };
    } else {
      // Default to META MAGSI
      targetAssistant = {
        name: 'META MAGSI',
        prompt: 'You are META MAGSI, group moderator and flagship AI responding inside MAGSI GROUP.',
      };
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: `Group message from ${profile.name}: ${text}` }],
          systemInstruction: `${targetAssistant.prompt} Respond concisely and constructively to the team.`,
        }),
      });

      const data = await res.json();
      const aiReply = data.text || 'Noted by the team!';

      if (profile.soundEffects) {
        playNotificationSound('receive');
      }

      const aiMessage: Message = {
        id: `grp-ai-${Date.now()}`,
        senderId: targetAssistant.name.toLowerCase().replace(/\s+/g, '-'),
        senderName: targetAssistant.name,
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        isAI: true,
      };

      setGroupMessages((prev) => ({
        ...prev,
        'magsi-group': [...(prev['magsi-group'] || []), aiMessage],
      }));
    } catch (e) {
      console.error('Group chat error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete message in current chat
  const handleDeleteMessage = (id: string) => {
    setChatMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).filter((m) => m.id !== id),
    }));
  };

  // Clear Chat in current conversation
  const handleClearChat = () => {
    setChatMessages((prev) => ({
      ...prev,
      [activeContactId]: [],
    }));
  };

  // Clear all chats everywhere
  const handleClearAllChats = () => {
    setChatMessages({});
    setGroupMessages({ 'magsi-group': [] });
  };

  // Add Story Item
  const handleAddStory = (item: StoryItem) => {
    setStories((prev) => {
      const userStory = prev.find((s) => s.authorId === 'user');
      if (userStory) {
        return prev.map((s) =>
          s.authorId === 'user'
            ? { ...s, items: [item, ...s.items], updatedAt: 'Just now' }
            : s
        );
      } else {
        const newStory: Story = {
          id: `story-usr-${Date.now()}`,
          authorId: 'user',
          authorName: profile.name,
          authorAvatar: profile.avatarUrl,
          items: [item],
          updatedAt: 'Just now',
          seen: false,
        };
        return [newStory, ...prev];
      }
    });
  };

  // Toggle Follow Channel
  const handleToggleFollow = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              isFollowing: !ch.isFollowing,
              followersCount: ch.isFollowing ? ch.followersCount - 1 : ch.followersCount + 1,
            }
          : ch
      )
    );
  };

  // React to Channel Post
  const handleReactPost = (channelId: string, postId: string, emoji: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== channelId) return ch;
        return {
          ...ch,
          posts: ch.posts.map((post) => {
            if (post.id !== postId) return post;
            const updated = { ...post.reactions };
            if (post.userReaction === emoji) {
              updated[emoji] = Math.max(0, (updated[emoji] || 1) - 1);
              return { ...post, reactions: updated, userReaction: undefined };
            } else {
              if (post.userReaction && updated[post.userReaction]) {
                updated[post.userReaction] = Math.max(0, updated[post.userReaction] - 1);
              }
              updated[emoji] = (updated[emoji] || 0) + 1;
              return { ...post, reactions: updated, userReaction: emoji };
            }
          }),
        };
      })
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B141A] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Desktop Sidebar Navigation */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileChatOpen(false);
        }}
        unreadChatsCount={contacts.reduce((acc, c) => acc + c.unreadCount, 0)}
        unreadStoriesCount={stories.filter((s) => !s.seen).length}
        profile={profile}
        onToggleTheme={() =>
          setProfile((p) => ({ ...p, darkMode: !p.darkMode }))
        }
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* 2. Main Center / Content Viewport */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B141A]">
        {/* Render Tab View */}
        {currentTab === 'chats' && (
          <div className="flex h-full w-full overflow-hidden">
            {/* Left Chat List (hidden on mobile if chat is open) */}
            <div
              className={`w-full md:w-96 h-full shrink-0 ${
                isMobileChatOpen ? 'hidden md:block' : 'block'
              }`}
            >
              <ChatList
                contacts={contacts}
                groups={groups}
                activeContactId={activeContactId}
                onSelectContact={(id) => {
                  setActiveContactId(id);
                  setIsMobileChatOpen(true);
                  // mark as read
                  setContacts((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setIsMobileChatOpen(false);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Right Chat Area (hidden on mobile if chat is not open) */}
            <div
              className={`flex-1 h-full overflow-hidden ${
                isMobileChatOpen ? 'block' : 'hidden md:block'
              }`}
            >
              <ChatArea
                contact={activeContact}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                onClearChat={handleClearChat}
                onBackMobile={() => setIsMobileChatOpen(false)}
                profile={profile}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        )}

        {currentTab === 'contacts' && (
          <ContactsDirectory
            contacts={contacts}
            onSelectContact={(id) => {
              setActiveContactId(id);
              setCurrentTab('chats');
              setIsMobileChatOpen(true);
            }}
          />
        )}

        {currentTab === 'metamagsi' && (
          <MetaMagsiScreen
            messages={chatMessages.metamagsi || []}
            onSendMessage={handleSendMetaMagsi}
            profile={profile}
            isGenerating={isGenerating}
          />
        )}

        {currentTab === 'studio' && <MagsiStudio />}

        {currentTab === 'status' && (
          <StoriesSection
            stories={stories}
            userProfile={profile}
            onAddStory={handleAddStory}
          />
        )}

        {currentTab === 'groups' && (
          <GroupsSection
            group={groups[0]}
            messages={groupMessages['magsi-group'] || []}
            contacts={contacts}
            onSendMessage={handleSendGroupMessage}
            profile={profile}
            isGenerating={isGenerating}
          />
        )}

        {currentTab === 'channels' && (
          <ChannelsSection
            channels={channels}
            onToggleFollow={handleToggleFollow}
            onReactPost={handleReactPost}
          />
        )}

        {/* 3. Mobile Bottom Navigation Bar (hidden when actively typing in mobile chat) */}
        {!isMobileChatOpen && (
          <MobileBottomBar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              setIsMobileChatOpen(false);
            }}
            unreadChatsCount={contacts.reduce((acc, c) => acc + c.unreadCount, 0)}
            unreadStoriesCount={stories.filter((s) => !s.seen).length}
            profile={profile}
            onToggleTheme={() =>
              setProfile((p) => ({ ...p, darkMode: !p.darkMode }))
            }
            onOpenSettings={() => setShowSettingsModal(true)}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
}
