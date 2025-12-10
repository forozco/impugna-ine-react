/**
 * Pagina de Revisar Datos (DEBUG)
 * Equivalente a: revisar-data.component.ts de Angular
 * Muestra los datos del formulario antes de enviar al backend
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistroUsuarioStore } from '../../stores/registroUsuarioStore';
import './RevisarDataPage.scss';

type OrigenWizard = 'registro-nuevo-usuario' | 'registro-impugnacion' | 'amicus-curiae' | 'firmado' | null;

interface ArchivoParaEnvio {
  step: string;
  nombre: string;
  tamano: string;
  tipo: string;
  file?: File;
}

const RevisarDataPage = () => {
  const navigate = useNavigate();

  // Stores
  const { formData: registroUsuarioData, generateBackendPayload, reset: resetRegistroUsuario } = useRegistroUsuarioStore();

  // Estados
  const [datosCompletos, setDatosCompletos] = useState<Record<string, unknown>>({});
  const [archivosParaEnvio, setArchivosParaEnvio] = useState<ArchivoParaEnvio[]>([]);
  const [mostrarJSON, setMostrarJSON] = useState(false);
  const [origenWizard, setOrigenWizard] = useState<OrigenWizard>(null);
  const [enviando, setEnviando] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [mensajeProgreso, setMensajeProgreso] = useState('');

  // Formatear tamaño de archivo
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }, []);

  // Detectar origen y cargar datos
  useEffect(() => {
    console.log('============================================');
    console.log('[REVISAR-DATA] Inicializando componente');
    console.log('============================================');

    // Detectar de qué wizard venimos basado en el referrer o historial
    const previousPath = document.referrer || '';
    console.log('[REVISAR-DATA] previousPath:', previousPath);

    // Verificar datos disponibles
    const tieneRegistroUsuario = registroUsuarioData && Object.keys(registroUsuarioData).length > 0;

    console.log('[REVISAR-DATA] tieneRegistroUsuario:', tieneRegistroUsuario);
    console.log('[REVISAR-DATA] registroUsuarioData:', registroUsuarioData);

    // Determinar origen basado en datos disponibles o URL previa
    if (tieneRegistroUsuario) {
      console.log('[REVISAR-DATA] Detectado: Registro Nuevo Usuario');
      setOrigenWizard('registro-nuevo-usuario');
      setDatosCompletos(registroUsuarioData as Record<string, unknown>);

      // Cargar archivos si existen
      if (registroUsuarioData.archivos && registroUsuarioData.archivos.length > 0) {
        const archivos: ArchivoParaEnvio[] = registroUsuarioData.archivos.map((file: File) => ({
          step: 'Personalidad',
          nombre: file.name,
          tamano: formatFileSize(file.size),
          tipo: file.type,
          file
        }));
        setArchivosParaEnvio(archivos);
      }
    } else {
      console.log('[REVISAR-DATA] No hay datos en ningún wizard');
    }
  }, [registroUsuarioData, formatFileSize]);

  // JSON Payload
  const jsonPayload = useMemo(() => {
    if (origenWizard === 'registro-nuevo-usuario') {
      const payload = generateBackendPayload();
      return JSON.stringify(payload, null, 2);
    }
    return JSON.stringify(datosCompletos, null, 2);
  }, [origenWizard, datosCompletos, generateBackendPayload]);

  // Handlers
  const toggleJSON = useCallback(() => {
    setMostrarJSON(prev => !prev);
  }, []);

  const copyJSON = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonPayload);
      alert('JSON copiado al portapapeles!');
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar el JSON');
    }
  }, [jsonPayload]);

  const volver = useCallback(() => {
    if (origenWizard === 'registro-nuevo-usuario') {
      console.log('[REVISAR-DATA] Volviendo a registro-nuevo-usuario');
      navigate('/registro-nuevo-usuario');
    } else if (origenWizard === 'registro-impugnacion') {
      navigate('/registro-impugnacion/evidencia');
    } else if (origenWizard === 'amicus-curiae') {
      navigate('/amicus-curiae/escrito');
    } else {
      navigate(-1);
    }
  }, [origenWizard, navigate]);

  const enviarAlBackend = useCallback(async () => {
    setEnviando(true);
    setProgresoSubida(0);
    setMensajeProgreso('Preparando envío...');

    try {
      // Simular envío por ahora
      console.log('[REVISAR-DATA] Enviando datos al backend...');
      console.log('[REVISAR-DATA] Payload:', jsonPayload);

      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgresoSubida(i);
        if (i < 30) {
          setMensajeProgreso('Guardando datos...');
        } else if (i < 80) {
          setMensajeProgreso('Subiendo archivos...');
        } else {
          setMensajeProgreso('Finalizando...');
        }
      }

      // Limpiar store
      if (origenWizard === 'registro-nuevo-usuario') {
        resetRegistroUsuario();
      }

      setMensajeProgreso('¡Enviado exitosamente!');

      // Redirigir después de un breve delay
      setTimeout(() => {
        if (origenWizard === 'registro-nuevo-usuario') {
          navigate('/registro-exitoso-usuario');
        } else {
          navigate('/registro');
        }
      }, 1500);

    } catch (error) {
      console.error('[REVISAR-DATA] Error:', error);
      setMensajeProgreso('Error al enviar. Intenta de nuevo.');
      setTimeout(() => {
        setEnviando(false);
      }, 2000);
    }
  }, [jsonPayload, origenWizard, navigate, resetRegistroUsuario]);

  // Obtener título según origen
  const getTitulo = useCallback((): string => {
    if (origenWizard === 'registro-nuevo-usuario') {
      return 'DEBUG: Revisar Datos - Registro de Usuario';
    }
    return 'DEBUG: Revisar Datos para Backend';
  }, [origenWizard]);

  // Renderizar datos según origen
  const renderDatosResumen = () => {
    if (origenWizard === 'registro-nuevo-usuario') {
      const data = datosCompletos as Record<string, unknown>;
      return (
        <div className="datos-grid">
          <div className="dato-card">
            <h3>Datos Personales</h3>
            <p><strong>Nombre:</strong> {data.nombre as string || '(vacío)'}</p>
            <p><strong>Primer Apellido:</strong> {data.primerApellido as string || '(vacío)'}</p>
            <p><strong>Segundo Apellido:</strong> {data.segundoApellido as string || '(vacío)'}</p>
            <p><strong>Género:</strong> {data.genero as string || '(no seleccionado)'}</p>
          </div>

          <div className="dato-card">
            <h3>Cuenta</h3>
            <p><strong>Email:</strong> {data.email as string || '(vacío)'}</p>
            <p><strong>Confirmar Email:</strong> {data.confirmEmail as string || '(vacío)'}</p>
            <p><strong>Contraseña:</strong> {data.password ? '****' + (data.password as string).slice(-4) : '(vacío)'}</p>
          </div>

          {Boolean(data.acceptNotifications) && (
            <div className="dato-card">
              <h3>Domicilio (Notificaciones)</h3>
              <p><strong>Calle:</strong> {String(data.calle || '(vacío)')}</p>
              <p><strong>Código Postal:</strong> {String(data.codigoPostal || '(vacío)')}</p>
              <p><strong>Colonia:</strong> {String(data.colonia || '(vacío)')}</p>
              <p><strong>Alcaldía:</strong> {String(data.alcaldia || '(vacío)')}</p>
              <p><strong>Ciudad:</strong> {String(data.ciudad || '(vacío)')}</p>
              <p><strong>Entidad:</strong> {String(data.entidad || '(vacío)')}</p>
            </div>
          )}

          <div className="dato-card">
            <h3>Confirmaciones</h3>
            <p><strong>Acepta Notificaciones:</strong> {data.acceptNotifications ? 'Sí' : 'No'}</p>
            <p><strong>Acepta Privacidad:</strong> {data.aceptaPrivacidad ? 'Sí' : 'No'}</p>
            <p><strong>Acepta Términos:</strong> {data.aceptaTerminos ? 'Sí' : 'No'}</p>
          </div>
        </div>
      );
    }

    return <p>No hay datos para mostrar</p>;
  };

  return (
    <div className="revisar-data-container">
      <div className="revisar-data-content">

        {/* Encabezado */}
        <div className="header">
          <h1>{getTitulo()}</h1>
          <p className="subtitle">[Desarrollo] Preview de datos y archivos para envío</p>
        </div>

        {/* Sección de archivos */}
        <div className="section archivos-section">
          <h2>ARCHIVOS ({archivosParaEnvio.length})</h2>

          {archivosParaEnvio.length === 0 ? (
            <div className="empty-state">
              <p>No hay archivos para enviar</p>
            </div>
          ) : (
            <>
              <div className="archivos-list">
                {archivosParaEnvio.map((archivo, index) => (
                  <div key={`${archivo.step}-${archivo.nombre}-${index}`} className="archivo-item">
                    <div className="archivo-badge">{archivo.step}</div>
                    <div className="archivo-info">
                      <span className="archivo-nombre">{archivo.nombre}</span>
                      <span className="archivo-tipo">{archivo.tipo}</span>
                    </div>
                    <div className="archivo-tamano">{archivo.tamano}</div>
                  </div>
                ))}
              </div>

              <div className="archivos-resumen">
                <strong>Total de archivos:</strong> {archivosParaEnvio.length} archivo(s)
              </div>
            </>
          )}
        </div>

        {/* Botón para ver/ocultar JSON */}
        <div className="section json-toggle-section">
          <button className="btn-toggle-json" onClick={toggleJSON}>
            <span>{mostrarJSON ? '[OCULTAR]' : '[VER]'} JSON PAYLOAD</span>
          </button>
        </div>

        {/* Vista previa del JSON */}
        {mostrarJSON && (
          <div className="section json-section">
            <h2>JSON PARA BACKEND</h2>
            <pre className="json-payload">{jsonPayload}</pre>

            <div className="json-actions">
              <button className="btn-copy" onClick={copyJSON}>
                Copiar JSON
              </button>
            </div>
          </div>
        )}

        {/* Datos del formulario (resumen) */}
        <div className="section datos-section">
          <h2>RESUMEN DE DATOS - {origenWizard === 'registro-nuevo-usuario' ? 'REGISTRO USUARIO' : 'DATOS'}</h2>
          {renderDatosResumen()}
        </div>

        {/* Loader con barra de progreso */}
        {enviando && (
          <div className="loader-overlay">
            <div className="loader-container">
              <div className="loader-header">
                <h3>{mensajeProgreso} - {progresoSubida}%</h3>
              </div>

              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progresoSubida}%` }}></div>
                </div>
                <div className="progress-text">{progresoSubida}%</div>
              </div>

              <div className="loader-details">
                {progresoSubida < 30 && <p>Guardando datos...</p>}
                {progresoSubida >= 30 && progresoSubida < 100 && (
                  <>
                    <p>Subiendo archivos al servidor...</p>
                    <p className="small-text">Esto puede tardar dependiendo del tamaño de los archivos</p>
                  </>
                )}
                {progresoSubida >= 100 && <p>¡Completado! Redirigiendo...</p>}
              </div>

              <div className="loader-spinner">
                <div className="spinner"></div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="actions">
          <button className="btn btn-secondary" onClick={volver} disabled={enviando}>
            Volver
          </button>
          <button
            className="btn btn-primary"
            onClick={enviarAlBackend}
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar al Backend'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RevisarDataPage;
