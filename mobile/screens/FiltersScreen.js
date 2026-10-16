import { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { search } from '../api/search';
import { usePrimaryCategories } from '../hooks/usePrimaryCategories';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';
import { getCurrentCoords, getLocationLabel } from '../utils/location';

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 20;
const DEFAULT_RADIUS_KM = 10;
const RATING_OPTIONS = [4, 4.5, 5];

export default function FiltersScreen({ route, navigation }) {
  const { categories } = usePrimaryCategories();
  const { t } = useLocale();

  const [category, setCategory] = useState(route.params?.category ?? null);
  const [radiusKm, setRadiusKm] = useState(route.params?.radiusKm ?? DEFAULT_RADIUS_KM);
  const [minRating, setMinRating] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [resultCount, setResultCount] = useState(null);

  const refreshLocation = () => {
    setIsLocating(true);
    getCurrentCoords()
      .then((value) => {
        setCoords(value);
        return getLocationLabel(value);
      })
      .then(setLocationLabel)
      .finally(() => setIsLocating(false));
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const handleReset = () => {
    setCategory(null);
    setRadiusKm(DEFAULT_RADIUS_KM);
    setMinRating(null);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleReset} hitSlop={8}>
          <Text style={styles.resetLabel}>{t('filters.reset')}</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, t]);

  // Live count for the Apply button — same merged search the Explore tab
  // uses, so "Apply" never promises a number the results screen won't show.
  useEffect(() => {
    const timeout = setTimeout(() => {
      search({
        category: category || undefined,
        radiusKm,
        minRating: minRating || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      })
        .then(({ meta }) => setResultCount(meta.total ?? meta.count ?? null))
        .catch(() => setResultCount(null));
    }, 300);

    return () => clearTimeout(timeout);
  }, [category, radiusKm, minRating, coords]);

  const handleApply = () => {
    // Filters is pushed above the tab navigator (MainTabs), so reaching the
    // Search tab needs the nested navigate form, not a flat screen name.
    navigation.navigate('MainTabs', {
      screen: 'Search',
      params: { category, radiusKm, minRating, filtersAppliedAt: Date.now() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('filters.categorySection')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <Pressable
            onPress={() => setCategory(null)}
            style={[styles.chip, category === null ? styles.chipSelected : styles.chipNormal]}
          >
            <Text style={[styles.chipText, category === null && styles.chipTextSelected]}>{t('search.filterAll')}</Text>
          </Pressable>

          {categories.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setCategory(category === item.slug ? null : item.slug)}
              style={[styles.chip, category === item.slug ? styles.chipSelected : styles.chipNormal]}
            >
              <Text style={[styles.chipText, category === item.slug && styles.chipTextSelected]}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('filters.locationSection')}</Text>
        <Pressable onPress={refreshLocation} style={styles.locationRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            {isLocating ? t('filters.locating') : (locationLabel ?? t('search.locationFallback'))}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#FFD400" />
        </Pressable>

        <Text style={styles.sectionTitle}>{t('filters.distanceSection')}</Text>
        <Text style={styles.distanceValue}>{t('filters.distanceValue', { km: radiusKm })}</Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_RADIUS_KM}
          maximumValue={MAX_RADIUS_KM}
          step={1}
          value={radiusKm}
          onValueChange={setRadiusKm}
          minimumTrackTintColor="#FFD400"
          maximumTrackTintColor="#2E2E2E"
          thumbTintColor="#FFD400"
        />
        <View style={styles.sliderLabelsRow}>
          <Text style={styles.sliderLabel}>{t('filters.distanceValue', { km: MIN_RADIUS_KM })}</Text>
          <Text style={styles.sliderLabel}>{t('filters.distanceValue', { km: MAX_RADIUS_KM })}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('filters.ratingSection')}</Text>
        <View style={styles.chipsWrap}>
          {RATING_OPTIONS.map((value) => (
            <Pressable
              key={value}
              onPress={() => setMinRating(minRating === value ? null : value)}
              style={[styles.ratingChip, minRating === value ? styles.chipSelected : styles.chipNormal]}
            >
              <Text style={[styles.chipText, minRating === value && styles.chipTextSelected]}>
                {value === 5 ? '5' : t('filters.ratingValue', { rating: value })}
              </Text>
              <Ionicons name="star" size={12} color={minRating === value ? '#111111' : '#FFD400'} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleApply} style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
          <Text style={styles.applyLabel}>
            {resultCount != null ? t('filters.applyWithCount', { count: resultCount }) : t('filters.apply')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  content: {
    padding: spacing.xl,
  },
  resetLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD400',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  chipRow: {
    gap: spacing.sm,
    paddingBottom: 2,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 2,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 2,
  },
  chipSelected: {
    backgroundColor: '#FFD400',
    borderColor: '#FFD400',
  },
  chipNormal: {
    backgroundColor: '#1A1A1A',
    borderColor: '#2E2E2E',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D8D8D8',
  },
  chipTextSelected: {
    color: '#111111',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2E2E2E',
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },

  distanceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFD400',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sliderLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
  },

  footer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#2E2E2E',
    backgroundColor: '#111111',
  },
  applyButton: {
    backgroundColor: '#FFD400',
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  pressed: {
    opacity: 0.85,
  },
});
