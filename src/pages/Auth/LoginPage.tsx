/**
 * Pagina de Login - Equivalente a login.component.ts de Angular
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAlertStore } from '../../stores/alertStore';
import { useThemeStore } from '../../stores/themeStore';
import { authService } from '../../services/api';
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
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs para los inputs de OTP
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailError = emailTouched && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordError = passwordTouched && !password;

  // Cooldown timer para reenviar OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Llamada real al servicio de autenticación
      const response = await authService.login({
        mailPersona: email,
        password: password
      });

      console.log('[LOGIN] Response:', response);

      if (response.success && response.requiresOtp) {
        // El servidor envió el OTP, mostrar pantalla de ingreso de código
        setShowOtpInput(true);
        setResendCooldown(60); // 60 segundos de cooldown para reenviar
        // Focus en el primer input de OTP
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else if (!response.success) {
        setErrorMsg(response.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      await showError('Error', 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-avanzar al siguiente input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Si se completaron todos los dígitos, verificar automáticamente
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Retroceder al input anterior con Backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpCode(newOtp);
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await authService.verificarCodigo({
        mailPersona: email,
        codigoOTP: code
      });

      console.log('[LOGIN] Verify OTP response:', response);

      if (response.success) {
        // Login exitoso, guardar en el store
        login(
          {
            id: String(response.usuario.id),
            email: response.usuario.email,
            nombre: response.usuario.nombre
          },
          response.token
        );
        navigate('/');
      } else {
        setErrorMsg(response.message || 'Código incorrecto');
        // Limpiar OTP para reintentar
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('[LOGIN] Error verifying OTP:', error);
      setErrorMsg('Error al verificar el código. Intenta de nuevo.');
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;

    setResendingOtp(true);
    setErrorMsg('');

    try {
      const response = await authService.reenviarOtp(email);
      if (response.success) {
        setResendCooldown(60);
        // Opcional: mostrar mensaje de éxito
      } else {
        setErrorMsg(response.message || 'Error al reenviar el código');
      }
    } catch (error) {
      console.error('[LOGIN] Error resending OTP:', error);
      setErrorMsg('Error al reenviar el código');
    } finally {
      setResendingOtp(false);
    }
  };

  const handleBackToLogin = () => {
    setShowOtpInput(false);
    setOtpCode(['', '', '', '', '', '']);
    setErrorMsg('');
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
        {/* Pantalla de ingreso de OTP */}
        {showOtpInput ? (
          <div className="otp-section" role="form" aria-label="Ingreso de código de verificación">
            <div className="otp-header">
              <button
                type="button"
                className="back-button"
                onClick={handleBackToLogin}
                aria-label="Volver al login"
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <h5 className="otp-title">Verificación de seguridad</h5>
            </div>

            <p className="otp-text">
              Ingresa el código de 6 dígitos enviado a:
            </p>
            <p className="otp-email">{email}</p>

            <div className="otp-inputs" onPaste={handleOtpPaste}>
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`otp-input ${errorMsg ? 'error' : ''}`}
                  disabled={isLoading}
                  aria-label={`Dígito ${index + 1} del código`}
                />
              ))}
            </div>

            {errorMsg && (
              <span className="error-message" role="alert" aria-live="polite">{errorMsg}</span>
            )}

            {isLoading && (
              <div className="otp-loading">
                <span className="spinner"></span>
                <span>Verificando...</span>
              </div>
            )}

            <div className="otp-resend">
              <p className="otp-resend-text">¿No recibiste el código?</p>
              <button
                type="button"
                className={`resend-button ${resendCooldown > 0 ? 'disabled' : ''}`}
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendingOtp}
              >
                {resendingOtp ? (
                  <>
                    <span className="spinner-small"></span>
                    Enviando...
                  </>
                ) : resendCooldown > 0 ? (
                  `Reenviar en ${resendCooldown}s`
                ) : (
                  'Reenviar código'
                )}
              </button>
            </div>
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
