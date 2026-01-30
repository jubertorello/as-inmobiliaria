
import { Property, PropertyType, OperationType, PropertyStatus, LandingContent } from './types';

export const BRAND_COLOR = '#D95FA2'; 
export const SECONDARY_COLOR = '#532759';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Moderna Casa en Country',
    description: 'Hermosa casa con piscina y amplio jardín. 3 dormitorios en suite, cochera doble y quincho.',
    price: 350000,
    currency: 'USD',
    type: PropertyType.HOUSE,
    operation: OperationType.SALE,
    location: 'Barrio Cerrado, Pilar',
    bedrooms: 3,
    bathrooms: 4,
    area: 280,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: true
  },
  {
    id: '2',
    title: 'Departamento Céntrico Luminoso',
    description: 'Excelente departamento de 2 ambientes en piso alto. Vista abierta, balcón corrido y seguridad 24hs.',
    price: 125000,
    currency: 'ARS',
    type: PropertyType.APARTMENT,
    operation: OperationType.RENT,
    location: 'Las Varillas Centro',
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: true
  },
  {
    id: '3',
    title: 'Lote en Zona Industrial',
    description: 'Terreno nivelado ideal para galpón o emprendimiento comercial. Acceso directo desde la ruta.',
    price: 45000,
    currency: 'USD',
    type: PropertyType.LAND,
    operation: OperationType.SALE,
    location: 'Periferia, Las Varillas',
    area: 1200,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: false
  },
  {
    id: '4',
    title: 'Local Comercial Av. Principal',
    description: 'Gran vidriera, planta libre y sótano. Ubicación inmejorable con alto flujo peatonal.',
    price: 85000,
    currency: 'ARS',
    type: PropertyType.COMMERCIAL,
    operation: OperationType.RENT,
    location: 'Av. Libertador, Las Varillas',
    bathrooms: 2,
    area: 110,
    images: [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: false
  },
  {
    id: '5',
    title: 'Monoambiente Amoblado Premium',
    description: 'Ideal para ejecutivos o estancias cortas. Equipamiento completo de alta gama y excelente ubicación.',
    price: 450,
    currency: 'USD',
    type: PropertyType.APARTMENT,
    operation: OperationType.TEMPORARY_RENT,
    location: 'Barrio Norte',
    bedrooms: 0,
    bathrooms: 1,
    area: 32,
    images: [
      'https://images.unsplash.com/photo-1536376074432-ad7374f6bd2a?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: true
  },
  {
    id: '6',
    title: 'Casa Familiar con Patio',
    description: 'Casa tradicional refaccionada a nuevo. Amplia cocina comedor, 2 dormitorios y gran patio arbolado.',
    price: 98000,
    currency: 'USD',
    type: PropertyType.HOUSE,
    operation: OperationType.SALE,
    location: 'Barrio Mitre',
    bedrooms: 2,
    bathrooms: 1,
    area: 180,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: false
  },
  {
    id: '7',
    title: 'Campo Agrícola - 50 Hectáreas',
    description: 'Excelente aptitud productiva. Suelo clase I, ideal para siembra. Cuenta con casa para casero y galpón.',
    price: 450000,
    currency: 'USD',
    type: PropertyType.LAND,
    operation: OperationType.SALE,
    location: 'Zona Rural, Las Varillas',
    area: 500000,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: false
  },
  {
    id: '8',
    title: 'Oficina de Lujo en Torre',
    description: 'Espacio de trabajo moderno con divisiones en vidrio, sala de reuniones y kitchenette. Vista al parque.',
    price: 2200,
    currency: 'USD',
    type: PropertyType.COMMERCIAL,
    operation: OperationType.RENT,
    location: 'Parque Industrial Sur',
    bathrooms: 2,
    area: 85,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: true
  },
  {
    id: '9',
    title: 'Dúplex Minimalista',
    description: 'Construcción de vanguardia. 2 dormitorios, 2 baños, entrada de auto y patio con parrilla.',
    price: 115000,
    currency: 'USD',
    type: PropertyType.HOUSE,
    operation: OperationType.SALE,
    location: 'Barrio Nuevo',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: false
  },
  {
    id: '10',
    title: 'Departamento con Terraza Propia',
    description: 'Penthouse exclusivo. Terraza privada de 40m² con deck y jacuzzi. Cochera incluida.',
    price: 185000,
    currency: 'USD',
    type: PropertyType.APARTMENT,
    operation: OperationType.SALE,
    location: 'Centro Histórico',
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: true
  },
  {
    id: '11',
    title: 'Quinta de Fin de Semana',
    description: 'El refugio perfecto. Casa de campo amoblada, gran piscina, quincho para 30 personas y frutales.',
    price: 1200,
    currency: 'USD',
    type: PropertyType.HOUSE,
    operation: OperationType.TEMPORARY_RENT,
    location: 'Las Mojarras',
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200'
    ],
    status: PropertyStatus.ACTIVE,
    featured: false
  }
];

export const INITIAL_LANDING_CONTENT: LandingContent = {
  siteName: 'ANDREA SARTORI',
  siteTagline: 'INMOBILIARIA',
  navbarLogo: '', 
  heroTitle: 'Encuentra tu lugar ideal para vivir o invertir',
  heroSubtitle: 'Acompañándote en cada paso de tu próxima inversión o alquiler en Las Varillas.',
  heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1920',
  heroPrimaryButtonText: 'Ver Propiedades',
  heroSecondaryButtonText: 'LLÁMANOS',
  // Servicios
  servicesTitle: 'Nuestros Servicios',
  servicesSubtitle: 'Soluciones integrales diseñadas para que tu experiencia inmobiliaria sea segura, ágil y profesional.',
  service1Title: 'Alquileres',
  service1Desc: 'Gestión de alquileres residenciales y comerciales. Encontramos el inquilino ideal para tu propiedad.',
  service1Icon: 'key',
  service2Title: 'Venta de Inmuebles',
  service2Desc: 'Asesoramiento integral para la compra y venta de propiedades, garantizando transacciones seguras.',
  service2Icon: 'real_estate_agent',
  service3Title: 'Alquiler Temporario',
  service3Desc: 'Opciones amobladas y equipadas para estancias cortas con atención premium.',
  service3Icon: 'hotel',
  apartHotelLink: 'https://ejemplo-aparthotel.com',
  // Secciones Dinámicas
  featuredTitle: 'Propiedades Destacadas',
  featuredSubtitle: 'Una selección curada de nuestras mejores oportunidades en Las Varillas.',
  featuredButtonText: 'Ver todas las propiedades',
  propertiesTitle: 'Nuestras Propiedades',
  propertiesSubtitle: 'Encontrá el lugar ideal para tu próxima etapa.',
  // Sobre Nosotros
  aboutBadge: 'Sobre Nosotros',
  aboutTitle: 'Excelencia en servicios inmobiliarios',
  aboutDescription1: 'En Andrea Sartori Inmobiliaria, entendemos que buscar una propiedad es mucho más que una transacción comercial.',
  aboutDescription2: 'Nuestro equipo está comprometido en brindar un asesoramiento integral y transparente.',
  aboutImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
  aboutExperience: '15+',
  aboutFeatures: [
    'Ventas residenciales y comerciales',
    'Alquileres garantizados',
    'Tasaciones profesionales'
  ],
  contactPhone: '+54 3533 454096',
  contactEmail: 'andrea_sartori@hotmail.com',
  contactInstagram: 'inmobiliaria_andrea_sartori',
  contactFacebook: 'AndreaSartoriInmo',
  officeAddress: 'Av. Libertador 123, Las Varillas, Córdoba',
  officeHours: 'Lunes a Viernes 09:00 - 18:00',
  footerDescription: 'Nuestra misión es conectar personas con sus sueños inmobiliarios a través de un servicio transparente.',
  // SEO
  seoTitle: 'Andrea Sartori Inmobiliaria | Propiedades en Las Varillas',
  seoDescription: 'Encuentra las mejores propiedades en Las Varillas con Andrea Sartori.',
  seoKeywords: 'inmobiliaria, las varillas, venta, alquiler',
  ogImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
  seoRobots: 'index, follow'
};
