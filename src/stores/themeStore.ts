/**
 * Store de Zustand para el tema (dark/light mode)
 * Equivalente a: ThemeService de Angular
 */

import { create } from 'zustand';

interface ThemeStore {
  isDarkMode: boolean;
  lastKnownSystemTheme: boolean;

  // Acciones
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  resetToSystemTheme: () => void;
  initializeTheme: () => void;
  applyTheme: (isDark: boolean) => void;
  updateFavicon: (isDark: boolean) => void;
}

const THEME_KEY = 'theme-preference';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDarkMode: false,
  lastKnownSystemTheme: false,

  initializeTheme: () => {
    if (typeof window === 'undefined') return;

    // Obtener el tema del sistema actual
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set({ lastKnownSystemTheme: systemPrefersDark });

    // Cargar preferencia guardada o usar la preferencia del sistema
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme !== null) {
      // Hay una preferencia manual guardada - usarla
      const isDark = savedTheme === 'dark';
      set({ isDarkMode: isDark });
      get().applyTheme(isDark);
    } else {
      // No hay preferencia manual - usar tema del sistema
      set({ isDarkMode: systemPrefersDark });
      get().applyTheme(systemPrefersDark);
    }

    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const newSystemTheme = e.matches;
      set({ lastKnownSystemTheme: newSystemTheme });

      // Cuando el sistema cambia, SIEMPRE sincronizar (eliminar preferencia manual)
      localStorage.removeItem(THEME_KEY);
      set({ isDarkMode: newSystemTheme });
      get().applyTheme(newSystemTheme);
    });
  },

  applyTheme: (isDark: boolean) => {
    if (typeof window === 'undefined') return;

    const htmlElement = document.documentElement;

    if (isDark) {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }

    // El favicon siempre refleja el tema del sistema, no el tema de la app
    get().updateFavicon(get().lastKnownSystemTheme);
  },

  updateFavicon: (isDark: boolean) => {
    if (typeof window === 'undefined') return;

    // Obtener todos los link de favicon
    const links = document.querySelectorAll('link[rel="icon"]');

    // Eliminar los existentes
    links.forEach(link => link.remove());

    // Crear nuevos favicons
    const favicon32 = document.createElement('link');
    favicon32.rel = 'icon';
    favicon32.type = 'image/svg+xml';
    favicon32.sizes = '32x32';
    favicon32.href = isDark ? '/icons/favicon-32x32-dark.svg' : '/icons/favicon-32x32.svg';
    favicon32.media = 'all';

    const favicon16 = document.createElement('link');
    favicon16.rel = 'icon';
    favicon16.type = 'image/svg+xml';
    favicon16.sizes = '16x16';
    favicon16.href = isDark ? '/icons/favicon-16x16-dark.svg' : '/icons/favicon-16x16.svg';
    favicon16.media = 'all';

    // Agregar al head
    document.head.appendChild(favicon32);
    document.head.appendChild(favicon16);
  },

  toggleTheme: () => {
    const newTheme = !get().isDarkMode;

    // Guardar la preferencia manual en localStorage
    localStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');

    // Actualizar el tema
    set({ isDarkMode: newTheme });
    get().applyTheme(newTheme);
  },

  setTheme: (isDark: boolean) => {
    // Guardar la preferencia manual en localStorage
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');

    // Actualizar el tema
    set({ isDarkMode: isDark });
    get().applyTheme(isDark);
  },

  resetToSystemTheme: () => {
    localStorage.removeItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    set({ isDarkMode: systemPrefersDark });
    get().applyTheme(systemPrefersDark);
  }
}));
