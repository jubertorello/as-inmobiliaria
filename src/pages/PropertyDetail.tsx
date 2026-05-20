import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LandingContent, Property } from '../types/types';
import SEO from '../components/SEO';
import { BRAND_COLOR } from '../constants/constants';
import { googleMapsUrlFromCoordsOrQuery } from '../utils/googleMaps';
import LazyImage from '../components/LazyImage';

interface PropertyDetailProps {
  properties: Property[];
  content: LandingContent;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ properties, content }) => {
  const { id } = useParams();
  const property = properties.find(p => p.id === id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-400 mb-4">Propiedad no encontrada</h2>
        <Link to="/propiedades" className="text-brand-pink hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const hasImages = property.images && property.images.length > 0 && property.images.some(img => img.trim() !== '');
  const images = hasImages ? property.images.filter(img => img && img.trim() !== '') : [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const seoTitle = `${property.title} | ${property.operation} en ${property.location} - Andrea Sartori`;
  const seoDescription = `${property.operation} de ${property.type.toLowerCase()} en ${property.location}. ${property.area}m². ${property.description.substring(0, 100)}...`;

  const contactPhoneRaw = content.contactPhone.replace(/\D/g, '');
  const mapsUrl = googleMapsUrlFromCoordsOrQuery({
    query: property.location,
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
  });

  const shareTitle = property.title;
  const shareText = `Mira esta propiedad: ${property.title} en ${property.location}`;
  const shareUrl = window.location.href;

  const handleShare = async () => {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShowShareModal(true);
        }
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        image={images[0]}
        url={window.location.href}
      />

      {/* Fullscreen Modal */}
      {showFullscreen && hasImages && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 transition-all cursor-default"
          onClick={() => setShowFullscreen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-brand-pink transition-colors z-10 flex items-center justify-center"
            onClick={() => setShowFullscreen(false)}
          >
            <span className="material-symbols-outlined text-5xl">close</span>
          </button>

          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-4 md:left-10 p-4 text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-6xl">chevron_left</span>
              </button>
              <button onClick={nextImage} className="absolute right-4 md:right-10 p-4 text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-6xl">chevron_right</span>
              </button>
            </>
          )}

          <div className="relative max-w-5xl max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <LazyImage
              src={images[activeImageIndex]}
              alt={property.title}
              loading="eager"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl bg-gray-900"
              imgClassName="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-gray-900"
            />
            <div className="mt-6 text-white/70 text-sm font-medium bg-white/10 px-4 py-1 rounded-full backdrop-blur-md">
              {activeImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-12 px-4">
        <Link to="/propiedades" className="inline-flex items-center text-gray-400 hover:text-brand-pink transition-colors mb-8 group">
          <span className="material-symbols-outlined text-xl mr-2 transition-transform group-hover:-translate-x-1">arrow_back</span>
          Volver al listado
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-6">
            <div 
              className={`relative rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[550px] bg-gray-50 flex items-center justify-center border border-gray-100 ${hasImages ? 'cursor-zoom-in group' : ''}`}
              onClick={() => hasImages && setShowFullscreen(true)}
            >
              {hasImages ? (
                <>
                  <LazyImage
                    src={images[activeImageIndex]}
                    alt={property.title}
                    loading="eager"
                    className="absolute inset-0"
                    imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={prevImage} className="p-3 bg-white/40 hover:bg-white/60 text-gray-900 rounded-full backdrop-blur-md transition-all shadow-lg">
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <button onClick={nextImage} className="p-3 bg-white/40 hover:bg-white/60 text-gray-900 rounded-full backdrop-blur-md transition-all shadow-lg">
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-300 text-center p-10">
                  <span className="material-symbols-outlined text-8xl mb-4">image_not_supported</span>
                  <p className="text-sm font-bold uppercase tracking-widest max-w-[200px]">Aún no hay imágenes disponibles para esta propiedad</p>
                </div>
              )}
            </div>
            
            {hasImages && images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all bg-gray-50 ${
                      activeImageIndex === idx ? 'border-brand-pink ring-2 ring-brand-pinkLight scale-105 z-10' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <LazyImage
                      src={img}
                      alt={`Vista ${idx + 1}`}
                      loading="lazy"
                      className="absolute inset-0"
                      imgClassName="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="bg-brand-pinkLight/30 text-brand-pink text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-brand-pinkLight/50">{property.operation}</span>
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-200">{property.type}</span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 text-gray-400 hover:text-brand-pink transition-colors text-sm font-semibold focus:outline-none bg-gray-50 hover:bg-brand-pinkLight/20 px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-pinkLight/50"
                title="Compartir propiedad"
              >
                <span className="material-symbols-outlined text-base">share</span>
                <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Compartir</span>
              </button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-playfair text-gray-900 mb-4">{property.title}</h1>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 mb-8 hover:text-brand-pink transition-colors"
              title="Abrir en Google Maps"
            >
              <span className="material-symbols-outlined mr-2 text-brand-pink">location_on</span>
              {property.location}
            </a>

            <div className="text-3xl font-bold mb-8 text-brand-pink">
              {property.price && property.price > 0 ? `${property.currency} ${property.price.toLocaleString()}` : 'CONSULTAR'}
            </div>

            <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100 mb-8">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Dormitorios</span>
                <span className="text-xl font-bold text-gray-900">{property.bedrooms || '-'}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Baños</span>
                <span className="text-xl font-bold text-gray-900">{property.bathrooms || '-'}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">Superficie</span>
                <span className="text-xl font-bold text-gray-900">{property.area} m²</span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Descripción</h3>
            <p className="text-gray-600 leading-relaxed mb-12 whitespace-pre-line">{property.description}</p>

            <div className="flex flex-col space-y-4">
              <a
                href={`https://wa.me/${contactPhoneRaw}?text=Hola, estoy interesado en la propiedad: ${property.title}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-5 rounded-2xl text-white text-center font-bold uppercase tracking-[0.2em] shadow-xl bg-brand-pink hover:bg-brand-dark transition-all flex items-center justify-center space-x-3 active:scale-95"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Consultar por WhatsApp</span>
              </a>

              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl border border-brand-pink text-brand-pink hover:bg-brand-pinkLight/20 transition-all flex items-center justify-center space-x-2 font-bold uppercase tracking-[0.2em] text-xs md:text-sm active:scale-95 shadow-md"
              >
                <span className="material-symbols-outlined text-lg">share</span>
                <span>Compartir Propiedad</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Fallback Modal */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-pink transition-colors p-1"
              onClick={() => setShowShareModal(false)}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-playfair font-bold text-gray-900 mb-6 pr-6">
              Compartir Propiedad
            </h3>

            {/* Property Preview Card inside Modal */}
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              {hasImages ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                  <img 
                    src={images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">image</span>
                </div>
              )}
              <div className="min-w-0 flex-grow">
                <h4 className="text-sm font-bold text-gray-900 truncate">{property.title}</h4>
                <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                  <span className="material-symbols-outlined text-xs text-brand-pink mr-1">location_on</span>
                  {property.location}
                </p>
                <p className="text-sm font-semibold text-brand-pink mt-1">
                  {property.price && property.price > 0 ? `${property.currency} ${property.price.toLocaleString()}` : 'Consultar'}
                </p>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              {/* Copy Link */}
              <button 
                onClick={copyToClipboard}
                className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-between font-semibold transition-all ${
                  copied 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white border-gray-200 hover:border-brand-pink hover:text-brand-pink text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-xl">{copied ? 'check_circle' : 'link'}</span>
                  <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
                </div>
                {!copied && (
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Copiar</span>
                )}
              </button>

              {/* WhatsApp Share */}
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Mira esta propiedad: ' + property.title + ' ' + shareUrl)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 bg-white hover:border-brand-pink hover:text-brand-pink text-gray-700 font-semibold transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#25D366] fill-currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Compartir por WhatsApp</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Enviar</span>
              </a>

              {/* Email Share */}
              <a 
                href={`mailto:?subject=${encodeURIComponent(property.title)}&body=${encodeURIComponent('Mira esta propiedad en Andrea Sartori Inmobiliaria: ' + shareUrl)}`}
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 bg-white hover:border-brand-pink hover:text-brand-pink text-gray-700 font-semibold transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-xl text-gray-500">mail</span>
                  <span>Compartir por Email</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;