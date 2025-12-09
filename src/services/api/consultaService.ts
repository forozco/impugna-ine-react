/**
 * Servicio de Consulta de Impugnaciones
 * Equivalente a: consulta.service.ts de Angular
 */

import { httpClient } from './httpClient';
import { consultaEndpoints, acuseEndpoints } from './apiEndpoints';

// Interfaces
export interface ConsultaFiltros {
  folio?: string;
  curp?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estatus?: string;
  tipoMedio?: string;
  page?: number;
  pageSize?: number;
}

export interface ImpugnacionResumen {
  id: number;
  folioRegistro: string;
  tipoMedioImpugnacion: string;
  fechaRegistro: string;
  estatus: string;
  nombrePromovente: string;
  autoridadResponsable: string;
}

export interface ConsultaResponse {
  success: boolean;
  data: ImpugnacionResumen[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  message?: string;
}

export interface DetalleImpugnacion {
  id: number;
  folioRegistro: string;
  tipoMedioImpugnacion: string;
  fechaRegistro: string;
  estatus: string;
  datosPromovente: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    curp: string;
    correoElectronico: string;
    telefono?: string;
  };
  datosRepresentante?: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    curp: string;
    correoElectronico: string;
    telefono?: string;
    tipoRepresentacion: string;
  };
  domicilioNotificacion: {
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
    colonia: string;
    codigoPostal: string;
    municipio: string;
    estado: string;
    ciudad?: string;
  };
  actoReclamado: {
    descripcion: string;
    fechaConocimiento: string;
    autoridadResponsable: string;
    areaCentral?: string;
    estado?: string;
  };
  hechos: string;
  agravios: string;
  pruebas?: string;
  archivosAdjuntos: {
    id: string;
    nombre: string;
    tipo: string;
    tamanio: number;
  }[];
  historialEstatus: {
    estatus: string;
    fecha: string;
    observaciones?: string;
  }[];
}

export interface AcuseResponse {
  success: boolean;
  data: {
    acuseId: string;
    folioRegistro: string;
    fechaGeneracion: string;
    url: string;
  };
  message?: string;
}

/**
 * Servicio de consulta de impugnaciones
 */
export const consultaService = {
  /**
   * Buscar impugnaciones con filtros
   */
  async buscar(filtros: ConsultaFiltros = {}): Promise<ConsultaResponse> {
    console.log('[CONSULTA] Buscando impugnaciones...', filtros);

    const params: Record<string, string | number> = {};

    if (filtros.folio) params.folio = filtros.folio;
    if (filtros.curp) params.curp = filtros.curp;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
    if (filtros.estatus) params.estatus = filtros.estatus;
    if (filtros.tipoMedio) params.tipoMedio = filtros.tipoMedio;
    if (filtros.page) params.page = filtros.page;
    if (filtros.pageSize) params.pageSize = filtros.pageSize;

    const response = await httpClient.get<ConsultaResponse>(
      consultaEndpoints.buscar,
      { params }
    );

    console.log('[CONSULTA] Resultados:', response.total);
    return response;
  },

  /**
   * Obtener detalle de una impugnacion
   */
  async obtenerDetalle(folio: string): Promise<DetalleImpugnacion | null> {
    try {
      console.log('[CONSULTA] Obteniendo detalle:', folio);
      const response = await httpClient.get<{ success: boolean; data: DetalleImpugnacion }>(
        consultaEndpoints.detalle(folio)
      );
      return response.data || null;
    } catch (error) {
      console.error('[CONSULTA] Error obteniendo detalle:', error);
      return null;
    }
  },

  /**
   * Obtener impugnaciones del usuario actual
   */
  async obtenerMisImpugnaciones(page = 1, pageSize = 10): Promise<ConsultaResponse> {
    console.log('[CONSULTA] Obteniendo mis impugnaciones...');
    const response = await httpClient.get<ConsultaResponse>(
      consultaEndpoints.misImpugnaciones,
      { params: { page, pageSize } }
    );
    return response;
  },

  /**
   * Generar acuse de recibo
   */
  async generarAcuse(folio: string): Promise<AcuseResponse> {
    console.log('[CONSULTA] Generando acuse para:', folio);
    const response = await httpClient.post<AcuseResponse>(
      acuseEndpoints.generar,
      { folio }
    );
    return response;
  },

  /**
   * Descargar acuse de recibo como PDF
   */
  async descargarAcuse(folio: string): Promise<Blob | null> {
    try {
      console.log('[CONSULTA] Descargando acuse:', folio);
      const response = await httpClient.get<Blob>(
        acuseEndpoints.descargar(folio),
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      console.error('[CONSULTA] Error descargando acuse:', error);
      return null;
    }
  },

  /**
   * Obtener historial de estatus de una impugnacion
   */
  async obtenerHistorial(folio: string): Promise<DetalleImpugnacion['historialEstatus']> {
    try {
      console.log('[CONSULTA] Obteniendo historial:', folio);
      const response = await httpClient.get<{ success: boolean; data: DetalleImpugnacion['historialEstatus'] }>(
        consultaEndpoints.historial(folio)
      );
      return response.data || [];
    } catch (error) {
      console.error('[CONSULTA] Error obteniendo historial:', error);
      return [];
    }
  },

  /**
   * Obtener lista de estatus disponibles
   */
  async obtenerEstatusDisponibles(): Promise<{ id: string; nombre: string }[]> {
    try {
      const response = await httpClient.get<{ success: boolean; data: { id: string; nombre: string }[] }>(
        consultaEndpoints.estatus
      );
      return response.data || [];
    } catch (error) {
      console.error('[CONSULTA] Error obteniendo estatus:', error);
      return [];
    }
  }
};

export default consultaService;
