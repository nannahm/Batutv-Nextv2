import React from 'react';
import { BatuTVBrandLogo } from '../common/BatuTVBrandLogo';

interface BatuTVLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark' | 'auto';
  showSlogan?: boolean;
}

export const BatuTVLogo: React.FC<BatuTVLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'auto',
  showSlogan = true,
}) => {
  const heightMap = {
    sm: 32,
    md: 42,
    lg: 54,
  };

  return (
    <BatuTVBrandLogo
      height={heightMap[size]}
      theme={theme}
      showSlogan={showSlogan}
      className={className}
    />
  );
};

