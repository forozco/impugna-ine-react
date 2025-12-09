/**
 * Componentes de campos de texto reutilizables
 * Equivalente a: textarea-primario y form-control de Angular
 */

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import './Input.scss';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  errorMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, errorMessage, className = '', ...props }, ref) => {
    return (
      <div className="input-wrapper">
        <input
          ref={ref}
          className={`form-control ${error ? 'error' : ''} ${className}`}
          aria-invalid={error}
          {...props}
        />
        {error && errorMessage && (
          <span className="error-message" role="alert" aria-live="polite">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, errorMessage, className = '', ...props }, ref) => {
    return (
      <div className="textarea-wrapper">
        <textarea
          ref={ref}
          className={`textarea-primario ${error ? 'error' : ''} ${className}`}
          aria-invalid={error}
          {...props}
        />
        {error && errorMessage && (
          <span className="error-message" role="alert" aria-live="polite">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
