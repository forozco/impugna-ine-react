/**
 * Store de Zustand para gestión de uploads
 * Equivalente a: UploadService y ChunkedUploadService de Angular
 */

import { create } from 'zustand';
import type { UploadProgress, EstadoArchivo } from '../types/impugnacion.types';

interface FileUploadState {
  id: string;
  file: File;
  progress: UploadProgress;
  estado: EstadoArchivo;
  error?: string;
  uploadId?: string;
}

interface UploadStore {
  // Estado
  uploads: Map<string, FileUploadState>;
  isUploading: boolean;

  // Acciones
  addFile: (file: File) => string;
  removeFile: (id: string) => void;
  updateProgress: (id: string, progress: Partial<UploadProgress>) => void;
  setEstado: (id: string, estado: EstadoArchivo, error?: string) => void;
  setUploadId: (id: string, uploadId: string) => void;
  getUpload: (id: string) => FileUploadState | undefined;
  getAllUploads: () => FileUploadState[];
  clearCompleted: () => void;
  clearAll: () => void;

  // Helpers
  generateUUID: () => string;
  formatFileSize: (bytes: number) => string;
  getFileExtension: (filename: string) => string;
  isValidFileType: (file: File, allowedTypes: string[]) => boolean;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  // Estado inicial
  uploads: new Map(),
  isUploading: false,

  // Acciones
  addFile: (file: File) => {
    const id = get().generateUUID();
    const uploads = new Map(get().uploads);

    uploads.set(id, {
      id,
      file,
      progress: {
        totalBytes: file.size,
        sentBytes: 0,
        percent: 0
      },
      estado: 'pendiente'
    });

    set({ uploads });
    return id;
  },

  removeFile: (id: string) => {
    const uploads = new Map(get().uploads);
    uploads.delete(id);
    set({ uploads });
  },

  updateProgress: (id: string, progress: Partial<UploadProgress>) => {
    const uploads = new Map(get().uploads);
    const upload = uploads.get(id);

    if (upload) {
      uploads.set(id, {
        ...upload,
        progress: { ...upload.progress, ...progress }
      });
      set({ uploads });
    }
  },

  setEstado: (id: string, estado: EstadoArchivo, error?: string) => {
    const uploads = new Map(get().uploads);
    const upload = uploads.get(id);

    if (upload) {
      uploads.set(id, {
        ...upload,
        estado,
        error
      });
      set({ uploads });
    }

    // Actualizar isUploading basado en el estado global
    const anyUploading = [...uploads.values()].some(u => u.estado === 'subiendo');
    set({ isUploading: anyUploading });
  },

  setUploadId: (id: string, uploadId: string) => {
    const uploads = new Map(get().uploads);
    const upload = uploads.get(id);

    if (upload) {
      uploads.set(id, {
        ...upload,
        uploadId
      });
      set({ uploads });
    }
  },

  getUpload: (id: string) => {
    return get().uploads.get(id);
  },

  getAllUploads: () => {
    return [...get().uploads.values()];
  },

  clearCompleted: () => {
    const uploads = new Map(get().uploads);
    for (const [id, upload] of uploads) {
      if (upload.estado === 'exitoso') {
        uploads.delete(id);
      }
    }
    set({ uploads });
  },

  clearAll: () => {
    set({ uploads: new Map(), isUploading: false });
  },

  // Helpers
  generateUUID: () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback para navegadores más antiguos
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileExtension: (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  },

  isValidFileType: (file: File, allowedTypes: string[]) => {
    const extension = get().getFileExtension(file.name);
    const mimeType = file.type.toLowerCase();

    return allowedTypes.some(type => {
      // Verificar por extensión
      if (type.startsWith('.')) {
        return extension === type.slice(1).toLowerCase();
      }
      // Verificar por MIME type
      if (type.includes('/')) {
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.slice(0, -1));
        }
        return mimeType === type.toLowerCase();
      }
      // Verificar solo extensión sin punto
      return extension === type.toLowerCase();
    });
  }
}));
