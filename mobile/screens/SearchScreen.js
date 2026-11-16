import { useEffect, useRef, useState } from 'react';
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
import SearchBar from '../components/SearchBar';
import { useCategories } from '../hooks/useCategories';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';
import { getCurrentCoords, getLocationLabel } from '../utils/location';

const DEBOUNCE_MS = 400;

export default function SearchScreen({ route, navigation }) {
  const { categories } = useCategories();
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

  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      label: t('search.filterShop'),
      value: 'shop',
    },
  ];

  useEffect(() => {
    if (!route.params) return;

    if ('category' in route.params) {
      setCategory(route.params.category);
    }

    if ('radiusKm' in route.params) {
      setRadiusKm(route.params.radiusKm);
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
  }, [
    query,
    type,
    category,
    radiusKm,
    coords,
  ]);

  const header = (
    <View>
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

        <View style={styles.filterButton}>
          <IconButton
            name="options-outline"
            accessibilityLabel={t(
              'search.filtersA11y'
            )}
            onPress={() =>
              navigation.navigate('Filters', {
                category,
                radiusKm,
              })
            }
          />
        </View>
      </View>

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
            const isSelected = type === item.value;

            return (
              <Pressable
                onPress={() => setType(item.value)}
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
                  category === item.slug
                    ? styles.selectedCategoryWrap
                    : styles.categoryWrap
                }
              >
                <CategoryGridCard
                  category={item}
                  selected={
                    category === item.slug
                  }
                  onPress={() =>
                    setCategory(
                      category === item.slug
                        ? null
                        : item.slug
                    )
                  }
                />
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>
        {t('search.popularNearbyTitle')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <FlatList
        data={results}
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
    borderRadius: 16,
  },

  selectedCategoryWrap: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD400',
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
});