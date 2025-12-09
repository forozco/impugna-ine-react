/**
 * Pagina de inicio - Home
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.scss';

const HomePage = () => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const toggleTooltip = () => {
    setTooltipVisible(prev => !prev);
  };

  return (
    <div className="home-container">
      {/* Banner superior */}
      <div className="banner-section">
        <img
          src="/assets/imgs/home/BANNER HOME_1400.png"
          alt="Banner ImpugnaINE"
          className="banner-image"
        />
      </div>

      {/* Titulo de bienvenida */}
      <div className="welcome-section">
        <h1 className="welcome-title">Bienvenida(o) a ImpugnaINE</h1>
        <p className="welcome-subtitle">
          En este sistema puedes registrar un medio de impugnacion en materia electoral,<br />
          con las siguientes ventajas:
        </p>
      </div>

      {/* Seccion de ventajas */}
      <div className="benefits-section">
        <div className="benefit-item">
          <img src="/assets/imgs/home/Plazos.svg" alt="" className="benefit-icon" loading="lazy" aria-hidden="true" />
          <p className="benefit-text">
            Tener certeza de los plazos<br />
            y terminos de los medios<br />
            de impugnacion
          </p>
        </div>

        <div className="benefit-item">
          <img src="/assets/imgs/home/Facilitar el derecho.svg" alt="" className="benefit-icon" loading="lazy" aria-hidden="true" />
          <p className="benefit-text">
            Ejercer el derecho<br />
            a impugnar actos o<br />
            resoluciones electorales
          </p>
        </div>

        <div className="benefit-item">
          <img src="/assets/imgs/home/Ventajas digitalizacion.svg" alt="" className="benefit-icon" loading="lazy" aria-hidden="true" />
          <p className="benefit-text">
            Acceder a la<br />
            digitalizacion<br />
            del tramite
          </p>
        </div>

        <div className="benefit-item">
          <img src="/assets/imgs/home/Agilizar los plazos.svg" alt="" className="benefit-icon" loading="lazy" aria-hidden="true" />
          <p className="benefit-text">
            Agilizar la recepcion y<br />
            envio de documentos
          </p>
        </div>

        <div className="benefit-item">
          <img src="/assets/imgs/home/Certeza tramite.svg" alt="" className="benefit-icon" loading="lazy" aria-hidden="true" />
          <p className="benefit-text">
            Dar seguimiento al<br />
            estado del tramite
          </p>
        </div>
      </div>

      {/* Banner inferior con nota de firmas electronicas */}
      <div className="info-banner">
        <p className="info-text">
          Para hacer el registro necesitas la firma electronica SAT o Firma INE<br />
          y los siguientes <a href="#" className="link-requerimientos"><strong>requerimientos</strong></a>.
        </p>
        <Link to="/registro-nuevo-usuario" className="btn-registrate">
          Registrate
        </Link>
        <div className="info-tooltip-container">
          <button
            className="info-icon"
            onClick={toggleTooltip}
            aria-label="Mas informacion sobre firmas electronicas"
          >
            ?
          </button>
          {tooltipVisible && (
            <div className="tooltip-content">
              Consulta como obtener las firmas<br />
              en el apartado de "Preguntas frecuentes"
            </div>
          )}
        </div>
      </div>

      {/* Footer con derechos reservados */}
      <div className="footer-copyright">
        {/* Derechos Reservados | Instituto Nacional Electoral 2025 | Mexico */}
      </div>
    </div>
  );
};

export default HomePage;
