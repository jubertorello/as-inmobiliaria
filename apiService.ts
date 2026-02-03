import { Property, LandingContent, PropertyStatus } from './types';
import { INITIAL_LANDING_CONTENT } from './constants';
import { supabase } from './src/integrations/supabase/client';
import heic2any from 'heic2any';

type PropertyRow = {
  id: string;
  title: string;
  description: string;
  price: string | number | null;
  currency: 'USD' | 'ARS';
  type: string;
  operation: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | number;
  images: string[];
  status: string;
  featured: boolean;
};

type LandingContentRow = {
  id: string;
  singleton: boolean;
  site_name: string;
  site_tagline: string;
  navbar_logo: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  hero_primary_button_text: string;
  hero_secondary_button_text: string;
  services_title: string;
  services_subtitle: string;
  service1_title: string;
  service1_desc: string;
  service1_icon: string;
  service2_title: string;
  service2_desc: string;
  service2_icon: string;
  service3_title: string;
  service3_desc: string;
  service3_icon: string;
  apart_hotel_link: string;
  featured_title: string;
  featured_subtitle: string;
  featured_button_text: string;
  properties_title: string;
  properties_subtitle: string;
  about_badge: string;
  about_title: string;
  about_description1: string;
  about_description2: string;
  about_image: string;
  about_experience: string;
  about_features: string[];
  contact_phone: string;
  contact_email: string;
  contact_instagram: string;
  contact_facebook: string;
  office_address: string;
  office_latitude: number | null;
  office_longitude: number | null;
  office_hours: string;
  footer_description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image: string;
  seo_robots: string;
};

const mapRowToLandingContent = (row: LandingContentRow): LandingContent => ({
  siteName: row.site_name,
  siteTagline: row.site_tagline,
  navbarLogo: row.navbar_logo,
  heroTitle: row.hero_title,
  heroSubtitle: row.hero_subtitle,
  heroImage: row.hero_image,
  heroPrimaryButtonText: row.hero_primary_button_text,
  heroSecondaryButtonText: row.hero_secondary_button_text,
  servicesTitle: row.services_title,
  servicesSubtitle: row.services_subtitle,
  service1Title: row.service1_title,
  service1Desc: row.service1_desc,
  service1Icon: row.service1_icon,
  service2Title: row.service2_title,
  service2Desc: row.service2_desc,
  service2Icon: row.service2_icon,
  service3Title: row.service3_title,
  service3Desc: row.service3_desc,
  service3Icon: row.service3_icon,
  apartHotelLink: row.apart_hotel_link,
  featuredTitle: row.featured_title,
  featuredSubtitle: row.featured_subtitle,
  featuredButtonText: row.featured_button_text,
  propertiesTitle: row.properties_title,
  propertiesSubtitle: row.properties_subtitle,
  aboutBadge: row.about_badge,
  aboutTitle: row.about_title,
  aboutDescription1: row.about_description1,
  aboutDescription2: row.about_description2,
  aboutImage: row.about_image,
  aboutExperience: row.about_experience,
  aboutFeatures: row.about_features || [],
  contactPhone: row.contact_phone,
  contactEmail: row.contact_email,
  contactInstagram: row.contact_instagram,
  contactFacebook: row.contact_facebook,
  officeAddress: row.office_address,
  officeLatitude: row.office_latitude ?? null,
  officeLongitude: row.office_longitude ?? null,
  officeHours: row.office_hours,
  footerDescription: row.footer_description,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  seoKeywords: row.seo_keywords,
  ogImage: row.og_image,
  seoRobots: row.seo_robots,
});

const mapLandingContentToRow = (content: LandingContent) => ({
  singleton: true,
  site_name: content.siteName,
  site_tagline: content.siteTagline,
  navbar_logo: content.navbarLogo,
  hero_title: content.heroTitle,
  hero_subtitle: content.heroSubtitle,
  hero_image: content.heroImage,
  hero_primary_button_text: content.heroPrimaryButtonText,
  hero_secondary_button_text: content.heroSecondaryButtonText,
  services_title: content.servicesTitle,
  services_subtitle: content.servicesSubtitle,
  service1_title: content.service1Title,
  service1_desc: content.service1Desc,
  service1_icon: content.service1Icon,
  service2_title: content.service2Title,
  service2_desc: content.service2Desc,
  service2_icon: content.service2Icon,
  service3_title: content.service3Title,
  service3_desc: content.service3Desc,
  service3_icon: content.service3Icon,
  apart_hotel_link: content.apartHotelLink,
  featured_title: content.featuredTitle,
  featured_subtitle: content.featuredSubtitle,
  featured_button_text: content.featuredButtonText,
  properties_title: content.propertiesTitle,
  properties_subtitle: content.propertiesSubtitle,
  about_badge: content.aboutBadge,
  about_title: content.aboutTitle,
  about_description1: content.aboutDescription1,
  about_description2: content.aboutDescription2,
  about_image: content.aboutImage,
  about_experience: content.aboutExperience,
  about_features: content.aboutFeatures,
  contact_phone: content.contactPhone,
  contact_email: content.contactEmail,
  contact_instagram: content.contactInstagram,
  contact_facebook: content.contactFacebook,
  office_address: content.officeAddress,
  office_latitude: content.officeLatitude ?? null,
  office_longitude: content.officeLongitude ?? null,
  office_hours: content.officeHours,
  footer_description: content.footerDescription,
  seo_title: content.seoTitle,
  seo_description: content.seoDescription,
  seo_keywords: content.seoKeywords,
  og_image: content.ogImage,
  seo_robots: content.seoRobots,
});

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const mapRowToProperty = (row: PropertyRow): Property => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: row.price === null ? null : typeof row.price === 'string' ? Number(row.price) : row.price,
  currency: row.currency,
  type: row.type as any,
  operation: row.operation as any,
  location: row.location,
  latitude: row.latitude ?? null,
  longitude: row.longitude ?? null,
  bedrooms: row.bedrooms ?? undefined,
  bathrooms: row.bathrooms ?? undefined,
  area: typeof row.area === 'string' ? Number(row.area) : row.area,
  images: row.images || [],
  status: row.status as PropertyStatus,
  featured: Boolean(row.featured),
});

const mapPropertyToRow = (property: Property) => ({
  title: property.title,
  description: property.description,
  price: property.price ?? null,
  currency: property.currency,
  type: property.type,
  operation: property.operation,
  location: property.location,
  latitude: property.latitude ?? null,
  longitude: property.longitude ?? null,
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  area: property.area,
  images: property.images || [],
  status: property.status,
  featured: property.featured,
});

function safeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

function baseNameWithoutExtension(name: string) {
  const trimmed = name.trim();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot <= 0) return trimmed;
  return trimmed.slice(0, lastDot);
}

function isAllowedLogoFile(file: File) {
  const name = (file.name || '').toLowerCase();
  const isByMime = ['image/svg+xml', 'image/png', 'image/jpeg'].includes(file.type);
  const isByExt = name.endsWith('.svg') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');
  return isByMime || isByExt;
}

function getLogoExtensionAndContentType(file: File): { ext: 'svg' | 'png' | 'jpg'; contentType: string } {
  const name = (file.name || '').toLowerCase();

  if (file.type === 'image/svg+xml' || name.endsWith('.svg')) {
    return { ext: 'svg', contentType: 'image/svg+xml' };
  }

  if (file.type === 'image/png' || name.endsWith('.png')) {
    return { ext: 'png', contentType: 'image/png' };
  }

  // Default to jpeg for .jpg/.jpeg
  return { ext: 'jpg', contentType: 'image/jpeg' };
}

function getStoragePathFromPublicUrl(publicUrl: string, bucketId: string): string | null {
  // Expected format:
  // https://<project>.supabase.co/storage/v1/object/public/<bucketId>/<path>
  const marker = `/storage/v1/object/public/${bucketId}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

async function deleteStorageObjectsByPublicUrls(bucketId: string, urls: string[]): Promise<void> {
  const paths = urls
    .map((u) => getStoragePathFromPublicUrl(u, bucketId))
    .filter((p): p is string => Boolean(p));

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(bucketId).remove(paths);
  if (error) throw error;
}

async function uploadSiteLogo(file: File): Promise<string> {
  if (!isAllowedLogoFile(file)) {
    throw new Error('Logo debe ser un archivo SVG, PNG o JPG');
  }

  const bucket = supabase.storage.from('site-assets');

  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const base = safeFileName(baseNameWithoutExtension(file.name || 'logo')) || 'logo';
  const { ext, contentType } = getLogoExtensionAndContentType(file);
  const path = `logo/${id}-${base}.${ext}`;

  const { error: uploadErr } = await bucket.upload(path, file, {
    upsert: true,
    contentType,
  });

  if (uploadErr) throw uploadErr;

  const { data } = bucket.getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('No se pudo obtener URL pública del logo');
  return data.publicUrl;
}

function isHeicFile(file: File) {
  const nameLower = (file.name || '').toLowerCase();
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    nameLower.endsWith('.heic') ||
    nameLower.endsWith('.heif')
  );
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const base = baseNameWithoutExtension(file.name || 'image');
  try {
    const out = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const blob = Array.isArray(out) ? out[0] : out;
    return new File([blob], `${safeFileName(base) || 'image'}.jpg`, { type: 'image/jpeg' });
  } catch {
    throw new Error(
      'No se pudo convertir la imagen HEIC/HEIF. Probá convertirla a JPG antes de subirla (en iPhone: Ajustes → Cámara → Formatos → "Más compatible").',
    );
  }
}

async function imageToWebp(file: File): Promise<File> {
  // If it's not an image, return as-is
  if (!file.type.startsWith('image/')) return file;

  // HEIC/HEIF often breaks in browsers; convert to JPEG first
  let working = file;
  if (isHeicFile(working)) {
    working = await convertHeicToJpeg(working);
  }

  // Target: keep each photo well under 500KB for fast loading
  const targetMaxBytes = 200 * 1024;

  // If it's already small enough, don't recompress
  if (working.size <= targetMaxBytes) return working;

  // iOS/Safari can fail to encode WebP via canvas; we try WebP first and fall back to JPEG.
  const bitmapToCanvas = async (): Promise<{ bitmap: ImageBitmap | null; img: HTMLImageElement | null }> => {
    try {
      const b = await createImageBitmap(working);
      return { bitmap: b, img: null };
    } catch {
      // fallthrough to <img>
    }

    // Fallback: use <img> decoding (works in more browsers than createImageBitmap for some formats)
    const url = URL.createObjectURL(working);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;

      const decodeFn = (img as any).decode;
      if (typeof decodeFn === 'function') {
        await decodeFn.call(img);
      } else {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
        });
      }

      return { bitmap: null, img };
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const { bitmap, img } = await bitmapToCanvas();
  if (!bitmap && !img) {
    console.warn('[upload] could not decode image for compression; uploading original', {
      name: working.name,
      type: working.type,
      kb: Math.round(working.size / 1024),
    });
    return working;
  }

  const width = bitmap ? bitmap.width : img!.naturalWidth;
  const height = bitmap ? bitmap.height : img!.naturalHeight;

  const attempts: Array<{ maxDimension: number; quality: number }> = [
    { maxDimension: 1200, quality: 0.65 },
    { maxDimension: 1000, quality: 0.55 },
    { maxDimension: 900, quality: 0.50 },
    { maxDimension: 800, quality: 0.45 },
    { maxDimension: 700, quality: 0.40 },
    { maxDimension: 600, quality: 0.35 },
    { maxDimension: 550, quality: 0.32 },
    { maxDimension: 500, quality: 0.30 },
    { maxDimension: 450, quality: 0.28 },
    { maxDimension: 400, quality: 0.26 },
  ];

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let best: Blob | null = null;
  let bestType: 'image/webp' | 'image/jpeg' = 'image/webp';

  for (const attempt of attempts) {
    const scale = Math.min(1, attempt.maxDimension / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    if (bitmap) ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    else ctx.drawImage(img as HTMLImageElement, 0, 0, targetW, targetH);

    // Try WebP encoding first
    let blob = await canvasToBlob(canvas, 'image/webp', attempt.quality);

    // If WebP encoding isn't supported, Safari may return null or a different type.
    if (!blob || (blob.type && blob.type !== 'image/webp')) {
      const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', attempt.quality);
      if (jpegBlob) {
        blob = jpegBlob;
      }
    }

    if (!blob) continue;

    const nextType = blob.type === 'image/webp' ? 'image/webp' : 'image/jpeg';

    if (!best || blob.size < best.size) {
      best = blob;
      bestType = nextType;
    }

    if (blob.size <= targetMaxBytes) break;
  }

  if (bitmap) bitmap.close();

  if (!best) return working;

  const originalBase = baseNameWithoutExtension(working.name || 'image');
  const outExt = bestType === 'image/webp' ? 'webp' : 'jpg';
  const outName = `${safeFileName(originalBase) || 'image'}.${outExt}`;

  const outFile = new File([best], outName, { type: bestType });

  // Debug: helps verify compression on mobile (can be removed later)
  console.log('[upload] image compressed', {
    originalName: working.name,
    originalType: working.type,
    originalKb: Math.round(working.size / 1024),
    outName: outFile.name,
    outType: outFile.type,
    outKb: Math.round(outFile.size / 1024),
  });

  return outFile;
}

async function deletePropertyImagesByPublicUrls(urls: string[]): Promise<void> {
  return deleteStorageObjectsByPublicUrls('property-images', urls);
}

async function deleteAllPropertyImages(propertyId: string): Promise<void> {
  const bucket = supabase.storage.from('property-images');

  // Files are stored under: <propertyId>/<uuid>-<name>.webp
  // We list under the propertyId folder and remove everything we find.
  const limit = 100;
  let offset = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await bucket.list(propertyId, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) throw error;
    const files = data || [];

    if (files.length === 0) return;

    const paths = files
      .filter((f) => f.name)
      .map((f) => `${propertyId}/${f.name}`);

    if (paths.length > 0) {
      const { error: rmErr } = await bucket.remove(paths);
      if (rmErr) throw rmErr;
    }

    if (files.length < limit) return;
    offset += limit;
  }
}

async function uploadPropertyImages(propertyId: string, files: File[]): Promise<string[]> {
  if (!files.length) return [];

  const bucket = supabase.storage.from('property-images');
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const converted = await imageToWebp(file);

    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const path = `${propertyId}/${id}-${safeFileName(converted.name || 'image.webp')}`;

    const { error: uploadErr } = await bucket.upload(path, converted, {
      upsert: false,
      contentType: converted.type || 'image/webp',
    });

    if (uploadErr) throw uploadErr;

    const { data } = bucket.getPublicUrl(path);
    if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
}

export const apiService = {
  // --- PROPERTIES (Supabase) ---
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as PropertyRow[]).map(mapRowToProperty);
  },

  async getActiveProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', PropertyStatus.ACTIVE)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as PropertyRow[]).map(mapRowToProperty);
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapRowToProperty(data as PropertyRow) : undefined;
  },

  async saveProperty(
    property: Property,
    newImageFiles: File[] = [],
    removedImageUrls: string[] = [],
  ): Promise<Property> {
    const baseRow = mapPropertyToRow(property);

    // If this is an existing UUID, keep it; otherwise let DB generate a UUID.
    const shouldSendId = property.id && isUuid(property.id);

    // First save property (to ensure we have an ID for uploads)
    const { data: savedRow, error: saveErr } = shouldSendId
      ? await supabase
          .from('properties')
          .upsert({ id: property.id, ...baseRow })
          .select('*')
          .single()
      : await supabase
          .from('properties')
          .insert(baseRow)
          .select('*')
          .single();

    if (saveErr) throw saveErr;

    const saved = mapRowToProperty(savedRow as PropertyRow);

    // If admin removed existing images, delete them from Storage too
    if (removedImageUrls.length > 0) {
      await deletePropertyImagesByPublicUrls(removedImageUrls);
    }

    // Upload any newly selected files and then update the property images array
    if (newImageFiles.length > 0) {
      const uploadedUrls = await uploadPropertyImages(saved.id, newImageFiles);
      const nextImages = [...(saved.images || []), ...uploadedUrls];

      const { data: updatedRow, error: updErr } = await supabase
        .from('properties')
        .update({ images: nextImages })
        .eq('id', saved.id)
        .select('*')
        .single();

      if (updErr) throw updErr;
      return mapRowToProperty(updatedRow as PropertyRow);
    }

    return saved;
  },

  async deleteProperty(id: string): Promise<void> {
    // Delete images from Storage first
    await deleteAllPropertyImages(id);

    // Then delete DB row
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SITE ASSETS (Supabase Storage) ---
  async uploadNavbarLogoSvg(file: File, previousUrl?: string): Promise<string> {
    const url = await uploadSiteLogo(file);

    // If it was a previous logo in our bucket, delete it to avoid orphan files
    if (previousUrl) {
      await deleteStorageObjectsByPublicUrls('site-assets', [previousUrl]);
    }

    return url;
  },

  async deleteNavbarLogo(previousUrl: string): Promise<void> {
    await deleteStorageObjectsByPublicUrls('site-assets', [previousUrl]);
  },

  // --- LANDING CONTENT (Supabase) ---
  async getLandingContent(): Promise<LandingContent> {
    const { data, error } = await supabase
      .from('landing_content')
      .select('*')
      .eq('singleton', true)
      .maybeSingle();

    if (error || !data) return INITIAL_LANDING_CONTENT;
    return mapRowToLandingContent(data as LandingContentRow);
  },

  async updateLandingContent(content: LandingContent): Promise<void> {
    const { data: current, error: currentErr } = await supabase
      .from('landing_content')
      .select('id')
      .eq('singleton', true)
      .maybeSingle();

    if (currentErr) throw currentErr;

    const row = mapLandingContentToRow(content);

    if (!current?.id) {
      const { error } = await supabase.from('landing_content').insert(row);
      if (error) throw error;
      return;
    }

    const { error } = await supabase
      .from('landing_content')
      .update(row)
      .eq('id', current.id);

    if (error) throw error;
  },
};