/**
 * Componente AlertModal - Modal de alertas/confirmaciones
 * Equivalente a: AlertModalComponent de Angular
 */

import { useEffect, useCallback } from 'react';
import { useAlertStore } from '../../../stores/alertStore';
import './AlertModal.scss';

const AlertModal = () => {
  const { isOpen, config, close } = useAlertStore();

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  // Prevenir scroll del body cuando el modal esta abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close(false);
    }
  }, [close]);

  const handleConfirm = useCallback(() => {
    close(true);
  }, [close]);

  const handleCancel = useCallback(() => {
    close(false);
  }, [close]);

  if (!isOpen || !config) return null;

  const getIconByType = () => {
    switch (config.type) {
      case 'success':
        return (
          <svg className="alert-icon success" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg className="alert-icon error" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg className="alert-icon warning" viewBox="0 0 24 24" fill="none">
            <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="alert-icon info" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div className="alert-modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={`alert-modal-content ${config.type}`}>
        <div className="alert-modal-header">
          {getIconByType()}
          <h2 className="alert-modal-title">{config.title}</h2>
        </div>

        <div className="alert-modal-body">
          <p className="alert-modal-message">{config.message}</p>
        </div>

        <div className="alert-modal-footer">
          {config.showCancel && (
            <button
              className="btn btn-cancel"
              onClick={handleCancel}
              type="button"
            >
              {config.cancelText || 'Cancelar'}
            </button>
          )}
          <button
            className={`btn btn-confirm ${config.type}`}
            onClick={handleConfirm}
            type="button"
            autoFocus
          >
            {config.confirmText || 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
