import config from '../config';

/**
 * Transform property image data to include full URLs
 */
export function transformPropertyImages(images: any[]): any[] {
  if (!images || !Array.isArray(images)) {
    return [];
  }

  const baseUrl = process.env.BASE_URL || `http://localhost:${config.server.port}`;

  return images.map(image => ({
    ...image,
    // Keep original image_url (could be S3 URL or local path)
    image_url: image.image_url || null,
    // Include optimized versions if they exist
    thumbnail_url: image.thumbnail_url || null,
    medium_url: image.medium_url || null,
    large_url: image.large_url || null,
    // Legacy support
    url: image.image_url || null,
    thumbnailUrl: image.thumbnail_url || null
  }));
}

/**
 * Transform a single property object to include full image URLs
 */
export function transformPropertyWithImages(property: any): any {
  if (!property) {
    return property;
  }

  const propertyData = typeof property.toJSON === 'function' ? property.toJSON() : property;

  return {
    ...propertyData,
    images: transformPropertyImages(propertyData.images || [])
  };
}

/**
 * Transform an array of properties to include full image URLs
 */
export function transformPropertiesWithImages(properties: any[]): any[] {
  if (!properties || !Array.isArray(properties)) {
    return [];
  }

  return properties.map(transformPropertyWithImages);
}