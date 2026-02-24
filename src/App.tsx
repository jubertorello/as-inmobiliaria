import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Property, LandingContent } from './types/types';
import { INITIAL_LANDING_CONTENT } from './constants/constants';
import { apiService } from './services/apiService';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { SessionProvider, useSession } from './components/SessionProvider';
import LoginPage from './pages/LoginPage';
import BootstrapAdmin from './pages/BootstrapAdmin';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading of pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));







const AppContent: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [landingContent, setLandingContent] = useState<LandingContent>(INITIAL_LANDING_CONTENT);
  const [loadingApp, setLoadingApp] = useState(true);
  const { isAdmin, loading: loadingSession } = useSession();

  useEffect(() => {
    const initApp = async () => {
      try {
        const [props, content] = await Promise.all([
          apiService.getProperties(),
          apiService.getLandingContent(),
        ]);
        setProperties(props);
        setLandingContent(content);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingApp(false);
      }
    };
    initApp();
  }, []);

  const activeProperties = properties.filter(p => p.status === 'Activa');

  if (loadingApp || loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium animate-pulse uppercase tracking-widest text-[10px]">Andrea Sartori Inmobiliaria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <Navbar isAdmin={isAdmin} content={landingContent} />

      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home properties={activeProperties} content={landingContent} />} />
            <Route path="/propiedades" element={<Properties properties={activeProperties} />} />
            <Route path="/propiedad/:id" element={<PropertyDetail properties={activeProperties} content={landingContent} />} />
            <Route path="/login" element={<LoginPage />} />
            {import.meta.env.DEV ? <Route path="/bootstrap" element={<BootstrapAdmin />} /> : null}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard
                    isAdmin={isAdmin}
                    properties={properties}
                    setProperties={setProperties}
                    content={landingContent}
                    setContent={setLandingContent}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer content={landingContent} />
      <WhatsAppButton phone={landingContent.contactPhone} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </HashRouter>
  );
};

export default App;
