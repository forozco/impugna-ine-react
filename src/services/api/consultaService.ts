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

// Respuesta del endpoint /consulta-impugnacion/folio
export interface ConsultaFolioBackendResponse {
  folio?: string;
  promovente?: string;
  descripcionImpugna?: string;
  fechaRecepcion?: string;
  fechaRetiro?: string;
  mensaje?: string;
}

export interface ConsultaFolioResponse {
  success: boolean;
  folio: string;
  promovente: string;
  descripcionImpugna: string;
  fechaRecepcion: string;
  fechaRetiro: string | null;
  mensaje?: string;
}

// Respuesta del endpoint /consulta-impugnacion/consulta (para expedientes)
export interface ConsultaExpedienteBackendResponse {
  codigo?: number;
  data?: unknown;
  expediente?: string;
  folio?: string;
  mensaje?: string;
}

export interface ConsultaExpedienteResponse {
  success: boolean;
  expedienteEncontrado: boolean;
  mensaje?: string;
}

/**
 * Servicio de consulta de impugnaciones
 */
export const consultaService = {
  /**
   * Consultar expediente para ampliación, coadyuvante o amicus
   * Endpoint: POST /consulta-impugnacion/consulta
   * Body: { folio: string }
   */
  async consultarExpediente(folio: string): Promise<ConsultaExpedienteResponse> {
    console.log('[CONSULTA] Consultando expediente:', folio);

    try {
      const response = await httpClient.post<ConsultaExpedienteBackendResponse>(
        consultaEndpoints.porExpediente,
        { folio: folio.trim() }
      );

      console.log('[CONSULTA] Respuesta del servicio:', response);

      // Verificar si la respuesta indica que se encontró el expediente
      // Un 200 OK con respuesta válida significa que el expediente existe
      const expedienteEncontrado = response && (
        response.codigo === 0 ||
        response.codigo === undefined ||  // Si no hay codigo, asumimos éxito
        response.data ||
        response.expediente ||
        response.folio  // Algunos endpoints devuelven el folio directamente
      );

      if (expedienteEncontrado) {
        return {
          success: true,
          expedienteEncontrado: true
        };
      } else {
        return {
          success: false,
          expedienteEncontrado: false,
          mensaje: 'No se encontró el expediente con el folio ingresado'
        };
      }
    } catch (error: unknown) {
      console.error('[CONSULTA] Error al consultar expediente:', error);

      const errorObj = error as { status?: number; response?: { data?: { mensaje?: string } } };

      // Manejar diferentes tipos de error
      if (errorObj.status === 404) {
        return {
          success: false,
          expedienteEncontrado: false,
          mensaje: 'No se encontró el expediente con el folio ingresado'
        };
      } else if (errorObj.status === 0) {
        return {
          success: false,
          expedienteEncontrado: false,
          mensaje: 'No se pudo conectar con el servidor. Intenta de nuevo.'
        };
      } else {
        return {
          success: false,
          expedienteEncontrado: false,
          mensaje: errorObj.response?.data?.mensaje || 'Error al buscar el expediente. Intenta de nuevo.'
        };
      }
    }
  },

  /**
   * Consultar impugnacion por folio
   * Endpoint: POST /consulta-impugnacion/folio
   * Body: { folio: string }
   */
  async consultarPorFolio(folio: string): Promise<ConsultaFolioResponse> {
    console.log('[CONSULTA] Consultando por folio:', folio);

    try {
      const response = await httpClient.post<ConsultaFolioBackendResponse>(
        consultaEndpoints.porFolio,
        { folio: folio.trim() }
      );

      console.log('[CONSULTA] Respuesta del servidor:', response);

      // Verificar si el backend indica que no existe el folio
      if (response?.mensaje?.includes('No existe un registro')) {
        return {
          success: false,
          folio: folio,
          promovente: '',
          descripcionImpugna: '',
          fechaRecepcion: '',
          fechaRetiro: null,
          mensaje: response.mensaje
        };
      }

      // Respuesta exitosa
      return {
        success: true,
        folio: response.folio || folio,
        promovente: response.promovente || 'N/A',
        descripcionImpugna: response.descripcionImpugna || 'N/A',
        fechaRecepcion: response.fechaRecepcion || '',
        fechaRetiro: response.fechaRetiro || null,
        mensaje: response.mensaje
      };
    } catch (error: unknown) {
      console.error('[CONSULTA] Error consultando folio:', error);

      // Manejar error de "No existe"
      const errorObj = error as { response?: { data?: { folio?: string; mensaje?: string; message?: string } } };
      const errorBody = errorObj?.response?.data;
      let errorMsg = '';

      if (typeof errorBody === 'string') {
        errorMsg = errorBody;
      } else if (errorBody?.folio) {
        errorMsg = errorBody.folio;
      } else if (errorBody?.mensaje) {
        errorMsg = errorBody.mensaje;
      } else if (errorBody?.message) {
        errorMsg = errorBody.message;
      }

      if (errorMsg && errorMsg.includes('No existe un registro')) {
        return {
          success: false,
          folio: folio,
          promovente: '',
          descripcionImpugna: '',
          fechaRecepcion: '',
          fechaRetiro: null,
          mensaje: errorMsg
        };
      }

      throw error;
    }
  },

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
