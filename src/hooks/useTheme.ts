/**
 * Hook para manejo del tema (dark/light mode)
 * Wrapper conveniente sobre useThemeStore
 */

import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const {
    isDarkMode,
    toggleTheme,
    setTheme,
    resetToSystemTheme,
    initializeTheme
  } = useThemeStore();

  // Inicializar el tema al montar el hook por primera vez
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return {
    isDarkMode,
    toggleTheme,
    setTheme,
    resetToSystemTheme
  };
};
