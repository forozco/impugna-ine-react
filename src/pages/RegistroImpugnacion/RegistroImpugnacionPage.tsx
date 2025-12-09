/**
 * Pagina de Registro de Impugnacion - Wizard de 6 pasos
 * Equivalente a: impugnacion-wizard.component.ts de Angular
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useStepperStore } from '../../stores/stepperStore';
import Stepper from '../../components/shared/stepper/Stepper';
import FileUploader from '../../components/shared/FileUploader/FileUploader';
import type { FileUploaderConfig } from '../../components/shared/FileUploader/FileUploader';
import './RegistroImpugnacionPage.scss';

// Mapeo de nombres de paso a indices (igual que Angular)
const STEP_NAMES = ['actores', 'representante', 'personalidad', 'autoridad', 'impugnacion', 'evidencia'];

// FileUploader configurations for each step (igual que Angular)
const PERSONALIDAD_UPLOADER_CONFIG: FileUploaderConfig = {
  acceptedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
  acceptedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  maxFileSizeMB: 50,
  maxFiles: 10,
  maxFileNameLength: 240,
  allowMultiple: true,
  allowZip: false,
  required: false,
  validateMagicNumber: true,
  title: 'Acreditación de personalidad',
  subtitle: 'PDF, JPG, PNG (máx 50MB por archivo)',
  tooltip: 'Sube los documentos que acrediten tu personalidad como representante'
};

const DEMANDA_UPLOADER_CONFIG: FileUploaderConfig = {
  acceptedFileTypes: ['.pdf'],
  acceptedMimeTypes: ['application/pdf'],
  maxFileSizeMB: 200,
  maxFiles: 1,
  maxFileNameLength: 240,
  allowMultiple: false,
  allowZip: false,
  required: true,
  validateMagicNumber: true,
  title: 'Demanda de impugnación',
  subtitle: 'PDF (máx 200MB)',
  tooltip: 'Sube la demanda de la impugnación en un solo archivo PDF'
};

const EVIDENCIA_UPLOADER_CONFIG: FileUploaderConfig = {
  acceptedFileTypes: ['.jpg', '.jpeg', '.png', '.bmp', '.pdf', '.mp4', '.mov', '.avi', '.mp3', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.txt'],
  acceptedMimeTypes: [
    'image/jpeg', 'image/png', 'image/bmp',
    'application/pdf',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'audio/mpeg',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-zip-compressed',
    'text/plain'
  ],
  maxFileSizeMB: 1024, // 1GB
  maxFiles: 50,
  maxFileNameLength: 240,
  allowMultiple: true,
  allowZip: true,
  required: false,
  validateMagicNumber: true,
  title: 'Pruebas y anexos',
  subtitle: 'JPG, PNG, BMP, PDF, MP4, MOV, AVI, MP3, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT (máx 1GB por archivo)',
  tooltip: 'Adjunta las pruebas y documentos que soporten tu impugnación'
};

// Step configurations (igual que Angular)
const STEP_CONFIGS = [
  { id: 'actores', label: 'Actores', description: 'Persona o representante que registra la impugnación', required: true },
  { id: 'representante', label: 'Representante', description: 'Datos del representante', required: true },
  { id: 'personalidad', label: 'Personalidad', description: 'Acreditación de la personalidad', required: false },
  { id: 'autoridad', label: 'Autoridad', description: 'Autoridad responsable', required: true },
  { id: 'impugnacion', label: 'Impugnación', description: 'Hechos y agravios', required: true },
  { id: 'evidencia', label: 'Evidencia', description: 'Pruebas y anexos', required: false },
];

// Interfaz para representantes
interface Representante {
  nombre: string;
  calidad: string;
}

const RegistroImpugnacionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    currentStep,
    setCurrentStep,
    reset,
    setStepConfigs,
    markStepAsValid,
    updateFormData
  } = useStepperStore();

  // Initialize step configs on mount
  useEffect(() => {
    setStepConfigs(STEP_CONFIGS);
  }, [setStepConfigs]);

  // Sincronizar paso desde la URL al cargar (igual que Angular syncStepFromUrl)
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastSegment = pathParts[pathParts.length - 1];
    const stepIndex = STEP_NAMES.indexOf(lastSegment);

    if (stepIndex >= 0 && stepIndex !== currentStep) {
      setCurrentStep(stepIndex);
    }
  }, [location.pathname, currentStep, setCurrentStep]);

  // Navegar a la URL del paso (igual que Angular navigateToStep)
  const navigateToStep = useCallback((stepIndex: number) => {
    const stepName = STEP_NAMES[stepIndex] || 'actores';
    const queryString = searchParams.toString();
    const newPath = `/registro-impugnacion/${stepName}${queryString ? `?${queryString}` : ''}`;
    navigate(newPath, { replace: false });
  }, [navigate, searchParams]);

  // Get query params
  const tipo = searchParams.get('tipo') || 'registro';
  const expediente = searchParams.get('expediente');
  const isCoadyuvante = tipo === 'coadyuvante';
  const isAmpliacion = tipo === 'ampliacion';

  // Track previous step for back navigation
  const [previousStep, setPreviousStep] = useState<number | null>(null);

  // Step 0: Actores - Selection between Titular or Representante
  const [, setSelectedActor] = useState<'titular' | 'representantes' | null>(null);

  // Step 1: Representante data (igual que Angular)
  const [nombreTitular, setNombreTitular] = useState('');
  const [representantes, setRepresentantes] = useState<Representante[]>([{ nombre: '', calidad: '' }]);

  // Step 3: Autoridad data
  const [autoridadData, setAutoridadData] = useState({
    autoridadResponsable: '',
    subopcion: '',
    estado: '',
    distrito: '',
    descripcion: '',
  });
  const [autoridadesAgregadas, setAutoridadesAgregadas] = useState<typeof autoridadData[]>([]);

  // Step 4: Impugnacion data
  const [impugnacionData, setImpugnacionData] = useState({
    descripcion: '',
  });

  // File upload states for each step (storing actual File objects)
  const [personalidadFiles, setPersonalidadFiles] = useState<File[]>([]);
  const [demandaFiles, setDemandaFiles] = useState<File[]>([]);
  const [evidenciaFiles, setEvidenciaFiles] = useState<File[]>([]);

  // Validation states for uploaders
  const [isDemandaValid, setIsDemandaValid] = useState(false);

  // Get wizard title based on tipo (igual que Angular formService.wizardTitle())
  const getWizardTitle = () => {
    if (isAmpliacion) return 'Registrar una ampliación de demanda';
    if (isCoadyuvante) return 'Registrar tercero interesado-Coadyuvante';
    return 'Registrar una nueva impugnación';
  };

  // Step 0: Navigate to Titular flow
  const navigateToTitular = () => {
    setSelectedActor('titular');
    setPreviousStep(0);
    markStepAsValid(0, true);
    // Titular salta directamente a step 3 (Autoridad)
    setCurrentStep(3);
    navigateToStep(3);
  };

  // Step 0: Navigate to Representante flow
  const navigateToRepresentante = () => {
    setSelectedActor('representantes');
    setPreviousStep(0);
    markStepAsValid(0, true);
    // Representante va a step 1
    setCurrentStep(1);
    navigateToStep(1);
  };

  // Step 0: Handle back button
  const handleBackFromStep0 = () => {
    reset();
    navigate('/registro');
  };

  // Step 1: Add representante
  const addRepresentante = () => {
    setRepresentantes([...representantes, { nombre: '', calidad: '' }]);
  };

  // Step 1: Remove representante
  const removeRepresentante = (index: number) => {
    if (representantes.length > 1) {
      setRepresentantes(representantes.filter((_, i) => i !== index));
    }
  };

  // Step 1: Update representante
  const updateRepresentante = (index: number, field: 'nombre' | 'calidad', value: string) => {
    const updated = [...representantes];
    updated[index][field] = value;
    setRepresentantes(updated);
  };

  // Validate Step 1
  const isStep1Valid = useCallback(() => {
    if (!nombreTitular.trim()) return false;
    return representantes.every(rep => rep.nombre.trim() && rep.calidad.trim());
  }, [nombreTitular, representantes]);

  // Update step 1 validation when data changes
  useEffect(() => {
    if (currentStep === 1) {
      markStepAsValid(1, isStep1Valid());
    }
  }, [nombreTitular, representantes, currentStep, isStep1Valid, markStepAsValid]);


  // Step 3: Eliminar autoridad
  const eliminarAutoridad = (index: number) => {
    setAutoridadesAgregadas(autoridadesAgregadas.filter((_, i) => i !== index));
  };

  // Validate Step 3
  const isStep3Valid = useCallback(() => {
    // Debe haber al menos una autoridad agregada con descripción
    return autoridadesAgregadas.length > 0 &&
           autoridadesAgregadas.every(a => a.descripcion && a.descripcion.trim().length > 0);
  }, [autoridadesAgregadas]);

  // Update step 3 validation when data changes
  useEffect(() => {
    if (currentStep === 3) {
      markStepAsValid(3, isStep3Valid());
    }
  }, [autoridadesAgregadas, currentStep, isStep3Valid, markStepAsValid]);

  // Validate Step 4
  const isStep4Valid = useCallback(() => {
    return impugnacionData.descripcion.trim().length >= 10;
  }, [impugnacionData.descripcion]);

  // Update step 4 validation when data changes
  useEffect(() => {
    if (currentStep === 4) {
      markStepAsValid(4, isStep4Valid());
    }
  }, [impugnacionData.descripcion, currentStep, isStep4Valid, markStepAsValid]);

  const handleNext = () => {
    if (currentStep === 1) {
      // Save step 1 data
      updateFormData({
        step1: {
          option: 'representantes',
          nombreTitular,
          representantes
        }
      });
      setCurrentStep(2);
      navigateToStep(2);
    } else if (currentStep === 2) {
      // Step 2 is optional, just move forward
      setCurrentStep(3);
      navigateToStep(3);
    } else if (currentStep === 3) {
      // Save step 3 data
      updateFormData({
        step3: {
          autoridadesAgregadas
        }
      });
      setCurrentStep(4);
      navigateToStep(4);
    } else if (currentStep === 4) {
      // Save step 4 data
      updateFormData({
        step4: {
          descripcion: impugnacionData.descripcion,
          archivos: [] // Archivos se agregarán cuando se implemente el uploader
        }
      });
      setCurrentStep(5);
      navigateToStep(5);
    }
  };

  const handlePrev = () => {
    if (currentStep === 3 && previousStep === 0) {
      // If we came from step 0 (Titular flow), go back to step 0
      setPreviousStep(null);
      setCurrentStep(0);
      navigateToStep(0);
    } else if (currentStep === 1) {
      // From step 1, go back to step 0
      setCurrentStep(0);
      navigateToStep(0);
    } else {
      // Normal flow
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigateToStep(prevStep);
    }
  };

  const handleFinish = () => {
    // Navigate to revision page
    navigate('/revision-impugnacion');
  };

  // Only letters filter (igual que Angular)
  const onlyLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const allowedPattern = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛãõÃÕçÇñÑ\s'\-]$/;
    if (char.length === 1 && !allowedPattern.test(char)) {
      e.preventDefault();
    }
  };

  // Handle keyboard navigation for radio cards (igual que Angular)
  const onRadioCardKeyDown = (e: React.KeyboardEvent, option: 'titular' | 'representante') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (option === 'titular') {
        navigateToTitular();
      } else {
        navigateToRepresentante();
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-card">
            <div className="mb-3">
              <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

              <label className="form-label fw-bold step-main-label">
                {isAmpliacion
                  ? <>Elige al actor que va a registrar una ampliación de demanda<span className="text-danger">*</span></>
                  : isCoadyuvante
                    ? 'Elige el tipo de persona que registra la tercería'
                    : 'Elige el tipo de persona que registra la impugnación'
                }
              </label>

              <div className="radio-group">
                {/* Titular */}
                <div
                  className="radio-card"
                  onClick={navigateToTitular}
                  onKeyDown={(e) => onRadioCardKeyDown(e, 'titular')}
                  tabIndex={0}
                  role="radio"
                  aria-checked={false}
                  aria-label={isCoadyuvante ? 'Titular del registro' : 'Titular (Agraviado)'}
                >
                  <label className="d-flex align-items-center gap-2 w-100" style={{ cursor: 'pointer' }}>
                    <input type="radio" className="radio-custom" name="option" value="titular" tabIndex={-1} readOnly />
                    <span className="radio-label">
                      {isCoadyuvante ? 'Titular del registro' : 'Titular (Agraviado)'}
                    </span>
                  </label>
                </div>

                {/* Representante */}
                <div
                  className="radio-card"
                  onClick={navigateToRepresentante}
                  onKeyDown={(e) => onRadioCardKeyDown(e, 'representante')}
                  tabIndex={0}
                  role="radio"
                  aria-checked={false}
                  aria-label="Representante(s)"
                >
                  <label className="d-flex align-items-center gap-2 w-100" style={{ cursor: 'pointer' }}>
                    <input type="radio" className="radio-custom" name="option" value="representantes" tabIndex={-1} readOnly />
                    <span className="radio-label">Representante(s)</span>
                  </label>
                </div>
              </div>
            </div>

            <hr className="stepper-separator" />

            <div className="action-buttons">
              <button type="button" className="btn btn-retroceder" onClick={handleBackFromStep0}>
                Retroceder
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-card">
            <div className="mb-3">
              <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>
              <label className="form-label fw-bold step-main-label">
                Elige el tipo de persona que registra la impugnación
              </label>

              <div className="radio-group">
                <div className="radio-card selected">
                  <label className="d-flex align-items-center gap-2 w-100" style={{ cursor: 'pointer' }}>
                    <input type="radio" className="radio-custom" name="option" value="representantes" checked readOnly tabIndex={-1} />
                    <span className="radio-label d-flex align-items-center gap-2">
                      Representante(s)
                      <span className="tooltip-icon-custom" tabIndex={0} role="button" aria-label="Información sobre representantes">
                        <span className="icon-text">i</span>
                        <span className="tooltip-text">Asesores jurídicos, abogados o despachos, etc.</span>
                      </span>
                    </span>
                  </label>

                  <div className="form-collapse open">
                    {/* Nombre del titular */}
                    <div className="row g-3 mb-3">
                      <div className="col-lg-6">
                        <label className="form-label">Nombre completo del titular<span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          value={nombreTitular}
                          onChange={(e) => setNombreTitular(e.target.value)}
                          onKeyPress={onlyLetters}
                          placeholder="Nombre (s)"
                          maxLength={40}
                        />
                        {!nombreTitular.trim() && (
                          <div className="invalid-feedback d-block">
                            Este campo es obligatorio
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Representantes dinámicos */}
                    {representantes.map((rep, index) => (
                      <div key={index} className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Nombre completo del representante<span className="text-danger">*</span></label>
                          <input
                            type="text"
                            className="form-control"
                            value={rep.nombre}
                            onChange={(e) => updateRepresentante(index, 'nombre', e.target.value)}
                            onKeyPress={onlyLetters}
                            placeholder="Nombre, primer y segundo apellido"
                            maxLength={40}
                          />
                          {!rep.nombre.trim() && (
                            <div className="invalid-feedback d-block">
                              Este campo es obligatorio
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Calidad que ostenta<span className="text-danger">*</span></label>
                          <div className="d-flex gap-1">
                            <input
                              type="text"
                              className="form-control"
                              value={rep.calidad}
                              onChange={(e) => updateRepresentante(index, 'calidad', e.target.value)}
                              placeholder="Escribe el tipo de representación"
                              maxLength={40}
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                className="btn btn-outline-secondary square-btn"
                                onClick={() => removeRepresentante(index)}
                                aria-label="Eliminar representante"
                              >
                                –
                              </button>
                            )}
                            {index === 0 && <div className="square-btn-spacer"></div>}
                            <button
                              type="button"
                              className="btn btn-outline-secondary square-btn"
                              onClick={addRepresentante}
                              aria-label="Agregar otro representante"
                            >
                              +
                            </button>
                          </div>
                          {!rep.calidad.trim() && (
                            <div className="invalid-feedback d-block">
                              Este campo es obligatorio
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr className="stepper-separator" />

            <div className="action-buttons">
              <button type="button" className="btn btn-retroceder" onClick={handlePrev}>
                Retroceder
              </button>
              <button
                type="button"
                className="btn btn-continuar"
                onClick={handleNext}
                disabled={!isStep1Valid()}
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-card">
            <h5>Acreditación de personalidad</h5>
            <p className="step-description">Sube los documentos que acrediten tu personalidad como representante (opcional)</p>

            <FileUploader
              config={PERSONALIDAD_UPLOADER_CONFIG}
              onFilesChange={setPersonalidadFiles}
            />

            <hr className="stepper-separator" />

            <div className="action-buttons">
              <button type="button" className="btn btn-retroceder" onClick={handlePrev}>
                Retroceder
              </button>
              <button type="button" className="btn btn-continuar" onClick={handleNext}>
                Continuar
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-card">
            <h5>Autoridad responsable</h5>
            <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

            <div className="form-group full-width mb-3">
              <label htmlFor="autoridadResponsable">Autoridad responsable<span className="text-danger">*</span></label>
              <select
                id="autoridadResponsable"
                className="form-control form-select"
                value={autoridadData.autoridadResponsable}
                onChange={(e) => setAutoridadData({ ...autoridadData, autoridadResponsable: e.target.value, subopcion: '', estado: '', distrito: '' })}
              >
                <option value="">Selecciona una autoridad</option>
                <option value="Áreas centrales del INE">Áreas centrales del INE</option>
                <option value="Juntas Locales">Juntas Locales</option>
                <option value="Juntas Distritales">Juntas Distritales</option>
              </select>
            </div>

            {/* Subopción para Áreas centrales o Juntas Locales */}
            {(autoridadData.autoridadResponsable === 'Áreas centrales del INE' ||
              autoridadData.autoridadResponsable === 'Juntas Locales') && (
              <div className="form-group full-width mb-3">
                <label htmlFor="subopcion">
                  {autoridadData.autoridadResponsable === 'Áreas centrales del INE'
                    ? 'Área central'
                    : 'Junta Local'}
                  <span className="text-danger">*</span>
                </label>
                <select
                  id="subopcion"
                  className="form-control form-select"
                  value={autoridadData.subopcion}
                  onChange={(e) => {
                    setAutoridadData({ ...autoridadData, subopcion: e.target.value });
                    // Auto-agregar cuando se selecciona
                    if (e.target.value) {
                      const newAutoridad = {
                        ...autoridadData,
                        subopcion: e.target.value,
                        descripcion: ''
                      };
                      setAutoridadesAgregadas([...autoridadesAgregadas, newAutoridad]);
                      setAutoridadData({
                        ...autoridadData,
                        subopcion: ''
                      });
                    }
                  }}
                >
                  <option value="">Selecciona una opción</option>
                  {autoridadData.autoridadResponsable === 'Áreas centrales del INE' ? (
                    <>
                      <option value="Consejo General">Consejo General</option>
                      <option value="Secretaría Ejecutiva">Secretaría Ejecutiva</option>
                      <option value="Presidencia del Consejo General">Presidencia del Consejo General</option>
                      <option value="Junta General Ejecutiva">Junta General Ejecutiva</option>
                      <option value="Unidad Técnica de Fiscalización">Unidad Técnica de Fiscalización</option>
                    </>
                  ) : (
                    <>
                      <option value="Junta Local Ejecutiva en Aguascalientes">Junta Local Ejecutiva en Aguascalientes</option>
                      <option value="Junta Local Ejecutiva en Baja California">Junta Local Ejecutiva en Baja California</option>
                      <option value="Junta Local Ejecutiva en Ciudad de México">Junta Local Ejecutiva en Ciudad de México</option>
                      <option value="Junta Local Ejecutiva en Jalisco">Junta Local Ejecutiva en Jalisco</option>
                      <option value="Junta Local Ejecutiva en México">Junta Local Ejecutiva en México</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Estado y Distrito para Juntas Distritales */}
            {autoridadData.autoridadResponsable === 'Juntas Distritales' && (
              <>
                <div className="form-group full-width mb-3">
                  <label htmlFor="estado">Estado<span className="text-danger">*</span></label>
                  <select
                    id="estado"
                    className="form-control form-select"
                    value={autoridadData.estado}
                    onChange={(e) => setAutoridadData({ ...autoridadData, estado: e.target.value, distrito: '' })}
                  >
                    <option value="">Selecciona un estado</option>
                    <option value="Aguascalientes">Aguascalientes</option>
                    <option value="Ciudad de México">Ciudad de México</option>
                    <option value="Jalisco">Jalisco</option>
                    <option value="México">México</option>
                    <option value="Nuevo León">Nuevo León</option>
                  </select>
                </div>

                {autoridadData.estado && (
                  <div className="form-group full-width mb-3">
                    <label htmlFor="distrito">Distrito<span className="text-danger">*</span></label>
                    <select
                      id="distrito"
                      className="form-control form-select"
                      value={autoridadData.distrito}
                      onChange={(e) => {
                        if (e.target.value) {
                          const newAutoridad = {
                            ...autoridadData,
                            distrito: e.target.value,
                            descripcion: ''
                          };
                          setAutoridadesAgregadas([...autoridadesAgregadas, newAutoridad]);
                          setAutoridadData({
                            autoridadResponsable: 'Juntas Distritales',
                            subopcion: '',
                            estado: autoridadData.estado,
                            distrito: '',
                            descripcion: ''
                          });
                        }
                      }}
                    >
                      <option value="">Selecciona un distrito</option>
                      <option value="Junta Distrital Ejecutiva 01">Junta Distrital Ejecutiva 01</option>
                      <option value="Junta Distrital Ejecutiva 02">Junta Distrital Ejecutiva 02</option>
                      <option value="Junta Distrital Ejecutiva 03">Junta Distrital Ejecutiva 03</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Autoridades agregadas */}
            {autoridadesAgregadas.length > 0 && (
              <div className="autoridades-agregadas mt-4">
                <h6>Autoridades agregadas:</h6>
                {autoridadesAgregadas.map((aut, index) => (
                  <div key={index} className="autoridad-item card mb-2 p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{aut.autoridadResponsable}</strong>
                        {aut.subopcion && <span className="ms-2">- {aut.subopcion}</span>}
                        {aut.estado && aut.distrito && (
                          <span className="ms-2">- {aut.estado} - {aut.distrito}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0"
                        onClick={() => eliminarAutoridad(index)}
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="form-label">Descripción del acto impugnado<span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        value={aut.descripcion}
                        onChange={(e) => {
                          const updated = [...autoridadesAgregadas];
                          updated[index].descripcion = e.target.value;
                          setAutoridadesAgregadas(updated);
                        }}
                        placeholder="Describe el acto que se impugna..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="stepper-separator" />

            <div className="action-buttons">
              <button type="button" className="btn btn-retroceder" onClick={handlePrev}>
                Retroceder
              </button>
              <button
                type="button"
                className="btn btn-continuar"
                onClick={handleNext}
                disabled={!isStep3Valid()}
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-card">
            <h5>Demanda de impugnación</h5>
            <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

            <div className="form-group full-width mb-3">
              <label htmlFor="descripcion">Narración de hechos y agravios<span className="text-danger">*</span></label>
              <textarea
                id="descripcion"
                className="form-control"
                value={impugnacionData.descripcion}
                onChange={(e) => setImpugnacionData({ descripcion: e.target.value })}
                placeholder="Describe los hechos que motivan la impugnación y los agravios causados..."
                rows={8}
                maxLength={1500}
              />
              <small className="text-muted">
                {impugnacionData.descripcion.length}/1500 caracteres
              </small>
            </div>

            <div className="upload-area mt-4">
              <p className="mb-2"><strong>Sube la demanda de la impugnación en un solo archivo PDF</strong><span className="text-danger">*</span></p>
              <FileUploader
                config={DEMANDA_UPLOADER_CONFIG}
                onFilesChange={setDemandaFiles}
                onValidationChange={setIsDemandaValid}
              />
            </div>

            <hr className="stepper-separator" />

            <div className="action-buttons">
              <button type="button" className="btn btn-retroceder" onClick={handlePrev}>
                Retroceder
              </button>
              <button
                type="button"
                className="btn btn-continuar"
                onClick={handleNext}
                disabled={!isStep4Valid()}
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-card">
            <h5>Pruebas y anexos</h5>
            <p className="step-description">Adjunta las pruebas y documentos que soporten tu impugnación (opcional)</p>

            <div className="upload-area">
              <div className="upload-box">
                <div className="upload-icon">📎</div>
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                <span className="upload-hint">JPG, PNG, BMP, PDF, MP4, MOV, AVI, MP3, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT (máx 1GB por archivo)</span>
                <button type="button" className="btn-upload">Explora tus archivos</button>
              </div>
            </div>

            <div className="uploaded-files mt-3">
              <p className="files-hint">No hay archivos adjuntos todavía</p>
            </div>

            <hr className="stepper-separator" />

            <div className="action-buttons">
              <button type="button" className="btn btn-retroceder" onClick={handlePrev}>
                Retroceder
              </button>
              <button
                type="button"
                className="btn btn-continuar"
                onClick={handleFinish}
              >
                Enviar Impugnación
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="wizard-container" role="main" aria-labelledby="wizard-title" tabIndex={-1}>
      <div className="wizard-content">
        <h4 id="wizard-title">{getWizardTitle()}</h4>

        {expediente && (
          <p className="expediente-info">
            Tipo: <strong>{tipo}</strong> | Expediente: <strong>{expediente}</strong>
          </p>
        )}

        <div className="space-my-0500"></div>

        <h6 id="wizard-description">Avance del proceso de registro</h6>

        <div className="space-my-0400"></div>

        <Stepper
          onStepClick={(index) => {
            setCurrentStep(index);
            navigateToStep(index);
          }}
          showProgress={false}
          showTitle={true}
        />

        <div className="step-container">
          {renderStepContent()}
        </div>
      </div>
    </section>
  );
};

export default RegistroImpugnacionPage;
