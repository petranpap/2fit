import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { search } from '../api/search';
import CategoryIconTile from '../components/CategoryIconTile';
import IconButton from '../components/IconButton';
import PlaceCardCompact from '../components/PlaceCardCompact';
import PromoBanner from '../components/PromoBanner';
import ScreenContainer from '../components/ScreenContainer';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { useLocale } from '../i18n/LocaleContext';
import { colors, spacing, typography } from '../theme/tokens';
import { getCurrentCoords } from '../utils/location';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLocale();
  const { categories } = useCategories();
  const [nearby, setNearby] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(true);

  useEffect(() => {
    getCurrentCoords()
      .then((coords) => search({ ...coords, perPage: 6 }))
      .then(({ data }) => setNearby(data))
      .catch(() => setNearby([]))
      .finally(() => setIsLoadingNearby(false));
  }, []);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.topRow}>
        <Text style={styles.wordmark}>2fit</Text>
        <IconButton
          name="notifications-outline"
          accessibilityLabel={t('profile.notifications')}
          onPress={() => Alert.alert(t('common.comingSoonTitle'), t('common.comingSoonMessage'))}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.greeting', { name: user?.name ?? '' })}</Text>
        <Text style={styles.subtitle}>
          {t('home.subtitlePrefix')}
          <Text style={styles.subtitleAccent}>{t('home.subtitleHighlight')}</Text>
          {t('home.subtitleSuffix')}
        </Text>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          editable={false}
          placeholder={t('common.searchPlaceholder')}
          onPress={() => navigation.navigate('Search')}
          style={styles.searchBar}
        />
        <IconButton
          name="options-outline"
          accessibilityLabel={t('search.filtersA11y')}
          onPress={() => navigation.navigate('Filters')}
        />
      </View>

      {categories.length > 0 ? (
        // Plain View wrapper with a fixed height — react-native-web's FlatList
        // forces flex:1 internally, which ignores a height set on its own
        // `style` prop, so the height has to come from a constrained parent.
        <View style={styles.categoriesWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CategoryIconTile
                category={item}
                onPress={() => navigation.navigate('Search', { category: item.slug })}
              />
            )}
          />
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('home.recommendedTitle')}</Text>
        <Pressable onPress={() => navigation.navigate('Search')} hitSlop={8}>
          <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
        </Pressable>
      </View>

      {isLoadingNearby ? (
        <ActivityIndicator color={colors.primary} style={styles.spinner} />
      ) : nearby.length === 0 ? (
        <Text style={styles.emptyMessage}>{t('home.nearbyEmpty')}</Text>
      ) : (
        <View style={styles.nearbyWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nearby}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => <PlaceCardCompact place={item} />}
          />
        </View>
      )}

      <PromoBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  wordmark: {
    ...typography.heading,
    fontSize: 22,
    color: colors.primary,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.heading,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  subtitleAccent: {
    color: colors.secondary,
    fontFamily: typography.bodyStrong.fontFamily,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  searchBar: {
    flex: 1,
  },
  categoriesWrap: {
    height: 92,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
  },
  spinner: {
    marginTop: spacing.lg,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
  },
  nearbyWrap: {
    height: 172,
  },
});
