/**
 * Configuracion de rutas de React Router
 * Equivalente a: app.routes.ts de Angular
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Loading component para Suspense
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

// Lazy loading de paginas (code splitting)
const HomePage = lazy(() => import('../pages/Home/HomePage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegistroNuevoUsuarioPage = lazy(() => import('../pages/RegistroNuevoUsuario/RegistroNuevoUsuarioPage'));
const RegistroExitosoUsuarioPage = lazy(() => import('../pages/RegistroExitosoUsuario/RegistroExitosoUsuarioPage'));
const PerfilPage = lazy(() => import('../pages/Perfil/PerfilPage'));
const RegistroImpugnacionPage = lazy(() => import('../pages/RegistroImpugnacion/RegistroImpugnacionPage'));
const RevisionImpugnacionPage = lazy(() => import('../pages/RevisionImpugnacion/RevisionImpugnacionPage'));
const RegistroExitosoImpugnacionPage = lazy(() => import('../pages/RegistroExitosoImpugnacion/RegistroExitosoImpugnacionPage'));
const ConsultaImpugnacionPage = lazy(() => import('../pages/ConsultaImpugnacion/ConsultaImpugnacionPage'));
const AmicusCuriaePage = lazy(() => import('../pages/AmicusCuriae/AmicusCuriaePage'));
const RevisionAmicusPage = lazy(() => import('../pages/RevisionAmicus/RevisionAmicusPage'));
const SeleccionExpedientePage = lazy(() => import('../pages/SeleccionExpediente/SeleccionExpedientePage'));
const FirmadoPage = lazy(() => import('../pages/Firmado/FirmadoPage'));
const RegistroPage = lazy(() => import('../pages/Registro/RegistroPage'));
const RevisarDataPage = lazy(() => import('../pages/RevisarData/RevisarDataPage'));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'));

// Wrapper con Suspense para lazy loading
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// Layout principal (contendra el Navbar, etc)
const MainLayout = lazy(() => import('../layouts/MainLayout'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <MainLayout />
      </SuspenseWrapper>
    ),
    children: [
      // Home
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        )
      },
      // Auth
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: (
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            )
          },
          {
            index: true,
            element: <Navigate to="login" replace />
          }
        ]
      },
      // Registro de usuario
      {
        path: 'registro-nuevo-usuario',
        element: (
          <SuspenseWrapper>
            <RegistroNuevoUsuarioPage />
          </SuspenseWrapper>
        )
      },
      {
        path: 'registro-exitoso-usuario',
        element: (
          <SuspenseWrapper>
            <RegistroExitosoUsuarioPage />
          </SuspenseWrapper>
        )
      },
      // Perfil
      {
        path: 'perfil',
        element: (
          <SuspenseWrapper>
            <PerfilPage />
          </SuspenseWrapper>
        )
      },
      {
        path: 'inicio',
        element: <Navigate to="/perfil" replace />
      },
      // Registro de impugnacion
      {
        path: 'registro-impugnacion',
        element: (
          <SuspenseWrapper>
            <RegistroImpugnacionPage />
          </SuspenseWrapper>
        )
      },
      {
        path: 'registro',
        element: (
          <SuspenseWrapper>
            <RegistroPage />
          </SuspenseWrapper>
        )
      },
      // Seleccion de expediente
      {
        path: 'seleccion-expediente',
        element: (
          <SuspenseWrapper>
            <SeleccionExpedientePage />
          </SuspenseWrapper>
        )
      },
      // Revision de impugnacion
      {
        path: 'revision-impugnacion',
        element: (
          <SuspenseWrapper>
            <RevisionImpugnacionPage />
          </SuspenseWrapper>
        )
      },
      // Revision amicus
      {
        path: 'revision-amicus',
        element: (
          <SuspenseWrapper>
            <RevisionAmicusPage />
          </SuspenseWrapper>
        )
      },
      // Revisar data
      {
        path: 'revisar-data',
        element: (
          <SuspenseWrapper>
            <RevisarDataPage />
          </SuspenseWrapper>
        )
      },
      // Firmado
      {
        path: 'firmado',
        element: (
          <SuspenseWrapper>
            <FirmadoPage />
          </SuspenseWrapper>
        )
      },
      // Registro exitoso
      {
        path: 'registro-exitoso-impugnacion',
        element: (
          <SuspenseWrapper>
            <RegistroExitosoImpugnacionPage />
          </SuspenseWrapper>
        )
      },
      // Consulta de impugnacion
      {
        path: 'consulta',
        element: (
          <SuspenseWrapper>
            <ConsultaImpugnacionPage />
          </SuspenseWrapper>
        )
      },
      // Amicus Curiae
      {
        path: 'amicus-curiae',
        element: (
          <SuspenseWrapper>
            <AmicusCuriaePage />
          </SuspenseWrapper>
        )
      },
      // Not found - catch all
      {
        path: '*',
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        )
      }
    ]
  }
]);

export default router;
