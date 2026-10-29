import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size = 'md',
  showTagline = false 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Icon combining Circular Loop + Graduation Cap & Book */}
      <div className={`${iconSizes[size]} relative flex items-center justify-center shrink-0`}>
        <svg 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full drop-shadow-sm"
        >
          {/* Outer circle subtle track */}
          <circle cx="24" cy="24" r="22" className="fill-[#153225]" />
          
          {/* Circular loop arrows */}
          {/* Top Clockwise Loop Arc (Ivory/Emerald) */}
          <path 
            d="M13 23C13 16.925 17.925 12 24 12C28.2 12 31.8 14.36 33.6 17.8" 
            stroke="#FAF8F5" 
            strokeWidth="2.8" 
            strokeLinecap="round"
          />
          <polygon points="35,12 37,19 30,17" fill="#FAF8F5" />
          
          {/* Bottom Counter/Complement Loop Arc (Terracotta) */}
          <path 
            d="M35 25C35 31.075 30.075 36 24 36C19.8 36 16.2 33.64 14.4 30.2" 
            stroke="#BA4E29" 
            strokeWidth="2.8" 
            strokeLinecap="round"
          />
          <polygon points="13,36 11,29 18,31" fill="#BA4E29" />
          
          {/* Center Academic Mortarboard / Open Book Motif */}
          {/* Cap diamond */}
          <path 
            d="M24 17.5L32 21.5L24 25.5L16 21.5Z" 
            fill="#FAF8F5" 
          />
          {/* Cap base skullcup */}
          <path 
            d="M19 23.2V27.5C19 28.8 21.2 30 24 30C26.8 30 29 28.8 29 27.5V23.2" 
            stroke="#FAF8F5" 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          {/* Tassel */}
          <path 
            d="M31.5 21.5V26.5" 
            stroke="#BA4E29" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
          />
          <circle cx="31.5" cy="27.5" r="1" fill="#BA4E29" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-serif font-bold tracking-tight text-[#153225] dark:text-emerald-300 leading-none ${textSizes[size]}`}>
          Campus<span className="text-[#BA4E29]">Market</span>
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-wider font-semibold uppercase text-stone-500 dark:text-stone-400 mt-0.5">
            Buy, Sell and Find What You Need on Campus
          </span>
        )}
      </div>
    </div>
  );
};
