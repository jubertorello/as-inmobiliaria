import React from 'react';
import { Link } from 'react-router-dom';
import { Property, OperationType } from '../types/types';
import { googleMapsUrlFromCoordsOrQuery } from '../utils/googleMaps';
import LazyImage from './LazyImage';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const firstImage = React.useMemo(() => {
    return property.images?.find(img => typeof img === 'string' && img.trim() !== '');
  }, [property.images]);

  const hasImages = Boolean(firstImage);

  // Optimize Unsplash images if no params present
  const imageUrl = React.useMemo(() => {
    if (!hasImages || !firstImage) return '';
    const src = firstImage;
    if (src.includes('unsplash.com') && !src.includes('w=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}auto=format&fit=crop&q=75&w=800`;
    }
    return src;
  }, [firstImage, hasImages]);

  const getBadgeColor = (op: OperationType) => {
    switch (op) {
      case OperationType.SALE: return 'bg-brand-dark';
      case OperationType.RENT: return 'bg-brand-pink';
      case OperationType.TEMPORARY_RENT: return 'bg-[#D979AE]';
      default: return 'bg-gray-600';
    }
  };

  const mapsUrl = googleMapsUrlFromCoordsOrQuery({
    query: property.location,
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl group flex flex-col h-full">
      <Link 
        to={`/propiedad/${property.id}`}
        onClick={() => sessionStorage.setItem('prop_scroll_y', window.scrollY.toString())}
        className="relative block w-full h-64 overflow-hidden bg-gray-50 flex items-center justify-center border-b border-gray-50 cursor-pointer"
      >
        {hasImages ? (
          <LazyImage
            src={imageUrl}
            alt={property.title}
            className="absolute inset-0 w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-8 text-center bg-gray-50">
            <span className="material-symbols-outlined text-6xl mb-3 opacity-50">hide_image</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">Imagen no disponible</span>
          </div>
        )}

        <div className={`absolute top-4 left-4 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${getBadgeColor(property.operation)}`}>
          {property.operation}
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-gray-100">
          {property.type}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <Link 
          to={`/propiedad/${property.id}`}
          onClick={() => sessionStorage.setItem('prop_scroll_y', window.scrollY.toString())}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-brand-pink transition-colors">
            {property.title}
          </h3>
        </Link>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 text-sm mb-4 flex items-center hover:text-brand-pink transition-colors"
          title="Abrir en Google Maps"
        >
          <span className="material-symbols-outlined text-lg mr-1 text-brand-pink">location_on</span>
          {property.location}
        </a>

        <div className="flex items-center space-x-4 mb-6 text-xs text-gray-600">
          <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
            <span className="font-bold mr-1">{property.area}</span> m²
          </span>
          {property.bedrooms !== undefined && property.bedrooms > 0 && (
            <span className="flex items-center bg-gray-50 px-2 py-1 rounded-lg">
              <span className="font-bold mr-1">{property.bedrooms}</span> Dorm.
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Precio</span>
            <span className="text-xl font-bold text-brand-pink">
              {property.price && property.price > 0
                ? `${property.currency} ${property.price.toLocaleString()}`
                : 'CONSULTAR'}
            </span>
          </div>
          <Link
            to={`/propiedad/${property.id}`}
            onClick={() => sessionStorage.setItem('prop_scroll_y', window.scrollY.toString())}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors flex items-center group/btn"
          >
            Detalles
            <span className="material-symbols-outlined text-sm ml-1 transition-transform group-hover/btn:translate-x-1">chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;