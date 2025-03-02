
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const GlassmorphicCard = ({ 
  children, 
  className = "", 
  hoverEffect = true,
  onClick
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
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
