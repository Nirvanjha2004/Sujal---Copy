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
    url: image.image_url ? `${baseUrl}/uploads/properties/${image.image_url}` : null,
    image_url: image.image_url ? `${baseUrl}/uploads/properties/${image.image_url}` : null,
    thumbnailUrl: image.image_url ? `${baseUrl}/uploads/properties/${image.image_url.replace(/(\.[^.]+)$/, '_thumb$1')}` : null
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