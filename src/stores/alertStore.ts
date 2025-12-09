/**
 * Store de Zustand para alertas/modales
 * Equivalente a: AlertModalService de Angular
 */

import { create } from 'zustand';
import type { AlertModalConfig, AlertType } from '../types/impugnacion.types';

interface AlertStore {
  // Estado
  isOpen: boolean;
  config: AlertModalConfig | null;
  resolveCallback: ((value: boolean) => void) | null;

  // Acciones
  show: (config: AlertModalConfig) => Promise<boolean>;
  success: (title: string, message: string) => Promise<boolean>;
  error: (title: string, message: string) => Promise<boolean>;
  warning: (title: string, message: string, showCancel?: boolean) => Promise<boolean>;
  info: (title: string, message: string) => Promise<boolean>;
  confirm: (title: string, message: string) => Promise<boolean>;
  close: (result: boolean) => void;
}

const createDefaultConfig = (
  type: AlertType,
  title: string,
  message: string,
  showCancel = false
): AlertModalConfig => ({
  title,
  message,
  type,
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  showCancel
});

export const useAlertStore = create<AlertStore>((set, get) => ({
  // Estado inicial
  isOpen: false,
  config: null,
  resolveCallback: null,

  // Acciones
  show: (config: AlertModalConfig) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        config,
        resolveCallback: resolve
      });
    });
  },

  success: (title: string, message: string) => {
    return get().show(createDefaultConfig('success', title, message));
  },

  error: (title: string, message: string) => {
    return get().show(createDefaultConfig('error', title, message));
  },

  warning: (title: string, message: string, showCancel = false) => {
    return get().show(createDefaultConfig('warning', title, message, showCancel));
  },

  info: (title: string, message: string) => {
    return get().show(createDefaultConfig('info', title, message));
  },

  confirm: (title: string, message: string) => {
    return get().show({
      ...createDefaultConfig('warning', title, message, true),
      confirmText: 'Confirmar',
      cancelText: 'Cancelar'
    });
  },

  close: (result: boolean) => {
    const { resolveCallback } = get();
    if (resolveCallback) {
      resolveCallback(result);
    }
    set({
      isOpen: false,
      config: null,
      resolveCallback: null
    });
  }
}));
