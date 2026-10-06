import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

export const CambodiaEmblem: React.FC<Props> = ({ className = 'w-12 h-12', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cambodia Education Emblem"
    >
      {/* Outer Decorative Circle with Gold Border */}
      <circle cx="50" cy="50" r="46" fill="#F8FAFC" stroke="#B45309" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="42" fill="#FFFFFF" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />

      {/* Radiant Sunburst Rays */}
      <g stroke="#F59E0B" strokeWidth="1.2" opacity="0.6">
        <line x1="50" y1="12" x2="50" y2="18" />
        <line x1="50" y1="82" x2="50" y2="88" />
        <line x1="12" y1="50" x2="18" y2="50" />
        <line x1="82" y1="50" x2="88" y2="50" />
        <line x1="23" y1="23" x2="28" y2="28" />
        <line x1="72" y1="72" x2="77" y2="77" />
        <line x1="23" y1="77" x2="28" y2="72" />
        <line x1="72" y1="28" x2="77" y2="23" />
      </g>

      {/* Lotus Pedestal Petals */}
      <path
        d="M26 68 C 34 60, 42 66, 50 64 C 58 66, 66 60, 74 68 C 66 74, 34 74, 26 68 Z"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1"
      />
      <path
        d="M32 71 C 38 67, 44 69, 50 68 C 56 69, 62 67, 68 71 C 60 76, 40 76, 32 71 Z"
        fill="#B91C1C"
      />

      {/* Open Book of Education / Knowledge */}
      <path
        d="M50 56 C 42 50, 32 50, 24 53 L 24 40 C 32 37, 42 37, 50 43 Z"
        fill="#1E3A8A"
        stroke="#1E40AF"
        strokeWidth="1"
      />
      <path
        d="M50 56 C 58 50, 68 50, 76 53 L 76 40 C 68 37, 58 37, 50 43 Z"
        fill="#1E3A8A"
        stroke="#1E40AF"
        strokeWidth="1"
      />
      
      {/* Book Inner Page Curves */}
      <path
        d="M50 54 C 43 49, 34 49, 26 51 L 26 41 C 34 39, 43 39, 50 44 Z"
        fill="#F8FAFC"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />
      <path
        d="M50 54 C 57 49, 66 49, 74 51 L 74 41 C 66 39, 57 39, 50 44 Z"
        fill="#F8FAFC"
        stroke="#CBD5E1"
        strokeWidth="0.8"
      />

      {/* Book Center Binding */}
      <line x1="50" y1="42" x2="50" y2="56" stroke="#B45309" strokeWidth="1.5" />

      {/* Knowledge Quill Pen / Torch */}
      <path
        d="M48 24 L 52 24 L 51 38 L 49 38 Z"
        fill="#D97706"
        stroke="#B45309"
        strokeWidth="0.8"
      />
      {/* Flame of Enlightenment */}
      <path
        d="M50 16 C 53 19, 54 21, 52 24 C 48 24, 47 20, 50 16 Z"
        fill="#F59E0B"
      />
      <path
        d="M50 18 C 51 20, 51.5 21, 50.5 23 C 49 23, 48.5 20.5, 50 18 Z"
        fill="#EF4444"
      />

      {/* Traditional Kbach Leaf Wings */}
      <path
        d="M20 44 C 18 36, 24 29, 31 29 C 27 34, 28 40, 26 44 Z"
        fill="#D97706"
        opacity="0.85"
      />
      <path
        d="M80 44 C 82 36, 76 29, 69 29 C 73 34, 72 40, 74 44 Z"
        fill="#D97706"
        opacity="0.85"
      />
    </svg>
  );
};
