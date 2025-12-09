/**
 * Pagina 404 - Not Found
 */

import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '6rem', margin: '0', color: '#582E73' }}>404</h1>
      <h2 style={{ margin: '1rem 0' }}>Pagina no encontrada</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        La pagina que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/"
        style={{
          background: '#582E73',
          color: 'white',
          padding: '0.75rem 2rem',
          borderRadius: '25px',
          textDecoration: 'none',
          fontWeight: '500'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
