// ============================================================
// Shree Stores - Add/Edit Address Screen (with Location Picker)
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { Address, AddressType } from '@/types';
import { ArrowLeft, Home, Briefcase, MapPin, Navigation } from 'lucide-react-native';

export default function AddAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    pickedLat?: string;
    pickedLng?: string;
    pickedStreet?: string;
    pickedArea?: string;
    pickedCity?: string;
    pickedState?: string;
    pickedPostalCode?: string;
    pickedHouseInfo?: string;
  }>();
  const { t } = useTranslation();
  const { auth, addresses, addAddress, updateAddress } = useAppStore();

  const existingAddress = params.id ? addresses.find((a) => a._id === params.id) : undefined;
  const isEdit = !!existingAddress;

  const defaultUserPhone = auth.user?.phone ? auth.user.phone.replace(/[^0-9]/g, '').slice(-10) : '';

  const [label, setLabel] = useState<AddressType>(existingAddress?.label ?? 'HOME');
  const [fullName, setFullName] = useState(existingAddress?.fullName ?? auth.user?.name ?? '');
  const [phone, setPhone] = useState(existingAddress?.phone ?? defaultUserPhone);
  const [addressLine1, setAddressLine1] = useState(existingAddress?.addressLine1 ?? '');
  const [addressLine2, setAddressLine2] = useState(existingAddress?.addressLine2 ?? '');
  const [landmark, setLandmark] = useState(existingAddress?.landmark ?? '');
  const [city, setCity] = useState(existingAddress?.city ?? 'Varanasi');
  const [stateName, setStateName] = useState(existingAddress?.state ?? 'Uttar Pradesh');
  const [postalCode, setPostalCode] = useState(existingAddress?.postalCode ?? '221001');
  const [latitude, setLatitude] = useState(existingAddress?.latitude ?? 25.3176);
  const [longitude, setLongitude] = useState(existingAddress?.longitude ?? 82.9739);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationPicked, setLocationPicked] = useState(false);

  // Sync auth user details if creating new address and state was empty
  useEffect(() => {
    if (!existingAddress && auth.user) {
      if (!fullName.trim() && auth.user.name) setFullName(auth.user.name);
      if (!phone.trim() && auth.user.phone) {
        setPhone(auth.user.phone.replace(/[^0-9]/g, '').slice(-10));
      }
    }
  }, [auth.user]);

  // Receive data back from the location picker
  useEffect(() => {
    if (params.pickedLat && params.pickedLng) {
      const lat = parseFloat(params.pickedLat);
      const lng = parseFloat(params.pickedLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLatitude(lat);
        setLongitude(lng);
        setLocationPicked(true);
      }
      if (params.pickedStreet) setAddressLine2(params.pickedStreet);
      if (params.pickedArea) setLandmark(params.pickedArea);
      if (params.pickedCity) setCity(params.pickedCity);
      if (params.pickedState) setStateName(params.pickedState);
      if (params.pickedPostalCode && params.pickedPostalCode.trim()) {
        const cleanPin = params.pickedPostalCode.replace(/[^0-9]/g, '');
        if (cleanPin.length === 6) {
          setPostalCode(cleanPin);
        }
      }
      // Auto-fill House/Flat/Floor if available from geocoder
      if (params.pickedHouseInfo) setAddressLine1(params.pickedHouseInfo);
      // Clear errors on auto-filled fields
      setErrors({});
    }
  }, [params.pickedLat, params.pickedLng]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = t('fieldRequired');
    
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) newErrors.phone = t('invalidMobile');
    
    if (!city.trim()) newErrors.city = t('fieldRequired');
    if (!stateName.trim()) newErrors.state = t('fieldRequired');
    
    const cleanPin = postalCode.replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) newErrors.postalCode = t('invalidPincode');
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrMsg = Object.values(newErrors)[0];
      Alert.alert('Address Incomplete', firstErrMsg || 'Please fill out all required fields.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const finalAddressLine1 = addressLine1.trim() || addressLine2.trim() || landmark.trim() || city.trim() || 'Address';
    const finalPostalCode = postalCode.replace(/[^0-9]/g, '') || '221001';

    const addressData: Partial<Address> = {
      label,
      fullName: fullName.trim(),
      phone: cleanPhone,
      addressLine1: finalAddressLine1,
      addressLine2: addressLine2.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: stateName.trim(),
      postalCode: finalPostalCode,
      latitude,
      longitude,
      isDefault: existingAddress?.isDefault ?? addresses.length === 0,
    };

    try {
      if (isEdit && params.id) {
        await updateAddress(params.id, addressData);
      } else {
        await addAddress(addressData);
      }
      router.back();
    } catch (err: any) {
      console.error('Save address error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save address';
      Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLocationPicker = () => {
    router.push({
      pathname: '/address/location-picker',
      params: params.id ? { id: params.id } : {},
    });
  };

  const getTypeIcon = (optionType: AddressType, isActive: boolean) => {
    const color = isActive ? Colors.primary : Colors.textSecondary;
    switch (optionType) {
      case 'HOME': return <Home size={18} color={color} strokeWidth={isActive ? 2.5 : 2} />;
      case 'WORK': return <Briefcase size={18} color={color} strokeWidth={isActive ? 2.5 : 2} />;
      default: return <MapPin size={18} color={color} strokeWidth={isActive ? 2.5 : 2} />;
    }
  };

  const typeOptions: { type: AddressType; label: string }[] = [
    { type: 'HOME', label: t('addressHome') },
    { type: 'WORK', label: t('addressWork') },
    { type: 'OTHER', label: t('addressOther') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEdit ? t('editAddress') : t('addAddress')}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.flex} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {/* Location Picker Button */}
          <Pressable
            onPress={handleOpenLocationPicker}
            style={({ pressed }) => [
              styles.detectButton,
              pressed && styles.detectButtonPressed,
              locationPicked && styles.detectButtonPicked,
            ]}
          >
            <View style={[styles.detectIconContainer, locationPicked && styles.detectIconContainerPicked]}>
              {locationPicked ? (
                <MapPin size={20} color={Colors.primary} fill={Colors.primaryLight} strokeWidth={2.5} />
              ) : (
                <Navigation size={20} color={Colors.primary} strokeWidth={2.5} />
              )}
            </View>
            <View style={styles.detectTextContainer}>
              <Text style={styles.detectTitle}>
                {locationPicked ? 'Location Selected' : t('detectLocation')}
              </Text>
              <Text style={styles.detectSubtitle}>
                {locationPicked
                  ? `${city}, ${stateName} ${postalCode ? `- ${postalCode}` : ''}`
                  : 'Pick on map to auto-fill address'}
              </Text>
            </View>
            {locationPicked && (
              <Text style={styles.changeText}>Change</Text>
            )}
          </Pressable>

          {/* Address Type Selector */}
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabelHeader}>Address Tag</Text>
            <View style={styles.typeRow}>
              {typeOptions.map((option) => (
                <Pressable
                  key={option.type}
                  onPress={() => setLabel(option.type)}
                  style={[
                    styles.typeButton,
                    label === option.type && styles.typeButtonActive,
                  ]}
                >
                  {getTypeIcon(option.type, label === option.type)}
                  <Text
                    style={[
                      styles.typeLabel,
                      label === option.type && styles.typeLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Input label={t('name')} value={fullName} onChangeText={setFullName} error={errors.fullName} />
          <Input label={t('phone')} value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))} keyboardType="phone-pad" maxLength={10} error={errors.phone} />
          <Input label={t('houseFlat')} value={addressLine1} onChangeText={setAddressLine1} error={errors.addressLine1} />
          <Input label={t('street')} value={addressLine2} onChangeText={setAddressLine2} />
          <Input label={t('area')} value={landmark} onChangeText={setLandmark} error={errors.landmark} />
          <Input label={t('city')} value={city} onChangeText={setCity} error={errors.city} />
          <Input label={'State'} value={stateName} onChangeText={setStateName} error={errors.state} />
          <Input label={t('pincode')} value={postalCode} onChangeText={(t) => setPostalCode(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" maxLength={6} error={errors.postalCode} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.base) }]}>
          <Button
            title={t('saveAddress')}
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  form: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },

  // Detect Location / Map Picker Button
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderStyle: 'dashed',
  },
  detectButtonPressed: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  detectButtonPicked: {
    borderStyle: 'solid',
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  detectIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  detectIconContainerPicked: {
    backgroundColor: Colors.primary + '15',
  },
  detectTextContainer: {
    flex: 1,
  },
  detectTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
  detectSubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: Typography.weight.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  changeText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },

  // Address Type
  typeContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  typeLabelHeader: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md - 2,
    minHeight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  typeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  typeLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
  typeLabelActive: {
    color: Colors.primaryDark,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  footer: {
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.bottomBar,
  },
  pressed: {
    opacity: 0.7,
  },
});
