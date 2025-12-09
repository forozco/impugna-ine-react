/**
 * Servicio de IndexedDB usando Dexie
 * Equivalente a: ArchivoStorageService de Angular
 */

import Dexie, { type Table } from 'dexie';
import type { ArchivoStorageData, ArchivoStorageMetadata, EstadoArchivo } from '../types/impugnacion.types';

// Definir la estructura de la base de datos
class ImpugnaDB extends Dexie {
  archivos!: Table<ArchivoStorageData, string>;

  constructor() {
    super('ImpugnaINE_DB');

    this.version(1).stores({
      archivos: 'id, stepId, nombre, tipo, createdAt'
    });
  }
}

// Instancia singleton de la base de datos
const db = new ImpugnaDB();

// Servicio de almacenamiento de archivos
export const archivoStorageService = {
  /**
   * Guarda un archivo en IndexedDB
   */
  async saveFile(
    stepId: string,
    file: File,
    metadata?: Partial<ArchivoStorageMetadata>
  ): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    const archivoData: ArchivoStorageData = {
      id,
      stepId,
      nombre: file.name,
      tipo: file.type,
      tamano: file.size,
      file,
      metadata: {
        estado: 'pendiente',
        progreso: 0,
        ...metadata
      },
      createdAt: now
    };

    await db.archivos.add(archivoData);
    return id;
  },

  /**
   * Obtiene un archivo por su ID
   */
  async getFile(id: string): Promise<ArchivoStorageData | undefined> {
    return db.archivos.get(id);
  },

  /**
   * Obtiene todos los archivos de un step
   */
  async getFilesByStep(stepId: string): Promise<ArchivoStorageData[]> {
    return db.archivos.where('stepId').equals(stepId).toArray();
  },

  /**
   * Actualiza los metadatos de un archivo
   */
  async updateMetadata(
    id: string,
    metadata: Partial<ArchivoStorageMetadata>
  ): Promise<void> {
    const archivo = await db.archivos.get(id);
    if (archivo) {
      await db.archivos.update(id, {
        metadata: { ...archivo.metadata, ...metadata }
      });
    }
  },

  /**
   * Actualiza el estado de un archivo
   */
  async updateEstado(
    id: string,
    estado: EstadoArchivo,
    mensajeError?: string
  ): Promise<void> {
    await this.updateMetadata(id, { estado, mensajeError });
  },

  /**
   * Actualiza el progreso de subida de un archivo
   */
  async updateProgreso(id: string, progreso: number): Promise<void> {
    await this.updateMetadata(id, { progreso });
  },

  /**
   * Elimina un archivo por su ID
   */
  async deleteFile(id: string): Promise<void> {
    await db.archivos.delete(id);
  },

  /**
   * Elimina todos los archivos de un step
   */
  async deleteFilesByStep(stepId: string): Promise<void> {
    await db.archivos.where('stepId').equals(stepId).delete();
  },

  /**
   * Elimina todos los archivos
   */
  async clearAll(): Promise<void> {
    await db.archivos.clear();
  },

  /**
   * Obtiene el conteo de archivos por step
   */
  async getFileCountByStep(stepId: string): Promise<number> {
    return db.archivos.where('stepId').equals(stepId).count();
  },

  /**
   * Obtiene el tamano total de archivos por step
   */
  async getTotalSizeByStep(stepId: string): Promise<number> {
    const archivos = await this.getFilesByStep(stepId);
    return archivos.reduce((total, archivo) => total + archivo.tamano, 0);
  },

  /**
   * Verifica si un archivo existe
   */
  async fileExists(id: string): Promise<boolean> {
    const count = await db.archivos.where('id').equals(id).count();
    return count > 0;
  },

  /**
   * Obtiene todos los IDs de archivos de un step
   */
  async getFileIdsByStep(stepId: string): Promise<string[]> {
    const archivos = await this.getFilesByStep(stepId);
    return archivos.map(a => a.id);
  },

  /**
   * Formatea el tamano de archivo a string legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export { db };
export default archivoStorageService;
