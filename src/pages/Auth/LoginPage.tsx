/**
 * Pagina de Login - Equivalente a login.component.ts de Angular
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAlertStore } from '../../stores/alertStore';
import { useThemeStore } from '../../stores/themeStore';
import { ButtonPrimario } from '../../components/ui';
import './LoginPage.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { error: showError } = useAlertStore();
  const { isDarkMode } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpMessage, setShowOtpMessage] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const emailError = emailTouched && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordError = passwordTouched && !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Simulacion de login - reemplazar con llamada real a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (email && password) {
        // Mostrar mensaje de OTP enviado
        setShowOtpMessage(true);

        // Esperar y luego hacer login
        await new Promise(resolve => setTimeout(resolve, 2000));

        login(
          {
            id: '1',
            email,
            nombre: email.split('@')[0]
          },
          'fake-jwt-token'
        );
        navigate('/');
      } else {
        setErrorMsg('Por favor ingresa tu email y contrasena');
      }
    } catch {
      await showError('Error', 'Error al iniciar sesion. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-container" role="main" aria-label="Formulario de inicio de sesion">
      {/* Logo ImpugnaINE */}
      <div className="login-logo text-center">
        <img
          src={isDarkMode ? '/assets/imgs/home/ID GRANDE-dark.svg' : '/assets/imgs/home/ID GRANDE.svg'}
          alt="ImpugnaINE"
          className="impugna-logo"
        />
      </div>

      <section className="login-box" aria-labelledby="login-instructions">
        {/* Mensaje de OTP enviado */}
        {showOtpMessage ? (
          <div className="otp-message" role="alert" aria-live="polite">
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark"></div>
              </div>
            </div>
            <h5 className="otp-title">¡Codigo enviado!</h5>
            <p className="otp-text">
              Se ha enviado un codigo de seguridad de 6 digitos a tu correo electronico.
            </p>
            <p className="otp-subtext">
              <i className="fas fa-envelope otp-icon" aria-hidden="true"></i>
              Por favor revisa tu bandeja de entrada
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} aria-describedby="login-instructions">
            <h6 id="login-instructions" className="text-center space-24 space-top-2">
              Ingresa tus datos de acceso
            </h6>
            <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

            <label htmlFor="email" className="parrafo-regular space-12 space-top-2">
              <i className="fa-regular fa-envelope" aria-hidden="true"></i>
              Correo electronico<span className="text-danger" aria-label="campo obligatorio">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`form-control ${emailError ? 'error' : ''}`}
              required
              aria-required="true"
              aria-invalid={emailError}
              disabled={isLoading}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
            {emailError && (
              <span id="email-error" className="error-message" role="alert" aria-live="polite">
                {!email ? 'El correo electronico es obligatorio' : 'Por favor ingresa un correo electronico valido'}
              </span>
            )}

            <div className="field-separator"></div>

            <div className="password-header">
              <label htmlFor="password" className="parrafo-regular space-12 space-top-2">
                <i className="fa-solid fa-lock" aria-hidden="true"></i>
                Contrasena<span className="text-danger" aria-label="campo obligatorio">*</span>
              </label>
              <Link to="/auth/recuperacion" className="forgot-link">Olvide mi contrasena</Link>
            </div>
            <div className="input-icon-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                className={`form-control ${passwordError ? 'error' : ''}`}
                required
                aria-required="true"
                aria-invalid={passwordError}
                disabled={isLoading}
                placeholder="Contrasena"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn-toggle-visibility"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                tabIndex={0}
              >
                <i className={showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'} aria-hidden="true">
                  {showPassword ? '👁' : '👁‍🗨'}
                </i>
              </button>
            </div>
            {passwordError && (
              <span id="password-error" className="error-message" role="alert" aria-live="polite">
                La contrasena es obligatoria
              </span>
            )}

            {errorMsg && (
              <span className="error-message" role="alert" aria-live="polite">{errorMsg}</span>
            )}
            <br />
            <div className="text-center">
              <ButtonPrimario
                type="submit"
                disabled={emailError || passwordError || isLoading || !email || !password}
                ariaLabel="Iniciar sesion"
              >
                {isLoading ? (
                  <span className="loader-inline">
                    <span className="spinner"></span>
                    Iniciando sesion...
                  </span>
                ) : (
                  'Iniciar sesion'
                )}
              </ButtonPrimario>
              <br />
            </div>
          </form>
        )}
      </section>
      <div className="text-center space-24-top">
        <img
          src={isDarkMode ? '/assets/imgs/logos/logo-INE-blanco.png' : '/assets/imgs/logos/logo-INE.png'}
          alt="Logotipo del Instituto Nacional Electoral"
          height="40"
        />
      </div>
    </div>
  );
};

export default LoginPage;
