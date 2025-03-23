
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ 
  children, 
  hoverEffect = false, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-md p-6",
        hoverEffect && "transition-all duration-300 hover:shadow-lg hover:border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
