import React, { useState, useEffect } from 'react';
import { Property, PropertyType, OperationType, PropertyStatus, LandingContent } from '../types';
import { apiService } from '../apiService';
import SEO from '../components/SEO';
import { useSession } from '../src/components/SessionProvider';
import { supabase } from '../src/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import heic2any from 'heic2any';

const SUPER_ADMIN_EMAIL = 'julietabertorello@gmail.com';

interface AdminDashboardProps {
  isAdmin: boolean;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  content: LandingContent;
  setContent: React.Dispatch<React.SetStateAction<LandingContent>>;
}

type NewImage = { file: File; previewUrl: string; previewLoaded: boolean };

type ExistingImage = { url: string; loaded: boolean };

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isAdmin, properties, setProperties, content, setContent }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'content' | 'users'>('properties');
  const [contentSubTab, setContentSubTab] = useState<'brand' | 'hero' | 'services' | 'sections' | 'about' | 'footer' | 'seo'>('brand');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [tempFeatures, setTempFeatures] = useState<string[]>(content.aboutFeatures);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [tempStatus, setTempStatus] = useState<PropertyStatus>(PropertyStatus.ACTIVE);

  // Navbar logo upload (SVG / PNG / JPG)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState<Array<{ email: string; created_at: string | null }>>([]);

  const navigate = useNavigate();
  const { session, user, loading: loadingSession } = useSession();
  const isSuperAdmin = (user?.email || '').toLowerCase() === SUPER_ADMIN_EMAIL;

  const parseOptionalNumber = (value: FormDataEntryValue | null): number | null => {
    const raw = (value ?? '').toString().trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const clearNewImages = () => {
    setNewImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
  };

  const clearLogoSelection = () => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(null);
    setLogoFile(null);
  };

  const isSiteAssetsUrl = (url: string) => url.includes('/storage/v1/object/public/site-assets/');

  const isAllowedLogoFile = (file: File) => {
    const name = (file.name || '').toLowerCase();
    const isByMime = ['image/svg+xml', 'image/png', 'image/jpeg'].includes(file.type);
    const isByExt = name.endsWith('.svg') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
    return isByMime || isByExt;
  };

  const pickLogo = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!isAllowedLogoFile(file)) {
      setStatus({ message: 'El logo debe ser un archivo SVG, PNG o JPG', type: 'error' });
      return;
    }

    clearLogoSelection();
    setRemoveLogo(false);
    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const requestRemoveLogo = () => {
    clearLogoSelection();
    setRemoveLogo(true);
  };

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (editingProperty) {
      setExistingImages((editingProperty.images || []).map((url) => ({ url, loaded: false })));
      setTempStatus(editingProperty.status);
    } else {
      setExistingImages([]);
      setTempStatus(PropertyStatus.ACTIVE);
    }
    clearNewImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProperty, showForm]);

  useEffect(() => {
    const loadAllowed = async () => {
      if (!isSuperAdmin || activeTab !== 'users') return;
      const { data, error } = await supabase
        .from('admin_allowlist')
        .select('email, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) setAllowedEmails(data);
    };

    void loadAllowed();
  }, [activeTab, isSuperAdmin]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    setInviting(true);
    try {
      const { error } = await supabase.functions.invoke('invite-admin', {
        body: { email },
      });

      if (error) {
        setStatus({ message: error.message, type: 'error' });
        return;
      }

      setInviteEmail('');
      setStatus({ message: 'Invitación enviada', type: 'success' });

      const { data } = await supabase
        .from('admin_allowlist')
        .select('email, created_at')
        .order('created_at', { ascending: false });
      if (data) setAllowedEmails(data);
    } finally {
      setInviting(false);
    }
  };

  const handleSaveLanding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const formData = new FormData(e.currentTarget);
      const newContent: LandingContent = {
        ...content,
        siteName: (formData.get('siteName') as string) || content.siteName,
        siteTagline: (formData.get('siteTagline') as string) || content.siteTagline,
        // NOTE: logo is handled below (upload/remove)
        navbarLogo: (formData.get('navbarLogo') as string) || content.navbarLogo,
        heroTitle: (formData.get('heroTitle') as string) || content.heroTitle,
        heroSubtitle: (formData.get('heroSubtitle') as string) || content.heroSubtitle,
        heroImage: (formData.get('heroImage') as string) || content.heroImage,
        heroPrimaryButtonText: (formData.get('heroPrimaryButtonText') as string) || content.heroPrimaryButtonText,
        heroSecondaryButtonText: (formData.get('heroSecondaryButtonText') as string) || content.heroSecondaryButtonText,
        servicesTitle: (formData.get('servicesTitle') as string) || content.servicesTitle,
        servicesSubtitle: (formData.get('servicesSubtitle') as string) || content.servicesSubtitle,
        service1Title: (formData.get('service1Title') as string) || content.service1Title,
        service1Desc: (formData.get('service1Desc') as string) || content.service1Desc,
        service1Icon: (formData.get('service1Icon') as string) || content.service1Icon,
        service2Title: (formData.get('service2Title') as string) || content.service2Title,
        service2Desc: (formData.get('service2Desc') as string) || content.service2Desc,
        service2Icon: (formData.get('service2Icon') as string) || content.service2Icon,
        service3Title: (formData.get('service3Title') as string) || content.service3Title,
        service3Desc: (formData.get('service3Desc') as string) || content.service3Desc,
        service3Icon: (formData.get('service3Icon') as string) || content.service3Icon,
        apartHotelLink: (formData.get('apartHotelLink') as string) || content.apartHotelLink,
        featuredTitle: (formData.get('featuredTitle') as string) || content.featuredTitle,
        featuredSubtitle: (formData.get('featuredSubtitle') as string) || content.featuredSubtitle,
        featuredButtonText: (formData.get('featuredButtonText') as string) || content.featuredButtonText,
        propertiesTitle: (formData.get('propertiesTitle') as string) || content.propertiesTitle,
        propertiesSubtitle: (formData.get('propertiesSubtitle') as string) || content.propertiesSubtitle,
        aboutBadge: (formData.get('aboutBadge') as string) || content.aboutBadge,
        aboutTitle: (formData.get('aboutTitle') as string) || content.aboutTitle,
        aboutDescription1: (formData.get('aboutDescription1') as string) || content.aboutDescription1,
        aboutDescription2: (formData.get('aboutDescription2') as string) || content.aboutDescription2,
        aboutImage: (formData.get('aboutImage') as string) || content.aboutImage,
        aboutExperience: (formData.get('aboutExperience') as string) || content.aboutExperience,
        aboutFeatures: tempFeatures,
        contactPhone: (formData.get('contactPhone') as string) || content.contactPhone,
        contactEmail: (formData.get('contactEmail') as string) || content.contactEmail,
        contactInstagram: (formData.get('contactInstagram') as string) || content.contactInstagram,
        contactFacebook: (formData.get('contactFacebook') as string) || content.contactFacebook,
        officeAddress: (formData.get('officeAddress') as string) || content.officeAddress,
        officeLatitude: parseOptionalNumber(formData.get('officeLatitude')),
        officeLongitude: parseOptionalNumber(formData.get('officeLongitude')),
        officeHours: (formData.get('officeHours') as string) || content.officeHours,
        footerDescription: (formData.get('footerDescription') as string) || content.footerDescription,
        seoTitle: (formData.get('seoTitle') as string) || content.seoTitle,
        seoDescription: (formData.get('seoDescription') as string) || content.seoDescription,
        seoKeywords: (formData.get('seoKeywords') as string) || content.seoKeywords,
        ogImage: (formData.get('ogImage') as string) || content.ogImage,
        seoRobots: (formData.get('seoRobots') as string) || content.seoRobots,
      };

      // Apply logo action: upload / remove to fallback / keep current
      const previousLogoUrl = content.navbarLogo || '';

      if (removeLogo) {
        if (previousLogoUrl && isSiteAssetsUrl(previousLogoUrl)) {
          await apiService.deleteNavbarLogo(previousLogoUrl);
        }
        newContent.navbarLogo = '';
      } else if (logoFile) {
        const prev = previousLogoUrl && isSiteAssetsUrl(previousLogoUrl) ? previousLogoUrl : undefined;
        newContent.navbarLogo = await apiService.uploadNavbarLogoSvg(logoFile, prev);
      }

      await apiService.updateLandingContent(newContent);
      setContent(newContent);

      // Reset local logo UI state after saving
      setRemoveLogo(false);
      clearLogoSelection();

      setStatus({ message: 'Web actualizada exitosamente', type: 'success' });
    } catch (e) {
      setStatus({ message: 'Error al sincronizar cambios', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const setPropertyActive = async (id: string, active: boolean) => {
    const prop = properties.find(p => p.id === id);
    if (!prop) return;

    setIsProcessing(true);
    try {
      const updatedProp = { ...prop, status: active ? PropertyStatus.ACTIVE : PropertyStatus.ARCHIVED };
      const saved = await apiService.saveProperty(updatedProp);
      setProperties(prev => prev.map(p => p.id === id ? saved : p));
      setStatus({ message: 'Estado actualizado', type: 'success' });
    } catch (e) {
      setStatus({ message: 'Error', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
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

      const currentUrls = existingImages.map((i) => i.url);
      const removedExistingUrls = editingProperty
        ? (editingProperty.images || []).filter((url) => !currentUrls.includes(url))
        : [];

      const newProp: Property = {
        id: editingProperty?.id ?? '',
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: priceVal && priceVal !== '' ? Number(priceVal) : null,
        currency: formData.get('currency') as 'USD' | 'ARS',
        type: formData.get('type') as PropertyType,
        operation: formData.get('operation') as OperationType,
        location: formData.get('location') as string,
        latitude: parseOptionalNumber(formData.get('latitude')),
        longitude: parseOptionalNumber(formData.get('longitude')),
        area: Number(formData.get('area')),
        images: currentUrls.filter(img => img && img.trim() !== ''),
        status: tempStatus,
        featured: formData.get('featured') === 'on'
      };

      const saved = await apiService.saveProperty(
        newProp,
        newImages.map((i) => i.file),
        removedExistingUrls,
      );

      if (editingProperty) setProperties(prev => prev.map(p => p.id === editingProperty.id ? saved : p));
      else setProperties(prev => [saved, ...prev]);

      setStatus({ message: 'Propiedad guardada', type: 'success' });
      setEditingProperty(null);
      setShowForm(false);
      clearNewImages();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar';
      setStatus({ message: msg, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const isHeicFile = (file: File) => {
    const nameLower = (file.name || '').toLowerCase();
    return (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      nameLower.endsWith('.heic') ||
      nameLower.endsWith('.heif')
    );
  };

  const baseNameWithoutExtension = (name: string) => {
    const trimmed = name.trim();
    const lastDot = trimmed.lastIndexOf('.');
    if (lastDot <= 0) return trimmed;
    return trimmed.slice(0, lastDot);
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const picked: NewImage[] = [];

    for (const original of Array.from(files)) {
      let file = original;

      // Convert HEIC/HEIF to JPEG so previews won't look broken and uploads work across browsers
      if (isHeicFile(file)) {
        try {
          const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
          const blob = Array.isArray(out) ? out[0] : out;
          const base = baseNameWithoutExtension(file.name || 'image');
          file = new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
        } catch {
          setStatus({
            message:
              'No se pudo convertir la foto HEIC. Probá convertirla a JPG antes de subirla (en iPhone: Ajustes → Cámara → Formatos → "Más compatible").',
            type: 'error',
          });
          continue;
        }
      }

      picked.push({
        file,
        previewUrl: URL.createObjectURL(file),
        previewLoaded: false,
      });
    }

    if (picked.length > 0) {
      setNewImages((prev) => [...prev, ...picked]);
    }
  };

  const markNewPreviewLoaded = (previewUrl: string) => {
    setNewImages((prev) =>
      prev.map((img) => (img.previewUrl === previewUrl ? { ...img, previewLoaded: true } : img)),
    );
  };

  const removeNewFile = (index: number) => {
    setNewImages((prev) => {
      const img = prev[index];
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((i) => i.url !== url));
  };

  const markExistingLoaded = (url: string) => {
    setExistingImages((prev) => prev.map((i) => (i.url === url ? { ...i, loaded: true } : i)));
  };

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
          <h1 className="text-3xl sm:text-4xl font-playfair text-gray-900">Gestión Andrea Sartori</h1>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab('properties')} className={`whitespace-nowrap px-4 sm:px-6 md:px-8 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'properties' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-brand-pink'}`}>Propiedades</button>
            <button onClick={() => setActiveTab('content')} className={`whitespace-nowrap px-4 sm:px-6 md:px-8 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'content' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-brand-pink'}`}>Web</button>
            {isSuperAdmin && (
              <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap px-4 sm:px-6 md:px-8 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'users' ? 'bg-brand-pink text-white' : 'text-gray-400 hover:text-brand-pink'}`}>Usuarios</button>
            )}
          </div>
        </header>

        {activeTab === 'properties' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">Listado Maestro</h2>
              <button onClick={() => { setEditingProperty(null); setShowForm(true); }} className="bg-brand-pink text-white px-6 py-3 rounded-xl text-xs font-bold uppercase shadow-lg hover:bg-brand-dark transition-all">Nueva Propiedad</button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 md:px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inmueble</th>
                    <th className="px-4 md:px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                    <th className="px-4 md:px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activa</th>
                    <th className="px-4 md:px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map(p => {
                    const hasImg = p.images && p.images.length > 0 && p.images[0] !== '';
                    const isActive = p.status === PropertyStatus.ACTIVE;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center space-x-4">
                            {hasImg ? (
                              <img src={p.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                <span className="material-symbols-outlined text-lg">hide_image</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-gray-900 block line-clamp-1">{p.title}</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{p.type} · {p.operation}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 font-bold text-gray-800 whitespace-nowrap">
                          {p.price && p.price > 0 ? `${p.currency} ${p.price.toLocaleString()}` : 'CONSULTAR'}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            disabled={isProcessing}
                            onClick={() => void setPropertyActive(p.id, !isActive)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                              isActive ? 'bg-green-500' : 'bg-gray-300'
                            } ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={isActive ? 'Activa' : 'Desactivada'}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`ml-3 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                            {isActive ? 'Activa' : 'Desactivada'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button onClick={() => { setEditingProperty(p); setShowForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><span className="material-symbols-outlined">edit</span></button>
                            <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined">delete</span></button>
                          </div>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Latitud (opcional)</label>
                        <input
                          name="latitude"
                          type="number"
                          step="any"
                          placeholder="Ej: -31.8732766"
                          defaultValue={editingProperty?.latitude ?? ''}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Longitud (opcional)</label>
                        <input
                          name="longitude"
                          type="number"
                          step="any"
                          placeholder="Ej: -62.7173993"
                          defaultValue={editingProperty?.longitude ?? ''}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 -mt-2">
                      Si cargás lat/lng, el link abrirá el pin exacto en Google Maps. Si lo dejás vacío, se usa la búsqueda por texto.
                    </p>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                      <textarea name="description" rows={4} placeholder="Detalles..." defaultValue={editingProperty?.description} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"></textarea>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Imágenes</label>
                        <label className={`text-brand-pink text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
                          + Subir fotos
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => void onPickFiles(e.target.files)}
                            disabled={isProcessing}
                          />
                        </label>
                      </div>

                      {(existingImages.length > 0 || newImages.length > 0) ? (
                        <div className="space-y-4">
                          {existingImages.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Fotos actuales</div>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {existingImages.map((img) => (
                                  <div key={img.url} className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
                                    <img
                                      src={img.url}
                                      alt="Imagen"
                                      className="w-full h-full object-cover"
                                      onLoad={() => markExistingLoaded(img.url)}
                                      onError={() => markExistingLoaded(img.url)}
                                    />

                                    {!img.loaded && (
                                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => removeExistingImage(img.url)}
                                      className={`absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity ${isProcessing ? 'pointer-events-none opacity-0' : ''}`}
                                      title="Eliminar (se borra al guardar)"
                                    >
                                      <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {newImages.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Fotos nuevas</div>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {newImages.map((img, idx) => (
                                  <div key={img.previewUrl} className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square">
                                    <img
                                      src={img.previewUrl}
                                      alt={img.file.name}
                                      className="w-full h-full object-cover"
                                      onLoad={() => markNewPreviewLoaded(img.previewUrl)}
                                      onError={() => markNewPreviewLoaded(img.previewUrl)}
                                    />

                                    {(!img.previewLoaded || isProcessing) && (
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => removeNewFile(idx)}
                                      className={`absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity ${isProcessing ? 'pointer-events-none opacity-0' : ''}`}
                                      title="Quitar"
                                    >
                                      <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                          Todavía no hay fotos. Subí una o más imágenes desde tu dispositivo.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</div>
                        <div className="text-sm font-bold text-gray-900">{tempStatus === PropertyStatus.ACTIVE ? 'Activa' : 'Desactivada'}</div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={tempStatus === PropertyStatus.ACTIVE}
                        disabled={isProcessing}
                        onClick={() =>
                          setTempStatus((prev) =>
                            prev === PropertyStatus.ACTIVE ? PropertyStatus.ARCHIVED : PropertyStatus.ACTIVE,
                          )
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          tempStatus === PropertyStatus.ACTIVE ? 'bg-green-500' : 'bg-gray-300'
                        } ${isProcessing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            tempStatus === PropertyStatus.ACTIVE ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <input type="checkbox" name="featured" id="featured" defaultChecked={editingProperty?.featured} className="w-5 h-5 accent-brand-pink" />
                      <label htmlFor="featured" className="text-xs font-bold text-gray-700 uppercase tracking-widest cursor-pointer">Destacar en Inicio</label>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 bg-brand-pink text-white font-bold rounded-xl uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Guardando...' : (editingProperty ? 'Guardar Cambios' : 'Publicar')}
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => { clearNewImages(); setShowForm(false); }}
                        className="w-full py-3 text-gray-400 font-bold uppercase text-xs mt-2 hover:text-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'content' ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {(['brand', 'hero', 'services', 'sections', 'about', 'footer', 'seo'] as const).map(tab => (
                <button key={tab} onClick={() => setContentSubTab(tab)} className={`flex-1 min-w-[120px] py-5 text-[10px] font-bold uppercase tracking-widest relative transition-all ${contentSubTab === tab ? 'text-brand-pink' : 'text-gray-400 hover:text-brand-pink'}`}>
                  {tab === 'brand' ? 'Marca' : tab === 'hero' ? 'Banner' : tab === 'services' ? 'Servicios' : tab === 'sections' ? 'Títulos' : tab === 'about' ? 'Historia' : tab === 'footer' ? 'Contacto' : 'SEO'}
                  {contentSubTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-pink"></div>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveLanding} className="p-5 sm:p-8 space-y-10 max-w-4xl mx-auto">
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

                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logo (SVG / PNG / JPG)</label>
                      <div className="flex items-center gap-2">
                        <label className={`text-xs font-bold uppercase tracking-widest text-brand-pink hover:underline cursor-pointer ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
                          Subir logo
                          <input
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg,.svg,.png,.jpg,.jpeg"
                            className="hidden"
                            disabled={isProcessing}
                            onChange={(e) => pickLogo(e.target.files)}
                          />
                        </label>
                        <button
                          type="button"
                          disabled={isProcessing || (!content.navbarLogo && !logoFile && !removeLogo)}
                          onClick={requestRemoveLogo}
                          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        {removeLogo ? (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Por defecto</span>
                        ) : logoPreviewUrl ? (
                          <img src={logoPreviewUrl} alt="Logo nuevo" className="max-h-full max-w-full object-contain" />
                        ) : content.navbarLogo ? (
                          <img src={content.navbarLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Por defecto</span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600">
                        {removeLogo
                          ? 'Se usará el logo por defecto.'
                          : logoFile
                            ? `Nuevo logo seleccionado: ${logoFile.name}`
                            : content.navbarLogo
                              ? 'Logo personalizado activo.'
                              : 'Actualmente usando el logo por defecto.'}
                      </div>
                    </div>

                    <p className="text-xs text-gray-400">
                      Si quitás el logo, el sitio vuelve automáticamente al logo por defecto (el actual).
                    </p>
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

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latitud oficina (opcional)</label>
                    <input
                      name="officeLatitude"
                      type="number"
                      step="any"
                      placeholder="Ej: -31.8732766"
                      defaultValue={content.officeLatitude ?? ''}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Longitud oficina (opcional)</label>
                    <input
                      name="officeLongitude"
                      type="number"
                      step="any"
                      placeholder="Ej: -62.7173993"
                      defaultValue={content.officeLongitude ?? ''}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pequeña Descripción Footer</label>
                    <textarea name="footerDescription" rows={3} defaultValue={content.footerDescription} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-pink"></textarea>
                  </div>

                  <p className="text-xs text-gray-400 md:col-span-2 -mt-2">
                    Si cargás lat/lng de la oficina, el link de la dirección abrirá el pin exacto en Google Maps.
                  </p>
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
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invitar usuario</h2>
            <p className="text-sm text-gray-500 mb-6">
              Agregá un email y se enviará una invitación. Ese email quedará habilitado para acceder al panel.
            </p>

            <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-3 md:items-end mb-8">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="usuario@correo.com"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
                />
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="bg-brand-pink text-white px-6 py-3 rounded-xl text-xs font-bold uppercase shadow-lg hover:bg-brand-dark transition-all disabled:opacity-70"
              >
                {inviting ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </form>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Usuarios con acceso</h3>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                {allowedEmails.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No hay emails cargados.</div>
                ) : (
                  allowedEmails.map((row) => (
                    <div key={row.email} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1 font-medium text-gray-900 truncate">{row.email}</div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;