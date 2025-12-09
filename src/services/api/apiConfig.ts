/**
 * Configuracion de API por ambiente
 * Equivalente a: api-endpoints.service.dev.ts de Angular
 */

// Tipos de ambiente
export type Environment = 'local' | 'dev' | 'prod';

// Interfaz de configuracion de API
export interface ApiConfig {
  baseUrl: string;
  headers: Record<string, string>;
}

// Configuracion por ambiente
const configs: Record<Environment, ApiConfig> = {
  local: {
    baseUrl: 'http://localhost:3000/api/v1/impugnaine',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  dev: {
    baseUrl: 'http://dev.api.kuadrant.local:30289/api/v1/impugnaine',
    headers: {
      'Content-Type': 'application/json',
      'Host': 'dev.api.kuadrant.local'
    }
  },
  prod: {
    baseUrl: 'https://api.impugnaine.gob.mx/api/v1/impugnaine',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};

// Detectar ambiente actual
const getEnvironment = (): Environment => {
  // Usar variable de entorno de Vite
  const env = import.meta.env.VITE_API_ENV as Environment;
  if (env && configs[env]) {
    return env;
  }

  // Fallback basado en hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'dev'; // En desarrollo local usamos el API de dev
  }
  if (hostname.includes('dev.') || hostname.includes('staging.')) {
    return 'dev';
  }
  return 'prod';
};

// Exportar configuracion actual
export const currentEnvironment = getEnvironment();
export const apiConfig = configs[currentEnvironment];

console.log(`[API-CONFIG] Ambiente detectado: ${currentEnvironment}`);
console.log(`[API-CONFIG] Base URL: ${apiConfig.baseUrl}`);

export default apiConfig;
