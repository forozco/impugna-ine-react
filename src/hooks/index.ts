/**
 * Exportacion centralizada de todos los hooks personalizados
 */

export { useLogger, logger } from './useLogger';
export { useTheme } from './useTheme';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion
} from './useMediaQuery';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebouncedCallback } from './useDebounce';
