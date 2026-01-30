
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BRAND_COLOR, SECONDARY_COLOR } from '../constants';
import { LandingContent } from '../types';

interface NavbarProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  content: LandingContent;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin, setIsAdmin, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/', public: true },
    { name: 'Propiedades', path: '/propiedades', public: true },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="w-full px-4 sm:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {content.navbarLogo ? (
                  <img src={content.navbarLogo} alt="Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <svg 
                    className="h-12 w-auto" 
                    viewBox="0 0 84 75" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="gLeft" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#D95FA2" /> 
                        <stop offset="100%" stopColor="#D979AE" /> 
                      </linearGradient>
                      <linearGradient id="gMidLeft" x1="0" y1="0" x2="1" y2="1">
                         <stop offset="0%" stopColor="#D979AE" />
                         <stop offset="100%" stopColor="#532759" />
                      </linearGradient>
                      <linearGradient id="gMidRight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#F2D5E5" />
                      </linearGradient>
                      <linearGradient id="gRight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F2D5E5" />
                        <stop offset="100%" stopColor="#F2F2F2" />
                      </linearGradient>
                    </defs>
                    <path d="M0 75 V 35 L 25 20 V 75 H 0 Z" fill="url(#gLeft)" />
                    <path d="M27 75 V 20 L 42 5 V 75 H 27 Z" fill="url(#gMidLeft)" />
                    <path d="M42 75 V 5 L 57 20 V 75 H 42 Z" fill="url(#gMidRight)" />
                    <path d="M59 75 V 20 L 84 35 V 75 H 59 Z" fill="url(#gRight)" />
                  </svg>
                )}
              </div>
              
              <div className="flex flex-col border-l border-gray-100 pl-4 h-12 justify-center">
                <h1 className="text-2xl font-normal tracking-[0.1em] text-gray-700 leading-none mb-1">
                  ANDREA <span className="font-semibold text-gray-800">SARTORI</span>
                </h1>
                <p 
                  className="text-[10px] uppercase tracking-[0.4em] font-medium leading-none"
                  style={{ color: SECONDARY_COLOR }}
                >
                  {content.siteTagline}
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-bold uppercase tracking-[0.15em] transition-all hover:text-brand-pink ${
                  location.pathname === link.path ? 'text-brand-pink border-b-2 border-brand-pink pb-1' : 'text-gray-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <Link
              to="/admin"
              title="Panel Administrativo"
              className={`p-2 rounded-full transition-all hover:bg-gray-50 flex items-center justify-center ${
                location.pathname === '/admin' ? 'text-brand-pink' : 'text-gray-400 hover:text-brand-pink'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">person</span>
            </Link>

            {isAdmin && (
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-red-600 transition-all shadow-md"
              >
                Salir
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-2xl">
                {isOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-50 shadow-inner">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-4 text-base font-bold uppercase tracking-widest border-b border-gray-50 last:border-none ${
                  location.pathname === link.path ? 'text-brand-pink' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-3 py-4 text-base font-bold uppercase tracking-widest text-gray-600 border-b border-gray-50 last:border-none"
            >
              <span className="material-symbols-outlined text-2xl text-gray-400">person</span>
              <span>Panel Administrativo</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
