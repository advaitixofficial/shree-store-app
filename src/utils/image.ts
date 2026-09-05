// ============================================================
// Shree Stores - Image Resolution Helper
// ============================================================

export const getImageUrl = (imageSource: any, cacheBuster?: string): string | null => {
  if (!imageSource) return null;

  let url = '';

  if (typeof imageSource === 'string') {
    url = imageSource;
  } else if (imageSource.secure_url) {
    url = imageSource.secure_url;
  } else if (imageSource.url) {
    url = imageSource.url;
  } else if (Array.isArray(imageSource) && imageSource.length > 0) {
    // If it's an array of image objects
    url = imageSource[0]?.secure_url || imageSource[0]?.url || '';
  }

  if (!url || typeof url !== 'string') return null;

  // Cache busting: append timestamp if available
  if (cacheBuster && url.startsWith('http')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}v=${new Date(cacheBuster).getTime()}`;
  }

  return url;
};

export const getProductImage = (product: any): string | null => {
  if (!product) return null;
  
  // Try to find the best image in order of preference
  const imageSource = product.thumbnail || product.images || product.image;
  
  return getImageUrl(imageSource, product.updatedAt);
};

