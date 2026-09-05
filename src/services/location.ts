// ============================================================
// Shree Stores - Location & Delivery Area Service
// ============================================================

import type { StoreSettings } from '@/types';

// Default store settings — will be fetched from API later
export const defaultStoreSettings: StoreSettings & { deliveryTiers?: { maxDistance: number; fee: number }[] } = {
  storeName: 'Shree Stores',
  storeNameHi: 'श्री स्टोर्स',
  storePhone: '+91 9876543210',
  storeEmail: 'contact@shreestores.in',
  storeAddress: 'Varanasi, Uttar Pradesh, India',
  storeLatitude: 25.3176,
  storeLongitude: 82.9739,
  deliveryRadiusKm: 40,
  deliveryFee: 0,
  freeDeliveryAbove: 300,
  minOrderAmount: 100,
  deliveryTiers: [
    { maxDistance: 20, fee: 30 },
    { maxDistance: 30, fee: 40 },
    { maxDistance: 40, fee: 50 },
  ],
  isOpen: true,
  openTime: '07:00',
  closeTime: '22:00',
  currency: 'INR',
  currencySymbol: '₹',
};

/**
 * Calculate distance between two lat/lng points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a given customer location is within the store's delivery radius.
 */
export function isWithinDeliveryRadius(
  customerLat: number,
  customerLon: number,
  settings: typeof defaultStoreSettings = defaultStoreSettings
): boolean {
  const distance = calculateDistance(
    settings.storeLatitude,
    settings.storeLongitude,
    customerLat,
    customerLon
  );
  return distance <= settings.deliveryRadiusKm;
}

/**
 * Calculate the delivery fee based on order subtotal and distance.
 */
export function getDeliveryFee(
  subtotal: number,
  distanceKm: number = 0,
  settings: typeof defaultStoreSettings = defaultStoreSettings
): number {
  if (subtotal >= settings.freeDeliveryAbove) {
    return 0;
  }

  if (distanceKm <= 10) {
    return 0;
  }

  if (settings.deliveryTiers && settings.deliveryTiers.length > 0) {
    const sortedTiers = [...settings.deliveryTiers].sort((a, b) => a.maxDistance - b.maxDistance);
    for (const tier of sortedTiers) {
      if (distanceKm <= tier.maxDistance) {
        return tier.fee;
      }
    }
  }

  return settings.deliveryFee;
}

/**
 * Format price in Indian Rupee format.
 */
export function formatPrice(price: number): string {
  return `₹${price.toFixed(0)}`;
}

/**
 * Calculate discount percentage.
 */
export function getDiscountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
