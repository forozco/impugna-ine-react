/**
 * Servicio SEPOMEX para consulta de códigos postales
 * Equivalente a: sepomex.service.ts y postal-codes-fast.service.ts de Angular
 */

// Interfaces
export interface SepomexColonia {
  colonia: string;
  municipio: string;
  estado: string;
  ciudad: string;
  cp: string;
}

export interface SepomexResponse {
  colonias: SepomexColonia[];
}

export interface PostalCodeData {
  cp: string;
  estado: string;
  municipio: string;
  ciudad: string;
  colonias: string[];
}

export interface PostalCodesMap {
  [codigoPostal: string]: PostalCodeData;
}

// Cache en memoria del JSON completo
let postalCodesCache: PostalCodesMap | null = null;
let loadingPromise: Promise<PostalCodesMap> | null = null;

/**
 * Carga el JSON completo en memoria (lazy loading, solo una vez)
 */
const loadPostalCodes = async (): Promise<PostalCodesMap> => {
  // Si ya está cargado, retornar del cache
  if (postalCodesCache) {
    return postalCodesCache;
  }

  // Si ya está cargando, esperar a que termine
  if (loadingPromise) {
    return loadingPromise;
  }

  // Iniciar la carga
  console.log('[SEPOMEX] Cargando códigos postales bajo demanda...');

  loadingPromise = fetch('/postal-codes.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data: PostalCodesMap) => {
      console.log(`[SEPOMEX] Cargados ${Object.keys(data).length} códigos postales en memoria`);
      postalCodesCache = data;
      return data;
    })
    .catch(error => {
      console.error('[SEPOMEX] Error al cargar JSON:', error);
      loadingPromise = null; // Permitir reintentar
      return {};
    });

  return loadingPromise;
};

/**
 * Busca un código postal en memoria (búsqueda O(1) instantánea)
 */
export const searchPostalCode = async (codigoPostal: string): Promise<PostalCodeData | null> => {
  // Validar formato
  if (!codigoPostal || codigoPostal.length !== 5 || !/^\d{5}$/.test(codigoPostal)) {
    return null;
  }

  const data = await loadPostalCodes();
  const result = data[codigoPostal];

  if (result) {
    console.log(`[SEPOMEX] CP ${codigoPostal} encontrado en memoria`);
  } else {
    console.log(`[SEPOMEX] CP ${codigoPostal} no encontrado`);
  }

  return result || null;
};

/**
 * Consulta los datos de un código postal
 * Busca primero en memoria (JSON), con fallback a API si es necesario
 */
export const consultarCodigoPostal = async (codigoPostal: string): Promise<SepomexResponse | null> => {
  // Validar que el código postal tenga 5 dígitos
  if (!codigoPostal || codigoPostal.length !== 5 || !/^\d{5}$/.test(codigoPostal)) {
    return null;
  }

  console.log('[SEPOMEX] Consultando código postal:', codigoPostal);

  try {
    // Buscar en memoria (JSON cargado)
    const data = await searchPostalCode(codigoPostal);

    if (data) {
      // Transformar al formato esperado
      const colonias: SepomexColonia[] = data.colonias.map(col => ({
        colonia: col,
        municipio: data.municipio,
        estado: data.estado,
        ciudad: data.ciudad,
        cp: data.cp
      }));

      console.log('[SEPOMEX] Datos encontrados en memoria:', colonias.length, 'colonias');
      console.log('[SEPOMEX] Datos autocargados:', {
        colonias: colonias.length,
        colonia: colonias[0]?.colonia,
        ciudad: data.ciudad,
        estado: data.estado,
        municipio: data.municipio
      });

      return { colonias };
    }

    // Fallback a API si no está en memoria
    console.log('[SEPOMEX] No encontrado en memoria, consultando API...');
    return await consultarAPI(codigoPostal);
  } catch (error) {
    console.error('[SEPOMEX] Error, usando API como fallback:', error);
    return await consultarAPI(codigoPostal);
  }
};

/**
 * Consulta la API externa (fallback)
 */
const consultarAPI = async (codigoPostal: string): Promise<SepomexResponse | null> => {
  const url = `/api/sepomex/${codigoPostal}.json`;
  console.log('[SEPOMEX] Consultando API:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log('[SEPOMEX] API no disponible o CP no encontrado');
      return null;
    }

    const apiResponse = await response.json();
    console.log('[SEPOMEX] Respuesta API recibida:', apiResponse);

    if (!apiResponse || !apiResponse.data || !apiResponse.data.postcodes || apiResponse.data.postcodes.length === 0) {
      console.log('[SEPOMEX] No se encontraron datos en la API');
      return null;
    }

    // Transformar los datos de la API al formato esperado
    const colonias: SepomexColonia[] = apiResponse.data.postcodes.map((postcode: any) => ({
      colonia: postcode.d_asenta,
      municipio: postcode.d_mnpio,
      estado: postcode.d_estado,
      ciudad: postcode.d_ciudad,
      cp: postcode.d_codigo
    }));

    console.log('[SEPOMEX] Colonias transformadas desde API:', colonias);
    return { colonias };
  } catch (error) {
    console.error('[SEPOMEX] Error al consultar API:', error);
    return null;
  }
};

/**
 * Pre-carga el JSON en memoria (opcional, para cargar al inicio de la app)
 */
export const preloadPostalCodes = async (): Promise<void> => {
  await loadPostalCodes();
  console.log('[SEPOMEX] Pre-carga completada');
};

/**
 * Verifica si un código postal existe (sin devolver datos completos)
 */
export const existsPostalCode = async (codigoPostal: string): Promise<boolean> => {
  const data = await searchPostalCode(codigoPostal);
  return data !== null;
};

/**
 * Limpia el cache (útil para testing)
 */
export const clearCache = (): void => {
  postalCodesCache = null;
  loadingPromise = null;
  console.log('[SEPOMEX] Cache limpiado');
};

// Export default para uso más sencillo
const sepomexService = {
  consultarCodigoPostal,
  searchPostalCode,
  preloadPostalCodes,
  existsPostalCode,
  clearCache
};

export default sepomexService;
