import { useEffect, useMemo, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { search } from '../api/search';
import CategoryGridCard from '../components/CategoryGridCard';
import IconButton from '../components/IconButton';
import PlaceCard from '../components/PlaceCard';
import PlaceCardCompact from '../components/PlaceCardCompact';
import PlacesMap from '../components/PlacesMap';
import SearchBar from '../components/SearchBar';
import { usePrimaryCategories } from '../hooks/usePrimaryCategories';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';
import { getCurrentCoords, getLocationLabel } from '../utils/location';

const DEBOUNCE_MS = 400;

export default function SearchScreen({ route, navigation }) {
  const { categories } = usePrimaryCategories();
  const { t } = useLocale();

  const [query, setQuery] = useState(
    route.params?.initialQuery ?? ''
  );

  const [type, setType] = useState('all');

  const [category, setCategory] = useState(
    route.params?.category ?? null
  );

  const [radiusKm, setRadiusKm] = useState(
    route.params?.radiusKm ?? null
  );

  const [minRating, setMinRating] = useState(
    route.params?.minRating ?? null
  );

  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('nearest');
  const [selectedKey, setSelectedKey] = useState(null);
  const carouselRef = useRef(null);

  // FlatList warns if onViewableItemsChanged/viewabilityConfig aren't
  // referentially stable across renders — refs keep the same identity
  // without needing to memoize the (stable-setter-only) callback body.
  const handleViewableItemsChangedRef = useRef(({ viewableItems }) => {
    const first = viewableItems[0]?.item;
    if (first) setSelectedKey(`${first.type}-${first.id}`);
  });
  const viewabilityConfigRef = useRef({ itemVisiblePercentThreshold: 60 });

  // Explore category buttons
  const typeOptions = [
    {
      label: t('search.filterAll'),
      value: 'all',
    },
    {
      label: t('search.filterGym'),
      value: 'gym',
    },
    {
      label: t('search.filterTrainer'),
      value: 'trainer',
    },
    {
      label: 'Martial Arts',
      value: 'martial-arts',
    },
    {
      label: 'Wellness',
      value: 'wellness',
    },
  ];

  // Martial Arts and Wellness use category filtering.
  const isCategoryChip =
    type === 'martial-arts' || type === 'wellness';

  const searchType = isCategoryChip ? undefined : type;
  const searchCategory = isCategoryChip ? type : category;

  useEffect(() => {
    if (!route.params) return;

    if ('category' in route.params) {
      setCategory(route.params.category);
    }

    if ('radiusKm' in route.params) {
      setRadiusKm(route.params.radiusKm);
    }

    if ('minRating' in route.params) {
      setMinRating(route.params.minRating);
    }
  }, [route.params]);

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
        type: searchType === 'all' ? undefined : searchType,
        category: searchCategory || undefined,
        radiusKm: radiusKm || undefined,
        minRating: minRating || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      })
        .then(({ data }) => setResults(data))
        .catch(() => setError(t('search.error')))
        .finally(() => setIsLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [
    query,
    searchType,
    searchCategory,
    radiusKm,
    minRating,
    coords,
  ]);

  // Backend already orders by distance (or name without coords) — "top
  // rated" is a client-side re-sort of the same result set, not a refetch.
  const sortedResults = useMemo(() => {
    if (sortBy !== 'rating') return results;

    return [...results].sort(
      (a, b) => (b.rating_avg ?? -1) - (a.rating_avg ?? -1)
    );
  }, [results, sortBy]);

  const handleSelectOnMap = (place) => {
    const key = `${place.type}-${place.id}`;
    setSelectedKey(key);

    const index = sortedResults.findIndex(
      (item) => `${item.type}-${item.id}` === key
    );

    if (index >= 0) {
      carouselRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }
  };

  const topControls = (
    <View style={styles.titleRow}>
      <View>
        <Text style={styles.title}>
          {t('search.headerTitle')}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color="#FFD400"
          />

          <Text style={styles.locationText}>
            {locationLabel ??
              t('search.locationFallback')}
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <View style={styles.filterButton}>
          <IconButton
            name={
              viewMode === 'list'
                ? 'map-outline'
                : 'list-outline'
            }
            accessibilityLabel={
              viewMode === 'list'
                ? t('search.mapViewA11y')
                : t('search.listViewA11y')
            }
            onPress={() =>
              setViewMode(
                viewMode === 'list' ? 'map' : 'list'
              )
            }
          />
        </View>

        <View style={styles.filterButton}>
          <IconButton
            name="options-outline"
            accessibilityLabel={t(
              'search.filtersA11y'
            )}
            onPress={() =>
              navigation.navigate('Filters', {
                category: searchCategory,
                radiusKm,
                minRating,
              })
            }
          />
        </View>
      </View>
    </View>
  );

  const resultsCountLabel = t(
    sortedResults.length === 1
      ? 'search.resultsCountOne'
      : 'search.resultsCount',
    { count: sortedResults.length }
  );

  const sortToggle = (
    <Pressable
      onPress={() =>
        setSortBy(
          sortBy === 'nearest'
            ? 'rating'
            : 'nearest'
        )
      }
      style={styles.sortButton}
      accessibilityRole="button"
      accessibilityLabel={t('search.sortA11y')}
    >
      <Ionicons
        name="swap-vertical-outline"
        size={20}
        color="#FFD400"
      />

      <Text style={styles.sortButtonText}>
        {sortBy === 'nearest'
          ? t('search.sortNearest')
          : t('search.sortTopRated')}
      </Text>
    </Pressable>
  );

  const header = (
    <View>
      {topControls}

      <View style={styles.searchBox}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t(
            'common.searchPlaceholder'
          )}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.typeRowWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={typeOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.typeRow}
          renderItem={({ item }) => {
            const isSelected =
              type === item.value;

            return (
              <Pressable
                onPress={() =>
                  setType(item.value)
                }
                style={[
                  styles.typeChip,
                  isSelected
                    ? styles.typeChipSelected
                    : styles.typeChipNormal,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    isSelected
                      ? styles.typeChipTextSelected
                      : styles.typeChipTextNormal,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {categories.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>
            {t('search.topCategoriesTitle')}
          </Text>

          <View style={styles.categoryGrid}>
            {categories.map((item) => (
              <View
                key={item.id}
                style={
                  searchCategory === item.slug
                    ? styles.selectedCategoryWrap
                    : styles.categoryWrap
                }
              >
                <CategoryGridCard
                  category={item}
                  selected={
                    searchCategory === item.slug
                  }
                  onPress={() =>
                    navigation.navigate(
                      'CategorySubcategories',
                      { category: item }
                    )
                  }
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.resultsHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>
            {t('search.popularNearbyTitle')}
          </Text>

          {sortedResults.length > 0 ? (
            <Text style={styles.resultsCount}>
              {resultsCountLabel}
            </Text>
          ) : null}
        </View>

        {sortedResults.length > 1
          ? sortToggle
          : null}
      </View>
    </View>
  );

  if (viewMode === 'map') {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.mapTopControls}>
          {topControls}

          {sortedResults.length > 0 ? (
            <View style={styles.mapResultsRow}>
              <Text style={styles.resultsCount}>
                {resultsCountLabel}
              </Text>

              {sortedResults.length > 1
                ? sortToggle
                : null}
            </View>
          ) : null}
        </View>

        <PlacesMap
          places={sortedResults}
          userCoords={coords}
          selectedKey={selectedKey}
          onSelectPlace={handleSelectOnMap}
        />

        {isLoading ? (
          <ActivityIndicator
            color="#FFD400"
            style={styles.mapSpinner}
          />
        ) : sortedResults.length === 0 ? (
          <View style={styles.mapEmptyBanner}>
            <Text style={styles.message}>
              {error ?? t('search.empty')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={sortedResults}
            keyExtractor={(item) =>
              `${item.type}-${item.id}`
            }
            contentContainerStyle={styles.carousel}
            style={styles.carouselWrap}
            onScrollToIndexFailed={() => {}}
            onViewableItemsChanged={
              handleViewableItemsChangedRef.current
            }
            viewabilityConfig={
              viewabilityConfigRef.current
            }
            renderItem={({ item }) => (
              <PlaceCardCompact
                place={item}
                selected={
                  `${item.type}-${item.id}` ===
                  selectedKey
                }
                onPress={() =>
                  navigation.navigate(
                    'PlaceDetail',
                    {
                      type: item.type,
                      id: item.id,
                      distanceKm: item.distance_km,
                    }
                  )
                }
              />
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <FlatList
        data={sortedResults}
        keyExtractor={(item) =>
          `${item.type}-${item.id}`
        }
        renderItem={({ item }) => (
          <View style={styles.resultCardWrap}>
            <PlaceCard place={item} />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color="#FFD400"
              style={styles.spinner}
            />
          ) : (
            <Text style={styles.message}>
              {error ?? t('search.empty')}
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  locationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D8D8D8',
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  filterButton: {
    backgroundColor: '#FFD400',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 2,
  },

  searchBox: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 18,
    padding: 6,
    marginBottom: spacing.md,
  },

  searchBar: {
    marginBottom: 0,
  },

  typeRowWrap: {
    height: 58,
    marginBottom: spacing.sm,
  },

  typeRow: {
    paddingBottom: spacing.sm,
  },

  typeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 22,
    borderWidth: 2,
  },

  typeChipSelected: {
    backgroundColor: '#FFD400',
    borderColor: '#FFFFFF',
  },

  typeChipNormal: {
    backgroundColor: '#F5F5F5',
    borderColor: '#FFD400',
  },

  typeChipText: {
    fontSize: 14,
    fontWeight: '700',
  },

  typeChipTextSelected: {
    color: '#111111',
  },

  typeChipTextNormal: {
    color: '#222222',
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  categoryWrap: {
    width: '48%',
    borderRadius: 16,
  },

  selectedCategoryWrap: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD400',
  },

  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  resultsCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9A9A9A',
    marginTop: -spacing.sm,
  },

  // Larger, more visible Nearest / Top Rated button
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 150,
  },

  sortButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD400',
  },

  resultCardWrap: {
    marginBottom: spacing.md,
  },

  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },

  spinner: {
    marginTop: spacing.xl,
  },

  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#CFCFCF',
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  mapTopControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#111111',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },

  mapResultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -spacing.sm,
  },

  mapSpinner: {
    position: 'absolute',
    bottom: spacing.xl * 2,
    alignSelf: 'center',
  },

  mapEmptyBanner: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xl,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD400',
    padding: spacing.lg,
  },

  carouselWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },

  carousel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
