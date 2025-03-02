
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
        glassmorphic-card
        ${hoverEffect ? 'hover:shadow-lg hover:translate-y-[-2px]' : ''}
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
