/**
 * Componentes de botones reutilizables
 * Equivalente a: btn-primario, btn-secundario, btn-usuario de Angular
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'user';
  fullWidth?: boolean;
  ariaLabel?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  fullWidth = true,
  ariaLabel,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const variantClass = {
    primary: 'btn-primario',
    secondary: 'btn-secundario',
    user: 'btn-usuario'
  }[variant];

  return (
    <button
      className={`${variantClass} ${fullWidth ? 'w-100' : ''} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonPrimario = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const ButtonSecundario = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const ButtonUsuario = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="user" {...props} />
);

export default Button;
