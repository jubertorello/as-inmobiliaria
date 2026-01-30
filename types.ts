
export enum PropertyType {
  HOUSE = 'Casas',
  APARTMENT = 'Departamentos',
  LAND = 'Terrenos',
  COMMERCIAL = 'Locales comerciales'
}

export enum OperationType {
  SALE = 'Venta',
  RENT = 'Alquiler',
  TEMPORARY_RENT = 'Alquiler Temporario'
}

export enum PropertyStatus {
  ACTIVE = 'Activa',
  ARCHIVED = 'Archivada'
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price?: number | null;
  currency: 'USD' | 'ARS';
  type: PropertyType;
  operation: OperationType;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  images: string[];
  status: PropertyStatus;
  featured: boolean;
}

export interface LandingContent {
  // Brand
  siteName: string;
  siteTagline: string;
  navbarLogo: string;
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroPrimaryButtonText: string;
  heroSecondaryButtonText: string;
  // Servicios
  servicesTitle: string;
  servicesSubtitle: string;
  service1Title: string;
  service1Desc: string;
  service1Icon: string;
  service2Title: string;
  service2Desc: string;
  service2Icon: string;
  service3Title: string;
  service3Desc: string;
  service3Icon: string;
  apartHotelLink: string;
  // Secciones Dinámicas
  featuredTitle: string;
  featuredSubtitle: string;
  featuredButtonText: string;
  propertiesTitle: string;
  propertiesSubtitle: string;
  // Sobre Nosotros
  aboutBadge: string;
  aboutTitle: string;
  aboutDescription1: string;
  aboutDescription2: string;
  aboutImage: string;
  aboutExperience: string;
  aboutFeatures: string[];
  // Contacto & Footer
  contactPhone: string;
  contactEmail: string;
  contactInstagram: string;
  contactFacebook: string;
  officeAddress: string;
  officeHours: string;
  footerDescription: string;
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
  seoRobots: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}
