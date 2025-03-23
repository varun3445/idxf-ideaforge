
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
        rounded-xl shadow-md bg-white text-[#121212] 
        border-2 border-border/30 p-6 font-inter
        ${hoverEffect ? 'hover:shadow-xl hover:bg-white hover:border-primary/40 hover:translate-y-[-3px] transition-all duration-300' : ''}
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
