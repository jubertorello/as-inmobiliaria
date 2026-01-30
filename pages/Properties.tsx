
import React, { useState, useMemo, useEffect } from 'react';
import { Property, PropertyType, OperationType, LandingContent } from '../types';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import SectionHeader from '../components/SectionHeader';
import SEO from '../components/SEO';
import { apiService } from '../apiService';

interface PropertiesProps {
  properties: Property[];
}

const Properties: React.FC<PropertiesProps> = ({ properties }) => {
  const [filterType, setFilterType] = useState<PropertyType | 'All'>('All');
  const [filterOp, setFilterOp] = useState<OperationType | 'All'>('All');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterCurrency, setFilterCurrency] = useState<'USD' | 'ARS' | 'All'>('All');
  const [content, setContent] = useState<LandingContent | null>(null);

  useEffect(() => {
    apiService.getLandingContent().then(setContent);
  }, []);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      // Filtros básicos
      const matchType = filterType === 'All' || p.type === filterType;
      const matchOp = filterOp === 'All' || p.operation === filterOp;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.location.toLowerCase().includes(search.toLowerCase());
      
      // Filtro de Moneda
      const matchCurrency = filterCurrency === 'All' || p.currency === filterCurrency;

      // Filtro de Rango de Precio
      let matchPrice = true;
      const priceNum = p.price || 0;
      const isConsultar = !p.price || p.price === 0;

      // Si el usuario pone un precio mínimo o máximo
      if (minPrice !== '' || maxPrice !== '') {
        // Las propiedades "A CONSULTAR" se ocultan si hay un rango numérico activo
        // a menos que el usuario esté buscando un rango que empiece en 0.
        if (isConsultar) {
          matchPrice = false; 
        } else {
          const min = minPrice !== '' ? parseFloat(minPrice) : 0;
          const max = maxPrice !== '' ? parseFloat(maxPrice) : Infinity;
          matchPrice = priceNum >= min && priceNum <= max;
        }
      }

      return matchType && matchOp && matchSearch && matchCurrency && matchPrice;
    });
  }, [properties, filterType, filterOp, search, minPrice, maxPrice, filterCurrency]);

  if (!content) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO 
        title={`${content.propertiesTitle} | ${content.siteName}`}
        description={content.seoDescription}
        keywords={content.seoKeywords}
      />
      
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title={content.propertiesTitle} 
          subtitle={content.propertiesSubtitle} 
          centered={false}
        />

        <PropertyFilters 
          search={search} 
          setSearch={setSearch} 
          filterType={filterType} 
          setFilterType={setFilterType} 
          filterOp={filterOp} 
          setFilterOp={setFilterOp}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          filterCurrency={filterCurrency}
          setFilterCurrency={setFilterCurrency}
        />

        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            {filtered.length} {filtered.length === 1 ? 'Propiedad encontrada' : 'Propiedades encontradas'}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-7xl text-gray-200 mx-auto mb-6">sentiment_dissatisfied</span>
            <p className="text-gray-500 text-lg font-medium mb-2">No encontramos resultados para tu búsqueda.</p>
            <p className="text-gray-400 text-sm mb-8">Prueba ajustando los filtros o el rango de precio.</p>
            <button
              onClick={() => { 
                setFilterType('All'); 
                setFilterOp('All'); 
                setSearch(''); 
                setMinPrice(''); 
                setMaxPrice(''); 
                setFilterCurrency('All');
              }}
              className="px-8 py-3 bg-brand-pink text-white font-bold rounded-2xl uppercase tracking-widest text-[10px] shadow-lg hover:bg-brand-dark transition-all"
            >
              Reiniciar Búsqueda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
