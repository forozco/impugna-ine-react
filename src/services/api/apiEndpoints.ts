/**
 * Endpoints de la API centralizados
 * Equivalente a: api-endpoints.service.dev.ts de Angular
 */

import { apiConfig } from './apiConfig';

const BASE_URL = apiConfig.baseUrl;

/**
 * Endpoints de Autenticacion
 */
export const authEndpoints = {
  /** POST - Iniciar sesion con credenciales */
  iniciarSesion: `${BASE_URL}/autenticacion/inicio-sesion`,

  /** POST - Verificar codigo OTP de login */
  verificarCodigo: `${BASE_URL}/autenticacion/verificacion-codigo`,

  /** POST - Reenviar codigo OTP */
  reenviarOtp: `${BASE_URL}/autenticacion/reenvio-codigo`
};

/**
 * Endpoints de Recuperacion de Contrasena
 */
export const recuperaPasswordEndpoints = {
  /** POST - Solicitar codigo OTP para recuperacion */
  solicitarOtp: `${BASE_URL}/recuperacion_contrasena/solicita_codigo`,

  /** POST - Validar codigo OTP de recuperacion */
  validarOtp: `${BASE_URL}/recuperacion_contrasena/valida_codigo`,

  /** POST - Cambiar contrasena */
  cambiarContrasenia: `${BASE_URL}/recuperacion_contrasena/cambia_contrasena`
};

/**
 * Endpoints de Usuarios
 */
export const usuariosEndpoints = {
  /** POST - Registro completo de usuario */
  registroCompleto: `${BASE_URL}/usuarios/registro`,

  /** GET - Obtener perfil de usuario por ID */
  getPerfil: (usuarioId: number) => `${BASE_URL}/usuario/id/${usuarioId}`
};

/**
 * Endpoints de Registro de Impugnacion
 */
export const registroImpugnacionEndpoints = {
  /** POST - Registrar nueva impugnacion */
  registro: `${BASE_URL}/registro-impugnacion`,

  /** POST - Enviar todos los datos del registro de impugnacion */
  enviar: `${BASE_URL}/registro-impugnacion`,

  /** POST - Validar datos de impugnacion */
  validar: `${BASE_URL}/registro-impugnacion/validar`,

  /** POST/GET - Guardar/obtener borrador */
  borrador: `${BASE_URL}/registro-impugnacion/borrador`,

  /** POST - Enviar datos de Amicus Curiae (Amigo de la Corte) */
  amigoCorte: `${BASE_URL}/registro-impugnacion/amigo-corte`
};

/**
 * Endpoints de Subida de Archivos (Chunked Upload)
 */
export const archivoEndpoints = {
  /** POST - Inicializar subida de archivo */
  init: `${BASE_URL}/archivo/init`,

  /** POST - Subir archivo simple */
  upload: `${BASE_URL}/archivo/upload`,

  /** POST - Subir chunk de archivo */
  uploadChunk: `${BASE_URL}/archivo/chunk`,

  /** POST - Subir chunk de archivo por uploadId */
  chunk: (uploadId: string) => `${BASE_URL}/archivo/${uploadId}/chunk`,

  /** POST - Completar subida de archivo */
  complete: (uploadId: string) => `${BASE_URL}/archivo/${uploadId}/complete`,

  /** GET - Descargar archivo */
  download: (archivoId: string) => `${BASE_URL}/archivo/${archivoId}/download`
};

/**
 * Endpoints de Consulta de Impugnaciones
 */
export const consultaEndpoints = {
  /** GET - Buscar impugnaciones con filtros */
  buscar: `${BASE_URL}/consulta-impugnacion/buscar`,

  /** POST - Consultar impugnacion por folio */
  porFolio: `${BASE_URL}/consulta-impugnacion/folio`,

  /** GET - Obtener detalle de impugnacion */
  detalle: (folio: string) => `${BASE_URL}/consulta-impugnacion/${folio}`,

  /** GET - Obtener historial de estatus */
  historial: (folio: string) => `${BASE_URL}/consulta-impugnacion/${folio}/historial`,

  /** GET - Obtener mis impugnaciones */
  misImpugnaciones: `${BASE_URL}/consulta-impugnacion/mis-impugnaciones`,

  /** GET - Obtener estatus disponibles */
  estatus: `${BASE_URL}/consulta-impugnacion/estatus`,

  /** POST - Consultar expediente */
  porExpediente: `${BASE_URL}/consulta-impugnacion/consulta`
};

/**
 * Endpoints de Acuse
 */
export const acuseEndpoints = {
  /** POST - Generar acuse PDF */
  obtener: `${BASE_URL}/formatos/generar`,

  /** POST - Generar acuse */
  generar: `${BASE_URL}/acuse/generar`,

  /** GET - Descargar acuse PDF */
  descargar: (folio: string) => `${BASE_URL}/acuse/${folio}/descargar`
};

/**
 * Endpoints de Catalogos
 */
export const catalogosEndpoints = {
  /** GET - Obtener catalogo de autoridades responsables */
  autoridades: `${BASE_URL}/catalogos/autoridades`,

  /** GET - Obtener areas centrales filtradas */
  areas: `${BASE_URL}/catalogos/areas`,

  /** GET - Obtener catalogo de estados */
  estados: `${BASE_URL}/catalogos/estados`
};

/**
 * Endpoints de Proceso de Firmado/Envio
 */
export const firmadoEndpoints = {
  /** POST - Subir archivos adjuntos */
  uploader: `${BASE_URL}/archivo/init`,

  /** POST - Enviar datos del formulario */
  data: `${BASE_URL}/firmado/data`,

  /** POST - Validar firma electronica / certificado */
  validar: `${BASE_URL}/firma/validar`,

  /** POST - Validar firma electronica */
  validarFirma: `${BASE_URL}/firma/validar-firma`,

  /** POST - Firmar documento */
  firmar: `${BASE_URL}/firma/firmar`,

  /** POST - Firmar documento con PKCS#12 */
  firmarDocumento: `${BASE_URL}/firma/firmar-documento`,

  /** GET - Obtener cadena original de documento */
  cadenaOriginal: (documentoId: string) => `${BASE_URL}/firma/${documentoId}/cadena-original`,

  /** GET - Verificar firma de documento */
  verificar: (documentoId: string) => `${BASE_URL}/firma/${documentoId}/verificar`,

  /** GET - Obtener documentos pendientes de firma */
  pendientes: `${BASE_URL}/firma/pendientes`,

  /** GET - Descargar documento firmado */
  descargar: (documentoId: string) => `${BASE_URL}/firma/${documentoId}/descargar`
};

// Export all endpoints
export const apiEndpoints = {
  auth: authEndpoints,
  recuperaPassword: recuperaPasswordEndpoints,
  usuarios: usuariosEndpoints,
  registroImpugnacion: registroImpugnacionEndpoints,
  archivo: archivoEndpoints,
  consulta: consultaEndpoints,
  acuse: acuseEndpoints,
  catalogos: catalogosEndpoints,
  firmado: firmadoEndpoints
};

export default apiEndpoints;
