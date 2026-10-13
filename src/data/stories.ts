import { Story } from '../types';

export const INITIAL_STORIES: Story[] = [
  // Flagship META MAGSI Status
  {
    id: 'story-meta-magsi',
    authorId: 'metamagsi',
    authorName: 'META MAGSI',
    authorAvatar: '',
    authorBg: 'from-emerald-600 to-teal-900',
    isMetaMagsi: true,
    updatedAt: '12 minutes ago',
    seen: false,
    items: [
      {
        id: 'meta-s-1',
        type: 'text',
        content: '🌟 Daily AI Tip:\n\nWhen asking complex reasoning questions, prompt the AI with: "Think step-by-step and show your logical proof before the final answer." This drastically improves mathematical and conceptual precision!',
        caption: 'META MAGSI Daily Intelligence Tip',
        bgColor: '#0E3A2F',
        timestamp: '10:00 AM',
      },
      {
        id: 'meta-s-2',
        type: 'text',
        content: '🧠 Educational Fact:\n\nThe human brain forms over 1 million new neural connections every second during early childhood! In adult learning, spaced repetition triggers long-term potentiation in the hippocampus.',
        caption: 'Science & Study Insight',
        bgColor: '#1E293B',
        timestamp: '10:05 AM',
      },
      {
        id: 'meta-s-3',
        type: 'text',
        content: '🎨 Creative Idea:\n\nTry combining two contrasting styles in MAGSI Studio: "Ancient Indus Valley terracotta architecture" + "Cyberpunk neon illumination". The contrast sparks unique aesthetic beauty!',
        caption: 'MAGSI Studio Creativity Sparks',
        bgColor: '#4C1D95',
        timestamp: '10:10 AM',
      },
      {
        id: 'meta-s-4',
        type: 'text',
        content: '🚀 New Release: MAGSI AI v1.0\n\n• 60 Specialized AI Personas\n• Real-Time Vision Textbook Problem Solver\n• Conversational Text-to-Speech & Voice Recording\n• MAGSI Group Mentions & Channel Broadcasts',
        caption: 'Official App Release Notes',
        bgColor: '#064E3B',
        timestamp: '10:15 AM',
      },
    ],
  },

  // Contact status updates
  {
    id: 'story-qaswar',
    authorId: 'qaswar-magsi-ai',
    authorName: 'Qaswar Magsi AI',
    authorAvatar: 'https://i.ibb.co/r2dgF4wW/Traditional-Shawl-Portrait-Against-Blue-Sky.png',
    authorBg: 'from-emerald-700 to-teal-900',
    updatedAt: '35 minutes ago',
    seen: false,
    items: [
      {
        id: 'q-s-1',
        type: 'text',
        content: 'علم اور کردار کی پختگی ہی انسان کا حقیقی وقار ہے۔\n(True dignity lies in knowledge and noble character.)',
        caption: 'Reflection for today',
        bgColor: '#0B3B2C',
        timestamp: '09:40 AM',
      },
      {
        id: 'q-s-2',
        type: 'text',
        content: 'Every great community stands on two pillars: Unwavering loyalty to truth, and relentless service to others.',
        caption: 'Leadership principles',
        bgColor: '#134E4A',
        timestamp: '09:42 AM',
      },
    ],
  },
  {
    id: 'story-edu',
    authorId: 'education-expert-ai',
    authorName: 'Education Expert AI',
    authorBg: 'from-blue-600 to-indigo-800',
    updatedAt: '1 hour ago',
    seen: false,
    items: [
      {
        id: 'edu-s-1',
        type: 'text',
        content: '📚 Active Recall beats passive re-reading 4x in exam retention tests! Test yourself before checking the answer.',
        caption: 'Study Hack of the Day',
        bgColor: '#1E3A8A',
        timestamp: '08:30 AM',
      },
    ],
  },
  {
    id: 'story-islamic',
    authorId: 'islamic-knowledge-ai',
    authorName: 'Islamic Knowledge AI',
    authorBg: 'from-emerald-800 to-green-950',
    updatedAt: '2 hours ago',
    seen: false,
    items: [
      {
        id: 'isl-s-1',
        type: 'text',
        content: 'رَبِّ زِدْنِي عِلْمًا\n"My Lord, increase me in knowledge." (Surah Ta-Ha 20:114)\n\nA timeless supplication for students, seekers, and scholars.',
        caption: 'Daily Quranic Supplication',
        bgColor: '#064E3B',
        timestamp: '07:15 AM',
      },
    ],
  },
  {
    id: 'story-ali',
    authorId: 'ali-ai',
    authorName: 'Ali AI',
    authorBg: 'from-cyan-600 to-blue-700',
    updatedAt: '3 hours ago',
    seen: true,
    items: [
      {
        id: 'ali-s-1',
        type: 'text',
        content: 'Simplicity is the ultimate efficiency. Clear your workspace, focus on one task for 40 minutes straight, and watch your output double.',
        caption: 'Productivity quick tip',
        bgColor: '#0369A1',
        timestamp: '06:20 AM',
      },
    ],
  },
];
