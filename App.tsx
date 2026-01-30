import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Property, LandingContent } from './types';
import { INITIAL_LANDING_CONTENT } from './constants';
import { apiService } from './apiService';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { SessionProvider, useSession } from './components/SessionProvider'; // Import SessionProvider and useSession
import LoginPage from './pages/LoginPage'; // Import LoginPage

// Lazy loading of pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Loading Skeleton for Suspense
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
    <div className="w-10 h-10 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading, isAdmin } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    } else if (!loading && session && !isAdmin) {
      // If logged in but not admin, redirect to home or show unauthorized message
      navigate('/'); 
    }
  }, [session, loading, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [landingContent, setLandingContent] = useState<LandingContent>(INITIAL_LANDING_CONTENT);
  const [loadingApp, setLoadingApp] = useState(true); // Renamed to avoid conflict with session loading
  const { isAdmin, loading: loadingSession } = useSession(); // Use isAdmin from session context

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
        console.error("Error cargando datos:", error);
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
            <Route path="/propiedad/:id" element={<PropertyDetail properties={activeProperties} />} />
            <Route path="/login" element={<LoginPage />} />
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