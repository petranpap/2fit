import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { search } from '../api/search';
import CategoryChip from '../components/CategoryChip';
import IconButton from '../components/IconButton';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import { useCategories } from '../hooks/useCategories';
import { colors, spacing, typography } from '../theme/tokens';
import { getCurrentCoords } from '../utils/location';

const DEBOUNCE_MS = 400;

const TYPE_OPTIONS = [
  { label: 'Όλα', value: 'all' },
  { label: 'Γυμναστήρια', value: 'gym' },
  { label: 'Προπονητές', value: 'trainer' },
  { label: 'Καταστήματα', value: 'shop' },
];

export default function SearchScreen({ route, navigation }) {
  const { categories } = useCategories();
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState(route.params?.category ?? null);
  const [radiusKm, setRadiusKm] = useState(route.params?.radiusKm ?? null);
  const [coords, setCoords] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Home's category tiles and the Filters screen both hand filters back via
  // route.params — re-sync whenever they change, not just on first mount.
  useEffect(() => {
    if (!route.params) return;

    if ('category' in route.params) setCategory(route.params.category);
    if ('radiusKm' in route.params) setRadiusKm(route.params.radiusKm);
  }, [route.params]);

  useEffect(() => {
    getCurrentCoords().then(setCoords);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError(null);

      search({
        q: query || undefined,
        type: type === 'all' ? undefined : type,
        category: category || undefined,
        radiusKm: radiusKm || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      })
        .then(({ data }) => setResults(data))
        .catch(() => setError('Κάτι πήγε στραβά. Δοκίμασε ξανά.'))
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, type, category, radiusKm, coords]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <SearchBar value={query} onChangeText={setQuery} autoFocus style={styles.searchBar} />
        <IconButton
          name="options-outline"
          accessibilityLabel="Φίλτρα"
          onPress={() => navigation.navigate('Filters', { category, radiusKm })}
        />
      </View>

      {/* Plain View wrapper with a fixed height — react-native-web's FlatList
          forces flex:1 internally, which ignores a height on its own `style`. */}
      <View style={styles.chipsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPE_OPTIONS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => (
            <CategoryChip label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />
          )}
        />
      </View>

      {categories.length > 0 ? (
        <View style={styles.chipsWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.chipsRow}
            renderItem={({ item }) => (
              <CategoryChip
                label={item.name}
                selected={category === item.slug}
                onPress={() => setCategory(category === item.slug ? null : item.slug)}
              />
            )}
          />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flex: 1,
  },
  chipsWrap: {
    height: 48,
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
