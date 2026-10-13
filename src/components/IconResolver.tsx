import React from 'react';
import * as Icons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconResolver: React.FC<IconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const LucideIcon = (Icons as any)[name] || Icons.Sparkles;
  return <LucideIcon className={className} size={size} />;
};

export const MagsiLogo: React.FC<{ size?: number; className?: string }> = ({ size = 36, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-lg shadow-emerald-900/30 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Speech bubble tail effect */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1.5"
      >
        <path
          d="M20 5C11.7157 5 5 11.268 5 19C5 22.42 6.30756 25.556 8.5 27.96L6 34L13.1 32.22C15.17 32.88 17.51 33 20 33C28.2843 33 35 26.732 35 19C35 11.268 28.2843 5 20 5Z"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M13 19L17 23L27 13"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="27" cy="11" r="2" fill="#A7F3D0" />
      </svg>
    </div>
  );
};
