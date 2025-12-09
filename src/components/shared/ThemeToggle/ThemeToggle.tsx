/**
 * Componente ThemeToggle - Switch de tema claro/oscuro
 */

import { useThemeStore } from '../../../stores/themeStore';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Seleccionar tema">
      <span
        className={`theme-label theme-label-left ${!isDarkMode ? 'active' : ''}`}
        aria-hidden="true"
      >
        Modo claro
      </span>
      <label
        className="switch"
        aria-label={isDarkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
          tabIndex={-1}
          role="switch"
          aria-checked={isDarkMode}
        />
        <span className="slider"></span>
      </label>
      <span
        className={`theme-label theme-label-right ${isDarkMode ? 'active' : ''}`}
        aria-hidden="true"
      >
        Modo oscuro
      </span>
    </div>
  );
};

export default ThemeToggle;
