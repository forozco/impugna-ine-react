/**
 * Pagina de Registro Exitoso Usuario
 * Equivalente a: registro-exitoso-usuario.ts de Angular
 */

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRegistroUsuarioStore } from '../../stores/registroUsuarioStore';
import './RegistroExitosoUsuarioPage.scss';

const RegistroExitosoUsuarioPage = () => {
  const location = useLocation();
  const { formData, reset } = useRegistroUsuarioStore();

  // Obtener el email del store
  const emailRegistrado = formData.email || 'correo@ejemplo.com';

  // Log para debugging (igual que Angular)
  useEffect(() => {
    console.log('[REGISTRO-EXITOSO] Componente inicializado');
    console.log('[REGISTRO-EXITOSO] Datos en store al inicializar:', formData);
    console.log('[REGISTRO-EXITOSO] Obteniendo email del store:', emailRegistrado);
  }, [formData, emailRegistrado]);

  // Limpiar el store cuando el usuario navegue a cualquier otra página
  useEffect(() => {
    // Cleanup cuando el componente se desmonta (navegación a otra página)
    return () => {
      console.log('[REGISTRO-EXITOSO] Saliendo de registro-exitoso-usuario, limpiando store');
      reset();
    };
  }, [reset]);

  // También limpiar si la ubicación cambia (navegación dentro de la app)
  useEffect(() => {
    const currentPath = location.pathname;

    return () => {
      // Solo limpiar si realmente estamos saliendo de esta página
      if (currentPath === '/registro-exitoso-usuario') {
        console.log('[REGISTRO-EXITOSO] Navegación detectada, limpiando store');
        reset();
      }
    };
  }, [location.pathname, reset]);

  return (
    <>
      <section className="registro-exitoso-container">
        <div className="registro-exitoso-content">

          {/* Título principal */}
          <h1 className="main-title">¡Registro exitoso!</h1>

          {/* Icono de check verde */}
          <div className="success-icon">
            <i className="bi bi-check-lg"></i>
          </div>

          {/* Caja de información */}
          <div className="info-box">
            <h2 className="info-title">
              Hemos enviado un correo de confirmación<br />
              a la dirección {emailRegistrado}
            </h2>
            <p className="info-text">
              Revisa tu correo electrónico y sigue el enlace para<br />
              validar tu cuenta
            </p>
          </div>

          {/* Texto importante */}
          <div className="important-text">
            <p><strong>Importante:</strong></p>
            <p>El uso de esta cuenta implica la aceptación de los términos y condiciones, así como del aviso de privacidad establecido por el Instituto Nacional Electoral.</p>
          </div>

          {/* Separador */}
          <hr className="separator" />

          {/* Botón de iniciar sesión */}
          <div className="action-button">
            <Link to="/auth/login" className="btn-iniciar-sesion">
              Iniciar sesión
            </Link>
          </div>

        </div>
      </section>
    </>
  );
};

export default RegistroExitosoUsuarioPage;
