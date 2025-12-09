/**
 * Pagina de Registro de Impugnacion - Wizard de 6 pasos
 * Equivalente a: impugnacion-wizard.component.ts de Angular
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStepperStore } from '../../stores/stepperStore';
import Stepper from '../../components/shared/stepper/Stepper';
import { ButtonPrimario, ButtonSecundario } from '../../components/ui';
import './RegistroImpugnacionPage.scss';

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
  const [searchParams] = useSearchParams();
  const {
    currentStep,
    setCurrentStep,
    reset,
    totalSteps,
    setStepConfigs,
    markStepAsValid,
    updateFormData
  } = useStepperStore();

  // Initialize step configs on mount
  useEffect(() => {
    setStepConfigs(STEP_CONFIGS);
  }, [setStepConfigs]);

  // Get query params
  const tipo = searchParams.get('tipo') || 'registro';
  const expediente = searchParams.get('expediente');

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

  // Get wizard title based on tipo
  const getWizardTitle = () => {
    if (tipo === 'ampliacion') return 'Registrar una ampliación de demanda';
    if (tipo === 'coadyuvante') return 'Registrar tercero interesado-Coadyuvante';
    return 'Registrar una nueva impugnación';
  };

  // Step 0: Navigate to Titular flow
  const navigateToTitular = () => {
    setSelectedActor('titular');
    setPreviousStep(0);
    markStepAsValid(0, true);
    // Titular salta directamente a step 3 (Autoridad)
    setCurrentStep(3);
  };

  // Step 0: Navigate to Representante flow
  const navigateToRepresentante = () => {
    setSelectedActor('representantes');
    setPreviousStep(0);
    markStepAsValid(0, true);
    // Representante va a step 1
    setCurrentStep(1);
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
    } else if (currentStep === 2) {
      // Step 2 is optional, just move forward
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Save step 3 data
      updateFormData({
        step3: {
          autoridadesAgregadas
        }
      });
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Save step 4 data
      updateFormData({
        step4: {
          descripcion: impugnacionData.descripcion,
          archivos: [] // Archivos se agregarán cuando se implemente el uploader
        }
      });
      setCurrentStep(5);
    }
  };

  const handlePrev = () => {
    if (currentStep === 3 && previousStep === 0) {
      // If we came from step 0 (Titular flow), go back to step 0
      setPreviousStep(null);
      setCurrentStep(0);
    } else if (currentStep === 1) {
      // From step 1, go back to step 0
      setCurrentStep(0);
    } else {
      // Normal flow
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Navigate to revision page
    navigate('/revision-impugnacion');
  };

  const handleBack = () => {
    reset();
    navigate('/registro');
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return true; // Step 0 navigation is done via buttons
      case 1:
        return isStep1Valid();
      case 2:
        return true; // Personalidad is optional
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      case 5:
        return true; // Evidencia is optional
      default:
        return true;
    }
  };

  // Only letters filter (igual que Angular)
  const onlyLetters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const allowedPattern = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛãõÃÕçÇñÑ\s'\-]$/;
    if (char.length === 1 && !allowedPattern.test(char)) {
      e.preventDefault();
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
                {tipo === 'ampliacion'
                  ? 'Elige al actor que va a registrar una ampliación de demanda'
                  : tipo === 'coadyuvante'
                    ? 'Elige el tipo de persona que registra la tercería'
                    : 'Elige el tipo de persona que registra la impugnación'
                }
                <span className="text-danger">*</span>
              </label>

              <div className="radio-group">
                {/* Titular */}
                <div
                  className="radio-card"
                  onClick={navigateToTitular}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToTitular()}
                  tabIndex={0}
                  role="radio"
                  aria-checked={false}
                  aria-label={tipo === 'coadyuvante' ? 'Titular del registro' : 'Titular (Agraviado)'}
                >
                  <label className="d-flex align-items-center gap-2 w-100" style={{ cursor: 'pointer' }}>
                    <input type="radio" className="radio-custom" name="option" value="titular" tabIndex={-1} readOnly />
                    <span className="radio-label">
                      {tipo === 'coadyuvante' ? 'Titular del registro' : 'Titular (Agraviado)'}
                    </span>
                  </label>
                </div>

                {/* Representante */}
                <div
                  className="radio-card"
                  onClick={navigateToRepresentante}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToRepresentante()}
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
              <button type="button" className="btn btn-retroceder" onClick={handleBack}>
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
                      <span className="tooltip-icon-custom">
                        ?
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
                              >
                                –
                              </button>
                            )}
                            {index === 0 && <div className="square-btn-spacer"></div>}
                            <button
                              type="button"
                              className="btn btn-outline-secondary square-btn"
                              onClick={addRepresentante}
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
          </div>
        );

      case 2:
        return (
          <div className="step-card">
            <h5>Acreditación de personalidad</h5>
            <p className="step-description">Sube los documentos que acrediten tu personalidad como representante (opcional)</p>

            <div className="upload-area">
              <div className="upload-box">
                <div className="upload-icon">📄</div>
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                <span className="upload-hint">PDF, JPG, PNG (máx 50MB)</span>
                <button type="button" className="btn-upload">Seleccionar archivo</button>
              </div>
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
                onChange={(e) => setAutoridadData({ ...autoridadData, autoridadResponsable: e.target.value })}
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
              />
              <small className="text-muted">
                {impugnacionData.descripcion.length} caracteres (mínimo 10)
              </small>
            </div>

            <div className="upload-area mt-4">
              <p className="mb-2"><strong>Sube la demanda de la impugnación en un solo archivo PDF</strong><span className="text-danger">*</span></p>
              <div className="upload-box">
                <div className="upload-icon">📄</div>
                <p>Arrastra el archivo aquí o haz clic para seleccionar</p>
                <span className="upload-hint">PDF (máx 200MB)</span>
                <button type="button" className="btn-upload">Seleccionar archivo</button>
              </div>
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
          </div>
        );

      default:
        return null;
    }
  };

  // Don't show stepper navigation buttons on step 0
  const showNavigationButtons = currentStep !== 0;

  return (
    <section className="wizard-container">
      <div className="wizard-content">
        <h4>{getWizardTitle()}</h4>

        {expediente && (
          <p className="expediente-info">
            Tipo: <strong>{tipo}</strong> | Expediente: <strong>{expediente}</strong>
          </p>
        )}

        <div className="space-my-0500"></div>

        <h6>Avance del proceso de registro</h6>

        <div className="space-my-0400"></div>

        <Stepper
          onStepClick={(index) => setCurrentStep(index)}
          showProgress={false}
          showTitle={true}
        />

        <div className="step-container">
          {renderStepContent()}
        </div>

        {showNavigationButtons && (
          <div className="action-buttons">
            <ButtonSecundario
              onClick={handlePrev}
              ariaLabel="Anterior"
            >
              Anterior
            </ButtonSecundario>

            {currentStep < totalSteps() - 1 ? (
              <ButtonPrimario
                onClick={handleNext}
                disabled={!isStepValid()}
                ariaLabel="Siguiente"
              >
                Siguiente
              </ButtonPrimario>
            ) : (
              <ButtonPrimario
                onClick={handleFinish}
                disabled={!isStepValid()}
                ariaLabel="Enviar Impugnación"
              >
                Enviar Impugnación
              </ButtonPrimario>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RegistroImpugnacionPage;
