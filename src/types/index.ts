// ============================================================
// Shree Stores - Data Models
// All interfaces ready for Node.js/Express + MongoDB backend
// ============================================================

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profileImage?: { url: string; publicId: string };
  preferredLanguage: 'en' | 'hi';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  nameHindi?: string;
  description: string;
  descriptionHindi?: string;
  price: number;
  mrp?: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  unit: string;
  unitValue: number;
  images: { url: string; publicId: string }[];
  thumbnail?: { url: string; publicId: string };
  category: string | Category; // Depends on population
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  searchKeywords?: string[];
}

export interface Category {
  _id: string;
  name: string;
  nameHindi: string;
  slug: string;
  description?: string;
  descriptionHindi?: string;
  image?: { url: string; publicId: string };
  productCount: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export type AddressType = 'HOME' | 'WORK' | 'OTHER';

export interface Address {
  _id: string;
  user: string;
  label: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'COD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productNameHindi: string;
  image?: { url: string; publicId: string };
  quantity: number;
  unit: string;
  price: number;
  mrp: number;
  total: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  assignedEmployee?: string;
  notes?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  titleHi: string;
  subtitle?: string;
  subtitleHi?: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  actionType?: 'category' | 'product' | 'link';
  actionValue?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  descriptionHi: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export interface StoreSettings {
  storeName: string;
  storeNameHi: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  storeLatitude: number;
  storeLongitude: number;
  deliveryRadiusKm: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  minOrderAmount: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  currency: string;
  currencySymbol: string;
}

export type Language = 'en' | 'hi';

export interface AppState {
  language: Language;
  isFirstLaunch: boolean;
  isOnboarded: boolean;
  isAuthenticated: boolean;
}
