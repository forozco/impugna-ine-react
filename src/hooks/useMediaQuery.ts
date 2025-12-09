/**
 * Hook para detectar media queries
 * Util para responsive design
 */

import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

// Breakpoints predefinidos (basados en Bootstrap 5)
export const useIsMobile = () => useMediaQuery('(max-width: 575.98px)');
export const useIsTablet = () => useMediaQuery('(min-width: 576px) and (max-width: 991.98px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 992px)');
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1200px)');

// Media queries de preferencias del sistema
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
