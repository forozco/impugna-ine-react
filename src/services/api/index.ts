/**
 * API Services - Barrel Export
 * Exporta todos los servicios de la capa API
 */

// Configuracion
export { apiConfig, type ApiConfig, type Environment } from './apiConfig';

// Endpoints
export {
  apiEndpoints,
  authEndpoints,
  recuperaPasswordEndpoints,
  usuariosEndpoints,
  registroImpugnacionEndpoints,
  archivoEndpoints,
  consultaEndpoints,
  acuseEndpoints,
  catalogosEndpoints,
  firmadoEndpoints
} from './apiEndpoints';

// HTTP Client
export { httpClient, HttpError } from './httpClient';

// Servicios
export { authService, type LoginRequest, type LoginResponse, type OtpVerificationRequest, type OtpVerificationResponse } from './authService';
export { usuariosService, type RegistroUsuarioRequest, type RegistroUsuarioResponse, type PerfilUsuario } from './usuariosService';
export { catalogosService, type Autoridad, type Area, type Estado, type CatalogosResponse } from './catalogosService';
export {
  impugnacionService,
  type DatosPromovente,
  type DatosRepresentante,
  type DomicilioNotificacion,
  type ActoReclamado,
  type RegistroImpugnacionRequest,
  type RegistroImpugnacionResponse,
  type ImpugnacionDetalle,
  type ValidacionResponse
} from './impugnacionService';
export {
  archivoService,
  type ArchivoUploadResponse,
  type ArchivoChunkResponse,
  type ArchivoInfo,
  type UploadProgress
} from './archivoService';
export {
  consultaService,
  type ConsultaFiltros,
  type ImpugnacionResumen,
  type ConsultaResponse,
  type DetalleImpugnacion,
  type AcuseResponse
} from './consultaService';
export {
  firmadoService,
  type DatosFirma,
  type FirmaResponse,
  type ValidacionFirmaResponse,
  type DocumentoParaFirmar,
  type CadenaOriginalResponse
} from './firmadoService';
