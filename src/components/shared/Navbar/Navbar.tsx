/**
 * Componente Navbar - Barra de navegacion principal
 * Equivalente a: encabezado.ts + navbar.ts de Angular
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../../stores/themeStore';
import { useAuthStore } from '../../../stores/authStore';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Navbar.scss';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [showStickyTopBar, setShowStickyTopBar] = useState(false);

  // Menu state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  // Refs for scroll tracking
  const lastScrollY = useRef(0);
  const scrollUpAccumulated = useRef(0);
  const lastWheelDirection = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationInProgress = useRef(false);

  const nombreUsuario = user?.nombre || 'Usuario';

  // Reset sticky on route change
  useEffect(() => {
    navigationInProgress.current = true;
    setShowStickyTopBar(false);
    scrollUpAccumulated.current = 0;
    lastScrollY.current = window.scrollY;

    const timeout = setTimeout(() => {
      navigationInProgress.current = false;
    }, 500);

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Wheel event handler
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > 0) {
        lastWheelDirection.current = event.deltaY > 0 ? 1 : -1;

        if (wheelTimeout.current) {
          clearTimeout(wheelTimeout.current);
        }

        wheelTimeout.current = setTimeout(() => {
          lastWheelDirection.current = 0;
        }, 100);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDiff = currentScrollY - lastScrollY.current;

        // Check if navbar exists on page
        const navbarExists = document.querySelector('.navbar') !== null;

        // Skip if navigation in progress
        if (navigationInProgress.current) {
          lastScrollY.current = currentScrollY;
          setShowStickyTopBar(false);
          scrollUpAccumulated.current = 0;
          return;
        }

        if (navbarExists) {
          // Set scrolled state when past header (140px)
          setIsScrolled(currentScrollY > 140);

          // Use wheel direction for immediate decisions
          if (lastWheelDirection.current === 1 && scrollDiff > 0) {
            // Wheel scrolling DOWN - hide immediately
            scrollUpAccumulated.current = 0;
            setShowStickyTopBar(false);
          } else if (lastWheelDirection.current === -1 && scrollDiff < 0) {
            // Wheel scrolling UP - accumulate and show faster
            scrollUpAccumulated.current += Math.abs(scrollDiff);

            if (scrollUpAccumulated.current >= 25 && currentScrollY > 160) {
              setShowStickyTopBar(true);
            }
          } else {
            // No recent wheel event - use normal logic
            const isAbruptJump = Math.abs(scrollDiff) > 150;

            if (isAbruptJump) {
              scrollUpAccumulated.current = 0;
              setShowStickyTopBar(false);
            } else if (scrollDiff < -3) {
              // Scrolling UP
              scrollUpAccumulated.current += Math.abs(scrollDiff);

              if (scrollUpAccumulated.current >= 100 && currentScrollY > 180) {
                setShowStickyTopBar(true);
              }
            } else if (scrollDiff > 3) {
              // Scrolling DOWN
              scrollUpAccumulated.current = 0;
              setShowStickyTopBar(false);
            }
          }

          // Hide sticky if near top
          if (currentScrollY <= 120) {
            setShowStickyTopBar(false);
            scrollUpAccumulated.current = 0;
          }

          // Set scrolling up state for logo visibility
          setIsScrollingUp(currentScrollY <= 160);
        } else {
          setIsScrolled(false);
          setShowStickyTopBar(false);
          scrollUpAccumulated.current = 0;
        }

        lastScrollY.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        setIsDropdownOpen(false);
      }
      if (isNavMenuOpen && !target.closest('.hamburger-button')) {
        if (target.closest('.mobile-nav-menu') &&
            !target.closest('.nav-menu-content') &&
            !target.closest('.close-nav-menu')) {
          setIsNavMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavMenuOpen]);

  // Toggle body scroll when mobile menu is open
  useEffect(() => {
    if (isNavMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isNavMenuOpen]);

  const toggleDropdown = useCallback(() => setIsDropdownOpen(prev => !prev), []);

  const toggleNavMenu = useCallback(() => {
    setIsNavMenuOpen(prev => !prev);
  }, []);

  const closeNavMenu = useCallback(() => {
    setIsNavMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  }, [logout, navigate]);

  const handleNavigate = useCallback((path: string) => {
    setIsDropdownOpen(false);
    setIsNavMenuOpen(false);
    navigate(path);
  }, [navigate]);

  return (
    <>
      {/* Top bar sticky que aparece sobre el navbar */}
      <div className={`top-bar-sticky ${showStickyTopBar ? 'show' : ''}`}>
        <div className="top-bar-content">
          <nav className="top-links" role="navigation" aria-label="Enlaces de ayuda">
            <button type="button" className="top-link" tabIndex={0} aria-label="Ver preguntas frecuentes">
              <span className="icon" aria-hidden="true">?</span>
              Preguntas frecuentes
            </button>
          </nav>
          <div className="top-right-section">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <header className={`header ${isScrolled ? 'scrolled' : ''}`} role="banner" aria-label="Encabezado principal">
        {/* Barra superior morada */}
        <div className="top-bar">
          <div className="top-bar-content">
            <nav className="top-links" role="navigation" aria-label="Enlaces de ayuda">
              <button type="button" className="top-link" tabIndex={0} aria-label="Ver preguntas frecuentes">
                <span className="icon" aria-hidden="true">?</span>
                Preguntas frecuentes
              </button>
            </nav>
            <div className="top-right-section">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Barra principal blanca */}
        <div className="main-bar">
          <div className="main-bar-content">
            <div className="logo-section">
              <a href="https://ine.mx/" target="_blank" rel="noopener noreferrer" tabIndex={0} aria-label="Ir al sitio web del Instituto Nacional Electoral">
                <img
                  src={isDarkMode ? '/assets/imgs/logos/logo-INE-blanco.png' : '/assets/imgs/logos/logo-INE.png'}
                  alt=""
                  className="logo-ine"
                  aria-hidden="true"
                />
              </a>
              <div className="divider" aria-hidden="true"></div>
              <Link to="/" className="system-info" tabIndex={0} aria-label="Ir a la página principal de ImpugnaINE">
                <div className="system-icon">
                  <img
                    src={isDarkMode ? '/assets/imgs/home/ID GRANDE-dark.svg' : '/assets/imgs/home/ID GRANDE.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
              </Link>
              <h1 className="system-title">Sistema de impugnaciones</h1>
            </div>

            {/* Sección de acciones a la derecha */}
            <div className="mobile-actions">
              {/* Botón de theme toggle (solo mobile) */}
              <button
                className="theme-toggle-mobile"
                onClick={toggleTheme}
                tabIndex={0}
                aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {!isDarkMode ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 2V4M12 20V22M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Menú de usuario */}
              <div className={`user-menu ${showStickyTopBar ? 'with-sticky-topbar' : ''}`}>
                <button
                  className="user-button"
                  onClick={toggleDropdown}
                  tabIndex={0}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label={`Menú de usuario: ${nombreUsuario}`}
                >
                  <span className="user-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M6 19C6 16 8.5 14 12 14C15.5 14 18 16 18 19" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </span>
                  <span className="user-text">{nombreUsuario}</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} aria-hidden="true">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="#582E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>

                {/* Dropdown menu de usuario */}
                {isDropdownOpen && (
                  <div className="user-dropdown-menu" role="menu" aria-label="Opciones de usuario">
                    {!isAuthenticated ? (
                      <>
                        <button
                          className="btn-iniciar-sesion"
                          onClick={() => handleNavigate('/auth/login')}
                          tabIndex={0}
                          role="menuitem"
                          aria-label="Iniciar sesión"
                        >
                          Inicia sesión
                        </button>
                        <div className="registro-section">
                          <span className="registro-texto">¿Eres nuevo?</span>
                          <button
                            className="btn-registrate"
                            onClick={() => handleNavigate('/registro-nuevo-usuario')}
                            tabIndex={0}
                            role="menuitem"
                            aria-label="Registrarse"
                          >
                            Regístrate
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="user-profile-header">
                          <div className="user-avatar">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                              <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2"/>
                              <path d="M6 19C6 16 8.5 14 12 14C15.5 14 18 16 18 19" stroke="white" strokeWidth="2"/>
                            </svg>
                          </div>
                          <h3 className="user-greeting">Hola, {nombreUsuario}</h3>
                          <Link
                            to="/perfil"
                            className="user-subtitle"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Perfil
                          </Link>
                        </div>
                        <button
                          className="btn-cambiar-password"
                          onClick={() => handleNavigate('/auth/recuperacion')}
                          tabIndex={0}
                          role="menuitem"
                          aria-label="Cambiar contraseña"
                        >
                          Cambiar Contraseña
                        </button>
                        <button
                          className="btn-cerrar-sesion"
                          onClick={handleLogout}
                          tabIndex={0}
                          role="menuitem"
                          aria-label="Cerrar sesión"
                        >
                          Cerrar sesión
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Botón de hamburguesa para menú de navegación (solo mobile y usuario logueado) */}
              {isAuthenticated && (
                <button
                  className={`hamburger-button ${isNavMenuOpen ? 'menu-open' : ''}`}
                  onClick={toggleNavMenu}
                  tabIndex={0}
                  aria-expanded={isNavMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menú de navegación"
                >
                  <span className="hamburger-icon" aria-hidden="true"></span>
                  <span className="hamburger-text">Menú</span>
                </button>
              )}
            </div>

            {/* Menú de navegación móvil */}
            {isNavMenuOpen && (
              <div className="mobile-nav-menu" role="menu" aria-label="Menú de navegación">
                <button
                  className="close-nav-menu"
                  onClick={closeNavMenu}
                  tabIndex={0}
                  aria-label="Cerrar menú"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M24 8L8 24M8 8L24 24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </button>

                <div className="nav-menu-content">
                  <button
                    className="nav-menu-item"
                    onClick={() => handleNavigate('/perfil')}
                    tabIndex={0}
                    role="menuitem"
                    aria-label="Ir a Inicio"
                  >
                    <svg className="nav-menu-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Inicio</span>
                  </button>
                  <button
                    className="nav-menu-item"
                    onClick={() => handleNavigate('/registro')}
                    tabIndex={0}
                    role="menuitem"
                    aria-label="Ir a Registro de impugnación"
                  >
                    <svg className="nav-menu-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Registro</span>
                  </button>
                  <button
                    className="nav-menu-item"
                    onClick={() => handleNavigate('/consulta')}
                    tabIndex={0}
                    role="menuitem"
                    aria-label="Ir a Consulta de impugnación"
                  >
                    <svg className="nav-menu-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Consulta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navbar horizontal (solo si está autenticado) */}
      {isAuthenticated && (
        <nav
          className={`navbar ${isScrolled ? 'scrolled' : ''} ${isScrollingUp ? 'scrolling-up' : ''} ${showStickyTopBar ? 'with-top-bar' : ''}`}
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="container">
            {/* Logo de ImpugnaINE (solo visible cuando hay scroll) */}
            <div className="navbar-logo" aria-hidden="true">
              <img
                src={isDarkMode
                  ? '/assets/imgs/logos/logo-impugna-mobile-dark.svg'
                  : (isScrolled ? '/assets/imgs/logos/logo-impugna-mobile-white-shield.svg' : '/assets/imgs/logos/logo-impugna-mobile.svg')
                }
                alt=""
              />
            </div>

            <NavLink
              to="/"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end
              tabIndex={0}
              aria-label="Inicio"
            >
              <span>Inicio</span>
            </NavLink>
            <NavLink
              to="/registro"
              className={({ isActive }) => `nav-item navbar-link-registro ${isActive ? 'active' : ''}`}
              tabIndex={0}
              aria-label="Registro de impugnación"
            >
              <span>Registro</span>
            </NavLink>
            <NavLink
              to="/consulta"
              className={({ isActive }) => `nav-item navbar-link-consulta ${isActive ? 'active' : ''}`}
              tabIndex={0}
              aria-label="Consulta de impugnación"
            >
              <span>Consulta</span>
            </NavLink>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
