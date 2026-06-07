import React from 'react';
import { Link } from 'react-router-dom';
import { Property, LandingContent } from '../types/types';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import SectionHeader from '../components/SectionHeader';
import DirectContactForm from '../components/DirectContactForm';
import { googleMapsUrlFromCoordsOrQuery } from '../utils/googleMaps';

import LazyImage from '../components/LazyImage';

interface HomeProps {
  properties: Property[];
  content: LandingContent;
}

const Home: React.FC<HomeProps> = ({ properties, content }) => {
  const featured = (() => {
    const picked = properties.filter(p => p.featured).slice(0, 3);
    if (picked.length > 0) return picked;
    return properties.slice(0, 3);
  })();

  const contactPhoneRaw = content.contactPhone.replace(/\D/g, '');
  const officeMapsUrl = googleMapsUrlFromCoordsOrQuery({
    query: content.officeAddress,
    latitude: content.officeLatitude ?? null,
    longitude: content.officeLongitude ?? null,
  });

  return (
    <div className="flex flex-col bg-white">
      <SEO
        title={content.seoTitle}
        description={content.seoDescription}
        keywords={content.seoKeywords}
        image={content.ogImage}
      />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="absolute inset-0">
          <img
            src={content.heroImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="overflow-hidden mb-6 py-4 -my-4">
            <h1 className="text-4xl md:text-7xl font-playfair text-white leading-[1.15] drop-shadow-lg opacity-0 animate-title-reveal">
              {content.heroTitle}
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-10 font-light drop-shadow-md opacity-0 animate-fade-up delay-500">
            {content.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 opacity-0 animate-scale-in delay-700">
            <Link
              to="/propiedades"
              className="w-full sm:w-auto px-10 py-4 bg-white text-gray-900 font-bold uppercase tracking-wider rounded-full hover:bg-gray-100 transition-all shadow-xl active:scale-95"
            >
              {content.heroPrimaryButtonText}
            </Link>
            <a
              href={`tel:${contactPhoneRaw}`}
              className="w-full sm:w-auto px-10 py-4 border-2 border-white text-white font-bold uppercase tracking-wider rounded-full hover:bg-white hover:text-gray-900 transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2"
            >
              <span className="material-symbols-outlined text-xl">call</span>
              <span>{content.heroSecondaryButtonText || 'LLÁMANOS'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title={content.featuredTitle}
            subtitle={content.featuredSubtitle}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featured.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/propiedades"
              className="inline-flex items-center font-bold uppercase tracking-widest text-xs text-brand-pink hover:opacity-80 transition-opacity"
            >
              {content.featuredButtonText}
              <span className="material-symbols-outlined ml-2 text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title={content.servicesTitle}
            subtitle={content.servicesSubtitle}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(num => {
              const sTitle = (content as any)[`service${num}Title`];
              const sDesc = (content as any)[`service${num}Desc`];
              const sIcon = (content as any)[`service${num}Icon`];
              return (
                <div key={num} className="p-10 rounded-3xl bg-brand-dark text-white border border-transparent shadow-xl hover:shadow-2xl hover:bg-brand-pink transition-all duration-300 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-all">
                    <span className="material-symbols-outlined text-4xl text-brand-pink group-hover:text-brand-dark transition-colors">{sIcon}</span>
                  </div>
                  <h3 className="text-2xl font-playfair font-bold mb-4 text-white">{sTitle}</h3>
                  <p className="text-white/85 leading-relaxed text-sm">
                    {sDesc}
                  </p>
                  {num === 3 && content.apartHotelLink && (
                    <a
                      href={content.apartHotelLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-white hover:underline"
                    >
                      Visitar Apart Hotel
                      <span className="material-symbols-outlined ml-2 text-sm">open_in_new</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-white border-t border-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <LazyImage
              src={content.aboutImage}
              alt="Andrea Sartori"
              className="rounded-3xl shadow-2xl aspect-[4/5] bg-gray-100"
              imgClassName="object-cover w-full h-full"
            />

            {/* Mobile badge */}
            <div className="absolute bottom-4 right-4 p-5 bg-white/95 shadow-xl rounded-2xl border border-gray-50 text-center md:hidden">
              <span className="text-3xl font-bold block mb-0.5 text-brand-pink">{content.aboutExperience}</span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold">Años de Trayectoria</span>
            </div>

            {/* Desktop badge */}
            <div className="absolute -bottom-8 -right-8 p-10 bg-white shadow-2xl rounded-3xl hidden md:block border border-gray-50 text-center animate-bounce-slow">
              <span className="text-5xl font-bold block mb-1 text-brand-pink">{content.aboutExperience}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Años de Trayectoria</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block text-brand-pink">{content.aboutBadge}</span>
            <h2 className="text-4xl md:text-5xl font-playfair mb-10 leading-tight text-brand-dark">{content.aboutTitle}</h2>
            <div className="space-y-6 mb-12">
              <p className="text-gray-600 text-lg leading-relaxed">{content.aboutDescription1}</p>
              <p className="text-gray-600 text-lg leading-relaxed">{content.aboutDescription2}</p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.aboutFeatures.map((item, idx) => (
                <li key={idx} className="flex items-center text-gray-700 font-medium bg-gray-50 p-4 rounded-xl">
                  <span className="material-symbols-outlined mr-3 text-brand-pink">verified</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 px-4 text-white bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-4xl md:text-6xl font-playfair mb-8 leading-tight">Hablemos de tu próximo paso</h2>
              <p className="text-white/60 text-lg mb-12 max-w-lg leading-relaxed">
                Nuestra misión es brindarte la tranquilidad que necesitas en cada transacción inmobiliaria.
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl">location_on</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block tracking-widest uppercase font-bold mb-1">Visítanos</span>
                    <a
                      href={officeMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xl font-medium hover:underline"
                      title="Abrir en Google Maps"
                    >
                      {content.officeAddress}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl">call</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block tracking-widest uppercase font-bold mb-1">Llámanos</span>
                    <span className="text-xl font-bold">{content.contactPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <DirectContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;