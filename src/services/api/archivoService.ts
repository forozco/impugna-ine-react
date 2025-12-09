/**
 * Servicio de Archivos (Upload)
 * Equivalente a: archivo.service.ts de Angular
 * Maneja subida de archivos con chunking para archivos grandes
 */

import { httpClient } from './httpClient';
import { archivoEndpoints } from './apiEndpoints';

// Interfaces
export interface ArchivoUploadResponse {
  success: boolean;
  data: {
    archivoId: string;
    nombre: string;
    tamanio: number;
    tipo: string;
    url?: string;
  };
  message?: string;
}

export interface ArchivoChunkResponse {
  success: boolean;
  data: {
    chunkIndex: number;
    totalChunks: number;
    uploaded: boolean;
    archivoId?: string;
  };
  message?: string;
}

export interface ArchivoInfo {
  archivoId: string;
  nombre: string;
  tamanio: number;
  tipo: string;
  fechaSubida: string;
  url?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Constantes
const CHUNK_SIZE = 1024 * 1024; // 1MB por chunk
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB maximo

/**
 * Servicio de archivos
 */
export const archivoService = {
  /**
   * Subir un archivo (detecta automaticamente si necesita chunking)
   */
  async upload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ArchivoUploadResponse> {
    console.log('[ARCHIVO] Iniciando upload:', file.name, file.size);

    // Validar tamanio
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`El archivo excede el tamaño máximo permitido (${MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    // Si el archivo es pequeño, subir directamente
    if (file.size <= CHUNK_SIZE) {
      return this.uploadSimple(file, onProgress);
    }

    // Si es grande, usar chunking
    return this.uploadChunked(file, onProgress);
  },

  /**
   * Subida simple (archivos pequeños)
   */
  async uploadSimple(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ArchivoUploadResponse> {
    console.log('[ARCHIVO] Upload simple:', file.name);

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('nombre', file.name);
    formData.append('tipo', file.type);

    // Simular progreso para archivos pequeños
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    const response = await httpClient.postFormData<ArchivoUploadResponse>(
      archivoEndpoints.upload,
      formData
    );

    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }

    console.log('[ARCHIVO] Upload completado:', response);
    return response;
  },

  /**
   * Subida con chunking (archivos grandes)
   */
  async uploadChunked(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ArchivoUploadResponse> {
    console.log('[ARCHIVO] Upload chunked:', file.name, 'chunks:', Math.ceil(file.size / CHUNK_SIZE));

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = crypto.randomUUID();
    let archivoId: string | undefined;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', String(chunkIndex));
      formData.append('totalChunks', String(totalChunks));
      formData.append('nombre', file.name);
      formData.append('tipo', file.type);
      formData.append('tamanioTotal', String(file.size));

      console.log(`[ARCHIVO] Subiendo chunk ${chunkIndex + 1}/${totalChunks}`);

      const response = await httpClient.postFormData<ArchivoChunkResponse>(
        archivoEndpoints.uploadChunk,
        formData
      );

      // Actualizar progreso
      if (onProgress) {
        const loaded = end;
        onProgress({
          loaded,
          total: file.size,
          percentage: Math.round((loaded / file.size) * 100)
        });
      }

      // Guardar archivoId del ultimo chunk
      if (response.data?.archivoId) {
        archivoId = response.data.archivoId;
      }
    }

    // Construir respuesta final
    const finalResponse: ArchivoUploadResponse = {
      success: true,
      data: {
        archivoId: archivoId || uploadId,
        nombre: file.name,
        tamanio: file.size,
        tipo: file.type
      }
    };

    console.log('[ARCHIVO] Upload chunked completado:', finalResponse);
    return finalResponse;
  },

  /**
   * Obtener informacion de un archivo
   */
  async getInfo(archivoId: string): Promise<ArchivoInfo | null> {
    try {
      console.log('[ARCHIVO] Obteniendo info:', archivoId);
      const response = await httpClient.get<{ success: boolean; data: ArchivoInfo }>(
        `${archivoEndpoints.upload}/${archivoId}`
      );
      return response.data || null;
    } catch (error) {
      console.error('[ARCHIVO] Error obteniendo info:', error);
      return null;
    }
  },

  /**
   * Eliminar un archivo
   */
  async delete(archivoId: string): Promise<boolean> {
    try {
      console.log('[ARCHIVO] Eliminando archivo:', archivoId);
      await httpClient.delete(`${archivoEndpoints.upload}/${archivoId}`);
      return true;
    } catch (error) {
      console.error('[ARCHIVO] Error eliminando archivo:', error);
      return false;
    }
  },

  /**
   * Descargar un archivo
   */
  async download(archivoId: string): Promise<Blob | null> {
    try {
      console.log('[ARCHIVO] Descargando archivo:', archivoId);
      const response = await httpClient.get<Blob>(
        archivoEndpoints.download(archivoId),
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      console.error('[ARCHIVO] Error descargando archivo:', error);
      return null;
    }
  },

  /**
   * Validar tipo de archivo permitido
   */
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    return allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return extension === type.slice(1);
      }
      return file.type === type || file.type.startsWith(type.replace('*', ''));
    });
  },

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default archivoService;
