// ============================================================
// Shree Stores - Tab Layout (Redesigned)
// ============================================================

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography, Shadows, Spacing } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { Home, LayoutGrid, ShoppingCart, ClipboardList, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function TabLayout() {
  const { t } = useTranslation();
  const { getCartTotal } = useAppStore();
  const { itemCount } = getCartTotal();
  const insets = useSafeAreaInsets();
  
  const BASE_HEIGHT = 64;
  const BASE_PADDING = 8;
  const tabBarTotalHeight = BASE_HEIGHT + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              paddingBottom: BASE_PADDING + insets.bottom,
              height: tabBarTotalHeight,
            },
          ],
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textTertiary,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('home'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
                <Home color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: t('categories'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
                <LayoutGrid color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: t('cart'),
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.cartIconWrapper}>
                <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
                  <ShoppingCart color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
                </View>
                {itemCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {itemCount > 9 ? '9+' : itemCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: t('orders'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
                <ClipboardList color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconFocused]}>
                <User color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    ...Shadows.bottomBar,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 2,
  },
  iconWrapper: {
    width: 44,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  iconFocused: {
    backgroundColor: Colors.primaryLight,
  },
  cartIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.orange,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
});
