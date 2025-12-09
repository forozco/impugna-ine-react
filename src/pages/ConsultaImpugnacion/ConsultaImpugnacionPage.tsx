/**
 * Pagina de Consulta de Impugnacion
 * Equivalente a: consulta-impugnacion.ts de Angular
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './ConsultaImpugnacionPage.scss';

type EstatusType = 'tramite' | 'registrado' | 'en_tramite' | 'publicado' | 'retirado';

interface Impugnacion {
  expediente: string;
  promovente: string;
  actoImpugnado: string;
  registro: string;
  retiro: string;
  estatus: EstatusType;
}

const ConsultaImpugnacionPage = () => {
  const [searchParams] = useSearchParams();

  const [folio, setFolio] = useState('');
  const [folioValido, setFolioValido] = useState(false);
  const [folioNoExiste, setFolioNoExiste] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [impugnaciones, setImpugnaciones] = useState<Impugnacion[]>([]);

  /**
   * Convierte el folio de formato URL (con guiones) a formato original (con barras)
   * INE-FOLIO-0093-2025 -> INE-FOLIO/0093/2025
   */
  const decodeFromUrl = (folioUrl: string): string => {
    return folioUrl.replace(/(\d{4})-(\d{4})$/, '$1/$2').replace(/FOLIO-/, 'FOLIO/');
  };

  /**
   * Formatea una fecha ISO a formato legible
   */
  const formatearFecha = (fechaISO: string | null | undefined): string => {
    if (!fechaISO) return 'N/A';

    try {
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear();
      const hora = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');

      return `${dia}/${mes}/${anio} / ${hora}:${minutos} horas`;
    } catch {
      return 'N/A';
    }
  };

  const validarFolio = useCallback(() => {
    if (!folio.trim()) {
      setFolioValido(false);
      setFolioNoExiste(false);
      return;
    }

    setLoading(true);
    setFolioNoExiste(false);

    // Simulacion de llamada al backend
    // En produccion, esto seria una llamada real al endpoint /consulta-impugna/folio
    setTimeout(() => {
      setLoading(false);

      // Simulamos que el folio existe si contiene "INE-FOLIO"
      if (folio.includes('INE-FOLIO')) {
        setFolioValido(true);
        setFolioNoExiste(false);
        setImpugnaciones([{
          expediente: folio,
          promovente: 'Nombre del Promovente',
          actoImpugnado: 'Descripcion del acto impugnado que puede ser muy larga y se truncara en la tabla',
          registro: formatearFecha(new Date().toISOString()),
          retiro: 'N/A',
          estatus: 'registrado'
        }]);
      } else {
        setFolioValido(false);
        setFolioNoExiste(true);
        setImpugnaciones([]);
      }
    }, 1500);
  }, [folio]);

  useEffect(() => {
    const folioParam = searchParams.get('folio');
    if (folioParam) {
      const decodedFolio = decodeFromUrl(folioParam);
      setFolio(decodedFolio);
      // Ejecutar busqueda automaticamente despues de setear el folio
      setTimeout(() => {
        if (decodedFolio.trim()) {
          setLoading(true);
          setFolioNoExiste(false);

          setTimeout(() => {
            setLoading(false);
            if (decodedFolio.includes('INE-FOLIO')) {
              setFolioValido(true);
              setFolioNoExiste(false);
              setImpugnaciones([{
                expediente: decodedFolio,
                promovente: 'Nombre del Promovente',
                actoImpugnado: 'Descripcion del acto impugnado',
                registro: formatearFecha(new Date().toISOString()),
                retiro: 'N/A',
                estatus: 'registrado'
              }]);
            } else {
              setFolioValido(false);
              setFolioNoExiste(true);
              setImpugnaciones([]);
            }
          }, 1500);
        }
      }, 100);
    }
  }, [searchParams]);

  const limpiarError = () => {
    setFolioNoExiste(false);
  };

  const hideTooltipInfo = () => {
    setShowTooltip(false);
  };

  const toggleTooltipMobile = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowTooltip(!showTooltip);
  };

  const getEstatusLabel = (estatus: EstatusType): string => {
    const labels: Record<EstatusType, string> = {
      tramite: 'Tramite',
      registrado: 'Registrado',
      en_tramite: 'En tramite',
      publicado: 'Publicado',
      retirado: 'Retirado'
    };
    return labels[estatus];
  };

  const getEstatusClass = (estatus: EstatusType): string => {
    return `status-${estatus}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validarFolio();
    }
  };

  return (
    <section className="consulta-container">
      <div className="consulta-content">
        {/* Titulo principal */}
        <h1 className="main-title">Consulta de estado</h1>

        {/* Dato obligatorio */}
        <p className="dato-obligatorio">Dato obligatorio <span className="text-danger">(*)</span></p>

        {/* Subtitulo */}
        <h2 className="subtitle">Ingresa el folio para consultar el avance del medio</h2>

        {/* Area de consulta */}
        <div className="consulta-box">
          <label className="folio-label" htmlFor="folio-input">
            Ingresa el folio de expediente asociado<span className="text-danger" aria-hidden="true">*</span>
          </label>

          <div className="folio-input-wrapper">
            <div className="input-button-group">
              <input
                type="text"
                id="folio-input"
                className="folio-input"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={limpiarError}
                placeholder="INE-FOLIO/0001/2025"
                name="folio"
                aria-label="Folio de expediente asociado"
                aria-required="true"
              />
              <button
                type="button"
                className="btn-buscar"
                onClick={validarFolio}
                disabled={!folio.trim() || loading}
                aria-label="Buscar impugnacion por folio"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {folioValido && (
              <div className="folio-status" role="status" aria-live="polite">
                <span className="status-badge">Folio correcto</span>
              </div>
            )}

            {folioNoExiste && (
              <div className="folio-status folio-error" role="alert" aria-live="assertive">
                <span className="status-badge status-badge-error">No existe un registro con el folio: {folio}</span>
              </div>
            )}
          </div>

          {/* Resultado de la consulta */}
          {folioValido && (
            <div className="resultado-section" role="region" aria-labelledby="resultado-title">
              <div className="resultado-header">
                <h3 className="resultado-title" id="resultado-title">
                  Resultado de la consulta<span className="text-danger" aria-hidden="true">*</span>
                </h3>
              </div>

              <div className="table-wrapper">
                <table className="resultado-table" role="table" aria-label="Resultados de impugnaciones encontradas">
                  <thead>
                    <tr>
                      <th scope="col">Numero de expediente INE</th>
                      <th scope="col">Promovente</th>
                      <th scope="col">Acto impugnado</th>
                      <th scope="col">Registro</th>
                      <th scope="col">Retiro de estrados</th>
                      <th scope="col" className="status-header">
                        Estado
                        <span className="tooltip-wrapper">
                          <button type="button" className="btn-tooltip" aria-label="Informacion sobre estado">
                            ?
                          </button>
                          <span className="tooltip-content" role="tooltip">
                            <span className="tooltip-item"><span className="tooltip-badge badge-tramite">Tramite</span> Impugnacion iniciada</span>
                            <span className="tooltip-item"><span className="tooltip-badge badge-registrado">Registrado</span> Impugnacion en sistema</span>
                            <span className="tooltip-item"><span className="tooltip-badge badge-en-tramite">En tramite</span> En proceso de resolucion</span>
                            <span className="tooltip-item"><span className="tooltip-badge badge-publicado">Publicado</span> En estrados</span>
                            <span className="tooltip-item"><span className="tooltip-badge badge-retirado">Retirado</span> Integracion de expediente</span>
                          </span>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {impugnaciones.map((impugnacion) => (
                      <tr key={impugnacion.expediente}>
                        <td data-label="Numero de expediente INE:">{impugnacion.expediente}</td>
                        <td data-label="Promovente:">{impugnacion.promovente}</td>
                        <td data-label="Acto impugnado:" className="acto-impugnado-cell" title={impugnacion.actoImpugnado}>
                          {impugnacion.actoImpugnado}
                        </td>
                        <td data-label="Registro:">{impugnacion.registro}</td>
                        <td data-label="Retiro de estrados:">{impugnacion.retiro}</td>
                        <td data-label="Estado:" className="status-cell">
                          <span className={getEstatusClass(impugnacion.estatus)} role="status">
                            {getEstatusLabel(impugnacion.estatus)}
                          </span>
                          <span className="tooltip-wrapper-mobile">
                            <button
                              type="button"
                              className="btn-tooltip"
                              aria-label="Informacion sobre estatus"
                              onClick={toggleTooltipMobile}
                            >
                              ?
                            </button>
                          </span>
                          {showTooltip && (
                            <div className="tooltip-content-mobile" role="tooltip" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn-close-tooltip"
                                onClick={hideTooltipInfo}
                                aria-label="Cerrar informacion"
                              >
                                <i className="bi bi-x-lg" aria-hidden="true">X</i>
                              </button>
                              <p className="tooltip-item-mobile"><span className="tooltip-badge badge-tramite">Tramite</span> Impugnacion iniciada</p>
                              <p className="tooltip-item-mobile"><span className="tooltip-badge badge-registrado">Registrado</span> Impugnacion en sistema</p>
                              <p className="tooltip-item-mobile"><span className="tooltip-badge badge-en-tramite">En tramite</span> En proceso de resolucion</p>
                              <p className="tooltip-item-mobile"><span className="tooltip-badge badge-publicado">Publicado</span> En estrados</p>
                              <p className="tooltip-item-mobile"><span className="tooltip-badge badge-retirado">Retirado</span> Integracion de expediente</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Texto informativo */}
        <div className="info-text">
          <p>Si deseas conocer mas sobre el seguimiento de la impugnacion,<br />consulta las <Link to="#" className="link-ayuda">Preguntas Frecuentes</Link></p>
        </div>
      </div>
    </section>
  );
};

export default ConsultaImpugnacionPage;
