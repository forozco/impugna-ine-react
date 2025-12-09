/**
 * Servicio de Catalogos
 * Equivalente a: catalogos.service.ts de Angular
 */

import { httpClient } from './httpClient';
import { catalogosEndpoints } from './apiEndpoints';

// Interfaces
export interface Autoridad {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Area {
  id: number;
  nombre: string;
  autoridadId: number;
  estadoId?: number;
  activo: boolean;
}

export interface Estado {
  id: number;
  nombre: string;
  clave: string;
  activo: boolean;
}

export interface CatalogosResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  message?: string;
}

/**
 * Servicio de catalogos
 */
export const catalogosService = {
  /**
   * Obtener catalogo de autoridades responsables
   */
  async getAutoridades(): Promise<Autoridad[]> {
    try {
      console.log('[CATALOGOS] Obteniendo autoridades...');
      const response = await httpClient.get<CatalogosResponse<Autoridad>>(
        catalogosEndpoints.autoridades
      );
      console.log('[CATALOGOS] Autoridades:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('[CATALOGOS] Error obteniendo autoridades:', error);
      return [];
    }
  },

  /**
   * Obtener areas centrales filtradas por autoridad y estado
   */
  async getAreas(autoridadId?: number, estadoId?: number): Promise<Area[]> {
    try {
      console.log('[CATALOGOS] Obteniendo areas...', { autoridadId, estadoId });

      const params: Record<string, string | number> = {};
      if (autoridadId) params.autoridad = autoridadId;
      if (estadoId) params.estado = estadoId;

      const response = await httpClient.get<CatalogosResponse<Area>>(
        catalogosEndpoints.areas,
        { params }
      );

      console.log('[CATALOGOS] Areas:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('[CATALOGOS] Error obteniendo areas:', error);
      return [];
    }
  },

  /**
   * Obtener catalogo de estados
   */
  async getEstados(): Promise<Estado[]> {
    try {
      console.log('[CATALOGOS] Obteniendo estados...');
      const response = await httpClient.get<CatalogosResponse<Estado>>(
        catalogosEndpoints.estados
      );
      console.log('[CATALOGOS] Estados:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error('[CATALOGOS] Error obteniendo estados:', error);
      return [];
    }
  }
};

export default catalogosService;
