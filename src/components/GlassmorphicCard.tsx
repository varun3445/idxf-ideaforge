
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const GlassmorphicCard = ({ 
  children, 
  className = "", 
  hoverEffect = true,
  onClick,
  onMouseEnter,
  onMouseLeave
}: GlassmorphicCardProps) => {
  return (
    <div
      className={`
        rounded-lg bg-creative-black/90 backdrop-blur-sm 
        border border-white/10 p-5 sm:p-6 font-inter
        ${hoverEffect ? 'hover:shadow-lg hover:border-creative-purple/30 transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
