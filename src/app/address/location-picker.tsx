// ============================================================
// Shree Stores - Map Location Picker Screen
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { type Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { ArrowLeft, Search, X, Navigation, MapPin } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface SearchResult {
  place_id: string;
  display_name: string;
}

interface GeocodedAddress {
  street: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  fullAddress: string;
  houseInfo: string;
}

export default function LocationPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const mapRef = useRef<any>(null);

  const [region, setRegion] = useState<Region>({
    latitude: 25.3176,
    longitude: 82.9739,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [geocodedAddress, setGeocodedAddress] = useState<GeocodedAddress | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount, get current location after transition completes
  useEffect(() => {
    const timer = setTimeout(() => {
      getCurrentLocation();
    }, 400); // Wait for screen transition to finish
    return () => clearTimeout(timer);
  }, []);

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasLocationPermission(false);
        setIsLocating(false);
        return;
      }
      setHasLocationPermission(true);

      let position = await Location.getLastKnownPositionAsync();
      if (!position) {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (position?.coords) {
        const newRegion: Region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 800);
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      }
    } catch (e) {
      console.warn('Location fetch failed:', e);
    } finally {
      setIsLocating(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      if (!GOOGLE_API_KEY) throw new Error('Missing Google API Key');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        let street = '', area = '', city = '', state = '', postalCode = '', houseInfo = '';

        result.address_components.forEach((component: any) => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('premise') || types.includes('subpremise')) {
            houseInfo += (houseInfo ? ', ' : '') + component.long_name;
          }
          if (types.includes('route')) street += component.long_name + ' ';
          if (types.includes('sublocality') || types.includes('neighborhood') || types.includes('sublocality_level_1')) area = component.long_name;
          if (types.includes('locality')) city = component.long_name;
          if (types.includes('administrative_area_level_1')) state = component.long_name;
          if (types.includes('postal_code')) postalCode = component.long_name;
        });

        street = street.trim();
        
        setGeocodedAddress({
          street: street || area,
          area: area || city,
          city,
          state,
          postalCode,
          fullAddress: result.formatted_address,
          houseInfo,
        });
      } else {
        throw new Error('Geocoding failed');
      }
    } catch {
      // Fallback to expo-location if Google fails
      try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results && results.length > 0) {
          const place = results[0];
          const parts: string[] = [];
          if (place.name && place.name !== place.street) parts.push(place.name);
          if (place.street) parts.push(place.street);
          if (place.subregion || place.district) parts.push(place.subregion || place.district || '');
          if (place.city) parts.push(place.city);
          if (place.region) parts.push(place.region);

          setGeocodedAddress({
            street: place.street || '',
            area: place.subregion || place.district || place.name || '',
            city: place.city || '',
            state: place.region || '',
            postalCode: place.postalCode || '',
            fullAddress: parts.filter(Boolean).join(', '),
            houseInfo: '',
          });
        }
      } catch (e) {
        // Silently fail
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Debounced reverse geocode on map region change
  const regionChangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);

    if (regionChangeTimerRef.current) {
      clearTimeout(regionChangeTimerRef.current);
    }

    regionChangeTimerRef.current = setTimeout(() => {
      reverseGeocode(newRegion.latitude, newRegion.longitude);
    }, 500);
  }, []);

  // Search with debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (text.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setShowSearchResults(true);
    searchTimerRef.current = setTimeout(() => {
      searchLocation(text);
    }, 600);
  };

  const searchLocation = async (query: string) => {
    setIsSearching(true);
    try {
      if (!GOOGLE_API_KEY) return;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setSearchResults(
          data.predictions.map((p: any) => ({
            place_id: p.place_id,
            display_name: p.description,
          }))
        );
      } else {
        console.warn('Google Places API Error:', data.status, data.error_message);
        setSearchResults([]);
      }
    } catch (e) {
      console.warn('Google Places API Catch:', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: SearchResult) => {
    Keyboard.dismiss();
    setShowSearchResults(false);
    setSearchQuery('');
    
    try {
      if (!GOOGLE_API_KEY) return;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=geometry&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        const newRegion: Region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 800);
        reverseGeocode(lat, lng);
      }
    } catch {
      // Failed to get details
    }
  };

  const handleConfirmLocation = () => {
    // Pass data back via router params
    router.navigate({
      pathname: '/address/add',
      params: {
        ...(params.id ? { id: params.id } : {}),
        pickedLat: region.latitude.toString(),
        pickedLng: region.longitude.toString(),
        pickedStreet: geocodedAddress?.street || '',
        pickedArea: geocodedAddress?.area || '',
        pickedCity: geocodedAddress?.city || '',
        pickedState: geocodedAddress?.state || '',
        pickedPostalCode: geocodedAddress?.postalCode || '',
        pickedHouseInfo: geocodedAddress?.houseInfo || '',
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        pitchEnabled={false}
        mapType="standard"
      />

      {/* Center Pin (fixed overlay) */}
      <View style={styles.pinContainer} pointerEvents="none">
        <View style={styles.pinShadow} />
        <View style={styles.pin}>
          <MapPin size={28} color={Colors.error} fill={Colors.error} strokeWidth={2} />
        </View>
        {/* Pin tooltip */}
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Order would be delivered here</Text>
          <Text style={styles.tooltipSubText}>Move the map to adjust pin</Text>
        </View>
      </View>

      {/* Search Bar */}
      <SafeAreaView style={styles.searchContainer} edges={['top']}>
        <View style={styles.searchBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.searchBackButton, pressed && styles.pressed]}
          >
            <ArrowLeft size={22} color={Colors.text} strokeWidth={2} />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            placeholder="Search area or landmark, min 3 char"
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={() => searchQuery.length >= 3 && setShowSearchResults(true)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              style={styles.searchClearButton}
            >
              <X size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <View style={styles.searchResults}>
            {isSearching ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.searchLoadingText}>Searching...</Text>
              </View>
            ) : searchResults.length === 0 ? (
              <View style={styles.searchLoading}>
                <Text style={styles.searchLoadingText}>
                  {searchQuery.length < 3 ? 'Type at least 3 characters' : 'No results found'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.place_id.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectSearchResult(item)}
                    style={({ pressed }) => [
                      styles.searchResultItem,
                      pressed && styles.searchResultItemPressed,
                    ]}
                  >
                    <MapPin size={16} color={Colors.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        )}
      </SafeAreaView>

      {/* Locate Me FAB */}
      <Pressable
        onPress={getCurrentLocation}
        disabled={isLocating}
        style={({ pressed }) => [
          styles.locateFab,
          { bottom: 220 + insets.bottom },
          pressed && styles.locateFabPressed,
        ]}
      >
        {isLocating ? (
          <ActivityIndicator size={22} color={Colors.primary} />
        ) : (
          <Navigation size={22} color={Colors.primary} strokeWidth={2.5} />
        )}
      </Pressable>

      {/* Bottom Card */}
      <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, Spacing.base) }]}>
        <Text style={styles.bottomCardLabel}>Delivery Location</Text>

        <View style={styles.addressCard}>
          <View style={styles.addressIconContainer}>
            <MapPin size={22} color={Colors.error} fill={Colors.errorLight} />
          </View>
          <View style={styles.addressTextContainer}>
            {isGeocoding ? (
              <View style={styles.addressLoading}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.addressLoadingText}>{t('detectingLocation')}</Text>
              </View>
            ) : geocodedAddress ? (
              <>
                <Text style={styles.addressTitle} numberOfLines={1}>
                  {geocodedAddress.area || geocodedAddress.city || 'Selected Location'}
                </Text>
                <Text style={styles.addressSubtitle} numberOfLines={2}>
                  {geocodedAddress.fullAddress}
                </Text>
              </>
            ) : (
              <Text style={styles.addressTitle}>Move map to select location</Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={handleConfirmLocation}
          disabled={isGeocoding || !geocodedAddress}
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
            (isGeocoding || !geocodedAddress) && styles.confirmButtonDisabled,
          ]}
        >
          <Text style={styles.confirmButtonText}>Enter location</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFill as object,
  },

  // Center Pin
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    zIndex: 10,
  },
  pin: {
    marginLeft: -14,
    marginTop: -42,
  },
  pinShadow: {
    position: 'absolute',
    bottom: -18,
    left: -6,
    width: 12,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 6,
  },
  tooltip: {
    position: 'absolute',
    top: -90,
    backgroundColor: 'rgba(30,30,30,0.92)',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: 220,
    marginLeft: -110,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
  },
  tooltipSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },

  // Search
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.sm,
    height: 52,
    ...Shadows.lg,
  },
  searchBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    paddingVertical: 0,
  },
  searchClearButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResults: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    maxHeight: 250,
    ...Shadows.lg,
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  searchLoadingText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchResultItemPressed: {
    backgroundColor: Colors.primaryLight,
  },
  searchResultText: {
    flex: 1,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text,
    lineHeight: 20,
  },

  // Locate Me FAB
  locateFab: {
    position: 'absolute',
    bottom: 220,
    right: Spacing.base,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  locateFabPressed: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },

  // Bottom Card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] : Spacing.base,
    ...Shadows.xl,
  },
  bottomCardLabel: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginBottom: Spacing.base,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addressLoadingText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  addressTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  addressSubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: Colors.textWhite,
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },

  pressed: {
    opacity: 0.7,
  },
});
