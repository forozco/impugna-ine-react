/**
 * Tipos e interfaces para el sistema de impugnaciones
 * Migrado desde Angular: src/app/shared/models/impugnacion.models.ts
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export type RegistrantType = 'titular' | 'representantes';
export type RegistroOption = 'nuevo' | 'ampliacion';
export type TipoTramite = 'registro' | 'coadyuvante' | 'ampliacion' | null;
export type EstadoArchivo = 'pendiente' | 'subiendo' | 'exitoso' | 'error';

// ============================================================================
// STEP 0 - ACTORES
// ============================================================================

export interface Step0Data {
  option: RegistrantType;
  tipoImpugnacion: string;
  folio?: string;
  tipoTramite?: string;
  esDemandaFisica?: boolean;
  nombreCompletoTitular?: string;
}

// ============================================================================
// STEP 1 - REPRESENTANTE
// ============================================================================

export interface Representante {
  nombre: string;
  calidad: string;
}

export interface Step1Data {
  option: RegistrantType;
  nombreTitular?: string;
  representantes?: Representante[];
  tipoTramite?: string;
}

// ============================================================================
// STEP 2 - PERSONALIDAD LEGAL (DOCUMENTOS)
// ============================================================================

export interface ArchivoMetadata {
  id: string;
  nombre: string;
  tamano: number;
  tipo: string;
  estado: EstadoArchivo;
  progreso?: number;
  mensajeError?: string;
}

export interface Step2Data {
  archivos: File[];
}

export interface Step2DataBackend {
  archivos: ArchivoMetadata[];
}

// ============================================================================
// STEP 3 - AUTORIDADES
// ============================================================================

export interface AutoridadAgregada {
  autoridadResponsable: string;
  subopcion?: string;
  estado?: string;
  distrito?: string;
  descripcion?: string;
}

export interface OtraAutoridad {
  nombre: string;
  descripcion: string;
}

export interface Step3Data {
  autoridadesAgregadas: AutoridadAgregada[];
  otrasAutoridades?: OtraAutoridad[];
}

// ============================================================================
// STEP 4 - DEMANDA (HECHOS Y AGRAVIOS)
// ============================================================================

export interface Step4Data {
  descripcion: string;
  archivos: File[];
}

export interface Step4DataBackend {
  descripcion: string;
  archivos: ArchivoMetadata[];
}

// ============================================================================
// STEP 5 - ANEXOS Y EVIDENCIA
// ============================================================================

export interface ArchivoStep5Metadata {
  nombre: string;
  tamano: number;
  tipo?: string;
}

export interface Step5Data {
  archivosIds: string[];
  archivosMetadata?: { nombre: string; tamano: number }[];
  cantidadArchivos?: number;
}

export interface Step5DataBackend {
  archivosIds: string[];
  cantidadArchivos: number;
  archivos: ArchivoStep5Metadata[];
}

// ============================================================================
// DATOS DE IMPUGNACION COMPLETOS
// ============================================================================

export interface ImpugnacionData {
  step0?: Step0Data;
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
  step5?: Step5Data;
  [key: string]: unknown;
}

export interface ImpugnacionDataBackend {
  step0?: Step0Data;
  step1?: Step1Data;
  step2?: Step2DataBackend;
  step3?: Step3Data;
  step4?: Step4DataBackend;
  step5?: Step5DataBackend;
}

// ============================================================================
// FIRMA ELECTRONICA
// ============================================================================

export interface ValidarFirmaRequest {
  certificadoBase64: string;
  firmaDigitalPkcs7: string;
  fileName: string;
}

export interface ValidarFirmaResponse {
  ok: boolean;
  message?: string;
  data?: {
    certificateValid: boolean;
    signatureValid: boolean;
    issuer?: string;
    subject?: string;
    validFrom?: string;
    validTo?: string;
  };
  error?: string;
}

export interface FirmanteInfo {
  posicion: number;
  firmante: string;
  ac: string;
  id: number;
  firmaDigitalPkcs12: string;
  hash: string;
}

export interface FirmarDocumentoRequest {
  directorio: string;
  nombreArchivo: string;
  firmas: FirmanteInfo[];
}

export interface FirmarDocumentoResponse {
  ok: boolean;
  message?: string;
  documentUrl?: string;
  data?: {
    firmasAplicadas: number;
    timestampFirmado: string;
    folioDocumento?: string;
  };
  error?: string;
}

// ============================================================================
// STEPPER
// ============================================================================

export interface StepConfig {
  id: string;
  label: string;
  description: string;
  component?: string;
  required: boolean;
  validation?: (data: unknown) => boolean;
  dependencies?: string[];
}

export interface StepState {
  index: number;
  id: string;
  isValid: boolean;
  isVisited: boolean;
  isRequired: boolean;
  data?: unknown;
  config: StepConfig;
}

export interface StepperState {
  currentStep: number;
  totalSteps: number;
  steps: StepState[];
  stepConfigs: StepConfig[];
  formData: ImpugnacionData;
  isCompleted: boolean;
}

// ============================================================================
// CATALOGOS
// ============================================================================

export interface Autoridad {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Estado {
  id: string;
  nombre: string;
  clave?: string;
}

export interface Area {
  id: string;
  nombre: string;
  autoridadId?: string;
  estadoId?: string;
}

export interface Municipio {
  codigoPostal: string;
  municipio: string;
  estado: string;
  colonias: string[];
}

// ============================================================================
// ARCHIVO STORAGE (IndexedDB)
// ============================================================================

export interface ArchivoStorageMetadata {
  estado: EstadoArchivo;
  progreso: number;
  mensajeError?: string;
}

export interface ArchivoStorageData {
  id: string;
  stepId: string;
  nombre: string;
  tipo: string;
  tamano: number;
  file: File;
  metadata: ArchivoStorageMetadata;
  createdAt: Date;
}

// ============================================================================
// UPLOAD
// ============================================================================

export interface InitUploadResponse {
  uploadId: string;
  recommendedChunkSize: number;
  uploadedChunks?: number[];
}

export interface UploadProgress {
  totalBytes: number;
  sentBytes: number;
  percent: number;
  currentSpeedBps?: number;
  etaSeconds?: number;
}

export interface CompleteUploadResponse {
  success: boolean;
  filePath: string;
  fileName: string;
  originalFileName: string;
  size: number;
  uploadedAt: string;
}

// ============================================================================
// ALERT MODAL
// ============================================================================

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertModalConfig {
  title: string;
  message: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

// ============================================================================
// ONBOARDING
// ============================================================================

export interface OnboardingStep {
  id: string;
  title: string;
  message: string;
  targetElement?: string;
}

export interface OnboardingTour {
  id: string;
  steps: OnboardingStep[];
}

// ============================================================================
// AMICUS CURIAE
// ============================================================================

export interface AmicusStep1Data {
  nombre: string;
  email: string;
  telefono?: string;
  institucion?: string;
}

export interface AmicusStep2Data {
  experiencia: string;
  especialidad: string;
}

export interface AmicusStep3Data {
  escrito: string;
  archivos: File[];
}

export interface AmicusFormData {
  step1?: AmicusStep1Data;
  step2?: AmicusStep2Data;
  step3?: AmicusStep3Data;
  expediente?: string;
}

// ============================================================================
// USER / AUTH
// ============================================================================

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  rol?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
