/**
 * FileUploader Component
 * Componente de carga de archivos igual que Angular
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import './FileUploader.scss';

// Interfaces
export interface ArchivoMetadata {
  id: string;
  nombre: string;
  tamano: string;
  estado: 'pendiente' | 'cargando' | 'exitoso' | 'error';
  progreso: number;
  mensajeError?: string;
  file?: File;
}

export interface FileUploaderConfig {
  acceptedFileTypes: string[];
  acceptedMimeTypes: string[];
  maxFileSizeMB: number;
  maxFiles?: number;
  maxFileNameLength?: number;
  allowMultiple: boolean;
  allowZip?: boolean;
  required: boolean;
  validateMagicNumber?: boolean;
  title?: string;
  subtitle?: string;
  tooltip?: string;
}

interface FileUploaderProps {
  config: FileUploaderConfig;
  initialFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  config,
  initialFiles = [],
  onFilesChange,
  onValidationChange,
}) => {
  const [archivos, setArchivos] = useState<ArchivoMetadata[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with initial files
  useEffect(() => {
    if (initialFiles.length > 0) {
      setArchivos(initialFiles.map(file => ({
        id: generarIdUnico(),
        nombre: file.name,
        tamano: formatFileSize(file.size),
        estado: 'exitoso' as const,
        progreso: 100,
        file: file
      })));
    }
  }, []);

  // Computed values
  const isUploading = archivos.some(a => a.estado === 'cargando');

  const isValid = useCallback(() => {
    if (isUploading) return false;
    if (config.required && archivos.length === 0) return false;
    if (!config.required && archivos.length === 0) return true;
    return archivos.every(a => a.estado === 'exitoso');
  }, [archivos, isUploading, config.required]);

  // Emit changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid());
    }
  }, [archivos, isValid, onValidationChange]);

  useEffect(() => {
    if (onFilesChange) {
      const files = archivos
        .filter(a => a.file && a.estado === 'exitoso')
        .map(a => a.file!);
      onFilesChange(files);
    }
  }, [archivos, onFilesChange]);

  // Helper functions
  const generarIdUnico = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const truncateFileName = (fileName: string, maxLength: number = 30): string => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
    return `${truncatedName}...${extension}`;
  };

  const acceptAttribute = config.acceptedFileTypes.join(',');

  const fileTypesText = config.acceptedFileTypes
    .map(type => type.replace('.', '').toUpperCase())
    .join(', ');

  // Magic number validation
  const validarNumeroMagico = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        if (!e.target?.result) {
          resolve(false);
          return;
        }

        const arr = new Uint8Array(e.target.result as ArrayBuffer);
        const header = Array.from(arr.subarray(0, 4))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');

        const magicNumbers: { [key: string]: string[] } = {
          'png': ['89504e47'],
          'jpg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
          'pdf': ['25504446'],
          'zip': ['504b0304', '504b0506']
        };

        const esValido = Object.values(magicNumbers).some(numbers =>
          numbers.some(magic => header.startsWith(magic))
        );

        resolve(esValido);
      };

      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  // Add error file
  const agregarArchivoError = (file: File, mensaje: string) => {
    const archivo: ArchivoMetadata = {
      id: generarIdUnico(),
      nombre: file.name,
      tamano: formatFileSize(file.size),
      estado: 'error',
      progreso: 0,
      mensajeError: mensaje,
      file: file
    };
    setArchivos(prev => [...prev, archivo]);
  };

  // Process file with progress
  const procesarArchivoConProgreso = (archivoId: string, file: File): Promise<void> => {
    return new Promise((resolve) => {
      let progreso = 0;
      const duracionTotal = Math.min(3000, Math.max(500, file.size / (1024 * 1024) * 100));
      const incremento = 95 / (duracionTotal / 30);

      const intervalo = setInterval(() => {
        setArchivos(prev => {
          const archivo = prev.find(a => a.id === archivoId);
          if (!archivo || archivo.estado !== 'cargando') {
            clearInterval(intervalo);
            resolve();
            return prev;
          }

          progreso += incremento;

          if (progreso >= 95) {
            progreso = 95;
            clearInterval(intervalo);

            setTimeout(() => {
              setArchivos(current => {
                const archivoFinal = current.find(a => a.id === archivoId);
                if (archivoFinal && archivoFinal.estado === 'cargando') {
                  return current.map(a =>
                    a.id === archivoId ? { ...a, estado: 'exitoso' as const, progreso: 100 } : a
                  );
                }
                return current;
              });
              resolve();
            }, 100);
            return prev;
          }

          return prev.map(a =>
            a.id === archivoId ? { ...a, progreso: Math.round(progreso) } : a
          );
        });
      }, 30);
    });
  };

  // Handle files
  const handleFiles = async (files: File[]) => {
    let filesToProcess = [...files];

    // If not allowMultiple, clear and only take first
    if (!config.allowMultiple) {
      setArchivos([]);
      filesToProcess = [filesToProcess[0]];
    }

    const archivosParaProcesar: Array<{ file: File; id: string }> = [];

    for (const file of filesToProcess) {
      // Validate file name
      if (!file.name || file.name.trim() === '') {
        agregarArchivoError(file, 'El archivo no tiene nombre. Por favor, selecciona un archivo válido.');
        continue;
      }

      // Validate max files
      if (config.maxFiles && archivos.length >= config.maxFiles) {
        agregarArchivoError(file, `Solo puedes subir un máximo de ${config.maxFiles} archivo(s)`);
        continue;
      }

      // Validate duplicates
      const archivoDuplicado = archivos.find(a => a.nombre === file.name);
      if (archivoDuplicado) {
        agregarArchivoError(file, 'Este archivo ya ha sido agregado. Por favor, selecciona un archivo diferente.');
        continue;
      }

      // Validate file name length
      if (config.maxFileNameLength && file.name.length > config.maxFileNameLength) {
        agregarArchivoError(file, `El nombre del archivo es demasiado largo (máximo ${config.maxFileNameLength} caracteres).`);
        continue;
      }

      // Validate file type
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = config.acceptedFileTypes.includes(extension) ||
                         config.acceptedMimeTypes.includes(file.type);

      if (!isValidType) {
        agregarArchivoError(file, `Tipo de archivo no permitido. Solo se permiten: ${fileTypesText}`);
        continue;
      }

      // Validate magic number
      if (config.validateMagicNumber) {
        const esValido = await validarNumeroMagico(file);
        if (!esValido) {
          agregarArchivoError(file, 'El archivo no es válido o ha sido modificado.');
          continue;
        }
      }

      // Validate size
      const maxSizeBytes = config.maxFileSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        agregarArchivoError(file, `El archivo excede el tamaño máximo de ${config.maxFileSizeMB} MB`);
        continue;
      }

      // Add valid file
      const archivo: ArchivoMetadata = {
        id: generarIdUnico(),
        nombre: file.name,
        tamano: formatFileSize(file.size),
        estado: 'pendiente',
        progreso: 0,
        file: file
      };

      archivosParaProcesar.push({ file, id: archivo.id });
      setArchivos(prev => [...prev, archivo]);
    }

    // Process files sequentially
    for (const { file, id: archivoId } of archivosParaProcesar) {
      // Change to loading state
      setArchivos(prev => prev.map(a =>
        a.id === archivoId ? { ...a, estado: 'cargando' as const } : a
      ));

      await procesarArchivoConProgreso(archivoId, file);
    }
  };

  // Event handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const eliminarArchivo = (id: string) => {
    setArchivos(prev => prev.filter(a => a.id !== id));
  };

  const getArchivoAriaLabel = (archivo: ArchivoMetadata): string => {
    const estadoTexto = archivo.estado === 'exitoso' ? 'Archivo cargado exitosamente' :
                       archivo.estado === 'error' ? 'Error al cargar archivo' :
                       archivo.estado === 'pendiente' ? 'En espera' :
                       'Cargando archivo';
    return `${estadoTexto}: ${archivo.nombre}, tamaño: ${archivo.tamano}${archivo.estado === 'cargando' ? ', progreso: ' + archivo.progreso + '%' : ''}`;
  };

  // Icon components
  const UploadIcon = () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );

  const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  const ErrorIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  );

  const LoadingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  );

  const PendingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="file-uploader-container">
      {config.title && (
        <h4 className="uploader-title">
          <span dangerouslySetInnerHTML={{ __html: config.title }} />
          {config.tooltip && (
            <span
              className="help-icon"
              data-tooltip={config.tooltip}
              tabIndex={0}
              role="button"
              aria-label={`Ayuda: ${config.tooltip}`}
            >
              ?
            </span>
          )}
        </h4>
      )}

      {config.subtitle && (
        <p className="uploader-subtitle">
          {config.subtitle}
          {config.tooltip && !config.title && (
            <span
              className="help-icon"
              data-tooltip={config.tooltip}
              tabIndex={0}
              role="button"
              aria-label={`Ayuda: ${config.tooltip}`}
            >
              ?
            </span>
          )}
        </p>
      )}

      <div className="upload-card">
        <h4 className="upload-card-title" id="upload-title">
          {config.allowMultiple ? 'Subir archivos' : 'Subir archivo'}
        </h4>

        <div className="upload-container">
          <div className="upload-left">
            <div
              className={`upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={config.allowMultiple
                ? 'Zona para arrastrar y soltar archivos, o hacer clic para explorar archivos'
                : 'Zona para arrastrar y soltar archivo, o hacer clic para explorar archivo'}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="upload-icon" aria-hidden="true">
                <UploadIcon />
              </div>
              <p className="upload-text">
                {config.allowMultiple
                  ? 'Arrastra aquí los archivos para subir'
                  : 'Arrastra aquí el archivo para subir'}
                <br />o
              </p>
              <button
                type="button"
                className="btn-explore"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                aria-label={config.allowMultiple
                  ? 'Explorar archivos en tu computadora'
                  : 'Explorar archivo en tu computadora'}
              >
                {config.allowMultiple ? 'Explora tus archivos' : 'Explora tu archivo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                accept={acceptAttribute}
                multiple={config.allowMultiple}
                onChange={onFileSelected}
                aria-labelledby="upload-title"
                aria-label={config.allowMultiple ? 'Seleccionar múltiples archivos' : 'Seleccionar un archivo'}
              />
              <p className="upload-info">
                Tamaño máximo por archivo: {config.maxFileSizeMB} MB<br />
                Tipo de archivos permitidos: {fileTypesText}
              </p>
            </div>
          </div>

          <div className="upload-right">
            <div className="upload-list" role="list" aria-label="Lista de archivos subidos">
              {archivos.map((archivo) => (
                <div
                  key={archivo.id}
                  className={`upload-item ${archivo.estado}`}
                  role="listitem"
                  aria-label={getArchivoAriaLabel(archivo)}
                >
                  <div className="upload-item-info">
                    {archivo.estado === 'exitoso' && <span className="icon success"><CheckIcon /></span>}
                    {archivo.estado === 'error' && <span className="icon error"><ErrorIcon /></span>}
                    {archivo.estado === 'cargando' && <span className="icon loading"><LoadingIcon /></span>}
                    {archivo.estado === 'pendiente' && <span className="icon pending"><PendingIcon /></span>}
                    <span className="upload-item-name" title={`${archivo.nombre} - ${archivo.tamano}`}>
                      {truncateFileName(archivo.nombre)} - {archivo.tamano}
                    </span>
                    {archivo.estado === 'pendiente' && (
                      <span className="pending-label">En espera</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    disabled={archivo.estado === 'cargando'}
                    onClick={() => eliminarArchivo(archivo.id)}
                    aria-label={`Eliminar archivo ${archivo.nombre}`}
                  >
                    <CloseIcon />
                  </button>
                  <div
                    className={`upload-progress ${archivo.estado}`}
                    role="progressbar"
                    aria-valuenow={archivo.progreso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de carga: ${archivo.progreso}%`}
                    style={{ '--progress': archivo.progreso / 100 } as React.CSSProperties}
                  />
                  {archivo.estado === 'error' && archivo.mensajeError && (
                    <p className="error-message" role="alert" aria-live="assertive">
                      {archivo.mensajeError}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {config.required && archivos.length === 0 && (
          <div className="invalid-feedback d-block mt-2" role="alert">
            Archivo obligatorio
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
