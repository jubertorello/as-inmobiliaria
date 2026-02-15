
import React from 'react';
import { PropertyType, OperationType } from '../types/types';

interface PropertyFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  filterType: PropertyType | 'All';
  setFilterType: (val: PropertyType | 'All') => void;
  filterOp: OperationType | 'All';
  setFilterOp: (val: OperationType | 'All') => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  filterCurrency: 'USD' | 'ARS' | 'All';
  setFilterCurrency: (val: 'USD' | 'ARS' | 'All') => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  search, setSearch, filterType, setFilterType, filterOp, setFilterOp,
  minPrice, setMinPrice, maxPrice, setMaxPrice, filterCurrency, setFilterCurrency
}) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Barra de Búsqueda Principal */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Búsqueda Global</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por título, ciudad o barrio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:outline-none transition-all"
            />
            <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400">search</span>
          </div>
        </div>

        {/* Tipo de Propiedad */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Tipo</label>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">Todos los tipos</option>
              {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Operación */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Operación</label>
          <div className="relative">
            <select
              value={filterOp}
              onChange={(e) => setFilterOp(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">Cualquier operación</option>
              {Object.values(OperationType).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Filtros de Precio Avanzados */}
        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-gray-50">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Moneda</label>
            <div className="relative">
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:outline-none appearance-none cursor-pointer"
              >
                <option value="All">Todas</option>
                <option value="USD">Dólares (USD)</option>
                <option value="ARS">Pesos (ARS)</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-3 text-gray-400 pointer-events-none">payments</span>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Precio Mínimo</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Desde"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 ml-1">Precio Máximo</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Hasta"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end pb-1">
            <button
              onClick={() => {
                setSearch(''); setFilterType('All'); setFilterOp('All');
                setMinPrice(''); setMaxPrice(''); setFilterCurrency('All');
              }}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-brand-pink transition-colors border border-dashed border-gray-200 rounded-2xl"
            >
              Reiniciar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
