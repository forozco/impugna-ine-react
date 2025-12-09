/**
 * Pagina de Registro - Entry point para registrar impugnaciones
 * Equivalente a: registro.component.ts de Angular
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegistroPage.scss';

type ExpandedType = 'ampliacion' | 'coadyuvante' | 'amicus' | null;

const RegistroPage = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<ExpandedType>(null);

  // Folio states
  const [folioAmpliacion, setFolioAmpliacion] = useState('');
  const [folioCoadyuvante, setFolioCoadyuvante] = useState('');
  const [folioAmicus, setFolioAmicus] = useState('');

  // Touch states
  const [ampliacionTouched, setAmpliacionTouched] = useState(false);
  const [coadyuvanteTouched, setCoadyuvanteTouched] = useState(false);
  const [amicusTouched, setAmicusTouched] = useState(false);

  // Loading states
  const [buscandoAmpliacion, setBuscandoAmpliacion] = useState(false);
  const [buscandoCoadyuvante, setBuscandoCoadyuvante] = useState(false);
  const [buscandoAmicus, setBuscandoAmicus] = useState(false);

  // Error states
  const [errorAmpliacion, setErrorAmpliacion] = useState<string | null>(null);
  const [errorCoadyuvante, setErrorCoadyuvante] = useState<string | null>(null);
  const [errorAmicus, setErrorAmicus] = useState<string | null>(null);

  const handleExpand = (tipo: ExpandedType) => {
    setExpanded(expanded === tipo ? null : tipo);
  };

  const onCardKeyDown = (e: React.KeyboardEvent, tipo: ExpandedType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExpand(tipo);
    }
  };

  const isAmpliacionValid = () => folioAmpliacion.trim().length > 0;
  const isCoadyuvanteValid = () => folioCoadyuvante.trim().length > 0;
  const isAmicusValid = () => folioAmicus.trim().length > 0;

  const onFolioChange = (tipo: ExpandedType) => {
    if (tipo === 'ampliacion') setErrorAmpliacion(null);
    if (tipo === 'coadyuvante') setErrorCoadyuvante(null);
    if (tipo === 'amicus') setErrorAmicus(null);
  };

  const buscarAmpliacion = () => {
    if (!isAmpliacionValid()) return;
    setBuscandoAmpliacion(true);
    setErrorAmpliacion(null);

    // Simulacion de busqueda
    setTimeout(() => {
      setBuscandoAmpliacion(false);
      if (folioAmpliacion.includes('INE-FOLIO')) {
        navigate(`/registro-impugnacion?tipo=ampliacion&expediente=${encodeURIComponent(folioAmpliacion)}`);
      } else {
        setErrorAmpliacion('No se encontro el expediente con ese folio');
      }
    }, 1500);
  };

  const buscarCoadyuvante = () => {
    if (!isCoadyuvanteValid()) return;
    setBuscandoCoadyuvante(true);
    setErrorCoadyuvante(null);

    setTimeout(() => {
      setBuscandoCoadyuvante(false);
      if (folioCoadyuvante.includes('INE-FOLIO')) {
        navigate(`/registro-impugnacion?tipo=coadyuvante&expediente=${encodeURIComponent(folioCoadyuvante)}`);
      } else {
        setErrorCoadyuvante('No se encontro el expediente con ese folio');
      }
    }, 1500);
  };

  const buscarAmicus = () => {
    if (!isAmicusValid()) return;
    setBuscandoAmicus(true);
    setErrorAmicus(null);

    setTimeout(() => {
      setBuscandoAmicus(false);
      if (folioAmicus.includes('INE-FOLIO')) {
        navigate(`/registro-impugnacion?tipo=amicus&expediente=${encodeURIComponent(folioAmicus)}`);
      } else {
        setErrorAmicus('No se encontro el expediente con ese folio');
      }
    }, 1500);
  };

  return (
    <section className="wizard-container">
      <div className="actores-container">
        <h4>Registro</h4>
        <h6>Selecciona la opcion deseada</h6>
        <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

        <div className="actores-grid" role="group" aria-label="Opciones de actores involucrados">
          {/* Nueva impugnacion */}
          <Link
            className="actores-card registro-option"
            to="/registro-impugnacion"
            tabIndex={0}
            role="button"
            aria-label="Nueva impugnacion"
          >
            <div className="actores-icon" aria-hidden="true">
              <img src="/assets/imgs/nueva-impugnacion.svg" alt="" />
            </div>
            <div className="actores-title">Nueva impugnacion</div>
          </Link>

          {/* Ampliacion de demanda */}
          <div
            className={`actores-card registro-option clickable ${expanded === 'ampliacion' ? 'expanded' : ''}`}
            onClick={() => handleExpand('ampliacion')}
            onKeyDown={(e) => onCardKeyDown(e, 'ampliacion')}
            tabIndex={0}
            role="button"
            aria-expanded={expanded === 'ampliacion'}
            aria-label="Ampliacion de demanda"
          >
            <div className="card-header">
              <div className="actores-icon" aria-hidden="true">
                <img src="/assets/imgs/ampliacion-demanda.svg" alt="" />
              </div>
              <div className="actores-title">Ampliacion de demanda</div>
            </div>
            <div
              className={`acordeon ${expanded === 'ampliacion' ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="region"
            >
              <div className="acordeon-content">
                <label htmlFor="folio">Ingresa el folio / no. expediente asociado<span className="text-danger">*</span></label>
                <input
                  id="folio"
                  type="text"
                  placeholder="INE-FOLIO/0001/2025"
                  className={`form-control ${errorAmpliacion ? 'input-error' : ''}`}
                  value={folioAmpliacion}
                  onChange={(e) => { setFolioAmpliacion(e.target.value); onFolioChange('ampliacion'); }}
                  onBlur={() => setAmpliacionTouched(true)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarAmpliacion()}
                  required
                  aria-label="Folio o numero de expediente para ampliacion"
                  aria-required="true"
                />
                {ampliacionTouched && !isAmpliacionValid() && (
                  <p className="dato-obligatorio error-message">Este campo es obligatorio</p>
                )}
                {errorAmpliacion && (
                  <p className="error-consulta" role="alert">
                    <i className="bi bi-exclamation-circle">!</i>
                    {errorAmpliacion}
                  </p>
                )}
                <button
                  type="button"
                  className="btn-buscar"
                  onClick={buscarAmpliacion}
                  disabled={!isAmpliacionValid() || buscandoAmpliacion}
                  aria-label="Buscar ampliacion"
                >
                  {buscandoAmpliacion ? (
                    <>
                      <span className="spinner"></span>
                      Buscando...
                    </>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tercero interesado - Coadyuvante */}
          <div
            className={`actores-card registro-option clickable ${expanded === 'coadyuvante' ? 'expanded' : ''}`}
            onClick={() => handleExpand('coadyuvante')}
            onKeyDown={(e) => onCardKeyDown(e, 'coadyuvante')}
            tabIndex={0}
            role="button"
            aria-expanded={expanded === 'coadyuvante'}
            aria-label="Tercero interesado - Coadyuvante"
          >
            <div className="card-header">
              <div className="actores-icon" aria-hidden="true">
                <img src="/assets/imgs/tercero-interesado.svg" alt="" />
              </div>
              <div className="actores-title">Tercero interesado-Coadyuvante</div>
            </div>
            <div
              className={`acordeon ${expanded === 'coadyuvante' ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="region"
            >
              <div className="acordeon-content">
                <label htmlFor="folio-coadyuvante">Ingresa el folio / no. expediente asociado<span className="text-danger">*</span></label>
                <input
                  id="folio-coadyuvante"
                  type="text"
                  placeholder="INE-FOLIO/0001/2025"
                  className={`form-control ${errorCoadyuvante ? 'input-error' : ''}`}
                  value={folioCoadyuvante}
                  onChange={(e) => { setFolioCoadyuvante(e.target.value); onFolioChange('coadyuvante'); }}
                  onBlur={() => setCoadyuvanteTouched(true)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarCoadyuvante()}
                  required
                  aria-label="Folio o numero de expediente para coadyuvante"
                  aria-required="true"
                />
                {coadyuvanteTouched && !isCoadyuvanteValid() && (
                  <p className="dato-obligatorio error-message">Este campo es obligatorio</p>
                )}
                {errorCoadyuvante && (
                  <p className="error-consulta" role="alert">
                    <i className="bi bi-exclamation-circle">!</i>
                    {errorCoadyuvante}
                  </p>
                )}
                <button
                  type="button"
                  className="btn-buscar"
                  onClick={buscarCoadyuvante}
                  disabled={!isCoadyuvanteValid() || buscandoCoadyuvante}
                  aria-label="Buscar coadyuvante"
                >
                  {buscandoCoadyuvante ? (
                    <>
                      <span className="spinner"></span>
                      Buscando...
                    </>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Amigo de la corte - Amicus curiae */}
          <div
            className={`actores-card registro-option clickable ${expanded === 'amicus' ? 'expanded' : ''}`}
            onClick={() => handleExpand('amicus')}
            onKeyDown={(e) => onCardKeyDown(e, 'amicus')}
            tabIndex={0}
            role="button"
            aria-expanded={expanded === 'amicus'}
            aria-label="Amigo de la corte - Amicus curiae"
          >
            <div className="card-header">
              <div className="actores-icon" aria-hidden="true">
                <img src="/assets/imgs/amigo-de-la-corte.svg" alt="" />
              </div>
              <div className="actores-title">Amigo de la corte (Amicus curiae)</div>
            </div>
            <div
              className={`acordeon ${expanded === 'amicus' ? 'open' : ''}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="region"
            >
              <div className="acordeon-content">
                <label htmlFor="folio-amicus">Ingresa el folio / no. expediente asociado<span className="text-danger">*</span></label>
                <input
                  id="folio-amicus"
                  type="text"
                  placeholder="INE-FOLIO/0001/2025"
                  className={`form-control ${errorAmicus ? 'input-error' : ''}`}
                  value={folioAmicus}
                  onChange={(e) => { setFolioAmicus(e.target.value); onFolioChange('amicus'); }}
                  onBlur={() => setAmicusTouched(true)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarAmicus()}
                  required
                  aria-label="Folio o numero de expediente para amicus curiae"
                  aria-required="true"
                />
                {amicusTouched && !isAmicusValid() && (
                  <p className="dato-obligatorio error-message">Este campo es obligatorio</p>
                )}
                {errorAmicus && (
                  <p className="error-consulta" role="alert">
                    <i className="bi bi-exclamation-circle">!</i>
                    {errorAmicus}
                  </p>
                )}
                <button
                  type="button"
                  className="btn-buscar"
                  onClick={buscarAmicus}
                  disabled={!isAmicusValid() || buscandoAmicus}
                  aria-label="Buscar amicus curiae"
                >
                  {buscandoAmicus ? (
                    <>
                      <span className="spinner"></span>
                      Buscando...
                    </>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistroPage;
