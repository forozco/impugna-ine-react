/**
 * Componente Footer (Pie de Pagina)
 * Equivalente a: pie-pagina de Angular
 */

import './Footer.scss';

const APP_VERSION = '1.0.0';

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo" aria-label="Informacion Institucional">
      <div className="footer-content d-flex justify-content-between align-items-center">
        <div aria-label="Identidad institucional">
          {/* Logo opcional */}
        </div>
        <div aria-label="Derechos reservados">
          <p className="font-12-regular">
            &copy; Derechos Reservados | Instituto Nacional Electoral 2025 | Mexico | v{APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
