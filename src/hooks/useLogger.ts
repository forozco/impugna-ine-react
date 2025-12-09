/**
 * Hook para logging que se desactiva en produccion
 * Equivalente a: LoggerService de Angular
 */

const isProduction = import.meta.env.PROD;

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  table: (data: unknown) => void;
  group: (label: string) => void;
  groupEnd: () => void;
}

export const useLogger = (): Logger => {
  return {
    /**
     * Log de informacion general (equivalente a console.log)
     */
    log: (...args: unknown[]) => {
      if (!isProduction) {
        console.log(...args);
      }
    },

    /**
     * Log de advertencias (equivalente a console.warn)
     */
    warn: (...args: unknown[]) => {
      if (!isProduction) {
        console.warn(...args);
      }
    },

    /**
     * Log de errores (equivalente a console.error)
     * Se muestra incluso en produccion para debugging critico
     */
    error: (...args: unknown[]) => {
      console.error(...args);
    },

    /**
     * Log de debug detallado (solo en desarrollo)
     */
    debug: (...args: unknown[]) => {
      if (!isProduction) {
        console.debug(...args);
      }
    },

    /**
     * Log de informacion en tabla (equivalente a console.table)
     */
    table: (data: unknown) => {
      if (!isProduction) {
        console.table(data);
      }
    },

    /**
     * Agrupa logs relacionados (equivalente a console.group)
     */
    group: (label: string) => {
      if (!isProduction) {
        console.group(label);
      }
    },

    /**
     * Cierra un grupo de logs
     */
    groupEnd: () => {
      if (!isProduction) {
        console.groupEnd();
      }
    }
  };
};

// Export singleton para uso fuera de componentes React
export const logger: Logger = {
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
  table: (data: unknown) => {
    if (!isProduction) {
      console.table(data);
    }
  },
  group: (label: string) => {
    if (!isProduction) {
      console.group(label);
    }
  },
  groupEnd: () => {
    if (!isProduction) {
      console.groupEnd();
    }
  }
};
