// ============================================================
// Shree Stores - App Store (Combined Context Provider)
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  CartItem,
  Product,
  Order,
  Address,
  Language,
} from '@/types';
import { I18nProvider } from '@/i18n';
import { authApi } from '../api/auth';
import { cartApi } from '../api/cart';
import { addressApi } from '../api/addresses';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync } from '@/services/notifications';

// ── Storage Keys ──────────────────────────────────────────────
const STORAGE_KEYS = {
  LANGUAGE: '@shree_stores_language',
  ONBOARDED: '@shree_stores_onboarded',
  AUTH_TOKEN: '@shree_stores_auth_token',
  USER: '@shree_stores_user',
  CART: '@shree_stores_cart',
  ADDRESSES: '@shree_stores_addresses',
  RECENT_SEARCHES: '@shree_stores_recent_searches',
};

// ── Auth State ────────────────────────────────────────────────
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return { isAuthenticated: false, user: null, token: null };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
}

// ── Cart State ────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; variantId: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId: string; quantity: number } }
  | { type: 'INCREMENT_QUANTITY'; payload: { productId: string; variantId: string } }
  | { type: 'DECREMENT_QUANTITY'; payload: { productId: string; variantId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (item) => item.product?._id === action.payload.product._id && item.variantId === action.payload.variantId
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            (item.product?._id === action.payload.product._id && item.variantId === action.payload.variantId)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { product: action.payload.product, variantId: action.payload.variantId, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (item) => !(item.product?._id === action.payload.productId && item.variantId === action.payload.variantId)
        ),
      };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => !(item.product?._id === action.payload.productId && item.variantId === action.payload.variantId)
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          (item.product?._id === action.payload.productId && item.variantId === action.payload.variantId)
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    case 'INCREMENT_QUANTITY': {
      return {
        items: state.items.map((item) =>
          (item.product?._id === action.payload.productId && item.variantId === action.payload.variantId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    }
    case 'DECREMENT_QUANTITY': {
      const item = state.items.find((i) => i.product?._id === action.payload.productId && i.variantId === action.payload.variantId);
      if (item && item.quantity <= 1) {
        return {
          items: state.items.filter((i) => !(i.product?._id === action.payload.productId && i.variantId === action.payload.variantId)),
        };
      }
      return {
        items: state.items.map((i) =>
          (i.product?._id === action.payload.productId && i.variantId === action.payload.variantId)
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'SET_CART':
      return { items: (action.payload || []).filter((i: CartItem) => i.product) };
    default:
      return state;
  }
}

// ── Orders State ──────────────────────────────────────────────
interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

type OrdersAction =
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order };

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, loading: false };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        ),
      };
    default:
      return state;
  }
}

// ── App Context ───────────────────────────────────────────────
interface AppContextType {
  // Language
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;

  // Onboarding
  isOnboarded: boolean;
  setOnboarded: () => Promise<void>;

  // Auth
  auth: AuthState;
  login: (user: User, tokenPair: { accessToken: string, refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;

  // Cart
  cart: CartState;
  addToCart: (product: Product, variantId: string) => Promise<void>;
  removeFromCart: (productId: string, variantId: string) => Promise<void>;
  updateCartQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>;
  incrementCartQuantity: (productId: string, variantId: string) => void;
  decrementCartQuantity: (productId: string, variantId: string) => void;
  clearCart: () => Promise<void>;
  getCartTotal: () => { subtotal: number; savings: number; itemCount: number };
  getCartItemQuantity: (productId: string, variantId: string) => number;
  syncCart: () => Promise<void>;

  // Orders
  ordersState: OrdersState;
  placeOrder: (order: Order) => void;

  // Addresses
  addresses: Address[];
  addAddress: (address: Partial<Address>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  syncAddresses: () => Promise<void>;

  // Recent Searches
  recentSearches: string[];
  addRecentSearch: (query: string) => Promise<void>;
  clearRecentSearches: () => Promise<void>;

  // Loading
  isAppReady: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

import { setLogoutCallback } from '../api/client';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [auth, authDispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const [cart, cartDispatch] = useReducer(cartReducer, { items: [] });
  const [ordersState, ordersDispatch] = useReducer(ordersReducer, {
    orders: [],
    loading: false,
    error: null,
  });

  // Load persisted state on mount
  useEffect(() => {
    setLogoutCallback(() => {
      logout();
    });
    loadPersistedState();
  }, []);

  async function loadPersistedState() {
    try {
      const [lang, onboarded, userData, cartData, searchData] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
          AsyncStorage.getItem('@shree_user'),
          AsyncStorage.getItem(STORAGE_KEYS.CART),
          AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
        ]);
        
      const token = await SecureStore.getItemAsync('shree_access_token');

      if (lang === 'hi' || lang === 'en') {
        setLanguageState(lang);
      }
      if (onboarded === 'true') {
        setIsOnboardedState(true);
      }
      if (token && userData) {
        authDispatch({
          type: 'LOGIN',
          payload: { user: JSON.parse(userData), token },
        });
      }
      if (cartData) {
        cartDispatch({ type: 'SET_CART', payload: JSON.parse(cartData) });
      }
      if (searchData) {
        setRecentSearches(JSON.parse(searchData));
      }
    } catch (e) {
      console.warn('Failed to load persisted state:', e);
    } finally {
      setIsAppReady(true);
    }
  }

  // Persist cart whenever it changes
  useEffect(() => {
    if (isAppReady) {
      AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart.items)).catch(() => {});
    }
  }, [cart.items, isAppReady]);

  // ── Language ──
  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  // ── Onboarding ──
  const setOnboarded = useCallback(async () => {
    setIsOnboardedState(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  }, []);

  // ── Auth ──
  const login = useCallback(async (user: User, tokenPair: { accessToken: string, refreshToken: string }) => {
    authDispatch({ type: 'LOGIN', payload: { user, token: tokenPair.accessToken } });
    await SecureStore.setItemAsync('shree_access_token', tokenPair.accessToken);
    await SecureStore.setItemAsync('shree_refresh_token', tokenPair.refreshToken);
    await AsyncStorage.setItem('@shree_user', JSON.stringify(user));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    authDispatch({ type: 'LOGOUT' });
    cartDispatch({ type: 'CLEAR_CART' });
    setAddresses([]);
    await SecureStore.deleteItemAsync('shree_access_token');
    await SecureStore.deleteItemAsync('shree_refresh_token');
    await AsyncStorage.removeItem('@shree_user');
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    authDispatch({ type: 'UPDATE_USER', payload: data });
  }, []);

  // ── Cart ──
  // A simple serial queue to prevent out-of-order API calls
  const cartQueueRef = useRef<Promise<any>>(Promise.resolve());
  const enqueueCartOp = useCallback((op: () => Promise<any>) => {
    cartQueueRef.current = cartQueueRef.current.then(op).catch(() => {});
  }, []);

  const syncCart = useCallback(async () => {
    try {
      if (auth.isAuthenticated) {
        const data = await cartApi.getCart();
        cartDispatch({ type: 'SET_CART', payload: data.items });
      }
    } catch (e) {
      // ignore
    }
  }, [auth.isAuthenticated]);

  // Only sync cart ONCE on initial login — not on every re-render
  const hasSyncedCart = useRef(false);
  useEffect(() => {
    if (auth.isAuthenticated && !hasSyncedCart.current) {
      hasSyncedCart.current = true;
      syncCart();
    }
    if (!auth.isAuthenticated) {
      hasSyncedCart.current = false;
    }
  }, [auth.isAuthenticated, syncCart]);

  const addToCart = useCallback(async (product: Product, variantId: string) => {
    cartDispatch({ type: 'ADD_ITEM', payload: { product, variantId } });
    if (auth.isAuthenticated) {
      enqueueCartOp(() => cartApi.addItem(product._id, variantId, 1));
    }
  }, [auth.isAuthenticated, enqueueCartOp]);

  const removeFromCart = useCallback(async (productId: string, variantId: string) => {
    cartDispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
    if (auth.isAuthenticated) {
      enqueueCartOp(() => cartApi.removeItem(productId, variantId));
    }
  }, [auth.isAuthenticated, enqueueCartOp]);

  const updateCartQuantity = useCallback(
    async (productId: string, variantId: string, quantity: number) => {
      cartDispatch({ type: 'UPDATE_QUANTITY', payload: { productId, variantId, quantity } });
      if (auth.isAuthenticated) {
        if (quantity > 0) {
          enqueueCartOp(() => cartApi.updateItem(productId, variantId, quantity));
        } else {
          enqueueCartOp(() => cartApi.removeItem(productId, variantId));
        }
      }
    },
    [auth.isAuthenticated, enqueueCartOp]
  );

  const incrementCartQuantity = useCallback((productId: string, variantId: string) => {
    cartDispatch({ type: 'INCREMENT_QUANTITY', payload: { productId, variantId } });
    if (auth.isAuthenticated) {
      enqueueCartOp(async () => {
        // Read the ACTUAL latest cart state at execution time (not closure time)
        // by getting current cart from the API response of addItem
        await cartApi.addItem(productId, variantId, 1);
      });
    }
  }, [auth.isAuthenticated, enqueueCartOp]);

  const decrementCartQuantity = useCallback((productId: string, variantId: string) => {
    cartDispatch({ type: 'DECREMENT_QUANTITY', payload: { productId, variantId } });
    if (auth.isAuthenticated) {
      enqueueCartOp(async () => {
        // We need the current quantity. Use getCart to find it.
        const data = await cartApi.getCart();
        const item = data.items.find((i: any) => 
          (typeof i.product === 'string' ? i.product : i.product?._id) === productId && i.variantId === variantId
        );
        if (item && item.quantity > 1) {
          await cartApi.updateItem(productId, variantId, item.quantity - 1);
        } else {
          await cartApi.removeItem(productId, variantId);
        }
      });
    }
  }, [auth.isAuthenticated, enqueueCartOp]);

  const clearCart = useCallback(async () => {
    cartDispatch({ type: 'CLEAR_CART' });
    if (auth.isAuthenticated) {
      enqueueCartOp(() => cartApi.clearCart());
    }
  }, [auth.isAuthenticated, enqueueCartOp]);

  const getCartTotal = useCallback(() => {
    let subtotal = 0;
    let savings = 0;
    let itemCount = 0;
    for (const item of cart.items) {
      if (!item.product) continue;
      
      let price = 0;
      let mrp = 0;

      // Find the specific variant
      const variant = item.product.variants?.find(v => v._id === item.variantId);
      if (variant) {
        price = variant.price;
        mrp = variant.mrp || variant.price;
      } else {
        // fallback (should not happen if data is consistent)
        price = 0;
        mrp = 0;
      }

      subtotal += price * item.quantity;
      savings += (mrp - price) * item.quantity;
      itemCount += item.quantity;
    }
    return { subtotal, savings, itemCount };
  }, [cart.items]);

  const getCartItemQuantity = useCallback(
    (productId: string, variantId: string) => {
      const item = cart.items.find(
        (i) => i.product?._id === productId && i.variantId === variantId
      );
      return item ? item.quantity : 0;
    },
    [cart.items]
  );

  // ── Orders ──
  const placeOrder = useCallback((order: Order) => {
    ordersDispatch({ type: 'ADD_ORDER', payload: order });
    cartDispatch({ type: 'CLEAR_CART' });
  }, []);

  // ── Addresses ──
  const syncAddresses = useCallback(async () => {
    try {
      if (auth.isAuthenticated) {
        const data = await addressApi.getAddresses();
        setAddresses(data);
      }
    } catch (e) {
      // ignore
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      syncAddresses();
      registerForPushNotificationsAsync();
    }
  }, [auth.isAuthenticated, syncAddresses]);

  const addAddress = useCallback(async (address: Partial<Address>) => {
    try {
      if (auth.isAuthenticated) {
        await addressApi.createAddress(address);
        await syncAddresses();
      } else {
        const localAddr: Address = {
          _id: 'local_' + Date.now(),
          user: 'guest',
          label: address.label || 'HOME',
          fullName: address.fullName || '',
          phone: address.phone || '',
          addressLine1: address.addressLine1 || '',
          addressLine2: address.addressLine2 || '',
          landmark: address.landmark || '',
          city: address.city || 'Varanasi',
          state: address.state || 'Uttar Pradesh',
          postalCode: address.postalCode || '221001',
          latitude: address.latitude || 25.3176,
          longitude: address.longitude || 82.9739,
          isDefault: addresses.length === 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAddresses((prev) => [...prev, localAddr]);
      }
    } catch (e: any) {
      console.error('Add address error:', e?.response?.data || e);
      throw e;
    }
  }, [auth.isAuthenticated, syncAddresses, addresses.length]);

  const updateAddress = useCallback(async (id: string, address: Partial<Address>) => {
    try {
      if (auth.isAuthenticated) {
        await addressApi.updateAddress(id, address);
        await syncAddresses();
      } else {
        setAddresses((prev) =>
          prev.map((a) => (a._id === id ? ({ ...a, ...address } as Address) : a))
        );
      }
    } catch (e: any) {
      console.error('Update address error:', e?.response?.data || e);
      throw e;
    }
  }, [auth.isAuthenticated, syncAddresses]);

  const deleteAddress = useCallback(async (id: string) => {
    try {
      if (auth.isAuthenticated) {
        await addressApi.deleteAddress(id);
        await syncAddresses();
      }
    } catch (e) {
      // handle error
    }
  }, [auth.isAuthenticated, syncAddresses]);

  const setDefaultAddress = useCallback(async (id: string) => {
    try {
      if (auth.isAuthenticated) {
        await addressApi.setDefault(id);
        await syncAddresses();
      }
    } catch (e) {
      // handle error
    }
  }, [auth.isAuthenticated, syncAddresses]);

  // ── Recent Searches ──
  const addRecentSearch = useCallback(async (query: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 10);
      AsyncStorage.setItem(
        STORAGE_KEYS.RECENT_SEARCHES,
        JSON.stringify(updated)
      ).catch(() => {});
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  }, []);

  const contextValue: AppContextType = {
    language,
    setLanguage,
    isOnboarded,
    setOnboarded,
    auth,
    login,
    logout,
    updateUser,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    incrementCartQuantity,
    decrementCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemQuantity,
    syncCart,
    ordersState,
    placeOrder,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    syncAddresses,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isAppReady,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <I18nProvider language={language} setLanguage={setLanguage}>
        {children}
      </I18nProvider>
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}
