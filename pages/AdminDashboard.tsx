import React, { useState, useEffect } from 'react';
import { Property, PropertyType, OperationType, PropertyStatus, LandingContent } from '../types';
import { apiService } from '../apiService';
import SEO from '../components/SEO';
import { useSession } from '../components/SessionProvider'; // Import useSession
import { supabase } from '../integrations/supabase/client'; // Import supabase client
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  isAdmin: boolean;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  content: LandingContent;
  setContent: React.Dispatch<React.SetStateAction<LandingContent>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isAdmin, properties, setProperties, content, setContent }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'content'>('properties');
  const [contentSubTab, setContentSubTab] = useState<'brand' | 'hero' | 'services' | 'sections' | 'about' | 'footer' | 'seo'>('brand');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Removed local login state, now handled by Supabase
  // const [usernameInput, setUsernameInput] = useState('');
  // const [passwordInput, setPasswordInput] = useState('');
  // const [loginError, setLoginError] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [tempFeatures, setTempFeatures] = useState<string[]>(content.aboutFeatures);
  const [tempImages, setTempImages] = useState<string[]>([]);

  const navigate = useNavigate();
  const { session, loading: loadingSession } = useSession(); // Get session and loading state from context

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (editingProperty) {
      setTempImages(editingProperty.images || []);
    } else {
      setTempImages(['']);
    }
  }, [editingProperty, showForm]);

  // No local login handler needed, it's handled by LoginPage and ProtectedRoute
  // const handleLogin = (e: React.FormEvent) => { ... };

  const handleSaveLanding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const formData = new FormData(e.currentTarget);
      const newContent: LandingContent = {
        ...content,
        siteName: formData.get('siteName') as string || content.siteName,
        siteTagline: formData.get('siteTagline') as string || content.siteTagline,
        navbarLogo: formData.get('navbarLogo') as string || content.navbarLogo,
        heroTitle: formData.get('heroTitle') as string || content.heroTitle,
        heroSubtitle: formData.get('heroSubtitle') as string || content.heroSubtitle,
        heroImage: formData.get('heroImage') as string || content.heroImage,
        heroPrimaryButtonText: formData.get('heroPrimaryButtonText') as string || content.heroPrimaryButtonText,
        heroSecondaryButtonText: formData.get('heroSecondaryButtonText') as string || content.heroSecondaryButtonText,
        servicesTitle: formData.get('servicesTitle') as string || content.servicesTitle,
        servicesSubtitle: formData.get('servicesSubtitle') as string || content.servicesSubtitle,
        service1Title: formData.get('service1Title') as string || content.service1Title,
        service1Desc: formData.get('service1Desc') as string || content.service1Desc,
        service1Icon: formData.get('service1Icon') as string || content.service1Icon,
        service2Title: formData.get('service2Title') as string || content.service2Title,
        service2Desc: formData.get('service2Desc') as string || content.service2Desc,
        service2Icon: formData.get('service2Icon') as string || content.service2Icon,
        service3Title: formData.get('service3Title') as string || content.service3Title,
        service3Desc: formData.get('service3Desc') as string || content.service3Desc,
        service3Icon: formData.get('service3Icon') as string || content.service3Icon,
        apartHotelLink: formData.get('apartHotelLink') as string || content.apartHotelLink,
        featuredTitle: formData.get('featuredTitle') as string || content.featuredTitle,
        featuredSubtitle: formData.get('featuredSubtitle') as string || content.featuredSubtitle,
        featuredButtonText: formData.get('featuredButtonText') as string || content.featuredButtonText,
        propertiesTitle: formData.get('propertiesTitle') as string || content.propertiesTitle,
        propertiesSubtitle: formData.get('propertiesSubtitle') as string || content.propertiesSubtitle,
        aboutBadge: formData.get('aboutBadge') as string || content.aboutBadge,
        aboutTitle: formData.get('aboutTitle') as string || content.aboutTitle,
        aboutDescription1: formData.get('aboutDescription1') as string || content.aboutDescription1,
        aboutDescription2: formData.get('aboutDescription2') as string || content.aboutDescription2,
        aboutImage: formData.get('aboutImage') as string || content.aboutImage,
        aboutExperience: formData.get('aboutExperience') as string || content.aboutExperience,
        aboutFeatures: tempFeatures,
        contactPhone: formData.get('contactPhone') as string || content.contactPhone,
        contactEmail: formData.get('contactEmail') as string || content.contactEmail,
        contactInstagram: formData.get('contactInstagram') as string || content.contactInstagram,
        contactFacebook: formData.get('contactFacebook') as string || content.contactFacebook,
        officeAddress: formData.get('officeAddress') as string || content.officeAddress,
        officeHours: formData.get('officeHours') as string || content.officeHours,
        footerDescription: formData.get('footerDescription') as string || content.footerDescription,
        seoTitle: formData.get('seoTitle') as string || content.seoTitle,
        seoDescription: formData.get('seoDescription') as string || content.seoDescription,
        seoKeywords: formData.get('seoKeywords') as string || content.seoKeywords,
        ogImage: formData.get('ogImage') as string || content.ogImage,
        seoRobots: formData.get('seoRobots') as string || content.seoRobots,
      };
      
      await apiService.updateLandingContent(newContent);
      setContent(newContent);
      setStatus({ message: 'Web actualizada exitosamente', type: 'success' });
    } catch (e) {
      setStatus({ message: 'Error al sincronizar cambios', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (id: string) => {
    const prop = properties.find(p => p.id === id);
    if (!prop) return;
    setIsProcessing(true);
    try {
      const updatedProp = { ...prop, status: prop.status === PropertyStatus.ACTIVE ? PropertyStatus.ARCHIVED : PropertyStatus.ACTIVE };
      await apiService.saveProperty(updatedProp);
      setProperties(prev => prev.map(p => p.id === id ? updatedProp : p));
      setStatus({ message: 'Estado actualizado', type: 'success' });
    } catch (e) { setStatus({ message: 'Error', type: 'error' }); } finally { setIsProcessing(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar propiedad?')) {
      setIsProcessing(true);
      try {
        await apiService.deleteProperty(id);
        setProperties(prev => prev.filter(p => p.id !== id));
        setStatus({ message: 'Eliminada', type: 'success' });
      } catch (e) { setStatus({ message: 'Error', type: 'error' }); } finally { setIsProcessing(false); }
    }
  };

  const handleSaveProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const formData = new FormData(e.currentTarget);
      const priceVal = formData.get('price');
      const newProp: Property = {
        id: editingProperty?.id || Math.random().toString(36).substr(2, 9),
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: priceVal && priceVal !== '' ? Number(priceVal) : null,
        currency: formData.get('currency') as 'USD' | 'ARS',
        type: formData.get('type') as PropertyType,
        operation: formData.get('operation') as OperationType,
        location: formData.get('location') as string,
        area: Number(formData.get('area')),
        images: tempImages.filter(img => img && img.trim() !== ''),
        status: editingProperty?.status || PropertyStatus.ACTIVE,
        featured: formData.get('featured') === 'on'
      };
      await apiService.saveProperty(newProp);
      if (editingProperty) setProperties(prev => prev.map(p => p.id === editingProperty.id ? newProp : p));
      else setProperties(prev => [newProp, ...prev]);
      setStatus({ message: 'Propiedad guardada', type: 'success' });
      setEditingProperty(null); setShowForm(false);
    } catch (e) { setStatus({ message: 'Error al guardar', type: 'error' }); } finally { setIsProcessing(false); }
  };

  const updateImage = (idx: number, val: string) => {
    const next = [...tempImages];
    next[idx] = val;
    setTempImages(next);
  };

  // If not admin, redirect to login (handled by ProtectedRoute)
  // The component will only render if isAdmin is true due to ProtectedRoute
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <SEO title="Panel Maestro" robots="noindex" />
      {status && (
        <div className={`fixed top-24 right-4 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-white animate-in slide-in-from-right-4 duration-300 ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <span className="font-bold">{status.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <h1 className="text-4xl font-playfair text-gray-900">Gestión Andrea Sartori</h1>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setActiveTab('properties')} className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'properties' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-brand-pink'}`}>Propiedades</button>
            <button onClick={() => setActiveTab('content')} className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'content' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-brand-pink'}`}>Web</button>
          </div>
        </header>

        {activeTab === 'properties' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Listado Maestro</h2>
              <button onClick={() => { setEditingProperty(null); setShowForm(true); }} className="bg-brand-pink text-white px-6 py-3 rounded-xl text-xs font-bold uppercase shadow-lg hover:bg-brand-dark transition-all">Nueva Propiedad</button>
            </div>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inmueble</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map(p => {
                    const hasImg = p.images && p.images.length > 0 && p.images[0] !== '';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-4">
                          {hasImg ? (
                            <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                              <span className="material-symbols-outlined text-lg">hide_image</span>
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 block line-clamp-1">{p.title}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{p.type} · {p.operation}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {p.price && p.price > 0 ? `${p.currency} ${p.price.toLocaleString()}` : 'CONSULTAR'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.status === 'Activa' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button onClick={() => {setEditingProperty(p); setShowForm(true);}} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><span className="material-symbols-outlined">edit</span></button>
                          <button onClick={() => handleArchive(p.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><span className="material-symbols-outlined">archive</span></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
                   <h3 className="text-2xl font-playfair font-bold mb-8">{editingProperty ? 'Editar' : 'Nueva'} Propiedad</h3>
                   <form onSubmit={handleSaveProperty} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Título</label>
                        <input name="title" placeholder="Ej: Casa 3 dorm. con piscina" defaultValue={editingProperty?.title} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
                          <select name="type" defaultValue={editingProperty?.type} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink">
                            {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Operación</label>
                          <select name="operation" defaultValue={editingProperty?.operation} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink">
                            {Object.values(OperationType).map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Precio (Vacío = CONSULTAR)</label>
                          <input name="price" type="number" placeholder="Ej: 150000" defaultValue={editingProperty?.price || ''} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Moneda</label>
                          <select name="currency" defaultValue={editingProperty?.currency} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink">
                            <option value="USD">USD</option>
                            <option value="ARS">ARS</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ubicación</label>
                          <input name="location" placeholder="Las Varillas, Córdoba" defaultValue={editingProperty?.location} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Superficie (m²)</label>
                          <input name="area" type="number" placeholder="Ej: 120" defaultValue={editingProperty?.area} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                        <textarea name="description" rows={4} placeholder="Detalles..." defaultValue={editingProperty?.description} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"></textarea>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Imágenes (URLs)</label>
                          <button type="button" onClick={() => setTempImages([...tempImages, ''])} className="text-brand-pink text-xs font-bold uppercase tracking-widest hover:underline">+ Añadir</button>
                        </div>
                        <div className="space-y-2">
                          {tempImages.map((img, i) => (
                            <div key={i} className="flex space-x-2">
                              <input value={img} onChange={(e) => updateImage(i, e.target.value)} placeholder="https://..." className="flex-grow bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-pink" />
                              <button type="button" onClick={() => setTempImages(tempImages.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-4">
                        <input type="checkbox" name="featured" id="featured" defaultChecked={editingProperty?.featured} className="w-5 h-5 accent-brand-pink" />
                        <label htmlFor="featured" className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Destacar en Inicio</label>
                      </div>

                      <div className="pt-6">
                        <button type="submit" className="w-full py-4 bg-brand-pink text-white font-bold rounded-xl uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all active:scale-95">
                          {editingProperty ? 'Guardar Cambios' : 'Publicar'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-xs mt-2 hover:text-gray-600">Cancelar</button>
                      </div>
                   </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {(['brand', 'hero', 'services', 'sections', 'about', 'footer', 'seo'] as const).map(tab => (
                <button key={tab} onClick={() => setContentSubTab(tab)} className={`flex-1 min-w-[120px] py-5 text-[10px] font-bold uppercase tracking-widest relative transition-all ${contentSubTab === tab ? 'text-brand-pink' : 'text-gray-400 hover:text-brand-pink'}`}>
                  {tab === 'brand' ? 'Marca' : tab === 'hero' ? 'Banner' : tab === 'services' ? 'Servicios' : tab === 'sections' ? 'Títulos' : tab === 'about' ? 'Historia' : tab === 'footer' ? 'Contacto' : 'SEO'}
                  {contentSubTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-pink"></div>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveLanding} className="p-8 space-y-10 max-w-4xl mx-auto">
              {contentSubTab === 'brand' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nombre del Negocio</label>
                    <input name="siteName" defaultValue={content.siteName} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Eslogan</label>
                    <input name="siteTagline" defaultValue={content.siteTagline} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL del Logo (Opcional)</label>
                    <input name="navbarLogo" defaultValue={content.navbarLogo} placeholder="https://..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                </div>
              )}

              {contentSubTab === 'hero' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título del Banner Principal</label>
                    <input name="heroTitle" defaultValue={content.heroTitle} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtítulo del Banner</label>
                    <textarea name="heroSubtitle" rows={2} defaultValue={content.heroSubtitle} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL Imagen de Fondo (Banner)</label>
                    <input name="heroImage" defaultValue={content.heroImage} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Texto Botón Primario</label>
                      <input name="heroPrimaryButtonText" defaultValue={content.heroPrimaryButtonText} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Texto Botón Secundario</label>
                      <input name="heroSecondaryButtonText" defaultValue={content.heroSecondaryButtonText} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                    </div>
                  </div>
                </div>
              )}

              {contentSubTab === 'services' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título de Sección Servicios</label>
                      <input name="servicesTitle" defaultValue={content.servicesTitle} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtítulo de Sección Servicios</label>
                      <input name="servicesSubtitle" defaultValue={content.servicesSubtitle} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                    </div>
                  </div>
                  
                  {[1, 2, 3].map(num => (
                    <div key={num} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-pink">Servicio {num}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Título</label>
                          <input name={`service${num}Title`} defaultValue={(content as any)[`service${num}Title`]} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-brand-pink" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Icono (Material Symbol)</label>
                          <input name={`service${num}Icon`} defaultValue={(content as any)[`service${num}Icon`]} placeholder="Ej: home, key, hotel" className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-brand-pink" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold text-gray-400 uppercase">Descripción</label>
                        <textarea name={`service${num}Desc`} rows={2} defaultValue={(content as any)[`service${num}Desc`]} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                      </div>
                      {num === 3 && (
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-gray-400 uppercase">Link Especial (Apart Hotel)</label>
                          <input name="apartHotelLink" defaultValue={content.apartHotelLink} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-brand-pink" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {contentSubTab === 'sections' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-pink">Sección: Propiedades Destacadas</h4>
                    <input name="featuredTitle" defaultValue={content.featuredTitle} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 focus:ring-1 focus:ring-brand-pink" />
                    <textarea name="featuredSubtitle" rows={2} defaultValue={content.featuredSubtitle} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 focus:ring-1 focus:ring-brand-pink"></textarea>
                    <input name="featuredButtonText" defaultValue={content.featuredButtonText} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-pink">Sección: Catálogo General</h4>
                    <input name="propertiesTitle" defaultValue={content.propertiesTitle} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 focus:ring-1 focus:ring-brand-pink" />
                    <textarea name="propertiesSubtitle" rows={2} defaultValue={content.propertiesSubtitle} className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>
                </div>
              )}

              {contentSubTab === 'about' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Badge (Pequeño texto arriba)</label>
                      <input name="aboutBadge" defaultValue={content.aboutBadge} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Años de Experiencia</label>
                      <input name="aboutExperience" defaultValue={content.aboutExperience} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL Imagen "Sobre Nosotros"</label>
                    <input name="aboutImage" defaultValue={content.aboutImage} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título Principal Historia</label>
                    <input name="aboutTitle" defaultValue={content.aboutTitle} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Párrafo 1 (Introducción)</label>
                    <textarea name="aboutDescription1" rows={4} defaultValue={content.aboutDescription1} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Párrafo 2 (Continuación)</label>
                    <textarea name="aboutDescription2" rows={4} defaultValue={content.aboutDescription2} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>
                </div>
              )}

              {contentSubTab === 'footer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp (Con código país)</label>
                    <input name="contactPhone" defaultValue={content.contactPhone} placeholder="+54 3533..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email de Contacto</label>
                    <input name="contactEmail" defaultValue={content.contactEmail} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram (Usuario)</label>
                    <input name="contactInstagram" defaultValue={content.contactInstagram} placeholder="nombre_usuario" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facebook (Usuario)</label>
                    <input name="contactFacebook" defaultValue={content.contactFacebook} placeholder="nombre_usuario" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dirección de la Oficina</label>
                    <input name="officeAddress" defaultValue={content.officeAddress} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horarios de Atención</label>
                    <input name="officeHours" defaultValue={content.officeHours} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pequeña Descripción Footer</label>
                    <textarea name="footerDescription" rows={3} defaultValue={content.footerDescription} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>
                </div>
              )}

              {contentSubTab === 'seo' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Título SEO (Pestaña del navegador)</label>
                    <input name="seoTitle" defaultValue={content.seoTitle} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción SEO (Google)</label>
                    <textarea name="seoDescription" rows={3} defaultValue={content.seoDescription} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Palabras Clave (Separadas por comas)</label>
                    <input name="seoKeywords" defaultValue={content.seoKeywords} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL Imagen para Redes (Compartir)</label>
                    <input name="ogImage" defaultValue={content.ogImage} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink" />
                  </div>
                </div>
              )}

              <div className="pt-10 border-t border-gray-100">
                <button type="submit" disabled={isProcessing} className="w-full py-5 bg-brand-pink text-white font-bold rounded-2xl shadow-xl flex items-center justify-center space-x-3 hover:bg-brand-dark transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined">{isProcessing ? 'autorenew' : 'publish'}</span>
                  <span>{isProcessing ? 'Sincronizando...' : 'Publicar Cambios Web'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;