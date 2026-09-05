// ============================================================
// Shree Stores - Home Screen (Redesigned)
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { catalogApi } from '@/api/catalog';
import { publicApi } from '@/api/public';
import type { Product, Category, Banner } from '@/types';
import { AlertCircle } from 'lucide-react-native';

// Modular Components
import { HomeHeader } from '@/components/home/HomeHeader';
import { HomeSearchBar } from '@/components/home/HomeSearchBar';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { CategoryScroller } from '@/components/home/CategoryScroller';
import { HeroBannerCarousel } from '@/components/home/HeroBannerCarousel';
import { ProductHorizontalList } from '@/components/home/ProductHorizontalList';

export default function HomeScreen() {
  const { t, language } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [bannersRes, categoriesRes, featuredRes, popularRes] = await Promise.all([
        publicApi.getBanners().catch(() => []),
        catalogApi.getCategories().catch(() => []),
        catalogApi.getProducts({ isFeatured: true, limit: 10 }).catch(() => ({ products: [] })),
        catalogApi.getProducts({ limit: 10 }).catch(() => ({ products: [] })),
      ]);
      
      setBanners(bannersRes);
      setCategories(categoriesRes);
      setFeaturedProducts(featuredRes.products || []);
      setPopularProducts(popularRes.products || []);
    } catch (e: any) {
      setError('Failed to load content. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <HomeHeader />
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HomeHeader />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        <HomeSearchBar />
        
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={32} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <CategoryScroller categories={categories} />
            <HeroBannerCarousel banners={banners} />
            
            <ProductHorizontalList 
              title={t('popularProducts')} 
              products={popularProducts} 
            />
            
            <ProductHorizontalList 
              title={language === 'hi' ? 'विशेष उत्पाद' : 'Featured Products'} 
              products={featuredProducts} 
            />
            
            {/* Trust Badges - Could be extracted to a component, but keeping it simple here if needed, or remove for cleaner look */}
            
            {/* Bottom Padding for Floating Cart */}
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  errorContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80, // Space for the floating cart
  },
});
