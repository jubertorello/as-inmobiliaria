import { Property, LandingContent, PropertyStatus } from './types';
import { INITIAL_PROPERTIES, INITIAL_LANDING_CONTENT } from './constants';

// Simulación de latencia de red (500ms - 1s)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const STORAGE_KEYS = {
  PROPERTIES: 'as_properties',
  LANDING: 'as_landing',
  // ADMIN: 'as_admin' // Removed, now handled by Supabase
};

export const apiService = {
  // --- PROPERTIES ---
  async getProperties(): Promise<Property[]> {
    await delay(800); // Simula el fetch
    const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  },

  async getActiveProperties(): Promise<Property[]> {
    const props = await this.getProperties();
    return props.filter(p => p.status === PropertyStatus.ACTIVE);
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const props = await this.getProperties();
    return props.find(p => p.id === id);
  },

  async saveProperty(property: Property): Promise<void> {
    await delay(1000); // Simula guardado en DB
    const props = await this.getProperties();
    const index = props.findIndex(p => p.id === property.id);
    
    let newProps;
    if (index >= 0) {
      newProps = [...props];
      newProps[index] = property;
    } else {
      newProps = [property, ...props];
    }
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(newProps));
  },

  async deleteProperty(id: string): Promise<void> {
    await delay(1000);
    const props = await this.getProperties();
    const filtered = props.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(filtered));
  },

  // --- LANDING CONTENT ---
  async getLandingContent(): Promise<LandingContent> {
    await delay(600);
    const saved = localStorage.getItem(STORAGE_KEYS.LANDING);
    return saved ? JSON.parse(saved) : INITIAL_LANDING_CONTENT;
  },

  async updateLandingContent(content: LandingContent): Promise<void> {
    await delay(1200);
    localStorage.setItem(STORAGE_KEYS.LANDING, JSON.stringify(content));
  },

  // --- AUTH --- (Removed local admin status, now handled by Supabase)
  // async checkAdminStatus(): Promise<boolean> {
  //   return localStorage.getItem(STORAGE_KEYS.ADMIN) === 'true';
  // },

  // setAdminStatus(status: boolean): void {
  //   localStorage.setItem(STORAGE_KEYS.ADMIN, status.toString());
  // }
};