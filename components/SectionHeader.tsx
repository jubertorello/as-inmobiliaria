
import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, light = false, centered = true }) => {
  return (
    <div className={`mb-16 ${centered ? 'text-center' : 'text-left'}`}>
      <h2 className={`text-3xl md:text-5xl font-playfair mb-4 ${light ? 'text-white' : 'text-brand-dark'}`}>
        {title}
      </h2>
      <div className={`w-24 h-1 mb-6 bg-brand-pink ${centered ? 'mx-auto' : ''}`}></div>
      {subtitle && (
        <p className={`max-w-2xl text-lg ${centered ? 'mx-auto' : ''} ${light ? 'text-white/70' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
