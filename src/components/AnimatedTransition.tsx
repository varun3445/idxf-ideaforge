
import { ReactNode, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedTransitionProps {
  children: ReactNode;
}

const AnimatedTransition = ({
  children
}: AnimatedTransitionProps) => {
  const location = useLocation();
  const prevPathRef = useRef<string>(location.pathname);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname && elementRef.current) {
      const element = elementRef.current;

      // Apply exit animation
      element.classList.remove('animate-scale-in', 'animate-slide-in');
      element.classList.add('animate-scale-out');
      
      const timeout = setTimeout(() => {
        // Apply enter animation
        element.classList.remove('animate-scale-out');
        element.classList.add('animate-scale-in', 'animate-slide-in');
        prevPathRef.current = location.pathname;
      }, 300); // Duration of exit animation

      return () => clearTimeout(timeout);
    }
  }, [location.pathname]);
  
  return (
    <div 
      ref={elementRef} 
      style={{ transformOrigin: 'center' }} 
      className="min-h-screen w-full pt-6 md:pt-28 pb-16 animate-scale-in animate-slide-in"
    >
      {children}
    </div>
  );
};

export default AnimatedTransition;
