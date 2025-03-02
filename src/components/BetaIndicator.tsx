
import { useState, useEffect } from 'react';
import { Circle } from 'lucide-react';

const BetaIndicator = () => {
  const [isBlinking, setIsBlinking] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center bg-card/90 backdrop-blur-sm border border-border/40 rounded-full px-3 py-1.5 shadow-md">
      <span className="text-xs font-medium mr-2">Test version.</span>
      <Circle 
        size={10} 
        className={`${isBlinking ? 'text-primary fill-primary' : 'text-primary/30 fill-primary/30'} transition-colors duration-200`} 
      />
    </div>
  );
};

export default BetaIndicator;
