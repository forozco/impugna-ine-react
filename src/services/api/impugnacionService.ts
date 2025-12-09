/**
 * Servicio de Impugnacion
 * Equivalente a: impugnacion-api.service.ts de Angular
 */

import { httpClient } from './httpClient';
import { registroImpugnacionEndpoints } from './apiEndpoints';

// Interfaces
export interface DatosPromovente {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  correoElectronico: string;
  telefono?: string;
}

export interface DatosRepresentante {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  curp: string;
  correoElectronico: string;
  telefono?: string;
  tipoRepresentacion: string;
}

export interface DomicilioNotificacion {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  estado: string;
  ciudad?: string;
}

export interface ActoReclamado {
  descripcion: string;
  fechaConocimiento: string;
  autoridadResponsable: number;
  areaCentral?: number;
  estado?: number;
}

export interface RegistroImpugnacionRequest {
  tipoMedioImpugnacion: string;
  datosPromovente: DatosPromovente;
  datosRepresentante?: DatosRepresentante;
  domicilioNotificacion: DomicilioNotificacion;
  actoReclamado: ActoReclamado;
  hechos: string;
  agravios: string;
  pruebas?: string;
  firmado: boolean;
  archivosAdjuntos?: string[];
}

export interface RegistroImpugnacionResponse {
  success: boolean;
  data: {
    folioRegistro: string;
    fechaRegistro: string;
    estatusInicial: string;
  };
  message?: string;
}

export interface ImpugnacionDetalle {
  id: number;
  folioRegistro: string;
  tipoMedioImpugnacion: string;
  fechaRegistro: string;
  estatus: string;
  datosPromovente: DatosPromovente;
  datosRepresentante?: DatosRepresentante;
  domicilioNotificacion: DomicilioNotificacion;
  actoReclamado: ActoReclamado;
  hechos: string;
  agravios: string;
}

export interface ValidacionResponse {
  success: boolean;
  valid: boolean;
  errors?: string[];
  message?: string;
}

/**
 * Servicio de registro de impugnaciones
 */
export const impugnacionService = {
  /**
   * Registrar una nueva impugnacion
   */
  async registrar(data: RegistroImpugnacionRequest): Promise<RegistroImpugnacionResponse> {
    console.log('[IMPUGNACION] Registrando impugnacion...', data);
    const response = await httpClient.post<RegistroImpugnacionResponse>(
      registroImpugnacionEndpoints.registro,
      data
    );
    console.log('[IMPUGNACION] Respuesta registro:', response);
    return response;
  },

  /**
   * Validar datos de impugnacion antes de enviar
   */
  async validar(data: Partial<RegistroImpugnacionRequest>): Promise<ValidacionResponse> {
    console.log('[IMPUGNACION] Validando datos...', data);
    const response = await httpClient.post<ValidacionResponse>(
      registroImpugnacionEndpoints.validar,
      data
    );
    return response;
  },

  /**
   * Obtener detalle de una impugnacion por folio
   */
  async obtenerPorFolio(folio: string): Promise<ImpugnacionDetalle | null> {
    try {
      console.log('[IMPUGNACION] Obteniendo impugnacion:', folio);
      const response = await httpClient.get<{ success: boolean; data: ImpugnacionDetalle }>(
        `${registroImpugnacionEndpoints.registro}/${folio}`
      );
      return response.data || null;
    } catch (error) {
      console.error('[IMPUGNACION] Error obteniendo impugnacion:', error);
      return null;
    }
  },

  /**
   * Actualizar una impugnacion existente
   */
  async actualizar(folio: string, data: Partial<RegistroImpugnacionRequest>): Promise<RegistroImpugnacionResponse> {
    console.log('[IMPUGNACION] Actualizando impugnacion:', folio);
    const response = await httpClient.put<RegistroImpugnacionResponse>(
      `${registroImpugnacionEndpoints.registro}/${folio}`,
      data
    );
    return response;
  },

  /**
   * Guardar borrador de impugnacion
   */
  async guardarBorrador(data: Partial<RegistroImpugnacionRequest>): Promise<RegistroImpugnacionResponse> {
    console.log('[IMPUGNACION] Guardando borrador...');
    const response = await httpClient.post<RegistroImpugnacionResponse>(
      registroImpugnacionEndpoints.borrador,
      data
    );
    return response;
  },

  /**
   * Obtener borradores del usuario actual
   */
  async obtenerBorradores(): Promise<ImpugnacionDetalle[]> {
    try {
      console.log('[IMPUGNACION] Obteniendo borradores...');
      const response = await httpClient.get<{ success: boolean; data: ImpugnacionDetalle[] }>(
        registroImpugnacionEndpoints.borrador
      );
      return response.data || [];
    } catch (error) {
      console.error('[IMPUGNACION] Error obteniendo borradores:', error);
      return [];
    }
  }
};

export default impugnacionService;
