/**
 * Pagina de Perfil del usuario
 * Equivalente a: perfil.ts de Angular
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { usuariosService, type UsuarioPerfil } from '../../services/api';
import './PerfilPage.scss';

const PerfilPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [usuarioConDomicilio, setUsuarioConDomicilio] = useState(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      // Obtener usuarioId del user del store
      const usuarioId = user?.id;

      if (!usuarioId) {
        setError('No se encontró el ID de usuario en la sesión');
        setLoading(false);
        console.error('[PERFIL] No hay usuarioId en el store');
        return;
      }

      const usuarioIdNum = parseInt(usuarioId, 10);

      if (isNaN(usuarioIdNum)) {
        setError('ID de usuario inválido');
        setLoading(false);
        console.error('[PERFIL] usuarioId inválido:', usuarioId);
        return;
      }

      console.log('[PERFIL] Cargando perfil para usuario:', usuarioIdNum);
      setLoading(true);
      setError(null);

      try {
        const response = await usuariosService.getPerfil(usuarioIdNum);

        console.log('[PERFIL] Respuesta del backend:', response);

        if (response.success) {
          setUsuario(response.data);
          setUsuarioConDomicilio(response.usuarioConDomicilio);
          console.log('[PERFIL] usuarioConDomicilio:', response.usuarioConDomicilio);
        } else {
          setError(response.mensaje || 'Error al cargar el perfil');
        }
      } catch (err) {
        console.error('[PERFIL] Error al cargar perfil:', err);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [user]);

  // Helper para formatear el género
  const generoTexto = (() => {
    const genero = usuario?.generoPersona;
    if (!genero) return '-';
    return genero === 'M' ? 'Masculino' : genero === 'F' ? 'Femenino' : 'Otro';
  })();

  // Helper para mostrar la dirección completa
  const direccionCompleta = (() => {
    if (!usuario) return '-';

    const partes = [
      usuario.callePersona,
      usuario.numExtPersona ? `#${usuario.numExtPersona}` : null,
      usuario.numIntPersona ? `Int. ${usuario.numIntPersona}` : null
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(' ') : '-';
  })();

  return (
    <section className="wizard-container">
      <div className="main-perfil">
        <h4 className="space-mb-0400">Consultar perfil de usuario</h4>

        {loading && (
          <div className="text-center space-py-0500">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="space-mt-0300">Cargando perfil...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {usuario && !loading && (
          <>
            {/* Datos personales */}
            <section className="seccion">
              <h6 className="space-mb-0400">Datos personales</h6>

              {/* Vista Desktop */}
              <div className="card card-perfil space-px-0400 space-py-0500 desktop-view">
                <div className="container-fluid">
                  <div className="row row-cols-2 row-cols-lg-3 g-3 space-mb-0500">
                    <div className="col">
                      <div className="font-16-medium">Nombre(s)<br /></div>
                      <div className="text">{usuario.nombrePersona || '-'}</div>
                    </div>
                    <div className="col">
                      <div className="font-16-medium">Primer Apellido<br /></div>
                      <div className="text">{usuario.apellidoPaternoPersona || '-'}</div>
                    </div>
                    <div className="col">
                      <div className="font-16-medium">Segundo Apellido<br /></div>
                      <div className="text">{usuario.apellidoMaternoPersona || '-'}</div>
                    </div>
                  </div>
                  <div className="row row-cols-2 row-cols-lg-3 g-3">
                    <div className="col">
                      <div className="font-16-medium">Genero<br /></div>
                      <div className="text">{generoTexto}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Mobile */}
              <div className="info-grid mobile-view">
                <div className="info-item">
                  <label className="info-label">Nombre(s)</label>
                  <div className="info-value">{usuario.nombrePersona || '-'}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Primer Apellido</label>
                  <div className="info-value">{usuario.apellidoPaternoPersona || '-'}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Segundo Apellido</label>
                  <div className="info-value">{usuario.apellidoMaternoPersona || '-'}</div>
                </div>
                <div className="info-item">
                  <label className="info-label">Genero</label>
                  <div className="info-value">{generoTexto}</div>
                </div>
              </div>
            </section>

            {/* Direccion */}
            {usuarioConDomicilio && (
              <section className="seccion">
                <h6 className="space-mb-0400">Direccion</h6>

                {/* Vista Desktop */}
                <div className="card card-perfil space-px-0400 space-py-0500 desktop-view">
                  <div className="container-fluid">
                    <div className="row row-cols-2 row-cols-lg-3 g-3 space-mb-0500">
                      <div className="col">
                        <div className="font-16-medium">Calle y numero<br /></div>
                        <div className="text">{direccionCompleta}</div>
                      </div>
                      <div className="col">
                        <div className="font-16-medium">Codigo postal<br /></div>
                        <div className="text">{usuario.codigoPostal || '-'}</div>
                      </div>
                      <div className="col">
                        <div className="font-16-medium">Colonia<br /></div>
                        <div className="text">{usuario.colonia || '-'}</div>
                      </div>
                    </div>
                    <div className="row row-cols-2 row-cols-lg-3 g-3">
                      <div className="col">
                        <div className="font-16-medium">Alcaldia o municipio<br /></div>
                        <div className="text">{usuario.municipioGeo || '-'}</div>
                      </div>
                      <div className="col">
                        <div className="font-16-medium">Ciudad<br /></div>
                        <div className="text">{usuario.ciudad || '-'}</div>
                      </div>
                      <div className="col">
                        <div className="font-16-medium">Entidad federativa<br /></div>
                        <div className="text">{usuario.estadoGeo || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista Mobile */}
                <div className="info-grid mobile-view">
                  <div className="info-item full-width">
                    <label className="info-label">Calle y numero</label>
                    <div className="info-value">{direccionCompleta}</div>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Codigo postal</label>
                    <div className="info-value">{usuario.codigoPostal || '-'}</div>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Colonia</label>
                    <div className="info-value">{usuario.colonia || '-'}</div>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Alcaldia o municipio</label>
                    <div className="info-value">{usuario.municipioGeo || '-'}</div>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Ciudad</label>
                    <div className="info-value">{usuario.ciudad || '-'}</div>
                  </div>
                  <div className="info-item">
                    <label className="info-label">Entidad federativa</label>
                    <div className="info-value">{usuario.estadoGeo || '-'}</div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default PerfilPage;
