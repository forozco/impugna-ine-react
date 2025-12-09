/**
 * Cliente HTTP base para todas las llamadas a la API
 * Equivalente al HttpClient de Angular con interceptores
 */

import { apiConfig } from './apiConfig';

// Tipos de respuesta
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// Opciones de request
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  withCredentials?: boolean;
}

// Clase de error personalizada
export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

/**
 * Construir URL con query params
 */
const buildUrl = (url: string, params?: Record<string, string | number | boolean>): string => {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${url}?${searchParams.toString()}`;
};

/**
 * Merge headers con los headers por defecto
 */
const mergeHeaders = (customHeaders?: Record<string, string>): Record<string, string> => {
  return {
    ...apiConfig.headers,
    ...customHeaders
  };
};

/**
 * Procesar respuesta HTTP
 */
const processResponse = async <T>(response: Response): Promise<T> => {
  // Log para debugging
  console.log(`[HTTP] Response ${response.status} from ${response.url}`);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    console.error(`[HTTP] Error:`, errorData);
    throw new HttpError(response.status, response.statusText, errorData);
  }

  // Verificar si hay contenido
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    console.warn('[HTTP] Response is not JSON:', text);
    return text as unknown as T;
  }
};

/**
 * Cliente HTTP
 */
export const httpClient = {
  /**
   * GET request
   */
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = buildUrl(url, options.params);
    console.log(`[HTTP] GET ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: mergeHeaders(options.headers),
      credentials: options.withCredentials ? 'include' : 'same-origin'
    });

    return processResponse<T>(response);
  },

  /**
   * POST request
   */
  async post<T>(url: string, body?: any, options: RequestOptions = {}): Promise<T> {
    console.log(`[HTTP] POST ${url}`, body);

    const response = await fetch(url, {
      method: 'POST',
      headers: mergeHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials: options.withCredentials ? 'include' : 'same-origin'
    });

    return processResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T>(url: string, body?: any, options: RequestOptions = {}): Promise<T> {
    console.log(`[HTTP] PUT ${url}`, body);

    const response = await fetch(url, {
      method: 'PUT',
      headers: mergeHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials: options.withCredentials ? 'include' : 'same-origin'
    });

    return processResponse<T>(response);
  },

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: any, options: RequestOptions = {}): Promise<T> {
    console.log(`[HTTP] PATCH ${url}`, body);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: mergeHeaders(options.headers),
      body: body ? JSON.stringify(body) : undefined,
      credentials: options.withCredentials ? 'include' : 'same-origin'
    });

    return processResponse<T>(response);
  },

  /**
   * DELETE request
   */
  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    console.log(`[HTTP] DELETE ${url}`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: mergeHeaders(options.headers),
      credentials: options.withCredentials ? 'include' : 'same-origin'
    });

    return processResponse<T>(response);
  },

  /**
   * POST con FormData (para subida de archivos)
   */
  async postFormData<T>(url: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    console.log(`[HTTP] POST FormData ${url}`);

    // No incluir Content-Type para FormData (el browser lo agrega automaticamente)
    const headers = { ...options.headers };
    delete headers['Content-Type'];

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: options.withCredentials ? 'include' : 'same-origin'
    });

    return processResponse<T>(response);
  }
};

export default httpClient;
