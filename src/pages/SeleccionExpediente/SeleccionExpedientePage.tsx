/**
 * Pagina de Seleccion de Expediente
 * Equivalente a: seleccion-expediente.component.ts de Angular
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { consultaService } from '../../services/api';
import './SeleccionExpedientePage.scss';

type TipoRegistro = 'ampliacion' | 'coadyuvante' | 'amicus';

interface ExpedienteResultado {
  numeroExpediente: string;
  promovente: string;
  actoImpugnado: string;
  registro: string;
  retiroEstrados: string;
  estatus: string;
  seleccionado: boolean;
}

const SeleccionExpedientePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Estados
  const [folio, setFolio] = useState<string>('');
  const [folioValido, setFolioValido] = useState<boolean>(false);
  const [folioNoExiste, setFolioNoExiste] = useState<boolean>(false);
  const [resultados, setResultados] = useState<ExpedienteResultado[]>([]);
  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>('ampliacion');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed: verificar si hay algun expediente seleccionado
  const tieneExpedienteSeleccionado = useMemo(() => {
    return resultados.some(r => r.seleccionado);
  }, [resultados]);

  /**
   * Decodifica el folio de la URL: reemplaza - por /
   * Patron: INE-FOLIO-0001-2025 -> INE-FOLIO/0001/2025
   */
  const decodeFromUrl = useCallback((folioUrl: string): string => {
    return folioUrl.replace(/^(INE-FOLIO)-(\d+)-(\d+)$/, '$1/$2/$3');
  }, []);

  /**
   * Codifica el folio/expediente para URL limpia: reemplaza / por -
   */
  const encodeForUrl = useCallback((folioStr: string): string => {
    return folioStr.replace(/\//g, '-');
  }, []);

  /**
   * Formatea una fecha ISO a formato legible
   */
  const formatearFecha = useCallback((fechaISO: string | null | undefined): string => {
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
  }, []);

  /**
   * Buscar folio en el backend
   */
  const buscarFolio = useCallback(async (folioIngresado: string) => {
    const folioTrimmed = folioIngresado.trim();

    if (!folioTrimmed) {
      setFolioValido(false);
      setFolioNoExiste(false);
      setResultados([]);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setFolioNoExiste(false);

    try {
      const response = await consultaService.consultarPorFolio(folioTrimmed);

      console.log('[SELECCION-EXPEDIENTE] Respuesta del servidor:', response);

      if (!response.success || response.mensaje?.includes('No existe un registro')) {
        setFolioValido(false);
        setFolioNoExiste(true);
        setErrorMessage(response.mensaje || 'No existe un registro con el folio ingresado');
        setResultados([]);
      } else {
        setFolioValido(true);
        setFolioNoExiste(false);
        setResultados([{
          numeroExpediente: response.folio || folioTrimmed,
          promovente: response.promovente || 'N/A',
          actoImpugnado: response.descripcionImpugna || 'N/A',
          registro: formatearFecha(response.fechaRecepcion),
          retiroEstrados: response.fechaRetiro ? formatearFecha(response.fechaRetiro) : 'N/A',
          estatus: 'Registrado',
          seleccionado: false
        }]);
      }
    } catch (error) {
      console.error('[SELECCION-EXPEDIENTE] Error consultando folio:', error);
      setFolioValido(false);
      setFolioNoExiste(false);
      setResultados([]);
      setErrorMessage('Error al consultar el expediente. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [formatearFecha]);

  // Inicializar desde query params
  useEffect(() => {
    const tipo = searchParams.get('tipo');
    if (tipo === 'ampliacion' || tipo === 'coadyuvante' || tipo === 'amicus') {
      setTipoRegistro(tipo);
    }

    const folioParam = searchParams.get('folio');
    if (folioParam) {
      const folioDecodificado = decodeFromUrl(folioParam);
      setFolio(folioDecodificado);
      buscarFolio(folioDecodificado);
    }
  }, [searchParams, decodeFromUrl, buscarFolio]);

  // Scroll al titulo despues de cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tituloRef.current) {
        tituloRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Seleccionar expediente (toggle)
   */
  const seleccionarExpediente = (index: number) => {
    setResultados(prev => prev.map((r, i) => ({
      ...r,
      seleccionado: i === index ? !r.seleccionado : false
    })));
  };

  /**
   * Continuar al wizard correspondiente
   */
  const continuar = () => {
    const expedienteSeleccionado = resultados.find(r => r.seleccionado);

    if (!expedienteSeleccionado) {
      return;
    }

    const expedienteEncoded = encodeForUrl(expedienteSeleccionado.numeroExpediente);

    if (tipoRegistro === 'ampliacion') {
      navigate(`/registro-impugnacion/actores?tipo=ampliacion&expediente=${expedienteEncoded}`);
    } else if (tipoRegistro === 'coadyuvante') {
      navigate(`/registro-impugnacion/actores?tipo=coadyuvante&expediente=${expedienteEncoded}`);
    } else if (tipoRegistro === 'amicus') {
      navigate(`/amicus-curiae/datos?tipo=amicus&expediente=${expedienteEncoded}`);
    }
  };

  /**
   * Obtener titulo segun tipo de registro
   */
  const getTitulo = (): string => {
    if (tipoRegistro === 'ampliacion') {
      return 'Ampliacion de demanda';
    } else if (tipoRegistro === 'coadyuvante') {
      return 'Tercero interesado-Coadyuvante';
    } else {
      return 'Amigo de la corte (Amicus curiae)';
    }
  };

  /**
   * Obtener icono segun tipo de registro
   */
  const getIcono = (): string => {
    if (tipoRegistro === 'ampliacion') {
      return '/assets/imgs/ampliacion-demanda.svg';
    } else if (tipoRegistro === 'coadyuvante') {
      return '/assets/imgs/tercero-interesado.svg';
    } else {
      return '/assets/imgs/amigo-de-la-corte.svg';
    }
  };

  /**
   * Obtener subtitulo
   */
  const getSubtitulo = (): string => {
    return 'Selecciona el folio o no. expediente asociado para realizar un registro';
  };

  /**
   * Obtener titulo principal
   */
  const getTituloPrincipal = (): string => {
    if (tipoRegistro === 'ampliacion') {
      return 'Registro de Ampliacion de demanda';
    } else if (tipoRegistro === 'coadyuvante') {
      return 'Registro de Tercero interesado-Coadyuvante';
    } else {
      return 'Registro de Amigo de la corte (Amicus curiae)';
    }
  };

  /**
   * Obtener clase CSS para el badge de estado
   */
  const getEstatusClass = (estatus: string): string => {
    const estatusLower = estatus.toLowerCase().replace(/\s+/g, '_');
    return `status-${estatusLower}`;
  };

  return (
    <section className="wizard-container">
      <div className="seleccion-container">
        <h4 ref={tituloRef}>{getTituloPrincipal()}</h4>
        <h6>{getSubtitulo()}</h6>

        {/* Card principal */}
        <div className="card-wrapper">
          <div className="icon-section">
            <img src={getIcono()} alt={getTitulo()} className="icon-svg" />
          </div>

          <h3 className="card-title">{getTitulo()}</h3>

          <div className="search-section">
            <div className="input-wrapper">
              {folioValido && (
                <div className="valid-banner">
                  Folio correcto
                </div>
              )}
            </div>
          </div>

          {/* Seccion de resultados */}
          {resultados.length > 0 && (
            <div className="results-section">
              <p className="instruction-text">
                Marca la casilla de verificacion para seleccionar el numero de expediente y visualizar su estatus
              </p>

              <div className="consulta-title">
                Resultado de la consulta
              </div>

              <div className="table-responsive">
                <table className="tabla-resultados">
                  <thead>
                    <tr>
                      <th className="col-checkbox"></th>
                      <th>Numero de expediente</th>
                      <th>Promovente</th>
                      <th>Acto impugnado</th>
                      <th>Registro</th>
                      <th>Retiro de estrados</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((resultado, i) => (
                      <tr
                        key={resultado.numeroExpediente}
                        onClick={() => seleccionarExpediente(i)}
                        className={resultado.seleccionado ? 'selected' : ''}
                      >
                        <td className="text-center checkbox-cell">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={resultado.seleccionado}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => seleccionarExpediente(i)}
                          />
                        </td>
                        <td className="fw-medium expediente-cell" data-label="Numero de expediente:">
                          {resultado.numeroExpediente}
                        </td>
                        <td data-label="Promovente:">{resultado.promovente}</td>
                        <td
                          className="acto-impugnado-cell"
                          data-label="Acto impugnado:"
                          title={resultado.actoImpugnado}
                        >
                          {resultado.actoImpugnado}
                        </td>
                        <td data-label="Registro:">{resultado.registro}</td>
                        <td data-label="Retiro de estrados:">{resultado.retiroEstrados}</td>
                        <td data-label="Estado:" className="status-cell">
                          <span className={getEstatusClass(resultado.estatus)}>
                            {resultado.estatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!tieneExpedienteSeleccionado && (
                <div className="text-danger validation-message">
                  Marca la casilla de verificacion
                </div>
              )}

              <hr />

              {/* Boton continuar */}
              <div className="button-section">
                <button
                  type="button"
                  className="btn-continuar"
                  onClick={continuar}
                  disabled={!tieneExpedienteSeleccionado}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-section">
              <span className="spinner"></span>
              Buscando expediente...
            </div>
          )}

          {/* Error */}
          {errorMessage && !loading && (
            <div className="error-section">
              <p className="error-message">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SeleccionExpedientePage;
