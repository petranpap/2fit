import { useCallback, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyDiscountCodes } from '../api/discountCodes';
import DiscountCodeCard from '../components/DiscountCodeCard';
import { useLocale } from '../i18n/LocaleContext';
import { spacing } from '../theme/tokens';

export default function FavoritesScreen() {
  const { t } = useLocale();

  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isCancelled = false;

      fetchMyDiscountCodes()
        .then(({ data }) => {
          if (!isCancelled) {
            setCodes(data);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setCodes([]);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoading(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    }, [])
  );

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
          Οι προσφορές και οι κωδικοί σου
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color="#FFD400"
          style={styles.spinner}
        />
      ) : codes.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="pricetag-outline"
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
        <FlatList
          data={codes}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <DiscountCodeCard
                discountCode={item}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
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

  cardWrap: {
    marginBottom: spacing.md,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD400',
    overflow: 'hidden',
  },
});