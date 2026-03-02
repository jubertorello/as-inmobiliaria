import React from 'react';
import { Link } from 'react-router-dom';
import { LandingContent } from '../types/types';
import { BRAND_COLOR, SECONDARY_COLOR } from '../constants/constants';

interface FooterProps {
  content: LandingContent;
}

const Footer: React.FC<FooterProps> = ({ content }) => {
  const cleanPhone = content.contactPhone.replace(/\D/g, '');

  return (
    <footer className="bg-white border-t border-gray-100 py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center space-x-4 mb-8">
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
                    <linearGradient id="gLeftFooter" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D95FA2" />
                      <stop offset="100%" stopColor="#D979AE" />
                    </linearGradient>
                    <linearGradient id="gMidLeftFooter" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D979AE" />
                      <stop offset="100%" stopColor="#532759" />
                    </linearGradient>
                    <linearGradient id="gMidRightFooter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F2D5E5" />
                    </linearGradient>
                    <linearGradient id="gRightFooter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F2D5E5" />
                      <stop offset="100%" stopColor="#F2F2F2" />
                    </linearGradient>
                  </defs>
                  <path d="M0 75 V 35 L 25 20 V 75 H 0 Z" fill="url(#gLeftFooter)" />
                  <path d="M27 75 V 20 L 42 5 V 75 H 27 Z" fill="url(#gMidLeftFooter)" />
                  <path d="M42 75 V 5 L 57 20 V 75 H 42 Z" fill="url(#gMidRightFooter)" />
                  <path d="M59 75 V 20 L 84 35 V 75 H 59 Z" fill="url(#gRightFooter)" />
                </svg>
              )}
            </div>

            <div className="flex flex-col border-l border-gray-100 pl-4 h-12 justify-center">
              <span className="text-xl font-normal tracking-[0.1em] text-gray-700 leading-none mb-1">
                ANDREA <span className="font-semibold text-gray-800">SARTORI</span>
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.4em] font-medium leading-none"
                style={{ color: SECONDARY_COLOR }}
              >
                {content.siteTagline}
              </span>
            </div>
          </Link>
          <p className="text-gray-400 text-sm max-w-sm leading-loose">
            {content.footerDescription}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-8 text-[10px] uppercase tracking-[0.3em]">Explorar</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-400">
            <li><Link to="/" className="hover:text-[#D95FA2] transition-colors">Inicio</Link></li>
            <li><Link to="/propiedades" className="hover:text-[#D95FA2] transition-colors">Propiedades</Link></li>
            <li><Link to="/privacidad" className="hover:text-[#D95FA2] transition-colors">Política de Privacidad</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-8 text-[10px] uppercase tracking-[0.3em]">Atención</h4>
          <ul className="space-y-6">
            <li>
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-start group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2F2F2] flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-pink-50 transition-colors shadow-sm">
                  <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ color: BRAND_COLOR }}>call</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Llamanos</span>
                  <span className="font-medium text-gray-700 text-sm group-hover:text-pink-600 transition-colors">{content.contactPhone}</span>
                </div>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${content.contactEmail}`}
                className="flex items-start group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2F2F2] flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-pink-50 transition-colors shadow-sm">
                  <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ color: BRAND_COLOR }}>mail</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Email</span>
                  <span className="font-medium text-gray-700 text-sm group-hover:text-pink-600 transition-colors">{content.contactEmail}</span>
                </div>
              </a>
            </li>
            <li>
              <a
                href={`https://instagram.com/${content.contactInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start group transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2F2F2] flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-pink-50 transition-colors shadow-sm">
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color: BRAND_COLOR }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Instagram</span>
                  <span className="font-medium text-gray-700 text-sm group-hover:text-pink-600 transition-colors">@{content.contactInstagram}</span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">
          &copy; {new Date().getFullYear()} {content.siteName} {content.siteTagline}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;