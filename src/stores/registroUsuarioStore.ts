/**
 * Store para manejar los datos del formulario de registro de usuario
 * Equivalente a: RegistroUsuarioFormService de Angular
 */

import { create } from 'zustand';

// Interface para los datos del registro de usuario
export interface RegistroUsuarioData {
  nombre: string;
  primerApellido: string;
  segundoApellido?: string;
  genero?: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  acceptNotifications: boolean;
  calle?: string;
  codigoPostal?: string;
  colonia?: string;
  alcaldia?: string;
  ciudad?: string;
  entidad?: string;
  aceptaPrivacidad: boolean;
  aceptaTerminos: boolean;
  archivos?: File[];
  // Campos adicionales
  curp?: string;
  rfc?: string;
  telefono?: string;
  fechaNacimiento?: string;
  numInt?: string;
  numExt?: string;
}

interface RegistroUsuarioState {
  formData: Partial<RegistroUsuarioData>;

  // Actions
  getFormData: () => Partial<RegistroUsuarioData>;
  setFormData: (data: Partial<RegistroUsuarioData>) => void;
  updateFormData: (data: Partial<RegistroUsuarioData>) => void;
  reset: () => void;
  generateBackendPayload: () => any;
}

// Helper para mapear género
const mapGenero = (genero: string | undefined): string => {
  if (!genero) return 'M';

  const generoMap: { [key: string]: string } = {
    'masculino': 'M',
    'femenino': 'F',
    'otro': 'O'
  };

  return generoMap[genero.toLowerCase()] || 'M';
};

// Helper para construir dirección completa
const buildDireccionCompleta = (data: Partial<RegistroUsuarioData>): string => {
  const partes: string[] = [];

  // Parte 1: Calle y números
  const calleNumeros: string[] = [];
  if (data.calle) {
    calleNumeros.push(data.calle.trim());
  }
  if (data.numExt) {
    calleNumeros.push(data.numExt.trim());
  }
  if (data.numInt) {
    calleNumeros.push(data.numInt.trim());
  }
  if (calleNumeros.length > 0) {
    partes.push(calleNumeros.join(' '));
  }

  // Parte 2: Código postal
  if (data.codigoPostal) {
    partes.push(`CP ${data.codigoPostal.trim()}`);
  }

  // Parte 3: Colonia
  if (data.colonia) {
    partes.push(data.colonia.trim());
  }

  // Parte 4: Alcaldía/Municipio
  if (data.alcaldia) {
    partes.push(data.alcaldia.trim());
  }

  // Parte 5: Ciudad
  if (data.ciudad) {
    partes.push(data.ciudad.trim());
  }

  // Parte 6: Entidad federativa
  if (data.entidad) {
    partes.push(data.entidad.trim());
  }

  return partes.join(', ') || 'Sin dirección especificada';
};

export const useRegistroUsuarioStore = create<RegistroUsuarioState>((set, get) => ({
  formData: {},

  getFormData: () => get().formData,

  setFormData: (data) => set({ formData: data }),

  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  reset: () => set({ formData: {} }),

  generateBackendPayload: () => {
    const data = get().formData;

    console.log('[REGISTRO-USUARIO-STORE] Datos del store para generar payload:', data);

    // Fechas en formato ISO
    const now = new Date().toISOString().substring(0, 19);

    // Verificar si se aceptaron notificaciones
    const acceptNotifications = data.acceptNotifications || false;

    // Construir la dirección concatenada
    const direccionCompleta = buildDireccionCompleta(data);

    const payload = {
      usuario: {
        correoValido: false,
        mailPersona: data.email || '',
        contraseniaUsuario: data.password || '',
        fechaAltaUser: now,
        fechaHora: now,
        usuarioActivo: true
      },
      persona: {
        direccionPersona: direccionCompleta,
        tipoPersona: 6,
        usuarioPersona: null,
        rfcPersona: data.rfc || '',
        curpPersona: data.curp || '',
        telefonoPersona: data.telefono || '',
        nombrePersona: data.nombre || '',
        apellidoPaternoPersona: data.primerApellido || '',
        apellidoMaternoPersona: data.segundoApellido || '',
        generoPersona: mapGenero(data.genero),
        fechaAltaPersona: now,
        userActPersona: data.email || '',
        callePersona: acceptNotifications ? (data.calle || '') : '',
        codigoPostal: acceptNotifications ? (data.codigoPostal || '') : '',
        colonia: acceptNotifications ? (data.colonia || '') : '',
        ciudadPersona: acceptNotifications ? (data.ciudad || '') : null,
        estadoPersona: acceptNotifications ? (data.entidad || '') : null,
        numIntPersona: acceptNotifications ? (data.numInt || '') : null,
        numExtPersona: acceptNotifications ? (data.numExt || '') : null,
        fechaActPersona: now
      }
    };

    console.log('[REGISTRO-USUARIO-STORE] JSON para backend generado:', JSON.stringify(payload, null, 2));

    return payload;
  }
}));
