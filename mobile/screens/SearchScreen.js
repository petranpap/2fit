import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchCategories } from '../api/categories';
import { search } from '../api/search';
import CategoryChip from '../components/CategoryChip';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import { colors, spacing, typography } from '../theme/tokens';
import { getCurrentCoords } from '../utils/location';

const DEBOUNCE_MS = 400;

export default function SearchScreen({ route }) {
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.initialCategory ?? null);
  const [categories, setCategories] = useState([]);
  const [coords, setCoords] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));

    getCurrentCoords().then(setCoords);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      search({
        q: query || undefined,
        category: selectedCategory || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      })
        .then(({ data }) => setResults(data))
        .catch(() => setError('Κάτι πήγε στραβά. Δοκίμασε ξανά.'))
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, selectedCategory, coords]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <SearchBar value={query} onChangeText={setQuery} autoFocus />
      </View>

      {categories.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => (
            <CategoryChip
              label={item.name}
              selected={selectedCategory === item.slug}
              onPress={() => setSelectedCategory(selectedCategory === item.slug ? null : item.slug)}
            />
          )}
        />
      ) : null}

      <View style={styles.results}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.spinner} />
        ) : error ? (
          <Text style={styles.message}>{error}</Text>
        ) : results.length === 0 ? (
          <Text style={styles.message}>Δεν βρέθηκαν αποτελέσματα.</Text>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => <PlaceCard place={item} />}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  chipsRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  results: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  spinner: {
    marginTop: spacing['2xl'],
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
});
