import { Property, LandingContent, PropertyStatus } from './types';
import { INITIAL_LANDING_CONTENT } from './constants';
import { supabase } from './src/integrations/supabase/client';

const STORAGE_KEYS = {
  LANDING: 'as_landing',
};

type PropertyRow = {
  id: string;
  title: string;
  description: string;
  price: string | number | null;
  currency: 'USD' | 'ARS';
  type: string;
  operation: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: string | number;
  images: string[];
  status: string;
  featured: boolean;
};

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
  bedrooms: property.bedrooms ?? null,
  bathrooms: property.bathrooms ?? null,
  area: property.area,
  images: property.images || [],
  status: property.status,
  featured: property.featured,
});

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

  async saveProperty(property: Property): Promise<Property> {
    const baseRow = mapPropertyToRow(property);

    // If this is an existing UUID, keep it; otherwise let DB generate a UUID.
    const shouldSendId = property.id && isUuid(property.id);

    const { data, error } = shouldSendId
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

    if (error) throw error;
    return mapRowToProperty(data as PropertyRow);
  },

  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
  },

  // --- LANDING CONTENT (still localStorage) ---
  async getLandingContent(): Promise<LandingContent> {
    const saved = localStorage.getItem(STORAGE_KEYS.LANDING);
    return saved ? JSON.parse(saved) : INITIAL_LANDING_CONTENT;
  },

  async updateLandingContent(content: LandingContent): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.LANDING, JSON.stringify(content));
  },
};