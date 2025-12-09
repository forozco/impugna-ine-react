/**
 * Pagina de Registro de Usuario
 * Equivalente a: registro-nuevo-usuario.ts de Angular
 * @version 1.0
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useRegistroUsuarioStore } from '../../stores/registroUsuarioStore';
import FileUploader from '../../components/shared/FileUploader/FileUploader';
import type { FileUploaderConfig } from '../../components/shared/FileUploader/FileUploader';
import { consultarCodigoPostal, type SepomexColonia } from '../../services/sepomexService';
import { usuariosService, type RegistroUsuarioRequest } from '../../services/api';
import './RegistroNuevoUsuarioPage.scss';

// Interfaces
interface FormData {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  genero: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  acceptNotifications: boolean;
  calle: string;
  codigoPostal: string;
  colonia: string;
  alcaldia: string;
  ciudad: string;
  entidad: string;
  aceptaPrivacidad: boolean;
  aceptaTerminos: boolean;
}

interface FormTouched {
  nombre: boolean;
  primerApellido: boolean;
  segundoApellido: boolean;
  genero: boolean;
  email: boolean;
  confirmEmail: boolean;
  password: boolean;
  confirmPassword: boolean;
  calle: boolean;
  codigoPostal: boolean;
  colonia: boolean;
  alcaldia: boolean;
  ciudad: boolean;
  entidad: boolean;
}

// SepomexColonia interface ahora viene del servicio

// FileUploader configuration
const UPLOADER_CONFIG: FileUploaderConfig = {
  acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
  acceptedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  maxFileSizeMB: 50,
  maxFileNameLength: 60,
  allowMultiple: true,
  allowZip: false,
  required: false,
  validateMagicNumber: true,
  title: 'Sube un documento que acredite tu personalidad legal',
  tooltip: 'Identificación oficial o cualquier documento que acredite la personalidad legal.'
};

// Constantes para validación de contraseña
const VALID_SYMBOLS = '#$%&\'()*+,-./:;<=>?@[\\]^_{|}';
const SYMBOL_REGEX = /[#$%&'()*+,\-./:;<=>?@\[\\\]^_{|}]/;
const LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛãõÃÕçÇñÑ\s'-]+$/;

const RegistroNuevoUsuarioPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFormData: setStoreFormData, updateFormData: updateStoreFormData, reset: resetStore, formData: storedData } = useRegistroUsuarioStore();

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    genero: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    acceptNotifications: false,
    calle: '',
    codigoPostal: '',
    colonia: '',
    alcaldia: '',
    ciudad: '',
    entidad: '',
    aceptaPrivacidad: false,
    aceptaTerminos: false
  });

  // Touched state for validation
  const [touched, setTouched] = useState<FormTouched>({
    nombre: false,
    primerApellido: false,
    segundoApellido: false,
    genero: false,
    email: false,
    confirmEmail: false,
    password: false,
    confirmPassword: false,
    calle: false,
    codigoPostal: false,
    colonia: false,
    alcaldia: false,
    ciudad: false,
    entidad: false
  });

  // UI states (signals en Angular)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isConfirmEmailFocused, setIsConfirmEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // SEPOMEX states
  const [coloniasDisponibles, setColoniasDisponibles] = useState<SepomexColonia[]>([]);
  const [consultandoCP, setConsultandoCP] = useState(false);
  const [codigoPostalNoEncontrado, setCodigoPostalNoEncontrado] = useState(false);
  const [datosAutocargados, setDatosAutocargados] = useState(false);
  const [edicionManualActiva, setEdicionManualActiva] = useState(false);

  // Files state
  const [archivos, setArchivos] = useState<File[]>([]);

  // Debounce ref for CP
  const cpDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Restore data from store on mount
  useEffect(() => {
    if (storedData && Object.keys(storedData).length > 0) {
      console.log('[REGISTRO] Restaurando datos guardados del store');
      setFormData(prev => ({
        ...prev,
        nombre: storedData.nombre || '',
        primerApellido: storedData.primerApellido || '',
        segundoApellido: storedData.segundoApellido || '',
        genero: storedData.genero || '',
        email: storedData.email || '',
        confirmEmail: storedData.confirmEmail || '',
        password: storedData.password || '',
        confirmPassword: storedData.confirmPassword || '',
        acceptNotifications: storedData.acceptNotifications || false,
        calle: storedData.calle || '',
        codigoPostal: storedData.codigoPostal || '',
        colonia: storedData.colonia || '',
        alcaldia: storedData.alcaldia || '',
        ciudad: storedData.ciudad || '',
        entidad: storedData.entidad || '',
        aceptaPrivacidad: storedData.aceptaPrivacidad || false,
        aceptaTerminos: storedData.aceptaTerminos || false
      }));
    }
  }, []);

  // Sync form data to store on changes
  useEffect(() => {
    updateStoreFormData({
      ...formData,
      archivos
    });
  }, [formData, archivos]);

  // Clean up store when navigating away (except to revisar-data or registro-exitoso)
  useEffect(() => {
    return () => {
      const path = location.pathname;
      if (!path.includes('/revisar-data') && !path.includes('/registro-exitoso-usuario')) {
        console.log('[REGISTRO] Saliendo de registro-nuevo-usuario, limpiando store');
        resetStore();
      }
    };
  }, [location.pathname, resetStore]);

  // SEPOMEX lookup on codigoPostal change
  useEffect(() => {
    if (cpDebounceRef.current) {
      clearTimeout(cpDebounceRef.current);
    }

    const cp = formData.codigoPostal;

    // Reset states when CP is incomplete
    if (!cp || cp.length < 5) {
      setCodigoPostalNoEncontrado(false);
      setDatosAutocargados(false);
      setEdicionManualActiva(false);
      if (cp.length === 0) {
        setFormData(prev => ({
          ...prev,
          colonia: '',
          alcaldia: '',
          ciudad: '',
          entidad: ''
        }));
      }
      return;
    }

    // Only query when CP is 5 digits
    if (cp.length === 5 && /^\d{5}$/.test(cp)) {
      cpDebounceRef.current = setTimeout(async () => {
        setConsultandoCP(true);
        setCodigoPostalNoEncontrado(false);
        setDatosAutocargados(false);
        setEdicionManualActiva(false);

        try {
          // Consulta real al servicio SEPOMEX
          const response = await consultarCodigoPostal(cp);

          setConsultandoCP(false);

          if (response && response.colonias && response.colonias.length > 0) {
            // Transformar al formato esperado para el select de colonias
            const coloniasFormateadas: SepomexColonia[] = response.colonias.map(col => ({
              colonia: col.colonia,
              municipio: col.municipio,
              estado: col.estado,
              ciudad: col.ciudad,
              cp: col.cp
            }));

            setColoniasDisponibles(coloniasFormateadas);
            setDatosAutocargados(true);

            // Autocompletar con la primera colonia
            const primera = coloniasFormateadas[0];
            setFormData(prev => ({
              ...prev,
              colonia: primera.colonia,
              ciudad: primera.ciudad || primera.municipio,
              entidad: primera.estado,
              alcaldia: primera.municipio
            }));

            console.log('[REGISTRO] Datos autocargados desde SEPOMEX:', {
              colonias: coloniasFormateadas.length,
              colonia: primera.colonia,
              ciudad: primera.ciudad,
              estado: primera.estado,
              municipio: primera.municipio
            });
          } else {
            // No se encontraron datos
            setCodigoPostalNoEncontrado(true);
            setColoniasDisponibles([]);
            console.log('[REGISTRO] Código postal no encontrado:', cp);
          }
        } catch (error) {
          console.error('[REGISTRO] Error consultando SEPOMEX:', error);
          setConsultandoCP(false);
          setCodigoPostalNoEncontrado(true);
          setColoniasDisponibles([]);
        }
      }, 500); // Debounce de 500ms igual que en Angular
    }

    return () => {
      if (cpDebounceRef.current) {
        clearTimeout(cpDebounceRef.current);
      }
    };
  }, [formData.codigoPostal]);

  // Computed values (equivalent to Angular computed signals)
  const passwordsMatch = useMemo(() => {
    return formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  }, [formData.password, formData.confirmPassword]);

  const showPasswordMismatch = useMemo(() => {
    return formData.confirmPassword.length > 0 && !passwordsMatch;
  }, [formData.confirmPassword, passwordsMatch]);

  const emailsMatch = useMemo(() => {
    return formData.email === formData.confirmEmail && formData.confirmEmail.length > 0;
  }, [formData.email, formData.confirmEmail]);

  const isEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email);
  }, [formData.email]);

  const isConfirmEmailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.confirmEmail);
  }, [formData.confirmEmail]);

  const emailsMatchAndValid = useMemo(() => {
    return emailsMatch && isEmailValid && isConfirmEmailValid;
  }, [emailsMatch, isEmailValid, isConfirmEmailValid]);

  const showEmailMismatch = useMemo(() => {
    return formData.confirmEmail.length > 0 && !emailsMatch;
  }, [formData.confirmEmail, emailsMatch]);

  const passwordRequirements = useMemo(() => ({
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasSymbol: SYMBOL_REGEX.test(formData.password)
  }), [formData.password]);

  const passwordStrength = useMemo(() => {
    return Object.values(passwordRequirements).filter(Boolean).length;
  }, [passwordRequirements]);

  const strengthLevel = useMemo((): 'weak' | 'medium' | 'strong' | 'none' => {
    if (formData.password.length === 0) return 'none';
    if (passwordStrength <= 1) return 'weak';
    if (passwordStrength <= 2) return 'medium';
    return 'strong';
  }, [formData.password, passwordStrength]);

  const isFormValid = useMemo(() => {
    const basicFieldsValid =
      formData.nombre.trim().length > 0 &&
      formData.primerApellido.trim().length > 0 &&
      isEmailValid &&
      isConfirmEmailValid &&
      emailsMatch &&
      formData.password.length >= 8 &&
      passwordsMatch &&
      formData.aceptaPrivacidad &&
      formData.aceptaTerminos;

    if (formData.acceptNotifications) {
      return basicFieldsValid &&
        formData.calle.trim().length >= 5 &&
        formData.codigoPostal.length === 5 &&
        formData.colonia.trim().length >= 5 &&
        formData.alcaldia.trim().length >= 5 &&
        formData.ciudad.trim().length >= 5 &&
        formData.entidad.trim().length >= 5;
    }

    return basicFieldsValid;
  }, [formData, isEmailValid, isConfirmEmailValid, emailsMatch, passwordsMatch]);

  const isFormComplete = useMemo(() => {
    return isFormValid && passwordsMatch && emailsMatch;
  }, [isFormValid, passwordsMatch, emailsMatch]);

  // Handlers
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof FormTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const onlyLetters = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (char.length === 1 && !LETTERS_REGEX.test(char)) {
      e.preventDefault();
    }
  }, []);

  const onPasteLetters = useCallback((e: React.ClipboardEvent<HTMLInputElement>, field: keyof FormData) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text') || '';
    const lettersOnly = pastedText.replace(/[^a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛãõÃÕçÇñÑ\s'-]/g, '').slice(0, 40);
    handleInputChange(field, lettersOnly);
  }, [handleInputChange]);

  const onlyNumbers = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.which || e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  }, []);

  const onPasteNumbers = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData?.getData('text') || '';
    const numbersOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 5);
    handleInputChange('codigoPostal', numbersOnly);
  }, [handleInputChange]);

  const onPasswordInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: 'password' | 'confirmPassword') => {
    let value = e.target.value;

    // Filter invalid characters
    let filteredValue = value.replace(/[^a-zA-Z0-9#$%&'()*+,\-./:;<=>?@\[\\\]^_{|}]/g, '');

    // Ensure only one symbol
    const symbols = filteredValue.match(/[#$%&'()*+,\-./:;<=>?@\[\\\]^_{|}]/g);
    if (symbols && symbols.length > 1) {
      let symbolCount = 0;
      filteredValue = filteredValue.split('').filter(char => {
        const isSymbol = /[#$%&'()*+,\-./:;<=>?@\[\\\]^_{|}]/.test(char);
        if (isSymbol) {
          symbolCount++;
          return symbolCount === 1;
        }
        return true;
      }).join('');
    }

    handleInputChange(field, filteredValue);
  }, [handleInputChange]);

  const togglePasswordVisibility = useCallback((field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  }, []);

  const getStrengthText = useCallback((): string => {
    switch (strengthLevel) {
      case 'weak': return 'Seguridad baja';
      case 'medium': return 'Seguridad media';
      case 'strong': return 'Seguridad alta';
      default: return '';
    }
  }, [strengthLevel]);

  const getBarClass = useCallback((barIndex: number): string => {
    if (passwordStrength < barIndex) return '';
    if (passwordStrength === 1) return 'weak';
    if (passwordStrength === 2 || passwordStrength === 3) return barIndex <= 2 ? 'medium' : '';
    if (passwordStrength === 4) return 'strong';
    return '';
  }, [passwordStrength]);

  const getConfirmEmailMessage = useCallback((): string => {
    if (emailsMatchAndValid) {
      return 'Los correos coinciden';
    }
    if (emailsMatch && (!isEmailValid || !isConfirmEmailValid)) {
      return 'Ingresa un correo electrónico válido';
    }
    return 'Los correos no coinciden';
  }, [emailsMatch, emailsMatchAndValid, isEmailValid, isConfirmEmailValid]);

  const activarEdicionManual = useCallback(() => {
    setEdicionManualActiva(true);
    setCodigoPostalNoEncontrado(false);
  }, []);

  const esCampoReadonly = useCallback(() => {
    return !edicionManualActiva;
  }, [edicionManualActiva]);

  const onFilesChanged = useCallback((files: File[]) => {
    console.log('[REGISTRO] Archivos cambiados:', files.length);
    setArchivos(files);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      nombre: true,
      primerApellido: true,
      segundoApellido: true,
      genero: true,
      email: true,
      confirmEmail: true,
      password: true,
      confirmPassword: true,
      calle: true,
      codigoPostal: true,
      colonia: true,
      alcaldia: true,
      ciudad: true,
      entidad: true
    });

    if (!passwordsMatch) {
      console.error('[ERROR] Las contraseñas no coinciden');
      return;
    }

    if (!emailsMatch) {
      console.error('[ERROR] Los correos no coinciden');
      return;
    }

    if (!isFormValid || isLoading) {
      console.error('[ERROR] Formulario inválido');
      return;
    }

    setIsLoading(true);

    try {
      // Obtener fecha actual en formato ISO
      const now = new Date();
      const fechaActual = now.toISOString();

      // Preparar datos para el servicio (estructura igual a Angular)
      const registroData: RegistroUsuarioRequest = {
        usuario: {
          correoValido: true,
          mailPersona: formData.email.trim(),
          contraseniaUsuario: formData.password,
          fechaAltaUser: fechaActual,
          fechaHora: fechaActual,
          usuarioActivo: true
        },
        persona: {
          direccionPersona: formData.acceptNotifications
            ? `${formData.calle.trim()}, ${formData.colonia.trim()}, ${formData.ciudad.trim()}, ${formData.entidad.trim()}`
            : '',
          tipoPersona: 1, // Persona fisica
          usuarioPersona: null,
          rfcPersona: '',
          curpPersona: '',
          telefonoPersona: '',
          nombrePersona: formData.nombre.trim(),
          apellidoPaternoPersona: formData.primerApellido.trim(),
          apellidoMaternoPersona: formData.segundoApellido.trim(),
          generoPersona: formData.genero || '',
          fechaAltaPersona: fechaActual,
          userActPersona: formData.email.trim(),
          callePersona: formData.calle.trim(),
          codigoPostal: formData.codigoPostal,
          colonia: formData.colonia.trim(),
          ciudadPersona: formData.ciudad.trim() || null,
          estadoPersona: formData.entidad.trim() || null,
          numIntPersona: null,
          numExtPersona: null,
          fechaActPersona: fechaActual
        }
      };

      console.log('[REGISTRO] Enviando datos al servidor...', registroData);

      // Llamar al servicio real
      const response = await usuariosService.registrar(registroData);

      console.log('[REGISTRO] Respuesta del servidor:', response);

      if (response.success) {
        console.log('[SUCCESS] Registro exitoso, usuarioId:', response.usuarioId);

        // Save to store before navigating
        setStoreFormData({
          ...formData,
          archivos
        });

        navigate('/registro-exitoso-usuario');
      } else {
        console.error('[ERROR] Error en el registro:', response.message);
        // TODO: Mostrar mensaje de error al usuario
      }
    } catch (error) {
      console.error('[ERROR] Error al registrar usuario:', error);
      // TODO: Mostrar mensaje de error al usuario
    } finally {
      setIsLoading(false);
    }
  }, [formData, archivos, passwordsMatch, emailsMatch, isFormValid, isLoading, navigate, setStoreFormData]);

  const saveAndNavigateToReview = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isFormComplete) return;

    setStoreFormData({
      ...formData,
      archivos
    });

    navigate('/revisar-data');
  }, [formData, archivos, isFormComplete, navigate, setStoreFormData]);

  return (
    <section id="main-content" className="registro-usuario-container" role="main" tabIndex={-1}>
      <div className="registro-usuario-content">

        {/* Título principal */}
        <h1 className="main-title">Ingresar datos de registro</h1>

        {/* Subtítulo */}
        <p className="subtitle">Llena el siguiente formulario para registrar tu cuenta</p>

        {/* Sección: Datos personales y de la cuenta */}
        <div className="section-header">
          <h2 className="section-title">Datos personales y de la cuenta</h2>
        </div>

        <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

        <h3 className="subsection-title">Anota los datos personales del (a) titular de la cuenta</h3>

        {/* Formulario de datos personales */}
        <form className="registro-form" onSubmit={handleSubmit} aria-label="Formulario de registro de usuario" noValidate>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">Nombre(s) <span className="text-danger" aria-label="campo obligatorio">*</span></label>
                <input
                  type="text"
                  id="nombre"
                  className="form-control"
                  placeholder="Nombre(s)"
                  maxLength={40}
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  onKeyPress={onlyLetters}
                  onPaste={(e) => onPasteLetters(e, 'nombre')}
                  onBlur={() => handleBlur('nombre')}
                  aria-required="true"
                  aria-invalid={touched.nombre && !formData.nombre.trim()}
                />
                {touched.nombre && !formData.nombre.trim() && (
                  <span className="error-message" role="alert" aria-live="polite">El nombre es obligatorio</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="primer-apellido" className="form-label">Primer apellido <span className="text-danger" aria-label="campo obligatorio">*</span></label>
                <input
                  type="text"
                  id="primer-apellido"
                  className="form-control"
                  placeholder="Apellido"
                  maxLength={40}
                  value={formData.primerApellido}
                  onChange={(e) => handleInputChange('primerApellido', e.target.value)}
                  onKeyPress={onlyLetters}
                  onPaste={(e) => onPasteLetters(e, 'primerApellido')}
                  onBlur={() => handleBlur('primerApellido')}
                  aria-required="true"
                  aria-invalid={touched.primerApellido && !formData.primerApellido.trim()}
                />
                {touched.primerApellido && !formData.primerApellido.trim() && (
                  <span className="error-message" role="alert" aria-live="polite">El primer apellido es obligatorio</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="segundo-apellido" className="form-label">Segundo apellido</label>
                <input
                  type="text"
                  id="segundo-apellido"
                  className="form-control"
                  placeholder="Apellido"
                  maxLength={40}
                  value={formData.segundoApellido}
                  onChange={(e) => handleInputChange('segundoApellido', e.target.value)}
                  onKeyPress={onlyLetters}
                  onPaste={(e) => onPasteLetters(e, 'segundoApellido')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="genero" className="form-label">Género</label>
                <select
                  id="genero"
                  className="form-control"
                  value={formData.genero}
                  onChange={(e) => handleInputChange('genero', e.target.value)}
                >
                  <option value="">Selecciona</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Correo y contraseña */}
          <h3 className="subsection-title mt-4">Ingresa tu correo electrónico y crea una contraseña</h3>

          <div className="cuenta-section">
            <h4 className="cuenta-title">Crea tu Cuenta Única de Acceso</h4>

            <div className="form-row align-start cuenta-fields-wrapper">
              <div className="form-group">
                <label htmlFor="correo" className="form-label">Correo electrónico <span className="text-danger">*</span></label>
                <input
                  type="email"
                  id="correo"
                  name="username"
                  className="form-control"
                  placeholder="ejemplo@email.com"
                  autoComplete="username"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => { setIsEmailFocused(false); handleBlur('email'); }}
                />
                {formData.email && !isEmailValid && (isEmailFocused || touched.email) && (
                  <div className="password-requirements">
                    <div className="requirement-item error">
                      <i className="bi bi-x-circle-fill"></i>
                      <span>Formato de correo electrónico no válido</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmar-correo" className="form-label">Confirmar correo electrónico <span className="text-danger">*</span></label>
                <input
                  type="email"
                  id="confirmar-correo"
                  className="form-control"
                  placeholder="ejemplo@email.com"
                  value={formData.confirmEmail}
                  onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                  onFocus={() => setIsConfirmEmailFocused(true)}
                  onBlur={() => { setIsConfirmEmailFocused(false); handleBlur('confirmEmail'); }}
                />
                {formData.confirmEmail && (isConfirmEmailFocused || !emailsMatchAndValid) && (
                  <div className="password-requirements">
                    <div className={`requirement-item ${emailsMatchAndValid ? 'fulfilled' : 'error'}`}>
                      <i className={emailsMatchAndValid ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'}></i>
                      <span>{getConfirmEmailMessage()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contrasena" className="form-label">
                  <i className="bi bi-lock-fill"></i> Contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-icon-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="new-password"
                    className="form-control"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={(e) => onPasswordInput(e, 'password')}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => { if (passwordStrength === 4) setIsPasswordFocused(false); handleBlur('password'); }}
                    autoComplete="new-password"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className="btn-toggle-visibility"
                    onClick={() => togglePasswordVisibility('password')}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <i className={showPassword ? 'bi bi-eye' : 'bi bi-eye-slash'} aria-hidden="true"></i>
                  </button>
                </div>

                {formData.password && (isPasswordFocused || passwordStrength < 4) && (
                  <div className="password-strength-bars">
                    <div className={`strength-bar ${passwordStrength >= 1 ? 'active' : ''} ${getBarClass(1)}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 2 ? 'active' : ''} ${getBarClass(2)}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 3 ? 'active' : ''} ${getBarClass(3)}`}></div>
                  </div>
                )}

                {(isPasswordFocused || (formData.password && passwordStrength < 4)) && (
                  <div className="password-requirements">
                    {formData.password && (
                      <div className="password-strength-text">
                        <span className={strengthLevel}>{getStrengthText()}</span>
                      </div>
                    )}
                    <div className={`requirement-item ${passwordRequirements.minLength ? 'fulfilled' : ''}`}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`requirement-item ${passwordRequirements.hasNumber ? 'fulfilled' : ''}`}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Al menos un número</span>
                    </div>
                    <div className={`requirement-item ${passwordRequirements.hasUpperCase ? 'fulfilled' : ''}`}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Al menos una mayúscula</span>
                    </div>
                    <div className={`requirement-item ${passwordRequirements.hasSymbol ? 'fulfilled' : ''}`}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Un símbolo (# $ % & ' ( ) * + , - . / : ; &lt; = &gt; ? @ [ \ ] ^ _ {'{'} | {'}'})</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmar-contrasena" className="form-label">
                  <i className="bi bi-lock-fill"></i> Confirmar contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-icon-group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmar-contrasena"
                    className="form-control"
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => onPasswordInput(e, 'confirmPassword')}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => { if (passwordsMatch) setIsConfirmPasswordFocused(false); handleBlur('confirmPassword'); }}
                  />
                  <button
                    type="button"
                    className="btn-toggle-visibility"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    tabIndex={-1}
                  >
                    <i className={showConfirmPassword ? 'bi bi-eye' : 'bi bi-eye-slash'}></i>
                  </button>
                </div>

                {formData.confirmPassword && (isConfirmPasswordFocused || !passwordsMatch) && (
                  <div className="password-requirements">
                    <div className={`requirement-item ${passwordsMatch ? 'fulfilled' : 'error'}`}>
                      <i className={passwordsMatch ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'}></i>
                      <span>{passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notificación electrónica */}
          <div className="notification-section">
            <h4 className="notification-title">Acepto recibir notificación electrónica</h4>
            <div className="toggle-container">
              <span className="toggle-label">Sí</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.acceptNotifications}
                  onChange={(e) => {
                    handleInputChange('acceptNotifications', e.target.checked);
                    if (!e.target.checked) {
                      // Clear address fields when turning off
                      setFormData(prev => ({
                        ...prev,
                        calle: '',
                        codigoPostal: '',
                        colonia: '',
                        alcaldia: '',
                        ciudad: '',
                        entidad: ''
                      }));
                      setCodigoPostalNoEncontrado(false);
                      setDatosAutocargados(false);
                      setEdicionManualActiva(false);
                      setColoniasDisponibles([]);
                    }
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">No</span>
            </div>
          </div>

          {/* Domicilio de notificaciones */}
          {formData.acceptNotifications && (
            <div className="domicilio-section">
              <h3 className="domicilio-title">Anota los datos del domicilio al que llegarán las notificaciones</h3>

              <div className="domicilio-card">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="calle" className="form-label">Calle y número <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="calle"
                      className="form-control"
                      placeholder="Calle, número exterior e interior"
                      maxLength={40}
                      value={formData.calle}
                      onChange={(e) => handleInputChange('calle', e.target.value)}
                      onBlur={() => handleBlur('calle')}
                    />
                    {touched.calle && !formData.calle.trim() && (
                      <span className="error-message" role="alert">La calle y número es obligatoria</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="codigo-postal" className="form-label">
                      Código postal <span className="text-danger">*</span>
                    </label>
                    <div className="input-with-loader">
                      <input
                        type="text"
                        id="codigo-postal"
                        className="form-control"
                        placeholder="00000"
                        maxLength={5}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={formData.codigoPostal}
                        onChange={(e) => handleInputChange('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                        onKeyPress={onlyNumbers}
                        onPaste={onPasteNumbers}
                        onBlur={() => handleBlur('codigoPostal')}
                      />
                      {consultandoCP && (
                        <div className="cp-loader">
                          <div className="spinner"></div>
                          <span>Consultando...</span>
                        </div>
                      )}
                    </div>

                    {codigoPostalNoEncontrado && (
                      <div className="cp-not-found-container">
                        <div className="cp-not-found-message text-danger">
                          <i className="bi bi-exclamation-circle"></i>
                          <span>No se encontró información para este código postal</span>
                        </div>
                        <button type="button" className="btn-edicion-manual" onClick={activarEdicionManual}>
                          <i className="bi bi-pencil-square"></i>
                          <span>Ingresar datos manualmente</span>
                        </button>
                      </div>
                    )}

                    {datosAutocargados && !edicionManualActiva && (
                      <div className="cp-autocargado-container">
                        <div className="cp-autocargado-message">
                          <i className="bi bi-check-circle"></i>
                          <span>Los datos se llenaron automáticamente. ¿Alguno es incorrecto?</span>
                        </div>
                        <button type="button" className="btn-edicion-manual btn-edicion-small" onClick={activarEdicionManual}>
                          <i className="bi bi-pencil"></i>
                          <span>Corregir datos</span>
                        </button>
                      </div>
                    )}

                    {edicionManualActiva && (
                      <div className="edicion-manual-activa">
                        <i className="bi bi-info-circle"></i>
                        <span>Ahora puedes modificar los campos siguientes</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="colonia" className="form-label">
                      Colonia <span className="text-danger">*</span>
                      {edicionManualActiva && <i className="bi bi-pencil edit-icon" title="Campo editable"></i>}
                    </label>
                    {/* Si hay colonias disponibles y no está en modo edición manual, mostrar select */}
                    {coloniasDisponibles.length > 1 && !edicionManualActiva ? (
                      <select
                        id="colonia"
                        className="form-control"
                        value={formData.colonia}
                        onChange={(e) => handleInputChange('colonia', e.target.value)}
                        onBlur={() => handleBlur('colonia')}
                      >
                        {coloniasDisponibles.map((col, idx) => (
                          <option key={idx} value={col.colonia}>{col.colonia}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        id="colonia"
                        className={`form-control ${edicionManualActiva ? 'editable' : ''}`}
                        placeholder={edicionManualActiva ? 'Escribe el nombre de la colonia' : 'Ingresa un código postal'}
                        readOnly={esCampoReadonly() && coloniasDisponibles.length <= 1}
                        maxLength={40}
                        value={formData.colonia}
                        onChange={(e) => handleInputChange('colonia', e.target.value)}
                        onBlur={() => handleBlur('colonia')}
                      />
                    )}
                    {touched.colonia && !formData.colonia.trim() && (
                      <span className="error-message" role="alert">La colonia es obligatoria</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="alcaldia" className="form-label">
                      Alcaldía o municipio <span className="text-danger">*</span>
                      {edicionManualActiva && <i className="bi bi-pencil edit-icon" title="Campo editable"></i>}
                    </label>
                    <input
                      type="text"
                      id="alcaldia"
                      className={`form-control ${edicionManualActiva ? 'editable' : ''}`}
                      placeholder={edicionManualActiva ? 'Escribe la alcaldía o municipio' : 'Ingresa un código postal'}
                      readOnly={esCampoReadonly()}
                      maxLength={40}
                      value={formData.alcaldia}
                      onChange={(e) => handleInputChange('alcaldia', e.target.value)}
                      onBlur={() => handleBlur('alcaldia')}
                    />
                    {touched.alcaldia && !formData.alcaldia.trim() && (
                      <span className="error-message" role="alert">La alcaldía o municipio es obligatoria</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="ciudad" className="form-label">
                      Ciudad <span className="text-danger">*</span>
                      {edicionManualActiva && <i className="bi bi-pencil edit-icon" title="Campo editable"></i>}
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      className={`form-control ${edicionManualActiva ? 'editable' : ''}`}
                      placeholder={edicionManualActiva ? 'Escribe el nombre de la ciudad' : 'Ingresa un código postal'}
                      readOnly={esCampoReadonly()}
                      maxLength={40}
                      value={formData.ciudad}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      onBlur={() => handleBlur('ciudad')}
                    />
                    {touched.ciudad && !formData.ciudad.trim() && (
                      <span className="error-message" role="alert">La ciudad es obligatoria</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="entidad" className="form-label">
                      Entidad federativa <span className="text-danger">*</span>
                      {edicionManualActiva && <i className="bi bi-pencil edit-icon" title="Campo editable"></i>}
                    </label>
                    <input
                      type="text"
                      id="entidad"
                      className={`form-control ${edicionManualActiva ? 'editable' : ''}`}
                      placeholder={edicionManualActiva ? 'Escribe la entidad federativa' : 'Ingresa un código postal'}
                      readOnly={esCampoReadonly()}
                      maxLength={40}
                      value={formData.entidad}
                      onChange={(e) => handleInputChange('entidad', e.target.value)}
                      onBlur={() => handleBlur('entidad')}
                    />
                    {touched.entidad && !formData.entidad.trim() && (
                      <span className="error-message" role="alert">La entidad federativa es obligatoria</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subir archivo */}
          <div className="upload-section">
            <FileUploader
              config={UPLOADER_CONFIG}
              onFilesChange={onFilesChanged}
            />
          </div>

          {/* Confirmación */}
          <div className="confirmation-section">
            <h4 className="confirmation-title">Si deseas registrarte, confirma lo siguiente:</h4>

            <div className="form-check">
              <input
                type="checkbox"
                id="privacidad"
                checked={formData.aceptaPrivacidad}
                onChange={(e) => handleInputChange('aceptaPrivacidad', e.target.checked)}
              />
              <label htmlFor="privacidad">He leído el aviso de Privacidad <span className="text-danger">*</span></label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="terminos"
                checked={formData.aceptaTerminos}
                onChange={(e) => handleInputChange('aceptaTerminos', e.target.checked)}
              />
              <label htmlFor="terminos">Acepto los términos y condiciones <span className="text-danger">*</span></label>
            </div>

            {(!formData.aceptaPrivacidad || !formData.aceptaTerminos) && (
              <div className="error-message mt-3 text-center" role="alert" style={{ display: 'block' }}>
                Debes aceptar el aviso de privacidad y los términos y condiciones
              </div>
            )}
          </div>

          {/* Separador */}
          <hr className="separator" />

          {/* Botón de registro */}
          <div className="action-button">
            <button
              type="submit"
              className="btn-registrar"
              disabled={!isFormValid || !passwordsMatch || !emailsMatch || isLoading}
            >
              {isLoading ? (
                <span className="loader-inline">
                  <span className="spinner"></span>
                  Registrando...
                </span>
              ) : (
                'Registrar'
              )}
            </button>
          </div>
        </form>

        {/* Link temporal para debugging */}
        <div className="debug-link">
          <a
            href="#"
            className={!isFormComplete ? 'disabled' : ''}
            aria-disabled={!isFormComplete}
            tabIndex={isFormComplete ? 0 : -1}
            onClick={isFormComplete ? saveAndNavigateToReview : (e) => e.preventDefault()}
          >
            debug
          </a>
        </div>

      </div>
    </section>
  );
};

export default RegistroNuevoUsuarioPage;
