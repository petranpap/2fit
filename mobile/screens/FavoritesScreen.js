import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyDiscountCodes } from '../api/discountCodes';
import { fetchMyFavorites } from '../api/favorites';
import DiscountCodeCard from '../components/DiscountCodeCard';
import PlaceCard from '../components/PlaceCard';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

export default function FavoritesScreen() {
  const { t } = useLocale();

  const [places, setPlaces] = useState([]);
  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;

      Promise.all([
        fetchMyFavorites().catch(() => ({ data: [] })),
        fetchMyDiscountCodes().catch(() => ({ data: [] })),
      ]).then(([favoritesRes, codesRes]) => {
        if (isCancelled) return;
        setPlaces(favoritesRes.data);
        setCodes(codesRes.data);
      }).finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

      return () => {
        isCancelled = true;
      };
    }, [])
  );

  const isEmpty = places.length === 0 && codes.length === 0;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('nav.favorites')}
        </Text>

        <Text style={styles.subtitle}>
          {t('favorites.subtitle')}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color="#FFD400"
          style={styles.spinner}
        />
      ) : isEmpty ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="heart-outline"
              size={42}
              color="#111111"
            />
          </View>

          <Text style={styles.emptyTitle}>
            {t('favorites.emptyTitle')}
          </Text>

          <Text style={styles.emptySubtitle}>
            {t('favorites.emptySubtitle')}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {places.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('favorites.savedPlacesTitle')}
              </Text>

              {places.map((place) => (
                <View key={`${place.type}-${place.id}`} style={styles.placeCardWrap}>
                  <PlaceCard place={place} />
                </View>
              ))}
            </View>
          ) : null}

          {codes.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('favorites.savedCodesTitle')}
              </Text>

              {codes.map((code) => (
                <View key={code.code} style={styles.cardWrap}>
                  <DiscountCodeCard discountCode={code} />
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: '#FFD400',
  },

  spinner: {
    marginTop: spacing.xl,
  },

  emptyCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,

    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#FFD400',
    borderRadius: 24,

    paddingHorizontal: spacing.xl,
    paddingVertical: 35,
  },

  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFD400',

    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,

    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '500',
    color: '#D0D0D0',
    textAlign: 'center',
  },

  list: {
    padding: spacing.xl,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },

  placeCardWrap: {
    marginBottom: spacing.md,
  },

  cardWrap: {
    marginBottom: spacing.md,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD400',
    overflow: 'hidden',
  },
});
