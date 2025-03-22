
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Set initial state based on the current window size
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    // Create event handler for resize events
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup function to remove event listener
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
