/**
 * Servicio de Autenticacion
 * Equivalente a: auth.service.ts de Angular
 */

import { httpClient, HttpError } from './httpClient';
import { authEndpoints, recuperaPasswordEndpoints } from './apiEndpoints';

// Interfaces de request/response
export interface LoginRequest {
  mailPersona: string;
  password: string;
}

// La respuesta del backend puede tener cualquier estructura cuando es exitosa
// Lo importante es que si no hay error HTTP, el OTP fue enviado
export interface LoginResponse {
  success: boolean;
  requiresOtp: boolean;
  message?: string;
  sessionToken?: string;
  // Campos adicionales que puede devolver el backend
  [key: string]: unknown;
}

export interface VerificarCodigoRequest {
  mailPersona: string;
  codigoOTP: string;
}

// Respuesta real del backend
interface VerificarCodigoBackendResponse {
  mensaje?: string;
  usuarioId?: number;
  nombreUsuario?: string;
  correo?: string;
  token?: string;
}

export interface VerificarCodigoResponse {
  success: boolean;
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol?: string;
  };
  message: string;
}

export interface RecuperarPasswordRequest {
  email: string;
}

export interface ValidarOtpRequest {
  email: string;
  otp: string;
}

export interface CambiarPasswordRequest {
  email: string;
  otp: string;
  nuevaContrasenia: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

/**
 * Servicio de autenticacion
 */
export const authService = {
  /**
   * Iniciar sesion con credenciales
   * Si la petición es exitosa (HTTP 200), significa que el OTP fue enviado
   * Si hay error HTTP, las credenciales son incorrectas
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('[AUTH] Iniciando sesion...');
      const response = await httpClient.post<LoginResponse>(
        authEndpoints.iniciarSesion,
        credentials
      );
      console.log('[AUTH] Login response:', response);
      // Si llegamos aquí sin error, el login fue exitoso y el OTP fue enviado
      return {
        ...response,
        success: true,
        requiresOtp: true
      };
    } catch (error) {
      console.error('[AUTH] Error en login:', error);
      if (error instanceof HttpError) {
        if (error.status === 401) {
          return {
            success: false,
            requiresOtp: false,
            message: 'Correo electrónico o contraseña incorrectos'
          };
        }
        if (error.status === 400) {
          return {
            success: false,
            requiresOtp: false,
            message: (error as HttpError & { body?: { mensaje?: string; message?: string } }).body?.mensaje ||
                     (error as HttpError & { body?: { mensaje?: string; message?: string } }).body?.message ||
                     'Error al iniciar sesión. Por favor verifica tus datos.'
          };
        }
      }
      throw error;
    }
  },

  /**
   * Verificar codigo OTP
   * El backend devuelve: { mensaje, usuarioId, nombreUsuario, correo, token? }
   * Transformamos a: { success, token, usuario: { id, nombre, email }, message }
   */
  async verificarCodigo(data: VerificarCodigoRequest): Promise<VerificarCodigoResponse> {
    try {
      console.log('[AUTH] Verificando codigo OTP...');
      const response = await httpClient.post<VerificarCodigoBackendResponse>(
        authEndpoints.verificarCodigo,
        data
      );
      console.log('[AUTH] Verificacion response (raw):', response);

      // Transformar respuesta del backend al formato esperado
      const transformedResponse: VerificarCodigoResponse = {
        success: true,
        token: response.token || '', // El backend puede no devolver token en este endpoint
        usuario: {
          id: response.usuarioId || 0,
          nombre: response.nombreUsuario || '',
          email: response.correo || data.mailPersona
        },
        message: response.mensaje || 'Autenticación exitosa'
      };

      console.log('[AUTH] Verificacion response (transformed):', transformedResponse);
      return transformedResponse;
    } catch (error) {
      console.error('[AUTH] Error verificando OTP:', error);
      throw error;
    }
  },

  /**
   * Reenviar codigo OTP
   */
  async reenviarOtp(email: string): Promise<AuthResponse> {
    try {
      console.log('[AUTH] Reenviando codigo OTP...');
      const response = await httpClient.post<AuthResponse>(
        `${authEndpoints.reenviarOtp}?mailPersona=${encodeURIComponent(email)}`,
        {}
      );
      console.log('[AUTH] Reenvio response:', response);
      return response;
    } catch (error) {
      console.error('[AUTH] Error reenviando OTP:', error);
      throw error;
    }
  },

  /**
   * Solicitar codigo OTP para recuperar contrasena
   */
  async solicitarRecuperacion(data: RecuperarPasswordRequest): Promise<AuthResponse> {
    try {
      console.log('[AUTH] Solicitando recuperacion de contrasena...');
      const response = await httpClient.post<AuthResponse>(
        recuperaPasswordEndpoints.solicitarOtp,
        data
      );
      console.log('[AUTH] Solicitud recuperacion response:', response);
      return response;
    } catch (error) {
      console.error('[AUTH] Error solicitando recuperacion:', error);
      throw error;
    }
  },

  /**
   * Validar codigo OTP de recuperacion
   */
  async validarOtpRecuperacion(data: ValidarOtpRequest): Promise<AuthResponse> {
    try {
      console.log('[AUTH] Validando OTP de recuperacion...');
      const response = await httpClient.post<AuthResponse>(
        recuperaPasswordEndpoints.validarOtp,
        data
      );
      console.log('[AUTH] Validacion OTP response:', response);
      return response;
    } catch (error) {
      console.error('[AUTH] Error validando OTP:', error);
      throw error;
    }
  },

  /**
   * Cambiar contrasena
   */
  async cambiarPassword(data: CambiarPasswordRequest): Promise<AuthResponse> {
    try {
      console.log('[AUTH] Cambiando contrasena...');
      const response = await httpClient.post<AuthResponse>(
        recuperaPasswordEndpoints.cambiarContrasenia,
        data
      );
      console.log('[AUTH] Cambio contrasena response:', response);
      return response;
    } catch (error) {
      console.error('[AUTH] Error cambiando contrasena:', error);
      throw error;
    }
  }
};

export default authService;
