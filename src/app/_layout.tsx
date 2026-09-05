import React from 'react';
import { View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider } from '@/store';
import { Colors } from '@/constants/colors';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { GlobalFloatingCart } from '@/components/common/GlobalFloatingCart';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const isInsideTabs = 
    pathname === '/(tabs)' || 
    pathname === '/(tabs)/index' || 
    pathname === '/(tabs)/categories' || 
    pathname === '/(tabs)/cart' || 
    pathname === '/(tabs)/orders' || 
    pathname === '/(tabs)/profile' ||
    pathname === '/categories' || 
    pathname === '/cart' || 
    pathname === '/orders' || 
    pathname === '/profile';

  // 64 is the tab bar base height
  const bottomOffset = isInsideTabs ? 64 + insets.bottom : 16;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/language" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="search/index" />
        <Stack.Screen name="address/index" />
        <Stack.Screen name="address/add" />
        <Stack.Screen name="address/location-picker" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="checkout/index" />
        <Stack.Screen name="payment/cashfree" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="order/confirmation" />
      </Stack>
      <GlobalFloatingCart bottomOffset={bottomOffset} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

