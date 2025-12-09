/**
 * Layout principal de la aplicacion
 * Contiene el Navbar, Footer y el contenedor principal
 */

import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar/Navbar';
import Footer from '../components/shared/Footer/Footer';
import AlertModal from '../components/shared/AlertModal/AlertModal';
import { useTheme } from '../hooks';

const MainLayout = () => {
  // Inicializar el tema
  useTheme();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <AlertModal />
    </div>
  );
};

export default MainLayout;
