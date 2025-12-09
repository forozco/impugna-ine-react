/**
 * Servicio de Firmado Digital
 * Equivalente a: firmado.service.ts de Angular
 * Maneja la firma electronica de documentos con FIEL/e.firma
 */

import { httpClient } from './httpClient';
import { firmadoEndpoints } from './apiEndpoints';

// Interfaces
export interface DatosFirma {
  certificado: string; // Base64 del certificado .cer
  llavePrivada: string; // Base64 de la llave privada .key
  contrasena: string;
  documentoId: string;
}

export interface FirmaResponse {
  success: boolean;
  data: {
    firmaId: string;
    documentoId: string;
    fechaFirma: string;
    cadenaOriginal: string;
    selloDigital: string;
    certificadoNumero: string;
    rfcFirmante: string;
    nombreFirmante: string;
  };
  message?: string;
}

export interface ValidacionFirmaResponse {
  success: boolean;
  data: {
    valido: boolean;
    certificadoVigente: boolean;
    certificadoRevocado: boolean;
    fechaVigenciaInicio: string;
    fechaVigenciaFin: string;
    rfc: string;
    nombre: string;
    tipoPersona: 'fisica' | 'moral';
  };
  message?: string;
  errors?: string[];
}

export interface DocumentoParaFirmar {
  id: string;
  tipo: string;
  nombre: string;
  contenido?: string;
  hash?: string;
}

export interface CadenaOriginalResponse {
  success: boolean;
  data: {
    cadenaOriginal: string;
    hash: string;
    algoritmo: string;
  };
  message?: string;
}

/**
 * Servicio de firmado digital
 */
export const firmadoService = {
  /**
   * Validar certificado y llave privada
   */
  async validarCertificado(
    certificadoBase64: string,
    llavePrivadaBase64: string,
    contrasena: string
  ): Promise<ValidacionFirmaResponse> {
    console.log('[FIRMADO] Validando certificado...');
    const response = await httpClient.post<ValidacionFirmaResponse>(
      firmadoEndpoints.validar,
      {
        certificado: certificadoBase64,
        llavePrivada: llavePrivadaBase64,
        contrasena
      }
    );
    console.log('[FIRMADO] Resultado validacion:', response.data?.valido);
    return response;
  },

  /**
   * Firmar un documento
   */
  async firmar(datos: DatosFirma): Promise<FirmaResponse> {
    console.log('[FIRMADO] Firmando documento:', datos.documentoId);
    const response = await httpClient.post<FirmaResponse>(
      firmadoEndpoints.firmar,
      datos
    );
    console.log('[FIRMADO] Documento firmado:', response.data?.firmaId);
    return response;
  },

  /**
   * Obtener cadena original de un documento para firmar
   */
  async obtenerCadenaOriginal(documentoId: string): Promise<CadenaOriginalResponse> {
    console.log('[FIRMADO] Obteniendo cadena original:', documentoId);
    const response = await httpClient.get<CadenaOriginalResponse>(
      firmadoEndpoints.cadenaOriginal(documentoId)
    );
    return response;
  },

  /**
   * Verificar firma de un documento
   */
  async verificarFirma(documentoId: string): Promise<{
    success: boolean;
    data: {
      firmado: boolean;
      firmaValida: boolean;
      fechaFirma?: string;
      firmante?: string;
    };
  }> {
    console.log('[FIRMADO] Verificando firma:', documentoId);
    const response = await httpClient.get<{
      success: boolean;
      data: {
        firmado: boolean;
        firmaValida: boolean;
        fechaFirma?: string;
        firmante?: string;
      };
    }>(firmadoEndpoints.verificar(documentoId));
    return response;
  },

  /**
   * Leer archivo como Base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo data:application/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  },

  /**
   * Validar que el archivo sea un certificado .cer
   */
  isValidCertificateFile(file: File): boolean {
    const validExtensions = ['.cer'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return validExtensions.includes(extension);
  },

  /**
   * Validar que el archivo sea una llave privada .key
   */
  isValidKeyFile(file: File): boolean {
    const validExtensions = ['.key'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return validExtensions.includes(extension);
  },

  /**
   * Obtener documentos pendientes de firma del usuario
   */
  async obtenerDocumentosPendientes(): Promise<DocumentoParaFirmar[]> {
    try {
      console.log('[FIRMADO] Obteniendo documentos pendientes...');
      const response = await httpClient.get<{ success: boolean; data: DocumentoParaFirmar[] }>(
        firmadoEndpoints.pendientes
      );
      return response.data || [];
    } catch (error) {
      console.error('[FIRMADO] Error obteniendo documentos pendientes:', error);
      return [];
    }
  },

  /**
   * Descargar documento firmado
   */
  async descargarDocumentoFirmado(documentoId: string): Promise<Blob | null> {
    try {
      console.log('[FIRMADO] Descargando documento firmado:', documentoId);
      const response = await httpClient.get<Blob>(
        firmadoEndpoints.descargar(documentoId),
        { responseType: 'blob' }
      );
      return response;
    } catch (error) {
      console.error('[FIRMADO] Error descargando documento:', error);
      return null;
    }
  }
};

export default firmadoService;
