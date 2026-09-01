import { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { search } from '../api/search';
import CategoryChip from '../components/CategoryChip';
import CategoryGridCard from '../components/CategoryGridCard';
import IconButton from '../components/IconButton';
import PlaceCard from '../components/PlaceCard';
import SearchBar from '../components/SearchBar';
import { useCategories } from '../hooks/useCategories';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';
import { getCurrentCoords, getLocationLabel } from '../utils/location';

const DEBOUNCE_MS = 400;

export default function SearchScreen({ route, navigation }) {
  const { categories } = useCategories();
  const { t } = useLocale();
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState(route.params?.category ?? null);
  const [radiusKm, setRadiusKm] = useState(route.params?.radiusKm ?? null);
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const typeOptions = [
    { label: t('search.filterAll'), value: 'all' },
    { label: t('search.filterGym'), value: 'gym' },
    { label: t('search.filterTrainer'), value: 'trainer' },
    { label: t('search.filterShop'), value: 'shop' },
  ];

  // Home's category tiles and the Filters screen both hand filters back via
  // route.params — re-sync whenever they change, not just on first mount.
  useEffect(() => {
    if (!route.params) return;

    if ('category' in route.params) setCategory(route.params.category);
    if ('radiusKm' in route.params) setRadiusKm(route.params.radiusKm);
  }, [route.params]);

  // Not every category applies to every type (e.g. no gym in the data has
  // "Yoga & Pilates"), so a category picked under one type can silently zero
  // out the results under another. Clear it when the type actually changes
  // — but not on the initial mount, or it'd wipe out a category handed in
  // via route.params (Home's category tiles / Filters' apply).
  const isFirstTypeRender = useRef(true);
  useEffect(() => {
    if (isFirstTypeRender.current) {
      isFirstTypeRender.current = false;
      return;
    }

    setCategory(null);
  }, [type]);

  useEffect(() => {
    getCurrentCoords().then(setCoords);
  }, []);

  useEffect(() => {
    if (!coords) return;

    getLocationLabel(coords).then(setLocationLabel);
  }, [coords]);

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
        .catch(() => setError(t('search.error')))
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, type, category, radiusKm, coords]);

  const header = (
    <View>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>{t('search.headerTitle')}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>{locationLabel ?? t('search.locationFallback')}</Text>
          </View>
        </View>
        <IconButton
          name="options-outline"
          accessibilityLabel={t('search.filtersA11y')}
          onPress={() => navigation.navigate('Filters', { category, radiusKm })}
        />
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={t('common.searchPlaceholder')}
        style={styles.searchBar}
      />

      {/* Plain View wrapper with a fixed height — react-native-web's FlatList
          forces flex:1 internally, which ignores a height on its own `style`. */}
      <View style={styles.typeRowWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={typeOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.typeRow}
          renderItem={({ item }) => (
            <CategoryChip label={item.label} selected={type === item.value} onPress={() => setType(item.value)} />
          )}
        />
      </View>

      {categories.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('search.topCategoriesTitle')}</Text>
          <View style={styles.categoryGrid}>
            {categories.map((item) => (
              <CategoryGridCard
                key={item.id}
                category={item}
                selected={category === item.slug}
                onPress={() => setCategory(category === item.slug ? null : item.slug)}
              />
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>{t('search.popularNearbyTitle')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <PlaceCard place={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          ) : (
            <Text style={styles.message}>{error ?? t('search.empty')}</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.caption,
  },
  searchBar: {
    marginBottom: spacing.md,
  },
  typeRowWrap: {
    height: 48,
  },
  typeRow: {
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  spinner: {
    marginTop: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
