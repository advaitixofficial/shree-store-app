// ============================================================
// Shree Stores - Search Screen (Redesigned)
// ============================================================

import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowLeft, Search, X, Clock } from 'lucide-react-native';
import { catalogApi } from '@/api/catalog';
import { useEffect } from 'react';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim(), 1);
      } else {
        setResults([]);
        setHasSearched(false);
        setHasMore(true);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  const performSearch = async (text: string, pageNum: number) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await catalogApi.getProducts({ search: text, page: pageNum, limit: 12 });
      if (pageNum === 1) {
        setResults(response.products);
      } else {
        setResults(prev => [...prev, ...response.products]);
      }
      setHasMore(response.page < response.totalPages);
      setPage(pageNum);
    } catch (e) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && hasSearched) {
      performSearch(query.trim(), page + 1);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const handleSubmitSearch = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        
        <View style={styles.searchWrapper}>
          <Search size={18} color={Colors.textSecondary} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchForGroceries')}
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmitSearch}
            autoFocus
            returnKeyType="search"
            selectionColor={Colors.primary}
          />
          {query ? (
            <Pressable
              onPress={() => handleSearch('')}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
            >
              <X size={16} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Recent Searches */}
      {!hasSearched && recentSearches.length > 0 ? (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>{t('recentSearches')}</Text>
            <Pressable onPress={clearRecentSearches} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={styles.clearAllText}>{t('clearAll')}</Text>
            </Pressable>
          </View>
          {recentSearches.map((search, index) => (
            <Pressable
              key={index}
              onPress={() => handleRecentSearch(search)}
              style={({ pressed }) => [styles.recentItem, pressed && styles.recentItemPressed]}
            >
              <Clock size={16} color={Colors.textTertiary} strokeWidth={2} />
              <Text style={styles.recentText}>{search}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Search Results */}
      {hasSearched ? (
        results.length === 0 ? (
          <EmptyState
            icon={<Search size={40} color={Colors.textSecondary} />}
            title={t('noResults')}
            subtitle={t('noResultsDesc')}
          />
        ) : (
          <FlatList
            data={results}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
            columnWrapperStyle={styles.resultsRow}
            keyExtractor={(item) => item._id}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <ProductCard
                  product={item}
                  onPress={() => router.push(`/product/${item._id}`)}
                />
              </View>
            )}
          />
        )
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    height: '100%',
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    backgroundColor: Colors.background,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  clearAllText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary,
    fontWeight: Typography.weight.medium,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  recentItemPressed: {
    opacity: 0.7,
  },
  recentText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  resultsList: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  resultsRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  pressed: {
    opacity: 0.7,
  },
});
