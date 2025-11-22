import SeoSettings from '../models/SeoSettings';
import { Property } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { PropertyType, ListingType, PropertyStatus } from '../types';

interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  canonicalUrl: string;
  metaRobots: string;
  schemaMarkup?: object;
  customMeta?: object;
}

interface PropertySeoData {
  id: number;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  areaSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  images?: Array<{ imageUrl: string; altText?: string }>;
}

class SeoService {
  /**
   * Get SEO settings for a specific page
   */
  async getSeoSettings(page: string): Promise<SeoSettings | null> {
    const seoSettings = await SeoSettings.findOne({
      where: { page },
    });

    return seoSettings;
  }

  /**
   * Create or update SEO settings
   */
  async upsertSeoSettings(data: {
    page: string;
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    metaRobots?: string;
    schemaMarkup?: object;
  }): Promise<SeoSettings> {
    const [seoSettings] = await SeoSettings.upsert({
      ...data,
    });

    return seoSettings;
  }

  /**
   * Generate SEO metadata for a property
   */
  async generatePropertySeoMetadata(propertyId: number, baseUrl: string): Promise<SeoMetadata> {
    // Get property data with images
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: PropertyImage,
          as: 'images',
          limit: 1,
          order: [['displayOrder', 'ASC']],
        },
      ],
    }) as any;

    if (!property) {
      throw new Error('Property not found');
    }

    // Check for custom SEO settings
    const customSeo = await this.getSeoSettings(`property-${propertyId}`);

    // Generate default metadata
    const propertyTypeLabel = this.getPropertyTypeLabel(property.propertyType);
    const listingTypeLabel = this.getListingTypeLabel(property.listingType);
    const priceFormatted = this.formatPrice(property.price);
    
    const defaultTitle = `${propertyTypeLabel} for ${listingTypeLabel} in ${property.city} - ${priceFormatted}`;
    const defaultDescription = this.generatePropertyDescription(property);
    const defaultKeywords = this.generatePropertyKeywords(property);

    // Generate schema markup
    const schemaMarkup = this.generatePropertySchemaMarkup(property, baseUrl);

    // Use custom settings if available, otherwise use generated defaults
    return {
      title: customSeo?.title || defaultTitle,
      description: customSeo?.description || defaultDescription,
      keywords: customSeo?.keywords || defaultKeywords,
      ogTitle: customSeo?.ogTitle || defaultTitle,
      ogDescription: customSeo?.ogDescription || defaultDescription,
      ogImage: customSeo?.ogImage || (property.images?.[0]?.imageUrl ? `${baseUrl}${property.images[0].imageUrl}` : undefined),
      canonicalUrl: customSeo?.canonicalUrl || `${baseUrl}/property/${propertyId}`,
      metaRobots: customSeo?.metaRobots || 'index,follow',
      schemaMarkup: customSeo?.schemaMarkup || schemaMarkup,
    };
  }

  /**
   * Generate SEO metadata for a page
   */
  async generatePageSeoMetadata(pageType: string, baseUrl: string, params?: any): Promise<SeoMetadata> {
    const customSeo = await this.getSeoSettings(pageType);

    let defaultMetadata: Partial<SeoMetadata>;

    switch (pageType) {
      case 'home':
        defaultMetadata = {
          title: 'Find Your Dream Property - Real Estate Portal',
          description: 'Discover the best properties for sale and rent. Browse apartments, houses, villas, plots, commercial spaces, and land with advanced search filters.',
          keywords: 'real estate, property, buy, sell, rent, apartment, house, villa, plot, commercial, land',
          ogTitle: 'Real Estate Portal - Find Your Perfect Property',
          ogDescription: 'Browse thousands of properties for sale and rent. Find your dream home today!',
        };
        break;
      case 'search':
        defaultMetadata = this.generateSearchPageMetadata(params);
        break;
      case 'property-listing':
        defaultMetadata = {
          title: 'List Your Property - Real Estate Portal',
          description: 'List your property for sale or rent. Reach thousands of potential buyers and tenants.',
          keywords: 'list property, sell property, rent property, real estate listing',
        };
        break;
      default:
        defaultMetadata = {
          title: 'Real Estate Portal',
          description: 'Your trusted real estate platform',
          keywords: 'real estate, property',
        };
    }

    return {
      title: customSeo?.title || defaultMetadata.title || 'Real Estate Portal',
      description: customSeo?.description || defaultMetadata.description || 'Your trusted real estate platform',
      keywords: customSeo?.keywords || defaultMetadata.keywords,
      ogTitle: customSeo?.ogTitle || defaultMetadata.ogTitle || defaultMetadata.title || 'Real Estate Portal',
      ogDescription: customSeo?.ogDescription || defaultMetadata.ogDescription || defaultMetadata.description || 'Your trusted real estate platform',
      ogImage: customSeo?.ogImage,
      canonicalUrl: customSeo?.canonicalUrl || `${baseUrl}/${pageType}`,
      metaRobots: customSeo?.metaRobots || 'index,follow',
      schemaMarkup: customSeo?.schemaMarkup,
    };
  }

  /**
   * Generate XML sitemap
   */
  async generateSitemap(baseUrl: string): Promise<string> {
    const properties = await Property.findAll({
      where: { is_active: true },
      attributes: ['id', 'updated_at'],
      order: [['updated_at', 'DESC']],
    });

    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/search', priority: '0.9', changefreq: 'daily' },
      { url: '/list-property', priority: '0.8', changefreq: 'weekly' },
      { url: '/about', priority: '0.6', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    }

    // Add property pages
    for (const property of properties) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/property/${property.id}</loc>\n`;
      sitemap += `    <lastmod>${property.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.7</priority>\n';
      sitemap += '  </url>\n';
    }

    sitemap += '</urlset>';
    return sitemap;
  }

  /**
   * Generate clean URL for property
   */
  generatePropertyUrl(property: PropertySeoData): string {
    const title = property.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const city = property.city
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    return `/property/${property.id}/${title}-in-${city}`;
  }

  // Private helper methods
  private getPropertyTypeLabel(type: PropertyType): string {
    const labels: Record<PropertyType, string> = {
      [PropertyType.APARTMENT]: 'Apartment',
      [PropertyType.HOUSE]: 'House',
      [PropertyType.COMMERCIAL]: 'Commercial Property',
      [PropertyType.LAND]: 'Land',
      [PropertyType.VILLA]: 'Villa',
      [PropertyType.OFFICE]: '',
      [PropertyType.SHOP]: '',
      [PropertyType.WAREHOUSE]: ''
    };
    return labels[type] || 'Property';
  }

  private getListingTypeLabel(type: ListingType): string {
    const labels = {
      [ListingType.SALE]: 'Sale',
      [ListingType.RENT]: 'Rent',
    };
    return labels[type] || 'Sale';
  }

  private formatPrice(price: number): string {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  }

  private generatePropertyDescription(property: PropertySeoData): string {
    const parts = [];
    
    if (property.bedrooms) {
      parts.push(`${property.bedrooms} BHK`);
    }
    
    parts.push(this.getPropertyTypeLabel(property.propertyType));
    parts.push(`for ${this.getListingTypeLabel(property.listingType)}`);
    parts.push(`in ${property.city}, ${property.state}`);
    
    if (property.areaSqft) {
      parts.push(`- ${property.areaSqft} sq ft`);
    }
    
    parts.push(`- ${this.formatPrice(property.price)}`);
    
    let description = parts.join(' ');
    
    if (property.description) {
      description += `. ${property.description.substring(0, 100)}...`;
    }
    
    return description;
  }

  private generatePropertyKeywords(property: PropertySeoData): string {
    const keywords = [
      property.propertyType,
      this.getListingTypeLabel(property.listingType).toLowerCase(),
      property.city.toLowerCase(),
      property.state.toLowerCase(),
      'real estate',
      'property',
    ];

    if (property.bedrooms) {
      keywords.push(`${property.bedrooms} bhk`);
    }

    return keywords.join(', ');
  }

  private generatePropertySchemaMarkup(property: PropertySeoData, baseUrl: string): object {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: property.title,
      description: property.description,
      url: `${baseUrl}/property/${property.id}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address,
        addressLocality: property.city,
        addressRegion: property.state,
        addressCountry: 'IN',
      },
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    };

    if (property.areaSqft) {
      schema.floorSize = {
        '@type': 'QuantitativeValue',
        value: property.areaSqft,
        unitText: 'square feet',
      };
    }

    if (property.bedrooms) {
      schema.numberOfRooms = property.bedrooms;
    }

    if (property.images && property.images.length > 0) {
      schema.image = property.images.map(img => `${baseUrl}${img.imageUrl}`);
    }

    return schema;
  }

  private generateSearchPageMetadata(params?: any): Partial<SeoMetadata> {
    let title = 'Search Properties';
    let description = 'Search and filter properties based on your preferences.';
    let keywords = 'property search, real estate search, find property';

    if (params) {
      if (params.city) {
        title = `Properties in ${params.city}`;
        description = `Find the best properties for sale and rent in ${params.city}.`;
        keywords += `, ${params.city.toLowerCase()}`;
      }

      if (params.propertyType) {
        const typeLabel = this.getPropertyTypeLabel(params.propertyType);
        title = `${typeLabel}s ${params.city ? `in ${params.city}` : ''}`;
        description = `Browse ${typeLabel.toLowerCase()}s ${params.city ? `in ${params.city}` : ''}.`;
        keywords += `, ${params.propertyType}`;
      }
    }

    return { title, description, keywords };
  }

  /**
   * Get all SEO settings with pagination and filters
   */
  async getAllSeoSettings(
    page: number = 1,
    limit: number = 20,
    filters: {
      entityType?: string;
      entityId?: number;
      pageType?: string;
      isActive?: boolean;
      search?: string;
    } = {}
  ): Promise<{
    settings: any[];
    total: number;
    totalPages: number;
  }> {
    const { Op } = require('sequelize');
    const whereClause: any = {};

    // Apply filters
    if (filters.entityType) {
      whereClause.entityType = filters.entityType;
    }

    if (filters.entityId) {
      whereClause.entityId = filters.entityId;
    }

    if (filters.pageType) {
      whereClause.pageType = filters.pageType;
    }

    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    if (filters.search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
        { keywords: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await SeoSettings.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
    });

    return {
      settings: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update SEO settings by ID
   */
  async updateSeoSettings(
    id: number,
    data: {
      entityType?: string;
      entityId?: number;
      pageType?: string;
      title?: string;
      description?: string;
      keywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      canonicalUrl?: string;
      metaRobots?: string;
      schemaMarkup?: object;
      isActive?: boolean;
    }
  ): Promise<SeoSettings> {
    const seoSetting = await SeoSettings.findByPk(id);
    
    if (!seoSetting) {
      throw new Error('SEO setting not found');
    }

    // Update the SEO setting with the provided data
    await seoSetting.update({
      entityType: data.entityType || seoSetting.entityType,
      entityId: data.entityId || seoSetting.entityId,
      pageType: data.pageType || seoSetting.pageType,
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      canonicalUrl: data.canonicalUrl,
      metaRobots: data.metaRobots,
      schemaMarkup: data.schemaMarkup,
      isActive: data.isActive,
    });

    return seoSetting.reload();
  }

  /**
   * Delete SEO settings by ID
   */
  async deleteSeoSettings(id: number): Promise<void> {
    const seoSetting = await SeoSettings.findByPk(id);
    
    if (!seoSetting) {
      throw new Error('SEO setting not found');
    }

    await seoSetting.destroy();
  }

  /**
   * Update SEO setting status by ID
   */
  async updateSeoStatus(id: number, isActive: boolean): Promise<SeoSettings> {
    const seoSetting = await SeoSettings.findByPk(id);
    
    if (!seoSetting) {
      throw new Error('SEO setting not found');
    }

    await seoSetting.update({ isActive });
    return seoSetting.reload();
  }

  /**
   * Create new SEO settings
   */
  async createSeoSettings(data: {
    entityType: string;
    entityId?: number;
    pageType?: string;
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    metaRobots?: string;
    schemaMarkup?: object;
    isActive?: boolean;
  }): Promise<SeoSettings> {
    // Create page identifier based on entityType and other params
    let pageIdentifier = data.entityType;
    if (data.entityId) {
      pageIdentifier = `${data.entityType}-${data.entityId}`;
    } else if (data.pageType) {
      pageIdentifier = data.pageType;
    }

    const seoSetting = await SeoSettings.create({
      page: pageIdentifier,
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      canonicalUrl: data.canonicalUrl,
      metaRobots: data.metaRobots,
      schemaMarkup: data.schemaMarkup,
      entityType: data.entityType,
      entityId: data.entityId,
      pageType: data.pageType,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return seoSetting;
  }
}

export default SeoService;