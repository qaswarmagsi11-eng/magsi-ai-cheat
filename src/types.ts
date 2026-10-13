export type NavigationTab =
  | 'chats'
  | 'contacts'
  | 'studio'
  | 'status'
  | 'groups'
  | 'channels'
  | 'metamagsi'
  | 'settings';

export interface Message {
  id: string;
  senderId: string; // 'user' | contactId
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  imageUrl?: string;
  reactions?: Record<string, number>; // e.g. { '👍': 1, '❤️': 2 }
  userReaction?: string;
  isAI?: boolean;
  isEdited?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  tagline: string;
  category:
    | 'General & Personal'
    | 'Education & Study'
    | 'Islamic Knowledge'
    | 'Health & Wellness'
    | 'Business & Productivity'
    | 'Stories & Entertainment'
    | 'Specialized Assistants';
  avatarBg: string;
  avatarIcon: string;
  avatarUrl?: string;
  description: string;
  systemPrompt: string;
  starters: string[];
  capabilities: string[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline: boolean;
  pinned?: boolean;
}

export interface Group {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarBg: string;
  description: string;
  participantIds: string[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  createdBy: string;
}

export interface ChannelPost {
  id: string;
  title?: string;
  content: string;
  timestamp: string;
  imageUrl?: string;
  reactions: Record<string, number>;
  userReaction?: string;
  views?: number;
}

export interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarBg: string;
  avatarIcon: string;
  description: string;
  category: string;
  followersCount: number;
  isFollowing: boolean;
  verified?: boolean;
  posts: ChannelPost[];
}

export interface StoryItem {
  id: string;
  type: 'text' | 'image';
  content: string; // text or image URL
  caption?: string;
  bgColor?: string;
  timestamp: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBg?: string;
  items: StoryItem[];
  isMetaMagsi?: boolean;
  updatedAt: string;
  seen?: boolean;
}

export interface StudioGenerator {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  type: 'image' | 'text';
  samplePrompts: string[];
  defaultAspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  defaultStyle?: string;
}

export interface UserProfile {
  name: string;
  bio: string;
  avatarUrl: string;
  phone: string;
  readReceipts: boolean;
  lastSeenPrivacy: 'everyone' | 'my_contacts' | 'nobody';
  profilePhotoPrivacy: 'everyone' | 'my_contacts' | 'nobody';
  speechRate: number; // 0.8 - 1.4
  soundEffects: boolean;
  darkMode: boolean;
}
