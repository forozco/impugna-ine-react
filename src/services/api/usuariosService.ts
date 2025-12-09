/**
 * Servicio de Usuarios
 * Equivalente a: usuarios.service.ts de Angular
 */

import { httpClient, HttpError } from './httpClient';
import { usuariosEndpoints } from './apiEndpoints';

// Interfaces de request/response
export interface RegistroUsuarioRequest {
  usuario: {
    correoValido: boolean;
    mailPersona: string;
    contraseniaUsuario: string;
    fechaAltaUser: string;
    fechaHora: string;
    usuarioActivo: boolean;
  };
  persona: {
    direccionPersona: string;
    tipoPersona: number;
    usuarioPersona: string | null;
    rfcPersona: string;
    curpPersona: string;
    telefonoPersona: string;
    nombrePersona: string;
    apellidoPaternoPersona: string;
    apellidoMaternoPersona: string;
    generoPersona: string;
    fechaAltaPersona: string;
    userActPersona: string;
    callePersona: string;
    codigoPostal: string;
    colonia: string;
    ciudadPersona: string | null;
    estadoPersona: string | null;
    numIntPersona: string | null;
    numExtPersona: string | null;
    fechaActPersona: string;
  };
}

export interface RegistroUsuarioResponse {
  success: boolean;
  message: string;
  usuarioId?: number;
  error?: string;
}

export interface PerfilUsuario {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  genero: string;
  telefono: string;
  curp: string;
  rfc: string;
  direccion: string;
  codigoPostal: string;
  colonia: string;
  ciudad: string;
  estado: string;
  fechaRegistro: string;
}

export interface PerfilResponse {
  success: boolean;
  usuario: PerfilUsuario;
  message?: string;
}

/**
 * Servicio de usuarios
 */
export const usuariosService = {
  /**
   * Registrar nuevo usuario
   */
  async registrar(data: RegistroUsuarioRequest): Promise<RegistroUsuarioResponse> {
    try {
      console.log('[USUARIOS] Registrando nuevo usuario...');
      console.log('[USUARIOS] Payload:', JSON.stringify(data, null, 2));

      const response = await httpClient.post<RegistroUsuarioResponse>(
        usuariosEndpoints.registroCompleto,
        data
      );

      console.log('[USUARIOS] Registro response:', response);
      return response;
    } catch (error) {
      console.error('[USUARIOS] Error en registro:', error);

      if (error instanceof HttpError) {
        // Manejar errores especificos
        if (error.status === 400) {
          return {
            success: false,
            message: 'Datos de registro invalidos',
            error: error.data?.message || 'Verifica los campos del formulario'
          };
        }
        if (error.status === 409) {
          return {
            success: false,
            message: 'El correo electronico ya esta registrado',
            error: 'EMAIL_EXISTS'
          };
        }
      }

      return {
        success: false,
        message: 'Error al registrar usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  },

  /**
   * Obtener perfil de usuario por ID
   */
  async getPerfil(usuarioId: number): Promise<PerfilResponse> {
    try {
      console.log('[USUARIOS] Obteniendo perfil del usuario:', usuarioId);

      const response = await httpClient.get<PerfilResponse>(
        usuariosEndpoints.getPerfil(usuarioId)
      );

      console.log('[USUARIOS] Perfil response:', response);
      return response;
    } catch (error) {
      console.error('[USUARIOS] Error obteniendo perfil:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil de usuario
   */
  async actualizarPerfil(usuarioId: number, data: Partial<PerfilUsuario>): Promise<PerfilResponse> {
    try {
      console.log('[USUARIOS] Actualizando perfil del usuario:', usuarioId);

      const response = await httpClient.put<PerfilResponse>(
        usuariosEndpoints.getPerfil(usuarioId),
        data
      );

      console.log('[USUARIOS] Actualizacion response:', response);
      return response;
    } catch (error) {
      console.error('[USUARIOS] Error actualizando perfil:', error);
      throw error;
    }
  }
};

export default usuariosService;
