import { useState, useEffect } from 'react';

export function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(true); // default true for SSR to avoid mobile flash on desktop

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsDesktop(window.innerWidth >= breakpoint);
      
      // Set initial value
      handleResize();
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [breakpoint]);

  return isDesktop;
}
