/**
 * Componente Modal de Error
 * Modal reutilizable para mostrar mensajes de error
 * Estilos copiados de Angular: confirm-exit-modal.component.scss
 */

import { useEffect, useCallback } from 'react';
import './ErrorModal.scss';

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

const ErrorModal = ({
  isOpen,
  title = 'Error',
  message,
  onClose,
  buttonText = 'Aceptar'
}: ErrorModalProps) => {

  // Cerrar con ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Cerrar al hacer clic en el backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={handleBackdropClick}></div>

      {/* Modal Container */}
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
      >
        <div className="modal-content">
          {/* Botón cerrar */}
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Icono de error */}
          <div className="modal-icon">
            <i className="bi bi-exclamation-circle-fill"></i>
          </div>

          {/* Título */}
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>

          {/* Mensaje */}
          <p id="modal-message" className="modal-message">
            {message}
          </p>

          {/* Botones */}
          <div className="modal-buttons">
            <button
              type="button"
              className="btn btn-aceptar"
              onClick={onClose}
              autoFocus
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorModal;
