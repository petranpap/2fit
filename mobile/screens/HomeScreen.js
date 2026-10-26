
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { search } from '../api/search';
import CategoryIconTile from '../components/CategoryIconTile';
import IconButton from '../components/IconButton';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PlaceCardCompact from '../components/PlaceCardCompact';
import ScreenContainer from '../components/ScreenContainer';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';
import { usePrimaryCategories } from '../hooks/usePrimaryCategories';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';
import { getCurrentCoords } from '../utils/location';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLocale();
  const { categories } = usePrimaryCategories();

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
    <ScreenContainer edges={['top']} style={styles.screen}>

      <View style={styles.topRow}>
        <Image
          source={require('../assets/logo-2fit.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.topActions}>
          <LanguageSwitcher />

          <View style={styles.notificationButton}>
            <IconButton
              name="notifications-outline"
              accessibilityLabel={t('profile.notifications')}
              onPress={() =>
                Alert.alert(
                  t('common.comingSoonTitle'),
                  t('common.comingSoonMessage')
                )
              }
            />
          </View>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.greeting}>
          {t('home.greeting', { name: user?.name ?? '' })}
        </Text>

        <Text style={styles.subtitle}>
          {t('home.subtitlePrefix')}
          <Text style={styles.subtitleAccent}>
            {t('home.subtitleHighlight')}
          </Text>
          {t('home.subtitleSuffix')}
        </Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <SearchBar
            editable={false}
            placeholder={t('common.searchPlaceholder')}
            onPress={() => navigation.navigate('Search')}
            style={styles.searchBar}
          />

          <View style={styles.filterButton}>
            <IconButton
              name="options-outline"
              accessibilityLabel={t('search.filtersA11y')}
              onPress={() => navigation.navigate('Filters')}
            />
          </View>
        </View>
      </View>

      {categories.length > 0 ? (
        <View style={styles.categoriesWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CategoryIconTile
                category={item}
                variant="dark"
                onPress={() =>
                  navigation.navigate('CategorySubcategories', {
                    category: item,
                  })
                }
              />
            )}
          />
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t('home.recommendedTitle')}
        </Text>

        <Pressable
          onPress={() => navigation.navigate('Search')}
          hitSlop={8}
        >
          <Text style={styles.seeAll}>
            {t('common.seeAll')}
          </Text>
        </Pressable>
      </View>

      {isLoadingNearby ? (
        <ActivityIndicator
          color="#FFD400"
          style={styles.spinner}
        />
      ) : nearby.length === 0 ? (
        <Text style={styles.emptyMessage}>
          {t('home.nearbyEmpty')}
        </Text>
      ) : (
        <View style={styles.nearbyWrap}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nearby}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => (
              <PlaceCardCompact place={item} />
            )}
          />
        </View>
      )}

      <View style={styles.promoCard}>
        <Text style={styles.promoTitle}>
          {t('home.bannerTitlePlain')}
          <Text style={styles.promoTitleAccent}>
            {t('home.bannerTitleAccent')}
          </Text>
        </Text>

        <Text style={styles.promoSubtitle}>
          {t('home.bannerSubtitle')}
        </Text>
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#111111',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },

  logo: {
    width: 220,
    height: 110,
  },

  topActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  notificationButton: {
    backgroundColor: '#FFD400',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 14,
    padding: 2,
    marginTop: spacing.sm,
  },

  header: {
    marginBottom: spacing.lg,
  },

  greeting: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: '#D8D8D8',
    marginTop: spacing.xs,
  },

  subtitleAccent: {
    color: '#FFD400',
    fontWeight: '700',
  },

  searchSection: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 18,
    padding: spacing.sm,
    marginBottom: spacing.xl,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  searchBar: {
    flex: 1,
  },

  filterButton: {
    backgroundColor: '#FFD400',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 12,
    padding: 2,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD400',
  },

  spinner: {
    marginTop: spacing.lg,
  },

  emptyMessage: {
    fontSize: 16,
    lineHeight: 22,
    color: '#CFCFCF',
    marginBottom: spacing.md,
  },

  nearbyWrap: {
    height: 172,
  },

  promoCard: {
    marginTop: spacing.lg,
    backgroundColor: '#FFD400',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FFD400',
  },

  promoTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },

  promoTitleAccent: {
    color: '#111111',
  },

  promoSubtitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    color: '#222222',
  },
});
