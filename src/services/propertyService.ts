import { Property, PropertyType, ListingType, PropertyStatus } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { User } from '../models/User';
import { Op, WhereOptions, Order } from 'sequelize';
import { transformPropertiesWithImages, transformPropertyWithImages } from '../utils/imageUtils';
import RedisConnection from '../config/redis';
import CacheService from './cacheService';

export interface PropertySearchFilters {
    propertyType?: PropertyType;
    listingType?: ListingType;
    status?: PropertyStatus;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
    minArea?: number;
    maxArea?: number;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    radius?: number; // in kilometers
    sortBy?: 'price' | 'date' | 'relevance' | 'views';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    userId?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    keywords?: string; // For keyword search
}

export interface PropertyCreateData {
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
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    amenities?: any;
    isFeatured?: boolean;
    expiresAt?: Date;
    autoRenew?: boolean;
    renewalPeriodDays?: number;
}

export interface PropertyUpdateData extends Partial<PropertyCreateData> {
    isActive?: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

class PropertyService {
    private redis: RedisConnection;
    private cacheService: CacheService;

    constructor() {
        this.redis = RedisConnection.getInstance();
        this.cacheService = new CacheService();
    }

    async createProperty(userId: number, propertyData: PropertyCreateData): Promise<Property> {
        try {
            // Set default expiration to 90 days if not provided
            const defaultExpirationDate = new Date();
            defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 90);

            const property = await Property.create({
                user_id: userId,
                title: propertyData.title,
                description: propertyData.description,
                property_type: propertyData.propertyType,
                listing_type: propertyData.listingType,
                status: propertyData.status,
                price: propertyData.price,
                area_sqft: propertyData.areaSqft,
                bedrooms: propertyData.bedrooms,
                bathrooms: propertyData.bathrooms,
                address: propertyData.address,
                city: propertyData.city,
                state: propertyData.state,
                postal_code: propertyData.postalCode,
                latitude: propertyData.latitude,
                longitude: propertyData.longitude,
                amenities: propertyData.amenities,
                is_featured: propertyData.isFeatured || false,
                expires_at: propertyData.expiresAt || defaultExpirationDate,
                auto_renew: propertyData.autoRenew || false,
                renewal_period_days: propertyData.renewalPeriodDays || 30,
            });

            // Clear related caches
            await this.clearPropertyCaches();
            await this.cacheService.invalidateSearchCache();

            // Cache the new property
            await this.cacheService.cachePropertyDetails(property.id, property.toJSON());

            // Check for saved search matches and send notifications
            // Import savedSearchService at the top of the file to avoid circular dependency
            const { default: savedSearchService } = await import('./savedSearchService');
            // await savedSearchService.checkForNewMatches(property); // implement later to notify the user of matches

            return property;
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    async getPropertyById(id: number, incrementViews: boolean = false): Promise<Property | null> {
        try {
            // Try to get from cache first (skip cache if incrementing views)
            if (!incrementViews) {
                const cachedProperty = await this.cacheService.getPropertyDetails(id);
                if (cachedProperty) {
                    return cachedProperty;
                }
            }

            const property = await Property.findOne({
                where: { id, is_active: true },
                include: [
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'role'],
                    },
                    {
                        model: PropertyImage,
                        as: 'images',
                        order: [['display_order', 'ASC']],
                    },
                ],
            });

            if (!property) {
                return null;
            }

            // Increment views if requested
            if (incrementViews) {
                await property.incrementViews();
                // Also increment in cache
                await this.cacheService.incrementPropertyViews(id);
            }

            // Cache the result
            await this.cacheService.cachePropertyDetails(id, property.toJSON());

            return transformPropertyWithImages(property);
        } catch (error) {
            console.error('Error fetching property:', error);
            throw error;
        }
    }

    async updateProperty(id: number, userId: number, updateData: PropertyUpdateData): Promise<Property | null> {
        try {
            const property = await Property.findOne({
                where: { id, user_id: userId },
            });

            if (!property) {
                return null;
            }

            await property.update({
                title: updateData.title,
                description: updateData.description,
                property_type: updateData.propertyType,
                listing_type: updateData.listingType,
                status: updateData.status,
                price: updateData.price,
                area_sqft: updateData.areaSqft,
                bedrooms: updateData.bedrooms,
                bathrooms: updateData.bathrooms,
                address: updateData.address,
                city: updateData.city,
                state: updateData.state,
                postal_code: updateData.postalCode,
                latitude: updateData.latitude,
                longitude: updateData.longitude,
                amenities: updateData.amenities,
                is_featured: updateData.isFeatured,
                is_active: updateData.isActive,
                expires_at: updateData.expiresAt,
                auto_renew: updateData.autoRenew,
                renewal_period_days: updateData.renewalPeriodDays,
            });

            // Clear caches
            await this.clearPropertyCaches();
            await this.cacheService.invalidatePropertyRelatedCache(id);

            return property;
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    async deleteProperty(id: number, userId: number): Promise<boolean> {
        try {
            const property = await Property.findOne({
                where: { id, user_id: userId },
            });

            if (!property) {
                return false;
            }

            // Delete associated images first
            await PropertyImage.destroy({
                where: { property_id: id },
            });

            // Delete the property
            await property.destroy();

            // Clear caches
            await this.clearPropertyCaches();
            await this.cacheService.invalidatePropertyRelatedCache(id);

            return true;
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }

    async searchProperties(filters: PropertySearchFilters, requestId: string = 'unknown'): Promise<PaginatedResult<Property>> {
        try {
            console.log(`[${requestId}] === SEARCH SERVICE CALLED ===`);
            const page = filters.page || 1;
            const limit = Math.min(filters.limit || 20, 100); // Max 100 items per page
            const offset = (page - 1) * limit;

            // TEMPORARILY DISABLED CACHE FOR DEBUGGING
            // Try to get from cache first (only for non-user specific searches)
            // if (!filters.userId) {
            //     const searchCriteria = {
            //         ...filters,
            //         sortOrder: filters.sortOrder === 'asc' ? 'ASC' as const : 
            //                   filters.sortOrder === 'desc' ? 'DESC' as const : undefined,
            //     };
            //     const cachedResults = await this.cacheService.getSearchResults(searchCriteria);
            //     if (cachedResults) {
            //         console.log('RETURNING CACHED RESULTS');
            //         return {
            //             data: cachedResults.results,
            //             pagination: {
            //                 page,
            //                 limit,
            //                 total: cachedResults.totalCount,
            //                 totalPages: Math.ceil(cachedResults.totalCount / limit),
            //                 hasNext: page < Math.ceil(cachedResults.totalCount / limit),
            //                 hasPrev: page > 1,
            //             },
            //         };
            //     }
            // }

            // Build where conditions
            let whereConditions: WhereOptions = {
                is_active: filters.isActive !== undefined ? filters.isActive : true,
            };

            // Collect all basic conditions
            const basicConditions: WhereOptions = {};

            if (filters.propertyType) {
                basicConditions.property_type = filters.propertyType;
            }

            if (filters.listingType) {
                basicConditions.listing_type = filters.listingType;
            }

            if (filters.status) {
                basicConditions.status = filters.status;
            }

            if (filters.minPrice || filters.maxPrice) {
                basicConditions.price = {};
                if (filters.minPrice) {
                    (basicConditions.price as any)[Op.gte] = filters.minPrice;
                }
                if (filters.maxPrice) {
                    (basicConditions.price as any)[Op.lte] = filters.maxPrice;
                }
            }

            if (filters.bedrooms) {
                basicConditions.bedrooms = filters.bedrooms;
            }

            if (filters.bathrooms) {
                basicConditions.bathrooms = filters.bathrooms;
            }

            if (filters.minArea || filters.maxArea) {
                basicConditions.area_sqft = {};
                if (filters.minArea) {
                    (basicConditions.area_sqft as any)[Op.gte] = filters.minArea;
                }
                if (filters.maxArea) {
                    (basicConditions.area_sqft as any)[Op.lte] = filters.maxArea;
                }
            }

            if (filters.userId) {
                basicConditions.user_id = filters.userId;
            }

            if (filters.isFeatured !== undefined) {
                basicConditions.is_featured = filters.isFeatured;
            }

            // Handle coordinate-based location search
            if (filters.latitude && filters.longitude && filters.radius) {
                // Using Haversine formula for radius search
                const radiusInDegrees = filters.radius / 111; // Approximate conversion
                basicConditions.latitude = {
                    [Op.between]: [filters.latitude - radiusInDegrees, filters.latitude + radiusInDegrees],
                };
                basicConditions.longitude = {
                    [Op.between]: [filters.longitude - radiusInDegrees, filters.longitude + radiusInDegrees],
                };
            }

            // Handle location text search - search both city and state
            if (filters.location) {
                const locationConditions = {
                    [Op.or]: [
                        {
                            city: {
                                [Op.like]: `%${filters.location}%`,
                            },
                        },
                        {
                            state: {
                                [Op.like]: `%${filters.location}%`,
                            },
                        },
                        {
                            address: {
                                [Op.like]: `%${filters.location}%`,
                            },
                        },
                    ],
                };

                // Combine all conditions
                whereConditions = {
                    [Op.and]: [
                        whereConditions,
                        basicConditions,
                        locationConditions
                    ]
                };
            } else {
                // Handle separate city and state filters if location is not provided
                if (filters.city) {
                    basicConditions.city = {
                        [Op.like]: `%${filters.city}%`,
                    };
                }

                if (filters.state) {
                    basicConditions.state = {
                        [Op.like]: `%${filters.state}%`,
                    };
                }

                // Combine basic conditions
                whereConditions = {
                    ...whereConditions,
                    ...basicConditions
                };
            }

            // Handle keywords search - search across multiple fields
            if (filters.keywords) {
                console.log(`[${requestId}] === KEYWORD SEARCH LOGIC ===`);
                console.log(`[${requestId}] Keywords:`, filters.keywords);
                console.log(`[${requestId}] WHERE CONDITIONS BEFORE:`, JSON.stringify(whereConditions, null, 2));

                // Create keyword OR conditions
                const keywordConditions = {
                    [Op.or]: [
                        {
                            title: {
                                [Op.like]: `%${filters.keywords}%`,
                            },
                        },
                        {
                            description: {
                                [Op.like]: `%${filters.keywords}%`,
                            },
                        },
                        {
                            city: {
                                [Op.like]: `%${filters.keywords}%`,
                            },
                        },
                        {
                            state: {
                                [Op.like]: `%${filters.keywords}%`,
                            },
                        },
                        {
                            address: {
                                [Op.like]: `%${filters.keywords}%`,
                            },
                        },
                    ],
                };

                // Combine existing conditions with keyword conditions using AND
                // Check if whereConditions already has an Op.and structure
                if ((whereConditions as any)[Op.and]) {
                    // If already using Op.and, add keyword conditions to the array
                    (whereConditions as any)[Op.and].push(keywordConditions);
                } else if (Object.keys(whereConditions).length > 0) {
                    // If we have existing conditions but not in Op.and format, wrap everything
                    whereConditions = {
                        [Op.and]: [whereConditions, keywordConditions]
                    };
                } else {
                    // No existing conditions, just use keyword conditions
                    whereConditions = keywordConditions;
                }

                console.log(`[${requestId}] WHERE CONDITIONS AFTER:`, JSON.stringify(whereConditions, null, 2));
                console.log(`[${requestId}] ===========================`);
            }

            // Handle amenities filtering
            if (filters.amenities && filters.amenities.length > 0) {
                // This is a simplified amenities search - in production, you might want more sophisticated JSON querying
                const amenityConditions = filters.amenities.map(amenity => {
                    const condition: any = {};
                    condition[`amenities.${amenity}`] = true;
                    return condition;
                });

                // Add amenities conditions to existing structure
                if ((whereConditions as any)[Op.and]) {
                    // If we already have an AND structure, add to it
                    (whereConditions as any)[Op.and] = [...(whereConditions as any)[Op.and], ...amenityConditions];
                } else {
                    // Create new AND structure with existing conditions plus amenities
                    const existingConditions = Object.keys(whereConditions).length > 0 ? [whereConditions] : [];
                    whereConditions = {
                        [Op.and]: [...existingConditions, ...amenityConditions]
                    };
                }
            }

            // Debug: Log the final where conditions
            console.log(`[${requestId}] === SEARCH DEBUG ===`);
            console.log(`[${requestId}] Filters received:`, {
                keywords: filters.keywords,
                location: filters.location,
                city: filters.city,
                state: filters.state
            });
            console.log(`[${requestId}] Final whereConditions:`, JSON.stringify(whereConditions, null, 2));
            console.log(`[${requestId}] ===================`);

            // Build order conditions
            const orderConditions: Order = [];

            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price':
                        orderConditions.push(['price', filters.sortOrder || 'asc']);
                        break;
                    case 'date':
                        orderConditions.push(['created_at', filters.sortOrder || 'desc']);
                        break;
                    case 'views':
                        orderConditions.push(['views_count', filters.sortOrder || 'desc']);
                        break;
                    case 'relevance':
                    default:
                        // For relevance, prioritize featured listings first, then by date
                        orderConditions.push(['is_featured', 'desc']);
                        orderConditions.push(['created_at', 'desc']);
                        break;
                }
            } else {
                // Default sorting
                orderConditions.push(['is_featured', 'desc']);
                orderConditions.push(['created_at', 'desc']);
            }

            // Execute the query
            console.log(`[${requestId}] === EXECUTING DATABASE QUERY ===`);
            console.log(`[${requestId}] WHERE CONDITIONS:`, JSON.stringify(whereConditions, null, 2));
            console.log(`[${requestId}] ===============================`);

            const { count, rows } = await Property.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'first_name', 'last_name', 'role'],
                    },
                    {
                        model: PropertyImage,
                        as: 'images',
                        limit: 1,
                        order: [['display_order', 'ASC']],
                    },
                ],
                order: orderConditions,
                limit,
                offset,
                distinct: true,
            });

            const totalPages = Math.ceil(count / limit);

            // Track search history if userId is provided
            if (filters.userId) {
                const { default: searchHistoryService } = await import('./searchHistoryService');
                const searchCriteria = {
                    property_type: filters.propertyType ? [filters.propertyType] : undefined,
                    listing_type: filters.listingType,
                    min_price: filters.minPrice,
                    max_price: filters.maxPrice,
                    city: filters.city ? [filters.city] : undefined,
                    state: filters.state,
                    keywords: filters.keywords,
                };
                await searchHistoryService.addToSearchHistory(filters.userId, searchCriteria, count);

                // Track search terms for popularity
                if (filters.keywords) {
                    await searchHistoryService.trackSearchTerm(filters.keywords);
                }
                if (filters.city) {
                    await searchHistoryService.trackSearchTerm(filters.city);
                }
            }

            const result = {
                data: transformPropertiesWithImages(rows),
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };

            // Cache the search results (only for non-user specific searches)
            if (!filters.userId) {
                const searchCriteria = {
                    ...filters,
                    sortOrder: filters.sortOrder === 'asc' ? 'ASC' as const :
                        filters.sortOrder === 'desc' ? 'DESC' as const : undefined,
                };
                await this.cacheService.cacheSearchResults(
                    searchCriteria,
                    rows.map(row => row.toJSON()),
                    count
                );
            }

            return result;
        } catch (error) {
            console.error('Error searching properties:', error);
            throw error;
        }
    }

    async getUserProperties(userId: number, options: { page?: number; limit?: number } = {}): Promise<PaginatedResult<Property>> {
        try {
            const page = options.page || 1;
            const limit = Math.min(options.limit || 20, 100);
            const offset = (page - 1) * limit;

            const { count, rows } = await Property.findAndCountAll({
                where: { user_id: userId },
                include: [
                    {
                        model: PropertyImage,
                        as: 'images',
                        required: false,
                    },
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'first_name', 'last_name', 'email'],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset,
            });

            const totalPages = Math.ceil(count / limit);

            return {
                data: transformPropertiesWithImages(rows),
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
        } catch (error) {
            console.error('Error getting user properties:', error);
            throw error;
        }
    }

    async togglePropertyStatus(id: number, userId: number): Promise<Property | null> {
        try {
            const property = await Property.findOne({
                where: { id, user_id: userId },
            });

            if (!property) {
                return null;
            }

            await property.update({
                is_active: !property.is_active,
            });

            // Clear caches
            await this.clearPropertyCaches();
            await this.redis.del(`property:details:${id}`);

            return property;
        } catch (error) {
            console.error('Error toggling property status:', error);
            throw error;
        }
    }

    async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
        try {
            const cacheKey = `properties:featured:${limit}`;
            const cached = await this.redis.get(cacheKey);

            if (cached) {
                return JSON.parse(cached);
            }

            const properties = await Property.findAll({
                where: {
                    is_featured: true,
                    is_active: true,
                },
                include: [
                    {
                        model: User,
                        as: 'owner',
                        attributes: ['id', 'first_name', 'last_name', 'role'],
                    },
                    {
                        model: PropertyImage,
                        as: 'images',
                        limit: 1,
                        order: [['display_order', 'ASC']],
                    },
                ],
                order: [['created_at', 'DESC']],
                limit,
            });

            // Cache for 30 minutes
            await this.redis.setEx(cacheKey, 1800, JSON.stringify(properties));

            return transformPropertiesWithImages(properties);
        } catch (error) {
            console.error('Error fetching featured properties:', error);
            throw error;
        }
    }

    async getPropertyAnalytics(propertyId: number, userId: number): Promise<any> {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, user_id: userId },
                include: [
                    {
                        model: PropertyImage,
                        as: 'images',
                    },
                ],
            });

            if (!property) {
                return null;
            }

            // Get inquiries count (this would be implemented when inquiry system is ready)
            const inquiriesCount = 0; // await Inquiry.count({ where: { property_id: propertyId } });

            // Get favorites count (this would be implemented when favorites system is ready)
            const favoritesCount = 0; // await UserFavorite.count({ where: { property_id: propertyId } });

            // Calculate days since listing
            const daysSinceListing = Math.floor(
                (new Date().getTime() - property.created_at.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Calculate average views per day
            const avgViewsPerDay = daysSinceListing > 0 ? property.views_count / daysSinceListing : property.views_count;

            return {
                propertyId: property.id,
                title: property.title,
                views: property.views_count,
                inquiries: inquiriesCount,
                favorites: favoritesCount,
                imagesCount: property.images?.length || 0,
                daysSinceListing,
                avgViewsPerDay: Math.round(avgViewsPerDay * 100) / 100,
                createdAt: property.created_at,
                lastUpdated: property.updated_at,
                isActive: property.is_active,
                isFeatured: property.is_featured,
                price: property.price,
                propertyType: property.property_type,
                listingType: property.listing_type,
                city: property.city,
                state: property.state,
            };
        } catch (error) {
            console.error('Error fetching property analytics:', error);
            throw error;
        }
    }

    async getUserPropertyAnalytics(userId: number): Promise<any> {
        try {
            const properties = await Property.findAll({
                where: { user_id: userId },
                attributes: [
                    'id',
                    'title',
                    'views_count',
                    'is_active',
                    'is_featured',
                    'created_at',
                    'price',
                    'property_type',
                    'listing_type',
                ],
                order: [['created_at', 'DESC']],
            });

            const totalProperties = properties.length;
            const activeProperties = properties.filter(p => p.is_active).length;
            const featuredProperties = properties.filter(p => p.is_featured).length;
            const totalViews = properties.reduce((sum, p) => sum + p.views_count, 0);
            const avgViewsPerProperty = totalProperties > 0 ? totalViews / totalProperties : 0;

            // Get top performing properties
            const topProperties = properties
                .sort((a, b) => b.views_count - a.views_count)
                .slice(0, 5)
                .map(p => ({
                    id: p.id,
                    title: p.title,
                    views: p.views_count,
                    price: p.price,
                    type: p.property_type,
                    listingType: p.listing_type,
                    isActive: p.is_active,
                    isFeatured: p.is_featured,
                }));

            return {
                summary: {
                    totalProperties,
                    activeProperties,
                    featuredProperties,
                    totalViews,
                    avgViewsPerProperty: Math.round(avgViewsPerProperty * 100) / 100,
                },
                topProperties,
                recentProperties: properties.slice(0, 5).map(p => ({
                    id: p.id,
                    title: p.title,
                    views: p.views_count,
                    createdAt: p.created_at,
                    isActive: p.is_active,
                    isFeatured: p.is_featured,
                })),
            };
        } catch (error) {
            console.error('Error fetching user property analytics:', error);
            throw error;
        }
    }

    async setFeaturedProperty(propertyId: number, userId: number, featured: boolean): Promise<Property | null> {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, user_id: userId },
            });

            if (!property) {
                return null;
            }

            await property.update({ is_featured: featured });

            // Clear featured properties cache
            const client = this.redis.getClient();
            if (this.redis.isReady()) {
                const featuredKeys = await client.keys('properties:featured:*');
                if (featuredKeys.length > 0) {
                    await client.del(featuredKeys);
                }
            }

            return property;
        } catch (error) {
            console.error('Error setting featured property:', error);
            throw error;
        }
    }

    async getPropertyPerformanceMetrics(propertyId: number, userId: number): Promise<any> {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, user_id: userId },
            });

            if (!property) {
                return null;
            }

            // Calculate performance metrics
            const daysSinceListing = Math.floor(
                (new Date().getTime() - property.created_at.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Get similar properties for comparison
            const similarProperties = await this.getSimilarProperties(propertyId, 10);
            const avgViewsOfSimilar = similarProperties.length > 0
                ? similarProperties.reduce((sum, p) => sum + p.views_count, 0) / similarProperties.length
                : 0;

            // Performance score (simplified calculation)
            let performanceScore = 0;
            if (avgViewsOfSimilar > 0) {
                performanceScore = Math.min((property.views_count / avgViewsOfSimilar) * 50, 100);
            } else {
                performanceScore = property.views_count > 10 ? 75 : property.views_count * 7.5;
            }

            return {
                propertyId: property.id,
                views: property.views_count,
                daysSinceListing,
                avgViewsPerDay: daysSinceListing > 0 ? property.views_count / daysSinceListing : property.views_count,
                performanceScore: Math.round(performanceScore),
                comparisonData: {
                    avgViewsOfSimilarProperties: Math.round(avgViewsOfSimilar),
                    totalSimilarProperties: similarProperties.length,
                },
                recommendations: this.generatePerformanceRecommendations(property, performanceScore),
            };
        } catch (error) {
            console.error('Error fetching property performance metrics:', error);
            throw error;
        }
    }

    private generatePerformanceRecommendations(property: any, performanceScore: number): string[] {
        const recommendations: string[] = [];

        if (performanceScore < 30) {
            recommendations.push('Consider updating your property description with more details');
            recommendations.push('Add more high-quality images to attract viewers');
            recommendations.push('Review your pricing compared to similar properties');
        } else if (performanceScore < 60) {
            recommendations.push('Your property is performing moderately well');
            recommendations.push('Consider featuring your listing to increase visibility');
            recommendations.push('Update your property with any recent improvements');
        } else {
            recommendations.push('Great job! Your property is performing well');
            recommendations.push('Consider sharing your listing on social media');
            recommendations.push('Keep your listing information up to date');
        }

        if (!property.is_featured && performanceScore > 40) {
            recommendations.push('Consider making this a featured listing for better visibility');
        }

        return recommendations;
    }

    async searchPropertiesNearLocation(
        latitude: number,
        longitude: number,
        radiusKm: number,
        additionalFilters?: Partial<PropertySearchFilters>
    ): Promise<Property[]> {
        try {
            const filters: PropertySearchFilters = {
                latitude,
                longitude,
                radius: radiusKm,
                isActive: true,
                ...additionalFilters,
            };

            const result = await this.searchProperties(filters);
            return result.data;
        } catch (error) {
            console.error('Error searching properties near location:', error);
            throw error;
        }
    }

    async getPropertiesByPriceRange(
        minPrice: number,
        maxPrice: number,
        propertyType?: PropertyType,
        limit: number = 20
    ): Promise<Property[]> {
        try {
            const filters: PropertySearchFilters = {
                minPrice,
                maxPrice,
                propertyType,
                limit,
                sortBy: 'price',
                sortOrder: 'asc',
                isActive: true,
            };

            const result = await this.searchProperties(filters);
            return result.data;
        } catch (error) {
            console.error('Error searching properties by price range:', error);
            throw error;
        }
    }

    async getSimilarProperties(propertyId: number, limit: number = 5): Promise<Property[]> {
        try {
            const property = await Property.findByPk(propertyId);
            if (!property) {
                return [];
            }

            // Find similar properties based on type, city, and price range
            const priceRange = property.price * 0.2; // 20% price range
            const filters: PropertySearchFilters = {
                propertyType: property.property_type,
                city: property.city,
                minPrice: property.price - priceRange,
                maxPrice: property.price + priceRange,
                limit,
                isActive: true,
            };

            const result = await this.searchProperties(filters);
            // Exclude the original property from results
            return result.data.filter(p => p.id !== propertyId);
        } catch (error) {
            console.error('Error finding similar properties:', error);
            throw error;
        }
    }

    async getExpiringProperties(userId: number, daysAhead: number = 7): Promise<Property[]> {
        try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysAhead);

            const properties = await Property.findAll({
                where: {
                    user_id: userId,
                    is_active: true,
                    expires_at: {
                        [Op.lte]: futureDate,
                        [Op.gte]: new Date(),
                    },
                },
                order: [['expires_at', 'ASC']],
            });

            return properties;
        } catch (error) {
            console.error('Error fetching expiring properties:', error);
            throw error;
        }
    }

    async renewProperty(propertyId: number, userId: number, extensionDays: number = 30): Promise<Property | null> {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, user_id: userId },
            });

            if (!property) {
                return null;
            }

            await property.extendExpiration(extensionDays);

            // Clear caches
            await this.clearPropertyCaches();
            await this.redis.del(`property:details:${propertyId}`);

            return property;
        } catch (error) {
            console.error('Error renewing property:', error);
            throw error;
        }
    }

    async processAutoRenewals(): Promise<{ renewed: number; failed: number }> {
        try {
            const expiredProperties = await Property.findAll({
                where: {
                    expires_at: {
                        [Op.lte]: new Date(),
                    },
                    auto_renew: true,
                    is_active: true,
                },
            });

            let renewed = 0;
            let failed = 0;

            for (const property of expiredProperties) {
                try {
                    await property.renewListing();
                    renewed++;
                } catch (error) {
                    console.error(`Failed to auto-renew property ${property.id}:`, error);
                    failed++;
                }
            }

            // Clear caches after batch renewal
            await this.clearPropertyCaches();

            return { renewed, failed };
        } catch (error) {
            console.error('Error processing auto renewals:', error);
            throw error;
        }
    }

    async deactivateExpiredProperties(): Promise<number> {
        try {
            const [affectedRows] = await Property.update(
                { is_active: false },
                {
                    where: {
                        expires_at: {
                            [Op.lt]: new Date(),
                        },
                        auto_renew: false,
                        is_active: true,
                    },
                }
            );

            // Clear caches after deactivation
            await this.clearPropertyCaches();

            return affectedRows;
        } catch (error) {
            console.error('Error deactivating expired properties:', error);
            throw error;
        }
    }

    async getPropertyViewAnalytics(propertyId: number, userId: number, days: number = 30): Promise<any> {
        try {
            const property = await Property.findOne({
                where: { id: propertyId, user_id: userId },
            });

            if (!property) {
                return null;
            }

            // Calculate daily average views (simplified - in production you'd track daily views)
            const daysSinceListing = Math.floor(
                (new Date().getTime() - property.created_at.getTime()) / (1000 * 60 * 60 * 24)
            );

            const avgViewsPerDay = daysSinceListing > 0 ? property.views_count / daysSinceListing : property.views_count;

            // Get similar properties for benchmarking
            const similarProperties = await this.getSimilarProperties(propertyId, 10);
            const avgViewsOfSimilar = similarProperties.length > 0
                ? similarProperties.reduce((sum, p) => sum + p.views_count, 0) / similarProperties.length
                : 0;

            return {
                propertyId: property.id,
                totalViews: property.views_count,
                avgViewsPerDay: Math.round(avgViewsPerDay * 100) / 100,
                daysSinceListing,
                benchmarkData: {
                    avgViewsOfSimilarProperties: Math.round(avgViewsOfSimilar),
                    performanceRatio: avgViewsOfSimilar > 0 ? property.views_count / avgViewsOfSimilar : 1,
                },
                expirationInfo: {
                    expiresAt: property.expires_at,
                    daysUntilExpiration: property.daysUntilExpiration,
                    isExpired: property.isExpired,
                    autoRenew: property.auto_renew,
                },
            };
        } catch (error) {
            console.error('Error fetching property view analytics:', error);
            throw error;
        }
    }

    async getFeaturedListingAnalytics(userId: number): Promise<any> {
        try {
            const featuredProperties = await Property.findAll({
                where: {
                    user_id: userId,
                    is_featured: true,
                    is_active: true,
                },
                attributes: [
                    'id',
                    'title',
                    'views_count',
                    'created_at',
                    'expires_at',
                    'price',
                    'property_type',
                ],
                order: [['views_count', 'DESC']],
            });

            const regularProperties = await Property.findAll({
                where: {
                    user_id: userId,
                    is_featured: false,
                    is_active: true,
                },
                attributes: ['views_count'],
            });

            const featuredViewsTotal = featuredProperties.reduce((sum, p) => sum + p.views_count, 0);
            const regularViewsTotal = regularProperties.reduce((sum, p) => sum + p.views_count, 0);

            const avgFeaturedViews = featuredProperties.length > 0 ? featuredViewsTotal / featuredProperties.length : 0;
            const avgRegularViews = regularProperties.length > 0 ? regularViewsTotal / regularProperties.length : 0;

            return {
                summary: {
                    totalFeaturedProperties: featuredProperties.length,
                    totalRegularProperties: regularProperties.length,
                    avgFeaturedViews: Math.round(avgFeaturedViews),
                    avgRegularViews: Math.round(avgRegularViews),
                    featuredPerformanceBoost: avgRegularViews > 0 ? Math.round((avgFeaturedViews / avgRegularViews) * 100) / 100 : 0,
                },
                featuredProperties: featuredProperties.map(p => ({
                    id: p.id,
                    title: p.title,
                    views: p.views_count,
                    daysUntilExpiration: p.daysUntilExpiration,
                    price: p.price,
                    type: p.property_type,
                })),
            };
        } catch (error) {
            console.error('Error fetching featured listing analytics:', error);
            throw error;
        }
    }

    async getListingPerformanceReport(userId: number): Promise<any> {
        try {
            const properties = await Property.findAll({
                where: { user_id: userId },
                attributes: [
                    'id',
                    'title',
                    'views_count',
                    'is_featured',
                    'is_active',
                    'created_at',
                    'expires_at',
                    'price',
                    'property_type',
                    'city',
                ],
                order: [['views_count', 'DESC']],
            });

            const now = new Date();
            const activeProperties = properties.filter(p => p.is_active);
            const expiredProperties = properties.filter(p => p.expires_at && new Date(p.expires_at) < now);
            const expiringProperties = properties.filter(p => {
                if (!p.expires_at) return false;
                const daysUntilExpiration = Math.ceil((new Date(p.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
            });

            const topPerformers = activeProperties.slice(0, 5);
            const lowPerformers = activeProperties.filter(p => p.views_count < 10);

            return {
                summary: {
                    totalProperties: properties.length,
                    activeProperties: activeProperties.length,
                    expiredProperties: expiredProperties.length,
                    expiringProperties: expiringProperties.length,
                    lowPerformingProperties: lowPerformers.length,
                },
                topPerformers: topPerformers.map(p => ({
                    id: p.id,
                    title: p.title,
                    views: p.views_count,
                    isFeatured: p.is_featured,
                    city: p.city,
                    type: p.property_type,
                })),
                expiringProperties: expiringProperties.map(p => ({
                    id: p.id,
                    title: p.title,
                    daysUntilExpiration: Math.ceil((new Date(p.expires_at!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                    views: p.views_count,
                })),
                recommendations: this.generateListingRecommendations(properties),
            };
        } catch (error) {
            console.error('Error generating listing performance report:', error);
            throw error;
        }
    }

    private generateListingRecommendations(properties: any[]): string[] {
        const recommendations: string[] = [];
        const activeProperties = properties.filter(p => p.is_active);
        const lowPerformers = activeProperties.filter(p => p.views_count < 10);
        const expiring = properties.filter(p => {
            if (!p.expires_at) return false;
            const daysUntilExpiration = Math.ceil((new Date(p.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
        });

        if (lowPerformers.length > 0) {
            recommendations.push(`${lowPerformers.length} properties have low views. Consider updating descriptions or making them featured.`);
        }

        if (expiring.length > 0) {
            recommendations.push(`${expiring.length} properties are expiring soon. Renew them to maintain visibility.`);
        }

        const featuredCount = activeProperties.filter(p => p.is_featured).length;
        const totalActive = activeProperties.length;

        if (featuredCount < Math.min(3, Math.ceil(totalActive * 0.2))) {
            recommendations.push('Consider featuring more properties to increase visibility and views.');
        }

        if (recommendations.length === 0) {
            recommendations.push('Your listings are performing well! Keep updating them regularly.');
        }

        return recommendations;
    }

    private async clearPropertyCaches(): Promise<void> {
        try {
            // Clear search result caches
            const client = this.redis.getClient();
            if (this.redis.isReady()) {
                const keys = await client.keys('search:results:*');
                if (keys.length > 0) {
                    await client.del(keys);
                }

                // Clear featured properties cache
                const featuredKeys = await client.keys('properties:featured:*');
                if (featuredKeys.length > 0) {
                    await client.del(featuredKeys);
                }
            }
        } catch (error) {
            console.error('Error clearing property caches:', error);
            // Don't throw - cache clearing is not critical
        }
    }
}

export default PropertyService;